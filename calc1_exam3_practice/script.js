let allProblems = [];
let filteredProblems = [];
let currentProblem = null;

let attempted = 0;
let correct = 0;

let timerInterval = null;
let currentSeconds = 0;

const setSelect   = document.getElementById("setSelect");
const newBtn      = document.getElementById("newBtn");
const showBtn     = document.getElementById("showBtn");
const rightBtn    = document.getElementById("rightBtn");
const wrongBtn    = document.getElementById("wrongBtn");
const resetBtn    = document.getElementById("resetBtn");

const problemMeta       = document.getElementById("problemMeta");
const problemExpression = document.getElementById("problemExpression");
const answerBox         = document.getElementById("answerBox");
const answerText        = document.getElementById("answerText");

const statAttempted = document.getElementById("statAttempted");
const statCorrect   = document.getElementById("statCorrect");
const statAccuracy  = document.getElementById("statAccuracy");
const timerDisplay  = document.getElementById("timer");

// --------- Load problems from JSON ---------
async function loadProblems() {
  try {
    const resp = await fetch("problems.json");
    const data = await resp.json();
    allProblems = data.problems || [];
    applyFilter();
  } catch (e) {
    console.error("Error loading problems.json", e);
    problemMeta.textContent = "Error: could not load problems.json";
  }
}

// --------- Filtering ---------
function applyFilter() {
  const setValue = setSelect.value;
  if (setValue === "all") {
    filteredProblems = allProblems.slice();
  } else {
    filteredProblems = allProblems.filter(p => p.set === setValue);
  }
  currentProblem = null;
  problemMeta.textContent = "Filter applied. Click \"New Problem\" to begin.";
  problemExpression.textContent = "";
  hideAnswer();
  stopTimer();
  currentSeconds = 0;
  updateTimerDisplay();
}

// --------- Timer ---------
function startTimer() {
  stopTimer();
  currentSeconds = 0;
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    currentSeconds += 1;
    updateTimerDisplay();
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function updateTimerDisplay() {
  timerDisplay.textContent = currentSeconds + " s";
}

// --------- Problem selection ---------
function pickRandomProblem() {
  if (!filteredProblems.length) {
    problemMeta.textContent = "No problems available for this filter.";
    problemExpression.textContent = "";
    hideAnswer();
    disableAnswerButtons();
    return;
  }
  const idx = Math.floor(Math.random() * filteredProblems.length);
  currentProblem = filteredProblems[idx];

  const setLabel = currentProblem.set === "set1"
    ? "Set 1 – General antiderivative"
    : currentProblem.set === "set2"
      ? "Set 2 – Indefinite integrals"
      : currentProblem.set;

  problemMeta.textContent =
    `${setLabel}, Problem ${currentProblem.number} (Book Sec. ${currentProblem.section})`;
  problemExpression.textContent = currentProblem.expression;

  hideAnswer();
  enableAnswerButtons();
  startTimer();
}

// --------- Answer display ---------
function showAnswer() {
  if (!currentProblem) return;
  answerText.textContent = currentProblem.answer;
  answerBox.classList.remove("hidden");
}

function hideAnswer() {
  answerBox.classList.add("hidden");
}

// --------- Stats ---------
function updateStats() {
  statAttempted.textContent = attempted;
  statCorrect.textContent = correct;
  const accuracy = attempted === 0 ? 0 : Math.round((correct / attempted) * 100);
  statAccuracy.textContent = accuracy + "%";
}

function markRight() {
  if (!currentProblem) return;
  attempted += 1;
  correct += 1;
  updateStats();
  stopTimer();
  disableAnswerButtons();
}

function markWrong() {
  if (!currentProblem) return;
  attempted += 1;
  updateStats();
  stopTimer();
  disableAnswerButtons();
}

function resetStats() {
  attempted = 0;
  correct = 0;
  updateStats();
}

// --------- Button enable/disable ---------
function enableAnswerButtons() {
  showBtn.disabled = false;
  rightBtn.disabled = false;
  wrongBtn.disabled = false;
}

function disableAnswerButtons() {
  showBtn.disabled = true;
  rightBtn.disabled = true;
  wrongBtn.disabled = true;
}

// --------- Event listeners ---------
setSelect.addEventListener("change", applyFilter);
newBtn.addEventListener("click", pickRandomProblem);
showBtn.addEventListener("click", showAnswer);
rightBtn.addEventListener("click", markRight);
wrongBtn.addEventListener("click", markWrong);
resetBtn.addEventListener("click", () => {
  resetStats();
  stopTimer();
  currentSeconds = 0;
  updateTimerDisplay();
});

// --------- Init ---------
updateStats();
updateTimerDisplay();
loadProblems();