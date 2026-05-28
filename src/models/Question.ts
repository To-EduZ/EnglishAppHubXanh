import mongoose, { Schema, Document, Model } from "mongoose";

export interface IQuestion extends Document {
  id: string; // Unique question identifier (e.g., 'ST_P1_03')
  level: "Starters" | "Movers" | "Flyers";
  part: number;
  type: string; // e.g. "Scene_Description", "Object_Card", "Storytelling"
  imagePath: string; // Cloudinary secure URL
  contextTags: string[];
  examinerScript: string;
  evaluationCriteria: {
    expectedKeywords: string[];
    targetGrammar: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema: Schema<IQuestion> = new Schema(
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
    examinerScript: { type: String, required: true },
    evaluationCriteria: {
      expectedKeywords: { type: [String], default: [] },
      targetGrammar: { type: [String], default: [] },
    },
  },
  { timestamps: true }
);

const Question: Model<IQuestion> =
  mongoose.models.Question ||
  mongoose.model<IQuestion>("Question", QuestionSchema);

export default Question;

