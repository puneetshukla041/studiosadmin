import { NextResponse } from "next/server";
import { Member, IMember } from "@/models/Employee";
import dbConnect from "@/lib/dbConnect";

// GET (Fetch all members)
export async function GET() {
  await dbConnect();

  try {
    const members: IMember[] = await Member.find({});

    const safeMembers = members.map((m) => ({
      _id: m._id!.toString(),
      username: m.username,
      password: m.password,
      access: m.access,
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
    }));

    return NextResponse.json(safeMembers, { status: 200 });
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json(
      { message: "Failed to fetch members." },
      { status: 500 }
    );
  }
}

// POST (Add new member)
export async function POST(req: Request) {
  await dbConnect();

  try {
    const { username, password, access } = await req.json();

    const existingMember = await Member.findOne({ username });
    if (existingMember) {
      return NextResponse.json(
        { error: "Username already exists." },
        { status: 409 }
      );
    }

    const newMember: IMember = await Member.create({
      username,
      password,
      access: access || {
        posterEditor: false,
        certificateEditor: false,
        visitingCard: false,
        idCard: false,
        bgRemover: false,
        imageEnhancer: false,
        assets: false,
      },
    });

    return NextResponse.json(
      {
        _id: newMember._id!.toString(),
        username: newMember.username,
        password: newMember.password,
        access: newMember.access,
        createdAt: newMember.createdAt.toISOString(),
        updatedAt: newMember.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error adding member:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Username already exists." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { message: error.message || "Failed to add member." },
      { status: 500 }
    );
  }
}
