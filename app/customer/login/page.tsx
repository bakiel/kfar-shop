'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/lib/context/LanguageContext';
import { useAuth } from '@/lib/context/AuthContext';
import {
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Award,
  Heart,
  ShoppingBag,
  Loader2,
  ChevronRight,
  AlertCircle,
  Check,
} from 'lucide-react';

const benefits = [
  {
    icon: Award,
    labelEn: 'Earn loyalty points on every order',
    labelHe: 'צברו נקודות נאמנות בכל הזמנה',
  },
  {
    icon: Sparkles,
    labelEn: 'Exclusive member discounts',
    labelHe: 'הנחות בלעדיות לחברים',
  },
  {
    icon: Heart,
    labelEn: 'Save favourites & reorder easily',
    labelHe: 'שמרו מועדפים והזמינו בקלות',
  },
  {
    icon: ShoppingBag,
    labelEn: 'Track orders in real time',
    labelHe: 'עקבו אחר הזמנות בזמן אמת',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

export default function CustomerLogin() {
  const { t, language, isRTL } = useLanguage();
  const { login, register } = useAuth();
  const shouldReduceMotion = useReducedMotion();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
  });
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, [mode]);

  // Clear error/success on mode switch
  useEffect(() => {
    setError('');
    setSuccessMessage('');
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const result = await login(formData.email, formData.password);

        if (!result.success) {
          setError(result.error || (isRTL ? 'אימייל או סיסמה שגויים' : 'Invalid email or password'));
          setLoading(false);
          return;
        }

        window.location.href = '/customer/dashboard';
      } else {
        // Registration
        if (formData.password.length < 8) {
          setError(isRTL ? 'הסיסמה חייבת להכיל לפחות 8 תווים' : 'Password must be at least 8 characters');
          setLoading(false);
          return;
        }

        const result = await register({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone || undefined,
        });

        if (!result.success) {
          setError(result.error || (isRTL ? 'ההרשמה נכשלה' : 'Registration failed'));
          setLoading(false);
          return;
        }

        if (result.requiresVerification) {
          // Show success message and switch to login mode
          setSuccessMessage(
            isRTL
              ? 'ההרשמה הצליחה! בדקו את האימייל שלכם ולחצו על קישור האימות כדי להתחבר.'
              : 'Registration successful! Check your email and click the verification link to log in.'
          );
          setMode('login');
          setFormData({ ...formData, password: '' });
          setLoading(false);
          return;
        }

        window.location.href = '/customer/dashboard';
      }
    } catch {
      setError(isRTL ? 'שגיאת חיבור - נסו שוב' : 'Connection error - please try again');
      setLoading(false);
    }
  };

  const inputClasses =
    'w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-soil-brown placeholder-gray-400 outline-none transition-all duration-200 focus:border-leaf-green focus:bg-white focus:ring-2 focus:ring-leaf-green/10';

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen flex">
      {/* LEFT: Community image panel (desktop only) */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden">
        <Image
          src="/images/community/village_of_peace_community_authentic_dimona_israel_african_hebrew_israelites_03.jpg"
          alt="Village of Peace community"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

        <div className="relative z-10 flex flex-col justify-end p-10 xl:p-14">
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <Link href="/" className="inline-block mb-10 cursor-pointer">
              <Image
                src="/images/logos/kfar_logo_primary_horizontal.png"
                alt="KFAR"
                width={100}
                height={30}
                className="brightness-0 invert"
              />
            </Link>

            <h2 className="text-3xl xl:text-4xl font-display font-bold text-white leading-tight mb-4">
              {language === 'he' ? (
                <>הכפר כולו,<br />בידיים שלך.</>
              ) : (
                <>The Whole Village,<br />In Your Hand.</>
              )}
            </h2>
            <p className="text-white/70 text-base leading-relaxed max-w-sm mb-8">
              {language === 'he'
                ? 'הצטרפו ל-500+ משפחות שקונות מהקהילה. מוצרים טבעוניים, מורשת אפריקאית, ומשלוח עד הבית.'
                : 'Join 500+ families shopping from the community. Plant-based products, African heritage, and delivery to your door.'}
            </p>

            <div className="space-y-3">
              {benefits.map((b, i) => {
                const Icon = b.icon;
                return (
                  <motion.div
                    key={i}
                    custom={i}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    className="flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-sun-gold stroke-[1.5]" />
                    </div>
                    <span className="text-white/80 text-sm">
                      {language === 'he' ? b.labelHe : b.labelEn}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      {/* RIGHT: Form panel */}
      <div className="flex-1 flex flex-col bg-kfar-warm-white">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-5 pt-5">
          <Link href="/" className="cursor-pointer">
            <Image
              src="/images/logos/kfar_logo_primary_horizontal.png"
              alt="KFAR"
              width={80}
              height={24}
              className="h-auto"
            />
          </Link>
          <Link
            href="/marketplace"
            className="text-xs font-semibold text-leaf-green flex items-center gap-1 cursor-pointer"
          >
            {t('Shop Now')}
            <ChevronRight className={`w-3.5 h-3.5 stroke-[1.5] ${isRTL ? 'rotate-180' : ''}`} />
          </Link>
        </div>

        {/* Centered form area */}
        <div className="flex-1 flex items-center justify-center px-5 py-8 sm:px-8">
          <div className="w-full max-w-[420px]">
            {/* Heading */}
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-soil-brown mb-2">
                {mode === 'login'
                  ? (language === 'he' ? 'ברוכים השבים' : 'Welcome back')
                  : (language === 'he' ? 'הצטרפו לכפר' : 'Join KFAR')}
              </h1>
              <p className="text-gray-500 text-sm">
                {mode === 'login'
                  ? (language === 'he' ? 'התחברו לחשבון שלכם כדי להמשיך לקנות' : 'Sign in to your account to continue shopping')
                  : (language === 'he' ? 'צרו חשבון חינמי וקבלו 50 נקודות בונוס' : 'Create a free account and get 50 bonus points')}
              </p>
            </motion.div>

            {/* Tab switcher */}
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="flex bg-gray-100 rounded-xl p-1 mb-6"
            >
              {(['login', 'register'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`relative flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors duration-200 cursor-pointer ${
                    mode === m ? 'text-white' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {mode === m && (
                    <motion.div
                      layoutId="login-tab"
                      className="absolute inset-0 bg-leaf-green rounded-lg"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center justify-center gap-1.5">
                    {m === 'login' ? (
                      <><LogIn className="w-4 h-4 stroke-[1.5]" />{t('Sign In')}</>
                    ) : (
                      <><UserPlus className="w-4 h-4 stroke-[1.5]" />{t('Register')}</>
                    )}
                  </span>
                </button>
              ))}
            </motion.div>

            {/* Success message */}
            <AnimatePresence>
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mb-4"
                >
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
                    <Check className="w-4 h-4 stroke-[1.5] flex-shrink-0" />
                    {successMessage}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mb-4"
                >
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 stroke-[1.5] flex-shrink-0" />
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <motion.form
              onSubmit={handleSubmit}
              initial={shouldReduceMotion ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="space-y-4"
            >
              {/* Name (register only) */}
              <AnimatePresence>
                {mode === 'register' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      {t('Full Name')}
                    </label>
                    <div className="relative">
                      <User className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 stroke-[1.5]" />
                      <input
                        type="text"
                        required={mode === 'register'}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={`${inputClasses} ps-10`}
                        placeholder={language === 'he' ? 'השם שלך' : 'Your name'}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  {t('Email')}
                </label>
                <div className="relative">
                  <Mail className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 stroke-[1.5]" />
                  <input
                    ref={emailRef}
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`${inputClasses} ps-10`}
                    placeholder="you@email.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t('Password')}
                  </label>
                  {mode === 'login' && (
                    <a
                      href="/forgot-password"
                      className="text-xs text-leaf-green hover:underline"
                    >
                      {isRTL ? 'שכחתי סיסמה' : 'Forgot password?'}
                    </a>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 stroke-[1.5]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`${inputClasses} ps-10 pe-10`}
                    placeholder={mode === 'register' ? (isRTL ? 'לפחות 8 תווים' : 'At least 8 characters') : '••••••••'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 stroke-[1.5]" />
                    ) : (
                      <Eye className="w-4 h-4 stroke-[1.5]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Phone (register only) */}
              <AnimatePresence>
                {mode === 'register' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      {t('Phone')} <span className="text-gray-300 normal-case tracking-normal">({t('Optional')})</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 stroke-[1.5]" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={`${inputClasses} ps-10`}
                        placeholder="+972-50-123-4567"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={loading ? {} : { scale: 1.01 }}
                whileTap={loading ? {} : { scale: 0.99 }}
                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm text-white transition-all duration-200 cursor-pointer ${
                  loading
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-leaf-green hover:bg-leaf-green-dark shadow-md hover:shadow-lg'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin stroke-[1.5]" />
                    {t('Processing...')}
                  </>
                ) : mode === 'login' ? (
                  <>
                    {t('Sign In')}
                    <ArrowRight className={`w-4 h-4 stroke-[1.5] ${isRTL ? 'rotate-180' : ''}`} />
                  </>
                ) : (
                  <>
                    {t('Create Account')}
                    <ArrowRight className={`w-4 h-4 stroke-[1.5] ${isRTL ? 'rotate-180' : ''}`} />
                  </>
                )}
              </motion.button>
            </motion.form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-kfar-warm-white px-3 text-xs text-gray-400">
                  {mode === 'login'
                    ? (language === 'he' ? 'אין חשבון?' : "Don't have an account?")
                    : (language === 'he' ? 'כבר יש לכם חשבון?' : 'Already have an account?')}
                </span>
              </div>
            </div>

            {/* Switch mode CTA */}
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="w-full py-3 rounded-xl text-sm font-semibold text-leaf-green border border-leaf-green/20 bg-leaf-green/5 hover:bg-leaf-green/10 transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              {mode === 'login' ? (
                <><UserPlus className="w-4 h-4 stroke-[1.5]" />{language === 'he' ? 'צרו חשבון חינמי' : 'Create a free account'}</>
              ) : (
                <><LogIn className="w-4 h-4 stroke-[1.5]" />{language === 'he' ? 'התחברו לחשבון קיים' : 'Sign in to existing account'}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
