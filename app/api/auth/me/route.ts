// /api/auth/me/route.ts
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get('cookie') || '';
    const tokenCookie = cookieHeader
      .split(';')
      .find(cookie => cookie.trim().startsWith('token='));

    if (!tokenCookie) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const token = tokenCookie.split('=')[1];
    jwt.verify(token, process.env.JWT_SECRET!);

    return NextResponse.json({ authenticated: true });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
