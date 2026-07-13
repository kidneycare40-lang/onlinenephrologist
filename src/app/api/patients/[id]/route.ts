import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { authenticateRequest, requirePermission, apiError } from '@/lib/auth/middleware';

interface TimelineEvent {
  id: string;
  type: string;
  date: string;
  title: string;
  description: string | null;
  details: Record<string, unknown> | null;
  doctor: { id: string; first_name: string; last_name: string } | null;
  clinic: { id: string; name: string } | null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error: authError } = await authenticateRequest(request);
  if (authError) return authError;
  const permError = requirePermission(user, 'patients', 'view');
  if (permError) return permError;

  const { id: patientId } = await params;
  const { searchParams } = new URL(request.url);
  const view = searchParams.get('view') || 'timeline';

  try {
    const db = getDb();

    if (view === 'kidney-chart') {
      return await handleKidneyChart(db, patientId);
    }

    return await handleTimeline(db, patientId);

  } catch (error) {
    console.error(`GET /api/patients/[id] (${view}) error:`, error);
    return NextResponse.json([]);
  }
}

async function handleTimeline(db: ReturnType<typeof getDb>, patientId: string) {
  const [
    { data: consultations },
    { data: prescriptions },
    { data: investigations },
    { data: vitals },
    { data: kidneyParams },
    { data: appointments },
    { data: invoices },
    { data: dialysisSessions },
    { data: uploadedReports },
  ] = await Promise.all([
    db
      .from('consultations')
      .select(`
        id, consultation_date, chief_complaint, notes, status,
        doctor:users!consultations_doctor_id_fkey(id, first_name, last_name),
        clinic:clinics!consultations_clinic_id_fkey(id, name),
        diagnoses:diagnoses(id, name, is_primary, icd_code)
      `)
      .eq('patient_id', patientId)
      .eq('is_deleted', false)
      .order('consultation_date', { ascending: false }),

    db
      .from('prescriptions')
      .select(`
        id, prescription_number, prescription_date, diagnosis, notes, status,
        doctor:users!prescriptions_doctor_id_fkey(id, first_name, last_name),
        clinic:clinics!prescriptions_clinic_id_fkey(id, name),
        medicines:prescription_medicines(id, medicine_name, dosage, frequency, duration)
      `)
      .eq('patient_id', patientId)
      .eq('is_deleted', false)
      .order('prescription_date', { ascending: false }),

    db
      .from('investigation_orders')
      .select(`
        id, order_date, status, notes,
        doctor:users!investigation_orders_doctor_id_fkey(id, first_name, last_name),
        clinic:clinics!investigation_orders_clinic_id_fkey(id, name),
        items:investigation_items(id, test_name, result_value, unit, is_abnormal, status)
      `)
      .eq('patient_id', patientId)
      .eq('is_deleted', false)
      .order('order_date', { ascending: false }),

    db
      .from('vitals')
      .select(`
        id, recorded_at, blood_pressure_systolic, blood_pressure_diastolic,
        heart_rate, temperature, weight, height, bmi, oxygen_saturation,
        blood_sugar, notes
      `)
      .eq('patient_id', patientId)
      .eq('is_deleted', false)
      .order('recorded_at', { ascending: false }),

    db
      .from('kidney_parameters')
      .select(`
        id, recorded_at, creatinine, blood_urea, gfr, potassium, sodium,
        calcium, phosphorus, hemoglobin, albumin, proteinuria, uric_acid,
        pth, vitamin_d, bicarbonate, cholesterol_total, notes
      `)
      .eq('patient_id', patientId)
      .eq('is_deleted', false)
      .order('recorded_at', { ascending: false }),

    db
      .from('appointments')
      .select(`
        id, appointment_date, appointment_time, type, status, reason, notes,
        doctor:users!appointments_doctor_id_fkey(id, first_name, last_name),
        clinic:clinics!appointments_clinic_id_fkey(id, name)
      `)
      .eq('patient_id', patientId)
      .eq('is_deleted', false)
      .order('appointment_date', { ascending: false }),

    db
      .from('invoices')
      .select(`
        id, invoice_number, invoice_date, total_amount, paid_amount, status, notes,
        doctor:users!invoices_doctor_id_fkey(id, first_name, last_name),
        clinic:clinics!invoices_clinic_id_fkey(id, name),
        items:invoice_items(id, item_name, quantity, unit_price, total_price)
      `)
      .eq('patient_id', patientId)
      .eq('is_deleted', false)
      .order('invoice_date', { ascending: false }),

    db
      .from('dialysis_sessions')
      .select(`
        id, session_date, session_type, start_time, end_time, duration_minutes,
        pre_weight, post_weight, ultrafiltration_volume, notes,
        doctor:users!dialysis_sessions_doctor_id_fkey(id, first_name, last_name),
        clinic:clinics!dialysis_sessions_clinic_id_fkey(id, name)
      `)
      .eq('patient_id', patientId)
      .eq('is_deleted', false)
      .order('session_date', { ascending: false }),

    db
      .from('uploaded_reports')
      .select(`
        id, title, report_date, category, file_url, file_name, notes
      `)
      .eq('patient_id', patientId)
      .eq('is_deleted', false)
      .order('report_date', { ascending: false }),
  ]);

  const events: TimelineEvent[] = [];

  for (const c of consultations || []) {
    const diagnoses = (c.diagnoses as any[]) || [];
    const primaryDx = diagnoses.find((d: any) => d.is_primary);
    events.push({
      id: c.id,
      type: 'consultation',
      date: c.consultation_date,
      title: primaryDx?.name || c.chief_complaint || 'Consultation',
      description: c.chief_complaint || c.notes || null,
      details: {
        status: c.status,
        diagnoses: diagnoses.map((d: any) => ({ name: d.name, icd_code: d.icd_code, is_primary: d.is_primary })),
      },
      doctor: c.doctor as any || null,
      clinic: c.clinic as any || null,
    });
  }

  for (const p of prescriptions || []) {
    const meds = (p.medicines as any[]) || [];
    events.push({
      id: p.id,
      type: 'prescription',
      date: p.prescription_date,
      title: p.prescription_number || 'Prescription',
      description: p.diagnosis || p.notes || null,
      details: {
        status: p.status,
        medicines: meds.map((m: any) => ({
          name: m.medicine_name,
          dosage: m.dosage,
          frequency: m.frequency,
          duration: m.duration,
        })),
      },
      doctor: p.doctor as any || null,
      clinic: p.clinic as any || null,
    });
  }

  for (const inv of investigations || []) {
    const items = (inv.items as any[]) || [];
    events.push({
      id: inv.id,
      type: 'investigation',
      date: inv.order_date,
      title: `Investigation - ${items.length} test(s)`,
      description: inv.notes || null,
      details: {
        status: inv.status,
        items: items.map((it: any) => ({
          test_name: it.test_name,
          result_value: it.result_value,
          unit: it.unit,
          is_abnormal: it.is_abnormal,
          status: it.status,
        })),
      },
      doctor: inv.doctor as any || null,
      clinic: inv.clinic as any || null,
    });
  }

  for (const v of vitals || []) {
    const parts: string[] = [];
    if (v.blood_pressure_systolic && v.blood_pressure_diastolic) {
      parts.push(`BP: ${v.blood_pressure_systolic}/${v.blood_pressure_diastolic}`);
    }
    if (v.heart_rate) parts.push(`HR: ${v.heart_rate}`);
    if (v.temperature) parts.push(`Temp: ${v.temperature}`);
    if (v.weight) parts.push(`Weight: ${v.weight}kg`);
    if (v.blood_sugar) parts.push(`Sugar: ${v.blood_sugar}`);

    events.push({
      id: v.id,
      type: 'vitals',
      date: v.recorded_at,
      title: parts.length > 0 ? parts.join(', ') : 'Vitals Recorded',
      description: v.notes || null,
      details: {
        blood_pressure_systolic: v.blood_pressure_systolic,
        blood_pressure_diastolic: v.blood_pressure_diastolic,
        heart_rate: v.heart_rate,
        temperature: v.temperature,
        weight: v.weight,
        height: v.height,
        bmi: v.bmi,
        oxygen_saturation: v.oxygen_saturation,
        blood_sugar: v.blood_sugar,
      },
      doctor: null,
      clinic: null,
    });
  }

  for (const kp of kidneyParams || []) {
    const parts: string[] = [];
    if (kp.creatinine != null) parts.push(`Cr: ${kp.creatinine}`);
    if (kp.gfr != null) parts.push(`eGFR: ${kp.gfr}`);
    if (kp.blood_urea != null) parts.push(`BUN: ${kp.blood_urea}`);

    events.push({
      id: kp.id,
      type: 'kidney_parameters',
      date: kp.recorded_at,
      title: parts.length > 0 ? parts.join(', ') : 'Kidney Parameters',
      description: kp.notes || null,
      details: {
        creatinine: kp.creatinine,
        blood_urea: kp.blood_urea,
        gfr: kp.gfr,
        potassium: kp.potassium,
        sodium: kp.sodium,
        calcium: kp.calcium,
        phosphorus: kp.phosphorus,
        hemoglobin: kp.hemoglobin,
        albumin: kp.albumin,
        proteinuria: kp.proteinuria,
        uric_acid: kp.uric_acid,
        pth: kp.pth,
        vitamin_d: kp.vitamin_d,
        bicarbonate: kp.bicarbonate,
        cholesterol_total: kp.cholesterol_total,
      },
      doctor: null,
      clinic: null,
    });
  }

  for (const a of appointments || []) {
    events.push({
      id: a.id,
      type: 'appointment',
      date: a.appointment_date,
      title: `${a.type} Appointment - ${a.status}`,
      description: a.reason || a.notes || null,
      details: {
        appointment_time: a.appointment_time,
        type: a.type,
        status: a.status,
      },
      doctor: a.doctor as any || null,
      clinic: a.clinic as any || null,
    });
  }

  for (const inv of invoices || []) {
    const items = (inv.items as any[]) || [];
    events.push({
      id: inv.id,
      type: 'invoice',
      date: inv.invoice_date,
      title: `${inv.invoice_number} - ₹${inv.total_amount}`,
      description: inv.notes || null,
      details: {
        invoice_number: inv.invoice_number,
        total_amount: inv.total_amount,
        paid_amount: inv.paid_amount,
        status: inv.status,
        items: items.map((it: any) => ({
          name: it.item_name,
          quantity: it.quantity,
          unit_price: it.unit_price,
          total_price: it.total_price,
        })),
      },
      doctor: inv.doctor as any || null,
      clinic: inv.clinic as any || null,
    });
  }

  for (const ds of dialysisSessions || []) {
    const timeRange = ds.start_time && ds.end_time
      ? `${ds.start_time} - ${ds.end_time}`
      : ds.duration_minutes ? `${ds.duration_minutes} min` : '';

    events.push({
      id: ds.id,
      type: 'dialysis',
      date: ds.session_date,
      title: `${ds.session_type} Session${timeRange ? ` (${timeRange})` : ''}`,
      description: ds.notes || null,
      details: {
        session_type: ds.session_type,
        start_time: ds.start_time,
        end_time: ds.end_time,
        duration_minutes: ds.duration_minutes,
        pre_weight: ds.pre_weight,
        post_weight: ds.post_weight,
        ultrafiltration_volume: ds.ultrafiltration_volume,
      },
      doctor: ds.doctor as any || null,
      clinic: ds.clinic as any || null,
    });
  }

  for (const r of uploadedReports || []) {
    events.push({
      id: r.id,
      type: 'report',
      date: r.report_date || r.id,
      title: r.title,
      description: r.notes || null,
      details: {
        category: r.category,
        file_url: r.file_url,
        file_name: r.file_name,
      },
      doctor: null,
      clinic: null,
    });
  }

  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return NextResponse.json(events);
}

