import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query, country = 'CI', domain = 'general', language = 'fr' }: SearchRequest = await req.json()

    if (!query || query.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get Gemini API key from environment
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: 'Gemini API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Search legal databases
    const searchResults = await searchLegalDatabases(query, country, domain)
    
    // Generate AI response with Gemini
    const aiResponse = await generateLegalResponse(query, searchResults, geminiApiKey, language)

    const response: SearchResponse = {
      answer: aiResponse.answer,
      sources: aiResponse.sources,
      query: query,
      timestamp: new Date().toISOString()
    }

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in legal-search function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function searchLegalDatabases(query: string, country: string, domain: string): Promise<any[]> {
  const searchResults = []

  try {
    // Search CNDJ Côte d'Ivoire
    const cndjResults = await searchCNDJ(query)
    searchResults.push(...cndjResults)

    // Search other OHADA sources
    const ohadaResults = await searchOHADASources(query, country)
    searchResults.push(...ohadaResults)

    // Search additional legal databases
    const additionalResults = await searchAdditionalSources(query, domain)
    searchResults.push(...additionalResults)

  } catch (error) {
    console.error('Error searching legal databases:', error)
  }

  return searchResults
}

async function searchCNDJ(query: string): Promise<any[]> {
  try {
    // Simulate search on https://biblio.cndj.ci/
    // In production, this would make actual HTTP requests to scrape or use their API
    const response = await fetch('https://biblio.cndj.ci/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Yujuris-Legal-Assistant/1.0'
      },
      body: JSON.stringify({
        q: query,
        type: 'all',
        limit: 10
      })
    }).catch(() => null)

    if (response && response.ok) {
      const data = await response.json()
      return data.results || []
    }

    // Fallback with mock data for development
    return getMockCNDJResults(query)

  } catch (error) {
    console.error('Error searching CNDJ:', error)
    return getMockCNDJResults(query)
  }
}

async function searchOHADASources(query: string, country: string): Promise<any[]> {
  const sources = [
    'https://www.ohada.org',
    'https://www.droit-afrique.com',
    'https://www.profession-juriste.ci',
    // 'https://juristic.ci',
  ]

  const results = []

  for (const source of sources) {
    try {
      // Simulate search on OHADA sources
      // In production, implement actual web scraping or API calls
      const mockResults = getMockOHADAResults(query, source)
      results.push(...mockResults)
    } catch (error) {
      console.error(`Error searching ${source}:`, error)
    }
  }

  return results
}

async function searchAdditionalSources(query: string, domain: string): Promise<any[]> {
  // Additional legal databases and sources
  const additionalSources = [
    'https://www.legifrance.gouv.fr', // For comparative law
    'https://www.ccja.int', // CCJA jurisprudence
    'https://www.uemoa.int' // UEMOA legal texts
  ]

  const results = []

  for (const source of additionalSources) {
    try {
      // Simulate search
      const mockResults = getMockAdditionalResults(query, source, domain)
      results.push(...mockResults)
    } catch (error) {
      console.error(`Error searching ${source}:`, error)
    }
  }

  return results
}

async function generateLegalResponse(
  query: string, 
  searchResults: any[], 
  apiKey: string, 
  language: string
): Promise<{ answer: string; sources: LegalSource[] }> {
  
  const prompt = buildLegalPrompt(query, searchResults, language)

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Réponse non disponible'

    // Extract sources from search results
    const sources: LegalSource[] = searchResults.slice(0, 5).map((result, index) => ({
      title: result.title || `Document juridique ${index + 1}`,
      article: result.article,
      code: result.code || 'Code non spécifié',
      url: result.url,
      excerpt: result.excerpt || result.content?.substring(0, 200) + '...',
      relevance: result.relevance || 0.8
    }))

    return {
      answer: generatedText,
      sources: sources
    }

  } catch (error) {
    console.error('Error generating AI response:', error)
    
    // Fallback response
    return {
      answer: generateFallbackResponse(query, searchResults, language),
      sources: searchResults.slice(0, 3).map((result, index) => ({
        title: result.title || `Source juridique ${index + 1}`,
        article: result.article,
        code: result.code || 'OHADA',
        url: result.url,
        excerpt: result.excerpt || 'Extrait non disponible',
        relevance: 0.7
      }))
    }
  }
}

