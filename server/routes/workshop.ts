
import { Router } from 'express';

const router = Router();

// Basic workshop routes
router.get('/ping', (req, res) => {
  res.json({ message: 'Workshop routes active' });
});

export default router;
