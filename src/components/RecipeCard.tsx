
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Clock, Copy, Check, ExternalLink, Youtube, Bookmark, BookmarkCheck, Utensils, Flame, Scale } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface Recipe {
  name: string;
  haveIngredients: string[];
  needIngredients: string[];
  steps: string[];
  prepTime: string;
  cookTime: string;
  youtubeUrl: string;
  servings?: number;
  nutritionalInfo?: {
    calories: string;
    protein: string;
    carbs: string;
    fats: string;
  };
  difficulty?: 'easy' | 'medium' | 'hard';
  tips?: string[];
}

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard = ({ recipe }: RecipeCardProps) => {
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("recipe");

  const handleCopyShoppingList = () => {
    const shoppingList = recipe.needIngredients.join(", ");
    navigator.clipboard.writeText(shoppingList);
    setCopied(true);
    toast.success("Shopping list copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveRecipe = async () => {
    if (!user) {
      toast.error("Please sign in to save recipes");
      return;
    }

    setIsSaving(true);
    try {
      // Convert recipe to the format expected by our database
      const savedRecipe = {
        user_id: user.id,
        title: recipe.name,
        description: `Recipe for ${recipe.name}`,
        ingredients: recipe.needIngredients.concat(recipe.haveIngredients),
        instructions: recipe.steps,
        cooking_time: parseInt(recipe.cookTime) || null,
        image_url: null, // We don't have images in our demo recipes yet
        servings: recipe.servings || 2,
        difficulty: recipe.difficulty || 'medium',
        nutritional_info: recipe.nutritionalInfo || null
      };

      const { error } = await supabase
        .from('saved_recipes')
        .insert([savedRecipe]);

      if (error) {
        throw error;
      }

      setIsSaved(true);
      toast.success("Recipe saved successfully!");
    } catch (error) {
      console.error("Error saving recipe:", error);
      toast.error("Failed to save recipe");
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function to render difficulty icon
  const renderDifficultyIcon = (difficulty: string = 'medium') => {
    switch (difficulty) {
      case 'easy':
        return <Badge className="bg-green-500">Easy</Badge>;
      case 'hard':
        return <Badge className="bg-red-500">Hard</Badge>;
      default:
        return <Badge className="bg-yellow-500">Medium</Badge>;
    }
  };

  return (
    <Card className="shadow-lg border-t-4 border-t-recipe-primary overflow-hidden">
      <CardHeader className="bg-recipe-light pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-2xl font-bold text-gray-800">{recipe.name}</CardTitle>
          {user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSaveRecipe}
              disabled={isSaving || isSaved}
              className="text-recipe-secondary"
            >
              {isSaved ? (
                <BookmarkCheck className="h-5 w-5" />
              ) : (
                <Bookmark className="h-5 w-5" />
              )}
              <span className="ml-1">{isSaved ? "Saved" : "Save Recipe"}</span>
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <div className="flex items-center text-gray-600">
            <Clock className="h-4 w-4 mr-1" />
            <span className="text-sm">Prep: {recipe.prepTime}</span>
          </div>
          <div className="mx-2 text-gray-300">|</div>
          <div className="flex items-center text-gray-600">
            <Clock className="h-4 w-4 mr-1" />
            <span className="text-sm">Cook: {recipe.cookTime}</span>
          </div>
          {recipe.servings && (
            <>
              <div className="mx-2 text-gray-300">|</div>
              <div className="flex items-center text-gray-600">
                <Utensils className="h-4 w-4 mr-1" />
                <span className="text-sm">Serves: {recipe.servings}</span>
              </div>
            </>
          )}
          {recipe.difficulty && (
            <>
              <div className="mx-2 text-gray-300">|</div>
              <div className="flex items-center text-gray-600">
                <Flame className="h-4 w-4 mr-1" />
                {renderDifficultyIcon(recipe.difficulty)}
              </div>
            </>
          )}
        </div>
      </CardHeader>
      
      <Tabs defaultValue="recipe" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="recipe">Recipe</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
          <TabsTrigger value="tips">Tips</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recipe" className="pt-4">
          <CardContent className="pt-2 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Ingredients */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-gray-800 border-b pb-2">Ingredients</h3>
                
                <div>
                  <h4 className="font-medium text-sm text-gray-500 mb-2">What You Have:</h4>
                  <ul className="space-y-1">
                    {recipe.haveIngredients.map((ingredient, index) => (
                      <li key={`have-${index}`} className="flex items-start">
                        <Check className="h-4 w-4 mr-2 text-recipe-primary mt-1 flex-shrink-0" />
                        <span>{ingredient}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-sm text-gray-500">What You Need:</h4>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleCopyShoppingList}
                      className="h-8 px-2 text-xs"
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5 mr-1 text-green-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 mr-1" />
                      )}
                      {copied ? 'Copied!' : 'Copy list'}
                    </Button>
                  </div>
                  <ul className="space-y-1">
                    {recipe.needIngredients.map((ingredient, index) => (
                      <li key={`need-${index}`} className="flex items-start">
                        <span className="text-recipe-secondary mr-2 font-bold">•</span>
                        <span>{ingredient}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-gray-800 border-b pb-2">Preparation Steps</h3>
                <ol className="space-y-3 list-decimal pl-5">
                  {recipe.steps.map((step, index) => (
                    <li key={index} className="pl-1">
                      <span>{step.startsWith(`${index + 1}.`) ? step.substring(step.indexOf('.') + 1).trim() : step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* YouTube Tutorial */}
            <div className="pt-4 border-t">
              <a 
                href={recipe.youtubeUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <Youtube className="h-5 w-5 mr-2" />
                Watch Tutorial on YouTube
                <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </div>
          </CardContent>
        </TabsContent>
        
        <TabsContent value="nutrition" className="pt-4">
          <CardContent className="pt-2">
            {recipe.nutritionalInfo ? (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-gray-800 border-b pb-2">Nutritional Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-gray-500 text-sm">Calories</p>
                    <p className="text-lg font-semibold text-gray-800">{recipe.nutritionalInfo.calories}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-gray-500 text-sm">Protein</p>
                    <p className="text-lg font-semibold text-gray-800">{recipe.nutritionalInfo.protein}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-gray-500 text-sm">Carbs</p>
                    <p className="text-lg font-semibold text-gray-800">{recipe.nutritionalInfo.carbs}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-gray-500 text-sm">Fats</p>
                    <p className="text-lg font-semibold text-gray-800">{recipe.nutritionalInfo.fats}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 italic mt-4">
                  Note: Nutritional values are approximate and may vary based on specific ingredients used.
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <Scale className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Nutritional information not available for this recipe</p>
              </div>
            )}
          </CardContent>
        </TabsContent>
        
        <TabsContent value="tips" className="pt-4">
          <CardContent className="pt-2">
            <h3 className="font-semibold text-lg text-gray-800 border-b pb-2">Cooking Tips</h3>
            {recipe.tips && recipe.tips.length > 0 ? (
              <ul className="mt-4 space-y-2">
                {recipe.tips.map((tip, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-recipe-primary mr-2 font-bold">💡</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No special tips available for this recipe</p>
              </div>
            )}
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default RecipeCard;
