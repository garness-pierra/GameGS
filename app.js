"use strict";

const DAYS = ["LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI", "DIMANCHE"];
const MONTHS = ["JANVIER", "FÉVRIER", "MARS", "AVRIL", "MAI", "JUIN", "JUILLET", "AOÛT", "SEPTEMBRE", "OCTOBRE", "NOVEMBRE", "DÉCEMBRE"];
const $ = (id) => document.getElementById(id);
const slotNames = ["day", "number", "month"];
const instructions = ["Choisis le jour", "Choisis le numéro du jour", "Choisis le mois"];
const STORAGE_KEY = "rituel-date-gs-settings-v1";

function localToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function readSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    const manualDate = typeof saved.manualDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(saved.manualDate)
      ? saved.manualDate
      : null;
    return { mode: saved.mode === "near" ? "near" : "all", manualDate };
  } catch {
    return { mode: "all", manualDate: null };
  }
}

const settings = readSettings();
let mode = settings.mode;
let manualDate = settings.manualDate;
let target = manualDate ? parseDateInput(manualDate) : localToday();
let step = 0;
let answers = { day: null, number: null, month: null };
let seasonAnswer = null;
let checked = false;
let monthOptions = [];
let drag = null;
let lastDragChoiceTime = 0;

function parseDateInput(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function expected() {
  return {
    day: DAYS[(target.getDay() + 6) % 7],
    number: String(target.getDate()),
    month: MONTHS[target.getMonth()],
  };
}

// Saison calendaire simplifiée : les repères sont fixes pour garder le rituel prévisible.
function seasonFor(date) {
  const value = (date.getMonth() + 1) * 100 + date.getDate();
  if (value >= 1221 || value < 320) return "hiver";
  if (value < 621) return "printemps";
  if (value < 922) return "été";
  return "automne";
}

function shuffled(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function prepareMonths() {
  const month = target.getMonth();
  monthOptions = shuffled([MONTHS[(month + 11) % 12], MONTHS[month], MONTHS[(month + 1) % 12]]);
}

function choicesForStep() {
  if (step === 0) return DAYS;
  if (step === 1) {
    if (mode === "all") return Array.from({ length: 31 }, (_, index) => String(index + 1));
    const number = target.getDate();
    const start = Math.max(1, Math.min(25, number - 3));
    return Array.from({ length: 7 }, (_, index) => String(start + index));
  }
  return monthOptions;
}

function render() {
  const rightAnswers = expected();
  slotNames.forEach((key) => {
    const slot = document.querySelector(`[data-slot="${key}"]`);
    const value = answers[key];
    slot.querySelector("strong").textContent = value || "Dépose ici";
    slot.className = `slot${value ? " filled" : ""}${checked ? (value === rightAnswers[key] ? " correct" : " incorrect") : ""}`;
  });

  $("step-label").textContent = step < 3 ? `ÉTAPE ${step + 1} SUR 3` : "DATE CONSTRUITE";
  $("instruction").textContent = step < 3 ? instructions[step] : "Vérifions notre date !";
  $("back").hidden = step === 0;
  $("validate").hidden = step !== 3;
  document.querySelectorAll("#step-mark span").forEach((item, index) => {
    item.classList.toggle("current", index === Math.min(step, 2));
    item.classList.toggle("done", index < step);
  });

  const choices = $("choices");
  choices.replaceChildren();
  if (step < 3) {
    choicesForStep().forEach((value) => {
      const tile = document.createElement("button");
      tile.type = "button";
      tile.className = `tile${step === 1 ? " number" : ""}`;
      tile.textContent = value;
      tile.dataset.value = value;
      tile.setAttribute("aria-label", step === 1 ? `Numéro ${value}` : value);
      tile.addEventListener("pointerdown", startDrag);
      tile.addEventListener("click", () => {
        if (Date.now() - lastDragChoiceTime > 450) choose(value);
      });
      choices.append(tile);
    });
  } else {
    const finished = document.createElement("div");
    finished.className = "finished";
    finished.innerHTML = '<span aria-hidden="true">✦</span><p>La date est prête !</p><small>Appuie sur « Vérifier la date ».</small>';
    choices.append(finished);
  }

  document.querySelectorAll(".season").forEach((button) => {
    const active = button.dataset.season === seasonAnswer;
    button.classList.toggle("active", active);
    button.classList.toggle("correct", checked && active && seasonAnswer === seasonFor(target));
    button.classList.toggle("incorrect", checked && active && seasonAnswer !== seasonFor(target));
  });

  const dateIsCorrect = slotNames.every((key) => answers[key] === rightAnswers[key]);
  const seasonIsCorrect = seasonAnswer === seasonFor(target);
  $("season-feedback").textContent = checked
    ? (seasonIsCorrect ? "✓ Bonne saison !" : "Essaie encore pour la saison.")
    : (seasonAnswer ? "Saison choisie" : "Choisis une saison");
  $("feedback").textContent = checked
    ? (dateIsCorrect && seasonIsCorrect
      ? "✓ Bravo ! La date et la saison sont correctes !"
      : dateIsCorrect
        ? "La date est correcte. Regarde aussi la saison !"
        : "Certaines réponses sont à corriger. Tu peux recommencer une étape.")
    : (step === 3 ? "La date ne sera révélée qu’après la vérification." : "Glisse une étiquette dans la case du haut, ou touche-la.");
}

function choose(value) {
  if (step >= 3) return;
  answers[slotNames[step]] = value;
  step += 1;
  checked = false;
  render();
}

function startDrag(event) {
  if (event.button !== 0 && event.pointerType === "mouse") return;
  const source = event.currentTarget;
  drag = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    value: source.dataset.value,
    source,
    ghost: null,
    moved: false,
  };
  source.setPointerCapture(event.pointerId);
  source.addEventListener("pointermove", moveDrag);
  source.addEventListener("pointerup", endDrag);
  source.addEventListener("pointercancel", cancelDrag);
}

function moveDrag(event) {
  if (!drag || event.pointerId !== drag.pointerId) return;
  const dx = event.clientX - drag.startX;
  const dy = event.clientY - drag.startY;
  if (!drag.ghost && Math.hypot(dx, dy) > 8) {
    drag.moved = true;
    drag.ghost = drag.source.cloneNode(true);
    drag.ghost.classList.add("ghost");
    drag.ghost.style.width = `${drag.source.offsetWidth}px`;
    document.body.append(drag.ghost);
    drag.source.classList.add("dragging");
  }
  if (drag.ghost) {
    drag.ghost.style.left = `${event.clientX - drag.ghost.offsetWidth / 2}px`;
    drag.ghost.style.top = `${event.clientY - drag.ghost.offsetHeight / 2}px`;
    document.querySelectorAll(".slot").forEach((slot) => {
      slot.classList.toggle("hover", slot === document.elementFromPoint(event.clientX, event.clientY)?.closest(".slot"));
    });
  }
}

function cleanupDrag() {
  if (!drag) return;
  drag.source.classList.remove("dragging");
  drag.source.removeEventListener("pointermove", moveDrag);
  drag.source.removeEventListener("pointerup", endDrag);
  drag.source.removeEventListener("pointercancel", cancelDrag);
  drag.ghost?.remove();
  document.querySelectorAll(".slot").forEach((slot) => slot.classList.remove("hover"));
  drag = null;
}

function endDrag(event) {
  if (!drag || event.pointerId !== drag.pointerId) return;
  const droppedOn = document.elementFromPoint(event.clientX, event.clientY)?.closest(".slot");
  const isCorrectSlot = droppedOn?.dataset.slot === slotNames[step];
  const { value, moved } = drag;
  cleanupDrag();
  if (moved && isCorrectSlot) {
    lastDragChoiceTime = Date.now();
    choose(value);
  }
}

function cancelDrag() {
  cleanupDrag();
}

function persistSettings() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode, manualDate }));
  } catch {
    // Le rituel reste utilisable si le navigateur bloque le stockage local.
  }
}

