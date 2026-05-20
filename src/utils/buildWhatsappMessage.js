const buildWhatsappMessage = ({
  orderId,
  customerName,
  customerPhone,
  address,
  notes,
  shippingMethod,
  items,
  total,
  alias
}) => {
  const transferAlias = alias || 'flores.modas';

  const formatMoney = (value) => {
    const number = Number(value) || 0;
    return `$${number.toLocaleString('es-AR')}`;
  };

  let message = `Hola! Quiero confirmar el siguiente pedido:\n\n`;

  message += `PEDIDO N: #${orderId}\n`;
  message += `--------------------------------\n`;
  message += `DETALLE DEL PEDIDO\n\n`;

  items.forEach((item, index) => {
    const name = item.name || 'Producto';
    const quantity = Number(item.quantity) || 0;
    const subtotal = item.subtotal ?? 0;

    message += `${index + 1}. ${name}\n`;
    message += `Cantidad: ${quantity}\n`;
    message += `Subtotal: ${formatMoney(subtotal)}\n\n`;
  });

  message += `--------------------------------\n`;
  message += `TOTAL A PAGAR: ${formatMoney(total)}\n`;
  message += `--------------------------------\n\n`;

  message += `IMPORTANTE - DATOS PARA PAGAR\n`;
  message += `Medios de pago disponibles:\n`;
  message += `- Credito\n`;
  message += `- Debito\n`;
  message += `- Mercado Pago\n\n`;

  message += `Para pagar por transferencia o Mercado Pago:\n`;
  message += `ALIAS: ${transferAlias}\n`;
  message += `MONTO A TRANSFERIR: ${formatMoney(total)}\n\n`;

  message += `Por favor, enviar el comprobante por este chat para confirmar el pedido.\n\n`;

  message += `--------------------------------\n`;
  message += `DATOS DEL CLIENTE\n`;
  message += `Nombre: ${customerName || '-'}\n`;

  if (customerPhone) {
    message += `Telefono: ${customerPhone}\n`;
  }

  if (address) {
    message += `Direccion: ${address}\n`;
  }

  if (shippingMethod) {
    message += `Metodo de envio: ${shippingMethod}\n`;
  }

  if (notes) {
    message += `Observaciones: ${notes}\n`;
  }

  message += `\nQuedo atento/a a la confirmacion. Gracias!`;

  return message;
};

module.exports = buildWhatsappMessage;