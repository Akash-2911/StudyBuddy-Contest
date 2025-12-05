// js/quiz.js

// --- Supabase config (client-side anon key only) ---
const SUPABASE_URL = "https://gzzriudaiaskiqskigey.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6enJpdWRhaWFza2lxc2tpZ2V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxNjEzNzIsImV4cCI6MjA3ODczNzM3Mn0.c2a74KaLRgyw8gecbShPNN124X9RgE0UIEoGdSh_29k";

const sbClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// --- Fixed questions ---

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
    text:
      "What do users earn for completing quizzes and tasks on StudyBuddy?",
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
    text:
      "Which of the following is a technical emerging trend used in StudyBuddy’s development?",
    options: ["Gig Economy", "Artificial Intelligence", "Digital Wellness", "Content Moderation"],
    correctIndex: 1,
  },
  {
    text:
      "Which of these is a non-technical trend that StudyBuddy supports?",
    options: ["Ethical AI", "Blockchain", "Edge Computing", "Biometrics"],
    correctIndex: 0,
  },
  {
    text:
      "What is the benefit of gamification in learning platforms like StudyBuddy?",
    options: [
      "Makes learning longer but more detailed",
      "Helps users earn money directly",
      "Increases engagement and motivation to study",
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

// --- Helper functions ---

function shuffle(array) {
  const arr = array.slice();
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

document.addEventListener("DOMContentLoaded", () => {
  const name = sessionStorage.getItem("sb_contest_name");
  const email = sessionStorage.getItem("sb_contest_email");

  // If someone opens quiz directly, send back to entry
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

  // Timer
  let elapsed = 0;
  timerLabel.textContent = "00:00";

  const existingStart = sessionStorage.getItem("sb_contest_start");
  let start = existingStart ? Number(existingStart) : Date.now();
  if (!existingStart) {
    sessionStorage.setItem("sb_contest_start", String(start));
  }

  const timerId = setInterval(() => {
    elapsed = Math.floor((Date.now() - start) / 1000);
    timerLabel.textContent = formatTime(elapsed);
  }, 1000);

  // Prepare shuffled questions with stable correct text
  const shuffledQuestions = shuffle(QUESTIONS).map((q) => {
    const correctText = q.options[q.correctIndex];
    const shuffledOpts = shuffle(q.options);
    return {
      text: q.text,
      options: shuffledOpts,
      correctText,
    };
  });

  // Render to DOM
  quizForm.innerHTML = "";
  shuffledQuestions.forEach((q, index) => {
    const qDiv = document.createElement("div");
    qDiv.className = "quiz-question";

    const qTitle = document.createElement("div");
    qTitle.className = "quiz-question-title";
    qTitle.textContent = `Q${index + 1}: ${q.text}`;
    qDiv.appendChild(qTitle);

    const list = document.createElement("ul");
    list.className = "options-list";

    q.options.forEach((optText, optIndex) => {
      const li = document.createElement("li");
      li.className = "option-row";

      const input = document.createElement("input");
      input.type = "radio";
      input.name = `q${index}`;
      input.value = optText;

      const label = document.createElement("label");
      label.style.flex = "1";
      label.textContent = `${String.fromCharCode(65 + optIndex)}) ${optText}`;

      li.appendChild(input);
      li.appendChild(label);
      list.appendChild(li);
    });

    qDiv.appendChild(list);
    quizForm.appendChild(qDiv);
  });

  function openModal(message) {
    resultText.innerHTML = message;
    backdrop.classList.add("show");
  }

  function closeModal() {
    backdrop.classList.remove("show");
  }

  closeResult.addEventListener("click", closeModal);
  viewLeaderboard.addEventListener("click", () => {
    window.location.href = "leaderboard.html";
  });

  submitBtn.addEventListener("click", async () => {
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting…";
    clearInterval(timerId);

    // Final elapsed
    elapsed = Math.floor((Date.now() - start) / 1000);
    const totalQuestions = shuffledQuestions.length;

    let correct = 0;
    shuffledQuestions.forEach((q, index) => {
      const chosen = document.querySelector(
        `input[name="q${index}"]:checked`
      );
      if (chosen && chosen.value === q.correctText) {
        correct += 1;
      }
    });

    const score = correct;
    const message = `You answered <strong>${correct}</strong> out of <strong>${totalQuestions}</strong> correctly in <strong>${formatTime(
      elapsed
    )}</strong>.`;

    // Save to Supabase
    try {
      const { error } = await sbClient.from("results").insert({
        name,
        email,
        score,
        time_taken: elapsed,
      });

      if (error) {
        console.error(error);
        openModal(
          `${message}<br><br>⚠️ There was a problem saving your result, but your answers were submitted. Please contact the StudyBuddy team.`
        );
      } else {
        openModal(
          `${message}<br><br>✅ Your result has been saved! Tap “View leaderboard” to see how you rank.`
        );
      }
    } catch (err) {
      console.error(err);
      openModal(
        `${message}<br><br>⚠️ Network error while saving your result. Please show this screen to the StudyBuddy team.`
      );
    } finally {
      submitBtn.textContent = "Submitted";
    }
  });
});
