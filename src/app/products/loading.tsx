
import { Skeleton } from "@/components/ui/skeleton"
import { ProductCardSkeleton } from "@/components/product-card-skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-10 w-1/2 mx-auto mb-8" />

      {/* Filters Skeleton */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <Skeleton className="h-10 flex-grow" />
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 justify-start items-center">
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <Skeleton className="h-10 w-16" />
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-28" />
            </div>
            <div className="w-full sm:w-auto sm:ml-auto">
                <Skeleton className="h-10 w-full sm:w-[180px]" />
            </div>
        </div>
      </div>

      {/* Products Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
