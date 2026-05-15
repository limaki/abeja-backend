const Category = require('../models/Category');
const uploadCloudinaryModule = require('../utils/uploadToCloudinary');

console.log('[CATEGORY CONTROLLER] CARGADO');
console.log('[CATEGORY CONTROLLER] uploadCloudinaryModule tipo:', typeof uploadCloudinaryModule);
console.log('[CATEGORY CONTROLLER] uploadCloudinaryModule keys:', Object.keys(uploadCloudinaryModule || {}));

const uploadBufferToCloudinary =
  typeof uploadCloudinaryModule === 'function'
    ? uploadCloudinaryModule
    : uploadCloudinaryModule.uploadBufferToCloudinary;

console.log('[CATEGORY CONTROLLER] uploadBufferToCloudinary tipo:', typeof uploadBufferToCloudinary);

const escapeRegex = (text) => {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const parseBoolean = (value, defaultValue = true) => {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }

  if (value === true || value === 'true') {
    return true;
  }

  if (value === false || value === 'false') {
    return false;
  }

  return defaultValue;
};

const uploadCategoryImage = async (file) => {
  console.log('[CATEGORY IMAGE] INICIO uploadCategoryImage');
  console.log('[CATEGORY IMAGE] file existe:', !!file);

  if (file) {
    console.log('[CATEGORY IMAGE] file info:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      hasBuffer: !!file.buffer
    });
  }

  if (!file || !file.buffer) {
    console.log('[CATEGORY IMAGE] Sin archivo/buffer, no sube imagen');
    return '';
  }

  if (typeof uploadBufferToCloudinary !== 'function') {
    throw new Error(
      'uploadBufferToCloudinary no es una función. Revisá backend/src/utils/uploadToCloudinary.js y cómo se importa.'
    );
  }

  console.log('[CATEGORY IMAGE] Subiendo a Cloudinary...');

  const uploaded = await uploadBufferToCloudinary(file.buffer, {
    public_id: `category-${Date.now()}`
  });

  console.log('[CATEGORY IMAGE] Respuesta Cloudinary:', uploaded);

  const imageUrl = uploaded && (uploaded.secure_url || uploaded.url)
    ? uploaded.secure_url || uploaded.url
    : '';

  console.log('[CATEGORY IMAGE] imageUrl final:', imageUrl);

  return imageUrl;
};

// POST /api/categories
const createCategory = async (req, res) => {
  console.log('==============================');
  console.log('[CATEGORY CREATE] INICIO');
  console.log('[CATEGORY CREATE] BODY:', req.body);
  console.log('[CATEGORY CREATE] FILE EXISTE:', !!req.file);

  if (req.file) {
    console.log('[CATEGORY CREATE] FILE INFO:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      hasBuffer: !!req.file.buffer
    });
  }

  try {
    const { name, description, active } = req.body || {};

    if (!name || !name.trim()) {
      return res.status(400).json({
        ok: false,
        message: 'El nombre de la categoría es obligatorio'
      });
    }

    const normalizedName = name.trim();

    console.log('[CATEGORY CREATE] Buscando duplicado:', normalizedName);

    const existingCategory = await Category.findOne({
      name: {
        $regex: new RegExp(`^${escapeRegex(normalizedName)}$`, 'i')
      }
    });

    console.log('[CATEGORY CREATE] Duplicado existe:', !!existingCategory);

    if (existingCategory) {
      return res.status(400).json({
        ok: false,
        message: 'Ya existe una categoría con ese nombre'
      });
    }

    let image = '';

    if (req.file && req.file.buffer) {
      image = await uploadCategoryImage(req.file);
    } else {
      console.log('[CATEGORY CREATE] Sin imagen nueva');
    }

    console.log('[CATEGORY CREATE] Creando categoría...');

    const category = await Category.create({
      name: normalizedName,
      description: description ? description.trim() : '',
      image,
      active: parseBoolean(active, true)
    });

    console.log('[CATEGORY CREATE] OK:', category._id);
    console.log('==============================');

    return res.status(201).json({
      ok: true,
      message: 'Categoría creada correctamente',
      category
    });
  } catch (error) {
    console.error('==============================');
    console.error('[CATEGORY CREATE] ERROR REAL');
    console.error('NAME:', error.name);
    console.error('MESSAGE:', error.message);
    console.error('STACK:', error.stack);
    console.error('==============================');

    return res.status(500).json({
      ok: false,
      message: error.message || 'Error interno al crear categoría',
      errorName: error.name,
      detail: error.stack
    });
  }
};