function reset() {
  target = manualDate ? parseDateInput(manualDate) : localToday();
  step = 0;
  answers = { day: null, number: null, month: null };
  seasonAnswer = null;
  checked = false;
  prepareMonths();
  render();
}

document.querySelectorAll(".season").forEach((button) => {
  button.addEventListener("click", () => {
    seasonAnswer = button.dataset.season;
    checked = false;
    render();
  });
});

$("validate").addEventListener("click", () => {
  checked = true;
  render();
});

$("back").addEventListener("click", () => {
  if (step > 0) {
    step -= 1;
    checked = false;
    render();
  }
});

$("restart").addEventListener("click", reset);

$("fullscreen").addEventListener("click", async () => {
  try {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
    else await document.exitFullscreen();
  } catch {
    $("feedback").textContent = "Le plein écran n’est pas disponible dans cette fenêtre.";
  }
});

$("settings").addEventListener("click", () => {
  $("automatic-date").checked = !manualDate;
  $("target-date").value = manualDate || toDateInput(localToday());
  $("target-date").disabled = !manualDate;
  $("number-mode").value = mode;
  $("settings-dialog").showModal();
});

$("automatic-date").addEventListener("change", (event) => {
  $("target-date").disabled = event.currentTarget.checked;
});

$("settings-form").addEventListener("submit", (event) => {
  if (event.submitter?.id !== "save-settings") return;
  event.preventDefault();
  const useAutomaticDate = $("automatic-date").checked;
  if (!useAutomaticDate && !$("target-date").value) {
    $("target-date").focus();
    return;
  }
  manualDate = useAutomaticDate ? null : $("target-date").value;
  mode = $("number-mode").value;
  persistSettings();
  $("settings-dialog").close();
  reset();
});

function toDateInput(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function syncAutomaticDate() {
  if (!manualDate && toDateInput(target) !== toDateInput(localToday())) reset();
}

function scheduleMidnightRefresh() {
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 2);
  window.setTimeout(() => {
    syncAutomaticDate();
    scheduleMidnightRefresh();
  }, tomorrow.getTime() - now.getTime());
}

window.addEventListener("focus", syncAutomaticDate);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) syncAutomaticDate();
});

prepareMonths();
render();
scheduleMidnightRefresh();
