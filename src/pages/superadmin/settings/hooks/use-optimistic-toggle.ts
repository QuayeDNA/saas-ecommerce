import { useCallback } from "react";

export function useOptimisticToggle<T extends Record<string, any>>(
  setBusyKey: (key: string, v: boolean) => void,
  addToast: (msg: string, type: "success" | "error") => void,
) {
  const run = useCallback(async <K extends keyof T>(
    key: string,
    data: T | null,
    setData: (updater: (d: T | null) => T | null) => void,
    path: K[],
    apiCall: () => Promise<any>,
    successMsg: string,
    errorMsg: string,
  ) => {
    if (!data) return;
    const prev = path.reduce((acc: any, k) => acc?.[k], data);
    const newVal = typeof prev === "boolean" ? !prev : prev;

    setData(d => {
      if (!d) return d;
      const copy = { ...d };
      let target: any = copy;
      for (let i = 0; i < path.length - 1; i++) {
        target[path[i]] = { ...target[path[i]] };
        target = target[path[i]];
      }
      target[path[path.length - 1]] = newVal;
      return copy;
    });

    setBusyKey(key, true);
    try {
      await apiCall();
      addToast(successMsg, "success");
    } catch {
      setData(d => {
        if (!d) return d;
        const copy = { ...d };
        let target: any = copy;
        for (let i = 0; i < path.length - 1; i++) {
          target[path[i]] = { ...target[path[i]] };
          target = target[path[i]];
        }
        target[path[path.length - 1]] = prev;
        return copy;
      });
      addToast(errorMsg, "error");
    } finally {
      setBusyKey(key, false);
    }
  }, [setBusyKey, addToast]);

  return { run };
}