function buildLegalPrompt(query: string, searchResults: any[], language: string): string {
  const lang = language === 'en' ? 'English' : 'French'
  const context = searchResults.map(result => 
    `- ${result.title}: ${result.excerpt || result.content?.substring(0, 300)}`
  ).join('\n')

  return `
Tu es un assistant juridique expert spécialisé en droit OHADA et droit ivoirien. 
Réponds à la question suivante en te basant sur les sources juridiques fournies.

Question: ${query}

Sources juridiques disponibles:
${context}

Instructions:
1. Fournis une réponse complète et précise en ${lang}
2. Cite les articles et textes juridiques pertinents
3. Structure ta réponse avec des sections claires
4. Inclus des conseils pratiques si approprié
5. Mentionne les références OHADA quand c'est pertinent
6. Utilise un ton professionnel mais accessible

Réponse:
`
}

function generateFallbackResponse(query: string, searchResults: any[], language: string): string {
  const isEnglish = language === 'en'
  
  if (isEnglish) {
    return `**Legal Analysis - OHADA Law**

Regarding your question "${query}", here are the relevant legal elements based on OHADA legislation:

**🏛️ Applicable Legal Framework:**
OHADA acts establish a harmonized legal framework for the 17 member states. Several texts may apply depending on the specific context.

**📚 Fundamental Principles:**
• **Legal Security**: Uniform acts prevail over national legislation
• **Harmonization**: Identical rules across all member states
• **Modernization**: Adaptation to African economic realities

**⚖️ Practical Recommendations:**
1. **Compliance verification** with current OHADA texts
2. **Appropriate documentation** of all legal acts
3. **Respect for procedures** established by uniform acts
4. **Legal consultation** for complex cases

For a more detailed analysis of your specific situation, I recommend providing more details about the legal context and the country concerned.`
  }

  return `**Analyse juridique OHADA**

Concernant votre question "${query}", voici les éléments juridiques pertinents basés sur la législation OHADA :

**🏛️ Cadre légal applicable :**
Les actes uniformes OHADA établissent un cadre juridique harmonisé pour les 17 États membres. Plusieurs textes peuvent s'appliquer selon le contexte spécifique.

**📚 Principes fondamentaux :**
• **Sécurité juridique** : Les actes uniformes prévalent sur les législations nationales
• **Harmonisation** : Règles identiques dans tous les États parties
• **Modernisation** : Adaptation aux réalités économiques africaines

**⚖️ Recommandations pratiques :**
1. **Vérification de conformité** avec les textes OHADA en vigueur
2. **Documentation appropriée** de tous les actes juridiques
3. **Respect des procédures** établies par les actes uniformes
4. **Consultation juridique** pour les cas complexes

Pour une analyse plus approfondie de votre situation spécifique, je recommande de fournir plus de détails sur le contexte juridique et le pays concerné.`
}

// Mock data functions for development
function getMockCNDJResults(query: string): any[] {
  return [
    {
      title: "Code civil ivoirien - Obligations contractuelles",
      article: "Article 1134",
      code: "Code civil CI",
      url: "https://biblio.cndj.ci/doc/code-civil-1134",
      excerpt: "Les conventions légalement formées tiennent lieu de loi à ceux qui les ont faites...",
      content: "Texte complet de l'article sur les obligations contractuelles",
      relevance: 0.9
    },
    {
      title: "Loi sur les sociétés commerciales en Côte d'Ivoire",
      article: "Article 15",
      code: "Loi n°2014-138",
      url: "https://biblio.cndj.ci/doc/societes-commerciales",
      excerpt: "Toute société commerciale doit être immatriculée au registre du commerce...",
      content: "Dispositions relatives à l'immatriculation des sociétés",
      relevance: 0.85
    }
  ]
}

function getMockOHADAResults(query: string, source: string): any[] {
  return [
    {
      title: "Acte uniforme relatif au droit des sociétés commerciales",
      article: "Article 5",
      code: "OHADA - AUDSCGIE",
      url: `${source}/audscgie/article-5`,
      excerpt: "La société commerciale est créée par deux ou plusieurs personnes...",
      content: "Conditions de création des sociétés commerciales OHADA",
      relevance: 0.88
    }
  ]
}

function getMockAdditionalResults(query: string, source: string, domain: string): any[] {
  return [
    {
      title: "Jurisprudence CCJA - Droit commercial",
      article: "Arrêt n°001/2023",
      code: "CCJA",
      url: `${source}/jurisprudence/001-2023`,
      excerpt: "La Cour considère que les dispositions de l'acte uniforme...",
      content: "Jurisprudence récente sur l'application du droit OHADA",
      relevance: 0.75
    }
  ]
}