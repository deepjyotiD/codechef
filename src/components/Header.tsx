
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Menu, X, ChefHat, LogOut, User } from 'lucide-react';
import AuthModal from './auth/AuthModal';
import { useAuth } from '@/contexts/AuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const { user, signOut, isLoading } = useAuth();

  const openSignIn = () => {
    setAuthModalMode('signin');
    setIsAuthModalOpen(true);
  };

  const openSignUp = () => {
    setAuthModalMode('signup');
    setIsAuthModalOpen(true);
  };

  const handleSignOut = async () => {
    await signOut();
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <ChefHat className="h-8 w-8 text-recipe-primary" />
            <h1 className="text-xl font-bold text-gray-900 flex items-center">
              Code<span className="text-recipe-secondary">Chef</span>
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            <NavLink to="/" label="Home" />
            <NavLink to="/my-recipes" label="My Recipes" />
            
            {isLoading ? (
              <div className="h-10 w-20 bg-gray-200 animate-pulse rounded-md"></div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-700">
                  {user.email}
                </div>
                <Button 
                  variant="outline" 
                  className="border-recipe-primary text-recipe-primary hover:text-recipe-primary/80 hover:bg-recipe-light"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  className="border-recipe-primary text-recipe-primary hover:text-recipe-primary/80 hover:bg-recipe-light"
                  onClick={openSignIn}
                >
                  Log In
                </Button>
                <Button 
                  className="bg-recipe-secondary text-white hover:bg-recipe-secondary/80"
                  onClick={openSignUp}
                >
                  Sign Up
                </Button>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 pt-2 space-y-3">
            <MobileNavLink to="/" label="Home" onClick={() => setIsMenuOpen(false)} />
            <MobileNavLink to="/my-recipes" label="My Recipes" onClick={() => setIsMenuOpen(false)} />
            <div className="flex flex-col space-y-2 pt-2">
              {user ? (
                <>
                  <div className="px-3 py-2 text-sm text-gray-700 font-medium">
                    Signed in as: {user.email}
                  </div>
                  <Button 
                    variant="outline" 
                    className="border-recipe-primary text-recipe-primary w-full justify-start"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    className="border-recipe-primary text-recipe-primary w-full justify-start"
                    onClick={() => {
                      openSignIn();
                      setIsMenuOpen(false);
                    }}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Log In
                  </Button>
                  <Button 
                    className="bg-recipe-secondary text-white hover:bg-recipe-secondary/80 w-full justify-start"
                    onClick={() => {
                      openSignUp();
                      setIsMenuOpen(false);
                    }}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authModalMode}
      />
    </header>
  );
};

interface NavLinkProps {
  to: string;
  label: string;
}

const NavLink = ({ to, label }: NavLinkProps) => (
  <Link 
    to={to} 
    className="text-gray-700 hover:text-recipe-primary transition-colors font-medium"
  >
    {label}
  </Link>
);

interface MobileNavLinkProps {
  to: string;
  label: string;
  onClick: () => void;
}

const MobileNavLink = ({ to, label, onClick }: MobileNavLinkProps) => (
  <Link 
    to={to} 
    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-recipe-primary hover:bg-gray-50 rounded-md"
    onClick={onClick}
  >
    {label}
  </Link>
);

export default Header;
