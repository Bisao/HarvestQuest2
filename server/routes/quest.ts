
import { Router } from 'express';

const router = Router();

// Basic quest routes
router.get('/ping', (req, res) => {
  res.json({ message: 'Quest routes active' });
});

export default router;
