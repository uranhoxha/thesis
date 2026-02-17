"use client";

import { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Clock,
  Timer as TimerIcon,
} from "lucide-react";

type Mode = "stopwatch" | "countdown";

export function Timer() {
  const [mode, setMode] = useState<Mode>("stopwatch");
  const [time, setTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [inputHours, setInputHours] = useState<number>(0);
  const [inputMinutes, setInputMinutes] = useState<number>(0);
  const [inputSeconds, setInputSeconds] = useState<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime((prev) => {
          if (mode === "stopwatch") {
            return prev + 10;
          } else {
            if (prev <= 0) {
              clearInterval(intervalRef.current!);
              setIsRunning(false);
              return 0;
            }
            return prev - 10;
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

  const handleStart = (): void => {
    if (mode === "countdown" && time === 0) {
      const totalMs =
        inputHours * 3600000 + inputMinutes * 60000 + inputSeconds * 1000;
      if (totalMs <= 0) return;
      setTime(totalMs);
    }
    setIsRunning(true);
  };

  const handleStop = (): void => setIsRunning(false);

  const handleReset = (): void => {
    setIsRunning(false);
    setTime(0);
  };

  return (
    <div className="flex flex-col items-center justify-between bg-customWhite text-customGreen p-4 flex-1">
      <div className="flex gap-2 mb-4 flex-col justify-center w-full">
        <button
          onClick={() => {
            setMode("stopwatch");
            setIsRunning(false);
            setTime(0);
          }}
          className={`cursor-pointer flex items-center justify-center gap-2 px-3 py-2 rounded-full border text-sm font-medium transition ${
            mode === "stopwatch"
              ? "bg-green-100 border-green-400 text-green-700"
              : "bg-white border-border"
          }`}
        >
          <Clock className="w-4 h-4" />
          Stopwatch
        </button>
        <button
          onClick={() => {
            setMode("countdown");
            setIsRunning(false);
            setTime(0);
          }}
          className={`cursor-pointer flex items-center justify-center gap-2 px-3 py-2 rounded-full border text-sm font-medium transition ${
            mode === "countdown"
              ? "bg-green-100 border-green-400 text-green-700"
              : "bg-white border-border"
          }`}
        >
          <TimerIcon className="w-4 h-4" />
          Countdown
        </button>
      </div>

      {mode === "countdown" && !isRunning && time === 0 && (
        <div className="flex justify-center gap-2 mb-4">
          <input
            type="number"
            min={0}
            value={inputHours}
            onChange={(e) => setInputHours(Number(e.target.value))}
            className="w-16 px-2 py-1 border border-border rounded-full text-center bg-white"
            placeholder="hh"
          />
          <span>:</span>
          <input
            type="number"
            min={0}
            value={inputMinutes}
            onChange={(e) => setInputMinutes(Number(e.target.value))}
            className="w-16 px-2 py-1 border border-border rounded-full text-center bg-white"
            placeholder="mm"
          />
          <span>:</span>
          <input
            type="number"
            min={0}
            value={inputSeconds}
            onChange={(e) => setInputSeconds(Number(e.target.value))}
            className="w-16 px-2 py-1 border border-border rounded-full text-center bg-white"
            placeholder="ss"
          />
        </div>
      )}

      <div className="text-center text-foreground">
        <p className="text-3xl font-bold tabular-nums">
          {format(hours)}:{format(minutes)}:{format(seconds)}:
          {format(milliseconds)}
        </p>
      </div>

      <div className="flex justify-center gap-4 mt-4">
        {isRunning ? (
          <button
            onClick={handleStop}
            className="p-2 bg-red-100 hover:bg-red-200 rounded-full border border-border cursor-pointer"
            title="Stop"
          >
            <Pause className="w-5 h-5 text-red-600" />
          </button>
        ) : (
          <button
            onClick={handleStart}
            className="p-2 bg-green-100 hover:bg-green-200 rounded-full border border-border cursor-pointer"
            title="Start"
          >
            <Play className="w-5 h-5 text-green-600" />
          </button>
        )}

        <button
          onClick={handleReset}
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full border border-border cursor-pointer"
          title="Reset"
        >
          <RotateCcw className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
}
