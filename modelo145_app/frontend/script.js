// Navegación entre pantallas
function go(n){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById('screen'+n).classList.add('active');
}
document.getElementById('start').onclick=()=>go(2);

// Canvas para firma
const canvas=document.getElementById('sign');
const ctx=canvas.getContext('2d');
let draw=false;
canvas.width=canvas.offsetWidth;
canvas.height=canvas.offsetHeight;
canvas.addEventListener('pointerdown', e => { draw=true; ctx.beginPath(); ctx.moveTo(e.offsetX,e.offsetY); });
canvas.addEventListener('pointermove', e => { if(draw){ctx.lineTo(e.offsetX,e.offsetY); ctx.stroke();} });
canvas.addEventListener('pointerup', ()=>draw=false);
function clearSign(){ ctx.clearRect(0,0,canvas.width,canvas.height); }

// Generar PDF a través del backend
document.getElementById('genPDF').addEventListener('click', async () => {
  const formData = new FormData();
  formData.append('nif', document.getElementById('nif').value);
  formData.append('nombre', document.getElementById('nombre').value);
  formData.append('anio', document.getElementById('anio').value);
  formData.append('sf', document.querySelector('input[name="sf"]:checked')?.value || '');
  formData.append('hijos', document.getElementById('hijos').checked);
  formData.append('numHijos', document.getElementById('numHijos').value);
  formData.append('hijosDis33', document.getElementById('hijosDis33').checked);
  formData.append('hijosDis65', document.getElementById('hijosDis65').checked);
  formData.append('asc65', document.getElementById('asc65').checked);
  formData.append('ascDis33', document.getElementById('ascDis33').checked);
  formData.append('percDis33', document.getElementById('percDis33').checked);
  formData.append('percDis65', document.getElementById('percDis65').checked);
  formData.append('firma', canvas.toDataURL());

  const res = await fetch('/generate-pdf', { method: 'POST', body: formData });
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Modelo_145.pdf';
  a.click();
  URL.revokeObjectURL(url);
});
