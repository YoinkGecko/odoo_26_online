'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';

type Role = 'Fleet Manager' | 'Driver' | 'Safety Officer' | 'Financial Analyst';

interface DemoCredential {
  role: Role;
  email: string;
  password: string;
}

const DEMO_CREDENTIALS: DemoCredential[] = [
  { role: 'Fleet Manager', email: 'fleet.manager@transitops.io', password: 'FleetOps#2026' },
  { role: 'Driver', email: 'driver@transitops.io', password: 'DriveOps#2026' },
  { role: 'Safety Officer', email: 'safety.officer@transitops.io', password: 'SafeOps#2026' },
  { role: 'Financial Analyst', email: 'finance@transitops.io', password: 'FinOps#2026' },
];

interface LoginFormValues {
  email: string;
  password: string;
}

const ROLE_COLORS: Record<Role, string> = {
  'Fleet Manager': 'bg-blue-50 text-blue-700',
  'Driver': 'bg-green-50 text-green-700',
  'Safety Officer': 'bg-amber-50 text-amber-700',
  'Financial Analyst': 'bg-purple-50 text-purple-700',
};

export default function LoginScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>();

  const autofill = (cred: DemoCredential) => {
    setValue('email', cred.email, { shouldValidate: true });
    setValue('password', cred.password, { shouldValidate: true });
  };

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);

    // TODO: Replace with API call → POST /api/auth/login
    // const response = await fetch('/api/auth/login', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email: data.email, password: data.password }),
    // });
    // const result = await response.json();
    // if (!response.ok) { setError('email', { message: result.message }); setIsLoading(false); return; }
    // router.push('/kpi-dashboard');

    await new Promise((r) => setTimeout(r, 900));
    const match = DEMO_CREDENTIALS.find(
      (c) => c.email === data.email && c.password === data.password
    );
    if (!match) {
      setError('email', {
        message: 'Invalid credentials — use the demo accounts below to sign in',
      });
      setIsLoading(false);
      return;
    }
    toast.success(`Welcome back, ${match.role}`);
    router.push('/kpi-dashboard');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-[42%] xl:w-[44%] bg-slate-900 flex-col justify-between p-10 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full border-2 border-white" />
          <div className="absolute bottom-40 right-10 w-48 h-48 rounded-full border border-white" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-white" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <AppLogo size={36} />
            <span className="text-white font-600 text-xl tracking-tight">TransitOps</span>
          </div>
          <h1 className="text-3xl font-700 text-white leading-tight mb-4">
            Smart Transport<br />Operations Platform
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-xs">
            Centralize your fleet, dispatch trips, track maintenance, and monitor costs from a single operations hub.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          {[
            { icon: 'TruckIcon', title: 'Fleet Management', desc: 'Track every vehicle across your entire fleet in real time.' },
            { icon: 'MapIcon', title: 'Smart Dispatch', desc: 'Validate cargo limits, driver availability, and route constraints.' },
            { icon: 'ChartBarIcon', title: 'Operational Analytics', desc: 'Fuel efficiency, utilization rates, and ROI per vehicle.' },
          ].map((feat) => (
            <div key={`feat-${feat.title}`} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-md bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon name={feat.icon as Parameters<typeof Icon>[0]['name']} size={16} className="text-white" />
              </div>
              <div>
                <p className="text-white text-sm font-500">{feat.title}</p>
                <p className="text-slate-400 text-xs leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <AppLogo size={32} />
            <span className="font-600 text-foreground text-lg">TransitOps</span>
          </div>

          <div className="mb-7">
            <h2 className="text-2xl font-700 text-foreground">Sign in</h2>
            <p className="text-sm text-muted-foreground mt-1">Access your operations dashboard</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-500 text-foreground mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@transitops.io"
                className={`
                  w-full h-10 px-3 rounded-md border text-sm bg-card text-foreground
                  placeholder:text-muted-foreground outline-none
                  focus:ring-2 focus:ring-primary/30 focus:border-primary
                  transition-colors
                  ${errors.email ? 'border-red-400 focus:ring-red-200' : 'border-input'}
                `}
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
                })}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-500 text-foreground mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className={`
                    w-full h-10 px-3 pr-10 rounded-md border text-sm bg-card text-foreground
                    placeholder:text-muted-foreground outline-none
                    focus:ring-2 focus:ring-primary/30 focus:border-primary
                    transition-colors
                    ${errors.password ? 'border-red-400 focus:ring-red-200' : 'border-input'}
                  `}
                  {...register('password', { required: 'Password is required' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <Icon name={showPassword ? 'EyeSlashIcon' : 'EyeIcon'} size={16} />
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Remember me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-input accent-primary" />
                <span className="text-sm text-muted-foreground">Remember me</span>
              </label>
              <button type="button" className="text-sm text-primary hover:underline font-500">
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={`
                w-full h-10 rounded-md text-sm font-600 text-primary-foreground
                bg-primary hover:bg-blue-700 active:scale-[0.98]
                transition-all duration-150 flex items-center justify-center gap-2
                disabled:opacity-60 disabled:cursor-not-allowed
              `}
            >
              {isLoading ? (
                <>
                  <Icon name="ArrowPathIcon" size={16} className="animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign in to TransitOps'
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-7 border border-border rounded-lg overflow-hidden">
            <div className="bg-muted px-4 py-2.5 border-b border-border flex items-center gap-2">
              <Icon name="KeyIcon" size={14} className="text-muted-foreground" />
              <span className="text-xs font-600 text-muted-foreground uppercase tracking-wide">
                Demo Accounts
              </span>
              <span className="ml-auto text-xs text-muted-foreground">Click to autofill</span>
            </div>
            <div className="divide-y divide-border">
              {DEMO_CREDENTIALS.map((cred) => (
                <button
                  key={`cred-${cred.role}`}
                  type="button"
                  onClick={() => autofill(cred)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/60 transition-colors text-left group"
                >
                  <span className={`text-[10px] font-600 px-2 py-0.5 rounded-full whitespace-nowrap ${ROLE_COLORS[cred.role]}`}>
                    {cred.role}
                  </span>
                  <span className="text-xs text-muted-foreground truncate flex-1 font-tabular">{cred.email}</span>
                  <Icon name="ArrowRightIcon" size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}