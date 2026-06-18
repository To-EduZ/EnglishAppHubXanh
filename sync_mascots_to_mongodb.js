const mongoose = require("mongoose");
const { v2: cloudinary } = require("cloudinary");
const fs = require("fs");
const path = require("path");

function loadEnv() {
  const envPath = path.join(__dirname, ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    const lines = envContent.split(/\r?\n/);
    lines.forEach(line => {
      const match = line.match(/^\s*([\w.\-_]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || "";
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value.trim();
      }
    });
    console.log("📝 Loaded environments from .env.local");
  }
}

loadEnv();

const MONGODB_URI = process.env.MONGODB_URI;
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is not defined in .env.local!");
  process.exit(1);
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

// Import or define Mascot Schema
const MascotSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    avatarUrl: { type: String, required: true },
    images: {
      idle: { type: String, default: "" },
      speaking: { type: String, default: "" },
      listening: { type: String, default: "" },
      thinking: { type: String, default: "" },
      happy: { type: String, default: "" },
      encouraging: { type: String, default: "" },
    },
    dialogue: {
      speaking: { type: String, default: "Đang nói..." },
      listening: { type: String, default: "Đang nghe..." },
      thinking: { type: String, default: "Đang suy nghĩ..." },
    },
    themeColors: {
      ring: { type: String, default: "border-blue-300 dark:border-blue-700" },
      bg: { type: String, default: "bg-sky-50 dark:bg-slate-800" },
      text: { type: String, default: "text-indigo-500 dark:text-indigo-400" },
      border: { type: String, default: "border-slate-100 dark:border-slate-800" },
    },
  },
  { timestamps: true }
);

const Mascot = mongoose.models.Mascot || mongoose.model("Mascot", MascotSchema);

const DEFAULT_MASCOTS = {
  lily: {
    name: "Cô Lily AI",
    description: "Cô giáo ảo thân thiện, luôn sẵn sàng hướng dẫn bạn học tiếng Anh.",
    themeColors: {
      ring: "border-blue-300 dark:border-blue-700",
      bg: "bg-sky-50 dark:bg-slate-800",
      text: "text-indigo-500 dark:text-indigo-400",
      border: "border-slate-100 dark:border-slate-800"
    },
    dialogue: {
      speaking: "Cô Lily đang nói... 🔊",
      listening: "Cô đang nghe con nè... 🎤",
      thinking: "Cô đang suy nghĩ... 🧠",
    }
  },
  max: {
    name: "Khỉ Max",
    description: "Chú khỉ tinh nghịch, học tiếng Anh cùng Max chưa bao giờ nhàm chán!",
    themeColors: {
      ring: "border-amber-300 dark:border-amber-700",
      bg: "bg-yellow-50 dark:bg-slate-800",
      text: "text-amber-600 dark:text-amber-400",
      border: "border-amber-100 dark:border-amber-900/50"
    },
    dialogue: {
      speaking: "Max đang nói nè... 🔊",
      listening: "Max đang vểnh tai nghe... 🐒🎤",
      thinking: "Max đang vắt óc suy nghĩ... 🤔",
    }
  }
};

async function syncMascots() {
  try {
    console.log("☁️  Fetching mascot assets from Cloudinary directory 'mascots/'...");
    const resourcesResult = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'mascots/',
      max_results: 100
    });

    console.log(`✅ Found ${resourcesResult.resources.length} resources in Cloudinary under 'mascots/'.`);
    
    // Group images by mascot ID
    // Expected public_id format: mascots/[id]/[state] e.g. mascots/lily/idle
    const mascotsMap = {};

    resourcesResult.resources.forEach(res => {
      const parts = res.public_id.split("/");
      if (parts.length >= 3) {
        const id = parts[1]; // e.g. 'lily'
        const state = parts[2]; // e.g. 'idle'
        
        if (!mascotsMap[id]) {
          mascotsMap[id] = { id, images: {}, avatarUrl: "" };
        }
        
        mascotsMap[id].images[state] = res.secure_url;
        
        // Use idle as default avatar if available, otherwise just use the first image found
        if (state === "idle" || !mascotsMap[id].avatarUrl) {
          mascotsMap[id].avatarUrl = res.secure_url;
        }
      }
    });

    const mascotIds = Object.keys(mascotsMap);
    console.log(`📌 Grouped images into ${mascotIds.length} mascots: ${mascotIds.join(", ")}`);

    console.log("🔌 Connecting to MongoDB Atlas...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Successfully connected to MongoDB Atlas!");

    let updatedCount = 0;
    let createdCount = 0;

    for (const id of mascotIds) {
      const mascotData = mascotsMap[id];
      const defaults = DEFAULT_MASCOTS[id] || {
        name: `Mascot ${id.toUpperCase()}`,
        description: "A new mascot character.",
      };

      const existing = await Mascot.findOne({ id });

      if (existing) {
        // Update images
        let imagesUpdated = false;
        for (const [state, url] of Object.entries(mascotData.images)) {
          if (existing.images[state] !== url) {
            existing.images[state] = url;
            imagesUpdated = true;
          }
        }
        
        if (existing.avatarUrl !== mascotData.avatarUrl && mascotData.avatarUrl) {
          existing.avatarUrl = mascotData.avatarUrl;
          imagesUpdated = true;
        }

        if (imagesUpdated) {
          await existing.save();
          console.log(`🔄 Updated images for existing mascot: [${id}]`);
          updatedCount++;
        } else {
          console.log(`✓ Mascot [${id}] already has the correct active image URLs.`);
        }
      } else {
        // Create new mascot
        const newMascot = new Mascot({
          id,
          name: defaults.name,
          description: defaults.description,
          avatarUrl: mascotData.avatarUrl,
          images: mascotData.images,
          dialogue: defaults.dialogue,
          themeColors: defaults.themeColors
        });
        await newMascot.save();
        console.log(`🆕 Created new mascot document for: [${id}]`);
        createdCount++;
      }
    }

    console.log("\n📊 Mascot Synchronization Summary:");
    console.log(`   - Total processed: ${mascotIds.length}`);
    console.log(`   - Updated mascots: ${updatedCount}`);
    console.log(`   - Created new mascots: ${createdCount}`);
    console.log("🎉 Mascots are fully synchronized with Cloudinary assets!");

  } catch (err) {
    console.error("❌ Synchronization Error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB Atlas.");
    process.exit(0);
  }
}

syncMascots();
