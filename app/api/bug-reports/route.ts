// D:\studiosadmin\studiosadmin\app\api\bug-reports\route.ts

import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import BugReport from "@/models/BugReport";

export async function GET() {
    await dbConnect();
    try {
        // Fetches reports, including the resolutionMessage field
        const reports = await BugReport.find().lean(); 
        return NextResponse.json(reports, { status: 200 });
    } catch (err) {
        console.error("Bug Reports GET error:", err);
        return NextResponse.json({ error: "Failed to fetch bug reports." }, { status: 500 });
    }
}

export async function POST(req: Request) {
    await dbConnect();
    try {
        const body = await req.json();
        const newReport = await BugReport.create(body);
        return NextResponse.json(newReport, { status: 201 });
    } catch (err) {
        console.error("Bug Report POST error:", err);
        return NextResponse.json({ error: "Failed to create bug report." }, { status: 500 });
    }
}