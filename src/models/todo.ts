import mongoose from "mongoose";
import { TodoDocument } from "~/types/todo";
const Schema = mongoose.Schema;

//= ===============================
// Todo Schema
//= ===============================

const TodoSchema = new Schema(
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

export default mongoose.model<TodoDocument>("Todo", TodoSchema);
