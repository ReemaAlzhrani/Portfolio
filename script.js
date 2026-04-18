const canvas = document.getElementById("waveCanvas");
const ctx = canvas.getContext("2d");
const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".nav");

let width = 0;
let height = 0;
let time = 0;
let mouseX = 0.5;
let mouseY = 0.5;
const dpr = Math.min(window.devicePixelRatio || 1, 2);

function resizeCanvas() {
  width = window.innerWidth;
  height = window.innerHeight;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawBackgroundGlow() {
  const base = ctx.createLinearGradient(0, 0, width, height);
  base.addColorStop(0, "#4b2f80");
  base.addColorStop(0.42, "#21143f");
  base.addColorStop(1, "#130c2a");

  ctx.fillStyle = base;
  ctx.fillRect(0, 0, width, height);

  const glow = ctx.createRadialGradient(
    width * 0.72,
    height * 0.52,
    0,
    width * 0.72,
    height * 0.52,
    width * 0.45
  );
  glow.addColorStop(0, "rgba(230, 215, 255, 0.14)");
  glow.addColorStop(0.55, "rgba(116, 91, 156, 0.14)");
  glow.addColorStop(1, "rgba(116, 91, 156, 0)");

  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);
}

function marbleY(x, yBase, amplitude, offset, speedFactor) {
  const normalized = x / width;
  const mouseDrift =
    (mouseY - 0.5) * 36 + Math.sin(mouseX * Math.PI * 2 + offset) * 10;

  return (
    height * yBase +
    Math.sin(normalized * 3.6 + time * speedFactor + offset) * amplitude +
    Math.sin(normalized * 8.4 - time * speedFactor * 0.45 + offset * 1.7) *
      (amplitude * 0.34) +
    Math.cos(normalized * 14 + offset) * (amplitude * 0.12) +
    mouseDrift
  );
}

function drawMarbleRibbon(offset, yBase, amplitude, thickness, alpha, speedFactor) {
  const top = [];
  const bottom = [];

  for (let x = -80; x <= width + 80; x += 18) {
    const center = marbleY(x, yBase, amplitude, offset, speedFactor);
    const normalized = x / width;
    const widthVariation =
      Math.sin(normalized * 5 + offset + time * 0.25) * thickness * 0.18;

    top.push({ x, y: center - thickness / 2 - widthVariation });
    bottom.push({ x, y: center + thickness / 2 + widthVariation });
  }

  const gradient = ctx.createLinearGradient(0, height * (yBase - 0.2), width, height);
  gradient.addColorStop(0, `rgba(112, 91, 151, ${alpha * 0.55})`);
  gradient.addColorStop(0.42, `rgba(224, 208, 250, ${alpha})`);
  gradient.addColorStop(0.72, `rgba(130, 108, 166, ${alpha * 0.72})`);
  gradient.addColorStop(1, `rgba(235, 222, 255, ${alpha * 0.4})`);

  ctx.save();
  ctx.filter = "blur(12px)";
  ctx.beginPath();
  ctx.moveTo(top[0].x, top[0].y);
  top.forEach((point) => ctx.lineTo(point.x, point.y));
  bottom.reverse().forEach((point) => ctx.lineTo(point.x, point.y));
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.restore();
}

function drawMarbleVein(offset, yBase, amplitude, lineWidth, alpha, speedFactor) {
  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, `rgba(239, 225, 255, 0)`);
  gradient.addColorStop(0.25, `rgba(239, 225, 255, ${alpha})`);
  gradient.addColorStop(0.62, `rgba(167, 143, 202, ${alpha * 0.75})`);
  gradient.addColorStop(1, `rgba(239, 225, 255, 0)`);

  ctx.save();
  ctx.beginPath();
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = gradient;
  ctx.lineCap = "round";
  ctx.shadowBlur = 20;
  ctx.shadowColor = `rgba(235, 221, 255, ${alpha})`;

  for (let x = -80; x <= width + 80; x += 8) {
    const y =
      marbleY(x, yBase, amplitude, offset, speedFactor) +
      Math.sin(x * 0.018 + offset) * 8;

    if (x === -80) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.stroke();
  ctx.restore();
}

function drawMarbleTexture() {
  drawMarbleRibbon(0.35, 0.7, 95, 210, 0.2, 0.16);
  drawMarbleRibbon(1.6, 0.78, 115, 260, 0.18, 0.13);
  drawMarbleRibbon(2.7, 0.88, 90, 190, 0.15, 0.18);
  drawMarbleRibbon(4.1, 0.28, 70, 130, 0.12, 0.1);

  drawMarbleVein(0.85, 0.68, 95, 3, 0.18, 0.16);
  drawMarbleVein(1.9, 0.78, 110, 2, 0.14, 0.13);
  drawMarbleVein(3.2, 0.9, 90, 2, 0.1, 0.18);
}

function animate() {
  time += 0.01;
  ctx.clearRect(0, 0, width, height);

  drawBackgroundGlow();
  drawMarbleTexture();

  requestAnimationFrame(animate);
}

window.addEventListener("mousemove", (e) => {
  mouseX = e.clientX / width;
  mouseY = e.clientY / height;
});

window.addEventListener("mouseleave", () => {
  mouseX = 0.5;
  mouseY = 0.5;
});

window.addEventListener("resize", resizeCanvas);

resizeCanvas();
animate();

if (navToggle && nav) {
  const closeMenu = () => {
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  };

  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) {
      closeMenu();
    }
  });
}
