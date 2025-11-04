import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Member, IMember } from "@/models/Employee";
import dbConnect from "@/lib/dbConnect";

export async function PUT(req: NextRequest, context: any) {
  await dbConnect();
  const { id } = context.params;

  const { field, value } = await req.json();

  // Validate the field
  const validFields = [
    "posterEditor",
    "certificateEditor",
    "visitingCard",
    "idCard",
    "bgRemover",
    "imageEnhancer",
    "assets",
  ] as const;

  if (!validFields.includes(field)) {
    return NextResponse.json(
      { message: "Invalid access field." },
      { status: 400 }
    );
  }

  try {
    const update = { [`access.${field}`]: value };
    const updatedMember: IMember | null = await Member.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true }
    );

    if (!updatedMember) {
      return NextResponse.json(
        { message: "Member not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, user: updatedMember, message: "Access updated successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating member access:", error);
    return NextResponse.json(
      { message: "Failed to update access." },
      { status: 500 }
    );
  }
}
