'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, Car, Bike, MapPin, Clock, FileText,
  Heart, Send, CheckCircle, Loader, AlertCircle
} from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';
import { DriverApplicationFormData, VehicleType } from '@/lib/types/driver';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const } }
};

const AREAS = [
  { id: 'dimona', en: 'Dimona', he: 'דימונה' },
  { id: 'beer-sheva', en: 'Beer Sheva', he: 'באר שבע' },
  { id: 'arad', en: 'Arad', he: 'ערד' },
  { id: 'yerucham', en: 'Yerucham', he: 'ירוחם' },
  { id: 'village-of-peace', en: 'Village of Peace', he: 'כפר השלום' },
  { id: 'mitzpe-ramon', en: 'Mitzpe Ramon', he: 'מצפה רמון' },
];

const AVAILABILITY = [
  { id: 'morning', en: 'Morning (6am-12pm)', he: 'בוקר (6:00-12:00)' },
  { id: 'afternoon', en: 'Afternoon (12pm-6pm)', he: 'צהריים (12:00-18:00)' },
  { id: 'evening', en: 'Evening (6pm-10pm)', he: 'ערב (18:00-22:00)' },
  { id: 'weekends', en: 'Weekends', he: 'סופי שבוע' },
];

const VEHICLE_TYPES: { value: VehicleType; en: string; he: string; icon: typeof Car }[] = [
  { value: 'car', en: 'Car', he: 'מכונית', icon: Car },
  { value: 'scooter', en: 'Scooter', he: 'קטנוע', icon: Bike },
  { value: 'bicycle', en: 'Bicycle', he: 'אופניים', icon: Bike },
  { value: 'ebike', en: 'E-Bike', he: 'אופניים חשמליים', icon: Bike },
];

