import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createNote, deleteNote, getNote, listNotes, setArchived, setPinned, updateNote } from '../controllers/noteController.js';
import { createNoteSchema, listNotesSchema, noteActionSchema, updateNoteSchema } from '../validators/noteValidators.js';

const router = Router();
router.use(authenticate);
router.route('/')
  .post(validate(createNoteSchema), asyncHandler(createNote))
  .get(validate(listNotesSchema, 'query'), asyncHandler(listNotes));
router.route('/:id').get(asyncHandler(getNote)).patch(validate(updateNoteSchema), asyncHandler(updateNote)).delete(asyncHandler(deleteNote));
router.patch('/:id/pin', validate(noteActionSchema), asyncHandler(setPinned));
router.patch('/:id/archive', validate(noteActionSchema), asyncHandler(setArchived));

export default router;
