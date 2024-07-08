import "./style.css";
import { loadPyodide } from "pyodide";

async function hello_python() {
  let pyodide = await loadPyodide({ indexURL: "pyodide" }); //indexURL: "pyodide",
  await pyodide.loadPackage(["numpy", "scikit-learn"]);
  return pyodide.runPythonAsync(`import numpy as np
from sklearn.cluster import k_means
X = np.array([[1, 2], [1, 4], [1, 0], [10, 2], [10, 4], [10, 0]])
centroid, label, inertia = k_means(X, n_clusters=2, n_init="auto", random_state=0)
centroid
`);
}

hello_python().then((result) => {
  console.log("result =", result.toString());
});
