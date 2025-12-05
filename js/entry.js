// js/entry.js

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("entryForm");
  const nameInput = document.getElementById("nameInput");
  const emailInput = document.getElementById("emailInput");
  const agreeRules = document.getElementById("agreeRules");
  const startBtn = document.getElementById("startBtn");
  const goLeaderboard = document.getElementById("goLeaderboard");

  function validateForm() {
    const nameOK = nameInput.value.trim().length >= 2;

    const email = emailInput.value.trim();
    const emailOK =
      email.includes("@") &&
      email.includes(".") &&
      email.length >= 5;

    const rulesOK = agreeRules.checked;

    startBtn.disabled = !(nameOK && emailOK && rulesOK);
  }

  nameInput.addEventListener("input", validateForm);
  emailInput.addEventListener("input", validateForm);
  agreeRules.addEventListener("change", validateForm);

  goLeaderboard.onclick = () => {
    window.location.href = "leaderboard.html";
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();

    // Save for quiz + highlight
    sessionStorage.setItem("sb_contest_name", name);
    sessionStorage.setItem("sb_contest_email", email);

    // reset old timer
    sessionStorage.removeItem("sb_contest_start");

    window.location.href = "quiz.html";
  });
});
