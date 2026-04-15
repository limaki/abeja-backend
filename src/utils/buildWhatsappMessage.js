const buildWhatsappMessage = ({
  orderId,
  customerName,
  customerPhone,
  address,
  notes,
  items,
  total,
  alias
}) => {
  const formatMoney = (value) => {
    const number = Number(value) || 0;
    return `$${number.toLocaleString('es-AR')}`;
  };

  let message = `¡Hola! Quiero confirmar el siguiente pedido:\n\n`;

  message += `🧾 Pedido N°: ${orderId}\n`;
  message += `━━━━━━━━━━━━━━\n`;
  message += `📦 Detalle del pedido\n`;

  items.forEach((item, index) => {
    const name = item.name || 'Producto';
    const quantity = Number(item.quantity) || 0;
    const subtotal = item.subtotal ?? 0;

    message += `${index + 1}. ${name}\n`;
    message += `   Cantidad: ${quantity}\n`;
    message += `   Subtotal: ${formatMoney(subtotal)}\n`;
  });

  message += `━━━━━━━━━━━━━━\n`;
  message += `💰 Total: ${formatMoney(total)}\n`;

  if (alias) {
    message += `🏦 Alias para transferir: ${alias}\n`;
  }

  message += `\n👤 Datos del cliente\n`;
  message += `Nombre: ${customerName || '-'}\n`;

  if (customerPhone) {
    message += `Teléfono: ${customerPhone}\n`;
  }

  if (address) {
    message += `Dirección: ${address}\n`;
  }

  if (notes) {
    message += `Observaciones: ${notes}\n`;
  }

  message += `\nQuedo atento/a a la confirmación. ¡Gracias!`;

  return message;
};

module.exports = buildWhatsappMessage;