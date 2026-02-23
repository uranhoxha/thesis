import { useEffect, useRef, useState } from "react";

type Mode = "stopwatch" | "countdown";

export function useTimer() {
  const [mode, setMode] = useState<Mode>("stopwatch");
  const [time, setTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [inputHours, setInputHours] = useState<number>(0);
  const [inputMinutes, setInputMinutes] = useState<number>(0);
  const [inputSeconds, setInputSeconds] = useState<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const timeRef = useRef(time);
  const modeRef = useRef(mode);
  const isRunningRef = useRef(isRunning);
  useEffect(() => {
    timeRef.current = time;
    modeRef.current = mode;
    isRunningRef.current = isRunning;
  }, [time, mode, isRunning]);

  useEffect(() => {
    try {
      const savedTime = localStorage.getItem("timer_time");
      const savedMode = localStorage.getItem("timer_mode");
      const savedIsRunning = localStorage.getItem("timer_isRunning");
      const savedTimestamp = localStorage.getItem("timer_timestamp");

      let initialTime = savedTime ? Number(savedTime) : 0;
      const initialMode = savedMode ? (savedMode as Mode) : "stopwatch";

      if (savedIsRunning === "true" && savedTimestamp) {
        const elapsed = Date.now() - Number(savedTimestamp);
        if (initialMode === "stopwatch") {
          initialTime += elapsed;
        } else {
          initialTime -= elapsed;
          if (initialTime < 0) initialTime = 0;
        }

        if (initialTime > 0 || initialMode === "stopwatch") {
          setIsRunning(true);
        }
      }

      setMode(initialMode);
      setTime(initialTime);
    } catch (e) {
      console.error("Failed to load timer from localStorage", e);
    }

    const handleSaveState = () => {
      try {
        localStorage.setItem("timer_time", timeRef.current.toString());
        localStorage.setItem("timer_mode", modeRef.current);
        localStorage.setItem(
          "timer_isRunning",
          isRunningRef.current.toString(),
        );
        localStorage.setItem("timer_timestamp", Date.now().toString());
      } catch (e) {
        console.error("Failed to save timer to localStorage", e);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        handleSaveState();
      }
    };

    window.addEventListener("beforeunload", handleSaveState);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleSaveState);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime((prev) => {
          if (mode === "stopwatch") {
            return prev + 10;
          } else {
            const nextTime = prev - 10;
            if (nextTime <= 0) {
              clearInterval(intervalRef.current!);
              setIsRunning(false);
              return 0;
            }
            return nextTime;
          }
        });
      }, 10);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, mode]);

  const hours = Math.floor(time / 3600000);
  const minutes = Math.floor((time % 3600000) / 60000);
  const seconds = Math.floor((time % 60000) / 1000);
  const milliseconds = Math.floor((time % 1000) / 10);

  const format = (num: number, size = 2): string =>
    String(num).padStart(size, "0");

  const saveImmediate = (
    newTime: number,
    newMode: Mode,
    newIsRunning: boolean,
  ) => {
    try {
      localStorage.setItem("timer_time", newTime.toString());
      localStorage.setItem("timer_mode", newMode);
      localStorage.setItem("timer_isRunning", newIsRunning.toString());
      localStorage.setItem("timer_timestamp", Date.now().toString());
    } catch (e) {
      console.error("Failed to save timer", e);
    }
  };

  const handleStart = (): void => {
    let startTime = time;
    if (mode === "countdown" && time === 0) {
      const totalMs =
        inputHours * 3600000 + inputMinutes * 60000 + inputSeconds * 1000;
      if (totalMs <= 0) return;
      startTime = totalMs;
      setTime(startTime);
    }
    setIsRunning(true);
    saveImmediate(startTime, mode, true);
  };

  const handleStop = (): void => {
    setIsRunning(false);
    saveImmediate(time, mode, false);
  };

  const handleReset = (): void => {
    setIsRunning(false);
    setTime(0);
    saveImmediate(0, mode, false);
  };

  // Wrapper for setMode to also save
  const wrappedSetMode = (newMode: Mode) => {
    setMode(newMode);
    saveImmediate(time, newMode, isRunning);
  };

  // Wrapper for setTime to also save (used by Reset buttons in UI)
  const wrappedSetTime = (newTime: number | ((prev: number) => number)) => {
    setTime(newTime);
    if (typeof newTime === "number") {
      saveImmediate(newTime, mode, isRunning);
    }
  };

  // Wrapper for setIsRunning
  const wrappedSetIsRunning = (run: boolean | ((prev: boolean) => boolean)) => {
    setIsRunning(run);
    if (typeof run === "boolean") {
      saveImmediate(time, mode, run);
    }
  };

  return {
    mode,
    setMode: wrappedSetMode,
    time,
    setTime: wrappedSetTime,
    isRunning,
    setIsRunning: wrappedSetIsRunning,
    inputHours,
    setInputHours,
    inputMinutes,
    setInputMinutes,
    inputSeconds,
    setInputSeconds,
    intervalRef,
    hours,
    minutes,
    seconds,
    milliseconds,
    format,
    handleStart,
    handleStop,
    handleReset,
  };
}
