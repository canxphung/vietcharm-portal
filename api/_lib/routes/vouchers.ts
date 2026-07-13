import { Router } from 'express';
import { PromoVoucherModel } from '../models/PromoVoucher';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const docs = await PromoVoucherModel.find();
    res.json(docs);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server Error' });
  }
});

router.get('/:code', async (req, res) => {
  try {
    const doc = await PromoVoucherModel.findOne({ code: req.params.code });
    if (!doc) return res.status(404).json({ message: 'Voucher not found' });
    res.json(doc);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server Error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { code, ...rest } = req.body ?? {};
    if (!code) return res.status(400).json({ message: 'code is required' });
    const created = await PromoVoucherModel.create({ _id: code, code, ...rest });
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'Bad Request' });
  }
});

router.patch('/:code', async (req, res) => {
  try {
    const { code: _ignored, ...updates } = req.body ?? {};
    const doc = await PromoVoucherModel.findOneAndUpdate({ code: req.params.code }, updates, {
      new: true,
      runValidators: true,
    });
    if (!doc) return res.status(404).json({ message: 'Voucher not found' });
    res.json(doc);
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'Bad Request' });
  }
});

router.delete('/:code', async (req, res) => {
  try {
    const doc = await PromoVoucherModel.findOneAndDelete({ code: req.params.code });
    if (!doc) return res.status(404).json({ message: 'Voucher not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server Error' });
  }
});

export default router;
