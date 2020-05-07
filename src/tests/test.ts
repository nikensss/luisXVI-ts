import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { promises as fs } from 'fs';
import path from 'path';
import Telegram from '../utils/Telegram';

async function createPdf() {
  const pdfDoc: PDFDocument = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const fontSize = 24;

  page.drawText('Hola, Àlex! Ja puc fer PDFs amb TypeScript!', {
    x: 50,
    y: height - 4 * fontSize,
    size: fontSize,
    font: timesRomanFont,
    color: rgb(0, 0.53, 0.71)
  });
  page.drawText('Al final he hagut de fer servir una altra llibreria.', {
    x: 50,
    y: height - 9.2 * fontSize,
    size: fontSize,
    font: timesRomanFont,
    color: rgb(0, 0.53, 0.71)
  });

  const pdfBytes: Uint8Array = await pdfDoc.save();

  await fs.writeFile(path.join(__dirname, 'newpdf.pdf'), pdfBytes);

  Telegram.getInstance().sendDocument(path.join(__dirname, 'newpdf.pdf'));
}

createPdf();
