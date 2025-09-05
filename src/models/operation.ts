import mongoose from "mongoose";
import { customAlphabet } from "nanoid";
import { OperationDocument } from "~/types/operation";
const Schema = mongoose.Schema;

const OperationSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shortId: {
      type: String,
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

OperationSchema.pre("save", async function (next) {
  if (!this.shortId) {
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      try {
        const nanoidCustom = customAlphabet(
          "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
          11
        );
        const id = nanoidCustom();
        const found = await (this.constructor as any).findOne({ shortId: id });
        if (!found) {
          this.shortId = id;
          break;
        }
        attempts++;
      } catch (error) {
        throw error;
      }
    }

    if (attempts === maxAttempts) {
      throw new Error("Failed to generate unique operation ID");
    }
  }
  next();
});

OperationSchema.index({ shortId: 1 }, { unique: true });

export default mongoose.model<OperationDocument>("Operation", OperationSchema);
