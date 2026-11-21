export type StorageZone = "refrigerated" | "frozen";
export type FoodCategory = "Staples" | "Produce" | "Protein" | "Drinks & Condiments";

export interface FridgeItem {
  id: string;
  name: string;
  category: FoodCategory;
  emoji: string;
  zone: StorageZone;
  servings: number;
  daysLeft: number;
  shelfLifeDays: number;
  frozenShelfLifeDays: number;
  dateAdded: string;
  expirationDate: string;
  storageTip: string;
}

export interface CatalogItem {
  id: string;
  name: string;
  category: FoodCategory;
  emoji: string;
  recommendedZone: StorageZone;
  defaultShelfLifeRefrigerated: number;
  defaultShelfLifeFrozen: number;
  dateAdded: string;
  expirationDate: string;
  storageGuide: string;
}

export interface Recipe {
  id: string;
  title: string;
  time: string;
  difficulty: string;
  emoji: string;
  mealType: "Breakfast" | "Lunch" | "Dinner";
  ingredients: {
    id: string;
    name: string;
    emoji: string;
    servingsUsed: number;
  }[];
  steps: {
    title: string;
    description: string;
  }[];
}

export type MealSlotStatus = "planned" | "cooked" | "dining_out";

export interface MealSlot {
  mealType: "Breakfast" | "Lunch" | "Dinner";
  status: MealSlotStatus;
  recipeId: string;
  itemsPreview: { name: string; emoji: string }[];
}

export interface DaySchedule {
  date: string; // "01" .. "31"
  dayName: string; // "Sun" .. "Sat"
  meals: {
    Breakfast: MealSlot;
    Lunch: MealSlot;
    Dinner: MealSlot;
  };
}

export interface SuggestedBaseItem {
  id: string;
  name: string;
  fridgeMatchKey: string;
  category: "Staples" | "Produce" | "Protein" | "Drinks & Condiments";
  emoji: string;
  recommendedZone: StorageZone;
  shelfLifeDays: number;
  defaultBuyServings: number;
  unit: string;
}

// Realistic 9 total servings in My Fridge for 1 diner (Matches Screens #11 & #12)
export const INITIAL_FRIDGE_ITEMS: FridgeItem[] = [
  {
    id: "milk",
    name: "Milk",
    category: "Drinks & Condiments",
    emoji: "🥛",
    zone: "refrigerated",
    servings: 2,
    daysLeft: 1,
    shelfLifeDays: 7,
    frozenShelfLifeDays: 30,
    dateAdded: "25-11-30",
    expirationDate: "25-12-06",
    storageTip: "Keep on the middle shelf at 3°C away from the fridge door.",
  },
  {
    id: "steamed-bun",
    name: "Steamed Bun",
    category: "Staples",
    emoji: "🥟",
    zone: "refrigerated",
    servings: 1,
    daysLeft: 2,
    shelfLifeDays: 4,
    frozenShelfLifeDays: 60,
    dateAdded: "25-12-04",
    expirationDate: "25-12-07",
    storageTip: "Seal in an airtight bag; transfer to freezer if keeping past 48h.",
  },
  {
    id: "potatoes",
    name: "Potatoes",
    category: "Staples",
    emoji: "🥔",
    zone: "refrigerated",
    servings: 2,
    daysLeft: 4,
    shelfLifeDays: 10,
    frozenShelfLifeDays: 90,
    dateAdded: "25-12-03",
    expirationDate: "25-12-09",
    storageTip: "Store in a breathable paper bag in the low-humidity drawer.",
  },
  {
    id: "blueberries",
    name: "Frozen Blueberries",
    category: "Produce",
    emoji: "🫐",
    zone: "frozen",
    servings: 1,
    daysLeft: 20,
    shelfLifeDays: 5,
    frozenShelfLifeDays: 60,
    dateAdded: "25-11-28",
    expirationDate: "25-12-25",
    storageTip: "Keep frozen at -18°C; rinse only right before eating.",
  },
  {
    id: "dumplings",
    name: "Frozen Dumplings",
    category: "Staples",
    emoji: "🥟",
    zone: "frozen",
    servings: 1,
    daysLeft: 120,
    shelfLifeDays: 3,
    frozenShelfLifeDays: 150,
    dateAdded: "25-10-15",
    expirationDate: "26-04-04",
    storageTip: "Press air out of the pouch after each use to prevent freezer burn.",
  },
  {
    id: "steak",
    name: "Steak",
    category: "Protein",
    emoji: "🥩",
    zone: "frozen",
    servings: 1,
    daysLeft: 150,
    shelfLifeDays: 3,
    frozenShelfLifeDays: 180,
    dateAdded: "25-11-20",
    expirationDate: "26-05-04",
    storageTip: "Thaw in the refrigerator 12 hours before cooking.",
  },
  {
    id: "ice-cream",
    name: "Ice Cream",
    category: "Drinks & Condiments",
    emoji: "🍨",
    zone: "frozen",
    servings: 1,
    daysLeft: 180,
    shelfLifeDays: 1,
    frozenShelfLifeDays: 180,
    dateAdded: "25-10-15",
    expirationDate: "26-06-02",
    storageTip: "Store at the back of the freezer where temperature stays steady.",
  },
];

