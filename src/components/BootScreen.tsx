"use client";

import { useState, useEffect, useCallback } from "react";

interface BootScreenProps {
  onComplete: () => void;
}

export default function BootScreen({ onComplete }: BootScreenProps) {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  const handleComplete = useCallback(() => {
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    const duration = 2500;
    const interval = 20;
    const step = 100 / (duration / interval);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(timer);
          return 100;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      const fadeTimer = setTimeout(() => setFadeOut(true), 300);
      return () => clearTimeout(fadeTimer);
    }
  }, [progress]);

  useEffect(() => {
    if (fadeOut) {
      const completeTimer = setTimeout(handleComplete, 600);
      return () => clearTimeout(completeTimer);
    }
  }, [fadeOut, handleComplete]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black"
      style={{
        opacity: fadeOut ? 0 : 1,
        transition: "opacity 600ms ease-in-out",
      }}
    >
      {/* Apple logo with glow */}
      <div
        className="select-none text-white"
        style={{
          fontSize: "80px",
          lineHeight: 1,
          textShadow: "0 0 40px rgba(255, 255, 255, 0.3), 0 0 80px rgba(255, 255, 255, 0.15)",
        }}
      >

      </div>

      {/* Progress bar container */}
      <div
        className="mt-12 overflow-hidden rounded-full bg-white/20"
        style={{ width: "200px", height: "4px" }}
      >
        {/* Progress bar fill */}
        <div
          className="h-full rounded-full bg-white"
          style={{
            width: `${progress}%`,
            transition: "width 40ms linear",
          }}
        />
      </div>
    </div>
  );
}
