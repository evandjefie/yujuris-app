import React, { useState } from 'react';
import { BookTemplate as FileTemplate, Download, Star, Crown } from 'lucide-react';
import { Button } from '../ui/Button';
import { LegalTemplate, TemplateField } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { COLORS, TEMPLATE_CATEGORIES } from '../../constants';

const mockTemplates: LegalTemplate[] = [
  {
    id: '1',
    name: 'Contrat de Bail Commercial',
    category: 'Baux et locations',
    description: 'Modèle complet pour la location de locaux commerciaux selon le droit OHADA',
    premium: false,
    fields: [
      { id: 'landlord', label: 'Nom du bailleur', type: 'text', required: true },
      { id: 'tenant', label: 'Nom du locataire', type: 'text', required: true },
      { id: 'property', label: 'Description du bien', type: 'text', required: true },
      { id: 'rent', label: 'Montant du loyer (FCFA)', type: 'number', required: true },
      { id: 'duration', label: 'Durée du bail (années)', type: 'number', required: true },
      { id: 'startDate', label: 'Date de début', type: 'date', required: true }
    ]
  },
  {
    id: '2',
    name: 'Mise en Demeure',
    category: 'Mises en demeure',
    description: 'Document officiel pour exiger l\'exécution d\'une obligation',
    premium: false,
    fields: [
      { id: 'creditor', label: 'Créancier', type: 'text', required: true },
      { id: 'debtor', label: 'Débiteur', type: 'text', required: true },
      { id: 'obligation', label: 'Obligation non respectée', type: 'text', required: true },
      { id: 'deadline', label: 'Délai accordé (jours)', type: 'number', required: true },
      { id: 'amount', label: 'Montant dû (FCFA)', type: 'number', required: false }
    ]
  },
  {
    id: '3',
    name: 'Statuts de SARL',
    category: 'Actes de société',
    description: 'Statuts type pour la création d\'une SARL selon l\'Acte uniforme OHADA',
    premium: true,
    fields: [
      { id: 'company', label: 'Dénomination sociale', type: 'text', required: true },
      { id: 'object', label: 'Objet social', type: 'text', required: true },
      { id: 'capital', label: 'Capital social (FCFA)', type: 'number', required: true },
      { id: 'address', label: 'Siège social', type: 'text', required: true },
      { id: 'duration', label: 'Durée (années)', type: 'number', required: true }
    ]
  }
];

export const TemplateGenerator: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const [selectedTemplate, setSelectedTemplate] = useState<LegalTemplate | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const { user, openAuthModal } = useAuth();

  const filteredTemplates = mockTemplates.filter(template => 
    selectedCategory === 'Tous' || template.category === selectedCategory
  );

  const handleTemplateSelect = (template: LegalTemplate) => {
    if (template.premium && user?.plan !== 'premium') {
      // Show premium modal
      return;
    }
    
    if (!user) {
      openAuthModal();
      return;
    }

    setSelectedTemplate(template);
    setFormData({});
  };

  const handleFieldChange = (fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleGenerate = async () => {
    if (!selectedTemplate) return;

    setIsGenerating(true);
    
    // Simulate document generation
    setTimeout(() => {
      setIsGenerating(false);
      // In a real app, this would generate and download the document
      alert('Document généré avec succès ! Le téléchargement va commencer.');
    }, 2000);
  };

  const isFormValid = () => {
    if (!selectedTemplate) return false;
    return selectedTemplate.fields
      .filter(field => field.required)
      .every(field => formData[field.id]?.trim());
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Générateur de Modèles
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Créez des documents juridiques personnalisés selon le droit OHADA
        </p>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar - Template Categories */}
        <div className="w-64 border-r border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">
            Catégories
          </h3>
          
          <div className="space-y-1">
            <button
              onClick={() => setSelectedCategory('Tous')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedCategory === 'Tous'
                  ? 'text-white'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              style={selectedCategory === 'Tous' ? { backgroundColor: COLORS.primary } : undefined}
            >
              Tous les modèles
            </button>
            
            {TEMPLATE_CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedCategory === category
                    ? 'text-white'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                style={selectedCategory === category ? { backgroundColor: COLORS.primary } : undefined}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4">
          {!selectedTemplate ? (
            // Template Selection
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map(template => (
                <div
                  key={template.id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleTemplateSelect(template)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <FileTemplate size={24} className="text-gray-400" />
                    {template.premium && (
                      <div className="flex items-center space-x-1">
                        <Crown size={14} className="text-yellow-500" />
                        <span className="text-xs text-yellow-600 font-medium">Premium</span>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    {template.name}
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {template.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span 
                      className="text-xs px-2 py-1 rounded-full text-white"
                      style={{ backgroundColor: COLORS.primary }}
                    >
                      {template.category}
                    </span>
                    
                    <div className="flex items-center space-x-1 text-yellow-500">
                      <Star size={12} fill="currentColor" />
                      <span className="text-xs">4.8</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Template Form
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedTemplate.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedTemplate.description}
                  </p>
                </div>
                
                <Button
                  variant="ghost"
                  onClick={() => setSelectedTemplate(null)}
                >
                  Retour
                </Button>
              </div>

              <div className="space-y-4">
                {selectedTemplate.fields.map(field => (
                  <div key={field.id}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    
                    {field.type === 'select' ? (
                      <select
                        value={formData[field.id] || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required={field.required}
                      >
                        <option value="">Sélectionner...</option>
                        {field.options?.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        value={formData[field.id] || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required={field.required}
                      />
                    )}
                  </div>
                ))}

                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={handleGenerate}
                    disabled={!isFormValid() || isGenerating}
                    className="flex items-center space-x-2"
                  >
                    <Download size={16} />
                    <span>
                      {isGenerating ? 'Génération...' : 'Générer le document'}
                    </span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => setSelectedTemplate(null)}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};