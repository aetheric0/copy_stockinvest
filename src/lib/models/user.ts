import mongoose, { Schema, model, Document, Model } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';

// Preferences sub-schema
const EmailNotificationsSchema = new Schema(
  {
    marketUpdates: { type: Boolean, default: false },
    securityAlerts: { type: Boolean, default: true },
    transactionNotifications: { type: Boolean, default: true },
    newsletter: { type: Boolean, default: false },
  },
  { _id: false }
);

const PreferencesSchema = new Schema(
  {
    defaultCurrency: { type: String, default: 'USD' },
    theme: { type: String, enum: ['system', 'light', 'dark'], default: 'system' },
    emailNotifications: { type: EmailNotificationsSchema, default: () => ({}) },
  },
  { _id: false }
);

export interface IUser extends Document {
  username: string;
  fullname: string;
  email: string;
  password: string;
  phoneNumber?: string;
  country: string;
  referralID?: string;
  isVerified: boolean;
  lastLogin?: Date;
  preferences: {
    defaultCurrency: string;
    theme: 'system' | 'light' | 'dark';
    emailNotifications: {
      marketUpdates: boolean;
      securityAlerts: boolean;
      transactionNotifications: boolean;
      newsletter: boolean;
    };
  };
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
    },
    fullname: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [50, 'Full name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Never return password in queries
    },
    phoneNumber: {
      type: String,
      trim: true,
      validate: {
        validator: (v: string) => validator.isMobilePhone(v, 'any'),
        message: 'Please provide a valid phone number',
      },
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
    },
    referralID: {
      type: String,
      trim: true,
      uppercase: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
    },
    preferences: { type: PreferencesSchema, default: () => ({}) },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Hash password on save
userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err as Error);
  }
});

// Compare passwords
userSchema.methods.comparePassword = function (
  candidatePassword: string
): Promise<boolean> {
  // password was excluded by default; need to select it when querying
  // so ensure to query with .select('+password') in your auth logic
  return bcrypt.compare(candidatePassword, this.password);
};

// Virtual profile URL
userSchema.virtual('profileURL').get(function () {
  return `/users/${this.username}`;
});

const User: Model<IUser> =
  mongoose.models.User || model<IUser>('User', userSchema);

export default User;