// Matches Screen #3 (Recent Entries)
export const RECENT_ENTRIES: CatalogItem[] = [
  {
    id: "rec-milk",
    name: "Milk",
    category: "Drinks & Condiments",
    emoji: "🥛",
    recommendedZone: "refrigerated",
    defaultShelfLifeRefrigerated: 7,
    defaultShelfLifeFrozen: 30,
    dateAdded: "25-11-30",
    expirationDate: "25-12-07",
    storageGuide: "Store on the middle interior shelf at 3°C.",
  },
  {
    id: "rec-blueberries",
    name: "Blueberries",
    category: "Produce",
    emoji: "🫐",
    recommendedZone: "frozen",
    defaultShelfLifeRefrigerated: 5,
    defaultShelfLifeFrozen: 60,
    dateAdded: "25-11-30",
    expirationDate: "25-12-25",
    storageGuide: "Freeze unwashed in a sealed container.",
  },
  {
    id: "rec-eggs",
    name: "Eggs",
    category: "Protein",
    emoji: "🥚",
    recommendedZone: "refrigerated",
    defaultShelfLifeRefrigerated: 21,
    defaultShelfLifeFrozen: 60,
    dateAdded: "25-11-30",
    expirationDate: "25-12-21",
    storageGuide: "Keep pointed-end down inside the carton.",
  },
  {
    id: "rec-dumplings",
    name: "Dumplings",
    category: "Staples",
    emoji: "🥟",
    recommendedZone: "frozen",
    defaultShelfLifeRefrigerated: 2,
    defaultShelfLifeFrozen: 120,
    dateAdded: "25-11-30",
    expirationDate: "26-03-30",
    storageGuide: "Keep sealed in the freezer at -18°C.",
  },
  {
    id: "rec-steak",
    name: "Steak",
    category: "Protein",
    emoji: "🥩",
    recommendedZone: "frozen",
    defaultShelfLifeRefrigerated: 3,
    defaultShelfLifeFrozen: 150,
    dateAdded: "25-11-30",
    expirationDate: "26-04-30",
    storageGuide: "Refrigerate if cooking within 3 days, otherwise freeze.",
  },
  {
    id: "rec-icecream",
    name: "Ice Cream",
    category: "Drinks & Condiments",
    emoji: "🍨",
    recommendedZone: "frozen",
    defaultShelfLifeRefrigerated: 1,
    defaultShelfLifeFrozen: 180,
    dateAdded: "25-11-30",
    expirationDate: "26-05-30",
    storageGuide: "Keep in the deepest part of the freezer.",
  },
  {
    id: "rec-sushi",
    name: "Sushi",
    category: "Staples",
    emoji: "🍣",
    recommendedZone: "refrigerated",
    defaultShelfLifeRefrigerated: 1,
    defaultShelfLifeFrozen: 14,
    dateAdded: "25-11-30",
    expirationDate: "25-12-01",
    storageGuide: "Consume within 24 hours while chilled at 3°C.",
  },
  {
    id: "rec-rice",
    name: "Cooked Rice",
    category: "Staples",
    emoji: "🍚",
    recommendedZone: "frozen",
    defaultShelfLifeRefrigerated: 2,
    defaultShelfLifeFrozen: 30,
    dateAdded: "25-11-30",
    expirationDate: "25-12-30",
    storageGuide: "Portion and freeze warm rice; microwave 2 min before eating.",
  },
  {
    id: "rec-chicken",
    name: "Chicken",
    category: "Protein",
    emoji: "🍗",
    recommendedZone: "refrigerated",
    defaultShelfLifeRefrigerated: 2,
    defaultShelfLifeFrozen: 120,
    dateAdded: "25-11-30",
    expirationDate: "25-12-02",
    storageGuide: "Store on the lowest refrigerator shelf or freeze in portions.",
  },
];

