import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { updateOrderStatus, toAdminOrder } from '@/services/letters'
import { ADMIN_COOKIE_NAME, verifySessionToken } from '@/lib/adminAuth'
import { serverErrorResponse } from '@/lib/errors'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function requireAdmin() {
  const store = await cookies()
  const token = store.get(ADMIN_COOKIE_NAME)?.value
  return !!verifySessionToken(token)
}

export async function PATCH(req, { params }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
  }

  const { id } = await params
  if (!id) return NextResponse.json({ error: 'ID ausente.' }, { status: 400 })

  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 })
  }

  try {
    const updated = await updateOrderStatus(id, {
      shippingStatus: body?.shippingStatus,
      paymentStatus: body?.paymentStatus,
    })
    if (!updated) {
      return NextResponse.json({ error: 'Nada para atualizar.' }, { status: 400 })
    }
    return NextResponse.json({ ok: true, order: toAdminOrder(updated) })
  } catch (err) {
    if (err?.message?.startsWith('Invalid')) {
      return NextResponse.json({ error: err.message }, { status: 422 })
    }
    return serverErrorResponse(
      'PATCH /api/admin/orders/:id',
      err,
      'Falha ao atualizar pedido.'
    )
  }
}
