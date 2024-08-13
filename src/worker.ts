import { loadPyodide } from "pyodide";
import { demoCode } from "./demo-example";
self.onmessage = async (e: MessageEvent<any>) => {
  console.log("Worker got message", e.data);
  setTimeout(() => postMessage("Hello back"), 1000);

  const data = await fetch("/test_pred_BERT.csv").then((response) =>
    response.text()
  );
  self["data"] = data;

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

  runPytonCode().then((result) => {
    console.timeEnd("pyodide-python");
  });
};
