import { Router } from 'express';
import { TouristLocationModel } from '../models/TouristLocation';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const docs = await TouristLocationModel.find();
    res.json(docs);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server Error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const doc = await TouristLocationModel.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Tourist location not found' });
    res.json(doc);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server Error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { id, ...rest } = req.body ?? {};
    if (!id) return res.status(400).json({ message: 'id is required' });
    const created = await TouristLocationModel.create({ _id: id, ...rest });
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'Bad Request' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { id: _ignored, ...updates } = req.body ?? {};
    const doc = await TouristLocationModel.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!doc) return res.status(404).json({ message: 'Tourist location not found' });
    res.json(doc);
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'Bad Request' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const doc = await TouristLocationModel.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Tourist location not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server Error' });
  }
});

export default router;
