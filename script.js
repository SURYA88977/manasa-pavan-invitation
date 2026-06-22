const weddingDate = new Date("2026-06-24T09:43:00+05:30");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.body.classList.add("loading");

window.addEventListener("load", () => {
  window.setTimeout(() => {
    document.getElementById("loader")?.classList.add("hidden");
    document.body.classList.remove("loading");
  }, 650);
});

const progress = document.getElementById("scrollProgress");
const updateProgress = () => {
  const height = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = height > 0 ? window.scrollY / height : 0;
  progress.style.width = `${Math.min(ratio * 100, 100)}%`;
};

window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("visible");
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });

document.querySelectorAll(".reveal").forEach((element, index) => {
  if (element.closest(".stagger-group")) {
    element.style.transitionDelay = `${(index % 5) * 90}ms`;
  }
  revealObserver.observe(element);
});

const audio = document.getElementById("weddingAudio");
const musicToggle = document.getElementById("musicToggle");

musicToggle.addEventListener("click", async () => {
  try {
    if (audio.paused) {
      await audio.play();
      musicToggle.classList.add("playing");
      musicToggle.setAttribute("aria-pressed", "true");
      musicToggle.setAttribute("aria-label", "Pause background music");
      musicToggle.querySelector(".music-label").textContent = "Pause";
    } else {
      audio.pause();
      musicToggle.classList.remove("playing");
      musicToggle.setAttribute("aria-pressed", "false");
      musicToggle.setAttribute("aria-label", "Play background music");
      musicToggle.querySelector(".music-label").textContent = "Music";
    }
  } catch {
    musicToggle.querySelector(".music-label").textContent = "Tap again";
  }
});

const countdownNodes = {
  days: document.getElementById("days"),
  hours: document.getElementById("hours"),
  minutes: document.getElementById("minutes"),
  seconds: document.getElementById("seconds")
};

function pad(value) {
  return String(value).padStart(2, "0");
}

function updateCountdown() {
  const diff = weddingDate.getTime() - Date.now();

  if (diff <= 0) {
    countdownNodes.days.textContent = "00";
    countdownNodes.hours.textContent = "00";
    countdownNodes.minutes.textContent = "00";
    countdownNodes.seconds.textContent = "00";
    return;
  }

  const seconds = Math.floor(diff / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  countdownNodes.days.textContent = pad(days);
  countdownNodes.hours.textContent = pad(hours);
  countdownNodes.minutes.textContent = pad(minutes);
  countdownNodes.seconds.textContent = pad(remainingSeconds);
}

updateCountdown();
window.setInterval(updateCountdown, 1000);

function createPetals() {
  const layer = document.getElementById("petalLayer");
  const symbols = ["✦", "✽", "✼", "❀"];
  const count = window.innerWidth < 700 ? 18 : 30;

  for (let i = 0; i < count; i += 1) {
    const petal = document.createElement("span");
    petal.className = "petal";
    petal.textContent = symbols[i % symbols.length];
    petal.style.left = `${Math.random() * 100}vw`;
    petal.style.fontSize = `${0.7 + Math.random() * 1.3}rem`;
    petal.style.animationDuration = `${8 + Math.random() * 8}s`;
    petal.style.animationDelay = `${Math.random() * -12}s`;
    petal.style.setProperty("--petal-x", `${(Math.random() - 0.5) * 12}rem`);
    layer.appendChild(petal);
  }
}

function createParticles() {
  const layer = document.getElementById("particleLayer");
  const count = window.innerWidth < 700 ? 22 : 38;

  for (let i = 0; i < count; i += 1) {
    const particle = document.createElement("span");
    particle.className = "particle";
    particle.style.left = `${Math.random() * 100}vw`;
    particle.style.animationDuration = `${7 + Math.random() * 9}s`;
    particle.style.animationDelay = `${Math.random() * -12}s`;
    particle.style.setProperty("--particle-x", `${(Math.random() - 0.5) * 8}rem`);
    layer.appendChild(particle);
  }
}

if (!prefersReducedMotion) {
  createPetals();
  createParticles();
}

const parallaxItems = document.querySelectorAll("[data-parallax]");
let ticking = false;

function updateParallax() {
  const y = window.scrollY;
  parallaxItems.forEach((item) => {
    const speed = Number(item.dataset.parallax || 0);
    item.style.translate = `0 ${y * speed}px`;
  });
  ticking = false;
}

window.addEventListener("scroll", () => {
  if (prefersReducedMotion || ticking) return;
  window.requestAnimationFrame(updateParallax);
  ticking = true;
}, { passive: true });

const canvas = document.getElementById("fireworksCanvas");
const ctx = canvas.getContext("2d");
let fireworksStarted = false;
let sparks = [];

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = rect.width * ratio;
  canvas.height = rect.height * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function launchFirework() {
  const rect = canvas.getBoundingClientRect();
  const x = rect.width * (0.2 + Math.random() * 0.6);
  const y = rect.height * (0.2 + Math.random() * 0.36);
  const pieces = 28;

  for (let i = 0; i < pieces; i += 1) {
    const angle = (Math.PI * 2 * i) / pieces;
    const speed = 1.2 + Math.random() * 2.4;
    sparks.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 58,
      alpha: 1
    });
  }
}

function renderFireworks() {
  const rect = canvas.getBoundingClientRect();
  ctx.clearRect(0, 0, rect.width, rect.height);
  sparks = sparks.filter((spark) => spark.life > 0);

  sparks.forEach((spark) => {
    spark.x += spark.vx;
    spark.y += spark.vy;
    spark.vy += 0.025;
    spark.life -= 1;
    spark.alpha = spark.life / 58;

    ctx.beginPath();
    ctx.arc(spark.x, spark.y, 1.8, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 221, 112, ${spark.alpha})`;
    ctx.shadowColor = "rgba(212, 175, 55, 0.8)";
    ctx.shadowBlur = 12;
    ctx.fill();
  });

  if (sparks.length) {
    window.requestAnimationFrame(renderFireworks);
  } else {
    ctx.shadowBlur = 0;
  }
}

const fireworkObserver = new IntersectionObserver((entries) => {
  if (prefersReducedMotion || fireworksStarted || !entries.some((entry) => entry.isIntersecting)) return;
  fireworksStarted = true;
  resizeCanvas();
  let launches = 0;
  const interval = window.setInterval(() => {
    launchFirework();
    renderFireworks();
    launches += 1;
    if (launches >= 4) window.clearInterval(interval);
  }, 450);
}, { threshold: 0.45 });

fireworkObserver.observe(document.getElementById("details"));
window.addEventListener("resize", resizeCanvas);

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
  });
});
