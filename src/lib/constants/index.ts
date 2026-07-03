export const SITE_CONFIG = {
  name: 'Online Nephrologist',
  title: 'Online Nephrologist - Best Nephrologist in Delhi | Book Appointment Online',
  description:
    'Consult Dr Rajesh Goel, best nephrologist in Delhi with 18+ years experience. Book online or in-clinic appointment for CKD, dialysis, kidney transplant, hypertension & kidney stones. AI-powered EMR system for seamless kidney care.',
  url: 'https://onlinenephrologist.com',
  ogImage: '/images/dr-rajesh-goel.png',
  phone: '+919818235613',
  emergencyPhone: '+919818235688',
  whatsapp: '919818235613',
  email: 'info@onlinenephrologist.com',
  address: 'Delhi, India',
  author: 'Dr Rajesh Goel',
  youtubeChannelId: 'UC_LyzbuGmdoH7f51gWeH6yA',
  youtubeHandle: '@KidneyCareCentre',
  whatsappChannel: 'https://whatsapp.com/channel/0029Va9MG1xDTkK1Sm6ncW2q',
};

export const NAVIGATION = {
  main: [
    { label: 'Home', href: '/' },
    { label: 'Dr Rajesh Goel', href: '/dr-rajesh-goel' },
    { label: 'Medical Tourism', href: '/medical-tourism' },
    { label: 'Videos', href: '/videos' },
    { label: 'Book Appointment', href: '/book-appointment' },
    { label: 'Kidney Conditions', href: '/conditions' },
    { label: 'Kidney Tests', href: '/tests-for-kidney-disease' },
    { label: 'EMR System', href: '/emr/login' },
  ],
  footer: [
    {
      title: 'Services',
      links: [
        { label: 'Online Consultation', href: '/book-appointment?type=online' },
        { label: 'In-Clinic Visit', href: '/book-appointment?type=offline' },
        { label: 'CKD Management', href: '/conditions#ckd' },
        { label: 'Kidney Tests', href: '/tests-for-kidney-disease' },
        { label: 'Kidney Transplant', href: '/conditions#transplant' },
        { label: 'Dialysis', href: '/conditions#dialysis' },
      ],
    },
    {
      title: 'Doctor',
      links: [
        { label: 'Dr Rajesh Goel', href: '/dr-rajesh-goel' },
        { label: 'Book Appointment', href: '/book-appointment' },
        { label: 'Clinic Locations', href: '/dr-rajesh-goel#clinics' },
      ],
    },
    {
      title: 'EMR System',
      links: [
        { label: 'Login', href: '/emr/login' },
        { label: 'Dashboard', href: '/emr/dashboard' },
      ],
    },
    {
      title: 'Contact',
      links: [
        { label: '+91 9818235613', href: 'tel:+919818235613' },
        { label: 'WhatsApp', href: 'https://wa.me/919818235613' },
        { label: 'info@onlinenephrologist.com', href: 'mailto:info@onlinenephrologist.com' },
      ],
    },
  ],
};

export const TREATMENTS = [];
export const BLOG_CATEGORIES = [];
export const CALCULATORS = [];
export const LOCATIONS = [];
export const DOCTOR_INFO = {
  name: 'Dr Rajesh Goel',
  slug: 'dr-rajesh-goel',
  title: 'Senior Nephrologist & Kidney Transplant Physician',
  qualifications: ['MBBS', 'DNB Internal Medicine', 'DNB Nephrology', 'Fellow Kidney Transplant Medicine'],
  experience: 18,
  regNo: 'DMC/R/734',
  specializations: [
    'Chronic Kidney Disease (CKD)',
    'Dialysis Management',
    'Kidney Transplant',
    'Hypertension',
    'Diabetic Kidney Disease',
    'Kidney Stones',
    'Electrolyte Disorders',
    'Glomerular Diseases',
  ],
  bio: 'Dr Rajesh Goel is a Senior Nephrologist and Kidney Transplant Physician with over 18 years of experience. He is a Fellow in Kidney Transplant Medicine and is dedicated to providing comprehensive kidney care with a patient-first approach.',
  clinics: [
    {
      name: 'Kidney Care Centre - Faridabad',
      address: 'Old Faridabad, 18A Main Market, Faridabad, Haryana',
      timing: 'Mon to Sat - 9:00 AM - 10:30 AM',
      type: 'offline',
    },
    {
      name: 'Kidney Care Centre - Saket',
      address: '13 B, K-Block, Gate no. - 2, Saket, New Delhi',
      timing: 'Mon to Sun - 9:00 PM - 11:00 PM',
      type: 'offline',
      byAppointment: true,
    },
    {
      name: 'PSRI Hospital, New Delhi',
      address: 'Press Enclave Marg, Shaikh Sarai - II, New Delhi - 110017',
      timing: 'Mon to Sat - 1:00 PM - 7:00 PM',
      type: 'offline',
    },
    {
      name: 'Online Consultation',
      address: 'Video/Phone Consultation from anywhere',
      timing: 'Mon to Sun - 7:00 AM - 11:00 PM',
      type: 'online',
    },
  ],
  languages: ['English', 'Hindi'],
  education: [
    'MBBS',
    'DNB Internal Medicine - National Board of Examinations, New Delhi',
    'DNB Nephrology - National Board of Examinations, New Delhi',
    'Fellow Kidney Transplant Medicine',
  ],
};
export const WORKING_DAYS = [1, 2, 3, 4, 5, 6];
export const WORKING_HOURS = { start: 9, end: 18 };
export const APPOINTMENT_DURATION = 30;
export const CONSULTATION_FEE = 500;
