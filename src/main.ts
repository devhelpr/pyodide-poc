import "./style.css";
//import { loadPyodide } from "pyodide";
const workerFactory = (workerScript: URL, workerOptions: WorkerOptions) => () =>
  new Worker(workerScript, workerOptions);

const main = () => {
  const factory = workerFactory(new URL("./worker.ts", import.meta.url), {
    type: "module",
  });
  const worker = factory();

  worker.onmessage = (e) => {
    if (e.data.type && e.data.type === "result") {
      let result: string[] = e.data.result;
      result.forEach((result) => console.log(result.toString()));
    }
    console.log(e);
  };
  worker.onerror = (e) => console.error(e);
  worker.postMessage("Hello world");
};

main();

// async function runPytonCode() {
//   let pyodide = await loadPyodide({ indexURL: "pyodide" }); //indexURL: "pyodide",
//   await pyodide.loadPackage(["numpy", "scikit-learn"]);
//   return pyodide.runPythonAsync(`import numpy as np
// from sklearn.cluster import k_means
// X = np.array([[1, 2], [1, 4], [1, 0], [10, 2], [10, 4], [10, 0]])
// centroid, label, inertia = k_means(X, n_clusters=2, n_init="auto", random_state=0)
// centroid
// `);
// }

// runPytonCode().then((result) => {
//   console.log("result =", result.toString());
// });