// Matches Screen #6 (Manual Entry 3x3 Grid)
export const CATALOG_ITEMS: CatalogItem[] = [
  {
    id: "cat-bread",
    name: "Bread",
    category: "Staples",
    emoji: "🍞",
    recommendedZone: "frozen",
    defaultShelfLifeRefrigerated: 4,
    defaultShelfLifeFrozen: 45,
    dateAdded: "25-11-30",
    expirationDate: "25-12-05",
    storageGuide: "Freeze sliced bread to prevent drying out, and toast straight from frozen.",
  },
  {
    id: "cat-corn",
    name: "Corn",
    category: "Staples",
    emoji: "🌽",
    recommendedZone: "refrigerated",
    defaultShelfLifeRefrigerated: 5,
    defaultShelfLifeFrozen: 90,
    dateAdded: "25-11-30",
    expirationDate: "25-12-05",
    storageGuide: "Keep husks intact in the crisper drawer to retain sweetness.",
  },
  {
    id: "cat-potato",
    name: "Potatoes",
    category: "Staples",
    emoji: "🥔",
    recommendedZone: "refrigerated",
    defaultShelfLifeRefrigerated: 10,
    defaultShelfLifeFrozen: 90,
    dateAdded: "25-11-30",
    expirationDate: "25-12-10",
    storageGuide: "Store in a cool, dark paper bag away from onions.",
  },
  {
    id: "cat-eggs",
    name: "Eggs",
    category: "Protein",
    emoji: "🥚",
    recommendedZone: "refrigerated",
    defaultShelfLifeRefrigerated: 21,
    defaultShelfLifeFrozen: 60,
    dateAdded: "25-11-30",
    expirationDate: "25-12-21",
    storageGuide: "Store pointed-end down inside the original carton.",
  },
  {
    id: "cat-steak",
    name: "Steak",
    category: "Protein",
    emoji: "🥩",
    recommendedZone: "refrigerated",
    defaultShelfLifeRefrigerated: 3,
    defaultShelfLifeFrozen: 150,
    dateAdded: "25-11-30",
    expirationDate: "25-12-03",
    storageGuide: "Cook within 3 days if refrigerated, or freeze tightly wrapped.",
  },
  {
    id: "cat-chicken",
    name: "Chicken",
    category: "Protein",
    emoji: "🍗",
    recommendedZone: "refrigerated",
    defaultShelfLifeRefrigerated: 2,
    defaultShelfLifeFrozen: 120,
    dateAdded: "25-11-30",
    expirationDate: "25-12-02",
    storageGuide: "Store raw poultry on the lowest fridge shelf in a sealed box.",
  },
  {
    id: "cat-broccoli",
    name: "Broccoli",
    category: "Produce",
    emoji: "🥦",
    recommendedZone: "refrigerated",
    defaultShelfLifeRefrigerated: 5,
    defaultShelfLifeFrozen: 90,
    dateAdded: "25-11-30",
    expirationDate: "25-12-05",
    storageGuide: "Wrap loosely in a damp paper towel in the crisper drawer.",
  },
  {
    id: "cat-mushroom",
    name: "Mushrooms",
    category: "Produce",
    emoji: "🍄",
    recommendedZone: "refrigerated",
    defaultShelfLifeRefrigerated: 4,
    defaultShelfLifeFrozen: 45,
    dateAdded: "25-11-30",
    expirationDate: "25-12-04",
    storageGuide: "Keep unwashed in a brown paper bag to absorb moisture.",
  },
  {
    id: "cat-cabbage",
    name: "Cabbage",
    category: "Produce",
    emoji: "🥬",
    recommendedZone: "refrigerated",
    defaultShelfLifeRefrigerated: 14,
    defaultShelfLifeFrozen: 60,
    dateAdded: "25-11-30",
    expirationDate: "25-12-14",
    storageGuide: "Keep whole until needed; wrap cut edges with cling film.",
  },
];

