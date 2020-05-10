import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { promises as fs } from 'fs';
import path from 'path';
import Telegram from '../utils/Telegram';
import dotenv from 'dotenv';

const result = dotenv.config();

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

// createPdf();
const t = {
  '2020': {
    January: {
      W0: [1, 2, 3, 4],
      W1: [5, 6, 7, 8]
    },
    February: {
      W5: [9, 10, 11, 12, 13],
      W7: [14, 15, 16, 17]
    }
  },
  '2019': {
    November: {
      W45: [1, 2, 3, 4],
      W46: [5, 6, 7, 8]
    },
    Decemeber: {
      W51: [9, 10, 11, 12, 13],
      W52: [14, 15, 16, 17]
    }
  }
};

const r = Object.entries(t).map((e) => [e[0], Object.entries(e[1]).map((f) => [f[0], Object.entries(f[1])])]);

console.log(JSON.stringify(r, null, 2));
console.log(r);
