import mongoose, { type Document, type Model, Schema, type Types } from "mongoose";

export interface IMessage extends Document {
  threadId: Types.ObjectId;
  senderId: string;
  senderRole: "CANDIDATE" | "CLIENT";
  body: string;
  readAt: Date | null;
  sentAt: Date;
}

const messageSchema = new Schema<IMessage>({
  threadId: { type: Schema.Types.ObjectId, ref: "Thread", required: true },
  senderId: { type: String, required: true },
  senderRole: { type: String, enum: ["CANDIDATE", "CLIENT"], required: true },
  body: { type: String, required: true },
  readAt: { type: Date, default: null },
  sentAt: { type: Date, required: true, default: Date.now },
});

messageSchema.index({ threadId: 1, sentAt: 1 });

export const Message: Model<IMessage> =
  mongoose.models.Message ||
  mongoose.model<IMessage>("Message", messageSchema);
