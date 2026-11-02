'use client'

import React, { useEffect, useState } from 'react'
import { SessionUser } from '@/types/auth'
import { api, resetBookings } from '@/lib/booking-store'
import LoginPage from '@/components/auth/LoginPage'
import ConsumerApp from '@/components/consumer/ConsumerApp'
import AdminDashboard from '@/components/admin/AdminDashboard'
import SuperAdminDashboard from '@/components/superadmin/SuperAdminDashboard'

export default function SilaqHome() {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    api<{ user: SessionUser | null }>('/api/auth')
      .then((data) => setUser(data.user))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])
  const currentRole = user?.role

  const handleLogout = async () => {
    try {
      await api('/api/auth', { method: 'DELETE' })
      resetBookings()
      setUser(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal keluar. Coba lagi.')
    }
  }
  if (loading)
    return (
      <main className="min-h-screen grid place-items-center text-sm text-ocean-800">
        Memuat sesi SILAQ…
      </main>
    )

  // 1. If not logged in, show the Login Page with 3 role options
  if (!currentRole) {
    return (
      <LoginPage
        initialError={error}
        onLogin={(account) => {
          resetBookings()
          setUser(account)
          setError('')
        }}
      />
    )
  }

  // 2. Pure tourist experience if logged in as consumer
  if (currentRole === 'consumer') {
    return (
      <>
        <ConsumerApp user={user!} onLogout={handleLogout} />
        {error && (
          <p role="alert" className="toast-message">
            {error}
          </p>
        )}
      </>
    )
  }

  // 3. Dedicated Admin Mitra dashboard if logged in as admin
  if (currentRole === 'admin') {
    return (
      <>
        <AdminDashboard user={user!} onLogout={handleLogout} />
        {error && (
          <p role="alert" className="toast-message">
            {error}
          </p>
        )}
      </>
    )
  }

  // 4. Dedicated SuperAdmin dashboard if logged in as superadmin
  if (currentRole === 'superadmin') {
    return (
      <>
        <SuperAdminDashboard user={user!} onLogout={handleLogout} />
        {error && (
          <p role="alert" className="toast-message">
            {error}
          </p>
        )}
      </>
    )
  }

  return null
}
