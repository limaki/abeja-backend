const Product = require('../models/Product');
const Category = require('../models/Category');
const uploadBufferToCloudinary = require('../utils/uploadToCloudinary');

/**
 * POST /api/products
 * Crear producto
 */
const createProduct = async (req, res) => {
  try {
    console.log('=== CREATE PRODUCT DEBUG ===');
    console.log('headers content-type:', req.headers['content-type']);
    console.log('body:', req.body);
    console.log('file exists?', !!req.file);
    console.log('file:', req.file);

    const {
      name,
      description,
      price,
      stock,
      category,
      active,
      featured
    } = req.body || {};

    if (!name || !name.trim()) {
      return res.status(400).json({ ok: false, message: 'El nombre del producto es obligatorio' });
    }

    let image = '';

    if (req.file?.buffer) {
      console.log('buffer length:', req.file.buffer.length);

      const uploaded = await uploadBufferToCloudinary(req.file.buffer, {
        public_id: `product-${Date.now()}`
      });

      console.log('cloudinary secure_url:', uploaded.secure_url);
      image = uploaded.secure_url;
    }

    const product = await Product.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      price: Number(price),
      stock: Number(stock),
      image,
      category,
      active: active !== undefined ? active === 'true' || active === true : true,
      featured: featured !== undefined ? featured === 'true' || featured === true : false
    });

    return res.status(201).json({
      ok: true,
      message: 'Producto creado correctamente',
      product
    });
  } catch (error) {
    console.error('Error en createProduct:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno al crear producto'
    });
  }
};

/**
 * GET /api/products
 * Query opcional:
 * ?active=true
 * ?category=ID_CATEGORIA
 * ?featured=true
 */
const getProducts = async (req, res) => {
  try {
    const { active, category, featured } = req.query;
    const filter = {};

    if (active === 'true') filter.active = true;
    if (active === 'false') filter.active = false;

    if (featured === 'true') filter.featured = true;
    if (featured === 'false') filter.featured = false;

    if (category) {
      filter.category = category;
    }

    const products = await Product.find(filter)
      .populate('category')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      ok: true,
      products
    });
  } catch (error) {
    console.error('Error en getProducts:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno al obtener productos'
    });
  }
};

/**
 * GET /api/products/featured
 */
const getFeaturedProducts = async (_req, res) => {
  try {
    const products = await Product.find({
      active: true,
      featured: true
    })
      .populate('category')
      .sort({ createdAt: -1 })
      .limit(8);

    return res.status(200).json({
      ok: true,
      products
    });
  } catch (error) {
    console.error('Error en getFeaturedProducts:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno al obtener productos destacados'
    });
  }
};

/**
 * GET /api/products/:id
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id).populate('category');

    if (!product) {
      return res.status(404).json({
        ok: false,
        message: 'Producto no encontrado'
      });
    }

    return res.status(200).json({
      ok: true,
      product
    });
  } catch (error) {
    console.error('Error en getProductById:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno al obtener producto'
    });
  }
};

/**
 * PUT /api/products/:id
 */
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      stock,
      category,
      active,
      featured
    } = req.body || {};

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        ok: false,
        message: 'Producto no encontrado'
      });
    }

    if (category) {
      const existingCategory = await Category.findById(category);

      if (!existingCategory) {
        return res.status(404).json({
          ok: false,
          message: 'La categoría seleccionada no existe'
        });
      }

      if (!existingCategory.active) {
        return res.status(400).json({
          ok: false,
          message: 'La categoría seleccionada está inactiva'
        });
      }

      product.category = category;
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          ok: false,
          message: 'El nombre del producto no puede estar vacío'
        });
      }
      product.name = name.trim();
    }

    if (description !== undefined) {
      product.description = description ? description.trim() : '';
    }

    if (price !== undefined) {
      if (isNaN(Number(price))) {
        return res.status(400).json({
          ok: false,
          message: 'El precio debe ser numérico'
        });
      }
      product.price = Number(price);
    }

    if (stock !== undefined) {
      if (isNaN(Number(stock))) {
        return res.status(400).json({
          ok: false,
          message: 'El stock debe ser numérico'
        });
      }
      product.stock = Number(stock);
    }

    if (active !== undefined) {
      product.active = active === 'true' || active === true;
    }

    if (featured !== undefined) {
      product.featured = featured === 'true' || featured === true;
    }

    if (req.file?.buffer) {
      const uploaded = await uploadBufferToCloudinary(req.file.buffer, {
        public_id: `product-${Date.now()}`
      });

      product.image = uploaded.secure_url;
    }

    await product.save();

    const updatedProduct = await Product.findById(product._id).populate('category');

    return res.status(200).json({
      ok: true,
      message: 'Producto actualizado correctamente',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Error en updateProduct:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno al actualizar producto'
    });
  }
};

/**
 * PATCH /api/products/:id/deactivate
 */
const deactivateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        ok: false,
        message: 'Producto no encontrado'
      });
    }

    product.active = false;
    await product.save();

    return res.status(200).json({
      ok: true,
      message: 'Producto desactivado correctamente',
      product
    });
  } catch (error) {
    console.error('Error en deactivateProduct:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno al desactivar producto'
    });
  }
};

/**
 * DELETE /api/products/:id
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        ok: false,
        message: 'Producto no encontrado'
      });
    }

    await Product.findByIdAndDelete(id);

    return res.status(200).json({
      ok: true,
      message: 'Producto eliminado correctamente'
    });
  } catch (error) {
    console.error('Error en deleteProduct:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno al eliminar producto'
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getFeaturedProducts,
  getProductById,
  updateProduct,
  deactivateProduct,
  deleteProduct
};