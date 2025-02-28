import mongoose from "mongoose";
import { ITodo } from "~/types/todo";
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
    },
    done: {
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

export default mongoose.model<ITodo>("Todo", TodoSchema);
