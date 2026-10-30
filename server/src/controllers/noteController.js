import mongoose from 'mongoose';
import { Note } from '../models/Note.js';
import { HttpError } from '../utils/HttpError.js';
import { escapeRegex } from '../utils/escapeRegex.js';

function requireValidId(id) {
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, 'Invalid note identifier');
}

async function findOwnedNote(id, owner) {
  requireValidId(id);
  const note = await Note.findOne({ _id: id, owner });
  if (!note) throw new HttpError(404, 'Note not found');
  return note;
}

export async function createNote(req, res) {
  const note = await Note.create({ ...req.body, owner: req.user.id });
  res.status(201).json({ success: true, message: 'Note created successfully', data: { note } });
}

export async function listNotes(req, res) {
  const { page, limit, search, tag, archived, sortBy, order } = req.validatedQuery;
  const filter = { owner: req.user.id, isArchived: archived };
  if (tag) filter.tags = tag.toLowerCase();
  if (search) {
    const literal = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ title: literal }, { content: literal }];
  }

  const direction = order === 'asc' ? 1 : -1;
  const sort = { isPinned: -1, [sortBy]: direction, _id: direction };
  const [notes, total] = await Promise.all([
    Note.find(filter).sort(sort).skip((page - 1) * limit).limit(limit),
    Note.countDocuments(filter),
  ]);
  res.json({ success: true, data: { notes, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } } });
}

export async function getNote(req, res) {
  const note = await findOwnedNote(req.params.id, req.user.id);
  res.json({ success: true, data: { note } });
}

export async function updateNote(req, res) {
  const note = await findOwnedNote(req.params.id, req.user.id);
  Object.assign(note, req.body);
  await note.save();
  res.json({ success: true, message: 'Note updated successfully', data: { note } });
}

export async function deleteNote(req, res) {
  const note = await findOwnedNote(req.params.id, req.user.id);
  await note.deleteOne();
  res.json({ success: true, message: 'Note deleted successfully', data: {} });
}

async function setNoteFlag(req, res, field, message) {
  const note = await findOwnedNote(req.params.id, req.user.id);
  note[field] = req.body.value;
  await note.save();
  res.json({ success: true, message, data: { note } });
}

export const setPinned = (req, res) => setNoteFlag(req, res, 'isPinned', 'Pin status updated');
export const setArchived = (req, res) => setNoteFlag(req, res, 'isArchived', 'Archive status updated');
