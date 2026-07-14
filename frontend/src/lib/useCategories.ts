import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { ResearchCategory } from "../types";

export function useCategories() {
  const [categories, setCategories] = useState<ResearchCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<ResearchCategory[]>("/api/categories")
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading };
}
