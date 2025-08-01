
import { Router } from 'express';

const router = Router();

// Basic game routes
router.get('/ping', (req, res) => {
  res.json({ message: 'Game routes active' });
});

export default router;
