// ==========================================
// quiz.js — Contest Quiz Logic + Supabase
// ==========================================

// --- Supabase config ---
const SUPABASE_URL = "https://gzzriudaiaskiqskigey.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6enJpdWRhaWFza2lxc2tpZ2V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxNjEzNzIsImV4cCI6MjA3ODczNzM3Mn0.c2a74KaLRgyw8gecbShPNN124X9RgE0UIEoGdSh_29k";

const sbClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// --- FIXED QUESTIONS (shuffled per user) ---
const QUESTIONS = [
  {
    text: "What is the main purpose of StudyBuddy?",
    options: [
      "To replace D2L completely",
      "To make studying more engaging and rewarding",
      "To sell educational subscriptions",
      "To provide only video lectures",
    ],
    correctIndex: 1,
  },
  {
    text: "What do users earn for completing quizzes and tasks on StudyBuddy?",
    options: [
      "Only badges",
      "Only XP points",
      "Only StudyBucks",
      "A combination of XP, badges, and StudyBucks",
    ],
    correctIndex: 3,
  },
  {
    text: "Which AI tools did the team use to help build StudyBuddy?",
    options: [
      "ChatGPT and Gemini",
      "Replit and Lovable AI",
      "Midjourney and Canva",
      "Hugging Face and TensorFlow",
    ],
    correctIndex: 1,
  },
  {
    text: "What type of content does StudyBuddy integrate with?",
    options: [
      "YouTube tutorials",
      "D2L course materials",
      "External paid courses",
      "Random online resources",
    ],
    correctIndex: 1,
  },
  {
    text: "How does StudyBuddy plan to generate revenue?",
    options: [
      "By charging students a subscription fee",
      "Through ads on the platform",
      "Through partnerships and institution licensing",
      "By selling data",
    ],
    correctIndex: 2,
  },
  {
    text: "Which technical emerging trend is used in StudyBuddy’s development?",
    options: ["Gig Economy", "Artificial Intelligence", "Digital Wellness", "Content Moderation"],
    correctIndex: 1,
  },
  {
    text: "Which non-technical trend does StudyBuddy support?",
    options: ["Ethical AI", "Blockchain", "Edge Computing", "Biometrics"],
    correctIndex: 0,
  },
  {
    text: "What is the benefit of gamification in StudyBuddy?",
    options: [
      "Makes learning longer but more detailed",
      "Helps users earn money directly",
      "Increases engagement and motivation",
      "Removes the need for instructors",
    ],
    correctIndex: 2,
  },
  {
    text: "Is Iles Wade the best teacher?",
    options: ["No", "Yes"],
    correctIndex: 1,
  },
];

// --- UTILITIES ---
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

// --- MAIN ---
document.addEventListener("DOMContentLoaded", () => {
  const name = sessionStorage.getItem("sb_contest_name");
  const email = sessionStorage.getItem("sb_contest_email");

  // User cannot access quiz without entry page
  if (!name || !email) {
    window.location.replace("index.html");
    return;
  }

  // DOM elements
  const playerLabel = document.getElementById("playerLabel");
  const timerLabel = document.getElementById("timerLabel");
  const quizForm = document.getElementById("quizForm");
  const submitBtn = document.getElementById("submitQuiz");

  const backdrop = document.getElementById("resultBackdrop");
  const resultText = document.getElementById("resultText");
  const closeResult = document.getElementById("closeResult");
  const viewLeaderboard = document.getElementById("viewLeaderboard");

  playerLabel.textContent = `Player: ${name} (${email})`;

  // TIMING LOGIC
  let elapsed = 0;
  let start = Number(sessionStorage.getItem("sb_contest_start"));

  if (!start) {
    start = Date.now();
    sessionStorage.setItem("sb_contest_start", String(start));
  }

  const timerId = setInterval(() => {
    elapsed = Math.floor((Date.now() - start) / 1000);
    timerLabel.textContent = formatTime(elapsed);
  }, 1000);

  // PREP QUESTIONS (shuffle Qs + options)
  const shuffledQuestions = shuffle(QUESTIONS).map((q) => {
    const correctText = q.options[q.correctIndex];
    const shuffledOptions = shuffle(q.options);
    return {
      text: q.text,
      options: shuffledOptions,
      correctText,
    };
  });

  // RENDER QUIZ
  quizForm.innerHTML = "";
  shuffledQuestions.forEach((q, idx) => {
    const wrap = document.createElement("div");
    wrap.className = "quiz-question";

    wrap.innerHTML = `
      <h3>Q${idx + 1}: ${q.text}</h3>
      <ul class="options-list">
        ${q.options
          .map(
            (opt, i) => `
          <li class="option-row">
            <label>
              <input type="radio" name="q${idx}" value="${opt}">
              <span>${String.fromCharCode(65 + i)}) ${opt}</span>
            </label>
          </li>
        `
          )
          .join("")}
      </ul>
    `;

    quizForm.appendChild(wrap);
  });

  // --- MODAL HELPERS ---
  function openModal(msg) {
    resultText.innerHTML = msg;
    backdrop.classList.add("show");
  }
  function closeModal() {
    backdrop.classList.remove("show");
  }

  closeResult.onclick = closeModal;
  viewLeaderboard.onclick = () => (window.location.href = "leaderboard.html");

  // --- SUBMIT QUIZ ---
  submitBtn.addEventListener("click", async () => {
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting…";
    clearInterval(timerId);

    elapsed = Math.floor((Date.now() - start) / 1000);

    let correct = 0;

    shuffledQuestions.forEach((q, idx) => {
      const selected = document.querySelector(`input[name="q${idx}"]:checked`);
      if (selected && selected.value === q.correctText) correct++;
    });

    const msg = `
      You got <strong>${correct}</strong> out of <strong>${shuffledQuestions.length}</strong> correct.<br>
      Time: <strong>${formatTime(elapsed)}</strong>
    `;

    // --- SAVE TO SUPABASE (FIXED TABLE NAME) ---
    try {
      const { error } = await sbClient.from("contest_entries").insert({
        name,
        email,
        score: correct,
        time_taken: elapsed,
      });

      if (error) {
        console.error(error);
        openModal(`${msg}<br><br>⚠️ Error saving result.`);
      } else {
        openModal(
          `${msg}<br><br>✅ Result saved! View the leaderboard to see your rank.`
        );
      }
    } catch (e) {
      console.error(e);
      openModal(`${msg}<br><br>⚠️ Network error.`);
    }

    submitBtn.textContent = "Submitted";
  });
});
