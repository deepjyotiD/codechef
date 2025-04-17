
import { useState, FormEvent } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Input } from './ui/input';
import { Utensils, Clock } from 'lucide-react';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';

export type PreferenceOption = 'vegetarian' | 'vegan' | 'gluten-free' | 'low-carb' | 'high-protein' | 'spicy' | 'low-sodium' | 'none';
export type AllergyOption = 'dairy' | 'nuts' | 'shellfish' | 'gluten' | 'egg' | 'soy' | 'fish' | 'none';
export type DeficiencyOption = 'iron' | 'calcium' | 'protein' | 'vitamin-d' | 'vitamin-c' | 'omega-3' | 'fiber' | 'none';
export type CuisineOption = 'italian' | 'indian' | 'mexican' | 'chinese' | 'japanese' | 'thai' | 'american' | 'mediterranean' | 'french' | 'any';
export type RecipeFormData = {
  preferences: PreferenceOption[];
  allergies: AllergyOption[];
  deficiencies: DeficiencyOption[];
  cuisine: CuisineOption;
  ingredients: string;
  maxCookingTime?: number;
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'dessert' | 'snack' | 'any';
  servings?: number;
};

interface RecipeFormProps {
  onSubmit: (data: RecipeFormData) => void;
  isLoading: boolean;
}

