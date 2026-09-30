import { jsPDF } from 'jspdf';

// Mirrors ReportComponent.generatePdf()/generatePdfPrint() exactly — same jsPDF `.html()` +
// html2canvas options, same width/scale/margins. This renders the LIVE DOM node (the hidden
// #pdf-content clone), not a server-generated PDF — see D:\InetZ\DECARB_REPORT_ANALYSIS.md A.5.
const PDF_OPTIONS = {
  margin: [20, 12, 20, 12],
  autoPaging: 'text',
  html2canvas: {
    allowTaint: true,
    scale: 0.58,
    scrollX: 0,
    scrollY: -window.scrollY,
    letterRendering: true,
    logging: false,
  },
  width: 1290,
};

/** Renders `element` to a PDF and triggers a file download named GHG-Report.pdf. */
export function downloadReportPdf(element) {
  return new Promise((resolve, reject) => {
    if (!element) {
      reject(new Error('PDF content not found'));
      return;
    }
    const pdf = new jsPDF('p', 'pt', 'a4');
    pdf.html(element, {
      ...PDF_OPTIONS,
      windowWidth: element.scrollWidth,
      callback: (pdfInstance) => {
        pdfInstance.save('GHG-Report.pdf');
        resolve();
      },
    });
  });
}

/** Renders `element` to a PDF, opens it in a new tab, and calls window.print() on it. */
export function printReportPdf(element) {
  return new Promise((resolve, reject) => {
    if (!element) {
      reject(new Error('PDF content not found'));
      return;
    }
    const pdf = new jsPDF('p', 'pt', 'a4');
    pdf.html(element, {
      ...PDF_OPTIONS,
      windowWidth: element.scrollWidth,
      callback: (pdfInstance) => {
        const blobUrl = pdfInstance.output('bloburl');
        const printWindow = window.open(blobUrl, '_blank');
        resolve();
        setTimeout(() => {
          if (printWindow) {
            printWindow.focus();
            printWindow.print();
          }
        }, 1000);
      },
    });
  });
}
