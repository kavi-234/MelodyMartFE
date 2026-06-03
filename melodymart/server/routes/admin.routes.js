const express = require('express');
const router = express.Router();
const adminDashboardController = require('../controllers/adminDashboard.controller');
const auth = require('../middleware/auth');
const adminAuth = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin access only' });
  next();
};

router.use(auth, adminAuth);

router.get('/dashboard/stats', adminDashboardController.getAdminStats);
router.get('/users', adminDashboardController.getAllUsers);
router.patch('/users/:userId/approve', adminDashboardController.approveUser);
router.patch('/users/:userId/reject', adminDashboardController.rejectUser);
router.delete('/users/:userId', adminDashboardController.deleteUser);

router.get('/orders', adminDashboardController.getAllOrders);
router.patch('/orders/:orderId/refund', adminDashboardController.refundOrder);
router.patch('/orders/:orderId/complete', adminDashboardController.completeOrder);

router.get('/instruments', adminDashboardController.getAllInstruments);
router.post('/instruments', adminDashboardController.addInstrument);
router.delete('/instruments/:instrumentId', adminDashboardController.deleteInstrument);

module.exports = router;
