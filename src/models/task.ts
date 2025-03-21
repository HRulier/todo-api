import mongoose from "mongoose";
import { TaskDocument } from "~/types/task";
const Schema = mongoose.Schema;

//= ===============================
// Task Schema
//= ===============================

const TaskSchema = new Schema(
  {
    description: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
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

export default mongoose.model<TaskDocument>("Task", TaskSchema);
