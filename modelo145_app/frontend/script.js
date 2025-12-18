const form = document.getElementById("modelo145Form");
const canvas = documuent.getElementById("firmaCanvas");
const ctx = canvas.getContext("2d");
let drawing = false;

canvas.addEventListener("mousedown", () => drawing = true);
canvas.addEventListener("mouseup", () => drawing = false);
canvas.addEventListener("mouseout", () => drawing = false);
canvas.addEventListener("mousemove", draw);

document.getElementById("clearFirma").addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

function draw(e){
  if(!drawing) return;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.strokeStyle = "black";

  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = {};
  new FormData(form).forEach((value, key) => {
    formData[key] = value;
  });

  // Firma como PNG
  formData.firma = canvas.toDataURL("image/png");

  const response = await fetch("https://TU-SERVICIO-RENDER.onrender.com/generate-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData)
  });

  if(response.ok){
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "MODELO_145_RELLENO.pdf";
    a.click();
    window.URL.revokeObjectURL(url);
  } else {
    alert("Error generando PDF");
  }
});

