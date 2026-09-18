'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const WHATSAPP_URL = 'https://wa.me/919818235613?text=Hi%2C%20I%20need%20personalized%20diet%20advice%20for%20my%20kidney%20condition.';

const dietRules = [
  { icon: '💉', title: 'Control Blood Sugar', tips: ['Monitor blood sugar regularly', 'Take diabetes medicines on time'], color: 'from-purple-50 to-purple-100 border-purple-200', iconBg: 'bg-purple-100' },
  { icon: '🍚', title: 'Low GI Foods', tips: ['Choose whole grains over refined', 'Avoid white rice, white bread, maida'], color: 'from-blue-50 to-blue-100 border-blue-200', iconBg: 'bg-blue-100' },
  { icon: '🧂', title: 'Control Salt & Sugar', tips: ['No added sugar in food', 'Limit salt to 2g per day'], color: 'from-amber-50 to-amber-100 border-amber-200', iconBg: 'bg-amber-100' },
  { icon: '🍌', title: 'Watch Potassium', tips: ['Limit banana, coconut water, potato', 'Leach potatoes before cooking'], color: 'from-red-50 to-red-100 border-red-200', iconBg: 'bg-red-100' },
];

const recommendedFoods = [
  { group: 'Cereals', options: 'Brown rice, Whole wheat roti, Oats, Dalia', emoji: '🍚' },
  { group: 'Proteins', options: 'Egg white, Fish, Chicken, Soy chunk', emoji: '🥚' },
  { group: 'Vegetables', options: 'Bottle Gourd, Bitter Gourd, Leafy greens', emoji: '🥬' },
  { group: 'Fruits', options: 'Apple, Pear, Papaya (small portions)', emoji: '🍎' },
  { group: 'Snacks', options: 'Roasted chana, Makhana, Sprouts salad', emoji: '🍿' },
];

const foodsToLimit = [
  { food: 'Rice', reason: 'High glycemic index — prefer brown rice', emoji: '🍚' },
  { food: 'Potato', reason: 'High carb + high potassium', emoji: '🥔' },
  { food: 'Mango / Banana', reason: 'Very high sugar + potassium', emoji: '🥭' },
  { food: 'Milk', reason: 'Contains lactose (sugar) + phosphorus', emoji: '🥛' },
  { food: 'Dry Fruits', reason: 'High in calories, potassium & phosphorus', emoji: '🥜' },
];

const foodsToAvoid = [
  { category: 'Sugary Foods', examples: 'Mithai, Chocolate, Cake, Ice cream, Cold drinks', emoji: '🍬' },
  { category: 'Refined Carbs', examples: 'White rice, Maida, White bread, Naan', emoji: '🚫' },
  { category: 'High Potassium', examples: 'Banana, Orange, Coconut water, Dates', emoji: '🍌' },
  { category: 'High Salt', examples: 'Pickles, Papad, Chips, Sauce, Namkeen', emoji: '🧂' },
  { category: 'Others', examples: 'Alcohol, Tobacco, Packaged fruit juice', emoji: '⛔' },
];

const mealPlan = [
  { time: 'Morning', icon: '🌅', items: ['Warm water (empty stomach)', 'Tea without sugar'], color: 'from-orange-100 to-amber-50' },
  { time: 'Breakfast', icon: '🍳', items: ['2 Whole wheat roti', 'Bitter gourd sabzi'], color: 'from-yellow-100 to-orange-50' },
  { time: 'Lunch', icon: '☀️', items: ['Brown rice (small)', 'Dal (limited)', 'Leafy vegetable', 'Cucumber raita'], color: 'from-blue-100 to-sky-50' },
  { time: 'Evening', icon: '🌤️', items: ['Green tea (no sugar)', 'Roasted makhana'], color: 'from-purple-100 to-pink-50' },
  { time: 'Dinner', icon: '🌙', items: ['2 Chapati', 'Vegetable curry', 'Grilled fish (small)'], color: 'from-indigo-100 to-blue-50' },
];

