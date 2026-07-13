import { Router } from 'express';
import { HandbookEntryModel } from '../models/HandbookEntry';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    res.json(await HandbookEntryModel.find().sort({ order: 1 }));
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server Error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const entry = await HandbookEntryModel.findById(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Handbook entry not found' });
    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server Error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { id, ...data } = req.body ?? {};
    if (!id) return res.status(400).json({ message: 'id is required' });
    res.status(201).json(await HandbookEntryModel.create({ _id: id, ...data }));
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'Bad Request' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { id: _ignored, ...updates } = req.body ?? {};
    const entry = await HandbookEntryModel.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!entry) return res.status(404).json({ message: 'Handbook entry not found' });
    res.json(entry);
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'Bad Request' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const entry = await HandbookEntryModel.findByIdAndDelete(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Handbook entry not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server Error' });
  }
});

export default router;
