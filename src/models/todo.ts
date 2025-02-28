import mongoose from "mongoose";
import { ITodo } from "~/types/todo";
const Schema = mongoose.Schema;

//= ===============================
// Todo Schema
//= ===============================

const TodoSchema = new Schema(
  {
    desciption: {
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
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ITodo>("Todo", TodoSchema);
