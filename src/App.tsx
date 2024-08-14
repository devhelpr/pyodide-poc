import { useEffect, useRef, useState } from "react";

const workerFactory = (workerScript: URL, workerOptions: WorkerOptions) => () =>
  new Worker(workerScript, workerOptions);

export const App = () => {
  const workerRef = useRef<Worker | undefined>(undefined);
  const [result, setResult] = useState<string[]>([]);
  const [loader, setLoader] = useState<string>("");
  useEffect(() => {
    setLoader("");
    setResult([]);
    const factory = workerFactory(new URL("./worker.ts", import.meta.url), {
      type: "module",
    });
    workerRef.current = factory();
    workerRef.current.onmessage = (e) => {
      if (e.data.type && e.data.type === "result") {
        let result: string[] = e.data.result;
        let output = "";
        result.forEach((result) => {
          output += result + "\n";
          console.log(result.toString());
        });
        setResult(result);
        setLoader("hidden");
      } else {
        console.log(e);
      }
    };
    workerRef.current.onerror = (e) => console.error(e);
    workerRef.current.postMessage("start");
    return () => {
      workerRef.current?.terminate();
    };
  }, []);
  return (
    <>
      <div className={`loader ${loader}`}></div>
      <div className="result">{result}</div>
    </>
  );
};
