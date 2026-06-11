import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IChapter {
  number: number;
  title: string;
  content: string;
  summary: string;
  keyPoints: string[];
  status: 'outline' | 'draft' | 'revised' | 'final';
  generatedAt?: Date;
}

export interface IManuscript extends Document {
  authorId: mongoose.Types.ObjectId;
  title: string;
  subtitle: string;
  description: string;
  targetAudience: string;
  bookType: string;
  chapters: IChapter[];
  outline: string;
  status: 'planning' | 'drafting' | 'revising' | 'complete';
  createdAt: Date;
  updatedAt: Date;
}

const ChapterSchema = new Schema<IChapter>({
  number: { type: Number, required: true },
  title: { type: String, required: true },
  content: { type: String, default: '' },
  summary: { type: String, default: '' },
  keyPoints: { type: [String], default: [] },
  status: { type: String, enum: ['outline', 'draft', 'revised', 'final'], default: 'outline' },
  generatedAt: { type: Date },
}, { _id: true });

const ManuscriptSchema = new Schema<IManuscript>({
  authorId: { type: Schema.Types.ObjectId, ref: 'Author', required: true },
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  description: { type: String, default: '' },
  targetAudience: { type: String, default: '' },
  bookType: { type: String, default: 'teaching' },
  chapters: { type: [ChapterSchema], default: [] },
  outline: { type: String, default: '' },
  status: { type: String, enum: ['planning', 'drafting', 'revising', 'complete'], default: 'planning' },
}, {
  timestamps: true,
});

const Manuscript = models.Manuscript || model<IManuscript>('Manuscript', ManuscriptSchema);

export default Manuscript;
