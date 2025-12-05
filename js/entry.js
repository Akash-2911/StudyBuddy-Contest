// js/entry.js

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("entryForm");
  const nameInput = document.getElementById("nameInput");
  const emailInput = document.getElementById("emailInput");
  const agreeRules = document.getElementById("agreeRules");
  const startBtn = document.getElementById("startBtn");
  const goLeaderboard = document.getElementById("goLeaderboard");

  function validateForm() {
    const nameOk = nameInput.value.trim().length >= 2;
    const emailVal = emailInput.value.trim();
    const emailOk = emailVal.includes("@") && emailVal.length >= 5;
    const agreed = agreeRules.checked;
    startBtn.disabled = !(nameOk && emailOk && agreed);
  }

  nameInput.addEventListener("input", validateForm);
  emailInput.addEventListener("input", validateForm);
  agreeRules.addEventListener("change", validateForm);

  goLeaderboard.addEventListener("click", () => {
    window.location.href = "leaderboard.html";
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();

    // Persist for quiz + highlighting later
    sessionStorage.setItem("sb_contest_name", name);
    sessionStorage.setItem("sb_contest_email", email);

    // Clean any previous run
    sessionStorage.removeItem("sb_contest_start");

    window.location.href = "quiz.html";
  });
});
