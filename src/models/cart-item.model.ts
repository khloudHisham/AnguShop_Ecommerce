export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  sku?: string;
  description?: string;
  category?: string;
}
