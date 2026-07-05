import { jsPDF } from 'jspdf';

interface PrescriptionPDFPatient {
  firstName: string;
  lastName: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  uhid: string;
}

interface PrescriptionPDFMedicine {
  name: string;
  strength?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  when?: string;
  instructions?: string;
  route?: string;
  genericName?: string;
}

interface PrescriptionPDFDiagnosis {
  name: string;
}

interface PrescriptionPDFVitals {
  bloodPressure?: string;
  heartRate?: string;
  temperature?: string;
  spo2?: string;
  weight?: string;
  height?: string;
  bmi?: string;
  creatinine?: string;
  egfr?: string;
}

interface PrescriptionPDFConsultation {
  prescriptions: PrescriptionPDFMedicine[];
  diagnoses: PrescriptionPDFDiagnosis[];
  advice?: string;
  followUpDate?: string;
  vitals?: PrescriptionPDFVitals;
}

interface PrescriptionPDFLabResult {
  testName: string;
  value: string;
  unit: string;
  date: string;
  isAbnormal: boolean;
}

function dosagePattern(freq: string, route: string): string {
  const f = (freq || '').toLowerCase();
  const r = (route || '').toLowerCase();
  if (r === 'sc' || r === 'iv' || f.includes('week')) return '0 - 0 - 0';
  if (f.includes('thrice') || f.includes('three times') || f.includes('3 times') || f.includes('tds') || f.includes('tid')) return '1 - 1 - 1';
  if (f.includes('twice') || f.includes('2 times') || f.includes('bd') || f.includes('two times')) return '1 - 0 - 1';
  if (f.includes('once') || f.includes('1 time') || f.includes('od') || f.includes('daily')) return '1 - 0 - 0';
  if (f.includes('needed') || f.includes('prn') || f.includes('sos') || f.includes('stat')) return 'SOS';
  return '1 - 0 - 0';
}

const COL_BLUE: [number, number, number] = [9, 81, 135];
const COL_RED: [number, number, number] = [192, 57, 43];
const COL_GREEN: [number, number, number] = [5, 150, 105];
const COL_BLACK: [number, number, number] = [0, 0, 0];
const COL_GRAY: [number, number, number] = [51, 51, 51];
const COL_LIGHT: [number, number, number] = [229, 231, 235];

