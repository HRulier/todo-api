import mongoose from "mongoose";
import { OperationDocument } from "~/types/operation";
const Schema = mongoose.Schema;

const OperationSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    source: {
      type: String,
      required: true,
      enum: ["slack"],
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    type: {
      type: String,
      required: true,
      enum: ["bulk_create_tasks"],
    },
    payload: {
      type: Schema.Types.Mixed,
      required: true,
    },
    metadata: {
      channel: {
        type: String,
        default: null,
      },
      approvedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      approvedAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<OperationDocument>("Operation", OperationSchema);
