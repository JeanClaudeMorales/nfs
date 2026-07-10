import { NextResponse } from 'next/server';
import { getAll, add, remove } from '@/lib/contributions-store';

export const dynamic = 'force-dynamic';

// Basic write protection. Set ADMIN_KEY in the environment for production.
const KEY = process.env.ADMIN_KEY || 'nextfrontier-2026';
const authed = (req) => req.headers.get('x-admin-key') === KEY;

export async function GET() {
  return NextResponse.json(await getAll());
}

export async function POST(req) {
  if (!authed(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }); }
  if (!body?.title) return NextResponse.json({ error: 'title required' }, { status: 400 });
  const entry = await add(body);
  return NextResponse.json(entry, { status: 201 });
}

export async function DELETE(req) {
  if (!authed(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const ok = await remove(id);
  return NextResponse.json({ ok });
}
