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

// --- Questions ---
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
    text: "What do users earn on StudyBuddy?",
    options: [
      "Only badges",
      "Only XP points",
      "Only StudyBucks",
      "A combination of XP, badges, and StudyBucks",
    ],
    correctIndex: 3,
  },
  {
    text: "Which AI tools were used to build StudyBuddy?",
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
      "Charging students a subscription fee",
      "Advertisements",
      "Partnerships and institution licensing",
      "Selling user data",
    ],
    correctIndex: 2,
  },
  {
    text: "Which technical emerging trend applies to StudyBuddy?",
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
      "Makes learning longer",
      "Helps users earn money",
      "Increases engagement and motivation",
      "Removes instructors",
    ],
    correctIndex: 2,
  },
  {
    text: "Is Iles Wade the best teacher?",
    options: ["No", "Yes"],
    correctIndex: 1,
  },
];

// --- helpers ---
function shuffle(arr) {
  arr = arr.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

// =================================================================
// MAIN
// =================================================================
document.addEventListener("DOMContentLoaded", () => {
  const name = sessionStorage.getItem("sb_contest_name");
  const email = sessionStorage.getItem("sb_contest_email");

  if (!name || !email) {
    window.location.replace("index.html");
    return;
  }

  const playerLabel = document.getElementById("playerLabel");
  const timerLabel = document.getElementById("timerLabel");
  const quizForm = document.getElementById("quizForm");
  const submitBtn = document.getElementById("submitQuiz");

  const backdrop = document.getElementById("resultBackdrop");
  const resultText = document.getElementById("resultText");
  const closeResult = document.getElementById("closeResult");
  const viewLeaderboard = document.getElementById("viewLeaderboard");

  playerLabel.textContent = `Player: ${name} (${email})`;

  // ------------------ TIMER ------------------
  let start = Number(sessionStorage.getItem("sb_contest_start"));
  if (!start) {
    start = Date.now();
    sessionStorage.setItem("sb_contest_start", String(start));
  }

  let elapsed = 0;
  timerLabel.textContent = "00:00";

  const timerId = setInterval(() => {
    elapsed = Math.floor((Date.now() - start) / 1000);
    timerLabel.textContent = formatTime(elapsed);
  }, 1000);

  // --------------- SHUFFLE QUESTIONS ---------------
  const shuffledQuestions = shuffle(QUESTIONS).map((q) => {
    return {
      text: q.text,
      correctText: q.options[q.correctIndex],
      options: shuffle(q.options),
    };
  });

  // --------------- RENDER QUESTIONS ----------------
  quizForm.innerHTML = "";
  shuffledQuestions.forEach((q, i) => {
    const block = document.createElement("div");
    block.className = "quiz-question";

    block.innerHTML = `
      <h3>Q${i + 1}: ${q.text}</h3>
      <ul class="options-list">
        ${q.options
          .map(
            (opt, j) => `
          <li>
            <label>
              <input type="radio" name="q${i}" value="${opt}">
              <span>${String.fromCharCode(65 + j)}) ${opt}</span>
            </label>
          </li>`
          )
          .join("")}
      </ul>
    `;

    quizForm.appendChild(block);
  });

  function openModal(msg) {
    resultText.innerHTML = msg;
    backdrop.classList.add("show");
  }
  closeResult.onclick = () => backdrop.classList.remove("show");
  viewLeaderboard.onclick = () => (window.location.href = "leaderboard.html");

  // --------------- SUBMIT QUIZ ----------------
  submitBtn.addEventListener("click", async () => {
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting…";
    clearInterval(timerId);

    elapsed = Math.floor((Date.now() - start) / 1000);

    let correct = 0;

    shuffledQuestions.forEach((q, i) => {
      const selected = document.querySelector(`input[name='q${i}']:checked`);
      if (selected && selected.value === q.correctText) {
        correct++;
      }
    });

    // Save to Supabase (correct table)
    try {
      const { error } = await sbClient.from("contest_scores").insert({
        name,
        email,
        score: correct,
        time_taken: elapsed,
      });

      const summary = `
        You got <strong>${correct}</strong> out of <strong>${shuffledQuestions.length}</strong><br>
        Time: <strong>${formatTime(elapsed)}</strong>
      `;

      if (error) {
        console.error(error);
        openModal(summary + "<br><br>⚠️ Error saving result.");
      } else {
        openModal(
          summary + "<br><br>✅ Your result is saved! View leaderboard to see ranking."
        );
      }
    } catch (e) {
      console.error(e);
      openModal("⚠️ Network error.");
    }

    submitBtn.textContent = "Submitted";
  });
});
