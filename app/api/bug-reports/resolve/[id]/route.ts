import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import BugReport from "@/models/BugReport";

export async function PUT(req: Request, { params }: any) {
    await dbConnect();
    try {
        const { resolutionMessage } = await req.json();
        
        // 🟢 FIX: Log incoming data for debugging
        console.log(`Attempting to resolve report ${params.id}. Message: ${resolutionMessage}`);

        const updated = await BugReport.findByIdAndUpdate(
            params.id,
            {
                // Explicitly use $set to ensure these fields are updated or created
                $set: { 
                    status: "Resolved",
                    resolutionMessage: resolutionMessage || "", 
                }
            },
            { 
                new: true,
                runValidators: true, // Ensure validation runs on the update
            }
        );

        if (!updated) {
            return NextResponse.json({ error: "Report not found" }, { status: 404 });
        }

        return NextResponse.json(updated, { status: 200 });

    } catch (err: any) { // Catch the error to see if it's a Validation Error
        console.error("Resolve API error:", err);
        // Check for common Mongoose errors
        if (err.name === 'ValidationError') {
            return NextResponse.json({ error: `Validation Error: ${err.message}` }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to resolve bug report." }, { status: 500 });
    }
}