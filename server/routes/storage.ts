
import { Router } from 'express';

const router = Router();

// Basic storage routes
router.get('/ping', (req, res) => {
  res.json({ message: 'Storage routes active' });
});

export default router;
