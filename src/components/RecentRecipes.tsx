
import React, { useState, useEffect } from 'react';
import { Recipe } from './RecipeCard';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Utensils, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface RecentRecipesProps {
  onSelectRecipe: (recipe: Recipe) => void;
}

const SAMPLE_RECIPES: Recipe[] = [
  {
    name: "Quick Pasta Primavera",
    haveIngredients: ["pasta", "olive oil", "garlic"],
    needIngredients: ["bell peppers", "zucchini", "broccoli", "grated parmesan"],
    steps: [
      "1. Cook pasta according to package directions",
      "2. Sauté garlic in olive oil until fragrant",
      "3. Add chopped vegetables and cook until tender",
      "4. Toss with pasta and top with parmesan"
    ],
    prepTime: "10 minutes",
    cookTime: "15 minutes",
    youtubeUrl: "https://www.youtube.com/results?search_query=how+to+cook+pasta+primavera",
    difficulty: "easy",
    servings: 2,
    nutritionalInfo: {
      calories: "450 kcal per serving",
      protein: "12g",
      carbs: "65g",
      fats: "14g"
    },
    tips: ["Use seasonal vegetables for best flavor", "Reserve some pasta water to create a silkier sauce"]
  },
  {
    name: "Chicken Stir Fry",
    haveIngredients: ["chicken breast", "soy sauce", "garlic"],
    needIngredients: ["broccoli", "carrots", "bell peppers", "ginger", "sesame oil"],
    steps: [
      "1. Dice chicken and marinate in soy sauce",
      "2. Stir fry vegetables until crisp-tender",
      "3. Add chicken and cook through",
      "4. Finish with a drizzle of sesame oil"
    ],
    prepTime: "15 minutes",
    cookTime: "10 minutes",
    youtubeUrl: "https://www.youtube.com/results?search_query=how+to+cook+chicken+stir+fry",
    difficulty: "medium",
    servings: 3,
    nutritionalInfo: {
      calories: "320 kcal per serving",
      protein: "28g",
      carbs: "18g",
      fats: "12g"
    },
    tips: ["Cut all ingredients to similar sizes for even cooking", "Don't overcrowd the pan"]
  },
  {
    name: "Mediterranean Salad",
    haveIngredients: ["lettuce", "cucumber", "tomatoes"],
    needIngredients: ["feta cheese", "kalamata olives", "red onion", "olive oil", "lemon juice"],
    steps: [
      "1. Chop all vegetables",
      "2. Combine in a large bowl",
      "3. Whisk olive oil and lemon juice for dressing",
      "4. Toss salad with dressing and top with feta"
    ],
    prepTime: "15 minutes",
    cookTime: "0 minutes",
    youtubeUrl: "https://www.youtube.com/results?search_query=how+to+make+mediterranean+salad",
    difficulty: "easy",
    servings: 2,
    nutritionalInfo: {
      calories: "220 kcal per serving",
      protein: "8g",
      carbs: "14g",
      fats: "16g"
    },
    tips: ["Add grilled chicken for extra protein", "Make dressing ahead for enhanced flavors"]
  }
];

const RecentRecipes = ({ onSelectRecipe }: RecentRecipesProps) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      
      try {
        // If user is logged in, try to get their saved recipes
        if (user) {
          const { data, error } = await supabase
            .from('saved_recipes')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(3);
            
          if (error) {
            throw error;
          }
          
          if (data && data.length > 0) {
            // Transform database records to Recipe format
            const userRecipes: Recipe[] = data.map(item => ({
              name: item.title,
              haveIngredients: (item.ingredients as string[] || []).slice(0, 3),
              needIngredients: (item.ingredients as string[] || []).slice(3),
              steps: item.instructions as string[],
              prepTime: "15 minutes", // Placeholder
              cookTime: item.cooking_time ? `${item.cooking_time} minutes` : "20 minutes",
              youtubeUrl: `https://www.youtube.com/results?search_query=how+to+cook+${encodeURIComponent(item.title)}`,
              servings: item.servings || 2,
              // Fix: Add default 'medium' difficulty since it doesn't exist in the database
              difficulty: 'medium'
            }));
            
            setRecipes(userRecipes);
            setLoading(false);
            return;
          }
        }
        
        // If no user or no saved recipes, use sample recipes
        setRecipes(SAMPLE_RECIPES);
      } catch (error) {
        console.error('Error fetching recipes:', error);
        setRecipes(SAMPLE_RECIPES);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecipes();
  }, [user]);

  if (loading) {
    return <div className="text-center py-8">Loading recent recipes...</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Recipes</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {recipes.map((recipe, index) => (
          <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-800 mb-2 truncate">{recipe.name}</h3>
              <div className="flex items-center gap-3 mb-3 text-sm text-gray-500">
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{recipe.cookTime}</span>
                </div>
                <div className="flex items-center">
                  <Utensils className="h-3 w-3 mr-1" />
                  <span>Serves {recipe.servings || 2}</span>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {recipe.haveIngredients.join(", ")}
                {recipe.haveIngredients.length > 0 ? "..." : ""}
              </p>
              <Button 
                onClick={() => onSelectRecipe(recipe)}
                size="sm"
                className="w-full bg-recipe-primary"
              >
                Use This Recipe
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RecentRecipes;
