import { Router, type Request, type Response } from 'express';
import { TripRoomModel } from '../models/TripRoom';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { inviteCode, memberEmail } = req.query;
    const filter: Record<string, unknown> = {};
    if (inviteCode) filter['inviteCode'] = String(inviteCode).trim().toUpperCase();
    if (memberEmail) filter['members.email'] = String(memberEmail);
    const docs = await TripRoomModel.find(filter);
    res.json(docs);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server Error' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const doc = await TripRoomModel.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Trip room not found' });
    res.json(doc);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server Error' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { id, ...rest } = req.body ?? {};
    if (!id) return res.status(400).json({ message: 'id is required' });
    const created = await TripRoomModel.create({ _id: id, ...rest });
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'Bad Request' });
  }
});

router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id: _ignored, ...updates } = req.body ?? {};
    const doc = await TripRoomModel.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!doc) return res.status(404).json({ message: 'Trip room not found' });
    res.json(doc);
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'Bad Request' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const doc = await TripRoomModel.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Trip room not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server Error' });
  }
});

export default router;
