import { useState, type FormEvent, type ReactNode } from "react"

type Role = "superadmin" | "admin" | "consumer"
type IconName = "activity" | "ai" | "arrow" | "bell" | "calendar" | "carbon" | "check" | "chevron" | "close" | "dashboard" | "download" | "event" | "eye" | "home" | "location" | "lock" | "logout" | "mail" | "menu" | "more" | "report" | "search" | "settings" | "star" | "ticket" | "trend" | "user" | "users" | "wallet"

const PHOTOS = {
  hero: "https://images.unsplash.com/photo-1685975875980-f19fbd4d36a6?w=1600&h=1000&fit=crop&auto=format",
  gili: "https://images.unsplash.com/photo-1530711338425-2d21c46b32a5?w=900&h=700&fit=crop&auto=format",
  rinjani:
    "https://images.unsplash.com/photo-1714645219293-106a5bb6d289?w=900&h=700&fit=crop&auto=format",
  fields:
    "https://images.unsplash.com/photo-1746964246729-3bcad599e959?w=900&h=700&fit=crop&auto=format",
  beach:
    "https://images.unsplash.com/photo-1660020214290-800d5775a867?w=900&h=700&fit=crop&auto=format",
  avatar:
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&h=160&fit=crop&auto=format",
}

const iconPaths: Record<IconName, ReactNode> = {
  activity: (
    <>
      <path d="M3 12h4l2.5-7 5 14 2.5-7h4" />
    </>
  ),
  ai: (
    <>
      <rect x="4" y="7" width="16" height="13" rx="3" />
      <path d="M12 3v4M8 12h.01M16 12h.01M9 16h6" />
    </>
  ),
  arrow: (
    <>
      <path d="M5 12h14M14 7l5 5-5 5" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </>
  ),
  carbon: (
    <>
      <path d="M19.5 3.5C14 3.8 6 6 5 12.5c-.7 4.4 3 7.4 6.7 5.5 3.8-2 5.8-7 7.8-14.5Z" />
      <path d="M4 21c2-6 6-9 11-11" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  chevron: <path d="m9 6 6 6-6 6" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v12m0 0 4-4m-4 4-4-4" />
      <path d="M5 20h14" />
    </>
  ),
  event: (
    <>
      <path d="M5 4h14a2 2 0 0 1 2 2v13H3V6a2 2 0 0 1 2-2Z" />
      <path d="M8 2v5M16 2v5M3 9h18M7 13h4M7 16h7" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
  home: (
    <>
      <path d="m3 10 9-7 9 7" />
      <path d="M5 9v12h14V9M9 21v-7h6v7" />
    </>
  ),
  location: (
    <>
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  lock: (
    <>
      <rect x="4" y="10" width="16" height="11" rx="3" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
  logout: (
    <>
      <path d="M10 4H5v16h5M14 8l4 4-4 4M8 12h10" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
  menu: (
    <>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </>
  ),
  more: (
    <>
      <circle cx="5" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
    </>
  ),
  report: (
    <>
      <path d="M5 3h14v18H5z" />
      <path d="M9 8h6M9 12h6M9 16h4" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path
        d="M19 13.5v-3l-2-.7-.8-1.9.9-1.9L15 3.9l-1.9.9-1.9-.8-.7-2h-3l-.7 2-1.9.8-1.9-.9L.9 6 1.8 8l-.8 1.8-2 .7v3l2 .7.8 1.9-.9 1.9L3 20.1l1.9-.9 1.9.8.7 2h3l.7-2 1.9-.8 1.9.9 2.1-2.1-.9-1.9.8-1.9 2-.7Z"
        transform="translate(2)"
      />
    </>
  ),
  star: (
    <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6-5.4-2.9-5.4 2.9 1-6-4.4-4.3 6.1-.9L12 3Z" />
  ),
  ticket: (
    <>
      <path d="M4 6h16v4a2 2 0 0 0 0 4v4H4v-4a2 2 0 0 0 0-4V6Z" />
      <path d="M13 8v8" />
    </>
  ),
  trend: (
    <>
      <path d="m4 16 5-5 4 4 7-8" />
      <path d="M15 7h5v5" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 19a6 6 0 0 1 12 0M16 7a3 3 0 0 1 0 6M17 15a5 5 0 0 1 4 4" />
    </>
  ),
  wallet: (
    <>
      <path d="M4 6h15a2 2 0 0 1 2 2v10H4a2 2 0 0 1-2-2V6a3 3 0 0 1 3-3h12" />
      <path d="M16 11h5v4h-5a2 2 0 0 1 0-4Z" />
    </>
  ),
}

function Icon({
  name,
  size = 20,
  className = "",
}: {
  name: IconName
  size?: number
  className?: string
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {iconPaths[name]}
    </svg>
  )
}

function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`logo-mark ${inverse ? "logo-mark-inverse" : ""}`}>
        <img src="/logo-silaq-icon.png" alt="" />
      </div>
      <div>
        <div
          className={`font-display text-lg font-bold leading-none ${
            inverse ? "text-white" : "text-slate-950"
          }`}
        >
          SILAQ
        </div>
        <div
          className={`mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${
            inverse ? "text-white/60" : "text-slate-400"
          }`}
        >
          System for Integrated Local Tourism Administration and Quality
        </div>
      </div>
    </div>
  )
}

function AppButton({
  children,
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "cta" | "secondary" | "ghost"
}) {
  return (
    <button
      className={`app-button app-button-${variant} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

const roleOptions: {
  id: Role
  label: string
  description: string
  icon: IconName
}[] = [
  {
    id: "consumer",
    label: "Konsumen",
    description: "Cari destinasi dan kelola perjalanan",
    icon: "user",
  },
  {
    id: "admin",
    label: "Admin Mitra",
    description: "Kelola tiket, event, dan operasional",
    icon: "report",
  },
  {
    id: "superadmin",
    label: "SuperAdmin",
    description: "Pantau ekosistem dan semua mitra",
    icon: "dashboard",
  },
]

function LoginPage({ onLogin }: { onLogin: (role: Role) => void }) {
  const [role, setRole] = useState<Role>("consumer")
  const [email, setEmail] = useState("reza@silaq.id")
  const [password, setPassword] = useState("silaq")
  const [showPassword, setShowPassword] = useState(false)
  const [loginMessage, setLoginMessage] = useState("")

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (email && password) onLogin(role)
  }

  return (
    <main className="login-shell">
      <section className="login-story">
        <img
          src={PHOTOS.hero}
          alt="Pantai tropis di Lombok"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/25 via-slate-950/25 to-slate-950/90" />
        <div className="relative z-10 flex h-full flex-col justify-between p-8 lg:p-12">
          <Logo inverse />
          <div className="max-w-xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white backdrop-blur-md">
              <Icon name="location" size={16} /> Satu akses untuk seluruh Lombok
            </div>
            <h1 className="font-display text-4xl font-semibold leading-tight text-white lg:text-6xl">
              Perjalanan lebih mudah, dampak lebih berarti.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-white/75">
              Jelajahi destinasi, pesan tiket, temukan event lokal, dan pantau
              jejak karbon dalam satu platform pariwisata terpadu.
            </p>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-white/80">
              {[
                "120+ destinasi",
                "45 mitra terverifikasi",
                "Dukungan 24/7",
              ].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-eco-500">
                    <Icon name="check" size={13} />
                  </span>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center bg-white px-5 py-10 sm:px-10">
        <div className="w-full max-w-lg">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <div className="mb-8">
            <p className="mb-2 text-sm font-semibold text-ocean-600">
              Selamat datang kembali
            </p>
            <h2 className="font-display text-3xl font-semibold text-slate-950">
              Masuk ke SILAQ
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Pilih tipe akun untuk melihat pengalaman dashboard yang sesuai.
            </p>
          </div>

          <div className="mb-7 grid gap-3 sm:grid-cols-3">
            {roleOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setRole(option.id)}
                className={`role-card ${
                  role === option.id ? "role-card-active" : ""
                }`}
              >
                <span className="role-icon">
                  <Icon name={option.icon} size={20} />
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
                <Icon name="mail" className="text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
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
                      "Tautan reset kata sandi demo telah dikirim ke email tersebut.",
                    )
                  }
                  className="mb-2 text-xs font-semibold text-ocean-600"
                >
                  Lupa kata sandi?
                </button>
              </span>
              <span className="input-wrap">
                <Icon name="lock" className="text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Tampilkan kata sandi"
                >
                  <Icon name="eye" className="text-slate-400" />
                </button>
              </span>
            </label>
            <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-600">
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 accent-sky-500"
              />{" "}
              Ingat saya di perangkat ini
            </label>
            <AppButton type="submit" className="w-full justify-center py-3.5">
              Masuk sebagai{" "}
              {roleOptions.find((item) => item.id === role)?.label}
              <Icon name="arrow" />
            </AppButton>
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
            Prototype ini menggunakan akun demo. Pilih peran apa pun lalu masuk
            untuk meninjau alur dan dashboard.
          </p>
        </div>
      </section>
    </main>
  )
}

const roleConfig = {
  superadmin: {
    label: "SuperAdmin",
    eyebrow: "Command center",
    title: "Ringkasan Ekosistem",
    subtitle: "Pantau performa pariwisata dan kesehatan platform SILAQ.",
    nav: [
      ["Ringkasan", "dashboard"],
      ["AI Insight", "ai"],
      ["Mitra & Admin", "users"],
      ["Destinasi", "location"],
      ["Transaksi", "wallet"],
      ["Laporan", "report"],
      ["Pengaturan", "settings"],
    ] as [string, IconName][],
  },
  admin: {
    label: "Admin Mitra",
    eyebrow: "Gili Trawangan Operations",
    title: "Dashboard Operasional",
    subtitle:
      "Kelola inventori tiket, pengunjung, dan aktivitas destinasi hari ini.",
    nav: [
      ["Ringkasan", "dashboard"],
      ["Pemesanan", "ticket"],
      ["Tiket & Harga", "wallet"],
      ["Event", "event"],
      ["Pengunjung", "users"],
      ["Pengaturan", "settings"],
    ] as [string, IconName][],
  },
}

function StatCard({
  icon,
  label,
  value,
  change,
  tone = "blue",
}: {
  icon: IconName
  label: string
  value: string
  change: string
  tone?: "blue" | "orange" | "green" | "purple"
}) {
  return (
    <article className="stat-card">
      <div className={`stat-icon stat-icon-${tone}`}>
        <Icon name={icon} />
      </div>
      <div className="mt-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="font-display mt-1 text-2xl font-semibold text-slate-950">
            {value}
          </p>
        </div>
        <span className="mb-1 flex items-center gap-1 text-xs font-semibold text-eco-600">
          <Icon name="trend" size={14} />
          {change}
        </span>
      </div>
    </article>
  )
}

function BarChart({ admin = false }: { admin?: boolean }) {
  const data = admin
    ? [35, 48, 42, 62, 55, 78, 66, 82, 72, 88, 75, 94]
    : [28, 38, 34, 52, 45, 67, 62, 74, 69, 82, 78, 91]
  return (
    <div className="mt-7">
      <div className="flex h-64 items-end gap-2 border-b border-slate-200 sm:gap-4">
        {data.map((height, index) => (
          <div key={index} className="group flex h-full flex-1 items-end">
            <div
              className="chart-bar relative w-full rounded-t-lg bg-ocean-100 transition-all group-hover:bg-ocean-500"
              style={{ height: `${height}%` }}
            >
              <span className="absolute -top-7 left-1/2 hidden -translate-x-1/2 rounded bg-slate-900 px-2 py-1 text-[10px] text-white group-hover:block">
                {height * 12}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-6 text-center text-[11px] text-slate-400">
        <span>Jan</span>
        <span>Mar</span>
        <span>Mei</span>
        <span>Jul</span>
        <span>Sep</span>
        <span>Nov</span>
      </div>
    </div>
  )
}

function SuperAdminAI() {
  const [prompt, setPrompt] = useState("")
  const [answer, setAnswer] = useState(
    "Kunjungan tumbuh 12,4% dan GMV naik 8,6%. Pertumbuhan terbaik datang dari wisata bahari, tetapi tiga mitra memiliki waktu respons di atas SLA. Prioritas minggu ini: tambah kapasitas fast boat dan tindak lanjuti mitra berisiko.",
  )
  const [frequency, setFrequency] = useState("Setiap Senin")
  const [reportActive, setReportActive] = useState(true)

  const askAI = (question = prompt) => {
    if (!question.trim()) return
    setPrompt(question)
    if (question.toLowerCase().includes("pendapatan")) {
      setAnswer(
        "Pendapatan Februari naik 8,6% menjadi Rp 4,8 miliar. Kontributor terbesar adalah Gili Fast Boat dan paket Rinjani. Potensi tambahan Rp 320 juta dapat dicapai dengan menaikkan ketersediaan akhir pekan sebesar 12%.",
      )
    } else if (question.toLowerCase().includes("mitra")) {
      setAnswer(
        "Dari 48 mitra, 45 aktif dan 3 membutuhkan perhatian. Dua mitra memiliki pembatalan di atas 8%, sementara satu mitra belum memperbarui kuota selama 5 hari. Rekomendasi: kirim peringatan otomatis dan jadwalkan audit operasional.",
      )
    } else {
      setAnswer(
        "Kesimpulan cepat: performa ekosistem berada dalam kondisi sehat dengan tren kunjungan positif. Risiko utama ada pada kapasitas akhir pekan dan konsistensi SLA mitra. Fokuskan tindakan pada penambahan inventori, pemantauan pembatalan, dan promosi destinasi budaya.",
      )
    }
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
      <article className="ai-command-card">
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="ai-kicker">
                <Icon name="ai" size={16} /> SILAQ Intelligence
              </span>
              <h2 className="font-display mt-5 text-2xl font-semibold text-white">
                Tanyakan apa pun tentang performa platform
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/65">
                AI menganalisis data kunjungan, transaksi, mitra, dan
                operasional untuk memberikan ringkasan yang siap
                ditindaklanjuti.
              </p>
            </div>
            <span className="status-live bg-white/10 text-white">
              <span /> Data terbaru
            </span>
          </div>
          <div className="mt-7 rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur">
            <p className="text-xs font-bold uppercase tracking-widest text-sky-200">
              Kesimpulan AI
            </p>
            <p className="mt-3 text-sm leading-7 text-white">{answer}</p>
          </div>
          <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-white p-2 sm:flex-row">
            <input
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && askAI()}
              className="min-h-12 flex-1 bg-transparent px-3 text-sm text-slate-800 outline-none"
              placeholder="Contoh: simpulkan performa pendapatan bulan ini"
            />
            <AppButton onClick={() => askAI()} className="justify-center">
              Buat kesimpulan
              <Icon name="arrow" size={17} />
            </AppButton>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              "Ringkas pendapatan bulan ini",
              "Mitra mana yang berisiko?",
              "Apa prioritas minggu ini?",
            ].map((item) => (
              <button
                key={item}
                onClick={() => askAI(item)}
                className="ai-prompt-chip"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </article>

      <article className="panel-card">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="panel-title">Laporan berkala AI</h2>
            <p className="panel-subtitle">Dikirim otomatis ke tim manajemen</p>
          </div>
          <button
            onClick={() => setReportActive(!reportActive)}
            className={`toggle ${reportActive ? "toggle-active" : ""}`}
            aria-label="Aktifkan laporan"
          >
            <span />
          </button>
        </div>
        <div className="mt-6 rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ocean-50 text-ocean-600">
              <Icon name="report" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Executive Tourism Brief
              </p>
              <p className="mt-1 text-xs text-slate-400">
                KPI, anomali, prediksi, rekomendasi
              </p>
            </div>
          </div>
          <label className="mt-5 block">
            <span className="field-label">Jadwal pengiriman</span>
            <select
              value={frequency}
              onChange={(event) => setFrequency(event.target.value)}
              className="select-control"
            >
              <option>Setiap Senin</option>
              <option>Setiap tanggal 1</option>
              <option>Setiap akhir bulan</option>
            </select>
          </label>
          <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
            Laporan berikutnya:{" "}
            <strong className="text-slate-700">
              {frequency === "Setiap Senin"
                ? "Senin, 2 Maret 2026"
                : "1 Maret 2026"}
            </strong>
          </div>
        </div>
        <AppButton
          onClick={() =>
            setAnswer(
              "Laporan eksekutif terbaru berhasil dibuat. Ringkasan mencakup pertumbuhan kunjungan 12,4%, tiga mitra berisiko, dan rekomendasi penambahan kapasitas akhir pekan.",
            )
          }
          variant="secondary"
          className="mt-4 w-full justify-center"
        >
          <Icon name="ai" size={17} />
          Buat laporan sekarang
        </AppButton>
      </article>
    </section>
  )
}

function SuperAdminOverview({
  onNavigate,
  onNotice,
}: {
  onNavigate: (page: string) => void
  onNotice: (message: string) => void
}) {
  const regions = [
    ["Lombok Tengah", "8.940", "Rp 1,6 M", "+18%"],
    ["Lombok Utara", "7.820", "Rp 1,4 M", "+14%"],
    ["Lombok Timur", "6.410", "Rp 980 Jt", "+9%"],
    ["Kota Mataram", "5.320", "Rp 820 Jt", "+6%"],
  ]
  return (
    <div className="space-y-6">
      <section className="super-command-banner">
        <div className="relative z-10 max-w-2xl">
          <span className="ai-kicker">
            <Icon name="dashboard" size={16} /> Ecosystem command center
          </span>
          <h2 className="font-display mt-5 text-3xl font-semibold text-white">
            Pariwisata Lombok tumbuh sehat
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/65">
            Seluruh data mitra, destinasi, transaksi, dan wisatawan dipantau
            secara agregat untuk pengambilan keputusan tingkat platform.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <AppButton onClick={() => onNavigate("AI Insight")}>
              <Icon name="ai" size={17} />
              Analisis dengan AI
            </AppButton>
            <AppButton
              onClick={() => onNavigate("Laporan")}
              variant="secondary"
            >
              <Icon name="report" size={17} />
              Buka pusat laporan
            </AppButton>
          </div>
        </div>
        <div className="platform-health">
          <span className="status-live">
            <span /> Semua sistem normal
          </span>
          <strong>99,98%</strong>
          <p>Platform uptime</p>
          <div className="mt-5 grid grid-cols-2 gap-3 text-left">
            <div>
              <b>45</b>
              <span>Mitra aktif</span>
            </div>
            <div>
              <b>3</b>
              <span>Perlu review</span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon="users"
          label="Wisatawan terdaftar"
          value="28.490"
          change="+12,4%"
        />
        <StatCard
          icon="wallet"
          label="GMV ekosistem"
          value="Rp 4,8 M"
          change="+8,6%"
          tone="orange"
        />
        <StatCard
          icon="location"
          label="Destinasi aktif"
          value="126"
          change="+11 baru"
          tone="purple"
        />
        <StatCard
          icon="users"
          label="Mitra terverifikasi"
          value="45 / 48"
          change="93,7%"
          tone="green"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <article className="panel-card">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="panel-title">Pertumbuhan kunjungan pulau</h2>
              <p className="panel-subtitle">
                Agregasi seluruh destinasi · 12 bulan
              </p>
            </div>
            <button
              onClick={() =>
                onNotice("Data pertumbuhan diperbarui 5 menit lalu.")
              }
              className="rounded-xl bg-slate-100 p-2 text-slate-500"
            >
              <Icon name="more" />
            </button>
          </div>
          <BarChart />
        </article>
        <article className="panel-card">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="panel-title">Risiko ekosistem</h2>
              <p className="panel-subtitle">Membutuhkan tindakan SuperAdmin</p>
            </div>
            <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-600">
              3 alert
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {[
              ["BlueWater Lombok", "Pembatalan 9,2% minggu ini", "Tinggi"],
              ["Sade Heritage", "Dokumen verifikasi segera berakhir", "Sedang"],
              ["Rinjani Explore", "Belum memperbarui kuota", "Sedang"],
            ].map(([name, issue, level]) => (
              <button
                key={name}
                onClick={() => onNavigate("Mitra & Admin")}
                className="risk-item"
              >
                <span
                  className={`risk-dot ${
                    level === "Tinggi" ? "risk-dot-high" : ""
                  }`}
                />
                <span className="flex-1 text-left">
                  <strong>{name}</strong>
                  <small>{issue}</small>
                </span>
                <Icon name="chevron" size={16} />
              </button>
            ))}
          </div>
          <AppButton
            onClick={() => onNavigate("Mitra & Admin")}
            variant="ghost"
            className="mt-3 w-full justify-center"
          >
            Tinjau semua mitra
            <Icon name="arrow" size={16} />
          </AppButton>
        </article>
      </section>

      <section className="panel-card overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="panel-title">Performa wilayah</h2>
            <p className="panel-subtitle">
              Perbandingan kunjungan dan nilai transaksi
            </p>
          </div>
          <AppButton onClick={() => onNavigate("Laporan")} variant="ghost">
            Analisis lengkap
            <Icon name="arrow" size={16} />
          </AppButton>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Wilayah</th>
                <th>Wisatawan</th>
                <th>GMV</th>
                <th>Pertumbuhan</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {regions.map(([region, visitors, gmv, growth]) => (
                <tr key={region}>
                  <td>
                    <strong className="text-slate-800">{region}</strong>
                  </td>
                  <td>{visitors}</td>
                  <td>{gmv}</td>
                  <td className="font-semibold text-eco-600">{growth}</td>
                  <td>
                    <span className="table-status">Sehat</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function SuperAdminWorkspace({
  section,
  onNotice,
}: {
  section: string
  onNotice: (message: string) => void
}) {
  const [partnerFilter, setPartnerFilter] = useState("Semua")
  const partners = [
    [
      "Adi Saputra",
      "Gili Trawangan",
      "BlueWater Lombok",
      "4.820",
      "99,1%",
      "Online",
    ],
    [
      "Lalu Fikri",
      "Gunung Rinjani",
      "Rinjani Explore",
      "3.640",
      "97,8%",
      "Online",
    ],
    ["Siti Aulia", "Desa Sade", "Sade Heritage", "2.185", "98,6%", "Online"],
    [
      "Maya Lestari",
      "Pantai Mandalika",
      "Mandalika Visit",
      "5.120",
      "99,4%",
      "Offline",
    ],
  ]

  if (section === "Mitra & Admin") {
    return (
      <div className="space-y-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon="users"
            label="Admin destinasi"
            value="62"
            change="+6 bulan ini"
          />
          <StatCard
            icon="location"
            label="Mitra wisata aktif"
            value="45 / 48"
            change="93,7%"
            tone="green"
          />
          <StatCard
            icon="ticket"
            label="Keberhasilan transaksi"
            value="98,4%"
            change="+1,2%"
            tone="purple"
          />
          <StatCard
            icon="mail"
            label="SLA komunikasi"
            value="92%"
            change="Rata-rata 2j"
            tone="orange"
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
          <article className="panel-card">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <h2 className="panel-title">Keberhasilan transaksi mitra</h2>
                <p className="panel-subtitle">
                  Perbandingan tiket berhasil, pending, dan refund
                </p>
              </div>
              <div className="flex gap-2">
                {["Semua", "Bahari", "Alam", "Budaya"].map((item) => (
                  <button
                    key={item}
                    onClick={() => setPartnerFilter(item)}
                    className={`mini-filter ${
                      partnerFilter === item ? "mini-filter-active" : ""
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-7 grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
              <div className="success-ring">
                <div>
                  <strong>98,4%</strong>
                  <span>Berhasil</span>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  ["Transaksi berhasil", "18.920", "98,4%", "bg-eco-500"],
                  ["Menunggu penyelesaian", "214", "1,1%", "bg-sunset-500"],
                  ["Refund / dibatalkan", "96", "0,5%", "bg-red-500"],
                ].map(([label, value, percent, color]) => (
                  <div key={label}>
                    <div className="mb-2 flex justify-between text-xs">
                      <span className="text-slate-500">{label}</span>
                      <strong className="text-slate-700">
                        {value} · {percent}
                      </strong>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${color}`}
                        style={{ width: percent }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <article className="panel-card">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="panel-title">Pusat komunikasi</h2>
                <p className="panel-subtitle">
                  Admin menghubungi SILAQ dan sebaliknya
                </p>
              </div>
              <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-600">
                5 baru
              </span>
            </div>
            <div className="mt-5 space-y-3">
              {[
                [
                  "Masuk",
                  "Rinjani Explore",
                  "Permintaan penambahan kuota",
                  "12 menit",
                ],
                [
                  "Keluar",
                  "BlueWater Lombok",
                  "Tindak lanjut refund massal",
                  "1 jam",
                ],
                [
                  "Masuk",
                  "Sade Heritage",
                  "Bantuan konfigurasi event",
                  "3 jam",
                ],
              ].map(([direction, partner, subject, time]) => (
                <button
                  key={`${partner}-${subject}`}
                  onClick={() =>
                    onNotice(`Percakapan dengan ${partner} dibuka.`)
                  }
                  className="outreach-item"
                >
                  <span
                    className={`outreach-direction ${
                      direction === "Masuk" ? "outreach-in" : ""
                    }`}
                  >
                    <Icon
                      name={direction === "Masuk" ? "mail" : "arrow"}
                      size={15}
                    />
                  </span>
                  <span className="flex-1 text-left">
                    <strong>{partner}</strong>
                    <small>{subject}</small>
                  </span>
                  <span className="text-[9px] text-slate-400">{time}</span>
                </button>
              ))}
            </div>
            <AppButton
              onClick={() =>
                onNotice("Form broadcast ke seluruh admin destinasi dibuka.")
              }
              className="mt-5 w-full justify-center"
            >
              <Icon name="mail" size={17} />
              Hubungi admin mitra
            </AppButton>
          </article>
        </section>

        <section className="panel-card overflow-hidden p-0">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="panel-title">Direktori admin & tempat wisata</h2>
              <p className="panel-subtitle">
                Kinerja tiket dan status kontak setiap pengelola
              </p>
            </div>
            <div className="flex gap-2">
              <AppButton
                onClick={() => onNotice("Undangan admin baru siap dikirim.")}
                variant="secondary"
              >
                <Icon name="users" size={17} />
                Undang admin
              </AppButton>
              <AppButton
                onClick={() => onNotice("Data direktori berhasil diekspor.")}
              >
                <Icon name="download" size={17} />
                Ekspor
              </AppButton>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Admin</th>
                  <th>Tempat wisata / mitra</th>
                  <th>Tiket terjual</th>
                  <th>Transaksi berhasil</th>
                  <th>Status</th>
                  <th>Komunikasi</th>
                </tr>
              </thead>
              <tbody>
                {partners.map(
                  ([admin, place, partner, tickets, success, status]) => (
                    <tr key={admin}>
                      <td>
                        <div className="flex items-center gap-3">
                          <span className="admin-avatar">
                            {admin
                              .split(" ")
                              .map((part) => part[0])
                              .join("")}
                          </span>
                          <strong className="text-slate-800">{admin}</strong>
                        </div>
                      </td>
                      <td>
                        <strong className="block text-slate-700">
                          {place}
                        </strong>
                        <span className="mt-1 block text-[10px] text-slate-400">
                          {partner}
                        </span>
                      </td>
                      <td>{tickets}</td>
                      <td>
                        <span className="font-bold text-eco-600">
                          {success}
                        </span>
                      </td>
                      <td>
                        <span
                          className={
                            status === "Online"
                              ? "table-status"
                              : "table-status table-status-neutral"
                          }
                        >
                          {status}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() =>
                            onNotice(`Pesan baru untuk ${admin} dibuka.`)
                          }
                          className="contact-admin-button"
                        >
                          <Icon name="mail" size={15} />
                          Hubungi
                        </button>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            [
              "ticket",
              "Integrasi tiket",
              "42 mitra tersinkron real-time",
              "3 perlu sinkron ulang",
            ],
            [
              "wallet",
              "Settlement mitra",
              "Rp 3,9 M sudah disalurkan",
              "Rp 420 Jt diproses",
            ],
            [
              "activity",
              "Kesehatan API",
              "99,96% request berhasil",
              "2 integrasi dipantau",
            ],
          ].map(([icon, title, value, note]) => (
            <article key={title} className="panel-card">
              <span className="stat-icon stat-icon-blue">
                <Icon name={icon as IconName} />
              </span>
              <h3 className="font-display mt-4 text-base font-semibold text-slate-900">
                {title}
              </h3>
              <p className="mt-2 text-sm font-semibold text-slate-700">
                {value}
              </p>
              <p className="mt-1 text-xs text-slate-400">{note}</p>
            </article>
          ))}
        </section>
      </div>
    )
  }

  if (section === "Transaksi") {
    const settlements = [
      [
        "STL-2902",
        "BlueWater Lombok",
        "Rp 185.400.000",
        "28 Feb 2026",
        "Siap dicairkan",
      ],
      [
        "STL-2901",
        "Rinjani Explore",
        "Rp 142.850.000",
        "28 Feb 2026",
        "Diproses",
      ],
      ["STL-2900", "Sade Heritage", "Rp 88.720.000", "27 Feb 2026", "Selesai"],
      [
        "STL-2899",
        "Mandalika Visit",
        "Rp 210.300.000",
        "27 Feb 2026",
        "Selesai",
      ],
    ]
    return (
      <div className="space-y-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon="wallet"
            label="GMV bulan ini"
            value="Rp 4,8 M"
            change="+8,6%"
            tone="orange"
          />
          <StatCard
            icon="check"
            label="Transaksi berhasil"
            value="98,4%"
            change="+1,2%"
            tone="green"
          />
          <StatCard
            icon="activity"
            label="Settlement diproses"
            value="Rp 420 Jt"
            change="12 batch"
          />
          <StatCard
            icon="ticket"
            label="Refund bulan ini"
            value="Rp 38,4 Jt"
            change="-6,2%"
            tone="purple"
          />
        </section>
        <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <article className="panel-card">
            <div>
              <h2 className="panel-title">Volume transaksi platform</h2>
              <p className="panel-subtitle">
                Nilai pembayaran berhasil selama 12 bulan
              </p>
            </div>
            <BarChart />
          </article>
          <article className="panel-card">
            <h2 className="panel-title">Anomali transaksi</h2>
            <p className="panel-subtitle">
              Pemeriksaan yang membutuhkan perhatian
            </p>
            <div className="mt-5 space-y-3">
              {[
                ["9 transaksi ganda terdeteksi", "Periksa sebelum settlement"],
                [
                  "Refund BlueWater meningkat 3,1%",
                  "Bandingkan dengan minggu lalu",
                ],
                ["2 pembayaran tertahan", "Verifikasi payment gateway"],
              ].map(([title, text]) => (
                <button
                  key={title}
                  onClick={() => onNotice(title)}
                  className="risk-item"
                >
                  <span className="risk-dot" />
                  <span className="flex-1 text-left">
                    <strong>{title}</strong>
                    <small>{text}</small>
                  </span>
                  <Icon name="chevron" size={16} />
                </button>
              ))}
            </div>
          </article>
        </section>
        <section className="panel-card overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div>
              <h2 className="panel-title">Settlement mitra</h2>
              <p className="panel-subtitle">
                Jadwal pencairan pendapatan tiket
              </p>
            </div>
            <AppButton
              onClick={() => onNotice("Rekonsiliasi seluruh batch dimulai.")}
            >
              Rekonsiliasi sekarang
            </AppButton>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Batch</th>
                  <th>Mitra</th>
                  <th>Nilai</th>
                  <th>Tanggal</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {settlements.map((row) => (
                  <tr key={row[0]}>
                    {row.map((cell, index) => (
                      <td key={cell}>
                        {index === 0 ? (
                          <strong className="text-slate-800">{cell}</strong>
                        ) : index === 4 ? (
                          <span
                            className={`table-status ${
                              cell === "Diproses" ? "table-status-pending" : ""
                            }`}
                          >
                            {cell}
                          </span>
                        ) : (
                          cell
                        )}
                      </td>
                    ))}
                    <td>
                      <button
                        onClick={() => onNotice(`Detail ${row[0]} dibuka.`)}
                      >
                        <Icon name="more" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    )
  }

  if (section === "Laporan") {
    return (
      <div className="space-y-6">
        <section className="report-hero">
          <div>
            <span className="ai-kicker">
              <Icon name="report" size={16} /> Reporting center
            </span>
            <h2 className="font-display mt-5 text-2xl font-semibold text-white">
              Buat laporan ekosistem yang siap dibagikan
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/65">
              Gabungkan data transaksi, wisatawan, destinasi, dan mitra dalam
              satu laporan terverifikasi.
            </p>
          </div>
          <AppButton onClick={() => onNotice("Builder laporan baru dibuka.")}>
            <Icon name="report" size={17} />
            Buat laporan baru
          </AppButton>
        </section>
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[
            [
              "Laporan Eksekutif Bulanan",
              "KPI utama, pertumbuhan, risiko, dan rekomendasi",
              "Terakhir dibuat 1 Feb 2026",
            ],
            [
              "Rekonsiliasi Transaksi",
              "Settlement, refund, biaya layanan, dan pajak",
              "Terakhir dibuat 27 Feb 2026",
            ],
            [
              "Kinerja Mitra & Destinasi",
              "SLA, penjualan tiket, rating, dan kepatuhan",
              "Terakhir dibuat 25 Feb 2026",
            ],
            [
              "Pergerakan Wisatawan",
              "Distribusi kunjungan agregat per wilayah",
              "Terakhir dibuat 24 Feb 2026",
            ],
            [
              "Dampak Ekonomi Lokal",
              "UMKM, tenaga kerja, dan nilai transaksi lokal",
              "Terakhir dibuat 20 Feb 2026",
            ],
            [
              "Carbon & Sustainability",
              "Emisi, offset, dan program lingkungan",
              "Terakhir dibuat 18 Feb 2026",
            ],
          ].map(([title, text, date], index) => (
            <article key={title} className="report-template">
              <span
                className={`stat-icon ${
                  index % 2 ? "stat-icon-green" : "stat-icon-blue"
                }`}
              >
                <Icon name="report" />
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
              <small>{date}</small>
              <div className="mt-5 flex gap-2">
                <AppButton
                  onClick={() => onNotice(`${title} sedang dibuat.`)}
                  variant="secondary"
                >
                  Buat
                </AppButton>
                <button
                  onClick={() => onNotice(`Pratinjau ${title} dibuka.`)}
                  className="text-xs font-bold text-ocean-600"
                >
                  Pratinjau
                </button>
              </div>
            </article>
          ))}
        </section>
        <section className="panel-card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="panel-title">Laporan terjadwal</h2>
              <p className="panel-subtitle">
                Dikirim otomatis kepada pemangku kepentingan
              </p>
            </div>
            <AppButton
              onClick={() => onNotice("Form jadwal laporan dibuka.")}
              variant="secondary"
            >
              Tambah jadwal
            </AppButton>
          </div>
          <div className="mt-5 grid gap-3">
            {[
              ["Executive Weekly Brief", "Setiap Senin · 08.00", "12 penerima"],
              [
                "Monthly Tourism Report",
                "Tanggal 1 setiap bulan · 09.00",
                "28 penerima",
              ],
              [
                "Partner Settlement Summary",
                "Setiap Jumat · 16.00",
                "6 penerima",
              ],
            ].map(([name, schedule, recipients]) => (
              <div key={name} className="scheduled-report">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ocean-50 text-ocean-600">
                  <Icon name="calendar" />
                </span>
                <span className="flex-1">
                  <strong>{name}</strong>
                  <small>{schedule}</small>
                </span>
                <span>{recipients}</span>
                <button onClick={() => onNotice(`Pengaturan ${name} dibuka.`)}>
                  <Icon name="settings" size={17} />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    )
  }

  if (section === "Destinasi") {
    return (
      <div className="space-y-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon="location"
            label="Destinasi aktif"
            value="126"
            change="+11 baru"
          />
          <StatCard
            icon="users"
            label="Total kunjungan"
            value="28.490"
            change="+12,4%"
            tone="green"
          />
          <StatCard
            icon="star"
            label="Rating rata-rata"
            value="4,76"
            change="+0,12"
            tone="orange"
          />
          <StatCard
            icon="carbon"
            label="Destinasi hijau"
            value="38"
            change="+7"
            tone="purple"
          />
        </section>
        <section className="grid gap-6 lg:grid-cols-2">
          {destinations.map((item, index) => (
            <article key={item.name} className="destination-admin-card">
              <img src={item.image} alt={item.name} />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3>{item.name}</h3>
                    <p>
                      <Icon name="location" size={13} />
                      {item.location}
                    </p>
                  </div>
                  <span className="table-status">Aktif</span>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-3">
                  <div>
                    <strong>{[4820, 3640, 2185][index]}</strong>
                    <span>Kunjungan</span>
                  </div>
                  <div>
                    <strong>{item.rating}</strong>
                    <span>Rating</span>
                  </div>
                  <div>
                    <strong>{[98, 96, 99][index]}%</strong>
                    <span>SLA</span>
                  </div>
                </div>
                <button
                  onClick={() => onNotice(`Dashboard ${item.name} dibuka.`)}
                  className="mt-5 text-xs font-bold text-ocean-600"
                >
                  Lihat dashboard destinasi →
                </button>
              </div>
            </article>
          ))}
        </section>
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
      <article className="panel-card">
        <h2 className="panel-title">Konfigurasi platform</h2>
        <p className="panel-subtitle">Pengaturan global SILAQ</p>
        <div className="mt-5 space-y-2">
          {[
            "Biaya layanan & pajak",
            "Hak akses dan peran",
            "Notifikasi platform",
            "Integrasi pembayaran",
            "Keamanan dan audit",
          ].map((item) => (
            <button
              key={item}
              onClick={() => onNotice(`Pengaturan ${item} dibuka.`)}
              className="consumer-drawer-item"
            >
              <Icon name="settings" size={18} />
              <span>{item}</span>
              <Icon name="chevron" className="ml-auto" size={16} />
            </button>
          ))}
        </div>
      </article>
      <article className="panel-card">
        <h2 className="panel-title">Status integrasi</h2>
        <p className="panel-subtitle">Layanan yang terhubung ke ekosistem</p>
        <div className="mt-5 space-y-3">
          {[
            ["Payment Gateway", "Normal"],
            ["WhatsApp Business", "Normal"],
            ["Email Transactional", "Normal"],
            ["Carbon Registry API", "Perlu pembaruan"],
          ].map(([name, status]) => (
            <div
              key={name}
              className="flex items-center justify-between rounded-xl border border-slate-100 p-4"
            >
              <div>
                <strong className="text-sm text-slate-700">{name}</strong>
                <p className="mt-1 text-xs text-slate-400">
                  Terakhir diperiksa 5 menit lalu
                </p>
              </div>
              <span
                className={
                  status === "Normal"
                    ? "table-status"
                    : "table-status table-status-pending"
                }
              >
                {status}
              </span>
            </div>
          ))}
        </div>
      </article>
    </div>
  )
}

function AdminOperationsOverview({
  onNavigate,
  onNotice,
}: {
  onNavigate: (page: string) => void
  onNotice: (message: string) => void
}) {
  const checkIns = [
    ["09:42", "Nadya Putri", "VIP · 2 tiket", "Berhasil"],
    ["09:38", "Made Surya", "Reguler · 1 tiket", "Berhasil"],
    ["09:31", "Sarah Wilson", "Weekend · 2 tiket", "Berhasil"],
    ["09:20", "Rizky Ananda", "Reguler · 4 tiket", "Perlu cek"],
  ]
  return (
    <div className="space-y-6">
      <section className="operator-status-bar">
        <div className="flex items-center gap-4">
          <span className="operator-live-icon">
            <Icon name="activity" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-eco-600">
              Operasional hari ini
            </p>
            <h2 className="font-display mt-1 text-xl font-semibold text-slate-900">
              Gate Gili Trawangan aktif
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Terakhir sinkron 10:02 WITA · 2 perangkat scanner terhubung
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <AppButton onClick={() => onNotice("Mode scanner tiket diaktifkan.")}>
            <Icon name="ticket" size={17} />
            Buka scanner
          </AppButton>
          <AppButton
            onClick={() => onNavigate("Tiket & Harga")}
            variant="secondary"
          >
            Atur kuota tiket
          </AppButton>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon="users"
          label="Sudah masuk hari ini"
          value="684"
          change="+84/jam"
        />
        <StatCard
          icon="ticket"
          label="Tiket belum digunakan"
          value="352"
          change="Sisa 22%"
          tone="purple"
        />
        <StatCard
          icon="wallet"
          label="Pendapatan hari ini"
          value="Rp 48,2 Jt"
          change="+9,8%"
          tone="orange"
        />
        <StatCard
          icon="activity"
          label="Keberhasilan scan"
          value="99,4%"
          change="Stabil"
          tone="green"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <article className="panel-card">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="panel-title">Kapasitas per sesi</h2>
              <p className="panel-subtitle">
                Kuota tiket hari ini · 28 Februari
              </p>
            </div>
            <AppButton
              onClick={() => onNavigate("Tiket & Harga")}
              variant="ghost"
            >
              Kelola kuota
            </AppButton>
          </div>
          <div className="mt-6 space-y-5">
            {[
              ["Pagi · 08.00–11.00", 92, "460 / 500", "Hampir penuh"],
              ["Siang · 11.00–15.00", 68, "340 / 500", "Tersedia"],
              ["Sore · 15.00–18.00", 44, "220 / 500", "Tersedia"],
            ].map(([label, percent, count, status]) => (
              <div key={label as string}>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">{label}</span>
                  <span className="text-slate-400">
                    {count as string} · {status as string}
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${
                      percent as number > 85 ? "bg-sunset-500" : "bg-ocean-500"
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-7 rounded-2xl bg-sunset-100/60 p-4">
            <p className="text-xs font-bold text-sunset-600">
              Perhatian sesi pagi
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Tersisa 40 tiket. Pertimbangkan menutup penjualan manual agar
              tidak terjadi overbooking.
            </p>
          </div>
        </article>

        <article className="panel-card">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="panel-title">Aktivitas gate</h2>
              <p className="panel-subtitle">Pemindaian tiket terbaru</p>
            </div>
            <span className="status-live">
              <span /> Live
            </span>
          </div>
          <div className="mt-5 space-y-1">
            {checkIns.map(([time, name, ticket, status]) => (
              <button
                key={`${time}-${name}`}
                onClick={() => onNotice(`Detail tiket ${name} dibuka.`)}
                className="gate-activity"
              >
                <span className="gate-time">{time}</span>
                <span className="flex-1 text-left">
                  <strong>{name}</strong>
                  <small>{ticket}</small>
                </span>
                <span
                  className={
                    status === "Perlu cek" ? "text-sunset-600" : "text-eco-600"
                  }
                >
                  {status}
                </span>
              </button>
            ))}
          </div>
          <AppButton
            onClick={() => onNavigate("Pemesanan")}
            variant="secondary"
            className="mt-5 w-full justify-center"
          >
            Lihat semua pemesanan
          </AppButton>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {[
          [
            "event",
            "Event hari ini",
            "Gili Sunset Market dimulai 16.00 WITA",
            "Kelola event",
            "Event",
          ],
          [
            "wallet",
            "Rekonsiliasi",
            "12 transaksi menunggu pencocokan",
            "Periksa transaksi",
            "Pemesanan",
          ],
          [
            "users",
            "Tim bertugas",
            "8 staf aktif di 3 titik layanan",
            "Lihat pengunjung",
            "Pengunjung",
          ],
        ].map(([icon, title, text, action, target]) => (
          <article key={title} className="panel-card">
            <span className="stat-icon stat-icon-blue">
              <Icon name={icon as IconName} />
            </span>
            <h3 className="font-display mt-4 text-base font-semibold text-slate-900">
              {title}
            </h3>
            <p className="mt-2 min-h-10 text-xs leading-5 text-slate-500">
              {text}
            </p>
            <button
              onClick={() => onNavigate(target)}
              className="mt-4 flex items-center gap-2 text-xs font-bold text-ocean-600"
            >
              {action}
              <Icon name="arrow" size={15} />
            </button>
          </article>
        ))}
      </section>
    </div>
  )
}

function AdminDashboard({
  role,
  onLogout,
}: {
  role: "superadmin" | "admin"
  onLogout: () => void
}) {
  const config = roleConfig[role]
  const [activeNav, setActiveNav] = useState("Ringkasan")
  const [mobileMenu, setMobileMenu] = useState(false)
  const [notice, setNotice] = useState("")
  const isSuper = role === "superadmin"
  const transactions = isSuper
    ? [
        [
          "LT-29481",
          "Explore Rinjani",
          "Admin Sembalun",
          "Rp 4.250.000",
          "Berhasil",
        ],
        [
          "LT-29480",
          "Gili Fast Boat",
          "BlueWater Lombok",
          "Rp 2.850.000",
          "Berhasil",
        ],
        [
          "LT-29479",
          "Bau Nyale Pass",
          "Dispar Loteng",
          "Rp 1.420.000",
          "Diproses",
        ],
        [
          "LT-29478",
          "Sasak Village",
          "Sade Heritage",
          "Rp 875.000",
          "Berhasil",
        ],
      ]
    : [
        ["GT-1048", "Nadya Putri", "2 Tiket VIP", "Rp 500.000", "Check-in"],
        [
          "GT-1047",
          "Rizky Ananda",
          "4 Tiket Reguler",
          "Rp 600.000",
          "Terbayar",
        ],
        ["GT-1046", "Sarah Wilson", "2 Weekend Pass", "Rp 400.000", "Terbayar"],
        ["GT-1045", "Made Surya", "1 Tiket VIP", "Rp 250.000", "Check-in"],
      ]

  return (
    <div className="min-h-screen bg-slate-50">
      <aside
        className={`admin-sidebar ${mobileMenu ? "admin-sidebar-open" : ""}`}
      >
        <div className="flex items-center justify-between px-6 py-7">
          <Logo inverse />
          <button
            onClick={() => setMobileMenu(false)}
            className="admin-drawer-close min-[1101px]:hidden"
            aria-label="Tutup menu admin"
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="mx-5 mb-7 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-sky-300">
            {config.label}
          </p>
          <p className="mt-1 text-sm font-semibold text-white">
            {config.eyebrow}
          </p>
        </div>
        <nav className="flex-1 space-y-1 px-4">
          {config.nav.map(([label, icon]) => (
            <button
              key={label}
              onClick={() => {
                setActiveNav(label)
                setMobileMenu(false)
              }}
              className={`sidebar-item ${
                activeNav === label ? "sidebar-item-active" : ""
              }`}
            >
              <Icon name={icon} />
              <span>{label}</span>
              {label === "Mitra & Admin" && (
                <span className="ml-auto rounded-full bg-sunset-500 px-2 py-0.5 text-[10px] text-white">
                  8
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-2xl p-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-400/20 text-sky-300">
              <Icon name="user" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {isSuper ? "Nadia Permata" : "Adi Saputra"}
              </p>
              <p className="truncate text-[11px] text-slate-400">
                {config.label}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="text-slate-400 hover:text-white"
              aria-label="Keluar"
            >
              <Icon name="logout" />
            </button>
          </div>
        </div>
      </aside>

      <main className="admin-main">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200/80 bg-white/90 px-5 backdrop-blur-lg lg:px-9">
          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 min-[1101px]:hidden"
            aria-label="Buka menu admin"
            aria-expanded={mobileMenu}
          >
            <Icon name="menu" />
          </button>
          <div className="hidden items-center gap-3 rounded-xl bg-slate-100 px-4 py-2.5 text-sm text-slate-400 lg:flex lg:w-80">
            <Icon name="search" size={18} />
            Cari data, transaksi, atau mitra...
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => setNotice("Tidak ada notifikasi baru.")}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600"
            >
              <Icon name="bell" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
            </button>
            <div className="hidden h-8 w-px bg-slate-200 sm:block" />
            <span className="hidden text-sm font-semibold text-slate-700 sm:block">
              Februari 2026
            </span>
          </div>
        </header>

        <div className="p-5 lg:p-9">
          <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-ocean-600">
                {activeNav}
              </p>
              <h1 className="font-display text-3xl font-semibold text-slate-950">
                {activeNav === "Ringkasan" ? config.title : activeNav}
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                {activeNav === "Ringkasan"
                  ? config.subtitle
                  : `Kelola data ${activeNav.toLowerCase()} dengan akses ${config.label}.`}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <AppButton
                variant="secondary"
                onClick={() =>
                  setNotice("Rentang laporan aktif: 1–28 Februari 2026.")
                }
              >
                <Icon name="calendar" size={17} />
                01–28 Feb 2026
              </AppButton>
              <AppButton
                onClick={() =>
                  setNotice("Laporan berhasil disiapkan untuk diunduh.")
                }
              >
                <Icon name="download" size={17} />
                Ekspor laporan
              </AppButton>
            </div>
          </div>

          {activeNav === "Ringkasan" ? (
            isSuper ? (
              <SuperAdminOverview
                onNavigate={setActiveNav}
                onNotice={setNotice}
              />
            ) : (
              <AdminOperationsOverview
                onNavigate={setActiveNav}
                onNotice={setNotice}
              />
            )
          ) : isSuper && activeNav === "AI Insight" ? (
            <SuperAdminAI />
          ) : isSuper ? (
            <SuperAdminWorkspace section={activeNav} onNotice={setNotice} />
          ) : (
            <>
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  icon="users"
                  label={isSuper ? "Total wisatawan" : "Pengunjung hari ini"}
                  value={isSuper ? "28.490" : "684"}
                  change="+12,4%"
                />
                <StatCard
                  icon="wallet"
                  label={isSuper ? "GMV bulan ini" : "Pendapatan hari ini"}
                  value={isSuper ? "Rp 4,8 M" : "Rp 48,2 Jt"}
                  change="+8,6%"
                  tone="orange"
                />
                <StatCard
                  icon="ticket"
                  label={isSuper ? "Tiket terjual" : "Tiket terjual"}
                  value={isSuper ? "18.920" : "1.248"}
                  change="+16,2%"
                  tone="purple"
                />
                <StatCard
                  icon={isSuper ? "users" : "activity"}
                  label={isSuper ? "Mitra aktif" : "Okupansi"}
                  value={isSuper ? "45 / 48" : "78%"}
                  change="+5,1%"
                  tone="green"
                />
              </section>

              <section className="mt-6 grid gap-6 xl:grid-cols-[1.65fr_1fr]">
                <article className="panel-card">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="panel-title">
                        {isSuper
                          ? "Tren kunjungan Lombok"
                          : "Kunjungan per jam"}
                      </h2>
                      <p className="panel-subtitle">
                        Performa 12 periode terakhir
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setNotice(
                          "Grafik menggunakan data 12 periode terakhir.",
                        )
                      }
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                    >
                      <Icon name="more" />
                    </button>
                  </div>
                  <BarChart admin={!isSuper} />
                </article>
                <article className="panel-card">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="panel-title">
                        {isSuper ? "Distribusi destinasi" : "Kapasitas tiket"}
                      </h2>
                      <p className="panel-subtitle">
                        Status operasional saat ini
                      </p>
                    </div>
                    <span className="status-live">
                      <span />
                      Live
                    </span>
                  </div>
                  <div className="mt-7 flex items-center gap-8">
                    <div className="donut">
                      <div>
                        <strong>{isSuper ? "45" : "78%"}</strong>
                        <span>{isSuper ? "Mitra" : "Terisi"}</span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-4">
                      {[
                        [
                          isSuper ? "Wisata alam" : "VIP",
                          "42%",
                          "bg-ocean-500",
                        ],
                        [isSuper ? "Bahari" : "Reguler", "35%", "bg-teal-500"],
                        [
                          isSuper ? "Budaya" : "Weekend",
                          "23%",
                          "bg-sunset-500",
                        ],
                      ].map(([label, value, color]) => (
                        <div
                          key={label}
                          className="flex items-center gap-3 text-sm"
                        >
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${color}`}
                          />
                          <span className="flex-1 text-slate-500">{label}</span>
                          <strong className="text-slate-800">{value}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-8 rounded-2xl bg-eco-50 p-4">
                    <p className="text-xs font-semibold text-eco-700">
                      Operasional sehat
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {isSuper
                        ? "93% mitra aktif tanpa kendala layanan."
                        : "Kapasitas masih tersedia untuk 352 pengunjung."}
                    </p>
                  </div>
                </article>
              </section>

              <section className="panel-card mt-6 overflow-hidden p-0">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                  <div>
                    <h2 className="panel-title">Transaksi terbaru</h2>
                    <p className="panel-subtitle">
                      Pembaruan pembayaran dan check-in terkini
                    </p>
                  </div>
                  <AppButton
                    variant="ghost"
                    onClick={() => setActiveNav("Transaksi")}
                  >
                    Lihat semua
                    <Icon name="arrow" size={16} />
                  </AppButton>
                </div>
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID Transaksi</th>
                        <th>{isSuper ? "Produk" : "Nama pengunjung"}</th>
                        <th>{isSuper ? "Mitra" : "Pesanan"}</th>
                        <th>Nilai</th>
                        <th>Status</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((row) => (
                        <tr key={row[0]}>
                          {row.map((cell, i) => (
                            <td key={cell}>
                              {i === 0 ? (
                                <strong className="text-slate-800">
                                  {cell}
                                </strong>
                              ) : i === 4 ? (
                                <span
                                  className={`table-status ${
                                    cell === "Diproses"
                                      ? "table-status-pending"
                                      : ""
                                  }`}
                                >
                                  {cell}
                                </span>
                              ) : (
                                cell
                              )}
                            </td>
                          ))}
                          <td>
                            <button
                              onClick={() =>
                                setNotice(
                                  `Detail transaksi ${row[0]} siap ditinjau.`,
                                )
                              }
                              className="text-slate-400"
                            >
                              <Icon name="more" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </div>
      </main>
      {notice && (
        <div className="toast-message">
          <Icon name="check" size={17} />
          <span>{notice}</span>
          <button onClick={() => setNotice("")}>Tutup</button>
        </div>
      )}
      {mobileMenu && (
        <button
          className="fixed inset-0 z-30 bg-slate-950/40 min-[1101px]:hidden"
          onClick={() => setMobileMenu(false)}
          aria-label="Tutup menu"
        />
      )}
    </div>
  )
}

const destinations = [
  {
    name: "Gili Trawangan",
    location: "Lombok Utara",
    rating: "4.9",
    price: "Rp 150.000",
    image: PHOTOS.gili,
    tag: "Paling diminati",
  },
  {
    name: "Gunung Rinjani",
    location: "Lombok Timur",
    rating: "4.8",
    price: "Rp 350.000",
    image: PHOTOS.rinjani,
    tag: "Petualangan",
  },
  {
    name: "Desa Sembalun",
    location: "Lombok Timur",
    rating: "4.7",
    price: "Rp 75.000",
    image: PHOTOS.fields,
    tag: "Pilihan lokal",
  },
]

type ConsumerPage = "Beranda" | "Jelajahi" | "Perjalanan" | "Tiket Saya" | "Kalender" | "AI Guide" | "Pemesanan"

type Destination = typeof destinations[number]

function ConsumerDashboard({ onLogout }: { onLogout: () => void }) {
  const [page, setPage] = useState<ConsumerPage>("Beranda")
  const [category, setCategory] = useState("Semua")
  const [query, setQuery] = useState("")
  const [selectedDate, setSelectedDate] = useState("28 Feb 2026")
  const [dateOpen, setDateOpen] = useState(false)
  const [selectedDestination, setSelectedDestination] = useState<Destination>(
    destinations[0],
  )
  const [quantity, setQuantity] = useState(2)
  const [ticketType, setTicketType] = useState("VIP")
  const [agendaDay, setAgendaDay] = useState("28 Feb")
  const [saved, setSaved] = useState<string[]>([])
  const [notice, setNotice] = useState("")
  const [consumerMenu, setConsumerMenu] = useState(false)
  const [aiInput, setAiInput] = useState("")
  const [messages, setMessages] = useState([
    {
      from: "ai",
      text: "Halo Reza, saya AI Guide SILAQ. Saya bisa membantu membuat itinerary, mencari transportasi, atau memberi rekomendasi lokal.",
    },
  ])
  const nav: [ConsumerPage, IconName][] = [
    ["Beranda", "home"],
    ["Jelajahi", "search"],
    ["Perjalanan", "location"],
    ["Tiket Saya", "ticket"],
    ["Kalender", "calendar"],
  ]

  const openBooking = (destination: Destination) => {
    setSelectedDestination(destination)
    setPage("Pemesanan")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const sendMessage = (text = aiInput) => {
    if (!text.trim()) return
    const response = text.toLowerCase().includes("itinerary")
      ? `Untuk ${selectedDate}, saya sarankan mulai dari Desa Sade pukul 08.00, makan siang di Kuta Mandalika, lalu sunset di Pantai Tanjung Aan. Estimasi biaya Rp 425.000 per orang.`
      : text.toLowerCase().includes("transport")
        ? "Untuk perjalanan antardestinasi, sewa mobil dengan pengemudi adalah opsi paling efisien. Estimasi Rp 550.000 per 10 jam, sudah termasuk bahan bakar."
        : "Rekomendasi cepat saya: pilih Gili Trawangan untuk aktivitas bahari, Sembalun untuk suasana tenang, atau Desa Sade untuk pengalaman budaya. Mau saya susun rute lengkap?"
    setMessages((current) => [
      ...current,
      { from: "user", text },
      { from: "ai", text: response },
    ])
    setAiInput("")
  }

  const basePrice =
    ticketType === "VIP" ? 250000 : ticketType === "Weekend" ? 200000 : 150000
  const totalPrice = basePrice * quantity + 5000

  const renderHome = () => (
    <>
      <section className="consumer-hero">
        <img
          src={PHOTOS.hero}
          alt="Pemandangan pantai Lombok"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/45 to-transparent" />
        <div className="consumer-container relative z-10 flex min-h-[510px] items-center py-16">
          <div className="max-w-2xl">
            <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-sky-300">
              <span className="h-px w-8 bg-sky-300" />
              Temukan sisi terbaik Lombok
            </p>
            <h1 className="font-display text-4xl font-semibold leading-[1.1] text-white md:text-6xl">
              Satu pulau, ribuan cerita untuk dijelajahi.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/75">
              Rencanakan perjalanan personal dengan rekomendasi lokal, tiket
              resmi, dan AI Guide yang selalu siap membantu.
            </p>
            <div className="mt-8 flex max-w-2xl flex-col gap-3 rounded-2xl bg-white p-2 shadow-2xl sm:flex-row">
              <label className="flex flex-1 items-center gap-3 px-3 py-2">
                <Icon name="search" className="text-ocean-500" />
                <span className="flex-1">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Mau ke mana?
                  </span>
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="mt-1 w-full bg-transparent text-sm text-slate-800 outline-none"
                    placeholder="Cari pantai, gunung, atau event"
                  />
                </span>
              </label>
              <span className="hidden w-px bg-slate-200 sm:block" />
              <button
                onClick={() => setDateOpen(true)}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-slate-50 sm:w-44"
              >
                <Icon name="calendar" className="text-ocean-500" />
                <span>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Tanggal
                  </span>
                  <strong className="mt-1 block text-sm text-slate-800">
                    {selectedDate}
                  </strong>
                </span>
              </button>
              <AppButton
                onClick={() => setPage("Jelajahi")}
                className="justify-center px-7"
              >
                Cari
              </AppButton>
            </div>
          </div>
        </div>
      </section>
      <div className="consumer-container py-12">
        <section className="-mt-20 relative z-10 mb-14 grid gap-4 md:grid-cols-3">
          {[
            [
              "ticket",
              "Pesan tiket resmi",
              "QR tiket langsung tersedia setelah pembayaran",
              () => openBooking(destinations[0]),
            ],
            [
              "ai",
              "Rencana dengan AI",
              "Itinerary personal berdasarkan gaya perjalananmu",
              () => setPage("AI Guide"),
            ],
            [
              "carbon",
              "Wisata lebih hijau",
              "Pantau dan offset emisi perjalanan dengan mudah",
              () =>
                setNotice(
                  "Laporan karbon perjalanan: 12,5 kg CO₂, turun 15% dari trip sebelumnya.",
                ),
            ],
          ].map(([icon, title, text, action]) => (
            <button
              key={title as string}
              onClick={action as () => void}
              className="feature-card text-left"
            >
              <span className="feature-icon">
                <Icon name={icon as IconName} />
              </span>
              <span>
                <strong className="font-display text-base font-semibold text-slate-900">
                  {title as string}
                </strong>
                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  {text as string}
                </span>
              </span>
              <Icon name="chevron" className="ml-auto text-slate-300" />
            </button>
          ))}
        </section>
        <section>
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="section-eyebrow">Pilihan wisatawan</p>
              <h2 className="section-title">Destinasi terbaik untukmu</h2>
              <p className="section-description">
                Rekomendasi kurasi berdasarkan lokasi, ulasan, dan musim
                kunjungan.
              </p>
            </div>
            <AppButton variant="secondary" onClick={() => setPage("Jelajahi")}>
              Lihat semua destinasi
              <Icon name="arrow" size={17} />
            </AppButton>
          </div>
          <div className="mt-7 flex gap-2 overflow-x-auto pb-2">
            {["Semua", "Pantai & Gili", "Pegunungan", "Budaya", "Kuliner"].map(
              (item) => (
                <button
                  key={item}
                  onClick={() => setCategory(item)}
                  className={`category-chip ${
                    category === item ? "category-chip-active" : ""
                  }`}
                >
                  {item}
                </button>
              ),
            )}
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {destinations.map((item) => (
              <DestinationCard
                key={item.name}
                item={item}
                saved={saved.includes(item.name)}
                onSave={() =>
                  setSaved((current) =>
                    current.includes(item.name)
                      ? current.filter((name) => name !== item.name)
                      : [...current, item.name],
                  )
                }
                onBook={() => openBooking(item)}
              />
            ))}
          </div>
        </section>
        <section className="mt-16 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <article className="journey-card">
            <div className="relative z-10 max-w-md">
              <span className="inline-flex rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white">
                Perjalanan aktif
              </span>
              <h2 className="font-display mt-5 text-3xl font-semibold text-white">
                Lombok escape, 5 hari
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/70">
                Hari ke-3 dari 5. Festival Bau Nyale adalah agenda berikutnya.
              </p>
              <div className="mt-7 h-2 overflow-hidden rounded-full bg-white/20">
                <div className="h-full w-3/5 rounded-full bg-sunset-400" />
              </div>
              <AppButton
                onClick={() => setPage("Perjalanan")}
                variant="cta"
                className="mt-7"
              >
                Lanjutkan perjalanan
                <Icon name="arrow" />
              </AppButton>
            </div>
          </article>
          <article className="rounded-3xl border border-eco-100 bg-eco-50 p-7">
            <div className="flex items-start justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-eco-500 text-white">
                <Icon name="carbon" size={24} />
              </span>
              <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-eco-700">
                Eco-Warrior Lv. 2
              </span>
            </div>
            <h2 className="font-display mt-6 text-xl font-semibold text-slate-900">
              Jejak perjalananmu
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Emisi perjalanan saat ini 15% lebih rendah dari trip sebelumnya.
            </p>
            <div className="mt-6">
              <strong className="font-display text-4xl text-slate-950">
                12.5
              </strong>
              <span className="ml-2 text-sm font-semibold text-slate-500">
                kg CO₂
              </span>
            </div>
            <AppButton
              onClick={() =>
                setNotice(
                  "Offset yang direkomendasikan: tanam satu mangrove di Gili Air senilai Rp 25.000.",
                )
              }
              variant="secondary"
              className="mt-7 w-full justify-center border-eco-200 text-eco-700"
            >
              Lihat laporan karbon
            </AppButton>
          </article>
        </section>
      </div>
    </>
  )

  const renderSimplePage = () => {
    if (page === "Jelajahi")
      return (
        <section className="consumer-container py-12">
          <PageHeading
            eyebrow="Jelajahi Lombok"
            title={query ? `Hasil untuk “${query}”` : "Semua destinasi"}
            description={`Tersedia untuk kunjungan ${selectedDate}. Pilih destinasi dan pesan tiket resmi.`}
          />
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {destinations.map((item) => (
              <DestinationCard
                key={item.name}
                item={item}
                saved={saved.includes(item.name)}
                onSave={() =>
                  setSaved((current) =>
                    current.includes(item.name)
                      ? current.filter((name) => name !== item.name)
                      : [...current, item.name],
                  )
                }
                onBook={() => openBooking(item)}
              />
            ))}
          </div>
        </section>
      )
    if (page === "Perjalanan")
      return (
        <section className="consumer-container py-12">
          <PageHeading
            eyebrow="Riwayat kunjungan"
            title="Tempat yang sudah saya kunjungi"
            description="Hanya menampilkan kunjungan yang tercatat melalui pemindaian tiket SILAQ."
          />
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            <article className="panel-card">
              <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                <div>
                  <h2 className="panel-title">History SILAQ</h2>
                  <p className="panel-subtitle">4 kunjungan terverifikasi</p>
                </div>
                <span className="rounded-full bg-eco-50 px-3 py-1.5 text-[10px] font-bold text-eco-700">
                  Data dari QR tiket
                </span>
              </div>
              <div className="mt-3 space-y-1">
                {[
                  [
                    "Gili Trawangan",
                    "1 Mar 2026 · 09:12 WITA",
                    "Wisata bahari",
                  ],
                  ["Desa Sade", "28 Feb 2026 · 19:04 WITA", "Wisata budaya"],
                  [
                    "Mandalika Beach Park",
                    "28 Feb 2026 · 15:38 WITA",
                    "Destinasi pantai",
                  ],
                  [
                    "Festival Bau Nyale",
                    "27 Feb 2026 · 08:21 WITA",
                    "Event lokal",
                  ],
                ].map(([place, visitedAt, category], index) => (
                  <div key={place} className="visit-history-item">
                    <span className="visit-history-icon">
                      <Icon name="location" size={18} />
                    </span>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-slate-800">
                          {place}
                        </p>
                        {index === 0 && (
                          <span className="rounded-full bg-ocean-50 px-2 py-1 text-[9px] font-bold text-ocean-600">
                            Terbaru
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-slate-400">{visitedAt}</p>
                      <p className="mt-2 text-[11px] font-semibold text-slate-500">
                        {category}
                      </p>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-eco-600">
                      <Icon name="check" size={14} />
                      Terverifikasi
                    </span>
                  </div>
                ))}
              </div>
            </article>
            <article className="panel-card h-fit">
              <h3 className="panel-title">Ringkasan kunjungan</h3>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {[
                  ["4", "Tempat"],
                  ["3", "Wilayah"],
                  ["1.250", "Poin"],
                  ["4", "Tiket dipakai"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-2xl bg-slate-50 p-4">
                    <strong className="font-display text-xl text-slate-900">
                      {value}
                    </strong>
                    <p className="mt-1 text-[11px] text-slate-400">{label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-2xl bg-ocean-50 p-4">
                <p className="text-xs font-bold text-ocean-700">
                  Privasi terjaga
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Riwayat hanya berasal dari tiket yang dipindai. SILAQ
                  tidak menampilkan hotel, transportasi, atau jadwal pribadimu.
                </p>
              </div>
              <AppButton
                onClick={() => setPage("Tiket Saya")}
                className="mt-5 w-full justify-center"
              >
                <Icon name="ticket" />
                Lihat riwayat tiket
              </AppButton>
            </article>
          </div>
        </section>
      )
    if (page === "Tiket Saya")
      return (
        <section className="consumer-container py-12">
          <PageHeading
            eyebrow="Digital ticket"
            title="Tiket Saya"
            description="Tiket aktif dan riwayat pemesanan tersedia di sini."
          />
          <article className="ticket-card mt-8">
            <div>
              <span className="table-status">Aktif</span>
              <h3 className="font-display mt-4 text-2xl font-semibold text-slate-900">
                {selectedDestination.name}
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                {selectedDate} · {quantity} tiket {ticketType}
              </p>
              <p className="mt-6 font-mono text-sm font-bold tracking-widest text-ocean-600">
                LMBK-GILI-8A2F
              </p>
            </div>
            <div className="qr-demo">LT</div>
            <AppButton
              onClick={() =>
                setNotice("E-ticket berhasil disiapkan untuk diunduh.")
              }
              variant="secondary"
            >
              <Icon name="download" size={17} />
              Unduh tiket
            </AppButton>
          </article>
        </section>
      )
    const agenda: Record<string, [string, string][]> = {
      "28 Feb": [
        ["15:30", "Mandalika Beach Pass"],
        ["19:00", "Sasak Cultural Night"],
      ],
      "1 Mar": [
        ["09:00", "Gili Trawangan Day Pass"],
        ["13:00", "Gili Snorkeling Experience"],
      ],
      "2 Mar": [["08:30", "Festival Bau Nyale"]],
      "3 Mar": [["09:00", "Rinjani Panorama Tour"]],
      "4 Mar": [["10:30", "Workshop Kerajinan Sasak"]],
    }
    const days = [
      ["Sab", "28 Feb", "Hari 1"],
      ["Min", "1 Mar", "Hari 2"],
      ["Sen", "2 Mar", "Hari 3"],
      ["Sel", "3 Mar", "Hari 4"],
      ["Rab", "4 Mar", "Hari 5"],
    ]
    return (
      <section className="consumer-container py-12">
        <PageHeading
          eyebrow="Kalender perjalanan"
          title="Aktivitas yang sudah dipesan"
          description="Lihat tiket dan kegiatan berdasarkan tanggal serta jam pelaksanaannya."
        />
        <div className="mt-8 grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
          <article className="panel-card h-fit">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-ocean-600">
                  28 Feb–4 Mar 2026
                </p>
                <h2 className="font-display mt-1 text-lg font-semibold text-slate-900">
                  5 tanggal pesanan
                </h2>
              </div>
              <span className="rounded-full bg-eco-50 px-3 py-1.5 text-[11px] font-bold text-eco-700">
                Pesanan aktif
              </span>
            </div>
            <div className="mt-6 space-y-2">
              {days.map(([day, date, journeyDay]) => (
                <button
                  key={date}
                  onClick={() => setAgendaDay(date)}
                  className={`calendar-day-row ${
                    agendaDay === date ? "calendar-day-row-active" : ""
                  }`}
                >
                  <span className="calendar-day-number">
                    {date.split(" ")[0]}
                  </span>
                  <span className="flex-1 text-left">
                    <strong className="block text-sm">
                      {day}, {date} 2026
                    </strong>
                    <small className="mt-1 block opacity-65">
                      {journeyDay} · {agenda[date].length} pesanan
                    </small>
                  </span>
                  {date === "28 Feb" ? (
                    <span className="rounded-full bg-sunset-100 px-2 py-1 text-[9px] font-bold text-sunset-600">
                      Hari ini
                    </span>
                  ) : (
                    <Icon name="chevron" size={16} />
                  )}
                </button>
              ))}
            </div>
          </article>
          <article className="panel-card">
            <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-ocean-600">
                  {days.find((item) => item[1] === agendaDay)?.[2]}
                </p>
                <h2 className="font-display mt-1 text-xl font-semibold text-slate-900">
                  {days.find((item) => item[1] === agendaDay)?.[0]}, {agendaDay}{" "}
                  2026
                </h2>
              </div>
              <AppButton
                onClick={() =>
                  setNotice(`Pengingat untuk ${agendaDay} berhasil diaktifkan.`)
                }
                variant="secondary"
              >
                <Icon name="bell" size={17} />
                Aktifkan pengingat
              </AppButton>
            </div>
            <div className="mt-5">
              {agenda[agendaDay].map(([time, title]) => (
                <div key={`${time}-${title}`} className="agenda-item">
                  <div className="booking-time">
                    <strong>{time}</strong>
                    <span>WITA</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-slate-800">
                      {title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-400">
                      Tiket sudah dipesan
                    </p>
                  </div>
                  <button
                    onClick={() => setPage("Tiket Saya")}
                    className="text-xs font-bold text-ocean-600"
                  >
                    Lihat tiket
                  </button>
                </div>
              ))}
            </div>
            <div className="rounded-2xl bg-ocean-50 p-4">
              <p className="text-xs font-bold text-ocean-700">
                AI Journey Assistant
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Butuh rekomendasi aktivitas lain di tanggal kosong? AI Guide
                dapat membantu tanpa mengakses jadwal pribadimu.
              </p>
              <button
                onClick={() => setPage("AI Guide")}
                className="mt-3 text-xs font-bold text-ocean-600"
              >
                Cari aktivitas dengan AI Guide →
              </button>
            </div>
          </article>
        </div>
      </section>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="consumer-header">
        <div className="consumer-container flex h-20 items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setConsumerMenu(true)}
              className="consumer-menu-trigger md:hidden"
              aria-label="Buka menu utama"
              aria-expanded={consumerMenu}
            >
              <Icon name="menu" />
            </button>
            <button onClick={() => setPage("Beranda")}>
              <Logo />
            </button>
          </div>
          <nav className="hidden items-center gap-1 md:flex">
            {nav.map(([label, icon]) => (
              <button
                key={label}
                onClick={() => setPage(label)}
                className={`consumer-nav ${
                  page === label ? "consumer-nav-active" : ""
                }`}
              >
                <Icon name={icon} size={18} />
                {label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                setNotice(
                  "Pengingat Festival Bau Nyale aktif untuk besok pukul 07.00.",
                )
              }
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600"
            >
              <Icon name="bell" />
              <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500" />
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1 pr-3 text-left"
            >
              <img
                src={PHOTOS.avatar}
                alt="Reza Pratama"
                className="h-9 w-9 rounded-full object-cover"
              />
              <span className="hidden sm:block">
                <strong className="block text-xs text-slate-800">
                  Reza Pratama
                </strong>
                <span className="text-[10px] text-slate-400">Keluar akun</span>
              </span>
            </button>
          </div>
        </div>
      </header>
      {consumerMenu && (
        <>
          <button
            className="consumer-drawer-overlay md:hidden"
            onClick={() => setConsumerMenu(false)}
            aria-label="Tutup menu utama"
          />
          <aside className="consumer-drawer md:hidden">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <Logo />
              <button
                onClick={() => setConsumerMenu(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600"
                aria-label="Tutup menu"
              >
                <Icon name="close" />
              </button>
            </div>
            <div className="p-4">
              <div className="mb-5 flex items-center gap-3 rounded-2xl bg-ocean-50 p-3">
                <img
                  src={PHOTOS.avatar}
                  alt="Reza Pratama"
                  className="h-11 w-11 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Reza Pratama
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Konsumen · Eco-Warrior Lv. 2
                  </p>
                </div>
              </div>
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Menu utama
              </p>
              <nav className="space-y-1">
                {nav.map(([label, icon]) => (
                  <button
                    key={label}
                    onClick={() => {
                      setPage(label)
                      setConsumerMenu(false)
                    }}
                    className={`consumer-drawer-item ${
                      page === label ? "consumer-drawer-item-active" : ""
                    }`}
                  >
                    <Icon name={icon} />
                    <span>{label}</span>
                    <Icon name="chevron" size={16} className="ml-auto" />
                  </button>
                ))}
                <button
                  onClick={() => {
                    setPage("AI Guide")
                    setConsumerMenu(false)
                  }}
                  className={`consumer-drawer-item ${
                    page === "AI Guide" ? "consumer-drawer-item-active" : ""
                  }`}
                >
                  <Icon name="ai" />
                  <span>AI Guide</span>
                  <span className="ml-auto rounded-full bg-teal-500 px-2 py-1 text-[9px] font-bold text-white">
                    Online
                  </span>
                </button>
              </nav>
              <div className="my-5 h-px bg-slate-100" />
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Aksi cepat
              </p>
              <button
                onClick={() => {
                  setDateOpen(true)
                  setConsumerMenu(false)
                }}
                className="consumer-drawer-item"
              >
                <Icon name="calendar" />
                <span className="flex-1 text-left">
                  <strong className="block">Tanggal perjalanan</strong>
                  <small className="mt-0.5 block text-slate-400">
                    {selectedDate}
                  </small>
                </span>
                <Icon name="chevron" size={16} />
              </button>
              <button
                onClick={() => {
                  openBooking(destinations[0])
                  setConsumerMenu(false)
                }}
                className="consumer-drawer-item"
              >
                <Icon name="ticket" />
                <span>Pesan tiket</span>
                <Icon name="chevron" size={16} className="ml-auto" />
              </button>
            </div>
            <div className="mt-auto border-t border-slate-100 p-4">
              <button onClick={onLogout} className="consumer-drawer-logout">
                <Icon name="logout" />
                Keluar dari akun
              </button>
            </div>
          </aside>
        </>
      )}
      <main>
        {page === "Beranda" && renderHome()}
        {["Jelajahi", "Perjalanan", "Tiket Saya", "Kalender"].includes(page) &&
          renderSimplePage()}
        {page === "AI Guide" && (
          <section className="consumer-container py-10">
            <div className="ai-guide-shell">
              <aside className="ai-guide-aside">
                <span className="feature-icon bg-white/15 text-white">
                  <Icon name="ai" />
                </span>
                <h2 className="font-display mt-5 text-2xl font-semibold text-white">
                  AI Guide Lombok
                </h2>
                <p className="mt-2 text-sm leading-6 text-white/65">
                  Asisten perjalanan yang memahami jadwal, budget, dan minatmu.
                </p>
                <div className="mt-8 space-y-2">
                  {[
                    "Buat itinerary 3 hari",
                    "Cari transportasi",
                    "Rekomendasi kuliner lokal",
                  ].map((item) => (
                    <button
                      key={item}
                      onClick={() => sendMessage(item)}
                      className="ai-side-prompt"
                    >
                      {item}
                      <Icon name="chevron" size={16} />
                    </button>
                  ))}
                </div>
              </aside>
              <div className="flex min-h-[600px] flex-col bg-white">
                <div className="border-b border-slate-100 px-6 py-5">
                  <h3 className="font-display font-semibold text-slate-900">
                    Percakapan baru
                  </h3>
                  <p className="mt-1 text-xs text-eco-600">
                    Online · menggunakan data perjalanan {selectedDate}
                  </p>
                </div>
                <div className="flex-1 space-y-5 overflow-y-auto bg-slate-50 p-6">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.from === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`chat-bubble ${
                          message.from === "user" ? "chat-bubble-user" : ""
                        }`}
                      >
                        {message.text}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 border-t border-slate-100 p-4">
                  <input
                    value={aiInput}
                    onChange={(event) => setAiInput(event.target.value)}
                    onKeyDown={(event) =>
                      event.key === "Enter" && sendMessage()
                    }
                    className="min-h-12 flex-1 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-sky-400"
                    placeholder="Tanya tentang Lombok..."
                  />
                  <AppButton
                    onClick={() => sendMessage()}
                    aria-label="Kirim pesan"
                  >
                    <Icon name="arrow" />
                  </AppButton>
                </div>
              </div>
            </div>
          </section>
        )}
        {page === "Pemesanan" && (
          <section className="consumer-container py-12">
            <button
              onClick={() => setPage("Jelajahi")}
              className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-500"
            >
              <Icon name="arrow" className="rotate-180" size={17} />
              Kembali ke destinasi
            </button>
            <div className="grid gap-7 lg:grid-cols-[1.25fr_.75fr]">
              <article className="panel-card">
                <img
                  src={selectedDestination.image}
                  alt={selectedDestination.name}
                  className="h-64 w-full rounded-2xl object-cover"
                />
                <h1 className="font-display mt-6 text-2xl font-semibold text-slate-950">
                  Pesan tiket {selectedDestination.name}
                </h1>
                <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                  <Icon name="calendar" size={17} />
                  {selectedDate}
                  <button
                    onClick={() => setDateOpen(true)}
                    className="font-semibold text-ocean-600"
                  >
                    Ubah tanggal
                  </button>
                </p>
                <div className="mt-7">
                  <p className="field-label">Jenis tiket</p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      ["Reguler", "150K"],
                      ["VIP", "250K"],
                      ["Weekend", "200K"],
                    ].map(([type, price]) => (
                      <button
                        key={type}
                        onClick={() => setTicketType(type)}
                        className={`ticket-option ${
                          ticketType === type ? "ticket-option-active" : ""
                        }`}
                      >
                        <strong>{type}</strong>
                        <span>Rp {price}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-7 flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Jumlah tiket
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Maksimal 10 tiket
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="quantity-button"
                    >
                      −
                    </button>
                    <strong>{quantity}</strong>
                    <button
                      onClick={() => setQuantity(Math.min(10, quantity + 1))}
                      className="quantity-button quantity-button-active"
                    >
                      +
                    </button>
                  </div>
                </div>
              </article>
              <aside className="panel-card h-fit lg:sticky lg:top-28">
                <h2 className="panel-title">Ringkasan pemesanan</h2>
                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between text-slate-500">
                    <span>
                      {quantity} tiket {ticketType}
                    </span>
                    <span>
                      Rp {(basePrice * quantity).toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Biaya layanan</span>
                    <span>Rp 5.000</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-4 font-bold text-slate-900">
                    <span>Total</span>
                    <span className="text-ocean-600">
                      Rp {totalPrice.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
                <AppButton
                  onClick={() => {
                    setPage("Tiket Saya")
                    setNotice("Pembayaran demo berhasil. E-ticket sudah aktif.")
                  }}
                  variant="cta"
                  className="mt-6 w-full justify-center"
                >
                  Bayar dan terbitkan tiket
                  <Icon name="arrow" size={17} />
                </AppButton>
                <p className="mt-4 text-center text-[11px] leading-5 text-slate-400">
                  Pembayaran ini merupakan simulasi prototype.
                </p>
              </aside>
            </div>
          </section>
        )}
      </main>
      <button onClick={() => setPage("AI Guide")} className="ai-fab">
        <Icon name="ai" />
        <span className="hidden sm:block">Tanya AI Guide</span>
      </button>
      <nav className="consumer-mobile-nav md:hidden">
        {nav.map(([label, icon]) => (
          <button
            key={label}
            onClick={() => setPage(label)}
            className={page === label ? "text-ocean-600" : ""}
          >
            <Icon name={icon} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      {dateOpen && (
        <div className="modal-backdrop" onClick={() => setDateOpen(false)}>
          <section
            className="calendar-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="section-eyebrow">Tanggal kunjungan</p>
                <h2 className="font-display text-xl font-semibold text-slate-900">
                  Pilih tanggal perjalanan
                </h2>
              </div>
              <button
                onClick={() => setDateOpen(false)}
                className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-500"
              >
                Tutup
              </button>
            </div>
            <div className="mt-6 grid grid-cols-4 gap-3">
              {[
                "27 Feb 2026",
                "28 Feb 2026",
                "1 Mar 2026",
                "2 Mar 2026",
                "3 Mar 2026",
                "4 Mar 2026",
                "5 Mar 2026",
                "6 Mar 2026",
              ].map((date) => (
                <button
                  key={date}
                  onClick={() => {
                    setSelectedDate(date)
                    setDateOpen(false)
                  }}
                  className={`date-option ${
                    selectedDate === date ? "date-option-active" : ""
                  }`}
                >
                  <span>{date.split(" ")[0]}</span>
                  <strong>{date.split(" ")[1]}</strong>
                  <small>{date.split(" ")[2]}</small>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
      {notice && (
        <div className="toast-message">
          <Icon name="check" size={17} />
          <span>{notice}</span>
          <button onClick={() => setNotice("")}>Tutup</button>
        </div>
      )}
    </div>
  )
}

function PageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div>
      <p className="section-eyebrow">{eyebrow}</p>
      <h1 className="section-title">{title}</h1>
      <p className="section-description">{description}</p>
    </div>
  )
}

function DestinationCard({
  item,
  saved,
  onSave,
  onBook,
}: {
  item: Destination
  saved: boolean
  onSave: () => void
  onBook: () => void
}) {
  return (
    <article className="destination-card group">
      <div className="relative h-64 overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 to-transparent" />
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-bold text-slate-700 backdrop-blur">
          {item.tag}
        </span>
        <button
          onClick={onSave}
          className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full backdrop-blur ${
            saved ? "bg-sunset-500 text-white" : "bg-white/90 text-slate-600"
          }`}
          aria-label="Simpan destinasi"
        >
          <Icon name="star" className={saved ? "fill-white" : ""} />
        </button>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-semibold text-slate-900">
              {item.name}
            </h3>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
              <Icon name="location" size={14} />
              {item.location}
            </p>
          </div>
          <span className="flex items-center gap-1 text-sm font-semibold text-slate-700">
            <Icon
              name="star"
              size={15}
              className="fill-amber-400 text-amber-400"
            />
            {item.rating}
          </span>
        </div>
        <div className="mt-5 flex items-end justify-between border-t border-slate-100 pt-4">
          <div>
            <span className="text-[11px] text-slate-400">Mulai dari</span>
            <strong className="block text-base text-ocean-600">
              {item.price}
            </strong>
          </div>
          <AppButton onClick={onBook} variant="cta">
            Pesan tiket
          </AppButton>
        </div>
      </div>
    </article>
  )
}

export default function App() {
  const [role, setRole] = useState<Role | null>(null)
  if (!role) return <LoginPage onLogin={setRole} />
  if (role === "consumer")
    return <ConsumerDashboard onLogout={() => setRole(null)} />
  return <AdminDashboard role={role} onLogout={() => setRole(null)} />
}
