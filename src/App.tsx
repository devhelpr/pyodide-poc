import { useEffect, useRef, useState } from "react";
import PythonWorker from "./worker?worker";

export const App = () => {
  const workerRef = useRef<Worker | undefined>(undefined);
  const [result, setResult] = useState<string>("");
  const [loader, setLoader] = useState<string>("");
  const [showButton, setShowButton] = useState<boolean>(false);
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

  const buttonClickHandler = () => {
    setLoader("");
    setResult("");
    setShowButton(false);
    workerRef.current?.postMessage("start");
  };
  return (
    <>
      <div className={`loader ${loader}`}></div>
      <button
        className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
          showButton ? "" : "hidden"
        }`}
        onClick={buttonClickHandler}
      >
        start
      </button>
      <div className="whitespace-pre-wrap font-mono">{result}</div>
    </>
  );
};
