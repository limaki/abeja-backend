const Order = require('../models/Order');
const Product = require('../models/Product');
const buildWhatsappMessage = require('../utils/buildWhatsappMessage');

/**
 * POST /api/orders
 * Crear pedido
 */
const createOrder = async (req, res) => {
  try {
    const { customerName, customerPhone, address, notes, items } = req.body;

    if (!customerName || !customerName.trim()) {
      return res.status(400).json({
        ok: false,
        message: 'El nombre del cliente es obligatorio'
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        ok: false,
        message: 'El pedido debe tener al menos un producto'
      });
    }

    const processedItems = [];
    let total = 0;

    for (const item of items) {
      if (!item.productId || !item.quantity) {
        return res.status(400).json({
          ok: false,
          message: 'Cada item debe tener productId y quantity'
        });
      }

      const product = await Product.findById(item.productId).populate('category');

      if (!product) {
        return res.status(404).json({
          ok: false,
          message: `Producto no encontrado: ${item.productId}`
        });
      }

      if (!product.active) {
        return res.status(400).json({
          ok: false,
          message: `El producto "${product.name}" está inactivo`
        });
      }

      const quantity = Number(item.quantity);

      if (quantity <= 0) {
        return res.status(400).json({
          ok: false,
          message: `Cantidad inválida para el producto "${product.name}"`
        });
      }

      if (product.stock < quantity) {
        return res.status(400).json({
          ok: false,
          message: `Stock insuficiente para "${product.name}"`
        });
      }

      const subtotal = product.price * quantity;
      total += subtotal;

      processedItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity,
        subtotal,
        image: product.image || '',
        category: product.category ? product.category.name : ''
      });

      product.stock -= quantity;
      await product.save();
    }

    const alias = process.env.TRANSFER_ALIAS || 'tu.alias.mp';
    const whatsappPhone = process.env.WHATSAPP_PHONE || '5491100000000';

    const order = await Order.create({
      userId: req.user ? req.user.id : null,
      customerName: customerName.trim(),
      customerPhone: customerPhone ? customerPhone.trim() : '',
      address: address ? address.trim() : '',
      notes: notes ? notes.trim() : '',
      items: processedItems,
      total,
      alias,
      status: 'pending'
    });

    const whatsappMessage = buildWhatsappMessage({
      orderId: order._id,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      address: order.address,
      notes: order.notes,
      items: order.items,
      total: order.total,
      alias: order.alias
    });

    const whatsappLink = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappMessage)}`;

    return res.status(201).json({
      ok: true,
      message: 'Pedido creado correctamente',
      order,
      whatsappLink
    });
  } catch (error) {
    console.error('Error en createOrder:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno al crear pedido'
    });
  }
};

/**
 * GET /api/orders
 * Listar todos los pedidos
 * Solo admin
 */
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      ok: true,
      orders
    });
  } catch (error) {
    console.error('Error en getOrders:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno al obtener pedidos'
    });
  }
};

/**
 * GET /api/orders/my-orders
 * Pedidos del usuario logueado
 */
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });

    return res.status(200).json({
      ok: true,
      orders
    });
  } catch (error) {
    console.error('Error en getMyOrders:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno al obtener tus pedidos'
    });
  }
};

/**
 * GET /api/orders/:id
 * Obtener pedido por ID
 */
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id).populate('userId', 'name email role');

    if (!order) {
      return res.status(404).json({
        ok: false,
        message: 'Pedido no encontrado'
      });
    }

    const isOwner = order.userId && req.user && order.userId._id.toString() === req.user.id;
    const isAdmin = req.user && req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        ok: false,
        message: 'No tenés permiso para ver este pedido'
      });
    }

    return res.status(200).json({
      ok: true,
      order
    });
  } catch (error) {
    console.error('Error en getOrderById:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno al obtener pedido'
    });
  }
};

/**
 * PATCH /api/orders/:id/status
 * Actualizar estado del pedido
 * Solo admin
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'sent_whatsapp', 'paid', 'shipped', 'delivered', 'cancelled'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        ok: false,
        message: 'Estado inválido'
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        ok: false,
        message: 'Pedido no encontrado'
      });
    }

    order.status = status;
    await order.save();

    return res.status(200).json({
      ok: true,
      message: 'Estado del pedido actualizado correctamente',
      order
    });
  } catch (error) {
    console.error('Error en updateOrderStatus:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno al actualizar estado del pedido'
    });
  }
};

/**
 * DELETE /api/orders/:id
 * Eliminar pedido
 * Solo admin
 */
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        ok: false,
        message: 'Pedido no encontrado'
      });
    }

    await Order.findByIdAndDelete(id);

    return res.status(200).json({
      ok: true,
      message: 'Pedido eliminado correctamente'
    });
  } catch (error) {
    console.error('Error en deleteOrder:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno al eliminar pedido'
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder
};