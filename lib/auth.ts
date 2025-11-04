// lib/auth.ts
'use client';

export async function isAuthenticated(): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/me', { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}

export function redirectToLogin(): void {
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

export async function checkAuthAndRedirect() {
  const authed = await isAuthenticated();
  if (!authed) redirectToLogin();
}
