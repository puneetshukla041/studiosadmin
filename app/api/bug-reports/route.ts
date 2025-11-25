// app/api/bug-reports/route.ts (for App Router)
import dbConnect from '@/lib/dbConnect'; // Adjust path as necessary
import BugReport from '@/models/BugReport'; // Adjust path as necessary
import { NextResponse } from 'next/server';

// Ensure this runs on the Node.js runtime environment for Mongoose
export const runtime = 'nodejs'; 

export async function GET() {
    try {
        await dbConnect();

        // 1. Fetch all bug reports, sorting by creation date (newest first)
        const reports = await BugReport.find({})
            .sort({ createdAt: -1 })
            .lean(); // .lean() returns plain JavaScript objects, improving performance.
        
        // 2. Mongoose documents need to be serialized to plain JSON objects 
        //    before being sent via a Next.js API route/NextResponse.
        //    JSON.stringify/parse handles the conversion of Mongoose's Date objects.
        const serializedReports = JSON.parse(JSON.stringify(reports));

        return NextResponse.json(serializedReports, { status: 200 });

    } catch (error) {
        console.error("Bug report API error:", error);
        return NextResponse.json(
            { error: "Failed to fetch bug reports from the database." },
            { status: 500 }
        );
    }
}