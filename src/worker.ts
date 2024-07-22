import { loadPyodide } from "pyodide";

self.onmessage = async (e: MessageEvent<any>) => {
  console.log("Worker got message", e.data);
  setTimeout(() => postMessage("Hello back"), 1000);
  async function runPytonCode() {
    let pyodide = await loadPyodide({ indexURL: "/pyodide" });
    await pyodide.loadPackage([
      "numpy",
      "scikit-learn",
      "/unsupervised_bias_detection-0.1.0-py3-none-any.whl",
    ]);

    // use "python3 -m build" to create the wheel file from within the pip package root directory
    console.log("Start python code");
    console.time("pyodide-python");
    return pyodide.runPythonAsync(`import numpy as np
from sklearn.cluster import k_means
from unsupervised_bias_detection.clustering import BiasAwareHierarchicalKMeans

# X = np.array([[1, 2], [1, 4], [1, 0], [10, 2], [10, 4], [10, 0]])
# centroid, label, inertia = k_means(X, n_clusters=2, n_init="auto", random_state=0)


X = np.array([[1, 2], [1, 4], [1, 0], [10, 2], [10, 4], [10, 0]])
y = np.array([0, 0, 0, 10, 10, 10])
hbac = BiasAwareHierarchicalKMeans(n_iter=1, min_cluster_size=1, random_state=12).fit(X, y)
hbac.labels_
hbac.scores_

`);
  }

  runPytonCode().then((result) => {
    console.timeEnd("pyodide-python");
    console.log("result =", result.toString());
  });
};
