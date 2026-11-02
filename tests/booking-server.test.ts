import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash, randomUUID } from 'node:crypto'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

test('booking service uses transactions, ownership and verified payments', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'silaq-server-test-'))
  process.env.LOCAL_DATABASE = 'true'
  process.env.LOCAL_DATABASE_PATH = directory
  process.env.PAYMENT_MODE = 'demo'
  process.env.ALLOW_DEMO_PAYMENTS = 'true'
  process.env.APP_URL = 'http://127.0.0.1:3100'
  delete process.env.VERCEL
  const db = await import('../lib/server/db')
  const auth = await import('../lib/server/auth')
  const service = await import('../lib/server/bookings')
  const payment = await import('../lib/server/payments')
  const { demoLoginTemplate } = await import('../lib/server/demo-login')
  const rules = await import('../lib/booking-rules')
  const { MARKET_PRODUCTS, todayISO, addDays } =
    await import('../lib/marketplace-data')
  const draftFor = (id: string, date = todayISO()) => ({
    ...rules.defaultDraft(
      MARKET_PRODUCTS.find((p) => p.id === id)!,
      date
    ),
    customerName: 'Pengujian SILAQ',
    email: 'qa@example.test',
    phone: '081234567890',
  })
  const password = `Test-${randomUUID()}`
  try {
    await t.test(
      'autofill credentials are available only in explicitly enabled demo mode',
      () => {
        const enabled = process.env.DEMO_LOGIN_ENABLED
        const password = process.env.DEMO_LOGIN_PASSWORD
        try {
          process.env.DEMO_LOGIN_ENABLED = 'true'
          process.env.DEMO_LOGIN_PASSWORD = 'Example-demo-password-123'
          assert.equal(demoLoginTemplate('production'), null)
          assert.equal(demoLoginTemplate('sandbox'), null)
          assert.equal(demoLoginTemplate('demo')?.name, 'Gilang Khaerul Afan')
          assert.equal(
            demoLoginTemplate('demo')?.emails.admin,
            'gilang.admin@silaq.local'
          )
          process.env.DEMO_LOGIN_ENABLED = 'false'
          assert.equal(demoLoginTemplate('demo'), null)
        } finally {
          if (enabled === undefined) delete process.env.DEMO_LOGIN_ENABLED
          else process.env.DEMO_LOGIN_ENABLED = enabled
          if (password === undefined) delete process.env.DEMO_LOGIN_PASSWORD
          else process.env.DEMO_LOGIN_PASSWORD = password
        }
      }
    )
    const buyer = await auth.createUser(
      'Wisatawan Satu',
      'buyer@example.test',
      password
    )
    const other = await auth.createUser(
      'Wisatawan Dua',
      'other@example.test',
      password
    )
    const superadmin = await auth.createUser(
      'Pengelola Test',
      'admin@example.test',
      password,
      'superadmin'
    )
    const partner = await auth.createUser(
      'Mitra Gili',
      'partner@example.test',
      password,
      'admin',
      ['dest-gili']
    )
    const wrongPartner = await auth.createUser(
      'Mitra Hotel',
      'hotel@example.test',
      password,
      'admin',
      ['hotel-kuta']
    )
    let paidOrder: Awaited<ReturnType<typeof service.createBooking>>

    await t.test(
      'passwords are hashed and registration cannot infer an elevated role',
      async () => {
        const stored = (
          await db.query<{ password_hash: string }>(
            'SELECT password_hash FROM silaq_users WHERE id=$1',
            [buyer.id]
          )
        ).rows[0]
        assert.notEqual(stored.password_hash, password)
        assert.equal(
          (await auth.authenticate(buyer.email, password)).role,
          'consumer'
        )
        await assert.rejects(
          () => auth.authenticate(buyer.email, 'wrong-password'),
          /Email atau kata sandi/
        )
      }
    )

    await t.test(
      'price is computed on the server, and pending orders expose no tickets or itinerary',
      async () => {
        const draft = rules.parseDraft({
          ...draftFor('bundle-selatan'),
          quantity: 2,
          total: 1,
          status: 'paid',
          vouchers: ['forged'],
        })
        paidOrder = await service.createBooking(buyer, draft, randomUUID())
        const visible = service.visibleBooking(paidOrder, buyer)
        assert.equal(visible.total, 185000)
        assert.equal(visible.status, 'pending')
        assert.deepEqual(visible.vouchers, [])
        assert.deepEqual(visible.itinerary, [])
        assert.equal('voucherPlan' in visible, false)
        assert.equal('itineraryPlan' in visible, false)
        await assert.rejects(
          () => service.getBooking(paidOrder.id, other),
          /Pesanan tidak ditemukan/
        )
      }
    )

    await t.test(
      'idempotent retries do not consume quota twice and changed requests are rejected',
      async () => {
        const key = randomUUID()
        const draft = draftFor('boat-gili', addDays(todayISO(), 1))
        const [first, second] = await Promise.all([
          service.createBooking(buyer, draft, key),
          service.createBooking(buyer, draft, key),
        ])
        assert.equal(first.id, second.id)
        await assert.rejects(
          () => service.createBooking(buyer, { ...draft, quantity: 2 }, key),
          /detail berbeda/
        )
        const reserved = await db.query<{ reserved: number }>(
          'SELECT reserved FROM silaq_inventory WHERE key=$1',
          [`boat-gili:${draft.date}:${draft.departure}`]
        )
        assert.equal(reserved.rows[0].reserved, 1)
      }
    )

    await t.test(
      'concurrent reservations cannot oversell a bundle, and rollback leaves no partial booking',
      async () => {
        const draft = {
          ...draftFor('bundle-utara', addDays(todayISO(), 3)),
          quantity: 7,
        }
        const results = await Promise.allSettled([
          service.createBooking(buyer, draft, randomUUID()),
          service.createBooking(other, draft, randomUUID()),
        ])
        assert.equal(results.filter((r) => r.status === 'fulfilled').length, 1)
        assert.equal(results.filter((r) => r.status === 'rejected').length, 1)
        const seats = (
          await db.query<{ reserved: number }>(
            'SELECT reserved FROM silaq_inventory WHERE key=$1',
            [`bundle-utara:${draft.date}:`]
          )
        ).rows[0]
        assert.equal(seats.reserved, 7)
        const count = await db.query<{ total: string }>(
          "SELECT count(*)::text as total FROM silaq_bookings WHERE data->'draft'->>'date'=$1",
          [draft.date]
        )
        assert.equal(count.rows[0].total, '1')
      }
    )

    await t.test(
      'wrong amounts cannot issue tickets, and repeated settlement preserves voucher IDs',
      async () => {
        await assert.rejects(
          () => service.updatePayment(paidOrder.id, 1, 'settlement', 'demo'),
          /Nominal/
        )
        const paid = await service.demoPayment(buyer, paidOrder.id, true)
        const again = await service.demoPayment(buyer, paidOrder.id, true)
        assert.equal(paid.status, 'paid')
        assert.equal(paid.data.vouchers.length, 3)
        assert.equal(paid.data.itinerary.length, 5)
        assert.deepEqual(
          paid.data.vouchers.map((v) => v.id),
          again.data.vouchers.map((v) => v.id)
        )
        assert.equal(
          paid.data.itinerary.find((s) => s.type === 'hotel')!.included,
          false
        )
      }
    )

    await t.test('failed payment releases capacity exactly once', async () => {
      const draft = draftFor('hotel-kuta', addDays(todayISO(), 7))
      const order = await service.createBooking(buyer, draft, randomUUID())
      await service.demoPayment(buyer, order.id, false)
      await service.demoPayment(buyer, order.id, false)
      const seats = (
        await db.query<{ reserved: number }>(
          'SELECT reserved FROM silaq_inventory WHERE key=$1',
          [`hotel-kuta:${draft.date}:`]
        )
      ).rows[0]
      assert.equal(seats.reserved, 0)
      assert.equal(
        (await service.getBooking(order.id, buyer)).status,
        'cancelled'
      )
    })

    await t.test(
      'expired holds are released and late settlement requires review without tickets',
      async () => {
        const order = await service.createBooking(
          buyer,
          draftFor('hotel-senaru', addDays(todayISO(), 5)),
          randomUUID()
        )
        await db.query('UPDATE silaq_bookings SET expires_at=$2 WHERE id=$1', [
          order.id,
          Date.now() - 1000,
        ])
        await service.expireBookings()
        assert.equal(
          (await service.getBooking(order.id, buyer)).status,
          'expired'
        )
        const late = await service.updatePayment(
          order.id,
          order.data.total,
          'settlement',
          'demo'
        )
        assert.equal(late.status, 'payment_review')
        assert.deepEqual(late.data.vouchers, [])
        const seats = (
          await db.query<{ reserved: number }>(
            'SELECT reserved FROM silaq_inventory WHERE key=$1',
            [`hotel-senaru:${order.data.draft.date}:`]
          )
        ).rows[0]
        assert.equal(seats.reserved, 0)
      }
    )

    await t.test(
      'check-in is scoped to partner, date and a single use',
      async () => {
        const order = await service.createBooking(
          buyer,
          draftFor('dest-gili'),
          randomUUID()
        )
        const paid = await service.demoPayment(buyer, order.id, true)
        const code = paid.data.vouchers[0].id
        await assert.rejects(
          () => service.checkIn(buyer, order.id, code),
          /Hanya petugas/
        )
        await assert.rejects(
          () => service.checkIn(wrongPartner, order.id, code),
          /wewenang/
        )
        assert.match(
          await service.checkIn(partner, order.id, code),
          /Check-in berhasil/
        )
        await assert.rejects(
          () => service.checkIn(superadmin, order.id, code),
          /sudah digunakan/
        )
        const visible = service.visibleBooking(
          await service.getBooking(order.id, partner),
          partner
        )
        assert.deepEqual(visible.itinerary, [])
        assert.equal(visible.vouchers.length, 1)
      }
    )

    await t.test(
      'missing gateway configuration cannot hold inventory',
      async () => {
        process.env.PAYMENT_MODE = 'sandbox'
        delete process.env.MIDTRANS_SERVER_KEY
        const before = (
          await db.query<{ total: string }>(
            'SELECT count(*)::text as total FROM silaq_bookings'
          )
        ).rows[0].total
        await assert.rejects(
          () =>
            service.createBooking(buyer, draftFor('dest-gili'), randomUUID()),
          /belum dikonfigurasi/
        )
        const after = (
          await db.query<{ total: string }>(
            'SELECT count(*)::text as total FROM silaq_bookings'
          )
        ).rows[0].total
        assert.equal(before, after)
        process.env.PAYMENT_MODE = 'demo'
      }
    )

    await t.test(
      'sandbox rejects demo endpoints, authenticates webhooks and fetches authoritative status',
      async () => {
        process.env.PAYMENT_MODE = 'sandbox'
        process.env.MIDTRANS_SERVER_KEY =
          'test-server-key-not-a-real-credential'
        const order = await service.createBooking(
          buyer,
          draftFor('boat-lembar', addDays(todayISO(), 9)),
          randomUUID()
        )
        await assert.rejects(
          () => service.demoPayment(buyer, order.id, true),
          /dinonaktifkan/
        )
        await assert.rejects(
          () =>
            payment.paymentNotification({
              order_id: order.id,
              signature_key: 'forged',
            }),
          /Tanda tangan/
        )
        const originalFetch = globalThis.fetch
        globalThis.fetch = async () =>
          Response.json({
            order_id: order.id,
            transaction_status: 'settlement',
            gross_amount: String(order.data.total),
            currency: 'IDR',
          })
        try {
          const payload = {
            order_id: order.id,
            status_code: '200',
            gross_amount: `${order.data.total}.00`,
            signature_key: '',
          }
          payload.signature_key = createHash('sha512')
            .update(
              `${payload.order_id}${payload.status_code}${payload.gross_amount}${process.env.MIDTRANS_SERVER_KEY}`
            )
            .digest('hex')
          assert(
            payment.verifyNotification(payload, process.env.MIDTRANS_SERVER_KEY)
          )
          const settled = await payment.paymentNotification(payload)
          assert.equal(settled?.status, 'paid')
        } finally {
          globalThis.fetch = originalFetch
          process.env.PAYMENT_MODE = 'demo'
        }
      }
    )

    await t.test(
      'gateway initialization is idempotent and uses a server-priced order',
      async () => {
        process.env.PAYMENT_MODE = 'sandbox'
        process.env.APP_URL = 'http://127.0.0.1:3100'
        const pending = await service.createBooking(
          buyer,
          draftFor('boat-padangbai', addDays(todayISO(), 12)),
          randomUUID()
        )
        const originalFetch = globalThis.fetch
        let requests = 0
        globalThis.fetch = async (input, init) => {
          requests++
          assert.equal(
            String(input),
            'https://app.sandbox.midtrans.com/snap/v1/transactions'
          )
          const request = JSON.parse(String(init?.body))
          assert.equal(
            request.transaction_details.gross_amount,
            pending.data.total
          )
          assert.equal(request.transaction_details.order_id, pending.id)
          assert.deepEqual(request.enabled_payments, ['other_qris'])
          assert.match(
            request.callbacks.finish,
            /^http:\/\/127.0.0.1:3100\/\?order=/
          )
          return Response.json({
            redirect_url:
              'https://app.sandbox.midtrans.com/snap/v2/vtweb/test-token',
          })
        }
        try {
          await Promise.all([
            payment.initializePayment(service.visibleBooking(pending, buyer)),
            payment.initializePayment(service.visibleBooking(pending, buyer)),
          ])
          assert.equal(requests, 1)
          const updated = await service.getBooking(pending.id, buyer)
          assert.equal(updated.status, 'pending')
          assert.equal(updated.data.vouchers.length, 0)
          assert.match(
            updated.data.paymentUrl!,
            /^https:\/\/app.sandbox.midtrans.com\//
          )
        } finally {
          globalThis.fetch = originalFetch
          process.env.PAYMENT_MODE = 'demo'
        }
      }
    )

    await t.test(
      'production refuses sample inventory and invalid calendar dates are rejected',
      async () => {
        process.env.PAYMENT_MODE = 'production'
        process.env.CATALOG_APPROVED = 'false'
        await assert.rejects(
          () =>
            service.createBooking(buyer, draftFor('dest-sade'), randomUUID()),
          /Inventori/
        )
        process.env.PAYMENT_MODE = 'demo'
        assert.equal(rules.validDate('2027-02-30'), false)
        assert.match(
          rules.validateBooking(
            MARKET_PRODUCTS.find((p) => p.id === 'hotel-kuta')!,
            { ...draftFor('hotel-kuta'), endDate: todayISO() }
          )!,
          /check-out/
        )
      }
    )
  } finally {
    await db.closeDatabase()
    // Only remove the temporary directory created at the beginning of this test.
    assert(directory.startsWith(join(tmpdir(), 'silaq-server-test-')))
    await rm(directory, { recursive: true, force: true })
  }
})
