import { Document } from "mongoose";

export interface ITodo extends Document {
  _id: string;
  date: Date;
  description: string;
  done: boolean;
}
