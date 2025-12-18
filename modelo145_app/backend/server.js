const path = require("path");
const express = require("express");
const { PDFDocument } = require("pdf-lib");
const multer = require("multer");
const fs = require("fs");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const upload = multer();

app.use(cors());
app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// Ruta raíz para abrir el formulario
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// Ruta POST para generar PDF
const pdfPath = path.join(__dirname, "MODELO_145.pdf");

app.post("/generate-pdf", upload.none(), async (req, res) => {
  try {
    const existingPdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    const form = pdfDoc.getForm();

    // Ejemplo: asignar datos del frontend
    form.getTextField("nombre").setText(req.body.nombre || "");
    form.getTextField("nif").setText(req.body.nif || "");
    form.getTextField("anyoNacimiento").setText(req.body.anyoNacimiento || "");
    
    // Aquí añadirás todas las preguntas del 145
    // form.getTextField("preguntaX").setText(req.body.preguntaX || "");

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
