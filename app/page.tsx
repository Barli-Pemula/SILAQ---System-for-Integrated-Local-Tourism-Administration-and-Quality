'use client'

import React, { useState } from 'react'
import { Role } from '@/types/smart-tourism'
import LoginPage from '@/components/auth/LoginPage'
import ConsumerApp from '@/components/consumer/ConsumerApp'
import AdminDashboard from '@/components/admin/AdminDashboard'
import SuperAdminDashboard from '@/components/superadmin/SuperAdminDashboard'

export default function SilaqHome() {
  // Role is chosen ONLY during login. Defaults to null (Login screen)
  const [currentRole, setCurrentRole] = useState<Role | null>(null)

  const handleLogout = () => {
    setCurrentRole(null)
  }

  // 1. If not logged in, show the Login Page with 3 role options
  if (!currentRole) {
    return <LoginPage onLogin={(role) => setCurrentRole(role)} />
  }

  // 2. Pure tourist experience if logged in as consumer
  if (currentRole === 'consumer') {
    return <ConsumerApp onLogout={handleLogout} />
  }

  // 3. Dedicated Admin Mitra dashboard if logged in as admin
  if (currentRole === 'admin') {
    return <AdminDashboard onLogout={handleLogout} />
  }

  // 4. Dedicated SuperAdmin dashboard if logged in as superadmin
  if (currentRole === 'superadmin') {
    return <SuperAdminDashboard onLogout={handleLogout} />
  }

  return null
}
