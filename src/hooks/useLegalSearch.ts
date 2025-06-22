import { useState } from 'react';

interface SearchRequest {
  query: string;
  country?: string;
  domain?: string;
  language?: 'fr' | 'en';
}

interface LegalSource {
  title: string;
  article?: string;
  code: string;
  url?: string;
  excerpt: string;
  relevance: number;
}

interface SearchResponse {
  answer: string;
  sources: LegalSource[];
  query: string;
  timestamp: string;
}

export const useLegalSearch = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchLegal = async (request: SearchRequest): Promise<SearchResponse | null> => {
    setIsSearching(true);
    setError(null);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Configuration Supabase manquante');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/legal-search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
      }

      const data: SearchResponse = await response.json();
      return data;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('Erreur recherche juridique:', err);
      return null;
    } finally {
      setIsSearching(false);
    }
  };

  return {
    searchLegal,
    isSearching,
    error
  };
};