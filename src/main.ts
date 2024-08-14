import "./style.css";
//import { loadPyodide } from "pyodide";
const workerFactory = (workerScript: URL, workerOptions: WorkerOptions) => () =>
  new Worker(workerScript, workerOptions);

const main = () => {
  const loader = document.querySelector(".loader");
  const element = document.getElementById("app");
  if (!element || !loader) {
    return;
  }
  loader.classList.remove("hidden");
  const factory = workerFactory(new URL("./worker.ts", import.meta.url), {
    type: "module",
  });
  const worker = factory();

  worker.onmessage = (e) => {
    if (e.data.type && e.data.type === "result") {
      let result: string[] = e.data.result;
      let output = "";
      result.forEach((result) => {
        output += result + "\n";
        console.log(result.toString());
      });
      element.innerHTML = output;
      loader.classList.add("hidden");
    } else {
      console.log(e);
    }
  };
  worker.onerror = (e) => console.error(e);
  worker.postMessage("start");
};

main();
