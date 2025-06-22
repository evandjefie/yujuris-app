import React, { useState } from 'react';
import { Upload, FileText, Download, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '../ui/Button';
import { Document, DocumentAnalysis as Analysis } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { COLORS } from '../../constants';

export const DocumentAnalysis: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const { user, openAuthModal } = useAuth();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (!user) {
      openAuthModal();
      return;
    }

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) {
      openAuthModal();
      return;
    }

    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    files.forEach(file => {
      const newDoc: Document = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        type: file.type,
        size: file.size,
        uploadDate: new Date()
      };

      setDocuments(prev => [...prev, newDoc]);
      
      // Simulate analysis
      setAnalyzing(newDoc.id);
      setTimeout(() => {
        const mockAnalysis: Analysis = {
          summary: "Ce document contient des clauses contractuelles standard avec quelques dispositions spécifiques au droit OHADA. Les termes généraux sont conformes aux exigences légales.",
          keyPoints: [
            "Clauses de résiliation conformes à l'article 15 du Code OHADA",
            "Obligations des parties clairement définies",
            "Dispositions relatives aux pénalités de retard présentes"
          ],
          recommendations: [
            "Vérifier la clause d'arbitrage selon les standards OHADA",
            "Préciser la juridiction compétente",
            "Ajouter une clause de force majeure"
          ],
          riskLevel: 'medium'
        };

        setDocuments(prev => 
          prev.map(doc => 
            doc.id === newDoc.id 
              ? { ...doc, analysis: mockAnalysis }
              : doc
          )
        );
        setAnalyzing(null);
      }, 3000);
    });
  };

  const getRiskColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskIcon = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return <CheckCircle size={16} />;
      case 'medium': return <AlertCircle size={16} />;
      case 'high': return <AlertCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Analyse de Documents
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Téléchargez vos documents pour une analyse juridique automatique
        </p>
      </div>

      <div className="flex-1 p-4 space-y-6">
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
          style={dragActive ? { borderColor: COLORS.primary, backgroundColor: `${COLORS.primary}08` } : undefined}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Glissez vos documents ici
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Formats supportés: PDF, DOC, DOCX (max 10MB)
          </p>
          
          <div className="flex justify-center">
            <Button onClick={() => document.getElementById('file-input')?.click()}>
              Choisir des fichiers
            </Button>
          </div>
          
          <input
            id="file-input"
            type="file"
            multiple
            accept=".pdf,.doc,.docx"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>

        {/* Documents List */}
        {documents.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Documents téléchargés
            </h3>
            
            {documents.map(doc => (
              <div key={doc.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <FileText size={20} className="text-gray-400" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {doc.name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {(doc.size / (1024 * 1024)).toFixed(2)} MB • {doc.uploadDate.toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="sm">
                    <Download size={16} />
                  </Button>
                </div>

                {/* Analysis Status */}
                {analyzing === doc.id && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-primary"></div>
                    <span>Analyse en cours...</span>
                  </div>
                )}

                {/* Analysis Results */}
                {doc.analysis && (
                  <div className="space-y-4">
                    {/* Risk Level */}
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(doc.analysis.riskLevel)}`}>
                        {getRiskIcon(doc.analysis.riskLevel)}
                        <span>
                          Risque {doc.analysis.riskLevel === 'low' ? 'faible' : doc.analysis.riskLevel === 'medium' ? 'moyen' : 'élevé'}
                        </span>
                      </span>
                    </div>

                    {/* Summary */}
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                        Résumé
                      </h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {doc.analysis.summary}
                      </p>
                    </div>

                    {/* Key Points */}
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                        Points clés
                      </h5>
                      <ul className="space-y-1">
                        {doc.analysis.keyPoints.map((point, index) => (
                          <li key={index} className="flex items-start space-x-2 text-sm">
                            <span 
                              className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                              style={{ backgroundColor: COLORS.primary }}
                            ></span>
                            <span className="text-gray-600 dark:text-gray-400">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                        Recommandations
                      </h5>
                      <ul className="space-y-1">
                        {doc.analysis.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start space-x-2 text-sm">
                            <span 
                              className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                              style={{ backgroundColor: COLORS.primary }}
                            ></span>
                            <span className="text-gray-600 dark:text-gray-400">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};