import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IVoiceProfile {
  toneDescriptors: string[];
  signaturePhrases: string[];
  anchorScriptures: string[];
  writingStyle: string;
  audienceDescription: string;
  personalTestimony: string;
  theologicalFramework: string;
  avoidTopics: string[];
  preferredBibleVersion: string;
}

export interface IAuthor extends Document {
  name: string;
  ministry: string;
  theologicalStream: string;
  voiceProfile: IVoiceProfile;
  interviewCompleted: boolean;
  interviewStep: number;
  createdAt: Date;
  updatedAt: Date;
}

const VoiceProfileSchema = new Schema<IVoiceProfile>({
  toneDescriptors: { type: [String], default: [] },
  signaturePhrases: { type: [String], default: [] },
  anchorScriptures: { type: [String], default: [] },
  writingStyle: { type: String, default: '' },
  audienceDescription: { type: String, default: '' },
  personalTestimony: { type: String, default: '' },
  theologicalFramework: { type: String, default: '' },
  avoidTopics: { type: [String], default: [] },
  preferredBibleVersion: { type: String, default: 'NKJV' },
}, { _id: false });

const AuthorSchema = new Schema<IAuthor>({
  name: { type: String, required: true },
  ministry: { type: String, default: '' },
  theologicalStream: { type: String, default: '' },
  voiceProfile: { type: VoiceProfileSchema, default: () => ({}) },
  interviewCompleted: { type: Boolean, default: false },
  interviewStep: { type: Number, default: 0 },
}, {
  timestamps: true,
});

const Author = models.Author || model<IAuthor>('Author', AuthorSchema);

export default Author;
