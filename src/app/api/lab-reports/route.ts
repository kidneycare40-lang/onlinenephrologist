import { NextRequest, NextResponse } from 'next/server';
import { getLabReportService } from '@/lib/db/services';
import { authenticateRequest, requirePermission, applyRateLimit, apiError } from '@/lib/auth/middleware';

export async function POST(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'api');
    if (rlError) return rlError;

    const { user, error: authError } = await authenticateRequest(request);
    if (authError) return authError;

    const permError = requirePermission(user, 'patients', 'edit');
    if (permError) return permError;

    const body = await request.json();
    const { patient_id, title, category, file_url, file_name, file_size, mime_type, report_date, notes, consultation_id, labValues } = body;

    if (!patient_id) return apiError('Patient ID is required', 400);
    if (!labValues || !Array.isArray(labValues) || labValues.length === 0) {
      return apiError('At least one lab value is required', 400);
    }

    const labReportService = getLabReportService();

    // 1. Save the uploaded report record
    const report = await labReportService.uploadReport({
      patient_id,
      title: title || 'Lab Report',
      category: category || 'lab_report',
      file_url: file_url || '',
      file_name: file_name || null,
      file_size: file_size || null,
      mime_type: mime_type || null,
      report_date: report_date || new Date().toISOString().split('T')[0],
      notes: notes || null,
      uploaded_by: user!.userId,
      consultation_id: consultation_id || null,
    });

    // 2. Save lab values to investigation_orders + investigation_items + kidney_parameters
    const result = await labReportService.saveLabValuesToEMR({
      patient_id,
      consultation_id: consultation_id || null,
      doctor_id: user!.userId,
      clinic_id: body.clinic_id || 'kcc-faridabad',
      labValues,
      reportTitle: title || 'Lab Report',
    });

    return NextResponse.json({
      success: true,
      report,
      investigationOrderId: result.investigationOrderId,
      kidneyParamsSaved: result.kidneyParamsSaved,
      labValuesSaved: labValues.length,
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/lab-reports error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'api');
    if (rlError) return rlError;

    const { user, error: authError } = await authenticateRequest(request);
    if (authError) return authError;

    const permError = requirePermission(user, 'patients', 'view');
    if (permError) return permError;

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    if (!patientId) return apiError('Patient ID is required', 400);

    const labReportService = getLabReportService();
    const reports = await labReportService.getPatientReports(patientId);

    return NextResponse.json(reports);
  } catch (error) {
    console.error('GET /api/lab-reports error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'api');
    if (rlError) return rlError;

    const { user, error: authError } = await authenticateRequest(request);
    if (authError) return authError;

    const permError = requirePermission(user, 'patients', 'edit');
    if (permError) return permError;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return apiError('Report ID is required', 400);

    const labReportService = getLabReportService();
    const success = await labReportService.deleteReport(id);
    if (!success) return apiError('Report not found', 404);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/lab-reports error:', error);
    return apiError('Internal server error', 500);
  }
}