// GET /api/categories
const getCategories = async (req, res) => {
  console.log('==============================');
  console.log('[CATEGORY GET ALL] INICIO');
  console.log('[CATEGORY GET ALL] QUERY:', req.query);

  try {
    const { active } = req.query;

    const filter = {};

    if (active === 'true') {
      filter.active = true;
    }

    if (active === 'false') {
      filter.active = false;
    }

    console.log('[CATEGORY GET ALL] FILTER:', filter);

    const categories = await Category.find(filter).sort({ name: 1 });

    console.log('[CATEGORY GET ALL] TOTAL:', categories.length);
    console.log('==============================');

    return res.status(200).json({
      ok: true,
      categories
    });
  } catch (error) {
    console.error('==============================');
    console.error('[CATEGORY GET ALL] ERROR REAL');
    console.error('NAME:', error.name);
    console.error('MESSAGE:', error.message);
    console.error('STACK:', error.stack);
    console.error('==============================');

    return res.status(500).json({
      ok: false,
      message: error.message || 'Error interno al obtener categorías',
      errorName: error.name,
      detail: error.stack
    });
  }
};

// GET /api/categories/:id
const getCategoryById = async (req, res) => {
  console.log('==============================');
  console.log('[CATEGORY GET BY ID] INICIO');
  console.log('[CATEGORY GET BY ID] PARAMS:', req.params);

  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    console.log('[CATEGORY GET BY ID] ENCONTRADA:', !!category);
    console.log('==============================');

    if (!category) {
      return res.status(404).json({
        ok: false,
        message: 'Categoría no encontrada'
      });
    }

    return res.status(200).json({
      ok: true,
      category
    });
  } catch (error) {
    console.error('==============================');
    console.error('[CATEGORY GET BY ID] ERROR REAL');
    console.error('NAME:', error.name);
    console.error('MESSAGE:', error.message);
    console.error('STACK:', error.stack);
    console.error('==============================');

    return res.status(500).json({
      ok: false,
      message: error.message || 'Error interno al obtener categoría',
      errorName: error.name,
      detail: error.stack
    });
  }
};

