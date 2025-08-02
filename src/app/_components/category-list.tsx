
'use client';

import { CategorySection } from './category-section';
import type { Category, Product } from '@/types';

type CategoryListProps = {
    allCategories: Category[];
    allProducts: Product[];
}

export function CategoryList({ allCategories, allProducts }: CategoryListProps) {
    return (
        <div className="space-y-16">
            {allCategories.map((category) => {
              const categoryProducts = allProducts.filter((p) => p.category === category.name);
              return (
                <CategorySection 
                    key={category.id}
                    category={category} 
                    products={categoryProducts} 
                />
              )
            })}
        </div>
    )
}
