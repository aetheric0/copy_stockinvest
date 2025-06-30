// lib/models/account.ts
import mongoose, { Schema, model, Document, models } from "mongoose";

export interface AccountDocument extends Document {
  user: mongoose.Types.ObjectId;
  balances: { BTC: number; USDT: number };
  investments: mongoose.Types.ObjectId[]; 
  portfolioHistory: Array<{
    date: Date;
    totalValue: number;
    btcValue: number;
    usdtValue: number;
    usdValue: number;
    investmentsValue: number;
  }>;
  
  preferences: {
    defaultCurrency: string;      // e.g. "USD", "EUR"
    theme: "light" | "dark" | "system";
    emailNotifications: {
      marketUpdates: boolean;
      securityAlerts: boolean;
      transactionNotifications: boolean;
      newsletter: boolean;
    };
  };
}

const accountSchema = new Schema<AccountDocument>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  balances: {
    BTC: { type: Number, default: 0 },
    USDT: { type: Number, default: 0 },
    USD:  { type: Number, default: 0 },
  },
  investments: [{
    type: Schema.Types.ObjectId,
    ref: "Investment",
    default: []
  }],
  portfolioHistory: [
    {
      date: { type: Date, required: true },
      totalValue: Number,
      btcValue: Number,
      usdtValue: Number,
      usdValue: Number,
      investmentsValue: Number,
    },
  ],
  preferences: {
    defaultCurrency: { type: String, default: "USD" },
    theme:           { type: String, enum: ["light","dark","system"], default: "system" },
    emailNotifications: {
      marketUpdates:          { type: Boolean, default: false },
      securityAlerts:         { type: Boolean, default: true },
      transactionNotifications: { type: Boolean, default: true },
      newsletter:             { type: Boolean, default: false },
    },
  },
});

// Use `strict: false` if you prefer loose schemas, but this is explicit:
const Account = models.Account || model<AccountDocument>('Account', accountSchema)
export default Account
