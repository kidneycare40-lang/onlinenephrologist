import { BaseRepository } from './base-repository';
import { getDb } from '../client';
import { KidneyParameterRepository } from './consultation-service';
import type {
  UploadedReport,
  InvestigationOrder,
  InvestigationItem,
  KidneyParameter,
  KidneyParameterCreate,
} from '../types';

// ============================================================
// Uploaded Report Repository
// ============================================================

export class UploadedReportRepository extends BaseRepository<UploadedReport> {
  constructor() {
    super('uploaded_reports');
  }

  async findByPatientId(patientId: string, limit = 50): Promise<UploadedReport[]> {
    const { data, error } = await this.db
      .from('uploaded_reports')
      .select('*')
      .eq('patient_id', patientId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) return [];
    return (data || []) as UploadedReport[];
  }

  async findByPatientAndCategory(patientId: string, category: string): Promise<UploadedReport[]> {
    const { data, error } = await this.db
      .from('uploaded_reports')
      .select('*')
      .eq('patient_id', patientId)
      .eq('category', category)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) return [];
    return (data || []) as UploadedReport[];
  }
}

// ============================================================
// Investigation Item Repository (for saving OCR results)
// ============================================================

export class InvestigationItemRepository {
  protected get db() { return getDb(); }

  async createMany(items: Partial<InvestigationItem>[]): Promise<InvestigationItem[]> {
    if (items.length === 0) return [];
    const { data, error } = await this.db
      .from('investigation_items')
      .insert(items as any)
      .select();

    if (error) {
      console.error('Error creating investigation items:', error);
      return [];
    }
    return (data || []) as InvestigationItem[];
  }

  async findByOrderId(orderId: string): Promise<InvestigationItem[]> {
    const { data, error } = await this.db
      .from('investigation_items')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at');

    if (error) return [];
    return (data || []) as InvestigationItem[];
  }
}

// ============================================================
// Lab Report Service
// ============================================================

// Map OCR test names to kidney_parameters column names
const KIDNEY_PARAM_MAP: Record<string, keyof KidneyParameterCreate> = {
  'Serum Creatinine': 'creatinine',
  'Creatinine': 'creatinine',
  'Blood Urea': 'blood_urea',
  'BUN': 'blood_urea',
  'eGFR': 'gfr',
  'GFR': 'gfr',
  'Serum Potassium': 'potassium',
  'Potassium': 'potassium',
  'Serum Sodium': 'sodium',
  'Sodium': 'sodium',
  'Serum Calcium': 'calcium',
  'Calcium': 'calcium',
  'Serum Phosphorus': 'phosphorus',
  'Phosphorus': 'phosphorus',
  'Hemoglobin': 'hemoglobin',
  'Hb': 'hemoglobin',
  'Serum Albumin': 'albumin',
  'Albumin': 'albumin',
  'Serum Uric Acid': 'uric_acid',
  'Uric Acid': 'uric_acid',
  'Intact PTH': 'pth',
  'PTH': 'pth',
  'Vitamin D': 'vitamin_d',
  'Total Cholesterol': 'cholesterol_total',
  'Cholesterol': 'cholesterol_total',
};

// Reference ranges for abnormal value detection
const REFERENCE_RANGES: Record<string, { low: number; high: number }> = {
  'Serum Creatinine': { low: 0.6, high: 1.2 },
  'eGFR': { low: 60, high: 999 },
  'Blood Urea': { low: 10, high: 50 },
  'Serum Potassium': { low: 3.5, high: 5.5 },
  'Serum Sodium': { low: 135, high: 145 },
  'Serum Calcium': { low: 8.5, high: 10.5 },
  'Serum Phosphorus': { low: 2.5, high: 4.5 },
  'Hemoglobin': { low: 12, high: 17 },
  'Serum Albumin': { low: 3.5, high: 5.5 },
  'HbA1c': { low: 4, high: 5.7 },
  'Blood Glucose': { low: 70, high: 140 },
  'Serum Uric Acid': { low: 3.5, high: 7.2 },
  'Intact PTH': { low: 10, high: 65 },
  'Vitamin D': { low: 30, high: 100 },
  'Total Cholesterol': { low: 0, high: 200 },
  'LDL Cholesterol': { low: 0, high: 100 },
  'HDL Cholesterol': { low: 40, high: 999 },
  'Triglycerides': { low: 0, high: 150 },
  'WBC Count': { low: 4000, high: 11000 },
  'Platelet Count': { low: 150000, high: 400000 },
};

function isAbnormal(testName: string, value: string): boolean {
  const range = REFERENCE_RANGES[testName];
  if (!range) return false;
  const num = parseFloat(value);
  if (isNaN(num)) return false;
  return num < range.low || num > range.high;
}

