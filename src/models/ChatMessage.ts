import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IChatMessage extends Document {
  authorId: mongoose.Types.ObjectId;
  manuscriptId?: mongoose.Types.ObjectId;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>({
  authorId: { type: Schema.Types.ObjectId, ref: 'Author', required: true },
  manuscriptId: { type: Schema.Types.ObjectId, ref: 'Manuscript' },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
}, {
  timestamps: true,
});

ChatMessageSchema.index({ authorId: 1, createdAt: -1 });
ChatMessageSchema.index({ authorId: 1, manuscriptId: 1, createdAt: -1 });

const ChatMessage = models.ChatMessage || model<IChatMessage>('ChatMessage', ChatMessageSchema);

export default ChatMessage;
