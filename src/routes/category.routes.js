const express = require('express');
const router = express.Router();

const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deactivateCategory,
  deleteCategory
} = require('../controllers/category.controller');

const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

router.get('/', getCategories);
router.get('/:id', getCategoryById);

router.post('/', authMiddleware, roleMiddleware('admin'), createCategory);
router.put('/:id', authMiddleware, roleMiddleware('admin'), updateCategory);
router.patch('/:id/deactivate', authMiddleware, roleMiddleware('admin'), deactivateCategory);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteCategory);

module.exports = router;