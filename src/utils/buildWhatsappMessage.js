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
  let message = `Hola, quiero realizar este pedido:\n\n`;
  message += `Pedido N°: ${orderId}\n\n`;

  items.forEach((item) => {
    message += `- ${item.name} x${item.quantity} = $${item.subtotal}\n`;
  });

  message += `\nTotal: $${total}\n`;
  message += `Alias para transferir: ${alias}\n\n`;
  message += `Nombre: ${customerName}\n`;

  if (customerPhone) {
    message += `Teléfono: ${customerPhone}\n`;
  }

  if (address) {
    message += `Dirección: ${address}\n`;
  }

  if (notes) {
    message += `Observaciones: ${notes}\n`;
  }

  return message;
};

module.exports = buildWhatsappMessage;