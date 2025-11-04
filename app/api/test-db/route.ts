import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const collections = await db.listCollections().toArray();
    return NextResponse.json({ status: "Connected", collections });
  } catch (error: any) {
    return NextResponse.json(
      { status: "Error", error: error.message },
      { status: 500 }
    );
  }
}