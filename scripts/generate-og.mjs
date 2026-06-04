import { createCanvas } from "@napi-rs/canvas";
import { writeFileSync } from "fs";

const W = 1200, H = 630;
const canvas = createCanvas(W, H);
const ctx = canvas.getContext("2d");

// Fond sombre
ctx.fillStyle = "#0f0f1a";
ctx.fillRect(0, 0, W, H);

// Blob bleu gauche
const grad1 = ctx.createRadialGradient(200, 200, 0, 200, 200, 400);
grad1.addColorStop(0, "rgba(43,92,230,0.25)");
grad1.addColorStop(1, "transparent");
ctx.fillStyle = grad1;
ctx.fillRect(0, 0, W, H);

// Blob rouge droite
const grad2 = ctx.createRadialGradient(1000, 450, 0, 1000, 450, 350);
grad2.addColorStop(0, "rgba(226,75,74,0.15)");
grad2.addColorStop(1, "transparent");
ctx.fillStyle = grad2;
ctx.fillRect(0, 0, W, H);

// Logo PAW.
ctx.font = "bold 72px sans-serif";
ctx.fillStyle = "#f0f0fa";
ctx.textAlign = "left";
const pawWidth = ctx.measureText("PAW").width;
ctx.fillText("PAW", 80, 120);
ctx.fillStyle = "#2b5ce6";
ctx.fillText(".", 80 + pawWidth, 120);

// Tagline
ctx.font = "32px sans-serif";
ctx.fillStyle = "rgba(220,220,245,0.65)";
ctx.fillText("Bilan ergonomique gratuit · 5 minutes", 80, 175);

// Ligne séparatrice
ctx.strokeStyle = "rgba(255,255,255,0.08)";
ctx.lineWidth = 1;
ctx.beginPath();
ctx.moveTo(80, 210);
ctx.lineTo(1120, 210);
ctx.stroke();

// Score circle simulé
ctx.beginPath();
ctx.arc(160, 370, 80, 0, Math.PI * 2);
ctx.strokeStyle = "rgba(43,92,230,0.35)";
ctx.lineWidth = 6;
ctx.stroke();

ctx.font = "bold 56px sans-serif";
ctx.fillStyle = "#a8c0ff";
ctx.textAlign = "center";
ctx.fillText("58", 160, 390);

ctx.font = "20px sans-serif";
ctx.fillStyle = "rgba(220,220,245,0.4)";
ctx.fillText("/100", 160, 420);
ctx.textAlign = "left";

// Dimensions — barres
const dims = [
  { label: "Setup", score: 72, color: "#2b5ce6" },
  { label: "Douleurs", score: 38, color: "#e24b4a" },
  { label: "Habitudes", score: 55, color: "#d4622a" },
  { label: "Sommeil", score: 80, color: "#2d6a4f" },
  { label: "Nutrition", score: 45, color: "#7c3aed" },
];

const barX = 320, barY = 270, barW = 700, barH = 8, barGap = 52;

ctx.font = "22px sans-serif";
dims.forEach((d, i) => {
  const y = barY + i * barGap;

  // Label
  ctx.fillStyle = "rgba(220,220,245,0.6)";
  ctx.textAlign = "left";
  ctx.fillText(d.label, barX, y + barH);

  // Track
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.beginPath();
  ctx.roundRect(barX + 120, y, barW, barH, 4);
  ctx.fill();

  // Fill
  ctx.fillStyle = d.color;
  ctx.beginPath();
  ctx.roundRect(barX + 120, y, (barW * d.score) / 100, barH, 4);
  ctx.fill();

  // Score
  ctx.fillStyle = d.color;
  ctx.textAlign = "right";
  ctx.fillText(String(d.score), barX + 120 + barW + 40, y + barH);
});

ctx.textAlign = "left";

// Badges
const badges = [
  { label: "✓ 100% gratuit",      x: 80,  bg: "rgba(43,92,230,0.15)",  border: "rgba(43,92,230,0.35)",  color: "#a8c0ff",  w: 200 },
  { label: "✓ Sans inscription",  x: 300, bg: "rgba(45,106,79,0.15)",  border: "rgba(45,106,79,0.35)",  color: "#74c69d",  w: 260 },
  { label: "✓ Résultats immédiats", x: 580, bg: "rgba(124,58,237,0.15)", border: "rgba(124,58,237,0.35)", color: "#a78bfa", w: 300 },
];

badges.forEach((b) => {
  ctx.fillStyle = b.bg;
  ctx.beginPath();
  ctx.roundRect(b.x, 520, b.w, 50, 25);
  ctx.fill();
  ctx.strokeStyle = b.border;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.font = "bold 22px sans-serif";
  ctx.fillStyle = b.color;
  ctx.textAlign = "center";
  ctx.fillText(b.label, b.x + b.w / 2, 551);
});

ctx.textAlign = "left";

// URL
ctx.font = "20px sans-serif";
ctx.fillStyle = "rgba(220,220,245,0.25)";
ctx.textAlign = "right";
ctx.fillText("posture-at-work.vercel.app", W - 80, H - 30);

// Export
const buffer = canvas.toBuffer("image/png");
writeFileSync("public/og-image.png", buffer);
console.log("✅ OG image générée : public/og-image.png");
