const mongoose = require("mongoose");
const { v2: cloudinary } = require("cloudinary");
const fs = require("fs");
const path = require("path");

// 1. Load Environment Variables from .env.local
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
  } else {
    console.warn("⚠️ .env.local not found, using process.env");
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

// Configure Cloudinary SDK
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

// 2. Define Mongoose Schema for Questions
const QuestionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    level: {
      type: String,
      enum: ["Starters", "Movers", "Flyers"],
      required: true,
    },
    part: { type: Number, required: true },
    type: { type: String, required: true },
    imagePath: { type: String, required: true },
    contextTags: { type: [String], default: [] },
    topic: { type: String, default: "General" },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    examinerScript: { type: String, required: false },
    evaluationCriteria: {
      expectedKeywords: { type: [String], default: [] },
      targetGrammar: { type: [String], default: [] },
    },
    questions: {
      type: [
        {
          examinerScript: { type: String, required: true },
          expectedKeywords: { type: [String], default: [] },
          targetGrammar: { type: [String], default: [] },
          topic: { type: String },
          level: {
            type: String,
            enum: ["Starters", "Movers", "Flyers"],
          },
          difficulty: {
            type: String,
            enum: ["Easy", "Medium", "Hard"],
          },
          groupCode: { type: String, default: "" },
          groupName: { type: String, default: "" },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

const Question = mongoose.models.Question || mongoose.model("Question", QuestionSchema);

// Helper to generate default questions for newly found items
function getDefaultQuestions(id, level, part) {
  let type = "Scene_Description";
  if (part === 2) type = "Storytelling";
  if (part === 3) type = "Find_Differences";

  const contextTags = [level.toLowerCase(), `part-${part}`, "auto-loaded"];

  const templates = {
    Starters: [
      {
        examinerScript: "Look at the picture. What can you see?",
        expectedKeywords: ["boy", "girl", "children", "play"],
        targetGrammar: ["there is", "there are"],
        topic: "Playground",
        level: "Starters",
        difficulty: "Easy",
        groupCode: "1.1",
        groupName: "Vocabulary & Pronunciation"
      },
      {
        examinerScript: "Where is the animal/dog in the picture?",
        expectedKeywords: ["under the table", "on the grass", "near the tree"],
        targetGrammar: ["prepositions"],
        topic: "Playground",
        level: "Starters",
        difficulty: "Easy",
        groupCode: "1.2",
        groupName: "Grammar & Sentence Structure"
      },
      {
        examinerScript: "What is the child wearing?",
        expectedKeywords: ["red shirt", "blue pants", "t-shirt"],
        targetGrammar: ["present continuous", "colors"],
        topic: "Playground",
        level: "Starters",
        difficulty: "Medium",
        groupCode: "2.1",
        groupName: "Speaking Reflexes"
      }
    ],
    Movers: [
      {
        examinerScript: "Describe this scene. What is happening?",
        expectedKeywords: ["monkey", "coconut tree", "climbing", "happy"],
        targetGrammar: ["present continuous", "verbs"],
        topic: "Nature",
        level: "Movers",
        difficulty: "Easy",
        groupCode: "1.1",
        groupName: "Vocabulary & Pronunciation"
      },
      {
        examinerScript: "What happened first in this story?",
        expectedKeywords: ["man lost hat", "took it", "climbed"],
        targetGrammar: ["past simple"],
        topic: "Nature",
        level: "Movers",
        difficulty: "Medium",
        groupCode: "2.2",
        groupName: "Storytelling & Description"
      },
      {
        examinerScript: "What differences can you find between the two pictures?",
        expectedKeywords: ["raining in picture A", "sunny in B", "cat", "dog"],
        targetGrammar: ["present simple", "present continuous"],
        topic: "General",
        level: "Movers",
        difficulty: "Hard",
        groupCode: "2.1",
        groupName: "Speaking Reflexes"
      }
    ],
    Flyers: [
      {
        examinerScript: "Look at this illustration. Tell me about what you see.",
        expectedKeywords: ["astronaut", "spacecraft", "moon", "stars"],
        targetGrammar: ["present continuous", "prepositions"],
        topic: "Space",
        level: "Flyers",
        difficulty: "Easy",
        groupCode: "1.1",
        groupName: "Vocabulary & Pronunciation"
      },
      {
        examinerScript: "Why is the character doing that action?",
        expectedKeywords: ["because", "landing", "exploring"],
        targetGrammar: ["conjunctions", "present perfect"],
        topic: "Space",
        level: "Flyers",
        difficulty: "Medium",
        groupCode: "2.1",
        groupName: "Speaking Reflexes"
      }
    ]
  };

  const questionsList = templates[level] || templates.Starters;
  const questions = questionsList.map(q => ({
    ...q,
    level,
    topic: "General"
  }));

  return {
    level,
    part,
    type,
    contextTags,
    topic: "General",
    difficulty: "Medium",
    examinerScript: questions[0].examinerScript,
    evaluationCriteria: {
      expectedKeywords: questions[0].expectedKeywords,
      targetGrammar: questions[0].targetGrammar
    },
    questions
  };
}

async function sync() {
  try {
    // 1. Fetch images from Cloudinary
    console.log("☁️  Fetching assets from Cloudinary directory 'hubxanh_yle_pdf_digitalizer/'...");
    const resourcesResult = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'hubxanh_yle_pdf_digitalizer/',
      max_results: 100
    });

    console.log(`✅ Found ${resourcesResult.resources.length} resources in Cloudinary.`);
    
    // 2. Parse resources to find Question mappings
    const cloudinaryFiles = resourcesResult.resources.map(res => {
      const filename = res.public_id.split("/").pop(); // e.g. "MV_P2_47_1781228187641"
      
      // Try to match standard YLE ID pattern (e.g. ST_P1_37 or MV_P2_47)
      const idMatch = filename.match(/^([A-Z]{2}_P\d+_\d+)/i);
      const extractedId = idMatch ? idMatch[1].toUpperCase() : null;

      // Handle PDF format replacement to render page 1 PNG
      let secureUrl = res.secure_url;
      if (res.format === "pdf" || secureUrl.endsWith(".pdf")) {
        secureUrl = secureUrl.replace(/\.pdf$/, ".png").replace("/image/upload/", "/image/upload/pg_1/");
      }

      return {
        publicId: res.public_id,
        filename,
        format: res.format,
        secureUrl,
        extractedId
      };
    }).filter(f => f.extractedId !== null);

    console.log(`📌 Filtered and identified ${cloudinaryFiles.length} valid YLE questions from filenames.`);

    // 3. Connect to MongoDB
    console.log("🔌 Connecting to MongoDB Atlas...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Successfully connected to MongoDB Atlas!");

    let updatedCount = 0;
    let createdCount = 0;

    for (const file of cloudinaryFiles) {
      const { extractedId, secureUrl } = file;

      // Parse metadata from extractedId (e.g., "MV_P2_47")
      const parts = extractedId.split("_");
      const levelCode = parts[0]; // ST, MV, FL
      const partCode = parts[1];  // P1, P2, P3, P4, P5

      const level = levelCode === "ST" ? "Starters" : levelCode === "MV" ? "Movers" : "Flyers";
      const part = parseInt(partCode.replace("P", ""), 10) || 1;

      // Check if document exists in MongoDB
      const existing = await Question.findOne({ id: extractedId });

      if (existing) {
        // Update the image path to match the active Cloudinary URL
        if (existing.imagePath !== secureUrl) {
          existing.imagePath = secureUrl;
          await existing.save();
          console.log(`🔄 Updated image url for existing question: [${extractedId}]`);
          updatedCount++;
        } else {
          console.log(`✓ Question [${extractedId}] already has the correct active image URL.`);
        }
      } else {
        // Create new question template using Cloudinary URL and preset YLE defaults
        const defaults = getDefaultQuestions(extractedId, level, part);
        const newQuestion = new Question({
          id: extractedId,
          imagePath: secureUrl,
          ...defaults
        });
        await newQuestion.save();
        console.log(`🆕 Created new question document for: [${extractedId}]`);
        createdCount++;
      }
    }

    console.log("\n📊 Synchronization Summary:");
    console.log(`   - Total processed: ${cloudinaryFiles.length}`);
    console.log(`   - Updated image paths: ${updatedCount}`);
    console.log(`   - Created new templates: ${createdCount}`);
    console.log("🎉 Database is now fully synchronized with Cloudinary assets!");

  } catch (err) {
    console.error("❌ Synchronization Error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB Atlas.");
    process.exit(0);
  }
}

sync();
