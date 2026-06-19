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
