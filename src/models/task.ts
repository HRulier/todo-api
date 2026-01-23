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
    dueDate: {
      type: Date,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    position: {
      type: Number,
      default: 1024,
    },
    priority: {
      type: String,
      default: "low",
      enum: ["low", "medium", "high"],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Tag",
          required: true,
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<TaskDocument>("Task", TaskSchema);
