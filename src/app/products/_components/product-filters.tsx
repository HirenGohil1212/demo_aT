
"use client";

import { useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from 'use-debounce';
import type { Category } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


type ProductFiltersProps = {
  categories: Category[];
};

export function ProductFilters({ categories }: ProductFiltersProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sort') || 'relevance');
  
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    
    // Handle search term
    if (debouncedSearchTerm) {
      params.set('search', debouncedSearchTerm);
    } else {
      params.delete('search');
    }
    
    // Handle category
    if (selectedCategory !== 'All') {
        params.set('category', selectedCategory);
    } else {
        params.delete('category');
    }

    // Handle sort order
    if (sortOrder && sortOrder !== 'relevance') {
      params.set('sort', sortOrder);
    } else {
      params.delete('sort');
    }

    replace(`${pathname}?${params.toString()}`);
  }, [debouncedSearchTerm, selectedCategory, sortOrder, pathname, replace, searchParams]);

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8">
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search for your favorite spirit..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="flex flex-col sm:flex-row flex-wrap gap-2 justify-start items-center">
        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            <Button
            onClick={() => setSelectedCategory('All')}
            variant={selectedCategory === 'All' ? 'default' : 'outline'}
            className={cn(selectedCategory === 'All' && "bg-primary")}
            >
            All
            </Button>
            {categories.map((category) => (
            <Button
                key={category.id}
                onClick={() => setSelectedCategory(category.name)}
                variant={selectedCategory === category.name ? 'default' : 'outline'}
                className={cn(selectedCategory === category.name && "bg-primary")}
            >
                {category.name}
            </Button>
            ))}
        </div>
        <div className="w-full sm:w-auto sm:ml-auto">
             <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="price_asc">Price: Low to High</SelectItem>
                    <SelectItem value="price_desc">Price: High to Low</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>
    </div>
  );
}
