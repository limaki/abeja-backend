const express = require('express');
const router = express.Router();

console.log('[CATEGORY ROUTES] CARGADAS');

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
const upload = require('../middlewares/upload.middleware');

console.log('[CATEGORY ROUTES] authMiddleware tipo:', typeof authMiddleware);
console.log('[CATEGORY ROUTES] roleMiddleware tipo:', typeof roleMiddleware);
console.log('[CATEGORY ROUTES] upload middleware tipo:', typeof upload);
console.log('[CATEGORY ROUTES] upload.single tipo:', typeof upload.single);

router.get(
  '/',
  (req, res, next) => {
    console.log('[CATEGORY ROUTES] GET /api/categories llegó');
    console.log('[CATEGORY ROUTES] QUERY:', req.query);
    next();
  },
  getCategories
);

router.get(
  '/:id',
  (req, res, next) => {
    console.log('[CATEGORY ROUTES] GET /api/categories/:id llegó');
    console.log('[CATEGORY ROUTES] PARAMS:', req.params);
    next();
  },
  getCategoryById
);

router.post(
  '/',
  authMiddleware,
  roleMiddleware('admin'),
  upload.single('image'),
  (req, res, next) => {
    console.log('[CATEGORY ROUTES] POST /api/categories llegó');
    console.log('[CATEGORY ROUTES] BODY:', req.body);
    console.log('[CATEGORY ROUTES] FILE EXISTE:', !!req.file);

    if (req.file) {
      console.log('[CATEGORY ROUTES] FILE INFO:', {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        hasBuffer: !!req.file.buffer
      });
    }

    next();
  },
  createCategory
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('admin'),
  upload.single('image'),
  (req, res, next) => {
    console.log('[CATEGORY ROUTES] PUT /api/categories/:id llegó');
    console.log('[CATEGORY ROUTES] PARAMS:', req.params);
    console.log('[CATEGORY ROUTES] BODY:', req.body);
    console.log('[CATEGORY ROUTES] FILE EXISTE:', !!req.file);

    if (req.file) {
      console.log('[CATEGORY ROUTES] FILE INFO:', {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        hasBuffer: !!req.file.buffer
      });
    }

    next();
  },
  updateCategory
);

router.patch(
  '/:id/deactivate',
  authMiddleware,
  roleMiddleware('admin'),
  (req, res, next) => {
    console.log('[CATEGORY ROUTES] PATCH /api/categories/:id/deactivate llegó');
    console.log('[CATEGORY ROUTES] PARAMS:', req.params);
    next();
  },
  deactivateCategory
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('admin'),
  (req, res, next) => {
    console.log('[CATEGORY ROUTES] DELETE /api/categories/:id llegó');
    console.log('[CATEGORY ROUTES] PARAMS:', req.params);
    next();
  },
  deleteCategory
);

module.exports = router;