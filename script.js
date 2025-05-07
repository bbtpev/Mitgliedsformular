const form = document.getElementById('membership-form');
const canvas = document.getElementById('signature-pad');
const clearButton = document.getElementById('clear');
const signaturePad = new SignaturePad(canvas);

clearButton.addEventListener('click', () => signaturePad.clear());

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const formData = Object.fromEntries(data.entries());

  const { PDFDocument, rgb } = PDFLib;
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);
  const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);

  page.drawText('Mitgliedsanmeldung', { x: 50, y: 760, size: 18, font });

  let y = 720;
  for (const [key, value] of Object.entries(formData)) {
    page.drawText(`${key}: ${value}`, { x: 50, y, size: 12, font });
    y -= 20;
  }

  if (!signaturePad.isEmpty()) {
    const pngDataUrl = signaturePad.toDataURL();
    const pngImageBytes = await fetch(pngDataUrl).then(res => res.arrayBuffer());
    const pngImage = await pdfDoc.embedPng(pngImageBytes);
    page.drawImage(pngImage, { x: 50, y: y - 100, width: 200, height: 75 });
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });

  const formDataUpload = new FormData();
  formDataUpload.append('file', blob, 'mitgliedsantrag.pdf');

  const uploadUrl = 'DEINE_GOOGLE_APPS_SCRIPT_URL'; // <-- hier einfügen
  const response = await fetch(uploadUrl, { method: 'POST', body: formDataUpload });
  alert('Formular wurde hochgeladen!');
});
