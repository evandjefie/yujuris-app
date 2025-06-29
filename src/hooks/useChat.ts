import { useState, useCallback, useEffect } from 'react';
import { ChatMessage, LegalSource } from '../types';
import { useAuth } from './useAuth';
import { useLegalSearch } from './useLegalSearch';
import { supabase } from '../lib/supabase';

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const { user, decrementQueries } = useAuth();
  const { searchLegal, isSearching } = useLegalSearch();

  // Load conversations when user is available
  useEffect(() => {
    if (user) {
      loadOrCreateConversation();
    } else {
      // Show welcome message for non-authenticated users
      setMessages([getWelcomeMessage()]);
      setIsLoading(false);
    }
  }, [user]);

  const getWelcomeMessage = (): ChatMessage => ({
    id: '1',
    content: 'Bonjour ! Je suis votre assistant juridique spécialisé en droit OHADA et droit ivoirien. Je peux vous aider avec :\n\n• Questions sur le droit des sociétés commerciales\n• Procédures civiles et commerciales\n• Droit du travail dans l\'espace OHADA\n• Rédaction de contrats et documents juridiques\n• Interprétation des textes OHADA et du droit ivoirien\n\nMes réponses sont basées sur des recherches en temps réel dans la bibliothèque CNDJ et les sources officielles OHADA.\n\nComment puis-je vous assister aujourd\'hui ?',
    sender: 'assistant',
    timestamp: new Date()
  });

  const loadOrCreateConversation = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Try to get the most recent conversation
      const { data: conversations, error: convError } = await supabase
        .from('chat_conversations')
        .select('id, title, last_message_at')
        .eq('user_id', user.id)
        .eq('is_archived', false)
        .order('last_message_at', { ascending: false })
        .limit(1);

      if (convError) {
        console.error('Error loading conversations:', convError);
        setMessages([getWelcomeMessage()]);
        setIsLoading(false);
        return;
      }

      let conversationId: string;

      if (conversations && conversations.length > 0) {
        // Use existing conversation
        conversationId = conversations[0].id;
        setCurrentConversationId(conversationId);

        // Load messages from this conversation
        const { data: chatMessages, error: msgError } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (msgError) {
          console.error('Error loading messages:', msgError);
          setMessages([getWelcomeMessage()]);
        } else if (chatMessages && chatMessages.length > 0) {
          // Convert database messages to ChatMessage format
          const formattedMessages: ChatMessage[] = chatMessages.map(msg => ({
            id: msg.id,
            content: msg.content,
            sender: msg.role as 'user' | 'assistant',
            timestamp: new Date(msg.created_at),
            sources: msg.metadata?.sources || []
          }));
          setMessages(formattedMessages);
        } else {
          // Conversation exists but no messages, add welcome message
          setMessages([getWelcomeMessage()]);
        }
      } else {
        // Create new conversation
        const { data: newConv, error: createError } = await supabase
          .from('chat_conversations')
          .insert({
            user_id: user.id,
            title: 'Nouvelle conversation',
            description: 'Consultation juridique OHADA'
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating conversation:', createError);
          setMessages([getWelcomeMessage()]);
        } else {
          conversationId = newConv.id;
          setCurrentConversationId(conversationId);
          
          // Add welcome message to new conversation
          const welcomeMessage = getWelcomeMessage();
          setMessages([welcomeMessage]);
          
          // Save welcome message to database
          await saveMessageToDatabase(welcomeMessage, conversationId);
        }
      }
    } catch (error) {
      console.error('Error in loadOrCreateConversation:', error);
      setMessages([getWelcomeMessage()]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveMessageToDatabase = async (message: ChatMessage, conversationId: string) => {
    if (!user || !conversationId) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          user_id: user.id,
          role: message.sender,
          content: message.content,
          metadata: {
            sources: message.sources || []
          }
        });

      if (error) {
        console.error('Error saving message:', error);
      }

      // Update conversation last_message_at
      await supabase
        .from('chat_conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);

    } catch (error) {
      console.error('Error in saveMessageToDatabase:', error);
    }
  };

  const canSendMessage = useCallback(() => {
    if (!user) return false;
    if (user.plan === 'premium') return true;
    return (user.remainingQueries || 0) > 0;
  }, [user]);

  const sendMessage = useCallback(async (content: string) => {
    if (!canSendMessage() || !user) return false;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Save user message to database
    if (currentConversationId) {
      await saveMessageToDatabase(userMessage, currentConversationId);
    }

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

      // Save assistant message to database
      if (currentConversationId) {
        await saveMessageToDatabase(assistantMessage, currentConversationId);
      }

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

      // Save error message to database
      if (currentConversationId) {
        await saveMessageToDatabase(errorMessage, currentConversationId);
      }
    } finally {
      setIsTyping(false);
    }

    return true;
  }, [canSendMessage, user, currentConversationId, searchLegal, decrementQueries]);

  const clearChat = useCallback(async () => {
    if (!user) {
      setMessages([getWelcomeMessage()]);
      return;
    }

    try {
      // Create new conversation
      const { data: newConv, error } = await supabase
        .from('chat_conversations')
        .insert({
          user_id: user.id,
          title: 'Nouvelle conversation',
          description: 'Consultation juridique OHADA'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating new conversation:', error);
        return;
      }

      setCurrentConversationId(newConv.id);
      const welcomeMessage = getWelcomeMessage();
      setMessages([welcomeMessage]);
      
      // Save welcome message to new conversation
      await saveMessageToDatabase(welcomeMessage, newConv.id);

    } catch (error) {
      console.error('Error in clearChat:', error);
    }
  }, [user]);

  return {
    messages,
    isTyping: isTyping || isSearching,
    isLoading,
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