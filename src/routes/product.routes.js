const express = require('express');
const router = express.Router();

const {
  createProduct,
  getProducts,
  getFeaturedProducts,
  getProductById,
  updateProduct,
  deactivateProduct,
  deleteProduct
} = require('../controllers/product.controller');

const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const upload = require('../middlewares/upload.middleware');

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:id', getProductById);

router.post(
  '/',
  authMiddleware,
  roleMiddleware('admin'),
  upload.single('image'),
  createProduct
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('admin'),
  upload.single('image'),
  updateProduct
);

router.patch('/:id/deactivate', authMiddleware, roleMiddleware('admin'), deactivateProduct);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteProduct);

module.exports = router;