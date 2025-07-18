import mongoose from "mongoose";
import { CategoryDocument } from "~/types/category";
const Schema = mongoose.Schema;

//= ===============================
// Category Schema
//= ===============================

const CategorySchema = new Schema(
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

export default mongoose.model<CategoryDocument>("Category", CategorySchema);
