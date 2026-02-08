'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from '@/components/ui/use-toast';
import { useLanguage } from '@/lib/context/LanguageContext';
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
  Shield,
  Store,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*  Benefits data                                                              */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*  Animation variants                                                        */
/* -------------------------------------------------------------------------- */

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function CustomerLogin() {
  const router = useRouter();
  const { t, language, isRTL } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [roleHint, setRoleHint] = useState<string>('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
  });
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const role = params.get('role');
    setRoleHint(role || '');
  }, []);

  // Focus email input on mode switch
  useEffect(() => {
    emailRef.current?.focus();
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        if (formData.email === 'admin@kfar.com' && formData.password === 'admin123') {
          localStorage.setItem('customerToken', 'admin-token-' + Date.now());
          localStorage.setItem('customerName', 'Admin User');
          localStorage.setItem('customerId', 'admin-001');
          localStorage.setItem('userRole', 'admin');
          window.dispatchEvent(new Event('storage'));
          toast({ title: t('Admin access granted!'), description: t('Redirecting to admin dashboard...') });
          setTimeout(() => { window.location.href = '/admin/dashboard'; }, 800);
        } else if (formData.email === 'vendor@tevadeli.com' && formData.password === 'vendor123') {
          localStorage.setItem('customerToken', 'vendor-token-' + Date.now());
          localStorage.setItem('customerName', 'Teva Deli');
          localStorage.setItem('customerId', 'vendor-tevadeli');
          localStorage.setItem('userRole', 'vendor');
          window.dispatchEvent(new Event('storage'));
          toast({ title: t('Vendor access granted!'), description: t('Redirecting to vendor dashboard...') });
          setTimeout(() => { window.location.href = '/vendor/dashboard'; }, 800);
        } else {
          localStorage.setItem('customerToken', 'demo-token-123');
          localStorage.setItem('customerName', formData.email.split('@')[0]);
          localStorage.setItem('customerId', 'customer-' + Date.now());
          localStorage.setItem('userRole', 'customer');
          window.dispatchEvent(new Event('storage'));
          toast({ title: t('Welcome back!'), description: t('Redirecting to your dashboard...') });
          setTimeout(() => { window.location.href = '/customer/dashboard'; }, 800);
        }
      } else {
        localStorage.setItem('customerToken', 'demo-token-123');
        localStorage.setItem('customerName', formData.name || formData.email.split('@')[0]);
        localStorage.setItem('customerId', 'customer-' + Date.now());
        localStorage.setItem('userRole', 'customer');
        window.dispatchEvent(new Event('storage'));
        toast({ title: t('Account created!'), description: t('Redirecting to onboarding...') });
        setTimeout(() => { window.location.href = '/customer/onboarding'; }, 800);
      }
    } catch {
      toast({ title: t('Error'), description: t('Please try again'), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    localStorage.setItem('customerToken', 'demo-token-123');
    localStorage.setItem('customerName', 'Sarah Cohen');
    localStorage.setItem('customerId', 'customer-demo');
    localStorage.setItem('userRole', 'customer');
    window.dispatchEvent(new Event('storage'));
    toast({ title: t('Demo Login'), description: t('Logged in as Sarah Cohen') });
    router.push('/customer/dashboard');
  };

  const inputClasses =
    'w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-soil-brown placeholder-gray-400 outline-none transition-all duration-200 focus:border-leaf-green focus:bg-white focus:ring-2 focus:ring-leaf-green/10';

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen flex">
      {/* ================================================================= */}
      {/* LEFT: Community image panel (desktop only)                         */}
      {/* ================================================================= */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden">
        <Image
          src="/images/community/village_of_peace_community_authentic_dimona_israel_african_hebrew_israelites_03.jpg"
          alt="Village of Peace community"
          fill
          className="object-cover"
          priority
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

        {/* Content over image */}
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

            {/* Benefits */}
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

      {/* ================================================================= */}
      {/* RIGHT: Form panel                                                  */}
      {/* ================================================================= */}
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
                  : (language === 'he' ? 'צרו חשבון חינמי וקבלו הנחה על ההזמנה הראשונה' : 'Create a free account and get a discount on your first order')}
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

            {/* Role hint banner */}
            <AnimatePresence>
              {roleHint && mode === 'login' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mb-4"
                >
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm ${
                    roleHint === 'admin'
                      ? 'bg-earth-flame/10 border border-earth-flame/20 text-earth-flame'
                      : roleHint === 'vendor'
                        ? 'bg-sun-gold/10 border border-sun-gold/20 text-kfar-gold-dark'
                        : 'bg-leaf-green/10 border border-leaf-green/20 text-leaf-green'
                  }`}>
                    {roleHint === 'admin' && <Shield className="w-4 h-4 stroke-[1.5] flex-shrink-0" />}
                    {roleHint === 'vendor' && <Store className="w-4 h-4 stroke-[1.5] flex-shrink-0" />}
                    {roleHint === 'customer' && <User className="w-4 h-4 stroke-[1.5] flex-shrink-0" />}
                    <span className="font-medium">
                      {roleHint === 'admin' && (language === 'he' ? 'הרשאות מנהל: admin@kfar.com / admin123' : 'Admin credentials: admin@kfar.com / admin123')}
                      {roleHint === 'vendor' && (language === 'he' ? 'הרשאות ספק: vendor@tevadeli.com / vendor123' : 'Vendor credentials: vendor@tevadeli.com / vendor123')}
                      {roleHint === 'customer' && (language === 'he' ? 'השתמשו בכל אימייל וסיסמה' : 'Use any email and password')}
                    </span>
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
                    placeholder={
                      roleHint === 'admin' ? 'admin@kfar.com'
                        : roleHint === 'vendor' ? 'vendor@tevadeli.com'
                          : 'you@email.com'
                    }
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
                    <Link
                      href="/forgot-password"
                      className="text-xs font-medium text-leaf-green hover:text-leaf-green-dark transition-colors cursor-pointer"
                    >
                      {language === 'he' ? 'שכחתם סיסמה?' : 'Forgot password?'}
                    </Link>
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
                    placeholder="••••••••"
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

              {/* Demo login */}
              <motion.button
                type="button"
                onClick={handleDemoLogin}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm border-2 border-kfar-gold text-kfar-gold-dark bg-kfar-gold/5 hover:bg-kfar-gold/10 transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4 stroke-[1.5]" />
                {t('Try Demo Account')}
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

            {/* Demo credentials (login mode) */}
            <AnimatePresence>
              {mode === 'login' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 rounded-xl border border-gray-100 bg-white p-4"
                >
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    {language === 'he' ? 'הרשאות דמו' : 'Demo Credentials'}
                  </p>
                  <div className="space-y-2">
                    {[
                      { role: 'Admin', email: 'admin@kfar.com', pass: 'admin123', color: 'bg-earth-flame/8 text-earth-flame border-earth-flame/15' },
                      { role: 'Vendor', email: 'vendor@tevadeli.com', pass: 'vendor123', color: 'bg-sun-gold/8 text-kfar-gold-dark border-sun-gold/15' },
                      { role: 'Customer', email: 'Any email', pass: 'Any password', color: 'bg-leaf-green/8 text-leaf-green border-leaf-green/15' },
                    ].map((c) => (
                      <div
                        key={c.role}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg border text-xs font-mono ${c.color}`}
                      >
                        <span className="font-sans font-semibold w-16">{c.role}</span>
                        <span className="opacity-70">{c.email} / {c.pass}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
