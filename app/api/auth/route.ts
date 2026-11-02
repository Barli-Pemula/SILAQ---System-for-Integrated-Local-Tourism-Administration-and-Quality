import {
  authenticate,
  createUser,
  endSession,
  rateLimit,
  sessionUser,
  startSession,
} from '@/lib/server/auth'
import { body, failure, HttpError, json, sameOrigin } from '@/lib/server/http'

export const runtime = 'nodejs'
export async function GET() {
  try {
    return json({ user: await sessionUser() })
  } catch (error) {
    return failure(error)
  }
}

export async function POST(request: Request) {
  try {
    sameOrigin(request)
    const data = await body(request)
    if (
      typeof data.email !== 'string' ||
      typeof data.password !== 'string' ||
      data.email.length > 150 ||
      data.password.length > 128
    )
      throw new HttpError(400, 'Email atau kata sandi tidak valid.')
    // No client-supplied role is accepted. Registration always creates a consumer.
    let user
    if (data.action === 'register') {
      await rateLimit(
        `register:${request.headers.get('x-forwarded-for') || 'local'}`,
        20,
        60
      )
      if (typeof data.name !== 'string')
        throw new HttpError(400, 'Nama wajib diisi.')
      user = await createUser(data.name, data.email, data.password)
    } else if (data.action === 'login')
      user = await authenticate(data.email, data.password)
    else throw new HttpError(400, 'Aksi tidak dikenal.')
    await startSession(user.id)
    return json({ user })
  } catch (error) {
    return failure(error)
  }
}

export async function DELETE(request: Request) {
  try {
    sameOrigin(request)
    await endSession()
    return json({ ok: true })
  } catch (error) {
    return failure(error)
  }
}
