import { Router, type Request, type Response } from 'express';
import { TransactionModel } from '../models/Transaction';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.query;
    const filter = bookingId ? { bookingId: String(bookingId) } : {};
    const docs = await TransactionModel.find(filter);
    res.json(docs);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server Error' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const doc = await TransactionModel.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Transaction not found' });
    res.json(doc);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server Error' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { id, ...rest } = req.body ?? {};
    if (!id) return res.status(400).json({ message: 'id is required' });
    const created = await TransactionModel.create({ _id: id, ...rest });
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'Bad Request' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const doc = await TransactionModel.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Transaction not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server Error' });
  }
});

export default router;
