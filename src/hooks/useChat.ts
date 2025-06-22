import { useState, useCallback } from 'react';
import { ChatMessage, LegalSource } from '../types';
import { useAuth } from './useAuth';

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Bonjour ! Je suis votre assistant juridique spécialisé en droit OHADA. Je peux vous aider avec :\n\n• Questions sur le droit des sociétés commerciales\n• Procédures civiles et commerciales\n• Droit du travail dans l\'espace OHADA\n• Rédaction de contrats et documents juridiques\n• Interprétation des textes OHADA\n\nComment puis-je vous assister aujourd\'hui ?',
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const { user } = useAuth();

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

    // Simulate API call with realistic delay
    setTimeout(() => {
      const mockSources: LegalSource[] = [
        {
          title: 'Acte uniforme relatif au droit des sociétés commerciales et du GIE',
          article: 'Article 15',
          code: 'OHADA - AUDSCGIE',
          url: 'https://ohada.org'
        },
        {
          title: 'Acte uniforme relatif au droit commercial général',
          article: 'Article 23',
          code: 'OHADA - AUDCG',
          url: 'https://ohada.org'
        }
      ];

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: generateEnhancedResponse(content),
        sender: 'assistant',
        timestamp: new Date(),
        sources: mockSources
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);

      // Decrease remaining queries for free users
      if (user && user.plan === 'free' && user.remainingQueries) {
        const updatedUser = { ...user, remainingQueries: user.remainingQueries - 1 };
        localStorage.setItem('yujuris_user', JSON.stringify(updatedUser));
        // Force re-render by updating the user in auth context would be better
      }
    }, 2500);

    return true;
  }, [canSendMessage, user]);

  const clearChat = useCallback(() => {
    setMessages([
      {
        id: '1',
        content: 'Bonjour ! Je suis votre assistant juridique spécialisé en droit OHADA. Comment puis-je vous aider aujourd\'hui ?',
        sender: 'assistant',
        timestamp: new Date()
      }
    ]);
  }, []);

  return {
    messages,
    isTyping,
    canSendMessage: canSendMessage(),
    sendMessage,
    clearChat
  };
};

const generateEnhancedResponse = (query: string): string => {
  const lowerQuery = query.toLowerCase();
  
  // More sophisticated response generation based on keywords
  if (lowerQuery.includes('société') || lowerQuery.includes('sarl') || lowerQuery.includes('sa ') || lowerQuery.includes('créer')) {
    return `**Création de société dans l'espace OHADA**

Selon l'Acte uniforme relatif au droit des sociétés commerciales et du GIE, voici les étapes essentielles :

**📋 Conditions préalables :**
• Capital social minimum : 1 000 000 FCFA pour une SA, 100 000 FCFA pour une SARL
• Au moins 2 associés pour une SARL, 3 actionnaires pour une SA
• Siège social dans un État partie OHADA

**📝 Procédure de constitution :**
1. **Rédaction des statuts** conformément aux articles 5 à 15 de l'AUDSCGIE
2. **Dépôt du capital** dans une banque agréée
3. **Immatriculation** au Registre du Commerce et du Crédit Mobilier (RCCM)
4. **Publication** dans un journal d'annonces légales

**⚖️ Obligations légales :**
• Tenue d'une comptabilité selon le SYSCOHADA
• Assemblées générales annuelles obligatoires
• Dépôt des comptes annuels au greffe

**💡 Conseil pratique :**
Je recommande de faire appel à un notaire pour la rédaction des statuts afin d'assurer leur conformité avec la législation OHADA.

Souhaitez-vous des précisions sur un aspect particulier de la création de société ?`;
  }
  
  if (lowerQuery.includes('contrat') || lowerQuery.includes('bail') || lowerQuery.includes('location')) {
    return `**Contrats et baux dans l'espace OHADA**

Le droit des contrats OHADA est régi par les principes généraux du droit civil et les dispositions spécifiques de l'Acte uniforme.

**🏢 Pour un bail commercial :**
• **Durée minimale** : 3 ans renouvelables (usage commercial)
• **Dépôt de garantie** : généralement 2 à 6 mois de loyer
• **Enregistrement obligatoire** auprès des services fiscaux

**📋 Clauses essentielles à inclure :**
1. Identification précise des parties
2. Description détaillée du bien loué
3. Montant du loyer et modalités de révision
4. Durée du bail et conditions de renouvellement
5. Répartition des charges et travaux
6. Conditions de résiliation

**⚠️ Points d'attention :**
• Respecter les délais de préavis légaux
• Prévoir une clause d'arbitrage CCJA si souhaité
• Vérifier la conformité avec les réglementations locales

**💼 Modèles disponibles :**
Yujuris propose des modèles de contrats adaptés à chaque pays OHADA dans la section "Modèles Juridiques".

Avez-vous besoin d'aide pour un type de contrat spécifique ?`;
  }
  
  if (lowerQuery.includes('travail') || lowerQuery.includes('employé') || lowerQuery.includes('salaire')) {
    return `**Droit du travail OHADA**

L'Acte uniforme relatif au droit du travail harmonise les relations de travail dans les 17 États membres.

**👥 Types de contrats de travail :**
• **CDI** : Contrat à durée indéterminée (forme de droit commun)
• **CDD** : Contrat à durée déterminée (maximum 2 ans, renouvelable une fois)
• **Contrat d'apprentissage** : Formation professionnelle

**💰 Rémunération et avantages :**
• Salaire minimum garanti (SMIG) variable selon les pays
• Paiement mensuel obligatoire
• Congés payés : minimum 2,5 jours par mois travaillé
• Prime d'ancienneté après 2 ans de service

**🛡️ Protection du salarié :**
• Préavis de licenciement selon l'ancienneté
• Indemnité de licenciement si rupture à l'initiative de l'employeur
• Protection contre le licenciement abusif

**⚖️ Résolution des conflits :**
• Tentative de conciliation obligatoire
• Saisine du tribunal du travail
• Possibilité d'arbitrage

**📊 Obligations de l'employeur :**
• Déclaration à la CNPS (sécurité sociale)
• Tenue du registre du personnel
• Respect des règles d'hygiène et sécurité

Quelle question spécifique avez-vous sur le droit du travail ?`;
  }

  // Default comprehensive response
  return `**Analyse juridique OHADA**

Concernant votre question "${query.substring(0, 100)}${query.length > 100 ? '...' : ''}", voici les éléments juridiques pertinents :

**🏛️ Cadre légal applicable :**
Les dispositions OHADA établissent un cadre juridique harmonisé pour les 17 États membres. Dans votre situation, plusieurs textes peuvent s'appliquer selon le contexte spécifique.

**📚 Principes fondamentaux :**
• **Sécurité juridique** : Les actes uniformes prévalent sur les législations nationales
• **Harmonisation** : Règles identiques dans tous les États parties
• **Modernisation** : Adaptation aux réalités économiques africaines

**⚖️ Recommandations pratiques :**
1. **Vérification de conformité** avec les textes OHADA en vigueur
2. **Documentation appropriée** de tous les actes juridiques
3. **Respect des procédures** établies par les actes uniformes
4. **Consultation d'un juriste** pour les cas complexes

**🔍 Points d'attention :**
• Respecter les délais légaux prescrits
• S'assurer de la compétence territoriale
• Prévoir les voies de recours appropriées

**💡 Conseil personnalisé :**
Pour une analyse plus approfondie de votre situation spécifique, je recommande de fournir plus de détails sur le contexte juridique et le pays concerné.

Souhaitez-vous que je précise un aspect particulier de cette question ?`;
};