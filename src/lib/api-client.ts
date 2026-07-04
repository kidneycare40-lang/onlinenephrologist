// API Client - Thin wrapper around fetch for all EMR API calls

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(body.error || res.statusText, res.status);
  }

  return res.json();
}

export const api = {
  get: <T>(url: string) => request<T>(url),
  post: <T>(url: string, body: unknown) =>
    request<T>(url, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(url: string, body: unknown) =>
    request<T>(url, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (url: string) => request<{ success: boolean }>(url, { method: 'DELETE' }),
};

// Convenience builders
export const patientsApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get<any>(`/api/patients${qs}`);
  },
  get: (id: string) => api.get<any>(`/api/patients?id=${id}`),
  getByUHID: (uhid: string) => api.get<any>(`/api/patients?uhid=${uhid}`),
  search: (q: string) => api.get<any[]>(`/api/patients?q=${encodeURIComponent(q)}`),
  create: (data: any) => api.post<any>('/api/patients', data),
  update: (id: string, data: any) => api.put<any>('/api/patients', { id, ...data }),
  delete: (id: string) => api.delete(`/api/patients?id=${id}`),
};

export const appointmentsApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get<any>(`/api/appointments${qs}`);
  },
  getByDateRange: (start: string, end: string, doctorId?: string) => {
    const qs = new URLSearchParams({ startDate: start, endDate: end });
    if (doctorId) qs.set('doctorId', doctorId);
    return api.get<any[]>(`/api/appointments?${qs}`);
  },
  getByDoctorAndDate: (doctorId: string, date: string) =>
    api.get<any[]>(`/api/appointments?doctorId=${doctorId}&date=${date}`),
  create: (data: any) => api.post<any>('/api/appointments', data),
  updateStatus: (id: string, status: string) =>
    api.put<any>('/api/appointments', { id, status }),
  cancel: (id: string) =>
    api.put<any>('/api/appointments', { id, action: 'cancel' }),
  reschedule: (id: string, newDate: string, newTime: string) =>
    api.put<any>('/api/appointments', { id, action: 'reschedule', newDate, newTime }),
  delete: (id: string) => api.delete(`/api/appointments?id=${id}`),
};

export const consultationsApi = {
  get: (id: string) => api.get<any>(`/api/consultations?id=${id}`),
  getByPatient: (patientId: string) =>
    api.get<any[]>(`/api/consultations?patientId=${patientId}`),
  create: (data: any) => api.post<any>('/api/consultations', data),
  update: (id: string, data: any) => api.put<any>('/api/consultations', { id, ...data }),
  complete: (id: string) =>
    api.put<any>('/api/consultations', { id, action: 'complete' }),
  delete: (id: string) => api.delete(`/api/consultations?id=${id}`),
};

export const prescriptionsApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get<any>(`/api/prescriptions${qs}`);
  },
  get: (id: string) => api.get<any>(`/api/prescriptions?id=${id}`),
  getByPatient: (patientId: string) =>
    api.get<any[]>(`/api/prescriptions?patientId=${patientId}`),
  getTemplates: () => api.get<any[]>('/api/prescriptions?templates=true'),
  create: (data: any) => api.post<any>('/api/prescriptions', data),
  update: (id: string, data: any) => api.put<any>('/api/prescriptions', { id, ...data }),
  delete: (id: string) => api.delete(`/api/prescriptions?id=${id}`),
};

export const vitalsApi = {
  get: (patientId: string, type?: string) => {
    const qs = new URLSearchParams({ patientId });
    if (type) qs.set('type', type);
    return api.get<{ latest: any; history?: any[]; trend?: any[] }>(`/api/vitals?${qs}`);
  },
  create: (data: any) => api.post<any>('/api/vitals', data),
};

export const billingApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get<any>(`/api/billing${qs}`);
  },
  get: (id: string) => api.get<any>(`/api/billing?id=${id}`),
  getByPatient: (patientId: string) =>
    api.get<any[]>(`/api/billing?patientId=${patientId}`),
  create: (data: any) => api.post<any>('/api/billing', data),
  update: (id: string, data: any) => api.put<any>('/api/billing', { id, ...data }),
  recordPayment: (data: any) =>
    api.post<any>('/api/billing', { ...data, action: 'record_payment' }),
  delete: (id: string) => api.delete(`/api/billing?id=${id}`),
};

export const dashboardApi = {
  getStats: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get<any>(`/api/dashboard${qs}`);
  },
  getTodayAppointments: (params?: Record<string, string>) => {
    const qs = new URLSearchParams({ section: 'today-appointments', ...params });
    return api.get<any[]>(`/api/dashboard?${qs}`);
  },
  getRevenue: (params?: Record<string, string>) => {
    const qs = new URLSearchParams({ section: 'revenue', ...params });
    return api.get<any[]>(`/api/dashboard?${qs}`);
  },
};

