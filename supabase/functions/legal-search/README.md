# Legal Search Edge Function

Cette fonction edge Supabase permet d'effectuer des recherches juridiques avancées en utilisant Gemini AI pour analyser le droit ivoirien et OHADA.

## Fonctionnalités

- 🔍 Recherche dans la bibliothèque CNDJ (https://biblio.cndj.ci/)
- 📚 Consultation des sources OHADA officielles
- 🤖 Analyse IA avec Gemini pour des réponses contextualisées
- 🌍 Support multilingue (français/anglais)
- 📖 Citations de sources juridiques précises

## Configuration

### Variables d'environnement requises

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

### Déploiement

La fonction est automatiquement déployée avec Supabase. Aucune action manuelle requise.

## Utilisation

### Endpoint

```
POST /functions/v1/legal-search
```

### Paramètres de requête

```typescript
interface SearchRequest {
  query: string;        // Question juridique (obligatoire)
  country?: string;     // Code pays (défaut: 'CI' pour Côte d'Ivoire)
  domain?: string;      // Domaine juridique (défaut: 'general')
  language?: 'fr' | 'en'; // Langue de réponse (défaut: 'fr')
}
```

### Exemple de requête

```javascript
const response = await fetch(`${SUPABASE_URL}/functions/v1/legal-search`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: "Comment créer une SARL en Côte d'Ivoire selon le droit OHADA ?",
    country: "CI",
    domain: "societes",
    language: "fr"
  })
});

const data = await response.json();
```

### Réponse

```typescript
interface SearchResponse {
  answer: string;           // Réponse IA détaillée
  sources: LegalSource[];   // Sources juridiques citées
  query: string;           // Question originale
  timestamp: string;       // Horodatage
}

interface LegalSource {
  title: string;           // Titre du document
  article?: string;        // Article spécifique
  code: string;           // Code ou loi
  url?: string;           // URL source
  excerpt: string;        // Extrait pertinent
  relevance: number;      // Score de pertinence (0-1)
}
```

## Sources de données

### Principales
- **CNDJ Côte d'Ivoire** : https://biblio.cndj.ci/
- **OHADA Officiel** : https://www.ohada.org
- **Juriscope** : https://juriscope.org

### Complémentaires
- **Droit Afrique** : https://www.droit-afrique.com
- **CCJA** : https://www.ccja.int
- **UEMOA** : https://www.uemoa.int

## Développement

### Mode développement
En l'absence de connexion aux sources externes, la fonction utilise des données mock réalistes pour le développement.

### Logs
Les erreurs sont loggées dans la console Supabase pour le debugging.

### Tests
```bash
# Tester localement avec Supabase CLI
supabase functions serve legal-search --env-file .env
```

## Sécurité

- CORS configuré pour accepter les requêtes cross-origin
- Validation des paramètres d'entrée
- Gestion d'erreurs robuste
- Rate limiting via Supabase (à configurer)

## Performance

- Recherche parallèle dans multiple sources
- Cache des résultats (à implémenter)
- Timeout configuré pour les requêtes externes
- Fallback en cas d'indisponibilité des sources