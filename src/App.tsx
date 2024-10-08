import { useCallback, useEffect, useState } from "react";
import { PythonWorkerMessage, usePython } from "./use-python";
export const App = () => {
  const [result, setResult] = useState<string[]>([]);
  const [loader, setLoader] = useState<string>("");
  const [resultIndex, setResultIndex] = useState<number>(0);
  const [showAndEnableControls, setShowAndEnableControls] =
    useState<boolean>(false);

  const [iter, setIter] = useState<number>(10);
  const [clusters, setClusters] = useState<number>(20);

  const onMessageEvent = useCallback(
    (event: MessageEvent<PythonWorkerMessage>) => {
      if (event.data.type && event.data.type === "initialised") {
        setShowAndEnableControls(true);
        setLoader("hidden");
      } else if (event.data.type && event.data.type === "result") {
        const outputResult: string[] = event.data.result;
        let output = "";
        outputResult.forEach((result) => {
          output += result + "\n\r";
        });
        setResult((result) => {
          setResultIndex(result.length);
          return [...result, output];
        });

        setLoader("hidden");
        setShowAndEnableControls(true);
      } else {
        console.log(event);
      }
    },
    [result, resultIndex]
  );

  const { postMessage } = usePython(onMessageEvent);

  useEffect(() => {
    setLoader("");
    setShowAndEnableControls(false);
    setResult([]);
  }, []);

  const buttonClickHandler = () => {
    setLoader("");
    setShowAndEnableControls(false);
    postMessage({
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
            title={iter.toString()}
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
            title={clusters.toString()}
            disabled={!showAndEnableControls}
            value={clusters}
            onChange={(e) => {
              setClusters(parseInt(e.target.value) ?? 0);
            }}
          />
        </div>
      </div>
      <div className="flex gap-4 mb-4 items-center">
        <button
          disabled={!showAndEnableControls}
          className={` text-white font-bold py-2 px-4 rounded ${
            showAndEnableControls
              ? "bg-blue-500 hover:bg-blue-700"
              : "bg-blue-300"
          }`}
          onClick={buttonClickHandler}
        >
          start
        </button>
        <div className={`loader ${loader} max-h-[20px] max-w-[20px]`}></div>
      </div>
      <div className="flex flex-row gap-4">
        <button
          type="button"
          className={`${
            showAndEnableControls && resultIndex > 0
              ? "cursor-pointer"
              : "text-gray-400"
          }`}
          disabled={!showAndEnableControls || resultIndex <= 0}
          onClick={() => {
            if (resultIndex > 0) {
              setResultIndex((resultIndex) => resultIndex - 1);
            }
          }}
        >
          Previous
        </button>
        <button
          type="button"
          className={`${
            showAndEnableControls && resultIndex < result.length - 1
              ? "cursor-pointer"
              : "text-gray-400"
          }`}
          disabled={!showAndEnableControls || resultIndex >= result.length - 1}
          onClick={() => {
            if (resultIndex < result.length - 1) {
              setResultIndex((resultIndex) => resultIndex + 1);
            }
          }}
        >
          Next
        </button>
        <span>
          {result.length == 0 ? 0 : resultIndex + 1} / {result.length}
        </span>
      </div>
      <div className="whitespace-pre-wrap font-mono mt-4">
        {result?.[resultIndex]}
      </div>
    </div>
  );
};
