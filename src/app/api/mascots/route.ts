import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Mascot from "@/models/Mascot";
import { MASCOTS as fallbackMascots } from "@/config/mascots";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    let mascots = await Mascot.find({}).sort({ createdAt: 1 });

    // If database is empty, return fallbacks
    if (mascots.length === 0) {
      console.log("No mascots found in DB, returning fallback configs.");
      return NextResponse.json({ success: true, data: fallbackMascots });
    }

    // Map _id to id if necessary, though our schema defines 'id' as String
    return NextResponse.json({ success: true, data: mascots });
  } catch (error: any) {
    console.error("Error fetching mascots:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing mascot ID" }, { status: 400 });
    }

    const updatedMascot = await Mascot.findOneAndUpdate(
      { id },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedMascot) {
      return NextResponse.json({ success: false, error: "Mascot not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedMascot });
  } catch (error: any) {
    console.error("Error updating mascot:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
