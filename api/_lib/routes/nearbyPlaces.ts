import { Router } from 'express';
import { NearbyPlaceModel } from '../models/NearbyPlace';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    res.json(await NearbyPlaceModel.find().sort({ order: 1 }));
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server Error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const place = await NearbyPlaceModel.findById(req.params.id);
    if (!place) return res.status(404).json({ message: 'Nearby place not found' });
    res.json(place);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server Error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { id, ...data } = req.body ?? {};
    if (!id) return res.status(400).json({ message: 'id is required' });
    res.status(201).json(await NearbyPlaceModel.create({ _id: id, ...data }));
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'Bad Request' });
  }
});

router.post('/:id/reviews', async (req, res) => {
  try {
    const review = req.body ?? {};
    if (!review.id || !review.author?.trim() || !review.comment?.trim()) {
      return res.status(400).json({ message: 'id, author and comment are required' });
    }
    const place = await NearbyPlaceModel.findById(req.params.id);
    if (!place) return res.status(404).json({ message: 'Nearby place not found' });

    const previousReviewCount = place.totalReviews;
    const previousRatingTotal = place.rating * previousReviewCount;
    place.reviews.unshift(review);
    place.totalReviews = previousReviewCount + 1;
    place.rating = Number(
      ((previousRatingTotal + Number(review.rating)) / place.totalReviews).toFixed(1),
    );
    await place.save();
    res.status(201).json(place);
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'Bad Request' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { id: _ignored, ...updates } = req.body ?? {};
    const place = await NearbyPlaceModel.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!place) return res.status(404).json({ message: 'Nearby place not found' });
    res.json(place);
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'Bad Request' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const place = await NearbyPlaceModel.findByIdAndDelete(req.params.id);
    if (!place) return res.status(404).json({ message: 'Nearby place not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server Error' });
  }
});

export default router;
