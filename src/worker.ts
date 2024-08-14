import { loadPyodide } from "pyodide";
import { demoCode } from "./demo-example";

interface CustomWorker extends Worker {
  data: string;
  setResult: (result: string) => void;
}
declare var self: CustomWorker;

self.onmessage = async (e: MessageEvent<any>) => {
  console.log("Worker got message", e.data);

  const data = await fetch("/test_pred_BERT.csv").then((response) =>
    response.text()
  );
  self.data = data;
  let resultList: string[] = [];
  self.setResult = (...result) => {
    resultList.push(result.join(" "));
  };

  async function runPytonCode() {
    let pyodide = await loadPyodide({ indexURL: "/pyodide" });
    await pyodide.loadPackage(["micropip", "numpy", "pandas", "scikit-learn"]);

    const micropip = pyodide.pyimport("micropip");
    await micropip.install("unsupervised-bias-detection");
    await micropip.install("kmodes");

    // use "python3 -m build" to create the wheel file from within the pip package root directory
    console.log("Start python code");
    console.time("pyodide-python");

    return pyodide.runPythonAsync(demoCode);
  }

  runPytonCode().then((_result) => {
    console.timeEnd("pyodide-python");
    postMessage({ type: "result", result: resultList });
  });
};
export {};
