import { loadPyodide } from "pyodide";
self.onmessage = async (e: MessageEvent<any>) => {
  console.log("Worker got message", e.data);
  setTimeout(() => postMessage("Hello back"), 1000);
  async function runPytonCode() {
    let pyodide = await loadPyodide({ indexURL: "/pyodide" }); //indexURL: "pyodide",
    await pyodide.loadPackage(["numpy", "scikit-learn"]);
    console.log("Start python code");
    console.time("pyodide-python");
    return pyodide.runPythonAsync(`import numpy as np
from sklearn.cluster import k_means
X = np.array([[1, 2], [1, 4], [1, 0], [10, 2], [10, 4], [10, 0]])
centroid, label, inertia = k_means(X, n_clusters=2, n_init="auto", random_state=0)
centroid
`);
  }

  runPytonCode().then((result) => {
    console.timeEnd("pyodide-python");
    console.log("result =", result.toString());
  });
};
