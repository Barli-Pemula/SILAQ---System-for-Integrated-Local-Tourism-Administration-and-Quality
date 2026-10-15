'use client'

import React, { useState, FormEvent } from 'react'
import { Role } from '@/types/smart-tourism'
import { User, LayoutDashboard, Users, Mail, Lock, Eye, EyeOff, Check, ArrowRight, MapPin } from 'lucide-react'

interface LoginPageProps {
  onLogin: (role: Role) => void
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
    description: 'Eksplorasi, tiket, dan AI guide',
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

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [role, setRole] = useState<Role>('consumer')
  const [email, setEmail] = useState('reza@silaq.id')
  const [password, setPassword] = useState('silaq')
  const [showPassword, setShowPassword] = useState(false)
  const [loginMessage, setLoginMessage] = useState('')

  const handleRoleSelect = (selected: Role) => {
    setRole(selected)
    if (selected === 'superadmin') {
      setEmail('nadia@silaq.id')
    } else if (selected === 'admin') {
      setEmail('adi@bluewaterlombok.id')
    } else {
      setEmail('reza@silaq.id')
    }
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (email && password) onLogin(role)
  }

  return (
    <main className="login-shell">
      {/* Left visual story */}
      <section className="login-story">
        <img
          src="https://images.unsplash.com/photo-1685975875980-f19fbd4d36a6?w=1600&h=1000&fit=crop&auto=format"
          alt="Pantai tropis di Lombok"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/25 via-slate-950/25 to-slate-950/90" />
        <div className="relative z-10 flex h-full flex-col justify-between p-8 lg:p-12">
          {/* Logo Inverse */}
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
              Jelajahi destinasi, pesan tiket, temukan event lokal, dan pantau
              jejak karbon dalam satu platform pariwisata terpadu.
            </p>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-white/80">
              {['120+ destinasi', '45 mitra terverifikasi', 'Dukungan 24/7'].map(
                (item) => (
                  <span key={item} className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-eco-500 text-white">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </span>
                    {item}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Right Login Form */}
      <section className="flex min-h-screen items-center justify-center bg-white px-5 py-10 sm:px-10">
        <div className="w-full max-w-lg">
          <div className="mb-8 lg:hidden flex items-center gap-3">
            <div className="logo-mark">
              <img src="/logo-silaq-icon.png" alt="" />
            </div>
            <div>
              <span className="font-display text-xl font-bold tracking-tight text-slate-900 block">
                SILAQ
              </span>
            </div>
          </div>

          <div className="mb-8">
            <p className="mb-2 text-sm font-semibold text-ocean-600">
              Selamat datang kembali
            </p>
            <h2 className="font-display text-3xl font-semibold text-slate-950">
              Masuk ke SILAQ
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              System for Integrated Local Tourism Administration and Quality.
              Pilih tipe akun untuk melihat pengalaman dashboard yang sesuai.
            </p>
          </div>

          {/* 3 Role Selection Cards */}
          <div className="mb-7 grid gap-3 sm:grid-cols-3">
            {roleOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleRoleSelect(option.id)}
                className={`role-card ${
                  role === option.id ? 'role-card-active' : ''
                }`}
              >
                <span className="role-icon">
                  {option.icon === 'user' && <User className="h-5 w-5" />}
                  {option.icon === 'dashboard' && <LayoutDashboard className="h-5 w-5" />}
                  {option.icon === 'users' && <Users className="h-5 w-5" />}
                </span>
                <span className="font-display text-sm font-semibold text-slate-800">
                  {option.label}
                </span>
                <span className="mt-1 text-[11px] leading-4 text-slate-500">
                  {option.description}
                </span>
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-5">
            <label className="block">
              <span className="field-label">Alamat email</span>
              <span className="input-wrap">
                <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                      'Tautan reset kata sandi demo telah dikirim ke email tersebut.'
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Tampilkan kata sandi"
                  className="text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </span>
            </label>

            <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-600">
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 accent-sky-500"
              />{' '}
              Ingat saya di perangkat ini
            </label>

            <button
              type="submit"
              className="app-button app-button-primary w-full justify-center py-3.5"
            >
              <span>Masuk sebagai {roleOptions.find((item) => item.id === role)?.label}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {loginMessage && (
            <div className="mt-4 rounded-xl bg-ocean-50 px-4 py-3 text-xs font-semibold text-ocean-700">
              {loginMessage}
            </div>
          )}

          <div className="mt-7 flex items-center gap-3">
            <span className="h-px flex-1 bg-slate-200" />
            <span className="text-xs text-slate-400">Akses demo aman</span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <p className="mt-5 text-center text-xs leading-5 text-slate-400">
            Prototype ini menggunakan akun demo. Pilih peran di atas lalu klik masuk
            untuk langsung menuju dashboard khusus peran tersebut.
          </p>
        </div>
      </section>
    </main>
  )
}
