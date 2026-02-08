import React from 'react';
import { ArrowTopRightOnSquareIcon as ExternalLinkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  vendor?: string;
  link?: string;
  description?: string;
}

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export default function ProductCard({ product, compact = false }: ProductCardProps) {
  if (compact) {
    return (
      <a
        href={product.link || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 p-3 bg-white rounded-xl hover:shadow-xl transition-all border-3 border-gray-600 hover:border-blue-600 group"
      >
        {product.image ? (
          <div className="w-16 h-16 relative rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 border-2 border-gray-400">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-lg bg-gray-300 flex items-center justify-center flex-shrink-0 border-2 border-gray-400">
            <PhotoIcon className="h-8 w-8 text-gray-600" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 truncate">{product.name}</p>
          <p className="text-sm text-gray-700 font-medium">{product.vendor || 'KFAR Vendor'}</p>
          <p className="text-lg font-black text-blue-600">₪{product.price}</p>
        </div>
        <ExternalLinkIcon className="h-6 w-6 text-gray-600 group-hover:text-blue-600 flex-shrink-0 transition-colors" />
      </a>
    );
  }

  return (
    <div className="bg-white rounded-xl border-3 border-gray-600 overflow-hidden hover:shadow-2xl transition-all hover:border-blue-600">
      {product.image ? (
        <div className="relative h-48 bg-gray-200 border-b-3 border-gray-400">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="h-48 bg-gray-300 flex items-center justify-center border-b-3 border-gray-400">
          <PhotoIcon className="h-20 w-20 text-gray-600" />
        </div>
      )}
      <div className="p-4">
        <h6 className="font-bold text-gray-900 line-clamp-2 text-lg">{product.name}</h6>
        {product.vendor && (
          <p className="text-base text-gray-700 mt-1 font-medium">by {product.vendor}</p>
        )}
        {product.description && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{product.description}</p>
        )}
        <div className="flex items-center justify-between mt-3">
          <span className="text-2xl font-black text-blue-600">₪{product.price}</span>
          {product.link && (
            <a
              href={product.link}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-full hover:bg-blue-700 transition-colors flex items-center gap-1 shadow-md"
            >
              View <ExternalLinkIcon className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}