export const settingsApi = {
  getAll: (clinicId?: string) => {
    const qs = clinicId ? `?clinicId=${clinicId}` : '';
    return api.get<Record<string, any>>(`/api/settings${qs}`);
  },
  getSettings: (clinicId?: string) => {
    const qs = clinicId ? `?clinicId=${clinicId}` : '';
    return api.get<any[]>(`/api/settings${qs}`);
  },
  get: (key: string, clinicId?: string) => {
    const qs = new URLSearchParams({ key });
    if (clinicId) qs.set('clinicId', clinicId);
    return api.get<{ key: string; value: any }>(`/api/settings?${qs}`);
  },
  set: (key: string, value: any, clinicId?: string) =>
    api.post<any>('/api/settings', { key, value, clinicId }),
  upsertSetting: (key: string, value: any, clinicId?: string) =>
    api.post<any>('/api/settings', { key, value, clinicId }),
  getClinics: () => api.get<any[]>('/api/settings?section=clinics'),
  createClinic: (data: any) =>
    api.post<any>('/api/settings', { ...data, action: 'create_clinic' }),
  updateClinic: (id: string, data: any) =>
    api.put<any>('/api/settings', { id, ...data, action: 'update_clinic' }),
  deleteClinic: (id: string) =>
    api.delete(`/api/settings?id=${id}&section=clinics`),
  getDoctors: (clinicId?: string) => {
    const qs = clinicId ? `?section=doctors&clinicId=${clinicId}` : '?section=doctors';
    return api.get<any[]>(`/api/settings${qs}`);
  },
  createDoctor: (data: any) =>
    api.post<any>('/api/settings', { ...data, action: 'create_user' }),
  updateDoctor: (id: string, data: any) =>
    api.put<any>('/api/settings', { id, ...data, action: 'update_user' }),
  deleteDoctor: (id: string) =>
    api.delete(`/api/settings?id=${id}&section=users`),
  getLetterheads: (clinicId?: string) => {
    const qs = clinicId ? `?section=letterheads&clinicId=${clinicId}` : '?section=letterheads';
    return api.get<any[]>(`/api/settings${qs}`);
  },
  upsertLetterhead: (clinicId: string, data: any) =>
    api.post<any>('/api/settings', { ...data, clinic_id: clinicId, action: 'create_letterhead' }),
};

// ============================================================
// TEMPLATE APIs
// ============================================================

export const complaintTemplatesApi = {
  list: (params?: { category?: string; search?: string }) => {
    const qs = new URLSearchParams({ type: 'complaints' });
    if (params?.category) qs.set('category', params.category);
    if (params?.search) qs.set('search', params.search);
    return api.get<any[]>(`/api/templates?${qs}`);
  },
  create: (data: any) => api.post<any>('/api/templates', { type: 'complaints', ...data }),
  update: (id: string, data: any) => api.put<any>('/api/templates', { type: 'complaints', id, ...data }),
  delete: (id: string) => api.delete(`/api/templates?type=complaints&id=${id}`),
};

export const diagnosisTemplatesApi = {
  list: (params?: { category?: string; ckdStage?: number; search?: string }) => {
    const qs = new URLSearchParams({ type: 'diagnoses' });
    if (params?.category) qs.set('category', params.category);
    if (params?.ckdStage) qs.set('ckdStage', String(params.ckdStage));
    if (params?.search) qs.set('search', params.search);
    return api.get<any[]>(`/api/templates?${qs}`);
  },
  create: (data: any) => api.post<any>('/api/templates', { type: 'diagnoses', ...data }),
  update: (id: string, data: any) => api.put<any>('/api/templates', { type: 'diagnoses', id, ...data }),
  delete: (id: string) => api.delete(`/api/templates?type=diagnoses&id=${id}`),
};

export const medicinesApi = {
  search: (params: { q?: string; category?: string; form?: string; nephrotoxic?: boolean; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params.q) qs.set('q', params.q);
    if (params.category) qs.set('category', params.category);
    if (params.form) qs.set('form', params.form);
    if (params.nephrotoxic !== undefined) qs.set('nephrotoxic', String(params.nephrotoxic));
    if (params.limit) qs.set('limit', String(params.limit));
    return api.get<any[]>(`/api/medicines?${qs}`);
  },
  create: (data: any) => api.post<any>('/api/medicines', data),
};

export const medicineTemplatesApi = {
  list: (params?: { category?: string; search?: string }) => {
    const qs = new URLSearchParams();
    if (params?.category) qs.set('category', params.category);
    if (params?.search) qs.set('search', params.search);
    const query = qs.toString();
    return api.get<any[]>(`/api/medicine-templates${query ? `?${query}` : ''}`);
  },
  get: (id: string) => api.get<any>(`/api/medicine-templates?id=${id}`),
  create: (data: any) => api.post<any>('/api/medicine-templates', data),
  update: (id: string, data: any) => api.put<any>('/api/medicine-templates', { id, ...data }),
  delete: (id: string) => api.delete(`/api/medicine-templates?id=${id}`),
};

export const investigationTemplatesApi = {
  list: (params?: { category?: string; search?: string }) => {
    const qs = new URLSearchParams();
    if (params?.category) qs.set('category', params.category);
    if (params?.search) qs.set('search', params.search);
    const query = qs.toString();
    return api.get<any[]>(`/api/investigation-templates${query ? `?${query}` : ''}`);
  },
  get: (id: string) => api.get<any>(`/api/investigation-templates?id=${id}`),
  create: (data: any) => api.post<any>('/api/investigation-templates', data),
  update: (id: string, data: any) => api.put<any>('/api/investigation-templates', { id, ...data }),
  delete: (id: string) => api.delete(`/api/investigation-templates?id=${id}`),
};

export const adviceTemplatesApi = {
  list: (params?: { category?: string; search?: string }) => {
    const qs = new URLSearchParams();
    if (params?.category) qs.set('category', params.category);
    if (params?.search) qs.set('search', params.search);
    const query = qs.toString();
    return api.get<any[]>(`/api/advice-templates${query ? `?${query}` : ''}`);
  },
  get: (id: string) => api.get<any>(`/api/advice-templates?id=${id}`),
  create: (data: any) => api.post<any>('/api/advice-templates', data),
  update: (id: string, data: any) => api.put<any>('/api/advice-templates', { id, ...data }),
  delete: (id: string) => api.delete(`/api/advice-templates?id=${id}`),
};
