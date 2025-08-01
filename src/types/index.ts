
export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number; // e.g., 750 for 750ml
  image: string;
  description: string;
  details?: string[];
  featured?: boolean;
  recipe?: {
    name: string;
    ingredients: string[];
    instructions: string[];
  };
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type Category = {
  id: string;
  name: string;
};

export type Banner = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  productId: string;
  active: boolean;
  createdAt: string; // Changed to string for serializability
}

export type AppSettings = {
  allowSignups: boolean;
  whatsappNumber: string;
};
