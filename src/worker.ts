import { loadPyodide, PyodideInterface } from "pyodide";
import { demoCode } from "./demo-example";

interface CustomWorker extends Worker {
  data: string;
  setResult: (result: string) => void;
  pyodide: PyodideInterface | undefined;
}
declare var self: CustomWorker;

self.onmessage = async (e: MessageEvent<any>) => {
  console.log("Worker got message", e.data);
  let resultList: string[] = [];
  self.setResult = (...result) => {
    resultList.push(result.join(" "));
  };

  if (e.data === "init") {
    const data = await fetch("/test_pred_BERT.csv").then((response) =>
      response.text()
    );
    self.data = data;
    await initPython();
    postMessage({ type: "initialised" });
  }
  if (e.data === "start") {
    await runPytonCode().then((_result) => {
      console.timeEnd("pyodide-python");
      postMessage({ type: "result", result: resultList });
    });
  }

  async function initPython() {
    self.pyodide = await loadPyodide({ indexURL: "/pyodide" });
    await self.pyodide.loadPackage([
      "micropip",
      "numpy",
      "pandas",
      "scikit-learn",
    ]);

    const micropip = self.pyodide.pyimport("micropip");
    await micropip.install("unsupervised-bias-detection");
    await micropip.install("kmodes");
    return true;
  }

  async function runPytonCode() {
    if (!self.pyodide) {
      throw new Error("Pyodide is not loaded");
    }

    // use "python3 -m build" to create the wheel file from within the pip package root directory
    console.log("Start python code");
    console.time("pyodide-python");

    return await self.pyodide.runPythonAsync(demoCode);
  }
};
export {};
