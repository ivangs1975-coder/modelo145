const express = require("express");
const { PDFDocument } = require("pdf-lib");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const upload = multer();

app.use(cors());
app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

// Servir frontend
app.use(express.static(path.join(__dirname, "../frontend")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// PDF editable
const pdfPath = path.join(__dirname, "MODELO_145.pdf");

app.post("/generate-pdf", upload.none(), async (req, res) => {
  try {
    const existingPdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const form = pdfDoc.getForm();

    // Text fields
    form.getTextField("nombre").setText(req.body.nombre || "");
    form.getTextField("nif").setText(req.body.nif || "");
    form.getTextField("anyoNacimiento").setText(req.body.anyoNacimiento || "");

    // Checkbox fields
    if (req.body.minusvalia === "true") form.getCheckBox("minusvalía").check(); else form.getCheckBox("minusvalía").uncheck();
    if (req.body.ascendencia === "true") form.getCheckBox("ascendencia").check(); else form.getCheckBox("ascendencia").uncheck();
    if (req.body.discapacidad === "true") form.getCheckBox("discapacidad").check(); else form.getCheckBox("discapacidad").uncheck();
    if (req.body.familiaNumerosa === "true") form.getCheckBox("familiaNumerosa").check(); else form.getCheckBox("familiaNumerosa").uncheck();
    if (req.body.situacionEspecial === "true") form.getCheckBox("situaciónEspecial").check(); else form.getCheckBox("situaciónEspecial").uncheck();
    if (req.body.otraSituacion === "true") form.getCheckBox("otraSituacion").check(); else form.getCheckBox("otraSituacion").uncheck();

    // Firma
    if (req.body.firma) {
      const [header, data] = req.body.firma.split(",");
      const signatureImage = await pdfDoc.embedPng(data);
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      firstPage.drawImage(signatureImage, {
        x: 400,
        y: 100,
        width: 150,
        height: 50
      });
    }

    const pdfBytes = await pdfDoc.save();
    res.setHeader("Content-Disposition", "attachment; filename=MODELO_145_RELLENO.pdf");
    res.setHeader("Content-Type", "application/pdf");
    res.send(pdfBytes);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error generando PDF");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
