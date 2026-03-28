"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { WindowState } from "@/lib/types";

interface Props {
  window: WindowState;
}

type Operator = "+" | "-" | "×" | "÷" | null;

function formatDisplay(value: string): string {
  // Don't format if it contains an error
  if (value === "Error") return value;

  const isNegative = value.startsWith("-");
  const stripped = isNegative ? value.slice(1) : value;
  const parts = stripped.split(".");
  const intPart = parts[0];

  // Add commas to integer part
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const result = parts.length > 1 ? `${formatted}.${parts[1]}` : formatted;
  return isNegative ? `-${result}` : result;
}

export default function CalculatorApp({ window: _win }: Props) {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [justEvaluated, setJustEvaluated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const clearAll = useCallback(() => {
    setDisplay("0");
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(false);
    setJustEvaluated(false);
  }, []);

  const inputDigit = useCallback(
    (digit: string) => {
      if (waitingForOperand || justEvaluated) {
        setDisplay(digit);
        setWaitingForOperand(false);
        setJustEvaluated(false);
      } else {
        // Limit display length
        if (display.replace(/[^0-9]/g, "").length >= 9) return;
        setDisplay(display === "0" ? digit : display + digit);
      }
    },
    [display, waitingForOperand, justEvaluated],
  );

  const inputDecimal = useCallback(() => {
    if (waitingForOperand || justEvaluated) {
      setDisplay("0.");
      setWaitingForOperand(false);
      setJustEvaluated(false);
      return;
    }
    if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  }, [display, waitingForOperand, justEvaluated]);

  const toggleSign = useCallback(() => {
    if (display === "0") return;
    setDisplay(display.startsWith("-") ? display.slice(1) : "-" + display);
  }, [display]);

  const inputPercent = useCallback(() => {
    const value = parseFloat(display);
    if (value === 0) return;
    setDisplay(String(value / 100));
  }, [display]);

  const calculate = useCallback(
    (left: number, right: number, op: Operator): number => {
      switch (op) {
        case "+":
          return left + right;
        case "-":
          return left - right;
        case "×":
          return left * right;
        case "÷":
          return right === 0 ? NaN : left / right;
        default:
          return right;
      }
    },
    [],
  );

  const performOperation = useCallback(
    (nextOperator: Operator) => {
      const currentValue = parseFloat(display);

      if (previousValue !== null && !waitingForOperand) {
        const result = calculate(previousValue, currentValue, operator);
        if (isNaN(result) || !isFinite(result)) {
          setDisplay("Error");
          setPreviousValue(null);
          setOperator(null);
          setWaitingForOperand(false);
          setJustEvaluated(false);
          return;
        }
        const resultStr = String(parseFloat(result.toPrecision(10)));
        setDisplay(resultStr);
        setPreviousValue(result);
      } else {
        setPreviousValue(currentValue);
      }

      setOperator(nextOperator);
      setWaitingForOperand(true);
      setJustEvaluated(false);
    },
    [display, previousValue, operator, waitingForOperand, calculate],
  );

  const handleEquals = useCallback(() => {
    const currentValue = parseFloat(display);

    if (previousValue !== null && operator) {
      const result = calculate(previousValue, currentValue, operator);
      if (isNaN(result) || !isFinite(result)) {
        setDisplay("Error");
        setPreviousValue(null);
        setOperator(null);
        setWaitingForOperand(false);
        setJustEvaluated(true);
        return;
      }
      const resultStr = String(parseFloat(result.toPrecision(10)));
      setDisplay(resultStr);
      setPreviousValue(null);
      setOperator(null);
      setWaitingForOperand(false);
      setJustEvaluated(true);
    }
  }, [display, previousValue, operator, calculate]);

  // Determine if clear should be AC or C
  const clearLabel = display !== "0" && !waitingForOperand ? "C" : "AC";

  const handleClear = useCallback(() => {
    if (clearLabel === "C") {
      setDisplay("0");
      setWaitingForOperand(false);
    } else {
      clearAll();
    }
  }, [clearLabel, clearAll]);

  // Keyboard support
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const { key } = e;

      if (key >= "0" && key <= "9") {
        e.preventDefault();
        inputDigit(key);
      } else if (key === ".") {
        e.preventDefault();
        inputDecimal();
      } else if (key === "+" || key === "=") {
        e.preventDefault();
        if (key === "=" || (e.shiftKey && key === "+")) {
          if (key === "+") {
            performOperation("+");
          } else {
            handleEquals();
          }
        } else {
          performOperation("+");
        }
      } else if (key === "-") {
        e.preventDefault();
        performOperation("-");
      } else if (key === "*") {
        e.preventDefault();
        performOperation("×");
      } else if (key === "/") {
        e.preventDefault();
        performOperation("÷");
      } else if (key === "Enter") {
        e.preventDefault();
        handleEquals();
      } else if (key === "Escape" || key === "c" || key === "C") {
        e.preventDefault();
        handleClear();
      } else if (key === "%") {
        e.preventDefault();
        inputPercent();
      } else if (key === "Backspace") {
        e.preventDefault();
        if (display.length > 1 && !waitingForOperand) {
          setDisplay(display.slice(0, -1));
        } else {
          setDisplay("0");
        }
      }
    }

    const el = containerRef.current;
    if (el) {
      el.addEventListener("keydown", handleKeyDown);
      el.focus();
    }

    return () => {
      if (el) {
        el.removeEventListener("keydown", handleKeyDown);
      }
    };
  }, [
    inputDigit,
    inputDecimal,
    performOperation,
    handleEquals,
    handleClear,
    inputPercent,
    display,
    waitingForOperand,
  ]);

  // Dynamic font size for display
  const displayText = formatDisplay(display);
  let displayFontSize = "text-5xl";
  if (displayText.length > 11) displayFontSize = "text-3xl";
  else if (displayText.length > 8) displayFontSize = "text-4xl";

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className="flex h-full w-full flex-col bg-[#1c1c1c] outline-none select-none"
    >
      {/* Display */}
      <div className="flex min-h-[80px] flex-1 items-end justify-end px-5 pb-2">
        <span
          className={`${displayFontSize} font-light tracking-tight text-white`}
        >
          {displayText}
        </span>
      </div>

      {/* Button Grid */}
      <div className="grid grid-cols-4 gap-[1px] p-[1px]">
        {/* Row 1: AC, ±, %, ÷ */}
        <CalcButton
          label={clearLabel}
          onClick={handleClear}
          variant="light"
        />
        <CalcButton label="±" onClick={toggleSign} variant="light" />
        <CalcButton label="%" onClick={inputPercent} variant="light" />
        <CalcButton
          label="÷"
          onClick={() => performOperation("÷")}
          variant="orange"
          active={operator === "÷" && waitingForOperand}
        />

        {/* Row 2: 7, 8, 9, × */}
        <CalcButton label="7" onClick={() => inputDigit("7")} variant="dark" />
        <CalcButton label="8" onClick={() => inputDigit("8")} variant="dark" />
        <CalcButton label="9" onClick={() => inputDigit("9")} variant="dark" />
        <CalcButton
          label="×"
          onClick={() => performOperation("×")}
          variant="orange"
          active={operator === "×" && waitingForOperand}
        />

        {/* Row 3: 4, 5, 6, - */}
        <CalcButton label="4" onClick={() => inputDigit("4")} variant="dark" />
        <CalcButton label="5" onClick={() => inputDigit("5")} variant="dark" />
        <CalcButton label="6" onClick={() => inputDigit("6")} variant="dark" />
        <CalcButton
          label="-"
          onClick={() => performOperation("-")}
          variant="orange"
          active={operator === "-" && waitingForOperand}
        />

        {/* Row 4: 1, 2, 3, + */}
        <CalcButton label="1" onClick={() => inputDigit("1")} variant="dark" />
        <CalcButton label="2" onClick={() => inputDigit("2")} variant="dark" />
        <CalcButton label="3" onClick={() => inputDigit("3")} variant="dark" />
        <CalcButton
          label="+"
          onClick={() => performOperation("+")}
          variant="orange"
          active={operator === "+" && waitingForOperand}
        />

        {/* Row 5: 0 (wide), ., = */}
        <CalcButton
          label="0"
          onClick={() => inputDigit("0")}
          variant="dark"
          wide
        />
        <CalcButton label="." onClick={inputDecimal} variant="dark" />
        <CalcButton label="=" onClick={handleEquals} variant="orange" />
      </div>
    </div>
  );
}

