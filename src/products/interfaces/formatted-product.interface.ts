export interface FormattedProduct {
  id: number;
  title: string;
  description: string;
  releaseDate: string;
  price: number;
  category: string;
  stock: number;
  isOnSale: boolean;
  discountValue: number | null;
  imageUrl: string | null;
}