// PUT /api/categories/:id
const updateCategory = async (req, res) => {
  console.log('==============================');
  console.log('[CATEGORY UPDATE] INICIO');
  console.log('[CATEGORY UPDATE] PARAMS:', req.params);
  console.log('[CATEGORY UPDATE] BODY:', req.body);
  console.log('[CATEGORY UPDATE] FILE EXISTE:', !!req.file);

  if (req.file) {
    console.log('[CATEGORY UPDATE] FILE INFO:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      hasBuffer: !!req.file.buffer
    });
  }

  try {
    const { id } = req.params;
    const { name, description, active } = req.body || {};

    console.log('[CATEGORY UPDATE] ID:', id);
    console.log('[CATEGORY UPDATE] Buscando categoría...');

    const category = await Category.findById(id);

    console.log('[CATEGORY UPDATE] Categoría encontrada:', !!category);

    if (!category) {
      return res.status(404).json({
        ok: false,
        message: 'Categoría no encontrada'
      });
    }

    console.log('[CATEGORY UPDATE] DATA ACTUAL:', {
      _id: category._id,
      name: category.name,
      description: category.description,
      image: category.image,
      active: category.active
    });

    if (name !== undefined) {
      console.log('[CATEGORY UPDATE] Validando name:', name);

      if (!name || !name.trim()) {
        return res.status(400).json({
          ok: false,
          message: 'El nombre de la categoría no puede estar vacío'
        });
      }

      const normalizedName = name.trim();

      console.log('[CATEGORY UPDATE] Buscando duplicado:', normalizedName);

      const existingCategory = await Category.findOne({
        _id: { $ne: id },
        name: {
          $regex: new RegExp(`^${escapeRegex(normalizedName)}$`, 'i')
        }
      });

      console.log('[CATEGORY UPDATE] Duplicado existe:', !!existingCategory);

      if (existingCategory) {
        return res.status(400).json({
          ok: false,
          message: 'Ya existe otra categoría con ese nombre'
        });
      }

      category.name = normalizedName;
    }

    if (description !== undefined) {
      console.log('[CATEGORY UPDATE] Actualizando description:', description);
      category.description = description ? description.trim() : '';
    }

    if (active !== undefined) {
      console.log('[CATEGORY UPDATE] Actualizando active:', active);
      category.active = parseBoolean(active, category.active);
    }

    if (req.file && req.file.buffer) {
      console.log('[CATEGORY UPDATE] Hay imagen nueva. Subiendo...');
      const image = await uploadCategoryImage(req.file);

      console.log('[CATEGORY UPDATE] Imagen subida:', image);

      if (image) {
        category.image = image;
      }
    } else {
      console.log('[CATEGORY UPDATE] Sin imagen nueva, mantiene imagen actual');
    }

    console.log('[CATEGORY UPDATE] DATA FINAL ANTES DE SAVE:', {
      name: category.name,
      description: category.description,
      image: category.image,
      active: category.active
    });

    console.log('[CATEGORY UPDATE] Guardando categoría...');

    await category.save();

    console.log('[CATEGORY UPDATE] GUARDADO OK:', category._id);
    console.log('[CATEGORY UPDATE] FIN OK');
    console.log('==============================');

    return res.status(200).json({
      ok: true,
      message: 'Categoría actualizada correctamente',
      category
    });
  } catch (error) {
    console.error('==============================');
    console.error('[CATEGORY UPDATE] ERROR REAL');
    console.error('NAME:', error.name);
    console.error('MESSAGE:', error.message);
    console.error('STACK:', error.stack);
    console.error('==============================');

    return res.status(500).json({
      ok: false,
      message: error.message || 'Error interno al actualizar categoría',
      errorName: error.name,
      detail: error.stack
    });
  }
};

// PATCH /api/categories/:id/deactivate
const deactivateCategory = async (req, res) => {
  console.log('==============================');
  console.log('[CATEGORY DEACTIVATE] INICIO');
  console.log('[CATEGORY DEACTIVATE] PARAMS:', req.params);

  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    console.log('[CATEGORY DEACTIVATE] Categoría encontrada:', !!category);

    if (!category) {
      return res.status(404).json({
        ok: false,
        message: 'Categoría no encontrada'
      });
    }

    category.active = false;
    await category.save();

    console.log('[CATEGORY DEACTIVATE] OK:', category._id);
    console.log('==============================');

    return res.status(200).json({
      ok: true,
      message: 'Categoría desactivada correctamente',
      category
    });
  } catch (error) {
    console.error('==============================');
    console.error('[CATEGORY DEACTIVATE] ERROR REAL');
    console.error('NAME:', error.name);
    console.error('MESSAGE:', error.message);
    console.error('STACK:', error.stack);
    console.error('==============================');

    return res.status(500).json({
      ok: false,
      message: error.message || 'Error interno al desactivar categoría',
      errorName: error.name,
      detail: error.stack
    });
  }
};

// DELETE /api/categories/:id
const deleteCategory = async (req, res) => {
  console.log('==============================');
  console.log('[CATEGORY DELETE] INICIO');
  console.log('[CATEGORY DELETE] PARAMS:', req.params);

  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    console.log('[CATEGORY DELETE] Categoría encontrada:', !!category);

    if (!category) {
      return res.status(404).json({
        ok: false,
        message: 'Categoría no encontrada'
      });
    }

    await Category.findByIdAndDelete(id);

    console.log('[CATEGORY DELETE] OK:', id);
    console.log('==============================');

    return res.status(200).json({
      ok: true,
      message: 'Categoría eliminada correctamente'
    });
  } catch (error) {
    console.error('==============================');
    console.error('[CATEGORY DELETE] ERROR REAL');
    console.error('NAME:', error.name);
    console.error('MESSAGE:', error.message);
    console.error('STACK:', error.stack);
    console.error('==============================');

    return res.status(500).json({
      ok: false,
      message: error.message || 'Error interno al eliminar categoría',
      errorName: error.name,
      detail: error.stack
    });
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deactivateCategory,
  deleteCategory
};