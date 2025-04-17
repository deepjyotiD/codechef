
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { preferences, allergies, deficiencies, cuisine, ingredients, maxCookingTime, mealType, servings } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    console.log('Generating recipe with preferences:', preferences);
    console.log('Allergies:', allergies);
    console.log('Nutritional focus:', deficiencies);
    console.log('Cuisine:', cuisine);
    console.log('Available ingredients:', ingredients);
    console.log('Max cooking time:', maxCookingTime);
    console.log('Meal type:', mealType);
    console.log('Servings:', servings);

    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      return new Response(
        JSON.stringify({ 
          error: 'OpenAI API key not configured',
          fallbackRecipe: generateFallbackRecipe(
            ingredients?.split(',').map(i => i.trim()) || [], 
            cuisine, 
            preferences,
            maxCookingTime,
            mealType,
            servings
          )
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate dummy recipe for testing when OpenAI API has quota issues
    if (!ingredients || ingredients.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'No ingredients provided',
          fallbackRecipe: generateFallbackRecipe(['food'], cuisine, preferences, maxCookingTime, mealType, servings)
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a prompt for the OpenAI API
    const systemPrompt = `You are a professional chef with expertise in nutritional cooking. 
    Create a detailed recipe that matches the user's preferences and dietary needs.
    The recipe should be formatted with these sections:
    1. Recipe name (creative and appetizing)
    2. List of ingredients they already have
    3. List of additional ingredients they need to buy (with quantities)
    4. Step by step cooking instructions
    5. Preparation time
    6. Cooking time
    7. Number of servings
    8. Nutritional information (calories, protein, carbs, fats)
    9. A relevant YouTube search query that would help them cook this dish
    
    Format your response as a JSON with these keys: name, haveIngredients, needIngredients, steps, prepTime, cookTime, servings, nutritionalInfo, youtubeUrl, difficulty, tips`;

    // Generate the userPrompt based on the form data
    let userPrompt = `Create a recipe using these ingredients: ${ingredients}.`;
    
    if (preferences && preferences.length > 0 && !preferences.includes('none')) {
      userPrompt += ` The recipe should be ${preferences.join(', ')}.`;
    }
    
    if (allergies && allergies.length > 0 && !allergies.includes('none')) {
      userPrompt += ` Avoid these allergens: ${allergies.join(', ')}.`;
    }
    
    if (deficiencies && deficiencies.length > 0 && !deficiencies.includes('none')) {
      userPrompt += ` The dish should be rich in ${deficiencies.join(', ')}.`;
    }
    
    if (cuisine && cuisine !== 'any') {
      userPrompt += ` The cuisine style should be ${cuisine}.`;
    }

    if (maxCookingTime) {
      userPrompt += ` The total cooking time should be under ${maxCookingTime} minutes.`;
    }

    if (mealType && mealType !== 'any') {
      userPrompt += ` This should be a ${mealType} recipe.`;
    }

    if (servings) {
      userPrompt += ` The recipe should serve ${servings} ${servings === 1 ? 'person' : 'people'}.`;
    }

    userPrompt += ` Include preparation time, cooking time, difficulty level (easy, medium, hard), number of servings, nutritional information, and helpful cooking tips. Ensure the response is properly formatted as JSON.`;

    console.log('Sending prompt to OpenAI:', userPrompt);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          response_format: { type: "json_object" }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API error:', errorData);
        
        // Check for quota exceeded error
        if (errorData.error && errorData.error.type === "insufficient_quota") {
          console.error('OpenAI API quota exceeded');
          // Return fallback recipe with status 200 instead of error code
          const ingredientsArr = ingredients.split(',').map(i => i.trim());
          const fallbackRecipe = generateFallbackRecipe(
            ingredientsArr, 
            cuisine, 
            preferences, 
            maxCookingTime, 
            mealType, 
            servings
          );
          
          return new Response(
            JSON.stringify({ 
              errorMessage: 'OpenAI API quota exceeded',
              error: true,
              errorType: 'quota_exceeded',
              ...fallbackRecipe 
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Return fallback recipe for other errors
        const ingredientsArr = ingredients.split(',').map(i => i.trim());
        const fallbackRecipe = generateFallbackRecipe(
          ingredientsArr, 
          cuisine, 
          preferences, 
          maxCookingTime, 
          mealType, 
          servings
        );
        
        return new Response(
          JSON.stringify({ 
            errorMessage: 'Failed to generate recipe',
            error: true,
            ...fallbackRecipe 
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await response.json();
      const recipeContent = data.choices[0].message.content;
      
      console.log('OpenAI response:', recipeContent);
      
      // Parse the JSON response
      let recipe;
      try {
        recipe = JSON.parse(recipeContent);
      } catch (error) {
        console.error('Error parsing OpenAI response:', error);
        const ingredientsArr = ingredients.split(',').map(i => i.trim());
        const fallbackRecipe = generateFallbackRecipe(
          ingredientsArr, 
          cuisine, 
          preferences, 
          maxCookingTime, 
          mealType, 
          servings
        );
        
        return new Response(
          JSON.stringify({ 
            errorMessage: 'Failed to parse recipe data',
            error: true,
            ...fallbackRecipe 
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Format the YouTube URL
      const searchQuery = `how to cook ${recipe.name}`;
      recipe.youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;

      return new Response(
        JSON.stringify(recipe),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('OpenAI API call error:', error);
      
      // For demo purposes, if the API call fails, return a fallback recipe
      const ingredientsArr = ingredients.split(',').map(i => i.trim());
      const fallbackRecipe = generateFallbackRecipe(
        ingredientsArr, 
        cuisine, 
        preferences, 
        maxCookingTime, 
        mealType, 
        servings
      );
      
      return new Response(
        JSON.stringify({ 
          errorMessage: 'Error calling OpenAI API',
          error: true,
          ...fallbackRecipe 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in generate-recipe function:', error);
    return new Response(
      JSON.stringify({ 
        errorMessage: error.message,
        error: true,
        ...generateFallbackRecipe(['food'], 'any', [], 60, 'any', 2)
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to generate a fallback recipe when OpenAI API fails
function generateFallbackRecipe(
  ingredients: string[], 
  cuisine = 'any', 
  preferences: string[] = [],
  maxCookingTime = 60,
  mealType = 'any',
  servings = 2
) {
  const mainIngredient = ingredients[0] || 'food';
  
  let cuisinePrefix = '';
  if (cuisine !== 'any') {
    cuisinePrefix = `${cuisine.charAt(0).toUpperCase() + cuisine.slice(1)} `;
  }
  
  let dietaryPrefix = '';
  if (preferences && preferences.length > 0 && !preferences.includes('none')) {
    const mainPreference = preferences[0];
    dietaryPrefix = `${mainPreference.charAt(0).toUpperCase() + mainPreference.slice(1)} `;
  }

  let mealTypePrefix = '';
  if (mealType !== 'any') {
    mealTypePrefix = `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} `;
  }
  
  const cookingTime = Math.min(20, maxCookingTime);
  
  return {
    name: `${cuisinePrefix}${dietaryPrefix}${mealTypePrefix}${mainIngredient.charAt(0).toUpperCase() + mainIngredient.slice(1)} Delight`,
    haveIngredients: ingredients,
    needIngredients: [
      "1 teaspoon olive oil",
      "Salt and pepper to taste",
      "2 cloves garlic",
      "1 small onion",
      "Fresh herbs (optional)"
    ],
    steps: [
      `1. Prepare the ${mainIngredient} by washing and cutting it into bite-sized pieces.`,
      "2. Heat olive oil in a pan over medium heat.",
      "3. Add garlic and onion, sauté until fragrant.",
      `4. Add the ${mainIngredient} and cook until done.`,
      "5. Season with salt and pepper to taste.",
      "6. Garnish with fresh herbs if available.",
      "7. Serve hot and enjoy your meal!"
    ],
    prepTime: "15 minutes",
    cookTime: `${cookingTime} minutes`,
    servings: servings,
    difficulty: "easy",
    nutritionalInfo: {
      calories: "~300 kcal per serving",
      protein: "varies based on ingredients",
      carbs: "varies based on ingredients",
      fats: "varies based on ingredients"
    },
    tips: [
      `For best results, use fresh ${mainIngredient}.`,
      "You can substitute olive oil with butter for a richer flavor.",
      "This recipe is perfect for beginners!"
    ],
    youtubeUrl: `https://www.youtube.com/results?search_query=how+to+cook+${encodeURIComponent(mainIngredient)}`
  };
}
