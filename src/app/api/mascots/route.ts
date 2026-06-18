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

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    if (!body.id || !body.name) {
      return NextResponse.json({ success: false, error: "Missing required fields (id, name)" }, { status: 400 });
    }

    const existing = await Mascot.findOne({ id: body.id });
    if (existing) {
      return NextResponse.json({ success: false, error: "Mascot ID already exists" }, { status: 400 });
    }

    // Default configuration for a new Mascot
    const newMascot = new Mascot({
      id: body.id,
      name: body.name,
      description: body.description || "",
      avatarUrl: body.avatarUrl || "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
      images: body.images || {
        idle: body.avatarUrl || "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
      },
      dialogue: body.dialogue || {
        speaking: "Đang nói...",
        listening: "Đang nghe...",
        thinking: "Đang suy nghĩ...",
      },
      themeColors: body.themeColors || {
        ring: "border-slate-300 dark:border-slate-700",
        bg: "bg-slate-50 dark:bg-slate-800",
        text: "text-slate-600 dark:text-slate-300",
        border: "border-slate-200 dark:border-slate-700",
      }
    });

    await newMascot.save();
    return NextResponse.json({ success: true, data: newMascot });
  } catch (error: any) {
    console.error("Error creating mascot:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing mascot ID" }, { status: 400 });
    }

    await connectToDatabase();
    const deletedMascot = await Mascot.findOneAndDelete({ id });

    if (!deletedMascot) {
      return NextResponse.json({ success: false, error: "Mascot not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: deletedMascot });
  } catch (error: any) {
    console.error("Error deleting mascot:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
