'use client';

import React, { forwardRef } from 'react';
import type { EMRConsultation, EMRPatient } from '@/types/emr';

interface PrescriptionPrintProps {
  patient: EMRPatient;
  consultation: EMRConsultation;
  consultationDate: string;
  testRequests?: string[];
  testRequestByWhen?: string;
  labResults?: { testName: string; value: string; unit: string; date: string; isAbnormal: boolean }[];
  useLetterhead?: boolean;
  useCustom?: boolean;
  customHeaderImage?: string;
  customFooterImage?: string;
  clinicId?: string;
}

const PrescriptionPrint = forwardRef<HTMLDivElement, PrescriptionPrintProps>(
  ({ patient, consultation, consultationDate, testRequests = [], testRequestByWhen, labResults = [], useLetterhead = false, useCustom = false, customHeaderImage = '', customFooterImage = '', clinicId }, ref) => {
    const isPsri = clinicId === 'psri-delhi';
    const isOnline = clinicId === 'online' || clinicId === 'online-intl';
    const accentColor = isPsri ? '#c0392b' : isOnline ? '#059669' : '#095187';
    const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    const onlineHeaderContent = (
      <div style={{ padding: '0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '6px', borderBottom: `2.5px solid ${accentColor}` }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img src="/images/kidney_logo.png" alt="Online Consultation" style={{ height: '55px', objectFit: 'contain' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <div style={{ width: '1.5px', background: '#999', alignSelf: 'stretch', marginTop: '4px', marginBottom: '6px' }} />
            <div style={{ textAlign: 'right', lineHeight: '1.3' }}>
              <div style={{ fontSize: '15pt', fontWeight: 'bold', color: accentColor }}>Dr. Rajesh Goel</div>
              <div style={{ fontSize: '8.5pt', color: '#333', fontWeight: 'bold' }}>Senior Nephrologist &amp; Kidney Transplant Physician</div>
              <div style={{ fontSize: '8.5pt', color: '#333', fontWeight: 'bold' }}>FELLOW (KIDNEY TRANSPLANT MEDICINE)</div>
              <div style={{ fontSize: '8.5pt', color: '#333', fontWeight: 'bold' }}>DMC/R/734</div>
              <div style={{ fontSize: '9.5pt', color: '#dc2626', fontWeight: 'bold', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="#dc2626"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                +91 9818235688
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', background: '#ecfdf5', borderBottom: '1px solid #ccc', paddingLeft: '12px', paddingRight: '0px', paddingTop: '5px', paddingBottom: '5px', fontSize: '8.5pt' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: accentColor, fontWeight: 'bold' }}>
              <img src="/icons/Web2.png" alt="" style={{ width: '18px', height: '18px' }} />
              onlinenephrologist.com
            </span>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', marginRight: '0px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#0d6b2e', fontWeight: 'bold' }}>
              <img src="/icons/Whatsapp.png" alt="" style={{ width: '22px', height: '22px' }} />
              <span style={{ fontSize: '14pt' }}>+91 9818235613</span>
            </span>
          </div>
        </div>
      </div>
    );

    const kccHeaderContent = (
      <div style={{ padding: '0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '6px', borderBottom: '2.5px solid #095187' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img src="/images/kidney_logo.png" alt="Kidney Care Centre" style={{ height: '55px', objectFit: 'contain' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <div style={{ width: '1.5px', background: '#999', alignSelf: 'stretch', marginTop: '4px', marginBottom: '6px' }} />
            <div style={{ textAlign: 'right', lineHeight: '1.3' }}>
              <div style={{ fontSize: '15pt', fontWeight: 'bold', color: '#095187' }}>Dr. Rajesh Goel</div>
              <div style={{ fontSize: '8.5pt', color: '#333', fontWeight: 'bold' }}>Senior Nephrologist &amp; Kidney Transplant Physician</div>
              <div style={{ fontSize: '8.5pt', color: '#333', fontWeight: 'bold' }}>FELLOW (KIDNEY TRANSPLANT MEDICINE)</div>
              <div style={{ fontSize: '8.5pt', color: '#333', fontWeight: 'bold' }}>DMC/R/734</div>
              <div style={{ fontSize: '9.5pt', color: '#dc2626', fontWeight: 'bold', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="#dc2626"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                +91 9818235688
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', background: '#f0f4f8', borderBottom: '1px solid #ccc', paddingLeft: '12px', paddingRight: '0px', paddingTop: '5px', paddingBottom: '5px', fontSize: '8.5pt' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#095187', fontWeight: 'bold' }}>
              <img src="/icons/Web2.png" alt="" style={{ width: '18px', height: '18px' }} />
              kidneycarecentre.in
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#e1306c', fontWeight: 'bold' }}>
              <img src="/instagram.png" alt="" style={{ width: '18px', height: '18px', borderRadius: '50%' }} />
              @kidneycarecentre
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#FF0000', fontWeight: 'bold' }}>
              <img src="/icons/Youtube.png" alt="" style={{ width: '18px', height: '18px' }} />
              @KidneyCareCentre
            </span>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', marginRight: '0px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#0d6b2e', fontWeight: 'bold' }}>
              <img src="/icons/Whatsapp.png" alt="" style={{ width: '22px', height: '22px' }} />
              <span style={{ fontSize: '14pt' }}>+91 9818235613</span>
            </span>
          </div>
        </div>
      </div>
    );

    const psriHeaderContent = (
      <div style={{ padding: '0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '8px', borderBottom: '2.5px solid #c0392b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/PSRI.jpeg" alt="PSRI Hospital" style={{ height: '80px', objectFit: 'contain' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
          <div style={{ textAlign: 'right', lineHeight: '1.35', paddingTop: '2px' }}>
            <div style={{ fontSize: '13pt', fontWeight: 'bold', color: '#c0392b', letterSpacing: '0.5px' }}>PSRI INSTITUTE OF RENAL SCIENCES</div>
            <div style={{ fontSize: '12pt', fontWeight: 'bold', color: '#000', marginTop: '8px' }}>DR. RAJESH GOEL</div>
            <div style={{ fontSize: '8.5pt', color: '#333', marginTop: '2px' }}>Senior Consultant Nephrology &amp; Kidney Transplant Medicine</div>
            <div style={{ fontSize: '8.5pt', color: '#333' }}>MBBS, DNB (Medicine) DNB (Nephrology)</div>
            <div style={{ fontSize: '8.5pt', color: '#333' }}>Fellow (Kidney Transplant)</div>
            <div style={{ fontSize: '8.5pt', color: '#333' }}>Reg. No. R/0734 (DMC)</div>
            <div style={{ fontSize: '8.5pt', color: '#333', marginTop: '3px' }}>Mon-Saturday 1PM to 7PM</div>
          </div>
        </div>
      </div>
    );

    const kccFooterContent = (
      <div style={{ borderTop: '3px solid #095187', fontSize: '7.5pt', color: '#333', lineHeight: '1.4', background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'stretch' }}>
          <div style={{ flex: 1, padding: '10px 12px', background: '#f8fafc' }}>
            <img src="/PSRI.jpeg" alt="PSRI Hospital" style={{ height: '35px', objectFit: 'contain', marginBottom: '4px' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <div style={{ display: 'flex', gap: '5px', alignItems: 'flex-start', marginBottom: '3px' }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="#095187" style={{ flexShrink: 0, marginTop: '2px' }}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              <span>Press Enclave Marg, Shaikh Sarai - II,<br/>New Delhi - 110017</span>
            </div>
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
              <svg width="9" height="9" viewBox="0 0 24 24" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10" fill="none" stroke="#095187" strokeWidth="2"/><path d="M12 6v6l4 2" fill="none" stroke="#095187" strokeWidth="2"/></svg>
              <span>Mon to Sat - 2:00 PM - 7:00 PM</span>
            </div>
          </div>
          <div style={{ width: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8px 4px', background: '#095187' }}>
            <img src="/diet-chart.png" alt="QR Code" style={{ width: '52px', height: '52px', background: '#fff', borderRadius: '3px', objectFit: 'contain' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <div style={{ color: '#fff', fontSize: '6.5pt', marginTop: '3px', fontWeight: 'bold' }}>Diet Chart</div>
          </div>
          <div style={{ flex: 1, padding: '10px 12px', background: '#f8fafc', textAlign: 'right' }}>
            <div style={{ fontWeight: 'bold', color: '#095187', fontSize: '9.5pt', marginBottom: '5px' }}>KIDNEY CARE CENTRE</div>
            <div style={{ display: 'flex', gap: '5px', alignItems: 'flex-start', marginBottom: '4px', justifyContent: 'flex-end' }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="#095187" style={{ flexShrink: 0, marginTop: '2px' }}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              <span>Old Faridabad, 18A Main Market<br/>Mon to Sat - 9:00 AM - 10:30 AM</span>
            </div>
            <div style={{ borderTop: '1px solid #095187', margin: '4px 0' }} />
            <div style={{ display: 'flex', gap: '5px', alignItems: 'flex-start', justifyContent: 'flex-end' }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="#095187" style={{ flexShrink: 0, marginTop: '2px' }}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              <div>
                <span style={{ fontWeight: 'bold', color: '#095187' }}>Residence cum clinic</span><br/>
                <span>13 B, K-Block, Gate no. - 2, Saket</span><br/>
                <span>(By Appointment Only)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    const psriFooterContent = (
      <div style={{ borderTop: '3px solid #c0392b', fontSize: '7.5pt', color: '#333', lineHeight: '1.4', background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'stretch' }}>
          <div style={{ flex: 1, padding: '10px 12px', background: '#f8fafc' }}>
            <div style={{ fontWeight: 'bold', color: '#c0392b', fontSize: '9pt', marginBottom: '2px' }}>PSRI INSTITUTE OF RENAL SCIENCES</div>
            <div style={{ fontSize: '7pt', color: '#666', marginBottom: '4px' }}>Pushpawati Singhania Hospital &amp; Research Institute</div>
            <div style={{ display: 'flex', gap: '5px', alignItems: 'flex-start', marginBottom: '3px' }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="#c0392b" style={{ flexShrink: 0, marginTop: '2px' }}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              <span>Press Enclave Marg, Saket,<br/>New Delhi - 110017</span>
            </div>
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
              <svg width="9" height="9" viewBox="0 0 24 24" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10" fill="none" stroke="#c0392b" strokeWidth="2"/><path d="M12 6v6l4 2" fill="none" stroke="#c0392b" strokeWidth="2"/></svg>
              <span>Mon to Sat - 1:00 PM - 7:00 PM</span>
            </div>
          </div>
          <div style={{ width: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8px 4px', background: '#c0392b' }}>
            <img src="/diet-chart.png" alt="QR Code" style={{ width: '52px', height: '52px', background: '#fff', borderRadius: '3px', objectFit: 'contain' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <div style={{ color: '#fff', fontSize: '6.5pt', marginTop: '3px', fontWeight: 'bold' }}>Scan for Diet</div>
          </div>
          <div style={{ flex: 1, padding: '10px 12px', background: '#f8fafc', textAlign: 'right' }}>
            <div style={{ fontWeight: 'bold', color: '#c0392b', fontSize: '9pt', marginBottom: '4px' }}>Dr. Rajesh Goel</div>
            <div style={{ fontSize: '7pt', color: '#555', marginBottom: '4px', lineHeight: '1.5' }}>
              MBBS, DNB (Internal Medicine), DNB (Nephrology)<br/>
              Fellow Kidney Transplant Medicine
            </div>
            <div style={{ borderTop: '1px solid #c0392b', margin: '4px 0' }} />
            <div style={{ fontSize: '7pt', color: '#666', lineHeight: '1.5' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <svg width="8" height="8" viewBox="0 0 24 24" fill="#666"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                +91-11-71471471
              </span>
              &nbsp;&nbsp;|&nbsp;&nbsp;
              <span>www.psrihospital.com</span>
            </div>
          </div>
        </div>
      </div>
    );

    const headerContent = !useLetterhead && !useCustom && (isPsri ? psriHeaderContent : isOnline ? onlineHeaderContent : kccHeaderContent);
    const footerContent = !useLetterhead && !useCustom && (isPsri ? psriFooterContent : kccFooterContent);

    function frequencyToDosagePattern(freq: string, route: string): string {
      const f = (freq || '').toLowerCase();
      const r = (route || '').toLowerCase();
      if (r === 'sc' || r === 'iv' || f.includes('week')) return '0 - 0 - 0';
      if (f.includes('thrice') || f.includes('three times') || f.includes('3 times') || f.includes('tds') || f.includes('tid')) return '1 - 1 - 1';
      if (f.includes('twice') || f.includes('2 times') || f.includes('bd') || f.includes('two times')) return '1 - 0 - 1';
      if (f.includes('once') || f.includes('1 time') || f.includes('od') || f.includes('daily')) return '1 - 0 - 0';
      if (f.includes('needed') || f.includes('prn') || f.includes('sos') || f.includes('stat')) return 'SOS';
      return '1 - 0 - 0';
    }

    return (
      <div
        ref={ref}
        style={{
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: '10pt',
          lineHeight: '1.35',
          color: '#000',
          background: '#fff',
          width: '100%',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <table className="rx-prescription-table" style={{ width: '100%', borderCollapse: 'collapse', borderSpacing: 0, flex: '1 0 auto' }}>
          <thead>
            <tr>
              <td style={{ padding: 0, borderBottom: 'none' }}>
                {useCustom && customHeaderImage ? (
                  <div style={{ width: '100%' }}>
                    <img src={customHeaderImage} alt="Custom Header" style={{ width: '100%', display: 'block', objectFit: 'contain' }} />
                  </div>
                ) : headerContent}
              </td>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td style={{ padding: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', fontSize: '10pt', borderBottom: '1.5px solid #333' }}>
                  <div style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '10pt' }}>
                    <strong>{patient.uhid}</strong>: MR. {patient.firstName.toUpperCase()} {patient.lastName.toUpperCase()} ({age}y, {patient.gender}) - {patient.phone}
                  </div>
                  <div style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '10pt' }}>
                    Date &amp; Time: {dateStr} {timeStr}
                  </div>
                </div>

                <div style={{ padding: '4px 10px', fontSize: '8.5pt', borderBottom: '1px solid #eee' }}>
                  <span style={{ fontWeight: 'bold', color: accentColor }}>Source: {(() => {
                    if (clinicId === 'psri-delhi') return 'PSRI Walk-In';
                    if (clinicId === 'online-intl') return 'International Consultation';
                    if (clinicId === 'online') return 'Online Consultation';
                    if ((patient as any).source === 'website') return 'KCC - Website Booking';
                    return 'KCC Walk-In';
                  })()}</span>
                </div>

                {(() => {
                  const v = consultation.vitals;
                  const items: { label: string; value: string }[] = [];
                  if (v.bloodPressure) items.push({ label: 'BP', value: v.bloodPressure });
                  if (v.heartRate) items.push({ label: 'Pulse', value: `${v.heartRate} bpm` });
                  if (v.temperature) items.push({ label: 'Temp', value: `${v.temperature}°F` });
                  if (v.spo2) items.push({ label: 'SpO2', value: `${v.spo2}%` });
                  if (v.weight) items.push({ label: 'Wt', value: `${v.weight} kg` });
                  if (v.height) items.push({ label: 'Ht', value: `${v.height} cm` });
                  if (v.bmi) items.push({ label: 'BMI', value: `${v.bmi} kg/m²` });
                  if (v.creatinine) items.push({ label: 'Creat', value: `${v.creatinine} mg/dL` });
                  if (v.egfr) items.push({ label: 'eGFR', value: `${v.egfr} mL/min` });
                  if (items.length === 0) return null;
                  const vitalsBg = isOnline ? '#ecfdf5' : isPsri ? '#fef2f2' : '#f0f7ff';
                  const vitalsLabelColor = isOnline ? '#059669' : isPsri ? '#c0392b' : '#095187';
                  return (
                    <div style={{ padding: '5px 10px', fontSize: '8.5pt', background: vitalsBg, borderBottom: '1px solid #ddd', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                      {items.map((it, idx) => (
                        <span key={idx} style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                          <span style={{ fontWeight: 'bold', color: vitalsLabelColor }}>{it.label}:</span>{' '}
                          <span style={{ color: '#333' }}>{it.value}</span>
                        </span>
                      ))}
                    </div>
                  );
                })()}
              </td>
            </tr>
            <tr>
              <td style={{ padding: 0 }}>

                {labResults.length > 0 && (() => {
                  const dateGroups: Record<string, typeof labResults> = {};
                  labResults.forEach((r) => {
                    const d = r.date;
                    if (!dateGroups[d]) dateGroups[d] = [];
                    dateGroups[d].push(r);
                  });
                  const sortedDates = Object.keys(dateGroups).sort((a, b) => {
                    const da = new Date(a);
                    const db = new Date(b);
                    return db.getTime() - da.getTime();
                  });
                  return (
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '10.5pt', fontWeight: 'bold', marginBottom: '4px' }}>Tests/Investigations:</div>
                      {sortedDates.map((ds) => {
                        const dateLabel = new Date(ds).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                        const tests = dateGroups[ds];
                        return (
                          <div key={ds} style={{ fontSize: '9pt', lineHeight: '1.6', marginBottom: '2px' }}>
                            <span style={{ fontWeight: 'bold' }}>[{dateLabel}]</span>{' '}
                            {tests.map((r, i) => (
                              <span key={i}>
                                {i > 0 && ' , '}
                                <span>{r.testName} :</span>
                                <span style={{ color: r.isAbnormal ? '#dc2626' : '#000', fontWeight: r.isAbnormal ? 'bold' : 'normal' }}> {r.value}</span>
                                <span> {r.unit}</span>
                              </span>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {consultation.diagnoses.length > 0 && (
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '10.5pt', fontWeight: 'bold', marginBottom: '4px' }}>Diagnosis:</div>
                    <div style={{ fontSize: '9.5pt', lineHeight: '1.6' }}>
                      {consultation.diagnoses.map((d) => d.name).join(' , ')}
                    </div>
                  </div>
                )}

                {consultation.prescriptions.length > 0 && (
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ fontSize: '18pt', fontWeight: 'bold', color: '#000', marginBottom: '4px', fontFamily: 'serif' }}>&#8478;</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9pt', tableLayout: 'fixed' }}>
                      <colgroup>
                        <col style={{ width: '48%' }} />
                        <col style={{ width: '16%' }} />
                        <col style={{ width: '36%' }} />
                      </colgroup>
                      <thead>
                        <tr style={{ borderBottom: '1.5px solid #333' }}>
                          <th style={{ textAlign: 'left', padding: '3px 4px', fontWeight: 'bold', color: '#333' }}>Medicine</th>
                          <th style={{ textAlign: 'center', padding: '3px 4px', fontWeight: 'bold', color: '#333' }}>Dosage</th>
                          <th style={{ textAlign: 'left', padding: '3px 4px', fontWeight: 'bold', color: '#333' }}>Timing - Freq. - Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        {consultation.prescriptions.map((med, i) => {
                          const timingParts: string[] = [];
                          if (med.when) timingParts.push(med.when);
                          if (med.frequency) timingParts.push(med.frequency);
                          if (med.duration) timingParts.push(med.duration);
                          const timingStr = timingParts.join(' - ');
                          const nameWithDose = `${med.name} ${med.strength || med.dosage}`.toUpperCase();
                          const dosagePattern = med.dosage || frequencyToDosagePattern(med.frequency, med.route);
                          return (
                            <tr key={i} className="rx-medicine-row" style={{ borderBottom: '0.5px solid #e5e7eb', pageBreakInside: 'avoid' }}>
                              <td style={{ padding: '5px 4px', verticalAlign: 'top', wordWrap: 'break-word' }}>
                                <div style={{ fontWeight: 'bold', color: '#000', fontSize: '9.5pt', lineHeight: '1.3' }}>{i + 1}) {nameWithDose}</div>
                                {med.genericName && med.genericName !== med.name && (
                                  <div style={{ fontSize: '8pt', color: '#555', lineHeight: '1.3', marginTop: '1px' }}>Composition : {med.genericName}</div>
                                )}
                                {med.instructions && (
                                  <div style={{ fontSize: '8pt', color: '#555', lineHeight: '1.3', marginTop: '1px' }}>Notes : {med.instructions}</div>
                                )}
                              </td>
                              <td style={{ padding: '5px 4px', verticalAlign: 'top', textAlign: 'center', whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: '9.5pt' }}>{dosagePattern}</td>
                              <td style={{ padding: '5px 4px', verticalAlign: 'top', fontSize: '9pt', lineHeight: '1.3' }}>
                                {timingStr}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {consultation.advice && (
                  <div className="rx-advice-block" style={{ marginBottom: '12px', pageBreakInside: 'avoid' }}>
                    <div style={{ fontSize: '10.5pt', fontWeight: 'bold', marginBottom: '2px' }}>Advice:</div>
                    <div style={{ fontSize: '9.5pt', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{consultation.advice}</div>
                  </div>
                )}

                {testRequests.length > 0 && (
                  <div className="rx-tests-block" style={{ marginBottom: '12px', pageBreakInside: 'avoid' }}>
                    <div style={{ fontSize: '10.5pt', fontWeight: 'bold', marginBottom: '2px' }}>Tests Advised:</div>
                    <div style={{ fontSize: '9.5pt', lineHeight: '1.5' }}>
                      {testRequestByWhen ? `[after ${testRequestByWhen}] ` : ''}{testRequests.join(' , ')}
                    </div>
                  </div>
                )}

                {consultation.followUpDate && (
                  <div style={{ fontSize: '10pt', marginBottom: '12px' }}>
                    <strong>Follow-up:</strong> {consultation.followUpDate}
                  </div>
                )}

                <div className="rx-signature" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', pageBreakInside: 'avoid' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '10.5pt', fontWeight: 'bold' }}>DR. RAJESH GOEL</div>
                    <div style={{ fontSize: '8.5pt', color: '#555' }}>Sr. Nephrologist</div>
                  </div>
                </div>

              </td>
            </tr>
          </tbody>
        </table>

        {footerContent && (
          <div className="rx-footer" style={{ marginTop: 'auto', flexShrink: 0 }}>{footerContent}</div>
        )}

        {useCustom && customFooterImage && (
          <div className="rx-footer" style={{ width: '100%', marginTop: 'auto', flexShrink: 0 }}>
            <img src={customFooterImage} alt="Custom Footer" style={{ width: '100%', display: 'block', objectFit: 'contain' }} />
          </div>
        )}
      </div>
    );
  }
);

PrescriptionPrint.displayName = 'PrescriptionPrint';
export default PrescriptionPrint;
