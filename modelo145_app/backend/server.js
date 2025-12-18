const express = require('express');
const multer = require('multer');
const { PDFDocument } = require('pdf-lib');
const app = express();
const upload = multer();
const fs = require('fs');
const path = require('path');

app.use(express.static('../frontend'));

app.post('/generate-pdf', upload.none(), async (req, res) => {
  const pdfPath = path.join(__dirname, '../MODELO_145.pdf');
  const pdfBytes = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();

  // Mapeo de campos
  form.getTextField('NIF').setText(req.body.nif || '');
  form.getTextField('Apellidos y Nombre').setText(req.body.nombre || '');
  form.getTextField('Año de nacimiento').setText(req.body.anio || '');
  if(req.body.sf) form.getCheckBox(req.body.sf).check();
  if(req.body.hijos==='true') form.getCheckBox('04').check();
  if(req.body.hijosDis33==='true') form.getCheckBox('05').check();
  if(req.body.hijosDis65==='true') form.getCheckBox('06').check();
  if(req.body.asc65==='true') form.getCheckBox('07').check();
  if(req.body.ascDis33==='true') form.getCheckBox('08').check();
  if(req.body.percDis33==='true') form.getCheckBox('09').check();
  if(req.body.percDis65==='true') form.getCheckBox('10').check();

  // Firma
  const pngImageBytes = Buffer.from(req.body.firma.split(',')[1], 'base64');
  const pngImage = await pdfDoc.embedPng(pngImageBytes);
  const page = pdfDoc.getPages()[0];
  page.drawImage(pngImage, { x:320, y:90, width:180, height:60 });

  const pdfData = await pdfDoc.save();
  res.setHeader('Content-Type', 'application/pdf');
  res.send(pdfData);
});

app.listen(3000, () => console.log('Servidor corriendo en http://localhost:3000'));
