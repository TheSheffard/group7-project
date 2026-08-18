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
  // --- Identity verification (session flow) ---
  verificationStatus: "pending" | "awaiting_candidate" | "verified" | "failed";
  diditSessionId?: string;
  diditUrl?: string;
  verifyToken: string;
  idempotencyKey: string;
  expiresAt?: Date;
  ninCardPhoto?: string; // base64 (demo record only)
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
  verificationStatus: {
    type: String,
    enum: ["pending", "awaiting_candidate", "verified", "failed"],
    default: "pending",
  },
  diditSessionId: String,
  diditUrl: String,
  verifyToken: { type: String, required: true },
  idempotencyKey: { type: String, required: true },
  expiresAt: Date,
  ninCardPhoto: String,
  createdAt: { type: Date, default: Date.now },
});

// Idempotency: the same client submission (same key) never creates a duplicate record
VettingSchema.index({ userId: 1, idempotencyKey: 1 }, { unique: true });

export const Vetting: Model<IVetting> =
  (mongoose.models.Vetting as Model<IVetting>) ||
  mongoose.model<IVetting>("Vetting", VettingSchema);