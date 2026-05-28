const mongoose = require("mongoose");

const mongodbUri = "mongodb+srv://EduZ3667:naobo2@englishkidsapp.hyzcoyq.mongodb.net/english-kids-app?appName=EnglishKidsApp";

const QuestionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  level: { type: String, enum: ["Starters", "Movers", "Flyers"], required: true },
  part: { type: Number, required: true },
  type: { type: String, required: true },
  imagePath: { type: String, required: true },
  contextTags: { type: [String], default: [] },
  examinerScript: { type: String, required: true },
  evaluationCriteria: {
    expectedKeywords: { type: [String], default: [] },
    targetGrammar: { type: [String], default: [] },
  },
}, { timestamps: true });

const Question = mongoose.models.Question || mongoose.model("Question", QuestionSchema);

const restoredQuestions = [
  {
    id: "ST_P1_47",
    level: "Starters",
    part: 1,
    type: "Scene_Description",
    imagePath: "https://res.cloudinary.com/dupquwf3j/image/upload/pg_1/v1779971869/hubxanh_yle_pdf_digitalizer/ST_P1_47_1779971867318.png",
    contextTags: ["restored", "starters"],
    examinerScript: "Look at this picture. Tell me what you see.",
    evaluationCriteria: { expectedKeywords: ["boy", "girl"], targetGrammar: [] }
  },
  {
    id: "MV_P2_47",
    level: "Movers",
    part: 2,
    type: "Storytelling",
    imagePath: "https://res.cloudinary.com/dupquwf3j/image/upload/pg_1/v1779972041/hubxanh_yle_pdf_digitalizer/MV_P2_47_1779972038367.png",
    contextTags: ["restored", "movers"],
    examinerScript: "This is a story. Can you tell it to me?",
    evaluationCriteria: { expectedKeywords: ["story"], targetGrammar: [] }
  },
  {
    id: "MV_P3_47",
    level: "Movers",
    part: 3,
    type: "Find_Differences",
    imagePath: "https://res.cloudinary.com/dupquwf3j/image/upload/pg_1/v1779976441/hubxanh_yle_pdf_digitalizer/MV_P3_47_1779976438703.png",
    contextTags: ["restored", "movers"],
    examinerScript: "Find the differences between these two pictures.",
    evaluationCriteria: { expectedKeywords: ["different"], targetGrammar: [] }
  }
];

async function run() {
  try {
    await mongoose.connect(mongodbUri);
    console.log("Connected to MongoDB.");
    
    await Question.deleteMany({});
    console.log("Cleared mock questions.");
    
    await Question.insertMany(restoredQuestions);
    console.log("Restored original questions from Cloudinary data!");
    
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
