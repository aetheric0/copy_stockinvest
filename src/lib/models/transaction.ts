import mongoose, { Schema, type Document } from "mongoose"

export interface ITransaction extends Document {
  user: mongoose.Types.ObjectId
  address: string
  amount: number
  currency: string
  status: "pending" | "completed" | "failed"
  txHash?: string
  description?: string
  type: "deposit" | "withdrawal"
  initiatedAt: Date
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const TransactionSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    address: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
    txHash: { type: String },
    description: { type: String },
    type: { type: String, enum: ["deposit", "withdrawal"], default: "deposit" },
    initiatedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { timestamps: true },
)

// Create or get the model
export default mongoose.models.Transaction || mongoose.model<ITransaction>("Transaction", TransactionSchema)
