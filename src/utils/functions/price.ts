export function totalPriceofOrder(
  products: any[],
  items: { productId: string; quantity: number }[],
) {
  let total = 0;
  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) throw new Error(`Product ${item.productId} not found`);
    total += product.price * item.quantity;
  }
  return total;
}
