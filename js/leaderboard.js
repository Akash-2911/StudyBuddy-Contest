// js/leaderboard.js

const SUPABASE_URL = "https://gzzriudaiaskiqskigey.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6enJpdWRhaWFza2lxc2tpZ2V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxNjEzNzIsImV4cCI6MjA3ODczNzM3Mn0.c2a74KaLRgyw8gecbShPNN124X9RgE0UIEoGdSh_29k";

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const QUESTIONS_COUNT = 9;

// Format seconds as "30s" or "1m 12s"
function formatTimeShort(sec) {
  sec = Number(sec) || 0;
  return sec < 60 ? `${sec}s` : `${Math.floor(sec / 60)}m ${sec % 60}s`;
}

document.addEventListener("DOMContentLoaded", async () => {
  const list = document.getElementById("leaderboardList");
  const refreshBtn = document.getElementById("refreshBtn");
  const footer = document.getElementById("lbFooter");

  const currentEmail = (sessionStorage.getItem("sb_contest_email") || "").toLowerCase();

  // 🥇 🥈 🥉 Medals
  const medals = ["🥇", "🥈", "🥉"];

  async function load() {
    footer.textContent = "Loading leaderboard...";

    const { data, error } = await sb
      .from("contest_scores")
      .select("name, email, score, time_taken")
      .order("score", { ascending: false })
      .order("time_taken", { ascending: true });

    if (error) {
      console.error(error);
      footer.textContent = "Error loading leaderboard.";
      return;
    }

    list.innerHTML = "";

    data.forEach((row, i) => {
      const li = document.createElement("li");
      li.className = "lb-row";

      // Highlight current user
      if (row.email && row.email.toLowerCase() === currentEmail) {
        li.classList.add("lb-you");
      }

      // Medal or rank number
      const rankDisplay = i < 3 ? medals[i] : i + 1;

      li.innerHTML = `
        <div class="lb-left">
          <div class="lb-rank">${rankDisplay}</div>
          <div class="lb-info">
            <div class="lb-name">${row.name}</div>
            <div class="lb-meta">${formatTimeShort(row.time_taken)}</div>
          </div>
        </div>
        <div class="lb-score"><span>${row.score}</span> / ${QUESTIONS_COUNT}</div>
      `;

      list.appendChild(li);
    });

    footer.textContent = "Tap refresh to update standings";
  }

  refreshBtn.addEventListener("click", load);
  load();
});