// Additional alternative ingredients users can pick when clicking "+ Other" in Recipes
export const ALTERNATIVE_INGREDIENTS = [
  { id: "eggs", name: "Eggs", emoji: "🥚", servingsUsed: 1 },
  { id: "corn", name: "Corn", emoji: "🌽", servingsUsed: 1 },
  { id: "broccoli", name: "Broccoli", emoji: "🥦", servingsUsed: 1 },
  { id: "chicken", name: "Chicken", emoji: "🍗", servingsUsed: 1 },
  { id: "tofu", name: "Tofu", emoji: "🧈", servingsUsed: 1 },
  { id: "tomato", name: "Tomato", emoji: "🍅", servingsUsed: 1 },
  { id: "mushroom", name: "Mushroom", emoji: "🍄", servingsUsed: 1 },
  { id: "spinach", name: "Spinach", emoji: "🥬", servingsUsed: 1 },
];

// Recipes across Breakfast, Lunch, Dinner
export const RECIPES: Recipe[] = [
  // LUNCH RECIPES
  {
    id: "pan-seared-steak",
    title: "Pan-seared steak",
    time: "20min",
    difficulty: "Easy to make",
    emoji: "🥩",
    mealType: "Lunch",
    ingredients: [
      { id: "steak", name: "Steak", emoji: "🥩", servingsUsed: 1 },
      { id: "potatoes", name: "Potatoes", emoji: "🥔", servingsUsed: 1 },
      { id: "garlic", name: "Garlic", emoji: "🧄", servingsUsed: 1 },
      { id: "pepper", name: "Pepper", emoji: "🧂", servingsUsed: 1 },
    ],
    steps: [
      {
        title: "Thaw",
        description:
          "Bring the steak to room temperature for 20 minutes and pat dry with paper towels.",
      },
      {
        title: "Season",
        description:
          "Season both sides generously with sea salt and freshly ground black pepper.",
      },
      {
        title: "Preheat the Pan",
        description:
          "Heat a heavy skillet over high heat until smoking, then add cooking oil.",
      },
      {
        title: "Pan-sear",
        description:
          "Sear for 2–3 minutes per side until a deep golden-brown crust forms.",
      },
      {
        title: "Add Butter & Aromatics",
        description:
          "Add butter, crushed garlic, and rosemary, basting the melted butter over the steak.",
      },
      {
        title: "Rest the Steak",
        description:
          "Let rest on a warm plate for 5 minutes before slicing and serving.",
      },
    ],
  },
  {
    id: "potato-chicken-stew",
    title: "Braised Chicken",
    time: "25min",
    difficulty: "Easy to make",
    emoji: "🍲",
    mealType: "Lunch",
    ingredients: [
      { id: "potatoes", name: "Potatoes", emoji: "🥔", servingsUsed: 1 },
      { id: "chicken", name: "Chicken", emoji: "🍗", servingsUsed: 1 },
      { id: "garlic", name: "Garlic", emoji: "🧄", servingsUsed: 1 },
    ],
    steps: [
      {
        title: "Prep Ingredients",
        description: "Cut potatoes and chicken into bite-sized chunks.",
      },
      {
        title: "Sear Aromatics",
        description: "Sauté garlic and chicken in a hot pan until lightly golden.",
      },
      {
        title: "Simmer with Potatoes",
        description: "Add potatoes and water; cover and simmer 15 minutes.",
      },
    ],
  },
  {
    id: "veggie-salad-bowl",
    title: "Broccoli Egg Salad",
    time: "12min",
    difficulty: "Easy to make",
    emoji: "🥗",
    mealType: "Lunch",
    ingredients: [
      { id: "broccoli", name: "Broccoli", emoji: "🥦", servingsUsed: 1 },
      { id: "eggs", name: "Eggs", emoji: "🥚", servingsUsed: 1 },
      { id: "corn", name: "Corn", emoji: "🌽", servingsUsed: 1 },
    ],
    steps: [
      {
        title: "Blanch Broccoli",
        description: "Boil broccoli florets in salted water for 2 minutes until bright green.",
      },
      {
        title: "Toss & Season",
        description: "Toss warm florets with olive oil, boiled egg, and sweet corn.",
      },
    ],
  },
  // BREAKFAST RECIPES
  {
    id: "milk-bun-set",
    title: "Steamed Bun & Milk",
    time: "8min",
    difficulty: "Easy to make",
    emoji: "🥟",
    mealType: "Breakfast",
    ingredients: [
      { id: "steamed-bun", name: "Bun", emoji: "🥟", servingsUsed: 1 },
      { id: "milk", name: "Milk", emoji: "🥛", servingsUsed: 1 },
      { id: "blueberries", name: "Berries", emoji: "🫐", servingsUsed: 1 },
    ],
    steps: [
      {
        title: "Steam the Bun",
        description: "Steam the refrigerated bun over boiling water for 5 minutes until fluffy.",
      },
      {
        title: "Warm the Milk",
        description: "Heat fresh milk gently to 60°C and serve with blueberries.",
      },
    ],
  },
  {
    id: "blueberry-milk-bowl",
    title: "Berry Milk Smoothie",
    time: "5min",
    difficulty: "Easy to make",
    emoji: "🫐",
    mealType: "Breakfast",
    ingredients: [
      { id: "milk", name: "Milk", emoji: "🥛", servingsUsed: 1 },
      { id: "blueberries", name: "Berries", emoji: "🫐", servingsUsed: 1 },
    ],
    steps: [
      {
        title: "Blend Ingredients",
        description: "Blend cold milk and frozen blueberries for 45 seconds until smooth.",
      },
    ],
  },
  {
    id: "crispy-hash-breakfast",
    title: "Crispy Potato Hash",
    time: "15min",
    difficulty: "Easy to make",
    emoji: "🥔",
    mealType: "Breakfast",
    ingredients: [
      { id: "potatoes", name: "Potatoes", emoji: "🥔", servingsUsed: 1 },
      { id: "eggs", name: "Eggs", emoji: "🥚", servingsUsed: 1 },
    ],
    steps: [
      {
        title: "Dice & Pan-Fry",
        description: "Dice potatoes finely and pan-fry in oil for 10 minutes until golden crisp.",
      },
    ],
  },
  // DINNER RECIPES
  {
    id: "pan-fried-dumplings",
    title: "Crispy Dumplings",
    time: "15min",
    difficulty: "Easy to make",
    emoji: "🥟",
    mealType: "Dinner",
    ingredients: [
      { id: "dumplings", name: "Dumplings", emoji: "🥟", servingsUsed: 1 },
      { id: "garlic", name: "Garlic", emoji: "🧄", servingsUsed: 1 },
    ],
    steps: [
      {
        title: "Sear Base",
        description: "Place frozen dumplings in an oiled pan over medium heat for 2 minutes.",
      },
      {
        title: "Steam with Lid",
        description: "Add 1/4 cup water, cover, and steam for 6 minutes until cooked through.",
      },
    ],
  },
  {
    id: "garlic-steak-bites",
    title: "Garlic Steak Bites",
    time: "18min",
    difficulty: "Easy to make",
    emoji: "🥩",
    mealType: "Dinner",
    ingredients: [
      { id: "steak", name: "Steak", emoji: "🥩", servingsUsed: 1 },
      { id: "garlic", name: "Garlic", emoji: "🧄", servingsUsed: 1 },
      { id: "broccoli", name: "Broccoli", emoji: "🥦", servingsUsed: 1 },
    ],
    steps: [
      {
        title: "Cube & Sear",
        description: "Cut steak into bite-sized cubes and sear on high heat with garlic butter.",
      },
    ],
  },
  {
    id: "roast-potato-dinner",
    title: "Herbed Roast Potato",
    time: "20min",
    difficulty: "Easy to make",
    emoji: "🥔",
    mealType: "Dinner",
    ingredients: [
      { id: "potatoes", name: "Potatoes", emoji: "🥔", servingsUsed: 1 },
      { id: "garlic", name: "Garlic", emoji: "🧄", servingsUsed: 1 },
    ],
    steps: [
      {
        title: "Roast Wedges",
        description: "Toss potato wedges with crushed garlic and roast until crispy.",
      },
    ],
  },
];

