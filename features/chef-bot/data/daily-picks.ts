export type RecipeCategory = "savory" | "snack" | "dessert";

export interface DailyPick {
  title: string;
  category: RecipeCategory;
  content: string;
}

const allRecipes: DailyPick[] = [
  // Savory
  {
    title: "Creamy Mushroom Risotto",
    category: "savory",
    content: `Ingredients:
- 1 cup Arborio rice
- 1/2 cup white wine
- 4 cups vegetable broth
- 1 cup mushrooms, sliced
- 1 onion, diced
- 2 cloves garlic
- Parmesan & butter

Instructions:
1. Sauté aromatics and mushrooms.
2. Toast rice, deglaze with wine.
3. Add broth gradually, stirring often.
4. Finish with cheese and butter.`,
  },
  {
    title: "Spaghetti Aglio e Olio",
    category: "savory",
    content: `Ingredients:
- 400g spaghetti
- 6 cloves garlic, thinly sliced
- 1/2 cup olive oil
- 1 tsp red pepper flakes
- Parsley

Instructions:
1. Boil pasta in salted water.
2. Sauté garlic in oil until golden.
3. Add pepper flakes and pasta water.
4. Toss pasta in sauce, garnish with parsley.`,
  },
  {
    title: "Caprese Salad",
    category: "savory",
    content: `Ingredients:
- Fresh mozzarella
- Tomatoes
- Fresh basil
- Balsamic glaze
- Olive oil

Instructions:
1. Slice tomatoes and mozzarella.
2. Layer with basil leaves.
3. Drizzle with oil and balsamic. Season with salt/pepper.`,
  },
  // Snacks
  {
    title: "Avocado Toast with Egg",
    category: "snack",
    content: `Ingredients:
- Sourdough slice
- 1/2 avocado
- 1 egg
- Chili flakes

Instructions:
1. Toast bread.
2. Mash avocado with lemon/salt.
3. Top with fried egg and chili flakes.`,
  },
  {
    title: "Greek Yogurt Parfait",
    category: "snack",
    content: `Ingredients:
- 1 cup Greek yogurt
- 1/2 cup granola
- Fresh berries
- Honey

Instructions:
1. Layer yogurt, granola, and berries.
2. Drizzle with honey.`,
  },
  {
    title: "Hummus & Veggie Sticks",
    category: "snack",
    content: `Ingredients:
- 1 cup chickpeas
- 2 tbsp tahini
- Lemon juice & garlic
- Carrots/Cucumber for dipping

Instructions:
1. Blend chickpeas, tahini, lemon, garlic.
2. Serve with sliced veggies.`,
  },
  // Desserts
  {
    title: "Chocolate Lava Cake",
    category: "dessert",
    content: `Ingredients:
- 100g dark chocolate
- 100g butter
- 2 eggs
- Sugar & flour

Instructions:
1. Melt choc/butter.
2. Whisk eggs/sugar. Combine.
3. Bake 12 mins at 200C. Center should be gooey.`,
  },
  {
    title: "Berry Crumble",
    category: "dessert",
    content: `Ingredients:
- 2 cups mixed berries
- 1 cup oats
- 1/2 cup flour
- 1/2 cup brown sugar
- Butter

Instructions:
1. Mix berries with sugar.
2. Mix oats/flour/butter for topping.
3. Bake 20 mins at 180C.`,
  },
  {
    title: "Banana Bread",
    category: "dessert",
    content: `Ingredients:
- 3 ripe bananas
- 1/3 cup melted butter
- 1 egg
- 1.5 cups flour
- Sugar/Salt/Baking soda

Instructions:
1. Mash bananas. Mix in butter/egg/sugar.
2. Fold in dry ingredients.
3. Bake 50 mins at 175C.`,
  },
];

export function getDailyPicks(): DailyPick[] {
  const today = new Date();
  const seedString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    const char = seedString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  const random = (min: number, max: number, salt: number) => {
    const x = Math.sin(Math.abs(hash) + salt) * 10000;
    return Math.floor((x - Math.floor(x)) * (max - min)) + min;
  };

  const savoryOptions = allRecipes.filter((r) => r.category === "savory");
  const snackOptions = allRecipes.filter((r) => r.category === "snack");
  const dessertOptions = allRecipes.filter((r) => r.category === "dessert");

  const savoryPick = savoryOptions[random(0, savoryOptions.length, 1)];
  const snackPick = snackOptions[random(0, snackOptions.length, 2)];
  const dessertPick = dessertOptions[random(0, dessertOptions.length, 3)];

  return [savoryPick, snackPick, dessertPick].filter(Boolean);
}

export const dailyPicks = getDailyPicks();
