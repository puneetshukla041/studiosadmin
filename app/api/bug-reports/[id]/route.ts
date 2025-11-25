// D:\studiosadmin\studiosadmin\app\api\bug-reports\[id]\route.ts

import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import BugReport from "@/models/BugReport";

// --------------------------------------
// UPDATE report by ID
// --------------------------------------
export async function PUT(request: Request, context: any) {
    try {
        const { id } = context.params;
        const data = await request.json();

        await dbConnect();

        const updated = await BugReport.findByIdAndUpdate(id, data, { new: true });

        if (!updated) {
            return NextResponse.json(
                { message: "Bug report not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(updated, { status: 200 });
    } catch (err) {
        console.error("PUT BugReport Error:", err);
        return NextResponse.json(
            { error: "Failed to update bug report" },
            { status: 500 }
        );
    }
}