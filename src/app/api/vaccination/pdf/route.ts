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
    let y = 0;

    function font(style: 'normal' | 'bold' = 'normal', size = 9) {
      doc.setFont('helvetica', style);
      doc.setFontSize(size);
    }

    function checkPage(needed: number) {
      if (y + needed > H - 30) { doc.addPage(); y = 12; }
    }

    // ===== HEADER =====
    function drawHeader() {
      doc.setFillColor(...BLUE);
      doc.rect(0, 0, W, 32, 'F');
      doc.setFillColor(...DARKBLUE);
      doc.rect(0, 32, W, 1.5, 'F');
      doc.setFillColor(255, 255, 255);
      doc.circle(LM + 8, 14, 7, 'F');
      doc.setFillColor(...BLUE);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(...BLUE);
      doc.text('K', LM + 8, 17, { align: 'center' });
      font('bold', 14);
      doc.setTextColor(255, 255, 255);
      doc.text('Online Nephrologist / Kidney Care Centre', LM + 19, 12);
      font('normal', 7.5);
      doc.setTextColor(210, 225, 240);
      doc.text('Dr Rajesh Goel  |  MBBS, DNB Internal Medicine, DNB Nephrology, Fellow Kidney Transplant Medicine', LM + 19, 17);
      doc.text('Reg. No: DMC/R/734  |  20+ Years Experience', LM + 19, 21);
      font('normal', 7);
      doc.setTextColor(200, 220, 235);
      doc.text('+91 9818235613  |  info@onlinenephrologist.com', W - RM, 17, { align: 'right' });
      doc.text('www.onlinenephrologist.com', W - RM, 21, { align: 'right' });
      y = 40;
    }

    function drawTitle() {
      doc.setFillColor(...BLUE);
      doc.roundedRect(LM, y, CW, 11, 2, 2, 'F');
      font('bold', 13);
      doc.setTextColor(255, 255, 255);
      doc.text('VACCINATION RECORD', W / 2, y + 5, { align: 'center' });
      font('normal', 7);
      doc.setTextColor(220, 235, 250);
      doc.text('Recommended vaccinations for chronic kidney disease patients', W / 2, y + 9, { align: 'center' });
      y += 16;
    }

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

    function sectionTitle(num: string, title: string, subtitle?: string) {
      checkPage(16);
      doc.setFillColor(240, 244, 248);
      doc.roundedRect(LM, y, CW, subtitle ? 12 : 9, 2, 2, 'F');
      font('bold', 10);
      doc.setTextColor(...DARK);
      doc.text(`${num}. ${title}`, LM + 3, y + (subtitle ? 5.5 : 4));
      if (subtitle) { font('normal', 7); doc.setTextColor(...GRAY); doc.text(subtitle, LM + 3, y + 10); }
      y += subtitle ? 15 : 12;
    }

    function infoLine(text: string) {
      font('normal', 7.5);
      doc.setTextColor(60, 60, 60);
      doc.text(text, LM + 4, y);
      y += 4;
    }

    function drawTable(headers: string[], rows: string[][], lastColWidth = 50) {
      const ROW_H = 8;
      const HEADER_H = 6;
      const TABLE_W = CW - 4;
      checkPage(rows.length * ROW_H + HEADER_H + 6);
      const tableX = LM + 2;
      const numCols = headers.length;
      const otherColsW = TABLE_W - lastColWidth;
      const colW: number[] = [];
      for (let i = 0; i < numCols; i++) colW.push(i === numCols - 1 ? lastColWidth : otherColsW / (numCols - 1));
      doc.setFillColor(...BLUE);
      doc.roundedRect(tableX, y, TABLE_W, HEADER_H, 1, 1, 'F');
      font('bold', 7);
      doc.setTextColor(255, 255, 255);
      let x = tableX;
      for (let i = 0; i < numCols; i++) { doc.text(headers[i], x + 2.5, y + 4); x += colW[i]; }
      y += HEADER_H;
      font('normal', 7.5);
      for (let r = 0; r < rows.length; r++) {
        if (r % 2 === 0) { doc.setFillColor(248, 250, 252); doc.rect(tableX, y, TABLE_W, ROW_H, 'F'); }
        doc.setDrawColor(220, 225, 230); doc.setLineWidth(0.1); doc.line(tableX, y + ROW_H, tableX + TABLE_W, y + ROW_H);
        x = tableX;
        for (let c = 0; c < rows[r].length; c++) {
          doc.setTextColor(c === numCols - 1 ? 180 : 30, c === numCols - 1 ? 180 : 30, c === numCols - 1 ? 180 : 30);
          doc.text(rows[r][c], x + 2.5, y + 5);
          x += colW[c];
        }
        y += ROW_H;
      }
      y += 4;
    }

    // ===== INJECTION SITE DIAGRAM =====
    function drawInjectionDiagram() {
      checkPage(55);
      doc.setFillColor(240, 247, 255);
      doc.roundedRect(LM, y, CW, 50, 3, 3, 'F');

      font('bold', 10);
      doc.setTextColor(...DARK);
      doc.text('How to Take Injection - Deltoid Muscle (Upper Arm)', LM + 3, y + 5);

      // Shoulder outline
      const cx = LM + 35;
      const cy = y + 30;
      doc.setFillColor(253, 232, 208);
      doc.setDrawColor(212, 165, 116);
      doc.setLineWidth(0.5);
      doc.ellipse(cx, cy, 22, 24, 'FD');

      // Deltoid muscle
      doc.setFillColor(232, 85, 85);
      doc.setDrawColor(200, 68, 68);
      doc.setLineWidth(0.4);
      doc.ellipse(cx, cy, 14, 18, 'FD');

      // Bone
      doc.setFillColor(245, 240, 232);
      doc.setDrawColor(212, 196, 168);
      doc.rect(cx - 2, cy - 15, 4, 30, 'FD');

      // Injection target
      doc.setFillColor(...BLUE);
      doc.circle(cx, cy, 3, 'F');
      doc.setDrawColor(...BLUE);
      doc.setLineWidth(0.8);
      doc.setLineDashPattern([2, 1.5], 0);
      doc.circle(cx, cy, 10, 'D');
      doc.setLineDashPattern([], 0);

      // Syringe drawing
      doc.setFillColor(221, 221, 221);
      doc.setDrawColor(153, 153, 153);
      doc.setLineWidth(0.4);
      doc.rect(cx + 25, cy - 8, 18, 5, 'FD');
      doc.setFillColor(...BLUE);
      doc.rect(cx + 20, cy - 6.5, 6, 3, 'FD');
      doc.setFillColor(170, 170, 170);
      doc.setDrawColor(130, 130, 130);
      doc.setLineWidth(0.3);
      doc.triangle(cx + 43, cy - 5.5, cx + 43, cy - 4.5, cx + 48, cy - 5, 'FD');

      // Arrow
      doc.setDrawColor(...BLUE);
      doc.setLineWidth(0.6);
      doc.line(cx + 22, cy - 3, cx + 12, cy - 1);

      // Labels on right
      const lx = LM + 80;
      font('bold', 8);
      doc.setTextColor(...DARK);
      doc.text('Site: Deltoid muscle (2-3 finger widths below shoulder)', lx, y + 14);
      doc.text('Needle: 25-26 gauge, 1 inch (25mm) for adults', lx, y + 19);
      doc.text('Angle: 90 degrees perpendicular to skin', lx, y + 24);
      doc.text('Volume: 0.5 ml to 1.0 ml for adults', lx, y + 29);

      font('bold', 7);
      doc.setTextColor(200, 100, 0);
      doc.text('Important:', lx, y + 36);
      font('normal', 6.5);
      doc.setTextColor(140, 80, 20);
      doc.text('- Use opposite arm of fistula/AV access (dialysis patients)', lx + 16, y + 36);
      doc.text('- Rotate injection sites if giving multiple vaccines', lx, y + 40.5);
      doc.text('- Inject into the muscle, NOT subcutaneous (under skin)', lx, y + 45);

      y += 54;
    }

    // ===== EMERGENCY MEDICINES TABLE =====
    function drawEmergency() {
      checkPage(50);
      // Title
      doc.setFillColor(254, 242, 242);
      doc.roundedRect(LM, y, CW, 10, 2, 2, 'F');
      font('bold', 10);
      doc.setTextColor(180, 30, 30);
      doc.text('Emergency Medicine for Adults with Kidney Diseases', LM + 3, y + 4.5);
      font('normal', 7);
      doc.setTextColor(120, 80, 80);
      doc.text('Aapatkalin gurda rogiyon ke liye (SOS dawaiyan)', LM + 3, y + 8.5);
      y += 14;

      const TABLE_W = CW - 4;
      const tableX = LM + 2;
      const colWidths = [28, 55, 42, TABLE_W - 28 - 55 - 42];
      const headers = ['Problem', 'Medicine', 'How to Take', 'Dose'];

      // Header row
      doc.setFillColor(180, 30, 30);
      doc.roundedRect(tableX, y, TABLE_W, 6, 1, 1, 'F');
      font('bold', 6.5);
      doc.setTextColor(255, 255, 255);
      let x = tableX;
      for (let i = 0; i < headers.length; i++) { doc.text(headers[i], x + 2, y + 4); x += colWidths[i]; }
      y += 6;

      const meds = [
        ['Fever (Bukhar)', 'Tab Dolo 650 / Crocin 500 mg', 'After food (khane k bad)', '1 tab SOS'],
        ['Pain (Dard)', 'Tab Ultracet 37 mg / Cap Tramazac P 37.5 mg', 'After food (khane k bad)', '1 tab SOS'],
        ['Vomiting (Ulti)', 'Tab Emset 4mg / Tab Zofer 4mg', 'Before food (khane s phle)', '1 tab SOS'],
        ['Renal Colic (Pet dard)', 'Tab Drotin DS 80 mg / Inj Tramadol 100 mg IM', 'After food (khane k bad)', '1 tab / SOS'],
        ['Swelling (Soojan)', 'Tab Tor 20 / Dtor 20 mg', 'After food (khane k bad)', '1 tab SOS'],
      ];

      font('normal', 6.5);
      for (let r = 0; r < meds.length; r++) {
        if (r % 2 === 0) { doc.setFillColor(254, 248, 248); doc.rect(tableX, y, TABLE_W, 7, 'F'); }
        doc.setDrawColor(230, 200, 200); doc.setLineWidth(0.1); doc.line(tableX, y + 7, tableX + TABLE_W, y + 7);
        x = tableX;
        for (let c = 0; c < meds[r].length; c++) {
          if (c === 0) { doc.setFont('helvetica', 'bold'); doc.setTextColor(120, 20, 20); }
          else { doc.setFont('helvetica', 'normal'); doc.setTextColor(70, 70, 70); }
          doc.text(meds[r][c], x + 2, y + 4.5);
          x += colWidths[c];
        }
        y += 7;
      }
      font('bold', 5.5);
      doc.setTextColor(180, 30, 30);
      doc.text('SOS = Zarurat padne par (As needed)', tableX, y + 3);
      y += 7;
    }

    // ===== COMMON MEDICINES TABLE =====
    function drawMedicinesTable() {
      checkPage(55);
      doc.setFillColor(240, 248, 245);
      doc.roundedRect(LM, y, CW, 10, 2, 2, 'F');
      font('bold', 10);
      doc.setTextColor(13, 148, 136);
      doc.text('Other Common Medicines (Anya Samanya Dawaiyan)', LM + 3, y + 4.5);
      font('normal', 7);
      doc.setTextColor(100, 120, 110);
      doc.text('Additional medicines for kidney patients - How to take', LM + 3, y + 8.5);
      y += 14;

      const TABLE_W = CW - 4;
      const tableX = LM + 2;
      const colWidths = [28, 55, 42, TABLE_W - 28 - 55 - 42];
      const headers = ['Medicine (Dawai)', 'Use (Upyog)', 'How to Take (Kaise lein)', 'Dose (Matra)'];

      // Header row
      doc.setFillColor(13, 148, 136);
      doc.roundedRect(tableX, y, TABLE_W, 6, 1, 1, 'F');
      font('bold', 6.5);
      doc.setTextColor(255, 255, 255);
      let x = tableX;
      for (let i = 0; i < headers.length; i++) { doc.text(headers[i], x + 2, y + 4); x += colWidths[i]; }
      y += 6;

      const medicines = [
        ['Pan 40 / Razo', 'Acidity (Acidty)', 'Before breakfast (nashte s phle)', '1 tab daily'],
        ['Telma 40 / Amlodac', 'BP (Uchch raktchap)', 'Any time (kisi bhi smy)', '1 tab daily'],
        ['Dynapres / Telmikind', 'BP (Uchch raktchap)', 'Any time (kisi bhi smy)', '1 tab daily'],
        ['Ondem / Zofer 4mg', 'Nausea (Ji michlana)', 'Before food (khane s phle)', '1 tab SOS'],
        ['Duphaston', 'Hormone (Harmon)', 'After food (khane k bad)', 'As directed'],
      ];

      font('normal', 6.5);
      for (let r = 0; r < medicines.length; r++) {
        if (r % 2 === 0) { doc.setFillColor(245, 252, 250); doc.rect(tableX, y, TABLE_W, 7, 'F'); }
        doc.setDrawColor(210, 225, 220); doc.setLineWidth(0.1); doc.line(tableX, y + 7, tableX + TABLE_W, y + 7);
        x = tableX;
        for (let c = 0; c < medicines[r].length; c++) {
          if (c === 0) { doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 30, 30); }
          else { doc.setFont('helvetica', 'normal'); doc.setTextColor(70, 70, 70); }
          doc.text(medicines[r][c], x + 2, y + 4.5);
          x += colWidths[c];
        }
        y += 7;
      }
      font('normal', 5.5);
      doc.setTextColor(150, 150, 150);
      doc.text('SOS = Zarurat padne par (As needed)  |  Hamesha apne doctor ki salah se dawai lein (Always take medicines under doctor guidance)', tableX, y + 3);
      y += 8;
    }

    // ===== FOOTER =====
    function drawFooter() {
      const footerY = H - 24;
      doc.setFillColor(...BLUE);
      doc.rect(0, footerY - 2, W, 1, 'F');
      font('bold', 7.5);
      doc.setTextColor(...BLUE);
      doc.text('Dr Rajesh Goel', LM, footerY + 3);
      font('normal', 6.5);
      doc.setTextColor(...GRAY);
      doc.text('Senior Nephrologist & Kidney Transplant Physician', LM, footerY + 7);
      doc.text('MBBS, DNB Internal Medicine, DNB Nephrology, Fellow Kidney Transplant Medicine', LM, footerY + 10.5);
      font('bold', 7.5);
      doc.setTextColor(...BLUE);
      doc.text('Online Nephrologist', W - RM, footerY + 3, { align: 'right' });
      font('normal', 6.5);
      doc.setTextColor(...GRAY);
      doc.text('info@onlinenephrologist.com  |  +91 9818235613', W - RM, footerY + 7, { align: 'right' });
      doc.text('www.onlinenephrologist.com', W - RM, footerY + 10.5, { align: 'right' });
      font('normal', 5.5);
      doc.setTextColor(180, 180, 180);
      doc.text('This document is for informational purposes only. Always consult your treating nephrologist before starting any vaccination.', W / 2, footerY + 16, { align: 'center' });
    }

    // ===== BUILD PDF =====
    drawHeader();
    drawTitle();
    drawNote();

    sectionTitle('1', 'Hepatitis B', 'Engerix-B / Shanvac-B / Enivac B (or any brand)');
    infoLine('Route: IM injection (upper arm for adults, thigh for infants)  |  Dose: 2 ml (40 mcg) IM each time');
    y += 1;
    drawTable(['Dose', 'Schedule', 'Date Given'], [['1st Dose', 'Day 0', '___/___/______'], ['2nd Dose', '1st month', '___/___/______'], ['3rd Dose', '2nd month', '___/___/______'], ['4th Dose', '6th month', '___/___/______']], 50);

    sectionTitle('2', 'Influenza Vaccine Inj.', 'Influvac (or any brand)');
    infoLine('Dose: 0.5 ml I/M stat (once a year) - May/June');
    y += 1;
    drawTable(['Dose', 'Schedule', 'Date Given'], [['Annual', 'Once a year (May/June)', '___/___/______']], 50);

    sectionTitle('3', 'Pneumococcal Vaccine');
    font('normal', 7); doc.setTextColor(80, 80, 80);
    doc.text('A) Prevenar 20 (PCV 20) IM - No need to repeat', LM + 5, y); y += 4;
    doc.text('B) If received Prevenar 13 on day 0, give Prevenar 20 after 1 year', LM + 5, y); y += 4;
    doc.text('C) If received both Prevenar 13 + Pneumovax 23, no further vaccine needed', LM + 5, y); y += 5;
    drawTable(['Vaccine Given', 'Date Given'], [['____________________', '___/___/______']], 50);

    sectionTitle('4', 'Varicella Zoster (Shingrix - 2 doses of 0.5 ml)');
    infoLine('For: Adults above 50 years or above 18 in high-risk patients');
    y += 1;
    drawTable(['Dose', 'Schedule', 'Date Given'], [['1st Dose', 'Month 0', '___/___/______'], ['2nd Dose', '2-6 months after 1st', '___/___/______']], 50);

    sectionTitle('5', 'Anti HBs Antibody Titres');
    infoLine('Purpose: Check immune response to Hep B vaccine  |  Frequency: Every 6 months  |  Target: >100 miu/ml');
    y += 1;
    drawTable(['Date', 'Value (miu/ml)'], [['___/___/______', '_______________'], ['___/___/______', '_______________'], ['___/___/______', '_______________']], 45);

    // Injection Diagram
    drawInjectionDiagram();

    // Emergency
    drawEmergency();

    // Common Medicines
    drawMedicinesTable();

    // Footer
    drawFooter();

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    return new NextResponse(pdfBuffer, {
      headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="Vaccination-Record-Kidney-Patient.pdf"', 'Cache-Control': 'no-cache' },
    });
  } catch (e) {
    console.error('[vaccination-pdf]', e);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