export default function DriverApplicationForm() {
  const { language, isRTL } = useLanguage();
  const isHe = language === 'he';

  const [formData, setFormData] = useState<DriverApplicationFormData>({
    fullName: '',
    email: '',
    phone: '',
    idNumber: '',
    vehicleType: 'car',
    licenseNumber: '',
    areas: [],
    availability: [],
    experience: '',
    whyJoin: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [applicationId, setApplicationId] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const toggleCheckbox = (field: 'areas' | 'availability', value: string) => {
    setFormData(prev => {
      const arr = prev[field];
      return {
        ...prev,
        [field]: arr.includes(value)
          ? arr.filter(v => v !== value)
          : [...arr, value],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (!formData.fullName.trim()) {
      setError(isHe ? 'נא למלא שם מלא' : 'Please enter your full name');
      return;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError(isHe ? 'נא למלא כתובת אימייל תקינה' : 'Please enter a valid email');
      return;
    }
    if (!formData.phone.trim()) {
      setError(isHe ? 'נא למלא מספר טלפון' : 'Please enter your phone number');
      return;
    }
    if (formData.areas.length === 0) {
      setError(isHe ? 'נא לבחור לפחות אזור אחד' : 'Please select at least one delivery area');
      return;
    }
    if (formData.availability.length === 0) {
      setError(isHe ? 'נא לבחור לפחות זמינות אחת' : 'Please select at least one availability slot');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/drivers/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        setApplicationId(data.applicationId);
      } else {
        setError(data.error || (isHe ? 'שגיאה בשליחת הטופס' : 'Failed to submit application'));
      }
    } catch {
      setError(isHe ? 'שגיאת רשת, נסה שנית' : 'Network error, please try again');
    } finally {
      setSubmitting(false);
    }
  };

  // Success state
  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto text-center py-16 px-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
          className="w-20 h-20 rounded-full bg-[#478c0b]/10 flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-10 h-10 stroke-[1.5] text-[#478c0b]" />
        </motion.div>
        <h3 className="text-2xl md:text-3xl font-bold text-[#3a3a1d] mb-3">
          {isHe ? 'המועמדות נשלחה בהצלחה!' : 'Application Submitted!'}
        </h3>
        <p className="text-[#3a3a1d]/60 mb-2">
          {isHe ? 'מספר מועמדות:' : 'Application ID:'}{' '}
          <span className="font-mono font-semibold text-[#478c0b]">{applicationId}</span>
        </p>
        <p className="text-[#3a3a1d]/60 mb-8 max-w-md mx-auto">
          {isHe
            ? 'ניצור איתך קשר תוך 2-3 ימי עסקים. בינתיים, הצטרף לקבוצת הנהגים שלנו בווטסאפ.'
            : 'We\'ll contact you within 2-3 business days. In the meantime, join our drivers WhatsApp group.'}
        </p>
        <motion.a
          href="https://chat.whatsapp.com/kfar-drivers"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold cursor-pointer text-white"
          style={{ background: '#25D366' }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isHe ? 'הצטרף לקבוצת ווטסאפ' : 'Join WhatsApp Group'}
        </motion.a>
      </motion.div>
    );
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-50px' }}
      className="max-w-3xl mx-auto"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Personal Info */}
      <motion.div variants={item} className="mb-10">
        <h3 className="text-xl font-bold text-[#3a3a1d] mb-1 flex items-center gap-2">
          <User className="w-5 h-5 stroke-[1.5] text-[#478c0b]" />
          {isHe ? 'פרטים אישיים' : 'Personal Information'}
        </h3>
        <p className="text-sm text-[#3a3a1d]/50 mb-5">
          {isHe ? 'ספר לנו קצת על עצמך' : 'Tell us a bit about yourself'}
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#3a3a1d] mb-1.5">
              {isHe ? 'שם מלא' : 'Full Name'} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute top-3 left-3 w-4 h-4 stroke-[1.5] text-[#3a3a1d]/30" style={isRTL ? { left: 'auto', right: '12px' } : {}} />
              <input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder={isHe ? 'הכנס שם מלא' : 'Enter full name'}
                className="w-full rounded-xl border border-[#478c0b]/20 bg-white px-10 py-3 text-[#3a3a1d] placeholder:text-[#3a3a1d]/30 focus:outline-none focus:ring-2 focus:ring-[#478c0b]/30 focus:border-[#478c0b]/40 transition-all"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#3a3a1d] mb-1.5">
              {isHe ? 'אימייל' : 'Email'} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute top-3 left-3 w-4 h-4 stroke-[1.5] text-[#3a3a1d]/30" style={isRTL ? { left: 'auto', right: '12px' } : {}} />
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={isHe ? 'הכנס אימייל' : 'Enter email'}
                className="w-full rounded-xl border border-[#478c0b]/20 bg-white px-10 py-3 text-[#3a3a1d] placeholder:text-[#3a3a1d]/30 focus:outline-none focus:ring-2 focus:ring-[#478c0b]/30 focus:border-[#478c0b]/40 transition-all"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#3a3a1d] mb-1.5">
              {isHe ? 'טלפון' : 'Phone'} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute top-3 left-3 w-4 h-4 stroke-[1.5] text-[#3a3a1d]/30" style={isRTL ? { left: 'auto', right: '12px' } : {}} />
              <input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder={isHe ? '050-1234567' : '050-1234567'}
                className="w-full rounded-xl border border-[#478c0b]/20 bg-white px-10 py-3 text-[#3a3a1d] placeholder:text-[#3a3a1d]/30 focus:outline-none focus:ring-2 focus:ring-[#478c0b]/30 focus:border-[#478c0b]/40 transition-all"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#3a3a1d] mb-1.5">
              {isHe ? 'מספר תעודת זהות' : 'ID Number'}
            </label>
            <div className="relative">
              <FileText className="absolute top-3 left-3 w-4 h-4 stroke-[1.5] text-[#3a3a1d]/30" style={isRTL ? { left: 'auto', right: '12px' } : {}} />
              <input
                name="idNumber"
                value={formData.idNumber}
                onChange={handleChange}
                placeholder={isHe ? 'מספר ת.ז.' : 'ID number'}
                className="w-full rounded-xl border border-[#478c0b]/20 bg-white px-10 py-3 text-[#3a3a1d] placeholder:text-[#3a3a1d]/30 focus:outline-none focus:ring-2 focus:ring-[#478c0b]/30 focus:border-[#478c0b]/40 transition-all"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Vehicle Details */}
      <motion.div variants={item} className="mb-10">
        <h3 className="text-xl font-bold text-[#3a3a1d] mb-1 flex items-center gap-2">
          <Car className="w-5 h-5 stroke-[1.5] text-[#478c0b]" />
          {isHe ? 'פרטי רכב' : 'Vehicle Details'}
        </h3>
        <p className="text-sm text-[#3a3a1d]/50 mb-5">
          {isHe ? 'באיזה רכב תבצע משלוחים?' : 'What vehicle will you use for deliveries?'}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {VEHICLE_TYPES.map(vt => {
            const Icon = vt.icon;
            const selected = formData.vehicleType === vt.value;
            return (
              <motion.button
                key={vt.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, vehicleType: vt.value }))}
                className={`p-4 rounded-xl border-2 text-center transition-all cursor-pointer ${
                  selected
                    ? 'border-[#478c0b] bg-[#478c0b]/5'
                    : 'border-[#478c0b]/10 bg-white hover:border-[#478c0b]/30'
                }`}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                <Icon className={`w-6 h-6 stroke-[1.5] mx-auto mb-2 ${selected ? 'text-[#478c0b]' : 'text-[#3a3a1d]/40'}`} />
                <span className={`text-sm font-medium ${selected ? 'text-[#478c0b]' : 'text-[#3a3a1d]/60'}`}>
                  {isHe ? vt.he : vt.en}
                </span>
              </motion.button>
            );
          })}
        </div>
        <div>
          <label className="block text-sm font-medium text-[#3a3a1d] mb-1.5">
            {isHe ? 'מספר רישיון נהיגה' : 'License Number'}
          </label>
          <input
            name="licenseNumber"
            value={formData.licenseNumber}
            onChange={handleChange}
            placeholder={isHe ? 'מספר רישיון (אם רלוונטי)' : 'License number (if applicable)'}
            className="w-full rounded-xl border border-[#478c0b]/20 bg-white px-4 py-3 text-[#3a3a1d] placeholder:text-[#3a3a1d]/30 focus:outline-none focus:ring-2 focus:ring-[#478c0b]/30 focus:border-[#478c0b]/40 transition-all"
          />
        </div>
      </motion.div>

      {/* Delivery Areas */}
      <motion.div variants={item} className="mb-10">
        <h3 className="text-xl font-bold text-[#3a3a1d] mb-1 flex items-center gap-2">
          <MapPin className="w-5 h-5 stroke-[1.5] text-[#478c0b]" />
          {isHe ? 'אזורי משלוח' : 'Delivery Areas'} <span className="text-red-500">*</span>
        </h3>
        <p className="text-sm text-[#3a3a1d]/50 mb-5">
          {isHe ? 'באילו אזורים תרצה לבצע משלוחים?' : 'Which areas would you like to deliver in?'}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {AREAS.map(area => {
            const selected = formData.areas.includes(area.id);
            return (
              <motion.button
                key={area.id}
                type="button"
                onClick={() => toggleCheckbox('areas', area.id)}
                className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                  selected
                    ? 'border-[#478c0b] bg-[#478c0b]/5'
                    : 'border-[#478c0b]/10 bg-white hover:border-[#478c0b]/30'
                }`}
                whileTap={{ scale: 0.97 }}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                  selected ? 'border-[#478c0b] bg-[#478c0b]' : 'border-[#3a3a1d]/20'
                }`}>
                  {selected && <CheckCircle className="w-3 h-3 stroke-[2] text-white" />}
                </div>
                <span className={`text-sm font-medium ${selected ? 'text-[#478c0b]' : 'text-[#3a3a1d]/60'}`}>
                  {isHe ? area.he : area.en}
                </span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Availability */}
      <motion.div variants={item} className="mb-10">
        <h3 className="text-xl font-bold text-[#3a3a1d] mb-1 flex items-center gap-2">
          <Clock className="w-5 h-5 stroke-[1.5] text-[#478c0b]" />
          {isHe ? 'זמינות' : 'Availability'} <span className="text-red-500">*</span>
        </h3>
        <p className="text-sm text-[#3a3a1d]/50 mb-5">
          {isHe ? 'מתי אתה זמין למשלוחים?' : 'When are you available for deliveries?'}
        </p>
        <div className="grid grid-cols-2 gap-3">
          {AVAILABILITY.map(slot => {
            const selected = formData.availability.includes(slot.id);
            return (
              <motion.button
                key={slot.id}
                type="button"
                onClick={() => toggleCheckbox('availability', slot.id)}
                className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                  selected
                    ? 'border-[#478c0b] bg-[#478c0b]/5'
                    : 'border-[#478c0b]/10 bg-white hover:border-[#478c0b]/30'
                }`}
                whileTap={{ scale: 0.97 }}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                  selected ? 'border-[#478c0b] bg-[#478c0b]' : 'border-[#3a3a1d]/20'
                }`}>
                  {selected && <CheckCircle className="w-3 h-3 stroke-[2] text-white" />}
                </div>
                <span className={`text-sm font-medium ${selected ? 'text-[#478c0b]' : 'text-[#3a3a1d]/60'}`}>
                  {isHe ? slot.he : slot.en}
                </span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Experience & Motivation */}
      <motion.div variants={item} className="mb-10">
        <h3 className="text-xl font-bold text-[#3a3a1d] mb-1 flex items-center gap-2">
          <Heart className="w-5 h-5 stroke-[1.5] text-[#478c0b]" />
          {isHe ? 'ניסיון ומוטיבציה' : 'Experience & Motivation'}
        </h3>
        <p className="text-sm text-[#3a3a1d]/50 mb-5">
          {isHe ? 'ספר לנו על הניסיון שלך ולמה אתה רוצה להצטרף' : 'Tell us about your experience and why you want to join'}
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#3a3a1d] mb-1.5">
              {isHe ? 'ניסיון במשלוחים' : 'Delivery Experience'}
            </label>
            <textarea
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              rows={3}
              placeholder={isHe ? 'ספר לנו על ניסיון קודם במשלוחים (אם יש)' : 'Tell us about any prior delivery experience (if any)'}
              className="w-full rounded-xl border border-[#478c0b]/20 bg-white px-4 py-3 text-[#3a3a1d] placeholder:text-[#3a3a1d]/30 focus:outline-none focus:ring-2 focus:ring-[#478c0b]/30 focus:border-[#478c0b]/40 transition-all resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#3a3a1d] mb-1.5">
              {isHe ? 'למה אתה רוצה להצטרף לכפר?' : 'Why do you want to join KFAR?'}
            </label>
            <textarea
              name="whyJoin"
              value={formData.whyJoin}
              onChange={handleChange}
              rows={3}
              placeholder={isHe ? 'מה מעניין אותך בעבודה עם כפר?' : 'What interests you about working with KFAR?'}
              className="w-full rounded-xl border border-[#478c0b]/20 bg-white px-4 py-3 text-[#3a3a1d] placeholder:text-[#3a3a1d]/30 focus:outline-none focus:ring-2 focus:ring-[#478c0b]/30 focus:border-[#478c0b]/40 transition-all resize-none"
            />
          </div>
        </div>
      </motion.div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-200 mb-6"
          >
            <AlertCircle className="w-5 h-5 stroke-[1.5] text-red-500 shrink-0" />
            <span className="text-sm text-red-700">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit */}
      <motion.div variants={item}>
        <motion.button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full font-semibold text-lg cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ background: '#478c0b', color: '#fff' }}
          whileHover={submitting ? {} : { scale: 1.02, boxShadow: '0 10px 30px rgba(71,140,11,0.3)' }}
          whileTap={submitting ? {} : { scale: 0.98 }}
        >
          {submitting ? (
            <>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                <Loader className="w-5 h-5 stroke-[1.5]" />
              </motion.div>
              {isHe ? 'שולח...' : 'Submitting...'}
            </>
          ) : (
            <>
              <Send className="w-5 h-5 stroke-[1.5]" />
              {isHe ? 'שלח מועמדות' : 'Submit Application'}
            </>
          )}
        </motion.button>
      </motion.div>
    </motion.form>
  );
}