const RecipeForm = ({ onSubmit, isLoading }: RecipeFormProps) => {
  const [preferences, setPreferences] = useState<PreferenceOption[]>([]);
  const [allergies, setAllergies] = useState<AllergyOption[]>([]);
  const [deficiencies, setDeficiencies] = useState<DeficiencyOption[]>([]);
  const [cuisine, setCuisine] = useState<CuisineOption>('any');
  const [ingredients, setIngredients] = useState('');
  const [maxCookingTime, setMaxCookingTime] = useState<number>(60);
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'dessert' | 'snack' | 'any'>('any');
  const [servings, setServings] = useState<number>(2);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      preferences,
      allergies,
      deficiencies,
      cuisine,
      ingredients,
      maxCookingTime,
      mealType,
      servings,
    });
  };

  const handleSelectPreference = (value: PreferenceOption) => {
    if (value === 'none') {
      setPreferences([]);
    } else {
      if (preferences.includes(value)) {
        setPreferences(preferences.filter(pref => pref !== value));
      } else {
        setPreferences([...preferences, value]);
      }
    }
  };

  const handleSelectAllergy = (value: AllergyOption) => {
    if (value === 'none') {
      setAllergies([]);
    } else {
      if (allergies.includes(value)) {
        setAllergies(allergies.filter(allergy => allergy !== value));
      } else {
        setAllergies([...allergies, value]);
      }
    }
  };

  const handleSelectDeficiency = (value: DeficiencyOption) => {
    if (value === 'none') {
      setDeficiencies([]);
    } else {
      if (deficiencies.includes(value)) {
        setDeficiencies(deficiencies.filter(deficiency => deficiency !== value));
      } else {
        setDeficiencies([...deficiencies, value]);
      }
    }
  };

  const isFormValid = ingredients.trim().length > 0 && cuisine;

  return (
    <Card className="p-6 shadow-md bg-white">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Find Your Perfect Recipe</h2>
        
        {/* Preferences */}
        <div className="space-y-2">
          <Label htmlFor="preferences">Dietary Preferences</Label>
          <div className="flex flex-wrap gap-2">
            {['vegetarian', 'vegan', 'gluten-free', 'low-carb', 'high-protein', 'spicy', 'low-sodium', 'none'].map((pref) => (
              <Badge 
                key={pref}
                className={`cursor-pointer ${
                  preferences.includes(pref as PreferenceOption) || (pref === 'none' && preferences.length === 0)
                    ? 'bg-recipe-primary hover:bg-recipe-primary/80' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => handleSelectPreference(pref as PreferenceOption)}
              >
                {pref === 'none' ? 'No Preference' : pref.charAt(0).toUpperCase() + pref.slice(1).replace('-', ' ')}
              </Badge>
            ))}
          </div>
        </div>

        {/* Allergies */}
        <div className="space-y-2">
          <Label htmlFor="allergies">Food Allergies</Label>
          <div className="flex flex-wrap gap-2">
            {['dairy', 'nuts', 'shellfish', 'gluten', 'egg', 'soy', 'fish', 'none'].map((allergy) => (
              <Badge 
                key={allergy}
                className={`cursor-pointer ${
                  allergies.includes(allergy as AllergyOption) || (allergy === 'none' && allergies.length === 0)
                    ? 'bg-recipe-secondary hover:bg-recipe-secondary/80' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => handleSelectAllergy(allergy as AllergyOption)}
              >
                {allergy === 'none' ? 'No Allergies' : allergy.charAt(0).toUpperCase() + allergy.slice(1)}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Deficiencies */}
        <div className="space-y-2">
          <Label htmlFor="deficiencies">Nutritional Focus</Label>
          <div className="flex flex-wrap gap-2">
            {['iron', 'calcium', 'protein', 'vitamin-d', 'vitamin-c', 'omega-3', 'fiber', 'none'].map((def) => (
              <Badge 
                key={def}
                className={`cursor-pointer ${
                  deficiencies.includes(def as DeficiencyOption) || (def === 'none' && deficiencies.length === 0)
                    ? 'bg-recipe-primary hover:bg-recipe-primary/80' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => handleSelectDeficiency(def as DeficiencyOption)}
              >
                {def === 'none' ? 'No Focus' : def === 'vitamin-d' ? 'Vitamin D' : def === 'vitamin-c' ? 'Vitamin C' : def === 'omega-3' ? 'Omega 3' : def.charAt(0).toUpperCase() + def.slice(1)}
              </Badge>
            ))}
          </div>
        </div>

        {/* Cuisine */}
        <div className="space-y-2">
          <Label htmlFor="cuisine">Cuisine Type</Label>
          <Select 
            value={cuisine} 
            onValueChange={(value) => setCuisine(value as CuisineOption)}
          >
            <SelectTrigger id="cuisine">
              <SelectValue placeholder="Select cuisine type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="any">Any Cuisine</SelectItem>
                <SelectItem value="italian">Italian</SelectItem>
                <SelectItem value="indian">Indian</SelectItem>
                <SelectItem value="mexican">Mexican</SelectItem>
                <SelectItem value="chinese">Chinese</SelectItem>
                <SelectItem value="japanese">Japanese</SelectItem>
                <SelectItem value="thai">Thai</SelectItem>
                <SelectItem value="american">American</SelectItem>
                <SelectItem value="mediterranean">Mediterranean</SelectItem>
                <SelectItem value="french">French</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Ingredients */}
        <div className="space-y-2">
          <Label htmlFor="ingredients">Ingredients You Have</Label>
          <Input
            id="ingredients"
            placeholder="e.g., chicken, rice, onions, garlic"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            required
            className="border-gray-300"
          />
          <p className="text-xs text-gray-500">Please separate ingredients with commas</p>
        </div>

        {/* Advanced Options Toggle */}
        <Button 
          type="button" 
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full border-dashed"
        >
          {showAdvanced ? "Hide Advanced Options" : "Show Advanced Options"}
        </Button>
        
        {showAdvanced && (
          <div className="space-y-6 p-4 bg-gray-50 rounded-md">
            {/* Max Cooking Time */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="maxCookingTime">Max Cooking Time: {maxCookingTime} minutes</Label>
              </div>
              <Slider 
                id="maxCookingTime"
                min={15} 
                max={120} 
                step={5}
                value={[maxCookingTime]}
                onValueChange={(values) => setMaxCookingTime(values[0])}
                className="py-4"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>15min</span>
                <span>1hr</span>
                <span>2hrs</span>
              </div>
            </div>
            
            {/* Meal Type */}
            <div className="space-y-2">
              <Label htmlFor="mealType">Meal Type</Label>
              <Select 
                value={mealType} 
                onValueChange={(value) => setMealType(value as any)}
              >
                <SelectTrigger id="mealType">
                  <SelectValue placeholder="Select meal type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="any">Any Type</SelectItem>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="dessert">Dessert</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            {/* Servings */}
            <div className="space-y-2">
              <Label htmlFor="servings">Servings</Label>
              <Select 
                value={servings.toString()} 
                onValueChange={(value) => setServings(parseInt(value))}
              >
                <SelectTrigger id="servings">
                  <SelectValue placeholder="Select number of servings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? 'person' : 'people'}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full bg-recipe-primary text-white hover:bg-recipe-primary/90 transition-colors"
          disabled={!isFormValid || isLoading}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            <>
              <Utensils className="mr-2 h-5 w-5" /> Generate Recipe
            </>
          )}
        </Button>
      </form>
    </Card>
  );
};

export default RecipeForm;
