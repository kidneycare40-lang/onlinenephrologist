import { NextResponse } from 'next/server';
import jsPDF from 'jspdf';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const LM = 12;
    const RM = 12;
    const CW = W - LM - RM;
    const BLUE: [number, number, number] = [10, 117, 187];
    const DARKBLUE: [number, number, number] = [4, 46, 71];
    const DARK: [number, number, number] = [30, 30, 30];
    const GRAY: [number, number, number] = [100, 100, 100];
    const LIGHTGRAY: [number, number, number] = [240, 244, 248];
    const WHITE: [number, number, number] = [255, 255, 255];
    let y = 0;

    function font(style: 'normal' | 'bold' = 'normal', size = 9) {
      doc.setFont('helvetica', style);
      doc.setFontSize(size);
    }

    function checkPage(needed: number) {
      if (y + needed > H - 30) {
        doc.addPage();
        y = 12;
      }
    }

    // ===== HEADER =====
    function drawHeader() {
      // Blue header bar
      doc.setFillColor(...BLUE);
      doc.rect(0, 0, W, 32, 'F');
      // Dark accent line at bottom of header
      doc.setFillColor(...DARKBLUE);
      doc.rect(0, 32, W, 1.5, 'F');

      // Logo circle
      doc.setFillColor(255, 255, 255);
      doc.circle(LM + 8, 14, 7, 'F');
      doc.setFillColor(...BLUE);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(...BLUE);
      doc.text('K', LM + 8, 17, { align: 'center' });

      // Clinic name
      font('bold', 14);
      doc.setTextColor(...WHITE);
      doc.text('Online Nephrologist / Kidney Care Centre', LM + 19, 12);

      // Doctor info
      font('normal', 7.5);
      doc.setTextColor(210, 225, 240);
      doc.text('Dr Rajesh Goel  |  MBBS, DNB Internal Medicine, DNB Nephrology, Fellow Kidney Transplant Medicine', LM + 19, 17);
      doc.text('Reg. No: DMC/R/734  |  20+ Years Experience', LM + 19, 21);

      // Contact on right
      font('normal', 7);
      doc.setTextColor(200, 220, 235);
      doc.text('+91 9818235613  |  info@onlinenephrologist.com', W - RM, 17, { align: 'right' });
      doc.text('www.onlinenephrologist.com', W - RM, 21, { align: 'right' });

      y = 40;
    }

    // ===== TITLE =====
    function drawTitle() {
      doc.setFillColor(...BLUE);
      doc.roundedRect(LM, y, CW, 11, 2, 2, 'F');
      font('bold', 13);
      doc.setTextColor(...WHITE);
      doc.text('VACCINATION RECORD', W / 2, y + 5, { align: 'center' });
      font('normal', 7);
      doc.setTextColor(220, 235, 250);
      doc.text('Recommended vaccinations for chronic kidney disease patients', W / 2, y + 9, { align: 'center' });
      y += 16;
    }

    // ===== NOTE =====
    function drawNote() {
      doc.setFillColor(255, 248, 225);
      doc.roundedRect(LM, y, CW, 12, 2, 2, 'F');
      doc.setDrawColor(249, 168, 37);
      doc.setLineWidth(0.3);
      doc.roundedRect(LM, y, CW, 12, 2, 2, 'S');
      font('bold', 7.5);
      doc.setTextColor(200, 80, 0);
      doc.text('Above doses applicable in case of chronic kidney disease', LM + 3, y + 4);
      font('normal', 6.5);
      doc.setTextColor(120, 70, 20);
      doc.text('1. Anti HBs antibody titres to be done every 6 months.    2. Protective titres for kidney disease patients are >100 miu/ml.', LM + 3, y + 8.5);
      y += 16;
    }

    // ===== SECTION TITLE =====
    function sectionTitle(num: string, title: string, subtitle?: string) {
      checkPage(16);
      doc.setFillColor(240, 244, 248);
      doc.roundedRect(LM, y, CW, subtitle ? 12 : 9, 2, 2, 'F');
      font('bold', 10);
      doc.setTextColor(...DARK);
      doc.text(`${num}. ${title}`, LM + 3, y + (subtitle ? 5.5 : 4));
      if (subtitle) {
        font('normal', 7);
        doc.setTextColor(...GRAY);
        doc.text(subtitle, LM + 3, y + 10);
      }
      y += subtitle ? 15 : 12;
    }

    // ===== INFO LINE =====
    function infoLine(text: string) {
      font('normal', 7.5);
      doc.setTextColor(60, 60, 60);
      doc.text(text, LM + 4, y);
      y += 4;
    }

    // ===== TABLE =====
    function drawTable(headers: string[], rows: string[][], lastColWidth = 50) {
      const ROW_H = 8;
      const HEADER_H = 6;
      const TABLE_W = CW - 4;
      checkPage(rows.length * ROW_H + HEADER_H + 6);

      const tableX = LM + 2;
      const numCols = headers.length;
      const otherColsW = TABLE_W - lastColWidth;
      const colW: number[] = [];
      for (let i = 0; i < numCols; i++) {
        colW.push(i === numCols - 1 ? lastColWidth : otherColsW / (numCols - 1));
      }

      // Header row
      doc.setFillColor(...BLUE);
      doc.roundedRect(tableX, y, TABLE_W, HEADER_H, 1, 1, 'F');
      font('bold', 7);
      doc.setTextColor(...WHITE);
      let x = tableX;
      for (let i = 0; i < numCols; i++) {
        doc.text(headers[i], x + 2.5, y + 4);
        x += colW[i];
      }
      y += HEADER_H;

      // Data rows
      font('normal', 7.5);
      for (let r = 0; r < rows.length; r++) {
        // Alternating background
        if (r % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(tableX, y, TABLE_W, ROW_H, 'F');
        }
        // Border bottom
        doc.setDrawColor(220, 225, 230);
        doc.setLineWidth(0.1);
        doc.line(tableX, y + ROW_H, tableX + TABLE_W, y + ROW_H);

        x = tableX;
        for (let c = 0; c < rows[r].length; c++) {
          if (c === numCols - 1) {
            // Date column - lighter color, dotted underline look
            doc.setTextColor(180, 180, 180);
            doc.text(rows[r][c], x + 2.5, y + 5);
          } else {
            doc.setTextColor(...DARK);
            doc.text(rows[r][c], x + 2.5, y + 5);
          }
          x += colW[c];
        }
        y += ROW_H;
      }
      y += 4;
    }

    // ===== EMERGENCY =====
    function drawEmergency() {
      checkPage(40);
      doc.setFillColor(254, 242, 242);
      doc.roundedRect(LM, y, CW, 10, 2, 2, 'F');
      font('bold', 10);
      doc.setTextColor(180, 30, 30);
      doc.text('Emergency Medicine for Adults with Kidney Diseases', LM + 3, y + 4.5);
      font('normal', 7);
      doc.setTextColor(120, 80, 80);
      doc.text('Aapatkalin gurda rogiyon ke liye', LM + 3, y + 8.5);
      y += 14;

      const meds = [
        ['1. FEVER (Bukhar)', 'Tab. Dolo 650 mg / Tab Crocin 500mg SOS'],
        ['2. PAIN (Dard)', 'Tab. Ultracet 37 mg / Tab. Dolo 650 mg / Cap Tramazac P 37.5 mg SOS'],
        ['3. VOMITING (Ulti)', 'Tab. Emset 4mg / Tab Zofer MD 4mg / Tab. Vomikind 4 mg SOS'],
        ['4. RENAL COLIC (Pet dard / Gurde ki pathri ka dard)', 'Tab. Drotin DS/ Drotinkind 80 mg / DVN Plus sos, Inj. Tramadol 100 mg IMI SOS'],
        ['5. SWELLING (Soojan)', 'Tab. Tor 20 mg/ Tab. Dtor 20 mg / Tab. Torget 20 mg SOS'],
      ];

      for (const [name, dose] of meds) {
        doc.setFillColor(252, 245, 245);
        doc.roundedRect(LM + 2, y, CW - 4, 6, 1, 1, 'F');
        font('bold', 7);
        doc.setTextColor(...DARK);
        doc.text(name, LM + 5, y + 4);
        font('normal', 7);
        doc.setTextColor(80, 80, 80);
        doc.text(dose, LM + 80, y + 4);
        y += 7.5;
      }
      y += 2;
    }

    // ===== FOOTER (on every page) =====
    function drawFooter() {
      const footerY = H - 24;
      // Blue line
      doc.setFillColor(...BLUE);
      doc.rect(0, footerY - 2, W, 1, 'F');

      // Doctor info left
      font('bold', 7.5);
      doc.setTextColor(...BLUE);
      doc.text('Dr Rajesh Goel', LM, footerY + 3);
      font('normal', 6.5);
      doc.setTextColor(...GRAY);
      doc.text('Senior Nephrologist & Kidney Transplant Physician', LM, footerY + 7);
      doc.text('MBBS, DNB Internal Medicine, DNB Nephrology, Fellow Kidney Transplant Medicine', LM, footerY + 10.5);

      // Clinic info right
      font('bold', 7.5);
      doc.setTextColor(...BLUE);
      doc.text('Online Nephrologist', W - RM, footerY + 3, { align: 'right' });
      font('normal', 6.5);
      doc.setTextColor(...GRAY);
      doc.text('info@onlinenephrologist.com  |  +91 9818235613', W - RM, footerY + 7, { align: 'right' });
      doc.text('www.onlinenephrologist.com', W - RM, footerY + 10.5, { align: 'right' });

      // Disclaimer
      font('normal', 5.5);
      doc.setTextColor(180, 180, 180);
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
      ],
      50
    );

    // 2. Influenza
    sectionTitle('2', 'Influenza Vaccine Inj.', 'Influvac (or any brand)');
    infoLine('Dose: 0.5 ml I/M stat (once a year) - May/June');
    y += 1;
    drawTable(
      ['Dose', 'Schedule', 'Date Given'],
      [['Annual', 'Once a year (May/June)', '___/___/______']],
      50
    );

    // 3. Pneumococcal
    sectionTitle('3', 'Pneumococcal Vaccine');
    font('normal', 7);
    doc.setTextColor(80, 80, 80);
    doc.text('A) Prevenar 20 (PCV 20) IM - No need to repeat', LM + 5, y); y += 4;
    doc.text('B) If received Prevenar 13 on day 0, give Prevenar 20 after 1 year', LM + 5, y); y += 4;
    doc.text('C) If received both Prevenar 13 + Pneumovax 23, no further vaccine needed', LM + 5, y); y += 5;
    drawTable(
      ['Vaccine Given', 'Date Given'],
      [['____________________', '___/___/______']],
      50
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
      ],
      50
    );

    // 5. Anti HBs
    sectionTitle('5', 'Anti HBs Antibody Titres');
    infoLine('Purpose: Check immune response to Hep B vaccine  |  Frequency: Every 6 months  |  Target: >100 miu/ml');
    y += 1;
    drawTable(
      ['Date', 'Value (miu/ml)'],
      [
        ['___/___/______', '_______________'],
        ['___/___/______', '_______________'],
        ['___/___/______', '_______________'],
      ],
      45
    );

    // Injection Site
    checkPage(10);
    doc.setFillColor(240, 248, 255);
    doc.roundedRect(LM, y, CW, 10, 2, 2, 'F');
    font('bold', 8);
    doc.setTextColor(...BLUE);
    doc.text('Injection Site', LM + 3, y + 4);
    font('normal', 7.5);
    doc.setTextColor(60, 60, 60);
    doc.text('Deltoid muscle (upper arm)  |  0.5 to 1.0 ml for adults  |  Inject into muscle, not subcutaneous', LM + 3, y + 8);
    y += 14;

    // Emergency
    drawEmergency();

    // Footer on first page
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
