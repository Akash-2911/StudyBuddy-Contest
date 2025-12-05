// js/leaderboard.js

const LB_SUPABASE_URL = "https://gzzriudaiaskiqskigey.supabase.co";
const LB_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6enJpdWRhaWFza2lxc2tpZ2V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxNjEzNzIsImV4cCI6MjA3ODczNzM3Mn0.c2a74KaLRgyw8gecbShPNN124X9RgE0UIEoGdSh_29k";

const lbClient = window.supabase.createClient(
  LB_SUPABASE_URL,
  LB_SUPABASE_ANON_KEY
);

function formatTimeShort(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

document.addEventListener("DOMContentLoaded", () => {
  const listEl = document.getElementById("leaderboardList");
  const refreshBtn = document.getElementById("refreshBtn");
  const footer = document.getElementById("lbFooter");

  const currentEmail = (
    sessionStorage.getItem("sb_contest_email") || ""
  ).toLowerCase();

  async function loadLeaderboard() {
    footer.textContent = "Loading results…";

    try {
      const { data, error } = await lbClient
        .from("results")
        .select("name, email, score, time_taken, created_at")
        .order("score", { ascending: false })
        .order("time_taken", { ascending: true })
        .order("created_at", { ascending: true })
        .limit(50);

      if (error) {
        console.error(error);
        footer.textContent = "Could not load leaderboard.";
        return;
      }

      if (!data || data.length === 0) {
        listEl.innerHTML = "";
        footer.textContent = "No entries yet. Be the first!";
        return;
      }

      listEl.innerHTML = "";
      data.forEach((row, idx) => {
        const li = document.createElement("li");
        li.className = "lb-row";

        if (row.email && row.email.toLowerCase() === currentEmail) {
          li.classList.add("lb-you");
        }

        const left = document.createElement("div");
        left.className = "lb-left";

        const rankBadge = document.createElement("div");
        rankBadge.className = "lb-rank";
        rankBadge.textContent = idx + 1;

        const info = document.createElement("div");
        const nameEl = document.createElement("div");
        nameEl.className = "lb-name";
        nameEl.textContent = row.name || "Player";

        const meta = document.createElement("div");
        meta.className = "lb-meta";
        meta.textContent = `${(row.email || "").split("@")[0]} • ${formatTimeShort(
          row.time_taken || 0
        )}`;

        info.appendChild(nameEl);
        info.appendChild(meta);

        left.appendChild(rankBadge);
        left.appendChild(info);

        const score = document.createElement("div");
        score.className = "lb-score";
        score.innerHTML = `<span>${row.score ?? 0}</span> / ${QUESTIONS_COUNT}`;

        li.appendChild(left);
        li.appendChild(score);
        listEl.appendChild(li);
      });

      footer.textContent = "Tap refresh to see latest standings.";
    } catch (err) {
      console.error(err);
      footer.textContent = "Network error loading leaderboard.";
    }
  }

  // Need total questions for "/ N" display
  const QUESTIONS_COUNT = 9;

  refreshBtn.addEventListener("click", loadLeaderboard);

  loadLeaderboard();
});
