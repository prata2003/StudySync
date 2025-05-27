let timer;
let duration = 1500; // default 25 mins in seconds
let timeLeft = duration;
let sessions = parseInt(localStorage.getItem("sessions")) || 0;
let isRunning = false;
let isPaused = false;

const timerDisplay = document.getElementById("timer");
const goalInput = document.getElementById("goal");
const goalDisplay = document.getElementById("display-goal");
const sessionCountDisplay = document.getElementById("session-count");
const quoteBox = document.getElementById("quote");
const soundSelect = document.getElementById("sound-select");
const pauseBtn = document.getElementById("pause-btn");

const circle = document.querySelector('.progress-ring__circle');
const radius = circle.r.baseVal.value;
const circumference = 2 * Math.PI * radius;
circle.style.strokeDasharray = circumference;
circle.style.strokeDashoffset = circumference;

const themeSelect = document.getElementById("theme");

// Quotes array
const quotes = [
  "“Do something instead of killing time. Because time is killing you.” – Paulo Coelho",
  "“You don't need more time, you need fewer distractions.” – Unknown",
  "“The way to get started is to quit talking and begin doing.” – Walt Disney",
  "“Focus on being productive instead of busy.” – Tim Ferriss",
  "“Discipline is the bridge between goals and accomplishment.” – Jim Rohn"
];

// Initialize session count
sessionCountDisplay.textContent = sessions;

// Utility: get total seconds from HH:MM:SS inputs
function getTotalSeconds() {
  const h = parseInt(document.getElementById("hours").value) || 0;
  const m = parseInt(document.getElementById("minutes").value) || 0;
  const s = parseInt(document.getElementById("seconds").value) || 0;
  return h * 3600 + m * 60 + s;
}

// Update timer display HH:MM:SS
function updateDisplay() {
  const h = Math.floor(timeLeft / 3600);
  const m = Math.floor((timeLeft % 3600) / 60);
  const s = timeLeft % 60;
  timerDisplay.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

// Update progress ring stroke offset
function updateProgress() {
  const percent = timeLeft / duration;
  const offset = circumference - (percent * circumference);
  circle.style.strokeDashoffset = offset;
}

// Play selected beep sound
function playBeep() {
  const selected = soundSelect.value;
  const sound = document.getElementById(selected);
  if (sound) {
    sound.currentTime = 0;
    sound.play();
  }
}

// Show a random motivational quote
function showNewQuote() {
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  quoteBox.textContent = quote;
}

// Desktop notification helper
function notifyUser(title, message) {
  if (!("Notification" in window)) {
    alert(message);
    return;
  }
  if (Notification.permission === "granted") {
    new Notification(title, { body: message, icon: "https://cdn-icons-png.flaticon.com/512/906/906175.png" });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        new Notification(title, { body: message, icon: "https://cdn-icons-png.flaticon.com/512/906/906175.png" });
      } else {
        alert(message);
      }
    });
  } else {
    alert(message);
  }
}

// Start the timer
function startTimer() {
  if (isRunning || isPaused) return;

  duration = getTotalSeconds();
  if (duration <= 0) {
    alert("Please set a duration greater than 0.");
    return;
  }

  timeLeft = duration;
  isRunning = true;
  goalDisplay.textContent = goalInput.value.trim() || "None";
  updateDisplay();
  updateProgress();

  timer = setInterval(() => {
    if (timeLeft <= 0) {
      clearInterval(timer);
      isRunning = false;
      isPaused = false;
      pauseBtn.textContent = "Pause";
      sessions++;
      localStorage.setItem("sessions", sessions);
      sessionCountDisplay.textContent = sessions;
      showNewQuote();
      playBeep();
      notifyUser("Sprint complete!", "Great job! Your sprint session has ended.");
    } else {
      timeLeft--;
      updateDisplay();
      updateProgress();
    }
  }, 1000);
}

// Pause or resume timer
function pauseTimer() {
  if (!isRunning && !isPaused) return;

  if (!isPaused) {
    clearInterval(timer);
    isPaused = true;
    pauseBtn.textContent = "Resume";
  } else {
    isPaused = false;
    pauseBtn.textContent = "Pause";
    timer = setInterval(() => {
      if (timeLeft <= 0) {
        clearInterval(timer);
        isRunning = false;
        isPaused = false;
        pauseBtn.textContent = "Pause";
        sessions++;
        localStorage.setItem("sessions", sessions);
        sessionCountDisplay.textContent = sessions;
        showNewQuote();
        playBeep();
        notifyUser("Sprint complete!", "Great job! Your sprint session has ended.");
      } else {
        timeLeft--;
        updateDisplay();
        updateProgress();
      }
    }, 1000);
  }
}

// Reset timer to current input values
function resetTimer() {
  clearInterval(timer);
  isRunning = false;
  isPaused = false;
  pauseBtn.textContent = "Pause";
  duration = getTotalSeconds();
  timeLeft = duration;
  updateDisplay();
  updateProgress();
  goalDisplay.textContent = "None";
  quoteBox.textContent = "“Do something instead of killing time. Because time is killing you.” – Paulo Coelho";
}

// Toggle fullscreen for the main container
function toggleFullscreen() {
  const elem = document.getElementById("main-container");
  if (!document.fullscreenElement) {
    elem.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
}

// Load theme from localStorage or default
function loadTheme() {
  const savedTheme = localStorage.getItem("app-theme") || "light";
  document.body.className = savedTheme;
  themeSelect.value = savedTheme;
}

// Change theme on dropdown
themeSelect.addEventListener("change", () => {
  const selectedTheme = themeSelect.value;
  document.body.className = selectedTheme;
  localStorage.setItem("app-theme", selectedTheme);
});

// Event listeners
document.getElementById("start-btn").addEventListener("click", () => {
  startTimer();
});

pauseBtn.addEventListener("click", () => {
  pauseTimer();
});

document.getElementById("reset-btn").addEventListener("click", () => {
  resetTimer();
});

document.getElementById("fullscreen-btn").addEventListener("click", () => {
  toggleFullscreen();
});

// Initialize display on page load
window.onload = () => {
  loadTheme();
  resetTimer();

  // Request notification permission on load if not granted
  if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
  }
};
