const express = require('express');
const router = express.Router();

const {
  createOrder,
  getOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder
} = require('../controllers/order.controller');

const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// ✅ Pedido público, sin login
router.post('/', createOrder);

// 🔒 Estas sí pueden seguir privadas si querés mantenerlas
router.get('/my-orders', authMiddleware, getMyOrders);
router.get('/:id', authMiddleware, getOrderById);

// 🔒 Admin
router.get('/', authMiddleware, roleMiddleware('admin'), getOrders);
router.patch('/:id/status', authMiddleware, roleMiddleware('admin'), updateOrderStatus);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteOrder);

module.exports = router;