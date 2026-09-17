import { NextResponse } from 'next/server';
import jsPDF from 'jspdf';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();
    const LM = 14;
    const RM = 14;
    const CW = W - LM - RM;
    const BLUE: [number, number, number] = [10, 117, 187];
    const DARK: [number, number, number] = [30, 30, 30];
    const GRAY: [number, number, number] = [100, 100, 100];
    const LIGHT: [number, number, number] = [245, 245, 245];
    let y = 0;

    function setFont(style: 'normal' | 'bold' = 'normal', size = 9) {
      doc.setFont('helvetica', style);
      doc.setFontSize(size);
    }

    function checkPage(needed: number) {
      if (y + needed > 280) {
        doc.addPage();
        y = 14;
      }
    }

    function drawHeader() {
      doc.setFillColor(...BLUE);
      doc.rect(0, 0, W, 28, 'F');

      doc.setFillColor(255, 255, 255);
      doc.roundedRect(LM, 5, 10, 10, 2, 2, 'F');
      setFont('bold', 14);
      doc.setTextColor(...BLUE);
      doc.text('K', LM + 5, 12, { align: 'center' });

      setFont('bold', 13);
      doc.setTextColor(255, 255, 255);
      doc.text('Online Nephrologist / Kidney Care Centre', LM + 14, 10);

      setFont('normal', 7);
      doc.setTextColor(220, 230, 240);
      doc.text('Dr Rajesh Goel | MBBS, DNB Internal Medicine, DNB Nephrology, Fellow Kidney Transplant Medicine', LM + 14, 14);
      doc.text('Reg. No: DMC/R/734 | 20+ Years Experience | www.onlinenephrologist.com', LM + 14, 18);

      y = 34;
    }

    function drawTitle() {
      doc.setFillColor(...BLUE);
      doc.roundedRect(LM, y, CW, 10, 2, 2, 'F');
      setFont('bold', 12);
      doc.setTextColor(255, 255, 255);
      doc.text('VACCINATION RECORD', W / 2, y + 4.5, { align: 'center' });
      setFont('normal', 6.5);
      doc.text('Recommended vaccinations for chronic kidney disease patients', W / 2, y + 8, { align: 'center' });
      y += 14;
    }

    function drawNote() {
      doc.setFillColor(255, 248, 225);
      doc.roundedRect(LM, y, CW, 14, 2, 2, 'F');
      doc.setDrawColor(249, 168, 37);
      doc.setLineWidth(0.3);
      doc.roundedRect(LM, y, CW, 14, 2, 2, 'S');
      setFont('bold', 7);
      doc.setTextColor(200, 80, 0);
      doc.text('Above doses applicable in case of chronic kidney disease', LM + 3, y + 4);
      setFont('normal', 6.5);
      doc.setTextColor(90, 60, 30);
      doc.text('1. Anti HBs antibody titres to be done every 6 months.  2. Protective titres for kidney disease patients are >100 miu/ml.', LM + 3, y + 8.5);
      y += 18;
    }

    function sectionTitle(num: string, title: string, subtitle?: string) {
      checkPage(12);
      setFont('bold', 9);
      doc.setTextColor(...DARK);
      doc.text(`${num}. ${title}`, LM + 2, y + 4.5);
      if (subtitle) {
        setFont('normal', 7);
        doc.setTextColor(...GRAY);
        doc.text(subtitle, LM + 2, y + 8.5);
      }
      y += subtitle ? 11 : 7;
    }

    function infoLine(text: string) {
      setFont('normal', 7.5);
      doc.setTextColor(...DARK);
      doc.text(text, LM + 4, y);
      y += 3.5;
    }

    function drawTable(headers: string[], rows: string[][]) {
      checkPage(rows.length * 5 + 8);
      const colWidths: number[] = [];
      const totalFlexCols = headers.length - 1;
      const fixedLastCol = 40;
      const flexWidth = (CW - 8 - fixedLastCol) / totalFlexCols;
      for (let i = 0; i < headers.length; i++) {
        colWidths.push(i === headers.length - 1 ? fixedLastCol : flexWidth);
      }

      doc.setFillColor(...LIGHT);
      doc.rect(LM + 4, y, CW - 8, 5, 'F');
      setFont('bold', 6.5);
      doc.setTextColor(60, 60, 60);
      let x = LM + 4;
      for (let i = 0; i < headers.length; i++) {
        doc.text(headers[i], x + 1.5, y + 3.5);
        x += colWidths[i];
      }
      y += 5;

      setFont('normal', 7);
      for (let r = 0; r < rows.length; r++) {
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.1);
        doc.line(LM + 4, y, LM + 4 + (CW - 8), y);
        if (r % 2 === 0) {
          doc.setFillColor(250, 250, 252);
          doc.rect(LM + 4, y, CW - 8, 5, 'F');
        }
        doc.setTextColor(...DARK);
        x = LM + 4;
        for (let c = 0; c < rows[r].length; c++) {
          if (c === rows[r].length - 1) doc.setTextColor(170, 170, 170);
          else doc.setTextColor(...DARK);
          doc.text(rows[r][c], x + 1.5, y + 3.5);
          x += colWidths[c];
        }
        y += 5;
      }
      y += 3;
    }

    function drawEmergency() {
      checkPage(35);
      setFont('bold', 9);
      doc.setTextColor(198, 40, 40);
      doc.text('Emergency Medicine for Adults with Kidney Diseases', LM + 2, y + 4);
      setFont('normal', 6.5);
      doc.setTextColor(...GRAY);
      doc.text('Aapatkalin gurda rogiyon ke liye', LM + 2, y + 8);
      y += 11;

      const meds = [
        ['1. FEVER (Bukhar)', 'Tab. Dolo 650 mg / Tab Crocin 500mg SOS'],
        ['2. PAIN (Dard)', 'Tab. Ultracet 37 mg / Tab. Dolo 650 mg / Cap Tramazac P 37.5 mg SOS'],
        ['3. VOMITING (Ulti)', 'Tab. Emset 4mg / Tab Zofer MD 4mg / Tab. Vomikind 4 mg SOS'],
        ['4. RENAL COLIC', 'Tab. Drotin DS/ Drotinkind 80 mg / DVN Plus sos, Inj. Tramadol 100 mg IMI SOS'],
        ['5. SWELLING (Soojan)', 'Tab. Tor 20 mg/ Tab. Dtor 20 mg / Tab. Torget 20 mg SOS'],
      ];

      for (const [name, dose] of meds) {
        doc.setFillColor(248, 248, 248);
        doc.roundedRect(LM + 4, y, CW - 8, 5.5, 1, 1, 'F');
        setFont('bold', 7);
        doc.setTextColor(...DARK);
        doc.text(name, LM + 6, y + 3.5);
        setFont('normal', 7);
        doc.setTextColor(80, 80, 80);
        doc.text(dose, LM + 52, y + 3.5);
        y += 7;
      }
      y += 2;
    }

    function drawFooter() {
      const footerY = 275;
      doc.setDrawColor(...BLUE);
      doc.setLineWidth(0.6);
      doc.line(LM, footerY, W - RM, footerY);

      setFont('bold', 7);
      doc.setTextColor(...BLUE);
      doc.text('Dr Rajesh Goel', LM, footerY + 4);
      setFont('normal', 6);
      doc.setTextColor(...GRAY);
      doc.text('Senior Nephrologist & Kidney Transplant Physician', LM, footerY + 7.5);
      doc.text('MBBS, DNB Internal Medicine, DNB Nephrology, Fellow Kidney Transplant Medicine', LM, footerY + 11);

      setFont('bold', 7);
      doc.setTextColor(...BLUE);
      doc.text('Online Nephrologist', W - RM, footerY + 4, { align: 'right' });
      setFont('normal', 6);
      doc.setTextColor(...GRAY);
      doc.text('info@onlinenephrologist.com | +91 9818235613', W - RM, footerY + 7.5, { align: 'right' });
      doc.text('www.onlinenephrologist.com', W - RM, footerY + 11, { align: 'right' });

      setFont('normal', 6.5);
      doc.setTextColor(170, 170, 170);
      doc.text('This document is for informational purposes only. Always consult your treating nephrologist before starting any vaccination.', W / 2, footerY + 16, { align: 'center' });
    }

    // ===== BUILD PDF =====
    drawHeader();
    drawTitle();
    drawNote();

    // 1. Hepatitis B
    sectionTitle('1', 'Hepatitis B', 'Engerix-B / Shanvac-B / Enivac B (or any brand)');
    infoLine('Route: IM injection (upper arm for adults, thigh for infants)  |  Dose: 2 ml (40 mcg) IM each time');
    y += 1;
    drawTable(
      ['Dose', 'Schedule', 'Date Given'],
      [
        ['1st Dose', 'Day 0', '___/___/______'],
        ['2nd Dose', '1st month', '___/___/______'],
        ['3rd Dose', '2nd month', '___/___/______'],
        ['4th Dose', '6th month', '___/___/______'],
      ]
    );

    // 2. Influenza
    sectionTitle('2', 'Influenza Vaccine Inj.', 'Influvac (or any brand)');
    infoLine('Dose: 0.5 ml I/M stat (once a year) - May/June');
    y += 1;
    drawTable(
      ['Dose', 'Schedule', 'Date Given'],
      [['Annual', 'Once a year (May/June)', '___/___/______']]
    );

    // 3. Pneumococcal
    sectionTitle('3', 'Pneumococcal Vaccine');
    setFont('normal', 7);
    doc.setTextColor(...GRAY);
    doc.text('A) Prevenar 20 (PCV 20) IM - No need to repeat', LM + 5, y); y += 3.5;
    doc.text('B) If received Prevenar 13 on day 0, give Prevenar 20 after 1 year', LM + 5, y); y += 3.5;
    doc.text('C) If received both Prevenar 13 + Pneumovax 23, no further vaccine needed', LM + 5, y); y += 4.5;
    drawTable(
      ['Vaccine Given', 'Date Given'],
      [['____________________', '___/___/______']]
    );

    // 4. Varicella Zoster
    sectionTitle('4', 'Varicella Zoster (Shingrix - 2 doses of 0.5 ml)');
    infoLine('For: Adults above 50 years or above 18 in high-risk patients');
    y += 1;
    drawTable(
      ['Dose', 'Schedule', 'Date Given'],
      [
        ['1st Dose', 'Month 0', '___/___/______'],
        ['2nd Dose', '2-6 months after 1st', '___/___/______'],
      ]
    );

    // 5. Anti HBs
    sectionTitle('5', 'Anti HBs Antibody Titres');
    infoLine('Purpose: Check immune response to Hep B vaccine  |  Frequency: Every 6 months  |  Target: >100 miu/ml');
    y += 1;
    drawTable(
      ['Date', 'Value (miu/ml)'],
      [
        ['___/___/______', '____________'],
        ['___/___/______', '____________'],
        ['___/___/______', '____________'],
      ]
    );

    // Injection Site
    checkPage(8);
    setFont('bold', 8);
    doc.setTextColor(...DARK);
    doc.text('Injection Site', LM + 2, y + 3);
    setFont('normal', 7);
    doc.text('Route: Deltoid muscle (upper arm)  |  0.5 to 1.0 ml for adults  |  Inject into muscle, not subcutaneous', LM + 4, y + 7);
    y += 11;

    // Emergency
    drawEmergency();

    // Footer
    drawFooter();

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Vaccination-Record-Kidney-Patient.pdf"',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (e) {
    console.error('[vaccination-pdf]', e);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