function categorizeTest(testName: string): string {
  const name = testName.toLowerCase();
  if (['creatinine', 'blood urea', 'bun', 'egfr', 'gfr', 'uric acid', 'proteinuria'].some(k => name.includes(k.toLowerCase()))) return 'Kidney Function';
  if (['sodium', 'potassium', 'calcium', 'phosphorus', 'bicarbonate'].some(k => name.includes(k.toLowerCase()))) return 'Electrolytes';
  if (['hemoglobin', 'hb', 'hematocrit', 'rbc', 'wbc', 'platelet', 'neutrophil', 'lymphocyte'].some(k => name.includes(k.toLowerCase()))) return 'Hematology';
  if (['glucose', 'sugar', 'hba1c'].some(k => name.includes(k.toLowerCase()))) return 'Diabetes';
  if (['albumin', 'bilirubin', 'sgot', 'sgpt', 'alp', 'ggt', 'protein'].some(k => name.includes(k.toLowerCase()))) return 'Liver Function';
  if (['cholesterol', 'ldl', 'hdl', 'triglyceride', 'vldl'].some(k => name.includes(k.toLowerCase()))) return 'Lipid Profile';
  if (['pth', 'vitamin d', 'vitamin b12', 'ferritin', 'iron'].some(k => name.includes(k.toLowerCase()))) return 'Minerals & Vitamins';
  if (['tsh', 't3', 't4'].some(k => name.includes(k.toLowerCase()))) return 'Thyroid';
  if (['urine'].some(k => name.includes(k.toLowerCase()))) return 'Urinalysis';
  return 'Other';
}

export class LabReportService {
  private uploadRepo = new UploadedReportRepository();
  private itemRepo = new InvestigationItemRepository();
  private kidneyRepo = new KidneyParameterRepository();

  async uploadReport(data: {
    patient_id: string;
    title: string;
    category?: string;
    file_url: string;
    file_name?: string;
    file_size?: number;
    mime_type?: string;
    report_date?: string;
    notes?: string;
    uploaded_by?: string;
    consultation_id?: string;
  }): Promise<UploadedReport | null> {
    return this.uploadRepo.create({
      patient_id: data.patient_id,
      title: data.title,
      category: data.category || 'lab_report',
      file_url: data.file_url,
      file_name: data.file_name || null,
      file_size: data.file_size || null,
      mime_type: data.mime_type || null,
      report_date: data.report_date || new Date().toISOString().split('T')[0],
      notes: data.notes || null,
      uploaded_by: data.uploaded_by || null,
      consultation_id: data.consultation_id || null,
    } as Partial<UploadedReport>);
  }

  async getPatientReports(patientId: string): Promise<UploadedReport[]> {
    return this.uploadRepo.findByPatientId(patientId);
  }

  async saveLabValuesToEMR(data: {
    patient_id: string;
    consultation_id?: string;
    doctor_id?: string;
    clinic_id?: string;
    labValues: { testName: string; value: string; unit: string; normalRange?: string }[];
    reportTitle?: string;
    report_date?: string;
  }): Promise<{ investigationOrderId: string | null; kidneyParamsSaved: boolean }> {
    const db = getDb();
    let investigationOrderId: string | null = null;
    let kidneyParamsSaved = false;
    const reportDate = data.report_date || new Date().toISOString().split('T')[0];

    // 1. Create investigation order
    if (data.labValues.length > 0) {
      const { data: order, error: orderErr } = await db
        .from('investigation_orders')
        .insert({
          patient_id: data.patient_id,
          doctor_id: data.doctor_id || 'doctor-default',
          clinic_id: data.clinic_id || 'kcc-faridabad',
          consultation_id: data.consultation_id || null,
          order_date: reportDate,
          status: 'COMPLETED',
          notes: data.reportTitle || 'Lab values from uploaded report',
        } as any)
        .select()
        .single();

      if (!orderErr && order) {
        investigationOrderId = order.id;

        // 2. Create investigation items
        const items = data.labValues.map(v => ({
          order_id: order.id,
          test_name: v.testName,
          category: categorizeTest(v.testName),
          result_value: v.value,
          unit: v.unit,
          normal_range: v.normalRange || null,
          is_abnormal: isAbnormal(v.testName, v.value),
          status: 'Completed' as const,
          result_date: reportDate,
        }));

        await this.itemRepo.createMany(items);
      }
    }

    // 3. Save kidney parameters
    const kidneyData: Partial<KidneyParameterCreate> = { patient_id: data.patient_id };
    let hasKidneyData = false;

    for (const v of data.labValues) {
      const col = KIDNEY_PARAM_MAP[v.testName];
      if (col) {
        const num = parseFloat(v.value);
        if (!isNaN(num)) {
          (kidneyData as any)[col] = num;
          hasKidneyData = true;
        }
      }
    }

    if (hasKidneyData) {
      kidneyData.recorded_at = new Date(reportDate + 'T00:00:00').toISOString();
      if (data.consultation_id) kidneyData.consultation_id = data.consultation_id;
      const result = await this.kidneyRepo.create(kidneyData as any);
      kidneyParamsSaved = !!result;
    }

    return { investigationOrderId, kidneyParamsSaved };
  }

  async deleteReport(id: string): Promise<boolean> {
    return this.uploadRepo.softDelete(id);
  }
}

// Singleton
let _labReportService: LabReportService | null = null;
export function getLabReportService(): LabReportService {
  if (!_labReportService) _labReportService = new LabReportService();
  return _labReportService;
}
