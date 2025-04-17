
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';

type AuthMode = 'signin' | 'signup';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: AuthMode;
}

const AuthModal = ({ isOpen, onClose, defaultMode = 'signin' }: AuthModalProps) => {
  const [mode, setMode] = useState<AuthMode>(defaultMode);

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </DialogTitle>
        </DialogHeader>

        {mode === 'signin' ? (
          <SignInForm onToggleMode={toggleMode} onSuccess={onClose} />
        ) : (
          <SignUpForm onToggleMode={toggleMode} onSuccess={onClose} />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
