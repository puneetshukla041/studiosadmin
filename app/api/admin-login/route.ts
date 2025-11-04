// /api/admin-login/route.ts

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const allowedUsers: Record<string, string> = {
  puneet: "puneet@ssi",
  ravinder: "ravinder@ssi",
  varsha: "varsha@ssi",
  shrijal: "shrijal@ssi",
  yash: "yash@ssi",
naveen:"naveen@ssi",
  tanmay: "tanmay@ssi",
};

export async function POST(req: Request) {
  const { username, password } = await req.json();

  if (allowedUsers[username] && allowedUsers[username] === password) {
    // 1. Create a JWT payload
    const payload = { username: username, role: 'admin' };

    // 2. Sign the token with your secret key
    const token = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: '1h', // Token will expire in 1 hour
    });

    // 3. Set the JWT in a cookie named 'token'
    const cookieValue = `token=${token}; Path=/; HttpOnly; Max-Age=3600; SameSite=Strict${
      process.env.NODE_ENV === 'production' ? '; Secure' : ''
    }`;

    return NextResponse.json({ success: true }, {
      status: 200,
      headers: {
        'Set-Cookie': cookieValue,
      },
    });
  }

  return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
}
