import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  age: number;
  currentLevel: "Starters" | "Movers" | "Flyers";
  totalStars: number;
  createdAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 4, max: 14 },
    currentLevel: {
      type: String,
      enum: ["Starters", "Movers", "Flyers"],
      default: "Starters",
    },
    totalStars: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Prevent compiling model multiple times in Next.js HMR environment
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
