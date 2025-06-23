import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Loader2, Mail } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { COLORS } from '../../constants';

interface EmailVerificationProps {
  email?: string;
  onResendSuccess?: () => void;
}

export const EmailVerification: React.FC<EmailVerificationProps> = ({
  email,
  onResendSuccess
}) => {
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleResendVerification = async () => {
    if (!email) return;

    setIsResending(true);
    setError('');

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });

      if (error) {
        setError('Erreur lors de l\'envoi de l\'email de vérification');
      } else {
        setResendSuccess(true);
        onResendSuccess?.();
        setTimeout(() => setResendSuccess(false), 5000);
      }
    } catch (err) {
      setError('Une erreur inattendue s\'est produite');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto">
        <Mail size={32} className="text-blue-600 dark:text-blue-400" />
      </div>

      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Vérifiez votre email
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Nous avons envoyé un lien de vérification à{' '}
          <span className="font-medium">{email}</span>
        </p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
          Étapes suivantes :
        </h4>
        <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1 text-left">
          <li>1. Vérifiez votre boîte de réception</li>
          <li>2. Cliquez sur le lien de vérification</li>
          <li>3. Revenez sur Yujuris pour vous connecter</li>
        </ol>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start space-x-2">
          <AlertCircle size={16} className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      {resendSuccess && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start space-x-2">
          <CheckCircle size={16} className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
          <p className="text-green-600 dark:text-green-400 text-sm">
            Email de vérification renvoyé avec succès !
          </p>
        </div>
      )}

      <div className="space-y-3">
        <Button
          onClick={handleResendVerification}
          disabled={isResending || !email}
          variant="outline"
          fullWidth
        >
          {isResending ? (
            <div className="flex items-center space-x-2">
              <Loader2 size={16} className="animate-spin" />
              <span>Envoi en cours...</span>
            </div>
          ) : (
            'Renvoyer l\'email de vérification'
          )}
        </Button>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          Vous n'avez pas reçu l'email ? Vérifiez vos spams ou contactez le support.
        </p>
      </div>
    </div>
  );
};