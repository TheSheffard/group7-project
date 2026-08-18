import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVetting extends Document {
  userId: string;
  candidateName: string;
  nin: string;
  phone: string;
  email: string;
  stateOfOrigin?: string;
  bvn?: string;
  results: VettingResultItem[];
  overallVerdict: "verified" | "needs_review" | "failed";
  idempotencyKey: string;
  createdAt: Date;
}

export interface VettingResultItem {
  component: string;
  valid: boolean;
  reason?: string;
  score: number;
  details?: Record<string, unknown>;
}

const VettingResultSchema = new Schema<VettingResultItem>(
  {
    component: { type: String, required: true },
    valid: { type: Boolean, required: true },
    reason: String,
    score: { type: Number, required: true },
    details: Schema.Types.Mixed,
  },
  { _id: false }
);

const VettingSchema = new Schema<IVetting>({
  userId: { type: String, required: true, index: true },
  candidateName: { type: String, required: true },
  nin: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  stateOfOrigin: String,
  bvn: String,
  results: [VettingResultSchema],
  overallVerdict: {
    type: String,
    enum: ["verified", "needs_review", "failed"],
    required: true,
  },
  idempotencyKey: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Idempotency: same client submission never creates a duplicate.
VettingSchema.index({ userId: 1, idempotencyKey: 1 }, { unique: true });

// NIN uniqueness: a candidate must not be vetted twice by the same account.
VettingSchema.index({ userId: 1, nin: 1 }, { unique: true });

export const Vetting: Model<IVetting> =
  (mongoose.models.Vetting as Model<IVetting>) ||
  mongoose.model<IVetting>("Vetting", VettingSchema);