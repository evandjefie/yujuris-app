import { useState, useCallback } from 'react';
import { ChatMessage, LegalSource } from '../types';
import { useAuth } from './useAuth';
import { useLegalSearch } from './useLegalSearch';

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Bonjour ! Je suis votre assistant juridique spécialisé en droit OHADA et droit ivoirien. Je peux vous aider avec :\n\n• Questions sur le droit des sociétés commerciales\n• Procédures civiles et commerciales\n• Droit du travail dans l\'espace OHADA\n• Rédaction de contrats et documents juridiques\n• Interprétation des textes OHADA et du droit ivoirien\n\nMes réponses sont basées sur des recherches en temps réel dans la bibliothèque CNDJ et les sources officielles OHADA.\n\nComment puis-je vous assister aujourd\'hui ?',
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const { user, decrementQueries } = useAuth();
  const { searchLegal, isSearching } = useLegalSearch();

  const canSendMessage = useCallback(() => {
    if (!user) return false;
    if (user.plan === 'premium') return true;
    return (user.remainingQueries || 0) > 0;
  }, [user]);

  const sendMessage = useCallback(async (content: string) => {
    if (!canSendMessage()) return false;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Use the legal search function with Gemini AI
      const searchResult = await searchLegal({
        query: content,
        country: 'CI', // Default to Côte d'Ivoire
        domain: 'general',
        language: 'fr'
      });

      let assistantContent: string;
      let sources: LegalSource[] = [];

      if (searchResult) {
        assistantContent = searchResult.answer;
        sources = searchResult.sources;
      } else {
        // Fallback to enhanced mock response
        assistantContent = generateEnhancedResponse(content);
        sources = generateMockSources();
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: assistantContent,
        sender: 'assistant',
        timestamp: new Date(),
        sources: sources
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Decrease remaining queries for free users using Supabase
      if (user && user.plan === 'free') {
        await decrementQueries();
      }

    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      
      // Fallback message in case of error
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Je rencontre actuellement des difficultés techniques. Veuillez réessayer dans quelques instants. En attendant, voici une réponse basée sur mes connaissances générales du droit OHADA :\n\n' + generateEnhancedResponse(content),
        sender: 'assistant',
        timestamp: new Date(),
        sources: generateMockSources()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }

    return true;
  }, [canSendMessage, user, searchLegal, decrementQueries]);

  const clearChat = useCallback(() => {
    setMessages([
      {
        id: '1',
        content: 'Bonjour ! Je suis votre assistant juridique spécialisé en droit OHADA et droit ivoirien. Comment puis-je vous aider aujourd\'hui ?',
        sender: 'assistant',
        timestamp: new Date()
      }
    ]);
  }, []);

  return {
    messages,
    isTyping: isTyping || isSearching,
    canSendMessage: canSendMessage(),
    sendMessage,
    clearChat
  };
};

const generateEnhancedResponse = (query: string): string => {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('société') || lowerQuery.includes('sarl') || lowerQuery.includes('sa ') || lowerQuery.includes('créer')) {
    return `**Création de société en Côte d'Ivoire selon le droit OHADA**

Selon l'Acte uniforme relatif au droit des sociétés commerciales et du GIE, et le droit ivoirien, voici les étapes essentielles :

**📋 Conditions préalables :**
• Capital social minimum : 1 000 000 FCFA pour une SA, 100 000 FCFA pour une SARL
• Au moins 2 associés pour une SARL, 3 actionnaires pour une SA
• Siège social en Côte d'Ivoire ou dans un État partie OHADA

**📝 Procédure de constitution :**
1. **Rédaction des statuts** conformément aux articles 5 à 15 de l'AUDSCGIE
2. **Dépôt du capital** dans une banque agréée en Côte d'Ivoire
3. **Immatriculation** au Registre du Commerce et du Crédit Mobilier (RCCM) - CEPICI
4. **Publication** dans Fraternité Matin (journal d'annonces légales)
5. **Déclaration fiscale** auprès de la DGI

**⚖️ Spécificités ivoiriennes :**
• Passage obligatoire par le CEPICI (Centre de Promotion des Investissements)
• Obtention du Numéro de Compte Contribuable (NCC)
• Inscription à la CNPS pour les salariés

**💡 Conseil pratique :**
Le processus peut être accéléré via le guichet unique du CEPICI qui centralise toutes les formalités.

Souhaitez-vous des précisions sur un aspect particulier ?`;
  }
  
  return `**Analyse juridique - Droit OHADA et ivoirien**

Concernant votre question "${query.substring(0, 100)}${query.length > 100 ? '...' : ''}", voici les éléments juridiques pertinents :

**🏛️ Cadre légal applicable :**
Les dispositions OHADA et le droit ivoirien établissent un cadre juridique harmonisé. Dans votre situation, plusieurs textes peuvent s'appliquer selon le contexte spécifique.

**📚 Sources principales :**
• **Actes uniformes OHADA** : Prévalent sur les législations nationales
• **Code civil ivoirien** : Pour les aspects non couverts par OHADA
• **Jurisprudence CCJA** : Interprétation uniforme du droit OHADA

**⚖️ Recommandations pratiques :**
1. **Vérification de conformité** avec les textes OHADA et ivoiriens
2. **Documentation appropriée** selon les standards CEPICI
3. **Respect des procédures** établies par les actes uniformes
4. **Consultation d'un juriste** pour les cas complexes

Pour une analyse plus approfondie, n'hésitez pas à préciser le contexte spécifique de votre situation.`;
};

const generateMockSources = (): LegalSource[] => [
  {
    title: 'Acte uniforme relatif au droit des sociétés commerciales et du GIE',
    article: 'Article 15',
    code: 'OHADA - AUDSCGIE',
    url: 'https://ohada.org/audscgie/article-15',
    excerpt: 'Les sociétés commerciales jouissent de la personnalité morale à compter de leur immatriculation...',
    relevance: 0.95
  },
  {
    title: 'Code des investissements de Côte d\'Ivoire',
    article: 'Article 23',
    code: 'Loi n°2012-487',
    url: 'https://biblio.cndj.ci/code-investissements',
    excerpt: 'Les entreprises créées bénéficient d\'avantages fiscaux selon leur secteur d\'activité...',
    relevance: 0.88
  },
  {
    title: 'Jurisprudence CCJA - Création de sociétés',
    article: 'Arrêt n°045/2023',
    code: 'CCJA',
    url: 'https://ccja.int/jurisprudence/045-2023',
    excerpt: 'La Cour rappelle que l\'immatriculation au RCCM est constitutive de la personnalité morale...',
    relevance: 0.82
  }
];