// Full 31-day December 2025 schedule (Week 1 has 2 absences by default: Tue 03 Dinner & Fri 06 Dinner)
export const INITIAL_WEEK_SCHEDULE: DaySchedule[] = Array.from(
  { length: 31 },
  (_, idx) => {
    const dayNum = idx + 1;
    const date = String(dayNum).padStart(2, "0");
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayName = dayNames[idx % 7];
    const isGatheringDinner =
      date === "03" || date === "06" || date === "12" || date === "19" || date === "25";

    return {
      date,
      dayName,
      meals: {
        Breakfast: {
          mealType: "Breakfast",
          status: "planned",
          recipeId: "milk-bun-set",
          itemsPreview: [
            { name: "Steamed Bun", emoji: "🥟" },
            { name: "Milk", emoji: "🥛" },
            { name: "Banana", emoji: "🍌" },
          ],
        },
        Lunch: {
          mealType: "Lunch",
          status: "planned",
          recipeId: "pan-seared-steak",
          itemsPreview: [
            { name: "Pan-seared steak", emoji: "🥩" },
            { name: "Potatoes", emoji: "🥔" },
            { name: "Broccoli", emoji: "🥦" },
          ],
        },
        Dinner: {
          mealType: "Dinner",
          status: isGatheringDinner ? "dining_out" : "planned",
          recipeId: "pan-fried-dumplings",
          itemsPreview: [
            { name: "Dumplings", emoji: "🥟" },
            { name: "Blueberries", emoji: "🫐" },
            { name: "Ice Cream", emoji: "🍨" },
          ],
        },
      },
    };
  }
);

