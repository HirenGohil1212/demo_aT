export type Product = {
  id: string;
  name: string;
  category: 'Whiskey' | 'Gin' | 'Vodka' | 'Rum' | 'Tequila';
  price: number;
  image: string;
  description: string;
  details: string[];
  featured?: boolean;
  recipe: {
    name: string;
    ingredients: string[];
    instructions: string[];
  };
};

export type CartItem = {
  product: Product;
  quantity: number;
};
