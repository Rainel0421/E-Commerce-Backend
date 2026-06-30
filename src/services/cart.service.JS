const productRepository = require('../repositories/product.repository');
const ApiError = require('../utils/ApiError');

class CartService {
  // Recibe el carrito del navegador [{ productId, quantity }] y lo valida
  // contra la base de datos. Regla de oro: el precio y el stock SIEMPRE
  // salen de la DB, nunca del cliente.
  async getCartSummary(items) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new ApiError(400, 'El carrito está vacío');
    }
    for (const item of items) {
      if (!item.productId) {
        throw new ApiError(400, 'Cada item del carrito necesita un productId');
      }
      if (item.quantity == null || Number(item.quantity) < 1) {
        throw new ApiError(400, 'La cantidad de cada item debe ser al menos 1');
      }
    }

    const ids = items.map((i) => i.productId);
    // 1 sola consulta para todos los productos del carrito
    const products = await productRepository.findManyByIds(ids);
    const byId = new Map(products.map((p) => [p.id, p]));

    const summary = {
      items: [],
      total: 0,
      issues: [], // avisos para mostrar al usuario
      valid: true, // si es false, el frontend debe pedir que ajuste el carrito
    };

    for (const { productId, quantity } of items) {
      const qty = Number(quantity);
      const product = byId.get(productId);

      if (!product) {
        summary.issues.push({
          productId,
          type: 'NOT_FOUND',
          message: 'Este producto ya no está disponible',
        });
        summary.valid = false;
        continue;
      }

      if (product.stock === 0) {
        summary.issues.push({
          productId,
          type: 'OUT_OF_STOCK',
          message: `"${product.name}" está agotado`,
          available: 0,
        });
        summary.valid = false;
      } else if (product.stock < qty) {
        summary.issues.push({
          productId,
          type: 'INSUFFICIENT_STOCK',
          message: `Solo quedan ${product.stock} de "${product.name}"`,
          available: product.stock,
        });
        summary.valid = false;
      }

      const unitPrice = Number(product.price);
      const quantityToCharge = Math.min(qty, product.stock);
      const subtotal = Math.round(unitPrice * quantityToCharge * 100) / 100;

      summary.items.push({
        productId: product.id,
        name: product.name,
        imageUrl: product.imageUrl,
        unitPrice,
        quantity: quantityToCharge,
        requestedQuantity: qty,
        subtotal,
        stock: product.stock,
      });

      summary.total += subtotal;
    }

    summary.total = Math.round(summary.total * 100) / 100;
    return summary;
  }
}

module.exports = new CartService();