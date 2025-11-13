// entry.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("entryForm");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const firstName = document.getElementById("firstName").value.trim();
    const email = document.getElementById("email").value.trim();
    const agree = document.getElementById("agree").checked;

    if (!firstName || !email || !agree) {
      alert("Please fill your name, email and agree to the rules.");
      return;
    }

    // Simple session ID for this attempt
    const sessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // Start time (we’ll subtract on quiz submit)
    const startedAt = Date.now();

    // Save basic info in localStorage so quiz + leaderboard can use it
    localStorage.setItem(
      "sb_contest_player",
      JSON.stringify({ firstName, email, sessionId, startedAt })
    );

    // Redirect to quiz page, also pass sessionId in URL if needed
    const params = new URLSearchParams({ sessionId });
    window.location.href = `quiz.html?${params.toString()}`;
  });
});