async function handleKidneyChart(db: ReturnType<typeof getDb>, patientId: string) {
  const { data: rows, error } = await db
    .from('kidney_parameters')
    .select(`
      id, recorded_at, creatinine, blood_urea, gfr, potassium, sodium,
      calcium, phosphorus, hemoglobin, albumin, uric_acid, pth,
      vitamin_d, bicarbonate, cholesterol_total
    `)
    .eq('patient_id', patientId)
    .eq('is_deleted', false)
    .order('recorded_at', { ascending: true });

  if (error) throw error;

  const data = (rows || []).map((row: any) => ({
    date: row.recorded_at,
    creatinine: row.creatinine,
    blood_urea: row.blood_urea,
    gfr: row.gfr,
    potassium: row.potassium,
    sodium: row.sodium,
    calcium: row.calcium,
    phosphorus: row.phosphorus,
    hemoglobin: row.hemoglobin,
    albumin: row.albumin,
    uric_acid: row.uric_acid,
    pth: row.pth,
    vitamin_d: row.vitamin_d,
    bicarbonate: row.bicarbonate,
    cholesterol_total: row.cholesterol_total,
  }));

  const latest = data.length > 0 ? data[data.length - 1] : null;

  const summary = latest ? {
    creatinine: latest.creatinine,
    gfr: latest.gfr,
    blood_urea: latest.blood_urea,
    potassium: latest.potassium,
    hemoglobin: latest.hemoglobin,
    albumin: latest.albumin,
  } : null;

  return NextResponse.json({
    data,
    summary,
    total_records: data.length,
  });
}
