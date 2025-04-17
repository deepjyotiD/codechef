
import { useState } from 'react';
import Header from '../components/Header';
import RecipeForm, { RecipeFormData } from '../components/RecipeForm';
import RecipeCard, { Recipe } from '../components/RecipeCard';
import { ChefHat, AlertCircle, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import RecentRecipes from '../components/RecentRecipes';

const Index = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const { toast } = useToast();
  const [apiError, setApiError] = useState<string | null>(null);
  const [showRecentRecipes, setShowRecentRecipes] = useState(false);

  const handleGenerateRecipe = async (formData: RecipeFormData) => {
    setIsGenerating(true);
    setApiError(null);
    console.log('Form data submitted:', formData);
    
    try {
      // Call the Supabase Edge Function to generate a recipe
      const { data, error } = await supabase.functions.invoke('generate-recipe', {
        body: formData,
      });
      
      if (error) {
        console.error('Error calling generate-recipe function:', error);
        toast({
          title: "Error",
          description: "Failed to generate recipe. Please try again.",
          variant: "destructive",
        });
        setIsGenerating(false);
        return;
      }
      
      console.log('Edge function response:', data);
      
      // Check if we got an error response from the edge function
      if (data.error) {
        console.error('Edge function returned error:', data);
        
        if (data.errorType === 'quota_exceeded') {
          setApiError('OpenAI API quota exceeded. The app is currently using a demonstration mode with preset recipes.');
          toast({
            title: "API Quota Exceeded",
            description: "Using fallback recipe generation due to API limits.",
            variant: "default", // Changed from "warning" to "default"
          });
        } else {
          setApiError('Failed to generate recipe. Using fallback recipe instead.');
          toast({
            title: "Error",
            description: "Using fallback recipe generation due to an error.",
            variant: "destructive",
          });
        }
      }
      
      // Set the recipe from the AI response or fallback
      setRecipe(data as Recipe);
      setShowRecentRecipes(false);
    } catch (err) {
      console.error('Error generating recipe:', err);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setApiError('An unexpected error occurred. Using fallback recipe instead.');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleRecentRecipes = () => {
    setShowRecentRecipes(!showRecentRecipes);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-3">
            <ChefHat className="h-12 w-12 text-recipe-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Discover AI-Generated Recipes
          </h1>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
            Enter your preferences, allergies, and ingredients you have on hand, and let our AI chef create the perfect recipe for you.
          </p>
          
          {/* Feature badges */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <Badge className="bg-recipe-primary">Advanced Filtering</Badge>
            <Badge className="bg-recipe-secondary">Nutritional Info</Badge>
            <Badge className="bg-green-500">Cooking Tips</Badge>
            <Badge className="bg-blue-500">Custom Servings</Badge>
          </div>
        </div>

        {apiError && (
          <div className="max-w-4xl mx-auto mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-amber-800">API Limit Reached</h3>
              <p className="text-amber-700 text-sm mt-1">{apiError}</p>
            </div>
          </div>
        )}

        {/* Toggle for recent recipes */}
        <div className="max-w-4xl mx-auto mb-6 flex justify-end">
          <Button 
            variant="outline" 
            onClick={toggleRecentRecipes}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            {showRecentRecipes ? "Hide Recent Recipes" : "Show Recent Recipes"}
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          {showRecentRecipes ? (
            <Card className="p-6 shadow-md bg-white mb-8">
              <RecentRecipes onSelectRecipe={(recipe) => {
                setRecipe(recipe);
                setShowRecentRecipes(false);
              }} />
            </Card>
          ) : (
            <div className="grid gap-8 md:grid-cols-1">
              <div>
                <RecipeForm onSubmit={handleGenerateRecipe} isLoading={isGenerating} />
              </div>
            </div>
          )}

          {/* Recipe display */}
          {recipe && (
            <div className={`mt-8 animate-fade-in ${showRecentRecipes ? 'hidden' : ''}`}>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Custom Recipe</h2>
              <RecipeCard recipe={recipe} />
            </div>
          )}
          
          {isGenerating && (
            <div className="mt-8">
              <div className="bg-white rounded-lg p-8 shadow-md border text-center">
                <ChefHat className="h-12 w-12 text-recipe-primary mx-auto mb-4 animate-bounce" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Creating your recipe...</h3>
                <p className="text-gray-600">Our AI chef is cooking up something special just for you!</p>
                
                <div className="mt-6 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-recipe-primary to-recipe-secondary rounded-full animate-shimmer" 
                       style={{ 
                         backgroundSize: '200% 100%',
                         width: '100%' 
                       }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;

// Helper component for rendering badges
const Badge = ({ className, children }: { className?: string, children: React.ReactNode }) => {
  return (
    <div className={`px-3 py-1 rounded-full text-xs font-medium text-white ${className}`}>
      {children}
    </div>
  )
};
