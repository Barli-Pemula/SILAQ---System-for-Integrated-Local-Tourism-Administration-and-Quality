'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { BookingDraft, TravelBooking } from '@/types/marketplace'
export {
  bookingQuote,
  defaultDraft,
  nightsBetween,
  validateBooking,
} from './booking-rules'

interface BookingState {
  bookings: TravelBooking[]
  loading: boolean
  error: string
}
const EMPTY: BookingState = { bookings: [], loading: true, error: '' }
let state = EMPTY
let request: Promise<void> | undefined
let generation = 0
const listeners = new Set<() => void>()
const notify = () => listeners.forEach((fn) => fn())
const subscribe = (fn: () => void) => {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}
const snapshot = () => state
const serverSnapshot = () => EMPTY

export async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    credentials: 'same-origin',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  })
  const data = await response.json()
  if (!response.ok)
    throw new Error(data.error || 'Layanan belum tersedia. Silakan coba lagi.')
  return data as T
}

export function resetBookings() {
  generation++
  request = undefined
  state = { bookings: [], loading: true, error: '' }
  notify()
}

export async function refreshBookings() {
  if (request) return request
  const current = generation
  request = (async () => {
    try {
      const data = await api<{ bookings: TravelBooking[] }>('/api/bookings')
      if (current === generation)
        state = { bookings: data.bookings, loading: false, error: '' }
    } catch (error) {
      if (current === generation)
        state = {
          ...state,
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : 'Pesanan belum dapat dimuat.',
        }
    } finally {
      if (current === generation) {
        request = undefined
        notify()
      }
    }
  })()
  return request
}

export function useBookingState() {
  const result = useSyncExternalStore(subscribe, snapshot, serverSnapshot)
  useEffect(() => {
    void refreshBookings()
    const refresh = () => {
      if (document.visibilityState === 'visible') void refreshBookings()
    }
    window.addEventListener('focus', refresh)
    const timer = window.setInterval(refresh, 15000)
    return () => {
      window.removeEventListener('focus', refresh)
      clearInterval(timer)
    }
  }, [])
  return result
}
export function useBookings() {
  return useBookingState().bookings
}

function remember(order: TravelBooking, expectedGeneration: number) {
  if (expectedGeneration !== generation) return order
  state = {
    bookings: [order, ...state.bookings.filter((b) => b.id !== order.id)],
    loading: false,
    error: '',
  }
  notify()
  return order
}

export async function createServerBooking(draft: BookingDraft, key: string) {
  const current = generation
  const data = await api<{ booking: TravelBooking }>('/api/bookings', {
    method: 'POST',
    headers: { 'Idempotency-Key': key },
    body: JSON.stringify({ draft }),
  })
  return remember(data.booking, current)
}

export async function bookingAction(
  id: string,
  action: 'demo-payment' | 'refresh-payment',
  success?: boolean
) {
  const current = generation
  const data = await api<{ booking: TravelBooking }>(
    `/api/bookings/${encodeURIComponent(id)}`,
    { method: 'POST', body: JSON.stringify({ action, success }) }
  )
  return remember(data.booking, current)
}

export async function checkInVoucher(id: string, code: string) {
  const data = await api<{ message: string }>(
    `/api/bookings/${encodeURIComponent(id)}`,
    { method: 'POST', body: JSON.stringify({ action: 'checkin', code }) }
  )
  await refreshBookings()
  return data.message
}

export function usePaymentConfig() {
  const [config, setConfig] = useState<{
    paymentMode: 'demo' | 'sandbox' | 'production'
    catalogApproved: boolean
    paymentReady: boolean
  } | null>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    api<NonNullable<typeof config>>('/api/config')
      .then((data) => {
        if (active) setConfig(data)
      })
      .catch((e) => {
        if (active) setError(e.message)
      })
    return () => {
      active = false
    }
  }, [])
  return { config, error }
}
