## Project info

**URL**: https://codechef-sigma.vercel.app/

# 🍽️ CodeChef

**Tech Stack**:  
Frontend — Vite, TypeScript, React, Tailwind CSS, [shadcn/ui](https://ui.shadcn.com/)  
Backend — Supabase (Auth, Database)

---

## 🧠 Overview

**CodeChef** is a smart recipe-generating app designed to create custom meal ideas based on user preferences, allergies, nutritional deficiencies, cuisine types, and available home ingredients.

It not only suggests a full recipe with steps and prep time but also includes a shopping list for missing ingredients and a YouTube tutorial link for beginners.

---

## ⚙️ Core Features

- 🔧 **Smart Input Form**  
  Collects food preferences, allergies, deficiencies, cuisine type, and available ingredients.

- 🍲 **Dynamic Recipe Generation**  
  Displays recipe name, steps, ingredients (what you have vs. what you need), and prep/cook time.

- 🛒 **Shopping List Generator**  
  Automatically creates a list of missing ingredients with copy functionality.

- 📺 **YouTube Tutorial Link**  
  Adds a video link for step-by-step cooking help.

- 🧾 **User Accounts (Optional)**  
  Users can log in via email or Google to save recipes and preferences.

---

## 📄 Page Structure

### 1. **Header**
- **Left**: App name ("CodeChef")  
- **Right**: Navigation (`Home`, `My Recipes`, `Log In/Sign Up`)  
- **Responsive**: Hamburger menu on mobile  
- **Styled With**: Tailwind CSS + shadcn-ui (white background, green/orange accents)

---

### 2. **Input Form**
Form fields include:
- Preferences (e.g., Vegetarian, Spicy)  
- Allergies (e.g., Nuts, Dairy)  
- Deficiencies (e.g., Iron, Vitamin D)  
- Cuisine (e.g., Italian, Indian)  
- Ingredients (e.g., "chicken, rice")

**Features**:
- Validates required fields
- Responsive vertical layout on mobile
- Styled with shadcn-ui & Tailwind (rounded inputs, green buttons)

---

### 3. **Generate Recipe Button**
- Label: `Generate Recipe`
- Tailwind style: `bg-green-500 hover:bg-green-600`
- Trigger: Displays recipe (currently using dummy data)

---

### 4. **Recipe Output Section**
Displays a detailed card with:
- Recipe Name (e.g., *Spicy Chicken Curry*)
- Ingredients:
  - ✅ What You Have (e.g., Chicken, Rice)
  - ❌ What You Need (e.g., Coconut Milk, Curry Powder)
- Steps (e.g., 1. Chop onions, 2. Cook chicken…)
- Prep/Cook Time
- YouTube Link (embed/dummy URL)
- Shopping List (with copy button)

**Responsive + Styled**:
- shadcn-ui Cards
- Tailwind utilities: `shadow-md`, large text

---

## 🧪 Example (Dummy Data)

**Input**:
- Preferences: Spicy  
- Allergies: None  
- Deficiency: Iron  
- Cuisine: Indian  
- Ingredients: Chicken, Rice

**Generated Output**:
- **Name**: Spicy Chicken Curry  
- **Have**: Chicken, Rice  
- **Need**: Coconut Milk, Curry Powder  
- **Steps**:
  1. Chop onions  
  2. Cook chicken  
  3. Add spices, etc.  
- **Time**: Prep 10 min / Cook 30 min  
- **YouTube**: [Dummy Link](https://youtube.com/dummy)  
- **Shopping List**:  
  - Coconut Milk (1 can)  
  - Curry Powder (2 tbsp)

---

## 🔐 Supabase Integration

- **Auth**: Optional Email/Google login  
- **Database**:  
  - `users` table for storing user info  
  - `recipes` table for saved recipes  
- Saves form inputs and generated recipes for logged-in users

---

## 🎨 Design & UX

- Built with **shadcn-ui** + **Tailwind CSS**  
- Responsive layouts for all devices  
- High-contrast, readable fonts  
- Clean and intuitive interface  
- Green/Orange theme accents

---

## 📝 Notes & Suggestions

- [ ] Connect form to Supabase for saving data  
- [ ] Use AI (e.g., Lovable) to dynamically generate recipes  
- [ ] Add tooltips or beginner cooking tips  
- [ ] Allow manual YouTube link entry if needed

---

## 🚀 Getting Started

1. Clone the repo:
   ```bash
   git clone https://github.com/deepjyotiD/codechef.git
   cd codechef

