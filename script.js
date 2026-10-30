"use strict";

const SYMBOLS = { "+": "+", "-": "−", "*": "×", "/": "÷" };

const displayEl = document.getElementById("display");
const historyEl = document.getElementById("history");

let current = "0";
let previous = null;
let operator = null;
let waitingForOperand = false;
let history = "";

function compute(a, b, op) {
  switch (op) {
    case "+":
      return a + b;
    case "-":
      return a - b;
    case "*":
      return a * b;
    case "/":
      return b === 0 ? NaN : a / b;
    default:
      return b;
  }
}

function formatNumber(value) {
  if (!Number.isFinite(value)) return "Error";
  return String(parseFloat(value.toPrecision(12)));
}

function update() {
  displayEl.textContent = current;
  displayEl.classList.toggle("is-error", current === "Error");
  historyEl.innerHTML = history ? history : "&nbsp;";
}

function resetAll() {
  current = "0";
  previous = null;
  operator = null;
  waitingForOperand = false;
  history = "";
}

function inputDigit(digit) {
  if (current === "Error") resetAll();

  if (waitingForOperand) {
    current = digit;
    waitingForOperand = false;
  } else {
    current = current === "0" ? digit : current + digit;
  }
  update();
}

function inputDecimal() {
  if (current === "Error") resetAll();

  if (waitingForOperand) {
    current = "0.";
    waitingForOperand = false;
  } else if (!current.includes(".")) {
    current += ".";
  }
  update();
}

function chooseOperator(nextOperator) {
  if (current === "Error") return;

  const value = parseFloat(current);

  if (operator !== null && !waitingForOperand) {
    previous = compute(previous, value, operator);
    if (!Number.isFinite(previous)) {
      current = "Error";
      previous = null;
      operator = null;
      waitingForOperand = true;
      history = "";
      update();
      return;
    }
    current = formatNumber(previous);
  } else if (previous === null) {
    previous = value;
  }

  operator = nextOperator;
  waitingForOperand = true;
  history = `${formatNumber(previous)} ${SYMBOLS[nextOperator]}`;
  update();
}

function equals() {
  if (operator === null || current === "Error") {
    waitingForOperand = true;
    return;
  }

  const value = parseFloat(current);
  const result = compute(previous, value, operator);

  history = `${formatNumber(previous)} ${SYMBOLS[operator]} ${formatNumber(value)} =`;
  current = formatNumber(result);
  previous = null;
  operator = null;
  waitingForOperand = true;
  update();
}

function backspace() {
  if (current === "Error") {
    resetAll();
    update();
    return;
  }
  if (waitingForOperand) return;

  current = current.length > 1 ? current.slice(0, -1) : "0";
  if (current === "-" || current === "") current = "0";
  update();
}

function toggleSign() {
  if (current === "Error" || current === "0") return;
  current = current.startsWith("-") ? current.slice(1) : "-" + current;
  update();
}

function clearAll() {
  resetAll();
  update();
}

const actions = {
  clear: clearAll,
  backspace,
  sign: toggleSign,
  decimal: inputDecimal,
  equals,
};

function flash(selector) {
  const button = document.querySelector(selector);
  if (!button) return;
  button.classList.add("is-pressed");
  setTimeout(() => button.classList.remove("is-pressed"), 120);
}

document.querySelector(".keys").addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.digit !== undefined) {
    inputDigit(button.dataset.digit);
  } else if (button.dataset.operator !== undefined) {
    chooseOperator(button.dataset.operator);
  } else if (button.dataset.action !== undefined) {
    const action = actions[button.dataset.action];
    if (action) action();
  }
});

document.addEventListener("keydown", (event) => {
  const key = event.key;

  if (/^[0-9]$/.test(key)) {
    inputDigit(key);
    flash(`[data-digit="${key}"]`);
  } else if (key === "." || key === ",") {
    event.preventDefault();
    inputDecimal();
    flash('[data-action="decimal"]');
  } else if (key === "+" || key === "-" || key === "*" || key === "/") {
    event.preventDefault();
    chooseOperator(key);
    flash(`[data-operator="${key}"]`);
  } else if (key === "Enter" || key === "=") {
    event.preventDefault();
    equals();
    flash('[data-action="equals"]');
  } else if (key === "Backspace") {
    event.preventDefault();
    backspace();
    flash('[data-action="backspace"]');
  } else if (key === "Escape" || key.toLowerCase() === "c") {
    clearAll();
    flash('[data-action="clear"]');
  }
});

update();
