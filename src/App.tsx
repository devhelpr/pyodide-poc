import { useEffect, useRef, useState } from "react";
import PythonWorker from "./worker?worker";

export const App = () => {
  const workerRef = useRef<Worker | undefined>(undefined);
  const [result, setResult] = useState<string>("");
  const [loader, setLoader] = useState<string>("");
  const [showButton, setShowButton] = useState<boolean>(false);
  const [iter, setIter] = useState<number>(10);
  const [clusters, setClusters] = useState<number>(20);
  const iterRef = useRef<number>(iter);
  const clustersRef = useRef<number>(clusters);
  useEffect(() => {
    setLoader("");
    setShowButton(false);
    setResult("");
    workerRef.current = new PythonWorker();
    workerRef.current.onmessage = (e) => {
      if (e.data.type && e.data.type === "initialised") {
        setShowButton(true);
        setLoader("hidden");
      } else if (e.data.type && e.data.type === "result") {
        const outputResult: string[] = e.data.result;
        let output = "";
        outputResult.forEach((result) => {
          output += result + "\n\r";
        });
        setResult(output);
        setLoader("hidden");
        setShowButton(true);
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

  useEffect(() => {
    if (iter !== iterRef.current) {
      iterRef.current = iter;
    }
  }, [iter]);
  useEffect(() => {
    if (clusters !== clustersRef.current) {
      clustersRef.current = clusters;
    }
  }, [clusters]);

  const buttonClickHandler = () => {
    setLoader("");
    setResult("");
    setShowButton(false);
    workerRef.current?.postMessage({
      type: "start",
      params: {
        iter: iterRef.current,
        clusters: clustersRef.current,
      },
    });
  };
  return (
    <div className="p-4 md:max-w-[50%] max-w-full mx-auto">
      <h1 className="text-xl font-bold">Bias detection tool</h1>
      <div
        className={`md:max-w-[50%] max-w-full py-4 ${
          showButton ? "" : "hidden"
        }`}
      >
        <div className="flex flex-col mb-4">
          <label htmlFor="iter">Iterations</label>
          <input
            id="iter"
            name="iter"
            type="range"
            min="0"
            max="100"
            step="1"
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
            value={clusters}
            onChange={(e) => {
              setClusters(parseInt(e.target.value) ?? 0);
            }}
          />
        </div>
      </div>
      <button
        className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
          showButton ? "" : "hidden"
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
