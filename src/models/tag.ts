import mongoose from "mongoose";
import { TagDocument } from "~/types/tag";
const Schema = mongoose.Schema;

//= ===============================
// Tag Schema
//= ===============================

const TagSchema = new Schema(
  {
    label: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      default: null,
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
