// api/logout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ success: true }, {
    status: 200,
    headers: {
      // Set the cookie to expire immediately (Max-Age=0) to clear it
      "Set-Cookie": `admin-auth=; Path=/; HttpOnly; Max-Age=0; SameSite=Strict${
        process.env.NODE_ENV === "production" ? "; Secure" : ""
      }`
    },
  });
}