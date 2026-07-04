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

interface PrescriptionPDFConsultation {
  prescriptions: PrescriptionPDFMedicine[];
  diagnoses: PrescriptionPDFDiagnosis[];
  advice?: string;
  followUpDate?: string;
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
  const FOOTER_H = 18;
  const FOOTER_Y = PH - FOOTER_H - 5;
  const MAX_Y = FOOTER_Y - 10;
  let y = 10;
  const isPsri = clinicId === 'psri-delhi';
  const accentColor = isPsri ? COL_RED : COL_BLUE;

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
    putImg(logoData, ML, y, isPsri ? 25 : 18, isPsri ? 15 : 18);
  }

  if (isPsri) {
    let ty = y + 4;
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
  } else {
    let ty = y + 4;
    doc.setFontSize(13); doc.setFont('helvetica', 'bold'); doc.setTextColor(...COL_BLUE);
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

  const headerEnd = y + (isPsri ? 26 : 22);
  drawHLine(headerEnd, accentColor, 0.7);
  y = headerEnd + 3;

  const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  doc.setFillColor(240, 244, 248);
  doc.rect(ML, y - 3.5, CW, 7, 'F');
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...COL_BLACK);
  doc.text(`${patient.uhid}: MR. ${patient.firstName.toUpperCase()} ${patient.lastName.toUpperCase()} (${age}y, ${patient.gender}) - ${patient.phone}`, ML + 2, y - 0.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${dateStr} ${timeStr}`, PW - MR - 2, y - 0.5, { align: 'right' });
  drawHLine(y + 3.5, COL_GRAY, 0.4);
  y += 9;

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

  const lastPage = doc.getNumberOfPages();
  for (let p = 1; p <= lastPage; p++) {
    doc.setPage(p);
    drawHLine(FOOTER_Y, accentColor, 0.7);
    doc.setFontSize(6.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(...COL_GRAY);

    if (isPsri) {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(...COL_RED);
      doc.text('PSRI INSTITUTE OF RENAL SCIENCES', ML + 2, FOOTER_Y + 3);
      doc.setFontSize(6); doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 100, 100);
      doc.text('Pushpawati Singhania Hospital & Research Institute', ML + 2, FOOTER_Y + 6);
      doc.text('Press Enclave Marg, Saket, New Delhi - 110017', ML + 2, FOOTER_Y + 9);
      doc.text('Mon to Sat - 1:00 PM - 7:00 PM', ML + 2, FOOTER_Y + 12);
      doc.setFont('helvetica', 'bold'); doc.setTextColor(...COL_RED); doc.setFontSize(7);
      doc.text('Dr. Rajesh Goel', PW - MR - 2, FOOTER_Y + 3, { align: 'right' });
      doc.setFont('helvetica', 'normal'); doc.setTextColor(85, 85, 85); doc.setFontSize(6);
      doc.text('MBBS, DNB (Internal Medicine), DNB (Nephrology)', PW - MR - 2, FOOTER_Y + 6, { align: 'right' });
      doc.text('+91-11-71471471 | www.psrihospital.com', PW - MR - 2, FOOTER_Y + 9, { align: 'right' });
    } else {
      doc.text('Faridabad: Old Faridabad, 18A Main Market', ML + 2, FOOTER_Y + 3);
      doc.text('Mon to Sat - 9:00 AM - 10:30 AM', ML + 2, FOOTER_Y + 6);
      doc.setFont('helvetica', 'bold'); doc.setTextColor(...COL_BLUE); doc.setFontSize(7.5);
      doc.text('KIDNEY CARE CENTRE', PW - MR - 2, FOOTER_Y + 3, { align: 'right' });
      doc.setFont('helvetica', 'normal'); doc.setTextColor(85, 85, 85); doc.setFontSize(6);
      doc.text('Saket: 13 B, K-Block, Gate no. - 2, Saket (By Appointment)', PW - MR - 2, FOOTER_Y + 6, { align: 'right' });
      doc.text('Mon to Sat - 2:00 PM - 7:00 PM', PW - MR - 2, FOOTER_Y + 9, { align: 'right' });
    }
  }

  return doc.output('blob');
}