const importantNotes = [
  'Diabetes and CKD together need strict dietary control — do not skip meals.',
  'Monitor blood sugar before and after meals as advised by your doctor.',
  'Keep HbA1c below 7% if possible — even small improvements help kidneys.',
  'Regular eye checks and foot care are essential for diabetic patients.',
];

const dependsOn = [
  { label: 'HbA1c Level', icon: '💉' },
  { label: 'Fasting Sugar', icon: '🩸' },
  { label: 'CKD Stage', icon: '📊' },
  { label: 'Insulin Use', icon: '💊' },
  { label: 'Blood Pressure', icon: '❤️' },
  { label: 'Weight / BMI', icon: '⚖️' },
];

const otherDiets = [
  { title: 'Diet for CKD (Not on Dialysis)', slug: 'ckd', desc: 'Diet guide for early-stage kidney disease patients.', icon: '🫘', color: 'from-blue-50 to-sky-50 border-blue-200' },
  { title: 'Diet for CKD on Dialysis', slug: 'ckd-dialysis', desc: 'Special diet guidelines for patients undergoing dialysis.', icon: '🩸', color: 'from-red-50 to-pink-50 border-red-200' },
  { title: 'Diet After Kidney Transplant', slug: 'kidney-transplant', desc: 'Post-transplant nutrition guide for transplant recipients.', icon: '🫀', color: 'from-green-50 to-emerald-50 border-green-200' },
  { title: 'Diet for Kidney Stones', slug: 'kidney-stones', desc: 'Prevent kidney stones with the right dietary choices.', icon: '💎', color: 'from-amber-50 to-yellow-50 border-amber-200' },
];

