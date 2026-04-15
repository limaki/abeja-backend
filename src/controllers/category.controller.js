const Category = require('../models/Category');

/**
 * POST /api/categories
 * Crear categoría
 */
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        ok: false,
        message: 'El nombre de la categoría es obligatorio'
      });
    }

    const normalizedName = name.trim();

    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${normalizedName}$`, 'i') }
    });

    if (existingCategory) {
      return res.status(400).json({
        ok: false,
        message: 'Ya existe una categoría con ese nombre'
      });
    }

    const category = await Category.create({
      name: normalizedName,
      description: description ? description.trim() : '',
      active: true
    });

    return res.status(201).json({
      ok: true,
      message: 'Categoría creada correctamente',
      category
    });
  } catch (error) {
    console.error('Error en createCategory:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno al crear categoría'
    });
  }
};

/**
 * GET /api/categories
 * Listar categorías
 * Query opcional: ?active=true
 */
const getCategories = async (req, res) => {
  try {
    const { active } = req.query;

    const filter = {};

    if (active === 'true') {
      filter.active = true;
    }

    if (active === 'false') {
      filter.active = false;
    }

    const categories = await Category.find(filter).sort({ name: 1 });

    return res.status(200).json({
      ok: true,
      categories
    });
  } catch (error) {
    console.error('Error en getCategories:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno al obtener categorías'
    });
  }
};

/**
 * GET /api/categories/:id
 * Obtener categoría por ID
 */
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

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
    console.error('Error en getCategoryById:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno al obtener categoría'
    });
  }
};

/**
 * PUT /api/categories/:id
 * Actualizar categoría
 */
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, active } = req.body;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        ok: false,
        message: 'Categoría no encontrada'
      });
    }

    if (name && name.trim()) {
      const normalizedName = name.trim();

      const existingCategory = await Category.findOne({
        _id: { $ne: id },
        name: { $regex: new RegExp(`^${normalizedName}$`, 'i') }
      });

      if (existingCategory) {
        return res.status(400).json({
          ok: false,
          message: 'Ya existe otra categoría con ese nombre'
        });
      }

      category.name = normalizedName;
    }

    if (description !== undefined) {
      category.description = description ? description.trim() : '';
    }

    if (active !== undefined) {
      category.active = active;
    }

    await category.save();

    return res.status(200).json({
      ok: true,
      message: 'Categoría actualizada correctamente',
      category
    });
  } catch (error) {
    console.error('Error en updateCategory:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno al actualizar categoría'
    });
  }
};

/**
 * PATCH /api/categories/:id/deactivate
 * Desactivar categoría
 */
const deactivateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        ok: false,
        message: 'Categoría no encontrada'
      });
    }

    category.active = false;
    await category.save();

    return res.status(200).json({
      ok: true,
      message: 'Categoría desactivada correctamente',
      category
    });
  } catch (error) {
    console.error('Error en deactivateCategory:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno al desactivar categoría'
    });
  }
};

/**
 * DELETE /api/categories/:id
 * Eliminar categoría
 */
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        ok: false,
        message: 'Categoría no encontrada'
      });
    }

    await Category.findByIdAndDelete(id);

    return res.status(200).json({
      ok: true,
      message: 'Categoría eliminada correctamente'
    });
  } catch (error) {
    console.error('Error en deleteCategory:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno al eliminar categoría'
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