interface CalcButtonProps {
  label: string;
  onClick: () => void;
  variant: "dark" | "light" | "orange";
  wide?: boolean;
  active?: boolean;
}

function CalcButton({
  label,
  onClick,
  variant,
  wide = false,
  active = false,
}: CalcButtonProps) {
  const baseClasses =
    "flex items-center justify-center rounded-full transition-all duration-75 cursor-pointer aspect-square";
  const wideClasses = wide ? "col-span-2 !aspect-auto pl-7 justify-start" : "";

  let colorClasses: string;
  if (active) {
    // Active operator: white bg, orange text
    colorClasses = "bg-white text-[#ff9f0a] hover:bg-white/90 active:bg-white/80";
  } else {
    switch (variant) {
      case "light":
        colorClasses =
          "bg-[#a5a5a5] text-black hover:bg-[#c8c8c8] active:bg-[#d9d9d9]";
        break;
      case "orange":
        colorClasses =
          "bg-[#ff9f0a] text-white hover:bg-[#ffb74d] active:bg-[#ffcc80]";
        break;
      case "dark":
      default:
        colorClasses =
          "bg-[#333333] text-white hover:bg-[#555555] active:bg-[#666666]";
        break;
    }
  }

  const fontSize =
    variant === "orange" ? "text-3xl" : variant === "light" ? "text-xl" : "text-2xl";

  return (
    <button
      type="button"
      className={`${baseClasses} ${wideClasses} ${colorClasses} ${fontSize} font-light`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