export default function DietDiabeticCKDContent() {
  const handleDownloadPDF = useCallback(() => { window.print(); }, []);
  const handleWhatsApp = useCallback(() => { window.open(WHATSAPP_URL, '_blank', 'noopener,noreferrer'); }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        <section className="relative bg-gradient-to-br from-purple-600 via-violet-600 to-purple-800 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-300 rounded-full blur-3xl" />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 relative">
            <nav className="text-purple-200 text-sm mb-6 flex items-center gap-2 flex-wrap">
              <Link href="/" className="hover:text-white transition-colors">Home</Link><span>›</span>
              <Link href="/diet/ckd" className="hover:text-white transition-colors">Diet Guides</Link><span>›</span>
              <span className="text-white">Diet for Diabetic Kidney Disease</span>
            </nav>
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4">
                  Diet for Diabetic<br /><span className="text-purple-200">Kidney Disease</span>
                </h1>
                <p className="text-purple-100 text-base sm:text-lg mb-8 max-w-lg leading-relaxed">
                  Managing diabetes AND kidney disease together requires careful dietary planning. The right food protects both your kidneys and blood sugar.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button onClick={handleDownloadPDF} className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-700 font-bold rounded-xl hover:bg-purple-50 transition-colors shadow-lg cursor-pointer">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Download Diet Chart
                  </button>
                  <button onClick={handleWhatsApp} className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-colors shadow-lg cursor-pointer">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                    WhatsApp for Diet Consultation
                  </button>
                </div>
              </div>
              <div className="hidden lg:flex justify-center">
                <div className="relative w-80 h-80">
                  <div className="absolute inset-0 bg-white/10 rounded-3xl rotate-6" />
                  <div className="relative bg-gradient-to-br from-purple-400 to-violet-500 rounded-3xl flex items-center justify-center text-8xl shadow-2xl">💉🫘</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-gray-900 mb-2">1. Key Diet Rules for Diabetic CKD</h2>
          <div className="w-20 h-1 bg-purple-600 mx-auto rounded-full mb-10" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {dietRules.map((rule, i) => (
              <div key={i} className={`bg-gradient-to-b ${rule.color} border rounded-2xl p-6 text-center hover:shadow-lg transition-shadow`}>
                <div className={`w-16 h-16 ${rule.iconBg} rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4`}>{rule.icon}</div>
                <h3 className="font-bold text-gray-900 text-lg mb-3">{rule.title}</h3>
                <ul className="text-sm text-gray-600 space-y-1.5">
                  {rule.tips.map((tip, j) => (<li key={j} className="flex items-start gap-2"><span className="text-purple-500 mt-0.5">•</span><span>{tip}</span></li>))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-gray-50 py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-green-200 overflow-hidden">
                <div className="bg-green-600 text-white px-6 py-4">
                  <h3 className="font-bold text-lg">2. What to Eat</h3>
                  <span className="inline-flex items-center gap-1 bg-white/20 rounded-full px-3 py-0.5 text-xs font-medium mt-1">✅ Recommended</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {recommendedFoods.map((food, i) => (
                    <div key={i} className="flex items-center px-5 py-3 hover:bg-green-50 transition-colors">
                      <span className="text-2xl mr-3">{food.emoji}</span>
                      <div className="flex-1 min-w-0"><p className="font-semibold text-gray-900 text-sm">{food.group}</p><p className="text-gray-600 text-sm truncate">{food.options}</p></div>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-3 bg-green-50 border-t border-green-100"><p className="text-green-700 text-xs flex items-center gap-1.5"><span>🌿</span> Low GI foods help control both blood sugar and kidney strain.</p></div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-amber-200 overflow-hidden">
                <div className="bg-amber-500 text-white px-6 py-4">
                  <h3 className="font-bold text-lg">3. Limit These</h3>
                  <span className="inline-flex items-center gap-1 bg-white/20 rounded-full px-3 py-0.5 text-xs font-medium mt-1">⚠️ In Moderation</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {foodsToLimit.map((food, i) => (
                    <div key={i} className="flex items-center px-5 py-3 hover:bg-amber-50 transition-colors">
                      <span className="text-2xl mr-3">{food.emoji}</span>
                      <div className="flex-1 min-w-0"><p className="font-semibold text-gray-900 text-sm">{food.food}</p><p className="text-gray-600 text-sm">{food.reason}</p></div>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-3 bg-amber-50 border-t border-amber-100"><p className="text-amber-700 text-xs flex items-center gap-1.5"><span>💡</span> Measure portions carefully — even healthy foods affect blood sugar.</p></div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-red-200 overflow-hidden">
                <div className="bg-red-600 text-white px-6 py-4">
                  <h3 className="font-bold text-lg">4. Avoid Completely</h3>
                  <span className="inline-flex items-center gap-1 bg-white/20 rounded-full px-3 py-0.5 text-xs font-medium mt-1">❌ Strictly Avoid</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {foodsToAvoid.map((food, i) => (
                    <div key={i} className="flex items-center px-5 py-3 hover:bg-red-50 transition-colors">
                      <span className="text-2xl mr-3">{food.emoji}</span>
                      <div className="flex-1 min-w-0"><p className="font-semibold text-gray-900 text-sm">{food.category}</p><p className="text-gray-600 text-sm">{food.examples}</p></div>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-3 bg-red-50 border-t border-red-100"><p className="text-red-700 text-xs flex items-center gap-1.5"><span>⚠️</span> Sugar spikes worsen both diabetes and kidney damage.</p></div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-gray-900 mb-2">5. Sample One-Day Diet Plan</h2>
          <p className="text-center text-gray-500 text-sm mb-10">(Diabetic CKD — Example)</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {mealPlan.map((meal, i) => (
              <div key={i} className={`bg-gradient-to-b ${meal.color} rounded-2xl p-5 text-center border border-white/50 hover:shadow-lg transition-shadow`}>
                <div className="text-3xl mb-2">{meal.icon}</div>
                <h4 className="font-bold text-gray-900 mb-3">{meal.time}</h4>
                <ul className="text-sm text-gray-700 space-y-1">{meal.items.map((item, j) => (<li key={j}>{item}</li>))}</ul>
              </div>
            ))}
          </div>
          <div className="mt-6 bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-start gap-3 max-w-3xl mx-auto">
            <span className="text-purple-600 text-lg mt-0.5">💉</span>
            <p className="text-purple-800 text-sm"><strong>Key point:</strong> Diabetic CKD patients must balance kidney protection AND blood sugar control. Small, frequent meals work best.</p>
          </div>
        </section>

        <section className="bg-gray-50 py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-gray-900 mb-2">6. Important Notes</h2>
            <div className="w-20 h-1 bg-purple-600 mx-auto rounded-full mb-10" />
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                {importantNotes.map((note, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="w-7 h-7 bg-purple-100 rounded-full flex items-center justify-center shrink-0 mt-0.5"><svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></div>
                    <p className="text-gray-700 text-sm leading-relaxed">{note}</p>
                  </div>
                ))}
              </div>
              <div className="bg-gradient-to-br from-purple-600 to-violet-800 rounded-2xl p-8 text-white text-center shadow-xl">
                <div className="w-20 h-20 bg-white/15 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">💉</div>
                <h3 className="text-xl font-bold mb-2">Double Protection Needed</h3>
                <p className="text-purple-200 text-sm mb-6">Your diet depends on:</p>
                <div className="grid grid-cols-2 gap-3">
                  {dependsOn.map((item, i) => (
                    <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-2">
                      <span className="text-lg">{item.icon}</span><span className="text-sm font-medium">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="bg-gradient-to-r from-blue-50 via-white to-green-50 rounded-3xl border border-gray-200 shadow-lg overflow-hidden">
            <div className="grid lg:grid-cols-3 gap-0">
              <div className="p-8 flex flex-col items-center text-center lg:items-start lg:text-left lg:border-r border-gray-200">
                <div className="w-28 h-28 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg">DR</div>
                <h3 className="text-xl font-extrabold text-gray-900">Dr. Rajesh Goel</h3>
                <p className="text-blue-600 font-medium text-sm mb-3">Senior Nephrologist & Kidney Transplant Physician</p>
                <div className="space-y-1.5 text-sm text-gray-600">
                  <p className="flex items-center gap-2"><span className="text-blue-500">🩺</span> 18+ Years Experience</p>
                  <p className="flex items-center gap-2"><span className="text-green-500">👤</span> Thousands of Patients Treated</p>
                  <p className="flex items-center gap-2"><span className="text-purple-500">🏥</span> Expert in CKD, Dialysis & Kidney Transplant</p>
                </div>
              </div>
              <div className="p-8 flex flex-col justify-center items-center text-center border-b lg:border-b-0 lg:border-r border-gray-200">
                <h4 className="text-lg font-bold text-gray-900 mb-2">Diabetic CKD Needs Expert Care</h4>
                <p className="text-gray-600 text-sm mb-5">Get a personalized diet plan that protects both your kidneys and blood sugar.</p>
                <button onClick={handleWhatsApp} className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-colors shadow-md cursor-pointer">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                  WhatsApp for Consultation
                </button>
              </div>
              <div className="p-8 flex flex-col justify-center">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Book an Appointment</h4>
                <div className="space-y-3 text-sm text-gray-700">
                  <p className="flex items-center gap-2"><span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 shrink-0">📅</span><span><strong>OPD:</strong> Monday to Saturday</span></p>
                  <p className="flex items-center gap-2"><span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600 shrink-0">🕐</span><span><strong>Timings:</strong> 1:00 PM – 6:00 PM</span></p>
                </div>
                <Link href="/book-appointment" className="mt-5 block text-center px-5 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow">View Contact Details</Link>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-gray-900 mb-2">More Diet Guides</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {otherDiets.map((diet, i) => (
                <Link key={i} href={`/diet/${diet.slug}`} className={`bg-gradient-to-b ${diet.color} border rounded-2xl p-6 hover:shadow-lg transition-all group`}>
                  <div className="text-4xl mb-3">{diet.icon}</div>
                  <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{diet.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{diet.desc}</p>
                  <span className="inline-flex items-center gap-1 text-blue-600 text-sm font-medium mt-3 group-hover:gap-2 transition-all">Learn more <span>→</span></span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-gray-100 py-6">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <p className="text-gray-500 text-xs text-center leading-relaxed"><strong>Disclaimer:</strong> This dietary advice is general in nature. Please consult your nephrologist or dietitian for a diet plan suitable for you.</p>
          </div>
        </section>
      </main>
      <style jsx global>{`@media print { nav, footer { display: none !important; } main { padding: 0; } section { break-inside: avoid; } }`}</style>
      <Footer />
    </>
  );
}
