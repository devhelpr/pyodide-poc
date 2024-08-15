import { useRef, useEffect } from "react";
import PythonWorker from "./worker?worker";

export interface PythonWorkerMessage {
  type: string;
  result: string[];
}

export const usePython = (
  onWorkerMessage: (event: MessageEvent<PythonWorkerMessage>) => void
) => {
  const workerRef = useRef<Worker | undefined>(undefined);
  useEffect(() => {
    workerRef.current = new PythonWorker();

    workerRef.current.onerror = (e) => console.error(e);
    workerRef.current.postMessage("init");
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  useEffect(() => {
    workerRef.current?.addEventListener("message", onWorkerMessage);
    return () => {
      workerRef.current?.removeEventListener("message", onWorkerMessage);
    };
  }, [onWorkerMessage]);

  return {
    postMessage: (message: any) => workerRef.current?.postMessage(message),
  };
};
