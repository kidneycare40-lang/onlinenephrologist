// Service layer barrel exports
// Usage: import { getPatientService, getConsultationService } from '@/lib/db/services';

export { PatientService, getPatientService, PatientRepository } from './patient-service';
export { ConsultationService, getConsultationService, ConsultationRepository, DiagnosisRepository, PrescriptionRepository, VitalsRepository, KidneyParameterRepository, InvestigationRepository } from './consultation-service';
export { AppointmentService, getAppointmentService, AppointmentRepository } from './appointment-service';
export { BillingService, getBillingService, InvoiceRepository, PaymentRepository } from './billing-service';
export { DashboardService, getDashboardService } from './dashboard-service';
export { SettingsService, getSettingsService, ClinicRepository, UserRepository, SettingRepository, LetterheadRepository } from './settings-service';
