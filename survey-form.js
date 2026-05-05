const GOOGLE_FORM_VIEW_URL = "https://forms.gle/wwc7qVxSwqFoLRSY9";
const GOOGLE_FORM_ACTION = "https://docs.google.com/forms/d/e/1FAIpQLSdQcUTPrg50rGVx7bZBnvGCFBPIc854sMpKz3gZ3872pzaqfQ/formResponse";
const FIELD_MAP = {
  age_group: "entry.784057855",
  location: "entry.339401965",
  practice: "entry.2061967713",
  platforms: "entry.1017712194",
  frequency: "entry.35568259",
  problem: "entry.382124004",
  appeal: "entry.1180214183",
  appealing_parts: "entry.1466092751",
  open_frequency: "entry.615429864",
  retention_hooks: "entry.695630078",
  switch_intent: "entry.162583220",
  concerns: "entry.995169832",
  trust_signals: "entry.2058473267",
  payment_intent: "entry.368462040",
  nps: "entry.458319696",
  founder_message: "entry.1889967034",
  respondent_name: "entry.1190681375",
  respondent_email: "entry.1095502883",
  whatsapp: "entry.116539444",
  other_feedback: "entry.842322950",
  permissions: "entry.644625446"
};

const TOTAL = 7;
let currentStep = 1;
const answers = {};
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const stepNames = [
  "Parichay — Who you are",
  "Aadat — Digital habits",
  "Dharna — First impression",
  "Niyamit Upyog — Usage intent",
  "Vishwaas — Trust signals",
  "Sankalp — Recommendation",
  "Poorna — Contact details"
];

document.addEventListener("DOMContentLoaded", () => {
  buildDots();
  buildNPS();
  wireChoices();
  updateProgress();
});

function buildDots() {
  const container = document.getElementById("stepsDots");
  if (!container) return;

  const fragment = document.createDocumentFragment();
  for (let i = 1; i <= TOTAL; i += 1) {
    const dot = document.createElement("div");
    dot.className = `step-dot${i === 1 ? " active" : ""}`;
    dot.id = `dot${i}`;
    fragment.appendChild(dot);
  }
  container.appendChild(fragment);
}

function buildNPS() {
  const row = document.getElementById("npsRow");
  if (!row) return;

  const fragment = document.createDocumentFragment();
  for (let i = 1; i <= 10; i += 1) {
    const button = document.createElement("button");
    button.className = "nps-btn";
    button.textContent = String(i);
    button.type = "button";
    button.addEventListener("click", () => {
      row.querySelectorAll(".nps-btn").forEach((item) => item.classList.remove("selected"));
      button.classList.add("selected");
      answers.nps = i;
    });
    fragment.appendChild(button);
  }
  row.appendChild(fragment);
}

function getChoiceValue(item) {
  const text = item.querySelector(".choice-text");
  if (text) return text.textContent.replace(/\s+/g, " ").trim();

  const input = item.querySelector("input");
  return input ? input.value : "";
}

function syncChoiceGroup(group) {
  const name = group.dataset.name;
  const type = group.dataset.type;

  if (type === "radio") {
    let selectedValue;
    group.querySelectorAll(".choice-item").forEach((item) => {
      const input = item.querySelector("input");
      const isSelected = Boolean(input && input.checked);
      item.classList.toggle("selected", isSelected);
      if (isSelected) selectedValue = getChoiceValue(item);
    });
    answers[name] = selectedValue;
    return;
  }

  const values = [];
  group.querySelectorAll(".choice-item").forEach((item) => {
    const input = item.querySelector("input");
    const isSelected = Boolean(input && input.checked);
    item.classList.toggle("selected", isSelected);
    if (isSelected) values.push(getChoiceValue(item));
  });
  answers[name] = values;
}