export async function generatePrescriptionPDF(
  patient: PrescriptionPDFPatient,
  consultation: PrescriptionPDFConsultation,
  testRequests: string[],
  testRequestByWhen: string,
  labResults: PrescriptionPDFLabResult[],
  clinicId?: string,
): Promise<Blob> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const PW = 210;
  const PH = 297;
  const ML = 10;
  const MR = 10;
  const CW = PW - ML - MR;
  const FOOTER_H = 20;
  const FOOTER_Y = PH - FOOTER_H - 5;
  const MAX_Y = FOOTER_Y - 10;
  let y = 10;
  const isPsri = clinicId === 'psri-delhi';
  const isOnline = clinicId === 'online' || clinicId === 'online-intl';
  const accentColor = isPsri ? COL_RED : isOnline ? COL_GREEN : COL_BLUE;

  const ensureSpace = (needed: number) => {
    if (y + needed > MAX_Y) { doc.addPage(); y = 15; }
  };

  const drawText = (text: string, fontSize: number, bold: boolean, color: [number, number, number], x: number, opts?: { align?: 'left' | 'right' | 'center'; maxWidth?: number }) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setTextColor(...color);
    const maxW = opts?.maxWidth || CW;
    const lines = doc.splitTextToSize(text, maxW);
    for (const line of lines) {
      ensureSpace(fontSize * 0.4 + 2);
      doc.text(line, x, y, opts?.align ? { align: opts.align } : undefined);
      y += fontSize * 0.42;
    }
  };

  const drawHLine = (yy: number, color: [number, number, number], width = 0.3) => {
    doc.setDrawColor(...color);
    doc.setLineWidth(width);
    doc.line(ML, yy, PW - MR, yy);
  };

  const loadImg = async (url: string): Promise<string | null> => {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const blob = await res.blob();
      return new Promise<string | null>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch { return null; }
  };

  const putImg = (dataUrl: string, x: number, yy: number, w: number, h: number) => {
    try {
      const ext = dataUrl.includes('image/png') ? 'PNG' : 'JPEG';
      doc.addImage(dataUrl, ext, x, yy, w, h);
    } catch { /* skip */ }
  };

  const logoData = await loadImg(isPsri ? '/PSRI.jpeg' : '/images/kidney_logo.png');
  if (logoData) {
    putImg(logoData, ML, y, isPsri ? 30 : 20, isPsri ? 22 : 20);
  }

  if (isPsri) {
    let ty = y + 6;
    doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(...COL_RED);
    doc.text('PSRI INSTITUTE OF RENAL SCIENCES', PW - MR, ty, { align: 'right' });
    ty += 6;
    doc.setFontSize(10); doc.setTextColor(...COL_BLACK);
    doc.text('DR. RAJESH GOEL', PW - MR, ty, { align: 'right' });
    ty += 4;
    doc.setFontSize(7.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(...COL_GRAY);
    doc.text('Senior Consultant Nephrology & Kidney Transplant Medicine', PW - MR, ty, { align: 'right' });
    ty += 3.5;
    doc.text('MBBS, DNB (Medicine) DNB (Nephrology)', PW - MR, ty, { align: 'right' });
    ty += 3.5;
    doc.text('Fellow (Kidney Transplant)', PW - MR, ty, { align: 'right' });
    ty += 3.5;
    doc.text('Reg. No. R/0734 (DMC)', PW - MR, ty, { align: 'right' });
    ty += 3.5;
    doc.text('Mon-Saturday 1PM to 7PM', PW - MR, ty, { align: 'right' });
  } else {
    let ty = y + 4;
    doc.setFontSize(13); doc.setFont('helvetica', 'bold'); doc.setTextColor(...accentColor);
    doc.text('Dr. Rajesh Goel', PW - MR, ty, { align: 'right' });
    ty += 4.5;
    doc.setFontSize(7.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(...COL_GRAY);
    doc.text('Senior Nephrologist & Kidney Transplant Physician', PW - MR, ty, { align: 'right' });
    ty += 3.5;
    doc.text('FELLOW (KIDNEY TRANSPLANT MEDICINE)', PW - MR, ty, { align: 'right' });
    ty += 3.5;
    doc.text('DMC/R/734', PW - MR, ty, { align: 'right' });
    ty += 4;
    doc.setFontSize(8.5); doc.setTextColor(220, 38, 38);
    doc.text('+91 9818235688', PW - MR, ty, { align: 'right' });
  }

  const headerEnd = y + (isPsri ? 28 : 24);
  drawHLine(headerEnd, accentColor, 0.7);
  y = headerEnd + 3;

  const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  const infoBarBg: [number, number, number] = isOnline ? [236, 253, 245] : isPsri ? [254, 242, 242] : [240, 244, 248];
  doc.setFillColor(...infoBarBg);
  doc.rect(ML, y - 3.5, CW, 7, 'F');
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...COL_BLACK);
  doc.text(`${patient.uhid}: MR. ${patient.firstName.toUpperCase()} ${patient.lastName.toUpperCase()} (${age}y, ${patient.gender}) - ${patient.phone}`, ML + 2, y - 0.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${dateStr} ${timeStr}`, PW - MR - 2, y - 0.5, { align: 'right' });
  drawHLine(y + 3.5, COL_GRAY, 0.4);
  y += 9;

  // Vitals bar
  if (consultation.vitals) {
    const v = consultation.vitals;
    const vItems: { label: string; value: string }[] = [];
    if (v.bloodPressure) vItems.push({ label: 'BP', value: v.bloodPressure });
    if (v.heartRate) vItems.push({ label: 'Pulse', value: `${v.heartRate} bpm` });
    if (v.temperature) vItems.push({ label: 'Temp', value: `${v.temperature}°F` });
    if (v.spo2) vItems.push({ label: 'SpO2', value: `${v.spo2}%` });
    if (v.weight) vItems.push({ label: 'Wt', value: `${v.weight} kg` });
    if (v.height) vItems.push({ label: 'Ht', value: `${v.height} cm` });
    if (v.bmi) vItems.push({ label: 'BMI', value: `${v.bmi}` });
    if (v.creatinine) vItems.push({ label: 'Creat', value: `${v.creatinine} mg/dL` });
    if (v.egfr) vItems.push({ label: 'eGFR', value: `${v.egfr} mL/min` });
    if (vItems.length > 0) {
      const vitalsBgPdf: [number, number, number] = isOnline ? [236, 253, 245] : isPsri ? [254, 242, 242] : [240, 247, 255];
      doc.setFillColor(...vitalsBgPdf);
      doc.rect(ML, y - 3, CW, 7, 'F');
      doc.setDrawColor(200, 210, 220);
      doc.setLineWidth(0.2);
      doc.line(ML, y - 3, PW - MR, y - 3);
      doc.line(ML, y + 4, PW - MR, y + 4);
      let vx = ML + 2;
      for (const it of vItems) {
        doc.setFontSize(7.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(...accentColor);
        doc.text(`${it.label}:`, vx, y);
        vx += doc.getTextWidth(`${it.label}: `);
        doc.setFont('helvetica', 'normal'); doc.setTextColor(...COL_GRAY);
        doc.text(it.value, vx, y);
        vx += doc.getTextWidth(it.value) + 6;
      }
      y += 8;
    }
  }

  if (labResults.length > 0) {
    const dateGroups: Record<string, PrescriptionPDFLabResult[]> = {};
    labResults.forEach((r) => {
      if (!dateGroups[r.date]) dateGroups[r.date] = [];
      dateGroups[r.date].push(r);
    });
    const sortedDates = Object.keys(dateGroups).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    ensureSpace(8);
    doc.setFontSize(9.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(...COL_BLACK);
    doc.text('Tests/Investigations:', ML, y);
    y += 5;
    doc.setFontSize(8);
    for (const ds of sortedDates) {
      const dateLabel = new Date(ds).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      const tests = dateGroups[ds];
      const line = `[${dateLabel}] ${tests.map((r) => `${r.testName}: ${r.value}${r.unit}`).join(' , ')}`;
      const parts = doc.splitTextToSize(line, CW);
      for (const p of parts) {
        ensureSpace(4);
        doc.setFont('helvetica', 'normal'); doc.setTextColor(...COL_BLACK);
        doc.text(p, ML, y);
        y += 3.5;
      }
    }
    y += 3;
  }

  if (consultation.diagnoses.length > 0) {
    ensureSpace(8);
    doc.setFontSize(9.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(...COL_BLACK);
    doc.text('Diagnosis:', ML, y);
    y += 5;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5);
    const diagText = consultation.diagnoses.map((d) => d.name).join(' , ');
    const diagLines = doc.splitTextToSize(diagText, CW);
    for (const l of diagLines) {
      ensureSpace(4);
      doc.text(l, ML, y);
      y += 4;
    }
    y += 3;
  }

  if (consultation.prescriptions.length > 0) {
    ensureSpace(12);
    doc.setFontSize(16); doc.setFont('helvetica', 'bold'); doc.setTextColor(...COL_BLACK);
    doc.text('Rx', ML, y);
    y += 5;

    const colMed = ML;
    const colDosage = ML + 82;
    const colTiming = ML + 110;
    doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(...COL_GRAY);
    doc.text('Medicine', colMed, y);
    doc.text('Dosage', colDosage + 4, y);
    doc.text('Timing - Freq. - Duration', colTiming, y);
    y += 1.5;
    drawHLine(y, COL_GRAY, 0.4);
    y += 4;

    for (let i = 0; i < consultation.prescriptions.length; i++) {
      const med = consultation.prescriptions[i];
      const nameStr = `${i + 1}) ${med.name} ${med.strength || med.dosage || ''}`.toUpperCase();
      const nameLines = doc.splitTextToSize(nameStr, 74);
      const hasComp = !!(med.genericName && med.genericName !== med.name);
      const hasNotes = !!med.instructions;
      const lineCount = nameLines.length + (hasComp ? 1 : 0) + (hasNotes ? 1 : 0);
      const needed = lineCount * 3.5 + 4;
      ensureSpace(needed);

      const medStartY = y;
      doc.setFontSize(8.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(...COL_BLACK);
      for (const l of nameLines) {
        doc.text(l, colMed, y);
        y += 3.5;
      }
      if (hasComp) {
        doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(85, 85, 85);
        doc.text(`Composition: ${med.genericName}`, colMed, y);
        y += 3.5;
      }
      if (hasNotes) {
        doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(85, 85, 85);
        const noteLines = doc.splitTextToSize(`Notes: ${med.instructions}`, 74);
        for (const nl of noteLines) {
          doc.text(nl, colMed, y);
          y += 3;
        }
      }

      const midY = medStartY + (y - medStartY) / 2 - 1;
      const dp = med.dosage || dosagePattern(med.frequency || '', med.route || '');
      doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(...COL_BLACK);
      doc.text(dp, colDosage + 8, midY, { align: 'center' });
      const timingParts: string[] = [];
      if (med.when) timingParts.push(med.when);
      if (med.frequency) timingParts.push(med.frequency);
      if (med.duration) timingParts.push(med.duration);
      doc.text(timingParts.join(' - '), colTiming, midY);

      drawHLine(y, COL_LIGHT, 0.2);
      y += 2;
    }
    y += 2;
  }

  if (consultation.advice) {
    ensureSpace(8);
    doc.setFontSize(9.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(...COL_BLACK);
    doc.text('Advice:', ML, y);
    y += 5;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5);
    const adviceLines = doc.splitTextToSize(consultation.advice, CW);
    for (const l of adviceLines) {
      ensureSpace(4);
      doc.text(l, ML, y);
      y += 4;
    }
    y += 3;
  }

  if (testRequests.length > 0) {
    ensureSpace(8);
    doc.setFontSize(9.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(...COL_BLACK);
    doc.text('Tests Advised:', ML, y);
    y += 5;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5);
    const testStr = `${testRequestByWhen ? `[after ${testRequestByWhen}] ` : ''}${testRequests.join(' , ')}`;
    const testLines = doc.splitTextToSize(testStr, CW);
    for (const l of testLines) {
      ensureSpace(4);
      doc.text(l, ML, y);
      y += 4;
    }
    y += 3;
  }

  if (consultation.followUpDate) {
    ensureSpace(6);
    doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...COL_BLACK);
    doc.text(`Follow-up: ${consultation.followUpDate}`, ML, y);
    y += 6;
  }

  ensureSpace(14);
  y += 6;
  doc.setFontSize(9.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(...COL_BLACK);
  doc.text('DR. RAJESH GOEL', PW - MR, y, { align: 'right' });
  y += 4;
  doc.setFontSize(7.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(...COL_GRAY);
  doc.text('Sr. Nephrologist', PW - MR, y, { align: 'right' });

  const lastPage = doc.getNumberOfPages();
  const dietChartImg = await loadImg('/diet-chart.png');

  for (let p = 1; p <= lastPage; p++) {
    doc.setPage(p);
    drawHLine(FOOTER_Y, accentColor, 0.7);

    const col1X = ML + 2;
    const col3X = PW - MR - 2;
    const centerColX = PW / 2;
    const leftW = 70;
    const rightW = 70;
    const centerW = 25;

    if (isPsri) {
      doc.setFillColor(248, 250, 252);
      doc.rect(ML, FOOTER_Y, leftW, 16, 'F');
      doc.rect(centerColX - centerW / 2, FOOTER_Y, centerW, 16, 'F');
      doc.rect(PW - MR - rightW, FOOTER_Y, rightW, 16, 'F');

      doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(...COL_RED);
      doc.text('PSRI INSTITUTE OF RENAL SCIENCES', col1X, FOOTER_Y + 3);
      doc.setFontSize(6); doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 100, 100);
      doc.text('Pushpawati Singhania Hospital & Research Institute', col1X, FOOTER_Y + 6);
      doc.text('Press Enclave Marg, Saket, New Delhi - 110017', col1X, FOOTER_Y + 9);
      doc.text('Mon to Sat - 1:00 PM - 7:00 PM', col1X, FOOTER_Y + 12);

      if (dietChartImg) {
        doc.setFillColor(192, 57, 43);
        doc.roundedRect(centerColX - centerW / 2, FOOTER_Y + 1, centerW, 14, 1, 1, 'F');
        putImg(dietChartImg, centerColX - 9, FOOTER_Y + 2, 18, 10);
        doc.setFontSize(5); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255);
        doc.text('Scan for Diet', centerColX, FOOTER_Y + 14, { align: 'center' });
      }

      doc.setFont('helvetica', 'bold'); doc.setTextColor(...COL_RED); doc.setFontSize(7);
      doc.text('Dr. Rajesh Goel', col3X, FOOTER_Y + 3, { align: 'right' });
      doc.setFont('helvetica', 'normal'); doc.setTextColor(85, 85, 85); doc.setFontSize(6);
      doc.text('MBBS, DNB (Internal Medicine), DNB (Nephrology)', col3X, FOOTER_Y + 6, { align: 'right' });
      doc.text('Fellow Kidney Transplant Medicine', col3X, FOOTER_Y + 9, { align: 'right' });
      doc.setDrawColor(...COL_RED); doc.setLineWidth(0.2);
      doc.line(PW - MR - rightW + 4, FOOTER_Y + 10.5, PW - MR - 4, FOOTER_Y + 10.5);
      doc.setFontSize(5.5); doc.setTextColor(100, 100, 100);
      doc.text('+91-11-71471471  |  www.psrihospital.com', col3X, FOOTER_Y + 13, { align: 'right' });
    } else {
      doc.setFillColor(248, 250, 252);
      doc.rect(ML, FOOTER_Y, leftW, 16, 'F');
      doc.rect(centerColX - centerW / 2, FOOTER_Y, centerW, 16, 'F');
      doc.rect(PW - MR - rightW, FOOTER_Y, rightW, 16, 'F');

      if (dietChartImg) {
        doc.setFillColor(9, 81, 135);
        doc.roundedRect(centerColX - centerW / 2, FOOTER_Y + 1, centerW, 14, 1, 1, 'F');
        putImg(dietChartImg, centerColX - 9, FOOTER_Y + 2, 18, 10);
        doc.setFontSize(5); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255);
        doc.text('Diet Chart', centerColX, FOOTER_Y + 14, { align: 'center' });
      }

      doc.setFont('helvetica', 'bold'); doc.setTextColor(...COL_BLUE); doc.setFontSize(7.5);
      doc.text('KIDNEY CARE CENTRE', col3X, FOOTER_Y + 3, { align: 'right' });
      doc.setFont('helvetica', 'normal'); doc.setTextColor(85, 85, 85); doc.setFontSize(6);
      doc.text('Old Faridabad, 18A Main Market', col3X, FOOTER_Y + 6, { align: 'right' });
      doc.text('Mon to Sat - 9:00 AM - 10:30 AM', col3X, FOOTER_Y + 9, { align: 'right' });
      doc.setDrawColor(...COL_BLUE); doc.setLineWidth(0.2);
      doc.line(PW - MR - rightW + 4, FOOTER_Y + 10.5, PW - MR - 4, FOOTER_Y + 10.5);
      doc.setFontSize(5.5); doc.setTextColor(100, 100, 100);
      doc.text('Saket: 13 B, K-Block, Gate no. - 2, Saket', col3X, FOOTER_Y + 13, { align: 'right' });
    }
  }

  return doc.output('blob');
}
