import { useState, useEffect } from "react";

interface Category {
  id: string;
  name: string;
}

export function useProductCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/product-category")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.items || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
        setLoading(false);
      });
  }, []);

  return { categories, loading };
}
