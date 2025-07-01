// global.d.ts
/* eslint-disable no-var */
import type mongoose from "mongoose";

declare global {
  var dbCache:
    | { conn: mongoose.Mongoose | null; promise: Promise<mongoose.Mongoose> | null }
    | undefined;
}

export {};
