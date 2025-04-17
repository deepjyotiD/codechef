import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ChefHat, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Json } from '@/integrations/supabase/types';

interface SavedRecipe {
  id: string;
  title: string;
  description: string | null;
  ingredients: Json;
  instructions: Json;
  cooking_time: number | null;
  cuisine: string | null;
  created_at: string | null;
  image_url: string | null;
  servings: number | null;
  updated_at: string | null;
  user_id: string;
}

const MyRecipes = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);

  useEffect(() => {
    const fetchSavedRecipes = async () => {
      if (!user) return;
      
      setIsLoadingRecipes(true);
      try {
        const { data, error } = await supabase
          .from('saved_recipes')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        setSavedRecipes(data || []);
      } catch (error) {
        console.error('Error fetching saved recipes:', error);
      } finally {
        setIsLoadingRecipes(false);
      }
    };
    
    if (user) {
      fetchSavedRecipes();
    }
  }, [user]);

  useEffect(() => {
    if (!isLoading && !user) {
      const timer = setTimeout(() => {
        setIsRedirecting(true);
        navigate('/', { replace: true });
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center">
          <ChefHat className="h-12 w-12 text-recipe-primary animate-pulse" />
          <p className="mt-4 text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h1>
            <p className="text-gray-600 mb-6">
              You need to sign in to access your saved recipes.
              {isRedirecting && <span className="block mt-2">Redirecting to home page...</span>}
            </p>
            <Button 
              className="bg-recipe-primary text-white hover:bg-recipe-primary/90"
              onClick={() => navigate('/')}
            >
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">My Saved Recipes</h1>
        
        {isLoadingRecipes ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="h-8 w-8 text-recipe-primary animate-spin" />
            <p className="ml-2 text-gray-600">Loading your recipes...</p>
          </div>
        ) : savedRecipes.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {savedRecipes.map(recipe => (
              <Card key={recipe.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="bg-recipe-light">
                  <CardTitle className="text-xl font-bold truncate">{recipe.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-gray-600 mb-4 line-clamp-2">{recipe.description}</p>
                  <div className="flex justify-between items-center">
                    <div>
                      {recipe.cooking_time && (
                        <span className="text-sm text-gray-500 flex items-center">
                          <ChefHat className="h-4 w-4 mr-1" /> {recipe.cooking_time} mins
                        </span>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      className="bg-recipe-primary text-white hover:bg-recipe-primary/90"
                      onClick={() => {/* View recipe details */}}
                    >
                      View Recipe
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-gray-600">
              You don't have any saved recipes yet.
            </p>
            <p className="text-gray-600 mt-2">
              Generate some recipes on the home page and save them to see them here!
            </p>
            <Button 
              className="mt-6 bg-recipe-primary text-white hover:bg-recipe-primary/90"
              onClick={() => navigate('/')}
            >
              Create a Recipe
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRecipes;
