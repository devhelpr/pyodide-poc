import { useEffect, useRef, useState } from "react";
import PythonWorker from "./worker?worker";

export const App = () => {
  const workerRef = useRef<Worker | undefined>(undefined);
  const [result, setResult] = useState<string>("");
  const [loader, setLoader] = useState<string>("");
  const [showAndEnableControls, setShowAndEnableControls] =
    useState<boolean>(false);
  const [iter, setIter] = useState<number>(10);
  const [clusters, setClusters] = useState<number>(20);

  useEffect(() => {
    setLoader("");
    setShowAndEnableControls(false);
    setResult("");
    workerRef.current = new PythonWorker();
    workerRef.current.onmessage = (e) => {
      if (e.data.type && e.data.type === "initialised") {
        setShowAndEnableControls(true);
        setLoader("hidden");
      } else if (e.data.type && e.data.type === "result") {
        const outputResult: string[] = e.data.result;
        let output = "";
        outputResult.forEach((result) => {
          output += result + "\n\r";
        });
        setResult(output);
        setLoader("hidden");
        setShowAndEnableControls(true);
      } else {
        console.log(e);
      }
    };
    workerRef.current.onerror = (e) => console.error(e);
    workerRef.current.postMessage("init");
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const buttonClickHandler = () => {
    setLoader("");
    setResult("");
    setShowAndEnableControls(false);
    workerRef.current?.postMessage({
      type: "start",
      params: {
        iter: iter,
        clusters: clusters,
      },
    });
  };

  return (
    <div className="p-4 md:max-w-[50%] max-w-full mx-auto">
      <h1 className="text-xl font-bold">Bias detection tool</h1>
      <div className={`md:max-w-[50%] max-w-full py-4 `}>
        <div className="flex flex-col mb-4">
          <label htmlFor="iter">Iterations</label>
          <input
            id="iter"
            name="iter"
            type="range"
            min="0"
            max="100"
            step="1"
            disabled={!showAndEnableControls}
            value={iter}
            onChange={(e) => {
              setIter(parseInt(e.target.value) ?? 0);
            }}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="clusters">Clusters</label>
          <input
            id="clusters"
            name="clusters"
            type="range"
            min="0"
            max="100"
            step="1"
            disabled={!showAndEnableControls}
            value={clusters}
            onChange={(e) => {
              setClusters(parseInt(e.target.value) ?? 0);
            }}
          />
        </div>
      </div>
      <button
        className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
          showAndEnableControls ? "" : "hidden"
        }`}
        onClick={buttonClickHandler}
      >
        start
      </button>
      <div className={`loader ${loader}`}></div>
      <div className="whitespace-pre-wrap font-mono mt-4">{result}</div>
    </div>
  );
};
