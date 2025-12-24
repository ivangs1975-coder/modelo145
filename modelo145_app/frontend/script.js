const form = document.getElementById("modelo145Form");
const canvas = document.getElementById("firmaCanvas");
const ctx = canvas.getContext("2d");
let drawing = false;

canvas.addEventListener("mousedown", ()=>drawing=true);
canvas.addEventListener("mouseup", ()=>drawing=false);
canvas.addEventListener("mouseout", ()=>drawing=false);
canvas.addEventListener("mousemove", draw);

document.getElementById("clearFirma").addEventListener("click", ()=>{
  ctx.clearRect(0,0,canvas.width,canvas.height);
});

function draw(e){
  if(!drawing) return;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.strokeStyle = "black";
  ctx.lineTo(e.offsetX,e.offsetY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(e.offsetX,e.offsetY);
}

// Multilenguaje
const langSelector = document.getElementById("languageSelector");
langSelector.addEventListener("change", ()=>setLanguage(langSelector.value));
function setLanguage(lang){
  document.querySelector("h1").innerText = translations[lang].title;
  document.querySelector("label[for='nombre']").innerText = translations[lang].nombre;
  document.querySelector("label[for='nif']").innerText = translations[lang].nif;
  document.querySelector("label[for='anyoNacimiento']").innerText = translations[lang].nacimiento;
  document.querySelector("button[type='submit']").innerText = translations[lang].generar;
}
setLanguage("es");

// Enviar datos al backend
form.addEventListener("submit", async (e)=>{
  e.preventDefault();
  const formData = {};
  new FormData(form).forEach((value,key)=>{
    const elem = document.querySelector(`[name="${key}"]`);
    if(elem.type==="checkbox") formData[key] = elem.checked ? "true" : "false";
    else formData[key] = value;
  });
  formData.firma = canvas.toDataURL("image/png");

  const response = await fetch("https://TU-SERVICIO-RENDER.onrender.com/generate-pdf",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(formData)
  });

  if(response.ok){
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "MODELO_145_RELLENO.pdf";
    a.click();
    window.URL.revokeObjectURL(url);
  } else alert("Error generando PDF");
});
