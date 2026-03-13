import mongoose, { type Document, type Model, Schema } from "mongoose";

export interface ILastMessage {
  body: string;
  senderId: string;
  senderRole: "CANDIDATE" | "CLIENT";
  sentAt: Date;
}

export interface IThread extends Document {
  applicationId: string;
  candidateId: string;
  clientId: string;
  lastMessage: ILastMessage | null;
  unreadCount: {
    candidate: number;
    client: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const lastMessageSchema = new Schema<ILastMessage>(
  {
    body: { type: String, required: true },
    senderId: { type: String, required: true },
    senderRole: { type: String, enum: ["CANDIDATE", "CLIENT"], required: true },
    sentAt: { type: Date, required: true },
  },
  { _id: false },
);

const threadSchema = new Schema<IThread>(
  {
    applicationId: { type: String, required: true },
    candidateId: { type: String, required: true },
    clientId: { type: String, required: true },
    lastMessage: { type: lastMessageSchema, default: null },
    unreadCount: {
      candidate: { type: Number, default: 0 },
      client: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

threadSchema.index(
  { applicationId: 1, candidateId: 1, clientId: 1 },
  { unique: true },
);

export const Thread: Model<IThread> =
  mongoose.models.Thread || mongoose.model<IThread>("Thread", threadSchema);
