import mongoose from 'mongoose';

export const NOTE_COLORS = ['paper', 'lavender', 'mint', 'peach', 'blue', 'lemon'];

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minlength: 1, maxlength: 120 },
  content: { type: String, required: true, trim: true, minlength: 1, maxlength: 20000 },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  color: { type: String, enum: NOTE_COLORS, default: 'paper' },
  tags: {
    type: [{ type: String, trim: true, lowercase: true, maxlength: 24 }],
    default: [],
    validate: [(tags) => tags.length <= 10 && new Set(tags).size === tags.length, 'Tags must be unique and limited to 10'],
  },
  isPinned: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },
}, { timestamps: true });

noteSchema.index({ owner: 1, isArchived: 1, isPinned: -1, updatedAt: -1 });
noteSchema.index({ owner: 1, tags: 1, isArchived: 1 });

export const Note = mongoose.models.Note || mongoose.model('Note', noteSchema);
