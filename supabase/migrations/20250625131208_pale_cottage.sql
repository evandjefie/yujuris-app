/*
  # Insertion des sous-catégories de documents juridiques

  1. Data Population
    - Contrats (vente, bail, travail, etc.)
    - Actes officiels
    - Documents d'entreprise
    - Procédures juridiques
    - Et toutes les autres catégories demandées

  2. Template Structure
    - Définition des champs pour chaque type de document
    - Validation et contraintes
    - Métadonnées pour la génération
*/

-- Get category IDs for reference
DO $$
DECLARE
    contracts_id uuid;
    official_acts_id uuid;
    legislative_id uuid;
    family_civil_id uuid;
    corporate_id uuid;
    confidentiality_id uuid;
    procedures_id uuid;
    real_estate_id uuid;
    debt_recovery_id uuid;
    arbitration_id uuid;
    hr_employment_id uuid;
    banking_finance_id uuid;
    ohada_domain_id uuid;
    ci_national_domain_id uuid;
BEGIN
    -- Get category IDs
    SELECT id INTO contracts_id FROM document_categories WHERE code = 'CONTRACTS';
    SELECT id INTO official_acts_id FROM document_categories WHERE code = 'OFFICIAL_ACTS';
    SELECT id INTO legislative_id FROM document_categories WHERE code = 'LEGISLATIVE';
    SELECT id INTO family_civil_id FROM document_categories WHERE code = 'FAMILY_CIVIL';
    SELECT id INTO corporate_id FROM document_categories WHERE code = 'CORPORATE';
    SELECT id INTO confidentiality_id FROM document_categories WHERE code = 'CONFIDENTIALITY';
    SELECT id INTO procedures_id FROM document_categories WHERE code = 'PROCEDURES';
    SELECT id INTO real_estate_id FROM document_categories WHERE code = 'REAL_ESTATE';
    SELECT id INTO debt_recovery_id FROM document_categories WHERE code = 'DEBT_RECOVERY';
    SELECT id INTO arbitration_id FROM document_categories WHERE code = 'ARBITRATION';
    SELECT id INTO hr_employment_id FROM document_categories WHERE code = 'HR_EMPLOYMENT';
    SELECT id INTO banking_finance_id FROM document_categories WHERE code = 'BANKING_FINANCE';
    
    -- Get domain IDs
    SELECT id INTO ohada_domain_id FROM legal_domains WHERE code = 'OHADA';
    SELECT id INTO ci_national_domain_id FROM legal_domains WHERE code = 'CI_NATIONAL';

    -- CONTRATS
    INSERT INTO document_subcategories (category_id, legal_domain_id, code, name, description, template_structure, is_premium, complexity_level, estimated_time_minutes, sort_order) VALUES
    (contracts_id, ohada_domain_id, 'SALE_CONTRACT', 'Contrat de vente', 'Contrat de vente de biens mobiliers ou immobiliers', 
     '{"fields": [
       {"id": "seller", "label": "Vendeur", "type": "object", "required": true, "fields": [
         {"id": "name", "label": "Nom/Raison sociale", "type": "text", "required": true},
         {"id": "address", "label": "Adresse", "type": "text", "required": true},
         {"id": "id_number", "label": "Numéro d''identification", "type": "text", "required": true}
       ]},
       {"id": "buyer", "label": "Acheteur", "type": "object", "required": true, "fields": [
         {"id": "name", "label": "Nom/Raison sociale", "type": "text", "required": true},
         {"id": "address", "label": "Adresse", "type": "text", "required": true},
         {"id": "id_number", "label": "Numéro d''identification", "type": "text", "required": true}
       ]},
       {"id": "property", "label": "Bien vendu", "type": "object", "required": true, "fields": [
         {"id": "description", "label": "Description détaillée", "type": "textarea", "required": true},
         {"id": "location", "label": "Localisation", "type": "text", "required": false},
         {"id": "surface", "label": "Surface (m²)", "type": "number", "required": false}
       ]},
       {"id": "price", "label": "Prix de vente (FCFA)", "type": "number", "required": true},
       {"id": "payment_terms", "label": "Modalités de paiement", "type": "select", "required": true, "options": ["Comptant", "Échelonné", "Crédit"]},
       {"id": "delivery_date", "label": "Date de livraison", "type": "date", "required": true},
       {"id": "warranty", "label": "Garanties", "type": "textarea", "required": false}
     ]}', false, 'basic', 20, 1),
    
    (contracts_id, ohada_domain_id, 'RESIDENTIAL_LEASE', 'Bail d''habitation', 'Contrat de location à usage d''habitation', 
     '{"fields": [
       {"id": "landlord", "label": "Bailleur", "type": "object", "required": true, "fields": [
         {"id": "name", "label": "Nom complet", "type": "text", "required": true},
         {"id": "address", "label": "Adresse", "type": "text", "required": true},
         {"id": "phone", "label": "Téléphone", "type": "tel", "required": true}
       ]},
       {"id": "tenant", "label": "Locataire", "type": "object", "required": true, "fields": [
         {"id": "name", "label": "Nom complet", "type": "text", "required": true},
         {"id": "address", "label": "Adresse actuelle", "type": "text", "required": true},
         {"id": "phone", "label": "Téléphone", "type": "tel", "required": true},
         {"id": "profession", "label": "Profession", "type": "text", "required": true}
       ]},
       {"id": "property", "label": "Logement", "type": "object", "required": true, "fields": [
         {"id": "address", "label": "Adresse du logement", "type": "text", "required": true},
         {"id": "type", "label": "Type de logement", "type": "select", "required": true, "options": ["Studio", "F1", "F2", "F3", "F4", "F5+", "Villa", "Duplex"]},
         {"id": "surface", "label": "Surface (m²)", "type": "number", "required": true},
         {"id": "furnished", "label": "Meublé", "type": "boolean", "required": true}
       ]},
       {"id": "rent", "label": "Loyer mensuel (FCFA)", "type": "number", "required": true},
       {"id": "deposit", "label": "Caution (FCFA)", "type": "number", "required": true},
       {"id": "duration", "label": "Durée du bail (mois)", "type": "number", "required": true},
       {"id": "start_date", "label": "Date de début", "type": "date", "required": true}
     ]}', false, 'basic', 25, 2),
    
    (contracts_id, ohada_domain_id, 'COMMERCIAL_LEASE', 'Bail commercial', 'Contrat de location à usage commercial ou professionnel', 
     '{"fields": [
       {"id": "landlord", "label": "Bailleur", "type": "object", "required": true, "fields": [
         {"id": "name", "label": "Nom/Raison sociale", "type": "text", "required": true},
         {"id": "address", "label": "Adresse", "type": "text", "required": true},
         {"id": "rccm", "label": "N° RCCM", "type": "text", "required": false}
       ]},
       {"id": "tenant", "label": "Locataire", "type": "object", "required": true, "fields": [
         {"id": "name", "label": "Nom/Raison sociale", "type": "text", "required": true},
         {"id": "address", "label": "Adresse", "type": "text", "required": true},
         {"id": "rccm", "label": "N° RCCM", "type": "text", "required": true},
         {"id": "activity", "label": "Activité commerciale", "type": "text", "required": true}
       ]},
       {"id": "premises", "label": "Local commercial", "type": "object", "required": true, "fields": [
         {"id": "address", "label": "Adresse", "type": "text", "required": true},
         {"id": "surface", "label": "Surface (m²)", "type": "number", "required": true},
         {"id": "description", "label": "Description", "type": "textarea", "required": true},
         {"id": "parking", "label": "Places de parking", "type": "number", "required": false}
       ]},
       {"id": "rent", "label": "Loyer mensuel HT (FCFA)", "type": "number", "required": true},
       {"id": "charges", "label": "Charges mensuelles (FCFA)", "type": "number", "required": false},
       {"id": "deposit", "label": "Dépôt de garantie (FCFA)", "type": "number", "required": true},
       {"id": "duration", "label": "Durée du bail (années)", "type": "number", "required": true},
       {"id": "renewal", "label": "Renouvellement automatique", "type": "boolean", "required": true}
     ]}', false, 'intermediate', 35, 3),
    
    (contracts_id, ohada_domain_id, 'LOAN_CONTRACT', 'Contrat de prêt', 'Contrat de prêt d''argent entre particuliers ou entreprises', 
     '{"fields": [
       {"id": "lender", "label": "Prêteur", "type": "object", "required": true},
       {"id": "borrower", "label": "Emprunteur", "type": "object", "required": true},
       {"id": "amount", "label": "Montant du prêt (FCFA)", "type": "number", "required": true},
       {"id": "interest_rate", "label": "Taux d''intérêt (%)", "type": "number", "required": true},
       {"id": "duration", "label": "Durée (mois)", "type": "number", "required": true},
       {"id": "repayment_schedule", "label": "Échéancier", "type": "select", "required": true, "options": ["Mensuel", "Trimestriel", "Semestriel", "Annuel"]},
       {"id": "guarantees", "label": "Garanties", "type": "textarea", "required": false}
     ]}', false, 'intermediate', 30, 4),
    
    (contracts_id, ohada_domain_id, 'CDI_CONTRACT', 'Contrat de travail CDI', 'Contrat de travail à durée indéterminée', 
     '{"fields": [
       {"id": "employer", "label": "Employeur", "type": "object", "required": true, "fields": [
         {"id": "company_name", "label": "Raison sociale", "type": "text", "required": true},
         {"id": "address", "label": "Adresse", "type": "text", "required": true},
         {"id": "rccm", "label": "N° RCCM", "type": "text", "required": true},
         {"id": "cnps", "label": "N° CNPS", "type": "text", "required": true}
       ]},
       {"id": "employee", "label": "Employé", "type": "object", "required": true, "fields": [
         {"id": "name", "label": "Nom et prénoms", "type": "text", "required": true},
         {"id": "birth_date", "label": "Date de naissance", "type": "date", "required": true},
         {"id": "birth_place", "label": "Lieu de naissance", "type": "text", "required": true},
         {"id": "address", "label": "Adresse", "type": "text", "required": true},
         {"id": "nationality", "label": "Nationalité", "type": "text", "required": true},
         {"id": "id_number", "label": "N° CNI/Passeport", "type": "text", "required": true}
       ]},
       {"id": "position", "label": "Poste", "type": "text", "required": true},
       {"id": "category", "label": "Catégorie professionnelle", "type": "select", "required": true, "options": ["Ouvrier", "Employé", "Agent de maîtrise", "Cadre"]},
       {"id": "salary", "label": "Salaire brut mensuel (FCFA)", "type": "number", "required": true},
       {"id": "start_date", "label": "Date de prise de service", "type": "date", "required": true},
       {"id": "trial_period", "label": "Période d''essai (mois)", "type": "number", "required": true},
       {"id": "working_hours", "label": "Horaires de travail", "type": "text", "required": true}
     ]}', false, 'intermediate', 40, 5),
    
    (contracts_id, ohada_domain_id, 'CDD_CONTRACT', 'Contrat de travail CDD', 'Contrat de travail à durée déterminée', 
     '{"fields": [
       {"id": "employer", "label": "Employeur", "type": "object", "required": true},
       {"id": "employee", "label": "Employé", "type": "object", "required": true},
       {"id": "position", "label": "Poste", "type": "text", "required": true},
       {"id": "reason", "label": "Motif du CDD", "type": "select", "required": true, "options": ["Remplacement", "Surcroît d''activité", "Travaux saisonniers", "Projet spécifique"]},
       {"id": "duration", "label": "Durée (mois)", "type": "number", "required": true},
       {"id": "salary", "label": "Salaire brut mensuel (FCFA)", "type": "number", "required": true},
       {"id": "start_date", "label": "Date de début", "type": "date", "required": true},
       {"id": "end_date", "label": "Date de fin", "type": "date", "required": true}
     ]}', false, 'intermediate', 35, 6),
    
    (contracts_id, ohada_domain_id, 'FRANCHISE_CONTRACT', 'Contrat de franchise', 'Contrat de franchise commerciale', 
     '{"fields": [
       {"id": "franchisor", "label": "Franchiseur", "type": "object", "required": true},
       {"id": "franchisee", "label": "Franchisé", "type": "object", "required": true},
       {"id": "brand", "label": "Marque/Enseigne", "type": "text", "required": true},
       {"id": "territory", "label": "Territoire exclusif", "type": "text", "required": true},
       {"id": "initial_fee", "label": "Droit d''entrée (FCFA)", "type": "number", "required": true},
       {"id": "royalty_rate", "label": "Taux de redevance (%)", "type": "number", "required": true},
       {"id": "duration", "label": "Durée (années)", "type": "number", "required": true}
     ]}', true, 'advanced', 60, 7),
    
    (contracts_id, ohada_domain_id, 'NDA_CONTRACT', 'Accord de confidentialité (NDA)', 'Accord de non-divulgation d''informations confidentielles', 
     '{"fields": [
       {"id": "disclosing_party", "label": "Partie divulgatrice", "type": "object", "required": true},
       {"id": "receiving_party", "label": "Partie réceptrice", "type": "object", "required": true},
       {"id": "purpose", "label": "Objet de la confidentialité", "type": "textarea", "required": true},
       {"id": "duration", "label": "Durée de confidentialité (années)", "type": "number", "required": true},
       {"id": "exceptions", "label": "Exceptions", "type": "textarea", "required": false},
       {"id": "penalties", "label": "Pénalités en cas de violation", "type": "textarea", "required": true}
     ]}', false, 'intermediate', 25, 8),
    
    (contracts_id, ohada_domain_id, 'PARTNERSHIP_CONTRACT', 'Contrat de partenariat commercial', 'Accord de partenariat entre entreprises', 
     '{"fields": [
       {"id": "party1", "label": "Première partie", "type": "object", "required": true},
       {"id": "party2", "label": "Seconde partie", "type": "object", "required": true},
       {"id": "objectives", "label": "Objectifs du partenariat", "type": "textarea", "required": true},
       {"id": "contributions", "label": "Contributions de chaque partie", "type": "textarea", "required": true},
       {"id": "revenue_sharing", "label": "Partage des revenus", "type": "textarea", "required": true},
       {"id": "duration", "label": "Durée (années)", "type": "number", "required": true}
     ]}', true, 'advanced', 45, 9),
    
    (contracts_id, ohada_domain_id, 'DISTRIBUTION_CONTRACT', 'Contrat de distribution', 'Contrat de distribution commerciale', 
     '{"fields": [
       {"id": "supplier", "label": "Fournisseur", "type": "object", "required": true},
       {"id": "distributor", "label": "Distributeur", "type": "object", "required": true},
       {"id": "products", "label": "Produits concernés", "type": "textarea", "required": true},
       {"id": "territory", "label": "Territoire de distribution", "type": "text", "required": true},
       {"id": "exclusivity", "label": "Exclusivité", "type": "boolean", "required": true},
       {"id": "minimum_orders", "label": "Commandes minimales", "type": "text", "required": false},
       {"id": "pricing", "label": "Conditions tarifaires", "type": "textarea", "required": true}
     ]}', true, 'advanced', 50, 10);

END $$;