function wireChoices() {
  document.querySelectorAll(".choices").forEach((group) => {
    const type = group.dataset.type;
    const maxSelections = group.dataset.max ? Number.parseInt(group.dataset.max, 10) : Number.POSITIVE_INFINITY;

    group.addEventListener("change", (event) => {
      const input = event.target;
      if (!(input instanceof HTMLInputElement)) return;

      if (type === "checkbox") {
        const checkedCount = group.querySelectorAll("input:checked").length;
        if (checkedCount > maxSelections) {
          input.checked = false;
          const item = input.closest(".choice-item");
          if (item) {
            item.style.borderColor = "var(--danger)";
            window.setTimeout(() => {
              item.style.borderColor = "";
            }, 300);
          }
        }
      }

      syncChoiceGroup(group);
    });

    syncChoiceGroup(group);
  });
}

function nextStep(from, required, errId) {
  const err = document.getElementById(errId);

  for (const key of required) {
    const value = answers[key];
    if (!value || (Array.isArray(value) && value.length === 0)) {
      if (err) err.classList.add("show");
      return;
    }
  }

  if (err) err.classList.remove("show");
  showStep(from + 1);
}

function prevStep(from) {
  showStep(from - 1);
}

function showStep(stepNumber) {
  const current = document.getElementById(`step${currentStep}`);
  if (current) current.classList.remove("active");

  currentStep = stepNumber;
  const next = document.getElementById(`step${stepNumber}`) || document.getElementById("stepThanks");
  if (next) next.classList.add("active");

  if (prefersReducedMotion) {
    window.scrollTo(0, 0);
  } else {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }

  updateProgress();
}

function updateProgress() {
  const fill = document.getElementById("progressFill");
  const label = document.getElementById("progressLabel");
  const stepName = document.getElementById("progressStepName");
  const progress = Math.round((currentStep / TOTAL) * 100);

  if (fill) fill.style.width = `${progress}%`;
  if (label) label.textContent = `Step ${currentStep} of ${TOTAL}`;
  if (stepName) stepName.textContent = stepNames[currentStep - 1] || "";

  for (let i = 1; i <= TOTAL; i += 1) {
    const dot = document.getElementById(`dot${i}`);
    if (!dot) continue;
    dot.className = `step-dot${i === currentStep ? " active" : i < currentStep ? " done" : ""}`;
  }
}

async function submitForm() {
  const name = document.getElementById("fieldName").value.trim();
  const email = document.getElementById("fieldEmail").value.trim();
  const whatsapp = document.getElementById("fieldWhatsapp").value.trim();
  const other = document.getElementById("fieldOther").value.trim();
  const err = document.getElementById("err7");

  if (!name || !email || !whatsapp) {
    if (err) err.classList.add("show");
    return;
  }

  if (err) err.classList.remove("show");

  answers.respondent_name = name;
  answers.respondent_email = email;
  answers.whatsapp = whatsapp;
  answers.other_feedback = other;
  answers.founder_message = document.getElementById("founderMsg").value.trim();
  if (!answers.permissions) answers.permissions = [];

  const button = document.getElementById("submitBtn");
  if (button) button.classList.add("loading");

  sendToGoogleForms(answers).catch(() => {
    console.log(`Submission fallback available at ${GOOGLE_FORM_VIEW_URL}`);
  });

  if (button) button.classList.remove("loading");

  const activeStep = document.getElementById(`step${currentStep}`);
  const thanksStep = document.getElementById("stepThanks");
  const progressShell = document.getElementById("progressShell");

  if (activeStep) activeStep.classList.remove("active");
  if (progressShell) progressShell.style.display = "none";
  if (thanksStep) thanksStep.classList.add("active");

  window.scrollTo(0, 0);
}

async function sendToGoogleForms(data) {
  const formData = new FormData();

  for (const [key, entryId] of Object.entries(FIELD_MAP)) {
    const value = data[key];
    if (value === undefined || value === null || value === "") continue;

    if (Array.isArray(value)) {
      value.forEach((item) => formData.append(entryId, item));
    } else {
      formData.append(entryId, value);
    }
  }

  await fetch(GOOGLE_FORM_ACTION, {
    method: "POST",
    mode: "no-cors",
    body: formData
  });
}
