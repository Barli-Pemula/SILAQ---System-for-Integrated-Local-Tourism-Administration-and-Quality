'use client'

import React, { useEffect, useRef, useState, FormEvent } from 'react'
import { Role } from '@/types/smart-tourism'
import { DemoLoginTemplate, SessionUser } from '@/types/auth'
import { api } from '@/lib/booking-store'
import {
  User,
  LayoutDashboard,
  Users,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Check,
  ArrowRight,
  MapPin,
} from 'lucide-react'

interface LoginPageProps {
  onLogin: (user: SessionUser) => void
  initialError?: string
}

const roleOptions: {
  id: Role
  label: string
  description: string
  icon: 'user' | 'dashboard' | 'users'
}[] = [
  {
    id: 'consumer',
    label: 'Wisatawan',
    description: 'Wisata, hotel, kapal & kuliner',
    icon: 'user',
  },
  {
    id: 'admin',
    label: 'Admin Mitra',
    description: 'Gate check-in dan tiket lokal',
    icon: 'dashboard',
  },
  {
    id: 'superadmin',
    label: 'SuperAdmin',
    description: 'Ekosistem dan insight provinsi',
    icon: 'users',
  },
]

export default function LoginPage({
  onLogin,
  initialError = '',
}: LoginPageProps) {
  const [role, setRole] = useState<Role>('consumer')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loginMessage, setLoginMessage] = useState(initialError)
  const [registering, setRegistering] = useState(false)
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [template, setTemplate] = useState<DemoLoginTemplate | null>(null)
  const edited = useRef(false)

  useEffect(() => {
    let active = true
    api<{ demoLogin?: DemoLoginTemplate | null }>('/api/config')
      .then((config) => {
        if (active) setTemplate(config.demoLogin || null)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (template && !registering && !edited.current) {
      setEmail(template.emails[role])
      setPassword(template.password)
      setName(template.name)
    }
  }, [template, role, registering])

  const handleRoleSelect = (selected: Role) => {
    edited.current = false
    setRole(selected)
    setRegistering(false)
    setLoginMessage('')
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setLoginMessage('')
    try {
      const result = await api<{ user: SessionUser }>('/api/auth', {
        method: 'POST',
        body: JSON.stringify({
          action: registering ? 'register' : 'login',
          name,
          email,
          password,
        }),
      })
      onLogin(result.user)
    } catch (error) {
      setLoginMessage(
        error instanceof Error ? error.message : 'Tidak dapat masuk. Coba lagi.'
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="login-shell">
      {/* Left visual story (desktop only) */}
      <section className="login-story">
        <img
          src="https://images.unsplash.com/photo-1685975875980-f19fbd4d36a6?w=1600&h=1000&fit=crop&auto=format"
          alt="Pantai tropis di Lombok"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/25 via-slate-950/25 to-slate-950/90" />
        <div className="relative z-10 flex h-full flex-col justify-between p-8 lg:p-12">
          <div className="flex items-center gap-3">
            <div className="logo-mark logo-mark-inverse">
              <img src="/logo-silaq-icon.png" alt="" />
            </div>
            <div>
              <span className="font-display text-xl font-bold tracking-tight text-white block">
                SILAQ
              </span>
              <span className="block max-w-xs text-[10px] leading-4 font-semibold text-ocean-300">
                System for Integrated Local Tourism Administration and Quality
              </span>
            </div>
          </div>

          <div className="max-w-xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white backdrop-blur-md">
              <MapPin className="h-4 w-4" /> Satu akses untuk seluruh Lombok
            </div>
            <h1 className="font-display text-4xl font-semibold leading-tight text-white lg:text-6xl">
              Perjalanan lebih mudah, dampak lebih berarti.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-white/75">
              Jelajahi destinasi dan kuliner, pesan hotel serta kapal, lalu
              rangkai perjalanan dengan paket wisata dalam satu platform.
            </p>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-white/80">
              {[
                '120+ destinasi',
                '45 mitra terverifikasi',
                'Dukungan 24/7',
              ].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-eco-500 text-white">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Right Login Form */}
      <section className="login-panel">
        {/* Mobile hero — matches the app mockup (hidden on desktop) */}
        <div className="login-mobile-hero">
          <img
            src="https://images.unsplash.com/photo-1685975875980-f19fbd4d36a6?w=1200&h=800&fit=crop&auto=format"
            alt="Pantai tropis di Lombok"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/55 via-slate-950/25 to-slate-950/70" />
          <div className="relative flex h-full flex-col justify-between px-6 pt-5 pb-9">
            <div className="flex items-center gap-2.5">
              <div className="logo-mark logo-mark-inverse">
                <img src="/logo-silaq-icon.png" alt="" />
              </div>
              <div>
                <span className="font-display block text-base font-bold leading-tight text-white">
                  SILAQ
                </span>
                <span className="block text-[8px] font-semibold uppercase tracking-[.18em] text-white/70">
                  Travel Ecosystem
                </span>
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md">
                <MapPin className="h-3.5 w-3.5" /> Jelajahi Lombok, sesukamu
              </div>
              <h1 className="font-display mt-3 max-w-[16ch] text-[1.3rem] font-bold leading-snug text-white">
                Satu aplikasi untuk seluruh perjalananmu.
              </h1>
            </div>
          </div>
        </div>

        <div className="login-form-card w-full max-w-md px-5 py-6 sm:px-8 sm:py-10">
          {/* Brand — tablet only (hidden on mobile hero + desktop story) */}
          <div className="login-sheet-brand mb-6 flex items-center gap-2.5 lg:hidden">
            <div className="logo-mark">
              <img src="/logo-silaq-icon.png" alt="" />
            </div>
            <div>
              <span className="font-display text-lg font-bold tracking-tight text-slate-900 block">
                SILAQ
              </span>
              <span className="block text-[9px] font-semibold text-slate-400">
                Smart Tourism Lombok
              </span>
            </div>
          </div>

          <div className="mb-5 sm:mb-8">
            <p className="login-eyebrow mb-1.5 hidden text-xs font-semibold text-ocean-600 sm:mb-2 sm:block sm:text-sm">
              Selamat datang kembali
            </p>
            <h2 className="font-display text-2xl font-semibold text-slate-950 sm:text-3xl">
              Masuk ke SILAQ
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Pilih tipe akun untuk melihat pengalaman dashboard yang sesuai.
            </p>
          </div>

          {/* Role Selection — icon tabs on mobile, cards on desktop */}
          <div className="role-grid mb-5 sm:mb-7">
            {roleOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={role === option.id}
                onClick={() => handleRoleSelect(option.id)}
                className={`role-card ${
                  role === option.id ? 'role-card-active' : ''
                }`}
              >
                <span className="role-icon">
                  {option.icon === 'user' && (
                    <User className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                  {option.icon === 'dashboard' && (
                    <LayoutDashboard className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                  {option.icon === 'users' && (
                    <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="font-display block text-[11px] font-semibold leading-tight text-slate-800 sm:text-sm">
                    {option.label}
                  </span>
                  <span className="role-desc mt-1 hidden text-[11px] leading-4 text-slate-500 sm:block">
                    {option.description}
                  </span>
                </span>
              </button>
            ))}
          </div>

          <p className="mb-5 text-xs leading-6 text-slate-500">
            {template && !registering
              ? `Akun ${template.name} sudah terisi. Pilih peran, lalu tekan Masuk untuk mencoba portalnya.`
              : 'Masuk menggunakan akunmu. Hak akses wisatawan, mitra, dan pengelola diverifikasi oleh server.'}
          </p>
          <button
            type="button"
            disabled={busy}
            className="google-button mb-5"
            onClick={() => {
              setRegistering((r) => !r)
              edited.current = false
              setEmail('')
              setPassword('')
              setName('')
              setRole('consumer')
              setLoginMessage('')
            }}
          >
            {registering ? 'Sudah punya akun? Masuk' : 'Buat akun wisatawan'}
          </button>

          <form onSubmit={submit} className="space-y-3.5 sm:space-y-5">
            {registering && (
              <label className="block">
                <span className="field-label">Nama lengkap</span>
                <span className="input-wrap">
                  <User className="h-4 w-4 text-slate-400" />
                  <input
                    autoComplete="name"
                    required
                    minLength={3}
                    maxLength={100}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </span>
              </label>
            )}
            <label className="block">
              <span className="field-label">Alamat email</span>
              <span className="input-wrap">
                <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                <input
                  type="email"
                  autoComplete="email"
                  maxLength={150}
                  value={email}
                  onChange={(e) => {
                    edited.current = true
                    setEmail(e.target.value)
                  }}
                  placeholder="nama@email.com"
                  required
                />
              </span>
            </label>

            <label className="block">
              <span className="flex items-center justify-between">
                <span className="field-label">Kata sandi</span>
                <button
                  type="button"
                  onClick={() =>
                    setLoginMessage(
                      'Untuk pemulihan akun, hubungi pengelola SILAQ. Pengiriman email pemulihan belum dikonfigurasi.'
                    )
                  }
                  className="mb-2 text-xs font-semibold text-ocean-600 hover:underline"
                >
                  Lupa kata sandi?
                </button>
              </span>
              <span className="input-wrap">
                <Lock className="h-4 w-4 text-slate-400 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={
                    registering ? 'new-password' : 'current-password'
                  }
                  minLength={registering ? 12 : 1}
                  maxLength={128}
                  value={password}
                  onChange={(e) => {
                    edited.current = true
                    setPassword(e.target.value)
                  }}
                  placeholder="Masukkan kata sandi"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword
                      ? 'Sembunyikan kata sandi'
                      : 'Tampilkan kata sandi'
                  }
                  className="text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </span>
            </label>

            <div className="flex items-center justify-between gap-3">
              <label className="flex cursor-pointer items-center gap-2.5 text-xs text-slate-600 sm:text-sm">
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 accent-sky-500"
                />
                Ingat saya
              </label>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="app-button app-button-primary w-full justify-center py-3 text-sm sm:py-3.5"
            >
              <span>
                {busy
                  ? 'Memproses…'
                  : registering
                    ? 'Daftar wisatawan'
                    : `Masuk sebagai ${roleOptions.find((item) => item.id === role)?.label}`}
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {loginMessage && (
            <div
              role="alert"
              className="mt-4 rounded-xl bg-ocean-50 px-4 py-3 text-xs font-semibold text-ocean-700"
            >
              {loginMessage}
            </div>
          )}

          <div className="login-demo-note mt-5 hidden items-center gap-3">
            <span className="h-px flex-1 bg-slate-200" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Akses demo aman
            </span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <p className="mt-6 hidden text-center text-xs leading-5 text-slate-400 sm:block">
            Akun baru terdaftar sebagai wisatawan. Akun mitra dan pengelola
            dibuat oleh administrator. Kata sandi baru minimal 12 karakter.
          </p>
        </div>
      </section>
    </main>
  )
}
