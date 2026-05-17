import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAssessmentResult extends Document {
  userId: string;
  level: "Starters" | "Movers" | "Flyers";
  sentence: string;
  recordedAudioUrl: string;
  score: number; // 0 to 100 points
  stars: number; // 1 to 5 star rating
  mispronouncedWords: string[]; // List of lowercase words read incorrectly
  feedback: {
    tutorComment: string; // Friendly text recommendation
    tips: string; // Specific pronunciation practice pointers
  };
  roadmap: string[]; // 3 next steps/exercises to improve
  createdAt: Date;
}

const AssessmentResultSchema: Schema<IAssessmentResult> = new Schema(
  {
    userId: { type: String, required: true },
    level: {
      type: String,
      enum: ["Starters", "Movers", "Flyers"],
      required: true,
    },
    sentence: { type: String, required: true },
    recordedAudioUrl: { type: String, default: "" },
    score: { type: Number, required: true, min: 0, max: 100 },
    stars: { type: Number, required: true, min: 1, max: 5 },
    mispronouncedWords: { type: [String], default: [] },
    feedback: {
      tutorComment: { type: String, required: true },
      tips: { type: String, default: "" },
    },
    roadmap: { type: [String], default: [] },
  },
  { timestamps: true }
);

const AssessmentResult: Model<IAssessmentResult> =
  mongoose.models.AssessmentResult ||
  mongoose.model<IAssessmentResult>("AssessmentResult", AssessmentResultSchema);

export default AssessmentResult;
