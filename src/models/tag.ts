import mongoose from "mongoose";
import { TagDocument } from "~/types/tags";
const Schema = mongoose.Schema;

//= ===============================
// Tag Schema
//= ===============================

const TagSchema = new Schema(
  {
    label: {
      type: String,
      required: true,
      unique: true,
    },
    color: {
      type: String,
      default: "#FFB3E6",
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<TagDocument>("Tag", TagSchema);
