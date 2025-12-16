// server/src/api/invoicingRoutes.ts
import { Router } from 'express';
import {
  generateAndSendInvoice,
  downloadInvoice
} from '../controllers/invoicingController';

const router: Router = Router();

router.post('/generate', generateAndSendInvoice);
router.get('/download/:id', downloadInvoice);

export default router;
