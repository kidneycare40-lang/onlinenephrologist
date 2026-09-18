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

    // ===== TITLE =====
    function drawTitle() {
      doc.setFillColor(...BLUE);
      doc.roundedRect(LM, y, CW, 11, 2, 2, 'F');
      font('bold', 13);
      doc.setTextColor(255, 255, 255);
      doc.text('VACCINATION FOR KIDNEY PATIENTS', W / 2, y + 5, { align: 'center' });
      font('normal', 7);
      doc.setTextColor(220, 235, 250);
      doc.text('Essential vaccines for people with CKD, dialysis and kidney transplantation', W / 2, y + 9, { align: 'center' });
      y += 16;
    }

    // ===== INTRO NOTE =====
    function drawIntro() {
      doc.setFillColor(240, 247, 255);
      doc.roundedRect(LM, y, CW, 14, 2, 2, 'F');
      doc.setDrawColor(...BLUE);
      doc.setLineWidth(0.3);
      doc.roundedRect(LM, y, CW, 14, 2, 2, 'S');
      font('bold', 7.5);
      doc.setTextColor(...BLUE);
      doc.text('Why is vaccination important in kidney disease?', LM + 3, y + 4);
      font('normal', 6.5);
      doc.setTextColor(60, 60, 60);
      doc.text('People with CKD, those on dialysis and kidney transplant recipients are at increased risk of infections due to', LM + 3, y + 8.5);
      doc.text('altered immunity. Vaccination helps protect against serious infections. Ideally, review vaccination before dialysis or transplant.', LM + 3, y + 12);
      y += 17;
    }

    // ===== SECTION TITLE =====
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

    // ===== INFO LINE =====
    function infoLine(text: string) {
      font('normal', 7.5);
      doc.setTextColor(60, 60, 60);
      doc.text(text, LM + 4, y);
      y += 4;
    }

    // ===== DRAW TABLE =====
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

    // ===== HIGHLIGHT BOX =====
    function drawBox(title: string, lines: string[], bgColor: [number, number, number], borderColor: [number, number, number], titleColor: [number, number, number]) {
      const lineH = 4;
      const boxH = 4 + lines.length * lineH + 4;
      checkPage(boxH + 6);
      doc.setFillColor(...bgColor);
      doc.roundedRect(LM + 2, y, CW - 4, boxH, 2, 2, 'F');
      doc.setDrawColor(...borderColor);
      doc.setLineWidth(0.4);
      doc.roundedRect(LM + 2, y, CW - 4, boxH, 2, 2, 'S');
      font('bold', 7.5);
      doc.setTextColor(...titleColor);
      doc.text(title, LM + 6, y + 4);
      font('normal', 6.5);
      doc.setTextColor(80, 60, 40);
      let ly = y + 8;
      for (const line of lines) { doc.text(line, LM + 6, ly); ly += lineH; }
      y += boxH + 3;
    }

    // ===== INJECTION DIAGRAM =====
    function drawInjectionDiagram() {
      checkPage(55);
      doc.setFillColor(240, 247, 255);
      doc.roundedRect(LM, y, CW, 50, 3, 3, 'F');
      font('bold', 10);
      doc.setTextColor(...DARK);
      doc.text('How to Take Injection - Deltoid Muscle (Upper Arm)', LM + 3, y + 5);
      const cx = LM + 35;
      const cy = y + 30;
      doc.setFillColor(253, 232, 208);
      doc.setDrawColor(212, 165, 116);
      doc.setLineWidth(0.5);
      doc.ellipse(cx, cy, 22, 24, 'FD');
      doc.setFillColor(232, 85, 85);
      doc.setDrawColor(200, 68, 68);
      doc.setLineWidth(0.4);
      doc.ellipse(cx, cy, 14, 18, 'FD');
      doc.setFillColor(245, 240, 232);
      doc.setDrawColor(212, 196, 168);
      doc.rect(cx - 2, cy - 15, 4, 30, 'FD');
      doc.setFillColor(...BLUE);
      doc.circle(cx, cy, 3, 'F');
      doc.setDrawColor(...BLUE);
      doc.setLineWidth(0.8);
      doc.setLineDashPattern([2, 1.5], 0);
      doc.circle(cx, cy, 10, 'D');
      doc.setLineDashPattern([], 0);
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
      doc.setDrawColor(...BLUE);
      doc.setLineWidth(0.6);
      doc.line(cx + 22, cy - 3, cx + 12, cy - 1);
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

    // ===== VACCINATION RECORD TABLE =====
    function drawRecordTable() {
      checkPage(50);
      doc.setFillColor(240, 244, 248);
      doc.roundedRect(LM, y, CW, 9, 2, 2, 'F');
      font('bold', 10);
      doc.setTextColor(...DARK);
      doc.text('Vaccination Record', LM + 3, y + 4);
      y += 11;

      const TABLE_W = CW - 4;
      const tableX = LM + 2;
      const colWidths = [32, 35, 28, TABLE_W - 32 - 35 - 28];
      const headers = ['Vaccine', 'Dose / Date', 'Next Due', 'Remarks'];

      doc.setFillColor(...BLUE);
      doc.roundedRect(tableX, y, TABLE_W, 6, 1, 1, 'F');
      font('bold', 6.5);
      doc.setTextColor(255, 255, 255);
      let x = tableX;
      for (let i = 0; i < headers.length; i++) { doc.text(headers[i], x + 2, y + 4); x += colWidths[i]; }
      y += 6;

      const rows = [
        ['Hepatitis B', '___/___/______', '___/___/______', ''],
        ['Influenza', '___/___/______', '___/___/______', ''],
        ['Pneumococcal', '___/___/______', '___/___/______', ''],
        ['COVID-19', '___/___/______', '___/___/______', ''],
        ['Shingrix (Shingles)', '___/___/______', '___/___/______', ''],
        ['Tdap / Td', '___/___/______', '___/___/______', ''],
        ['Other: ________', '___/___/______', '___/___/______', ''],
      ];

      font('normal', 6.5);
      for (let r = 0; r < rows.length; r++) {
        if (r % 2 === 0) { doc.setFillColor(248, 250, 252); doc.rect(tableX, y, TABLE_W, 7, 'F'); }
        doc.setDrawColor(220, 225, 230); doc.setLineWidth(0.1); doc.line(tableX, y + 7, tableX + TABLE_W, y + 7);
        x = tableX;
        for (let c = 0; c < rows[r].length; c++) {
          doc.setTextColor(c === 0 ? 30 : 180, c === 0 ? 30 : 180, c === 0 ? 30 : 180);
          if (c === 0) doc.setFont('helvetica', 'bold');
          else doc.setFont('helvetica', 'normal');
          doc.text(rows[r][c], x + 2, y + 4.5);
          x += colWidths[c];
        }
        y += 7;
      }
      y += 4;
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
      doc.text('This document is for informational purposes only. Vaccination schedules may vary. Always consult your nephrologist.', W / 2, footerY + 16, { align: 'center' });
    }

    // ================================================================
    // BUILD PDF
    // ================================================================
    drawHeader();
    drawTitle();
    drawIntro();

    // 1. HEPATITIS B
    sectionTitle('1', 'Hepatitis B Vaccine', 'Engerix-B / Shanvac-B / Enivac B (or any approved brand)');
    infoLine('Why important: Hepatitis B is a serious risk for advanced CKD and dialysis patients. Vaccination is key pre-dialysis care.');
    infoLine('Route: IM injection (upper arm for adults)  |  Dose: 2 ml (40 mcg) IM each time');
    y += 1;
    drawTable(['Dose', 'Schedule', 'Date Given'], [
      ['1st Dose', 'Day 0', '___/___/______'],
      ['2nd Dose', '1st month', '___/___/______'],
      ['3rd Dose', '2nd month', '___/___/______'],
      ['4th Dose', '6th month', '___/___/______'],
    ], 50);

    drawBox('Anti-HBs Antibody Monitoring', [
      'After completing the vaccination series, your nephrologist may check Anti-HBs levels.',
      'In dialysis patients, Anti-HBs >=10 mIU/mL is generally considered protective.',
      'Periodic monitoring and booster/revaccination may be required when immunity declines.',
      'Vaccination should ideally be completed before dialysis or kidney transplantation.',
    ], [255, 248, 225], [249, 168, 37], [200, 80, 0]);

    // 2. INFLUENZA
    sectionTitle('2', 'Influenza Vaccine', 'Seasonal flu vaccine (Influvac or any approved brand)');
    infoLine('Why important: Kidney patients are at increased risk of complications from influenza.');
    infoLine('Dose: 0.5 ml IM  |  Frequency: Once every year');
    infoLine('When: Take the seasonal influenza vaccine at the recommended time for your region.');
    y += 1;
    drawTable(['Dose', 'Schedule', 'Date Given'], [
      ['Annual', 'Once a year (as per local recommendations)', '___/___/______'],
    ], 50);

    // 3. PNEUMOCOCCAL
    sectionTitle('3', 'Pneumococcal Vaccine');
    infoLine('Why important: CKD, nephrotic syndrome and kidney failure increase the risk of serious pneumococcal infection.');
    infoLine('The appropriate vaccine and interval depend on age, CKD stage, dialysis status and previous vaccination.');
    infoLine('Currently available options: PCV20, PCV21, PCV15, PPSV23.');
    drawBox('Important — Your vaccination history matters', [
      'If you have previously received PCV13, PPSV23, PCV15 or PCV20, your next dose may differ.',
      'Do not assume you need another dose without reviewing your vaccination record.',
      'Ask your nephrologist to review your previous vaccination before receiving any pneumococcal vaccine.',
    ], [254, 242, 242], [220, 100, 100], [180, 30, 30]);
    drawTable(['Vaccine Given', 'Date Given', 'Next Due'], [
      ['____________________', '___/___/______', '___/___/______'],
    ], 45);

    // 4. SHINGLES / SHINGRIX
    sectionTitle('4', 'Shingles Vaccine (Shingrix)', 'Non-live recombinant zoster vaccine - 2 doses');
    infoLine('Recommended for: Adults 50 years and older, and adults 19+ who are immunocompromised or at increased risk.');
    infoLine('Schedule: Usually 2 doses. Interval may vary depending on immune status. Confirm timing with your nephrologist.');
    y += 1;
    drawTable(['Dose', 'Schedule', 'Date Given'], [
      ['1st Dose', 'Month 0', '___/___/______'],
      ['2nd Dose', '2-6 months after 1st', '___/___/______'],
    ], 50);

    // 5. COVID-19
    sectionTitle('5', 'COVID-19 Vaccine');
    infoLine('Why important: Advanced CKD, dialysis and transplant patients may be at increased risk of severe COVID-19.');
    infoLine('Keep COVID-19 vaccination up to date according to current age- and risk-based recommendations in your region.');
    infoLine('Transplant patients: Follow your transplant team\'s vaccination schedule.');
    y += 1;
    drawTable(['Vaccine', 'Dose / Date', 'Next Due'], [
      ['COVID-19', '___/___/______', '___/___/______'],
    ], 50);

    // 6. Tdap / Td
    sectionTitle('6', 'Tetanus, Diphtheria & Pertussis (Tdap/Td)', 'Routine adult vaccination');
    infoLine('Kidney patients should remain up to date with routine adult vaccinations including Tdap/Td.');
    infoLine('Protects against: Tetanus (lockjaw), diphtheria and pertussis (whooping cough).');
    infoLine('Your nephrologist can advise on the correct booster schedule.');
    y += 1;
    drawTable(['Vaccine', 'Date Given', 'Next Due'], [
      ['Tdap / Td', '___/___/______', '___/___/______'],
    ], 50);

    // 7. OTHER VACCINES
    sectionTitle('7', 'Other Vaccines — Depending on Age and Condition');
    infoLine('Your nephrologist may recommend additional vaccines depending on your age, kidney disease, immune status,');
    infoLine('travel plans and whether you are preparing for kidney transplantation.');
    infoLine('These may include: Hepatitis A, MMR, Varicella, HPV, RSV, Meningococcal, Travel vaccines.');
    infoLine('Do not assume you need every vaccine — your doctor will guide you based on your situation.');

    // TRANSPLANT WARNING
    drawBox('KIDNEY TRANSPLANT PATIENTS - IMPORTANT', [
      'Vaccination planning should ideally be completed before kidney transplantation whenever possible.',
      'After transplantation, immunosuppressive medicines can affect vaccine responses.',
      'Do not receive a live vaccine after kidney transplantation unless specifically advised by your transplant team.',
      'This includes MMR, Varicella and live shingles vaccines.',
      'Vaccination status should be reviewed during transplant evaluation.',
    ], [254, 242, 242], [220, 80, 80], [180, 30, 30]);

    // VACCINES BEFORE TRANSPLANT
    drawBox('Vaccines Before Kidney Transplant', [
      'Transplant candidates should have vaccination status reviewed early during evaluation.',
      'Some vaccines require multiple doses over several months.',
      'Live vaccines (e.g., MMR, Varicella) must be given at least 4 weeks before transplantation.',
      'Your transplant team will guide you on correct timing.',
    ], [255, 248, 225], [249, 168, 37], [200, 80, 0]);

    // INJECTION DIAGRAM
    drawInjectionDiagram();

    // VACCINATION RECORD TABLE
    drawRecordTable();

    // MEDICAL DISCLAIMER
    checkPage(14);
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(LM, y, CW, 12, 2, 2, 'F');
    font('bold', 6.5);
    doc.setTextColor(120, 120, 120);
    doc.text('Medical Disclaimer:', LM + 3, y + 4);
    font('normal', 6);
    doc.setTextColor(140, 140, 140);
    doc.text('This document provides general educational information and does not replace individual medical advice.', LM + 3, y + 8);
    doc.text('Vaccination recommendations vary by age, CKD stage, dialysis status, transplant status and local guidelines. Consult your nephrologist.', LM + 3, y + 11.5);
    y += 15;

    // FOOTER
    drawFooter();

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Vaccination-Kidney-Patients.pdf"',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (e) {
    console.error('[vaccination-pdf]', e);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