// Weekly Category Baseline Targets for 1 Diner (Realistic 15-18 home meals per week!)
// Total weekly baseline across all categories = 6 + 4 + 4 + 3 = 17 servings/week
export const CATEGORY_WEEKLY_TARGETS: Record<
  "Staples" | "Produce" | "Protein" | "Drinks & Condiments",
  number
> = {
  Staples: 6, // With 4 in fridge initially -> recommends buying 2-3 servings
  Produce: 4, // With 1 in fridge initially -> recommends buying 2-3 servings
  Protein: 3, // With 1 in fridge initially -> recommends buying 1-2 servings
  "Drinks & Condiments": 3, // With 3 in fridge initially -> 0 needed -> auto-collapses!
};

// Swipable options per category in Suggested List (default 1 serving per card so totals stay realistic)
export const SUGGESTED_BASE_CATALOG: SuggestedBaseItem[] = [
  // 1. STAPLES (6 options to swipe)
  {
    id: "sug-bread",
    name: "Bread",
    fridgeMatchKey: "bread",
    category: "Staples",
    emoji: "🍞",
    recommendedZone: "frozen",
    shelfLifeDays: 45,
    defaultBuyServings: 1,
    unit: "serving",
  },
  {
    id: "sug-corn",
    name: "Corn",
    fridgeMatchKey: "corn",
    category: "Staples",
    emoji: "🌽",
    recommendedZone: "refrigerated",
    shelfLifeDays: 5,
    defaultBuyServings: 1,
    unit: "serving",
  },
  {
    id: "sug-potato",
    name: "Potatoes",
    fridgeMatchKey: "potatoes",
    category: "Staples",
    emoji: "🥔",
    recommendedZone: "refrigerated",
    shelfLifeDays: 10,
    defaultBuyServings: 1,
    unit: "serving",
  },
  {
    id: "sug-rice",
    name: "Rice",
    fridgeMatchKey: "rice",
    category: "Staples",
    emoji: "🍚",
    recommendedZone: "refrigerated",
    shelfLifeDays: 14,
    defaultBuyServings: 1,
    unit: "serving",
  },
  {
    id: "sug-noodles",
    name: "Noodles",
    fridgeMatchKey: "noodles",
    category: "Staples",
    emoji: "🍜",
    recommendedZone: "refrigerated",
    shelfLifeDays: 7,
    defaultBuyServings: 1,
    unit: "serving",
  },
  {
    id: "sug-oats",
    name: "Oats",
    fridgeMatchKey: "oats",
    category: "Staples",
    emoji: "🥣",
    recommendedZone: "refrigerated",
    shelfLifeDays: 30,
    defaultBuyServings: 1,
    unit: "serving",
  },

  // 2. PRODUCE (6 options to swipe)
  {
    id: "sug-broccoli",
    name: "Broccoli",
    fridgeMatchKey: "broccoli",
    category: "Produce",
    emoji: "🥦",
    recommendedZone: "refrigerated",
    shelfLifeDays: 5,
    defaultBuyServings: 1,
    unit: "serving",
  },
  {
    id: "sug-carrots",
    name: "Carrots",
    fridgeMatchKey: "carrots",
    category: "Produce",
    emoji: "🥕",
    recommendedZone: "refrigerated",
    shelfLifeDays: 14,
    defaultBuyServings: 1,
    unit: "serving",
  },
  {
    id: "sug-cabbage",
    name: "Cabbage",
    fridgeMatchKey: "cabbage",
    category: "Produce",
    emoji: "🥬",
    recommendedZone: "refrigerated",
    shelfLifeDays: 14,
    defaultBuyServings: 1,
    unit: "serving",
  },
  {
    id: "sug-tomatoes",
    name: "Tomatoes",
    fridgeMatchKey: "tomato",
    category: "Produce",
    emoji: "🍅",
    recommendedZone: "refrigerated",
    shelfLifeDays: 6,
    defaultBuyServings: 1,
    unit: "serving",
  },
  {
    id: "sug-mushrooms",
    name: "Mushrooms",
    fridgeMatchKey: "mushroom",
    category: "Produce",
    emoji: "🍄",
    recommendedZone: "refrigerated",
    shelfLifeDays: 4,
    defaultBuyServings: 1,
    unit: "serving",
  },
  {
    id: "sug-avocado",
    name: "Avocado",
    fridgeMatchKey: "avocado",
    category: "Produce",
    emoji: "🥑",
    recommendedZone: "refrigerated",
    shelfLifeDays: 5,
    defaultBuyServings: 1,
    unit: "serving",
  },

  // 3. PROTEIN (6 options to swipe)
  {
    id: "sug-eggs",
    name: "Eggs",
    fridgeMatchKey: "eggs",
    category: "Protein",
    emoji: "🥚",
    recommendedZone: "refrigerated",
    shelfLifeDays: 21,
    defaultBuyServings: 1,
    unit: "serving",
  },
  {
    id: "sug-chicken",
    name: "Chicken",
    fridgeMatchKey: "chicken",
    category: "Protein",
    emoji: "🍗",
    recommendedZone: "refrigerated",
    shelfLifeDays: 2,
    defaultBuyServings: 1,
    unit: "serving",
  },
  {
    id: "sug-steak",
    name: "Steak",
    fridgeMatchKey: "steak",
    category: "Protein",
    emoji: "🥩",
    recommendedZone: "frozen",
    shelfLifeDays: 150,
    defaultBuyServings: 1,
    unit: "serving",
  },
  {
    id: "sug-salmon",
    name: "Salmon",
    fridgeMatchKey: "salmon",
    category: "Protein",
    emoji: "🐟",
    recommendedZone: "frozen",
    shelfLifeDays: 90,
    defaultBuyServings: 1,
    unit: "serving",
  },
  {
    id: "sug-tofu",
    name: "Tofu",
    fridgeMatchKey: "tofu",
    category: "Protein",
    emoji: "🧈",
    recommendedZone: "refrigerated",
    shelfLifeDays: 5,
    defaultBuyServings: 1,
    unit: "serving",
  },
  {
    id: "sug-shrimp",
    name: "Shrimp",
    fridgeMatchKey: "shrimp",
    category: "Protein",
    emoji: "🦐",
    recommendedZone: "frozen",
    shelfLifeDays: 90,
    defaultBuyServings: 1,
    unit: "serving",
  },

  // 4. DRINKS & CONDIMENTS (5 options to swipe)
  {
    id: "sug-milk",
    name: "Milk",
    fridgeMatchKey: "milk",
    category: "Drinks & Condiments",
    emoji: "🥛",
    recommendedZone: "refrigerated",
    shelfLifeDays: 7,
    defaultBuyServings: 1,
    unit: "bottle",
  },
  {
    id: "sug-soy",
    name: "Soy Sauce",
    fridgeMatchKey: "soy",
    category: "Drinks & Condiments",
    emoji: "🍶",
    recommendedZone: "refrigerated",
    shelfLifeDays: 90,
    defaultBuyServings: 1,
    unit: "bottle",
  },
  {
    id: "sug-oil",
    name: "Olive Oil",
    fridgeMatchKey: "oil",
    category: "Drinks & Condiments",
    emoji: "🫒",
    recommendedZone: "refrigerated",
    shelfLifeDays: 120,
    defaultBuyServings: 1,
    unit: "bottle",
  },
  {
    id: "sug-oatmilk",
    name: "Oat Milk",
    fridgeMatchKey: "oatmilk",
    category: "Drinks & Condiments",
    emoji: "🧃",
    recommendedZone: "refrigerated",
    shelfLifeDays: 10,
    defaultBuyServings: 1,
    unit: "bottle",
  },
  {
    id: "sug-yogurt",
    name: "Yogurt",
    fridgeMatchKey: "yogurt",
    category: "Drinks & Condiments",
    emoji: "🥣",
    recommendedZone: "refrigerated",
    shelfLifeDays: 10,
    defaultBuyServings: 1,
    unit: "bottle",
  },
];
