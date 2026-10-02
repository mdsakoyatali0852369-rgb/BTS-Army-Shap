import React, { useEffect, useState } from 'react';
import { getCategories } from '../firebase/services';
import { Category } from '../firebase/types';
import { ShopPage } from './ShopPage';

interface CategoryPageProps {
  slug: string;
  navigate: (path: string) => void;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({ slug, navigate }) => {
  const [categoryName, setCategoryName] = useState<string>('');

  useEffect(() => {
    getCategories().then((cats) => {
      const match = cats.find((c) => c.slug.toLowerCase() === slug.toLowerCase());
      if (match) {
        setCategoryName(match.name);
      } else {
        // Fallback: titleize slug like 't-shirts' -> 'T-Shirts'
        setCategoryName(
          slug
            .split('-')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ')
        );
      }
    });
  }, [slug]);

  return <ShopPage navigate={navigate} initialCategory={categoryName} />;
};
