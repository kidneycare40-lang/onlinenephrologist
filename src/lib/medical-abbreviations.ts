export interface Abbreviation {
  id: string;
  term: string;
  fullName: string;
  description: string;
  category: string;
  example?: string;
  frequency?: string;
  timesPerDay?: number;
  icon: string;
}

export interface AbbreviationCategory {
  id: string;
  label: string;
  icon: string;
  description: string;
}

export const abbreviationCategories: AbbreviationCategory[] = [
  { id: 'frequency', label: 'Dosage Frequency', icon: '🕐', description: 'How often to take medicine' },
  { id: 'timing', label: 'Timing', icon: '⏰', description: 'When to take medicine' },
  { id: 'route', label: 'Route of Administration', icon: '💉', description: 'How medicine is given' },
  { id: 'dose', label: 'Dose Instructions', icon: '💊', description: 'How much medicine to take' },
  { id: 'duration', label: 'Duration', icon: '📅', description: 'How long to take medicine' },
  { id: 'special', label: 'Special Instructions', icon: '⚠️', description: 'Important notes on the prescription' },
];

export const abbreviations: Abbreviation[] = [
  // Dosage Frequency
  { id: 'od', term: 'OD', fullName: 'Once Daily (Omne Die)', description: 'Take the medicine once a day, preferably at the same time each day.', category: 'frequency', example: 'Telma 40 mg OD — take one tablet every morning', timesPerDay: 1, icon: '1️⃣' },
  { id: 'bd', term: 'BD', fullName: 'Twice Daily (Bis Die)', description: 'Take the medicine two times a day, usually morning and evening, at equal intervals.', category: 'frequency', example: 'Pantocid 40 mg BD — take one tablet before breakfast and one before dinner', timesPerDay: 2, icon: '2️⃣' },
  { id: 'tds', term: 'TDS', fullName: 'Three Times Daily (Ter Die Sumendus)', description: 'Take the medicine three times a day, ideally every 8 hours (morning, afternoon, night).', category: 'frequency', example: 'Sevelamer 800 mg TDS — take with each meal', timesPerDay: 3, icon: '3️⃣' },
  { id: 'qid', term: 'QID', fullName: 'Four Times Daily (Quater In Die)', description: 'Take the medicine four times a day, usually every 6 hours.', category: 'frequency', example: 'Insulin QID — before each meal and at bedtime', timesPerDay: 4, icon: '4️⃣' },
  { id: 'sos', term: 'SOS', fullName: 'As Needed (Si Opus Sit)', description: 'Take the medicine only when you need it — when symptoms occur. Do not take regularly.', category: 'frequency', example: 'Crocin 650 mg SOS — take only when you have fever or pain', timesPerDay: 0, icon: '🆘' },
  { id: 'prn', term: 'PRN', fullName: 'As Required (Pro Re Nata)', description: 'Take as required based on symptoms. Similar to SOS but may have a minimum interval between doses.', category: 'frequency', example: 'Drotin SOS for abdominal cramps — take when pain occurs', timesPerDay: 0, icon: '📋' },
  { id: 'stat', term: 'STAT', fullName: 'Immediately (Statim)', description: 'Take or administer the medicine immediately — this is urgent.', category: 'frequency', example: 'Inj. Adrenaline 1 mg STAT — give immediately in emergency', timesPerDay: 0, icon: '🚨' },

  // Timing
  { id: 'hs', term: 'HS', fullName: 'At Bedtime (Hora Somni)', description: 'Take the medicine at night before going to sleep.', category: 'timing', example: 'Clonazepam 0.25 mg HS — take at bedtime for sleep', icon: '🌙' },
  { id: 'ac', term: 'AC', fullName: 'Before Meals (Ante Cibum)', description: 'Take the medicine 30 minutes before eating food.', category: 'timing', example: 'Pantocid 40 mg AC — take 30 min before breakfast', icon: '🍽️' },
  { id: 'pc', term: 'PC', fullName: 'After Meals (Post Cibum)', description: 'Take the medicine after eating food, usually within 30 minutes of a meal.', category: 'timing', example: 'Wysolone PC — take after breakfast', icon: '✅' },
  { id: 'am', term: 'AM', fullName: 'Morning (Ante Meridiem)', description: 'Take the medicine in the morning.', category: 'timing', example: 'Amlodipine 5 mg AM — take in the morning', icon: '🌅' },
  { id: 'pm', term: 'PM', fullName: 'Evening (Post Meridiem)', description: 'Take the medicine in the evening.', category: 'timing', example: 'Montair LC PM — take in the evening', icon: '🌇' },
  { id: 'npo', term: 'NPO', fullName: 'Nothing by Mouth (Nil Per Os)', description: 'Do not eat or drink anything — usually before surgery or certain tests.', category: 'timing', example: 'NPO after midnight before surgery', icon: '🚫' },
  { id: 'bb', term: 'BB', fullName: 'Before Breakfast', description: 'Take the medicine first thing in the morning before eating.', category: 'timing', example: 'Rantac 150 mg BB — take before breakfast', icon: '🥣' },
  { id: 'ab', term: 'AB', fullName: 'After Breakfast', description: 'Take the medicine after having breakfast.', category: 'timing', example: 'Wysolone AB — take after breakfast', icon: '🍳' },

  // Route of Administration
  { id: 'po', term: 'PO', fullName: 'By Mouth (Per Os)', description: 'Take the medicine by mouth — oral route.', category: 'route', example: 'Tab. Crocin 500 mg PO', icon: '👄' },
  { id: 'sc', term: 'SC', fullName: 'Subcutaneous', description: 'Injection given under the skin using a small needle.', category: 'route', example: 'Inj. Erythropoietin 10,000 units SC', icon: '💉' },
  { id: 'im', term: 'IM', fullName: 'Intramuscular', description: 'Injection given into the muscle using a longer needle.', category: 'route', example: 'Inj. Vitocofol 2 ml IM', icon: '💪' },
  { id: 'iv', term: 'IV', fullName: 'Intravenous', description: 'Injection or infusion given directly into the vein.', category: 'route', example: 'Inj. Meropenem 1 gm IV in 100 ml NS over 1 hr', icon: '🩸' },
  { id: 'ivpb', term: 'IVPB', fullName: 'Intravenous Piggyback', description: 'A small volume IV infusion connected to a running IV line.', category: 'route', example: 'Inj. Vancomycin 1 gm IVPB over 1 hr', icon: '🏥' },
  { id: 'topical', term: 'TOP', fullName: 'Topical', description: 'Apply directly on the skin surface.', category: 'route', example: 'Moisturizing lotion TOP — apply on skin', icon: '🧴' },
  { id: 'sl', term: 'SL', fullName: 'Sublingual', description: 'Place under the tongue — dissolves quickly for fast action.', category: 'route', example: 'Tab. Nitroglycerin 0.5 mg SL', icon: '👅' },
  { id: 'inhalation', term: 'INH', fullName: 'Inhalation', description: 'Breathe in through mouth — for respiratory medicines.', category: 'route', example: 'Salbutamol inhaler INH — 2 puffs', icon: '🫁' },
  { id: 'ocular', term: 'OU / OD / OS', fullName: 'Both Eyes / Right Eye / Left Eye', description: 'Ophthalmic — for eye drops. OU = both eyes, OD = right, OS = left.', category: 'route', example: 'Eye drops OD — put in right eye only', icon: '👁️' },

  // Dose Instructions
  { id: 'dc', term: 'DC', fullName: 'Discontinue', description: 'Stop taking this medicine — do not continue.', category: 'dose', example: 'DC Tab. Metformin — stop immediately', icon: '🛑' },
  { id: 'cc', term: 'CC', fullName: 'With Meals (Cum Cibo)', description: 'Take the medicine with food.', category: 'dose', example: 'Sevelamer 800 mg CC — take with each meal', icon: '🍽️' },
  { id: 'hs-dose', term: 'HS', fullName: 'Half Strength / Half Tablet', description: 'Can also mean half dose or half tablet when used with dose instructions.', category: 'dose', example: 'Tab. Cefexime 200 mg HS if creatinine > 3', icon: '½' },
  { id: 'tab', term: 'TAB', fullName: 'Tablet', description: 'Solid oral dosage form — swallow with water.', category: 'dose', example: 'TAB Amlodipine 5 mg', icon: '💊' },
  { id: 'cap', term: 'CAP', fullName: 'Capsule', description: 'Oral dosage form in a gelatin shell — swallow whole.', category: 'dose', example: 'CAP Doxycycline 100 mg', icon: '💊' },
  { id: 'syp', term: 'SYP', fullName: 'Syrup', description: 'Liquid oral medicine — measure dose carefully.', category: 'dose', example: 'SYP Ascorl 5 ml thrice daily', icon: '🧴' },
  { id: 'inj', term: 'INJ', fullName: 'Injection', description: 'Medicine given by injection — SC, IM, or IV.', category: 'dose', example: 'INJ Erythropoietin 10,000 units SC weekly', icon: '💉' },

  // Duration
  { id: 'x-days', term: '× 5 days', fullName: 'For 5 Days', description: 'Take the medicine for a total of 5 days.', category: 'duration', example: 'Augmentin 625 mg BD × 5 days', icon: '📅' },
  { id: 'x-weeks', term: '× 8 weeks', fullName: 'For 8 Weeks', description: 'Take the medicine for 8 weeks.', category: 'duration', example: 'Cholecalciferol 60,000 IU weekly × 8 weeks', icon: '📆' },
  { id: 'x-months', term: '× 3 months', fullName: 'For 3 Months', description: 'Take the medicine for 3 months.', category: 'duration', example: 'Iron supplement × 3 months', icon: '🗓️' },
  { id: 'course', term: 'Course', fullName: 'Full Course', description: 'Complete the entire prescribed course — do not stop early even if you feel better.', category: 'duration', example: 'Complete the full course of antibiotics', icon: '✅' },

  // Special Instructions
  { id: 'pcn-test', term: 'Test Dose', fullName: 'Test Dose Before Main Dose', description: 'A small initial dose given to check for allergic reaction before giving the full dose.', category: 'special', example: 'Ferric Carboxymaltose — give test dose first', icon: '🧪' },
  { id: 'monitor', term: 'Monitor', fullName: 'Regular Monitoring Required', description: 'Blood tests or clinical monitoring needed while on this medicine.', category: 'special', example: 'Telma — monitor creatinine and potassium at 1 week, 3 weeks, then monthly', icon: '📊' },
  { id: 'taper', term: 'Taper', fullName: 'Gradually Reduce Dose', description: 'Do not stop suddenly — gradually reduce the dose over days/weeks under supervision.', category: 'special', example: 'Wysolone (Prednisolone) — taper under nephrologist guidance', icon: '📉' },
  { id: 'avoid', term: 'Avoid', fullName: 'Do Not Take With', description: 'Avoid taking this medicine with specific foods or other medicines.', category: 'special', example: 'Oral iron — avoid milk, calcium, antacids within 2 hours', icon: '🚫' },
  { id: 'empty-stomach', term: 'Empty Stomach', fullName: 'On Empty Stomach', description: 'Take the medicine when stomach is empty — usually 1 hour before or 2 hours after food.', category: 'special', example: 'Pantocid DSR — on empty stomach', icon: '🫙' },
  { id: 'with-food', term: 'With Food', fullName: 'Take With Meals', description: 'Always take this medicine with food to prevent stomach upset or improve absorption.', category: 'special', example: 'Sevelamer — take with each meal for phosphate binding', icon: '🍽️' },
  { id: 'crush', term: 'Do Not Crush', fullName: 'Swallow Whole', description: 'Take the tablet/capsule whole — do not crush, chew, or break.', category: 'special', example: 'Sevelamer tablets — do not crush', icon: '💊' },
  { id: 'sugar-free', term: 'Sugar-Free', fullName: 'Use Sugar-Free Formulation', description: 'Use the sugar-free version — important for diabetic patients.', category: 'special', example: 'Ascorl syrup — use sugar-free if diabetic', icon: '🆓' },
];

export function getAbbreviationsByCategory(categoryId: string): Abbreviation[] {
  return abbreviations.filter((a) => a.category === categoryId);
}

export function searchAbbreviations(query: string): Abbreviation[] {
  const q = query.toLowerCase();
  return abbreviations.filter(
    (a) =>
      a.term.toLowerCase().includes(q) ||
      a.fullName.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q) ||
      a.example?.toLowerCase().includes(q)
  );
}
