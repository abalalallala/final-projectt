"use client";

import React, { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Toaster, toast } from "sonner";
import {
  Calendar,
  Refrigerator,
  ClipboardList,
  User,
  Plus,
  Search,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Sparkles,
  X,
  Upload,
  Trash2,
  RotateCcw,
  Snowflake,
  Thermometer,
} from "lucide-react";
import {
  INITIAL_FRIDGE_ITEMS,
  RECENT_ENTRIES,
  CATALOG_ITEMS,
  ALTERNATIVE_INGREDIENTS,
  RECIPES,
  INITIAL_WEEK_SCHEDULE,
  CATEGORY_WEEKLY_TARGETS,
  SUGGESTED_BASE_CATALOG,
  FridgeItem,
  CatalogItem,
  Recipe,
  StorageZone,
  DaySchedule,
} from "@/data/freshdateData";

type AppStage = "login" | "intro" | "onboarding" | "main";
type ActiveTab = "week" | "fridge" | "list" | "me";
type ImportScreen = "closed" | "hub" | "scan" | "manual";
type WeekSubScreen = "overview" | "recipes" | "details";
type MeSubScreen = "menu" | "profile_view" | "profile_edit";

const IOS_EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];

export default function FreshDateApp() {
  // =========================================================================
  // 1. AUTH & ONBOARDING FLOW (Screens #1 & #2)
  // =========================================================================
  const [appStage, setAppStage] = useState<AppStage>("login");
  const [userEmail, setUserEmail] = useState("freshie@freshdate.app");

  // Profile Settings with Custom iOS Sans-Serif Dropdowns & "Other..." Input
  const [weightKg, setWeightKg] = useState(65);
  const [dinersCount, setDinersCount] = useState(1);

  const [avoidFoods, setAvoidFoods] = useState("None");
  const [customAvoidFoods, setCustomAvoidFoods] = useState("");

  const [allergens, setAllergens] = useState("None");
  const [customAllergens, setCustomAllergens] = useState("");

  const [flavorPref, setFlavorPref] = useState("Regular");
  const [customFlavorPref, setCustomFlavorPref] = useState("");

  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderDaysChoice, setReminderDaysChoice] = useState("2");
  const [customReminderDays, setCustomReminderDays] = useState("4");

  const [openDropdownKey, setOpenDropdownKey] = useState<
    "avoid" | "allergens" | "flavor" | "reminder" | null
  >(null);

  const effectiveAvoidFoods =
    avoidFoods === "Other" ? customAvoidFoods.trim() || "Custom" : avoidFoods;
  const effectiveAllergens =
    allergens === "Other" ? customAllergens.trim() || "Custom" : allergens;
  const effectiveFlavorPref =
    flavorPref === "Other" ? customFlavorPref.trim() || "Custom" : flavorPref;
  const effectiveReminderDays =
    reminderDaysChoice === "Other"
      ? Math.max(1, Number(customReminderDays) || 4)
      : Number(reminderDaysChoice);

  // =========================================================================
  // 2. MAIN TABS & SUB-SCREENS
  // =========================================================================
  const [activeTab, setActiveTab] = useState<ActiveTab>("fridge");

  // My Fridge State (Screens #11 & #12) + Collapsible Refrigerated/Frozen Zones
  const [fridgeItems, setFridgeItems] =
    useState<FridgeItem[]>(INITIAL_FRIDGE_ITEMS);
  const [editingFridgeItem, setEditingFridgeItem] =
    useState<FridgeItem | null>(null);
  const [collapsedFridgeZones, setCollapsedFridgeZones] = useState<{
    refrigerated: boolean;
    frozen: boolean;
  }>({
    refrigerated: false,
    frozen: false,
  });

  // Import Flow State (Screens #3, #4, #5, #6, #7)
  const [importScreen, setImportScreen] = useState<ImportScreen>("closed");
  const [cameraMode, setCameraMode] = useState<"scan" | "photo">("scan");
  const [manualCategory, setManualCategory] = useState<
    "All" | "Staples" | "Produce" | "Protein"
  >("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [defaultZoneFilter, setDefaultZoneFilter] =
    useState<StorageZone>("refrigerated");

  // Screen #7: Food Information Bottom Sheet
  const [selectedCatalogItem, setSelectedCatalogItem] =
    useState<CatalogItem | null>(null);
  const [draftServings, setDraftServings] = useState(1);
  const [draftZone, setDraftZone] = useState<StorageZone>("refrigerated");
  const [draftShelfLife, setDraftShelfLife] = useState(5);

  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // =========================================================================
  // 3. MY WEEK & RECIPES STATE (Screens #8, #9, #10)
  // =========================================================================
  const [weekSubScreen, setWeekSubScreen] = useState<WeekSubScreen>("overview");
  const [calendarRange, setCalendarRange] = useState<"week" | "month">("week");
  const [weekSchedule, setWeekSchedule] = useState<DaySchedule[]>(
    INITIAL_WEEK_SCHEDULE
  );
  const [selectedDate, setSelectedDate] = useState("01");

  const [expandedMeal, setExpandedMeal] = useState<
    "Breakfast" | "Lunch" | "Dinner" | null
  >("Breakfast");
  const [recipeMealFilter, setRecipeMealFilter] = useState<
    "Breakfast" | "Lunch" | "Dinner"
  >("Breakfast");

  const [showRecipeMealMenu, setShowRecipeMealMenu] = useState(false);
  const [activeRecipe, setActiveRecipe] = useState<Recipe>(RECIPES[0]);

  // Used Ingredients in Recipes screen: Drag-to-Delete + "+ Other"
  const [excludedIngredientIds, setExcludedIngredientIds] = useState<string[]>(
    []
  );
  const [addedOtherIngredients, setAddedOtherIngredients] = useState<
    { id: string; name: string; emoji: string; servingsUsed: number }[]
  >([]);
  const [showOtherIngredientModal, setShowOtherIngredientModal] =
    useState(false);
  const [customOtherIngName, setCustomOtherIngName] = useState("");

  const [draggingIngredientId, setDraggingIngredientId] = useState<
    string | null
  >(null);
  const [isOverTrashZone, setIsOverTrashZone] = useState(false);
  const trashZoneRef = useRef<HTMLDivElement | null>(null);

  // =========================================================================
  // 4. SUGGESTED LIST DYNAMIC STATE
  // =========================================================================
  const [suggestedDeltaMap, setSuggestedDeltaMap] = useState<
    Record<string, number>
  >({});
  const [suggestedCheckedMap, setSuggestedCheckedMap] = useState<
    Record<string, boolean>
  >({
    "sug-bread": true,
    "sug-corn": true,
    "sug-broccoli": true,
    "sug-carrots": true,
    "sug-eggs": true,
    "sug-chicken": true,
  });
  // Tracks manual user overrides for category collapse; if undefined, auto-collapses when netToBuy === 0!
  const [manualCategoryCollapse, setManualCategoryCollapse] = useState<
    Record<string, boolean>
  >({});

  // Me State (Screens #14, #15, #16)
  const [meSubScreen, setMeSubScreen] = useState<MeSubScreen>("menu");

  // Sonner Toast Helper
  const notify = (msg: string) => {
    toast.success(msg, {
      style: {
        background: "#04453F",
        color: "#F0E98F",
        border: "1px solid rgba(148,192,96,0.35)",
        borderRadius: "18px",
        fontSize: "12px",
        fontWeight: 600,
      },
    });
  };

  // =========================================================================
  // COMPUTED DATA
  // =========================================================================
  const refrigeratedItems = useMemo(
    () =>
      fridgeItems
        .filter((i) => i.zone === "refrigerated")
        .sort((a, b) => a.daysLeft - b.daysLeft),
    [fridgeItems]
  );

  const frozenItems = useMemo(
    () =>
      fridgeItems
        .filter((i) => i.zone === "frozen")
        .sort((a, b) => a.daysLeft - b.daysLeft),
    [fridgeItems]
  );

  const urgentCount = useMemo(
    () =>
      fridgeItems.filter((i) => i.daysLeft <= effectiveReminderDays).length,
    [fridgeItems, effectiveReminderDays]
  );

  const visibleCalendarDays = useMemo(
    () =>
      calendarRange === "week"
        ? weekSchedule.slice(0, 7)
        : weekSchedule.slice(0, 31),
    [weekSchedule, calendarRange]
  );

  const totalAbsencesCount = useMemo(() => {
    let count = 0;
    visibleCalendarDays.forEach((day) => {
      (["Breakfast", "Lunch", "Dinner"] as const).forEach((m) => {
        if (day.meals[m].status === "dining_out") count++;
      });
    });
    return count;
  }, [visibleCalendarDays]);

  const weeklyAbsencesCount = useMemo(() => {
    let count = 0;
    weekSchedule.slice(0, 7).forEach((day) => {
      (["Breakfast", "Lunch", "Dinner"] as const).forEach((m) => {
        if (day.meals[m].status === "dining_out") count++;
      });
    });
    return count;
  }, [weekSchedule]);

  const currentDaySchedule = useMemo(
    () =>
      weekSchedule.find((d) => d.date === selectedDate) || weekSchedule[0],
    [weekSchedule, selectedDate]
  );

  const filteredCatalog = useMemo(() => {
    return CATALOG_ITEMS.filter((item) => {
      const matchesCat =
        manualCategory === "All" || item.category === manualCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [manualCategory, searchQuery]);

  const recipesForCurrentMeal = useMemo(() => {
    const byMeal = RECIPES.filter((r) => r.mealType === recipeMealFilter);
    const filtered = byMeal.filter(
      (r) =>
        !r.ingredients.some((ing) => excludedIngredientIds.includes(ing.id))
    );
    return filtered.length > 0 ? filtered : byMeal;
  }, [recipeMealFilter, excludedIngredientIds]);

  const visibleIngredientsInRecipes = useMemo(() => {
    const map = new Map<
      string,
      { id: string; name: string; emoji: string; servingsUsed: number }
    >();
    recipesForCurrentMeal.forEach((r) => {
      r.ingredients.forEach((ing) => {
        if (!excludedIngredientIds.includes(ing.id) && !map.has(ing.id)) {
          map.set(ing.id, ing);
        }
      });
    });
    addedOtherIngredients.forEach((otherIng) => {
      if (
        !excludedIngredientIds.includes(otherIng.id) &&
        !map.has(otherIng.id)
      ) {
        map.set(otherIng.id, otherIng);
      }
    });
    return Array.from(map.values());
  }, [recipesForCurrentMeal, excludedIngredientIds, addedOtherIngredients]);

  // Realistic Category-Level Quota & Dynamic Item List
  const getCategoryDynamicQuota = (
    category: "Staples" | "Produce" | "Protein" | "Drinks & Condiments"
  ) => {
    const homeMealRatio = Math.max(0.35, (21 - weeklyAbsencesCount) / 21);
    const weightFactor = Math.max(0.85, Math.min(1.25, weightKg / 65));

    const categoryTarget = Math.round(
      CATEGORY_WEEKLY_TARGETS[category] *
        dinersCount *
        homeMealRatio *
        weightFactor
    );

    const totalInFridge = fridgeItems
      .filter((f) => f.category === category)
      .reduce((sum, f) => sum + f.servings, 0);

    const netToBuy = Math.max(0, categoryTarget - totalInFridge);

    if (netToBuy === 0) {
      return {
        netToBuy: 0,
        quotaText: "", // Omit "0 servings (Fridge full)" completely!
        inFridgeText: `In fridge: ${totalInFridge} srv`,
      };
    }

    if (category === "Drinks & Condiments") {
      return {
        netToBuy,
        quotaText: `${netToBuy} bottle${netToBuy === 1 ? "" : "s"}`,
        inFridgeText: `In fridge: ${totalInFridge}`,
      };
    }

    return {
      netToBuy,
      quotaText: `${netToBuy}–${netToBuy + 1} servings`,
      inFridgeText: `In fridge: ${totalInFridge} srv`,
    };
  };

  // Dynamic items for Suggested List: filters out items that already have >= 2 servings in fridge or 0 servings
  const dynamicSuggestedList = useMemo(() => {
    return SUGGESTED_BASE_CATALOG.map((baseItem) => {
      const inFridgeServings = fridgeItems
        .filter(
          (f) =>
            f.id.toLowerCase().includes(baseItem.fridgeMatchKey) ||
            f.name
              .toLowerCase()
              .includes(baseItem.name.toLowerCase().split(" ").pop() || "")
        )
        .reduce((sum, f) => sum + f.servings, 0);

      // If you already have >= 2 servings of this specific item in the fridge, default needed is 0 (auto-hidden unless manually added)
      const baseNeed =
        inFridgeServings >= 2 ? 0 : baseItem.defaultBuyServings;
      const userDelta = suggestedDeltaMap[baseItem.id] || 0;
      const finalServings = Math.max(0, baseNeed + userDelta);

      return {
        ...baseItem,
        inFridgeServings,
        servings: finalServings,
        checked:
          suggestedCheckedMap[baseItem.id] !== undefined
            ? suggestedCheckedMap[baseItem.id] && finalServings > 0
            : false,
      };
    }).filter((item) => item.servings > 0); // Only show items with servings > 0 (never show "0 servings / Enough in fridge" cards!)
  }, [fridgeItems, suggestedDeltaMap, suggestedCheckedMap]);

  // =========================================================================
  // HANDLERS
  // =========================================================================
  const adjustFridgeServings = (
    id: string,
    delta: number,
    e?: React.MouseEvent
  ) => {
    if (e) e.stopPropagation();
    setFridgeItems((prev) =>
      prev
        .map((item) => {
          if (item.id !== id) return item;
          const nextServings = item.servings + delta;
          if (nextServings <= 0) {
            notify(`Finished ${item.name} — Suggested List auto-updated!`);
            if (editingFridgeItem?.id === id) setEditingFridgeItem(null);
            return null;
          }
          notify(`${item.name}: ${nextServings} srv (Suggested List updated)`);
          return { ...item, servings: nextServings };
        })
        .filter(Boolean) as FridgeItem[]
    );
  };

  const toggleFridgeItemZone = (id: string) => {
    setFridgeItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const toFreezer = item.zone === "refrigerated";
        const nextZone: StorageZone = toFreezer ? "frozen" : "refrigerated";
        const nextDays = toFreezer
          ? item.frozenShelfLifeDays
          : item.shelfLifeDays;
        notify(
          `Moved ${item.name} to ${
            toFreezer ? "Frozen ❄️" : "Refrigerated"
          } (${nextDays}d)`
        );
        const updated = { ...item, zone: nextZone, daysLeft: nextDays };
        setEditingFridgeItem(updated);
        return updated;
      })
    );
  };

  const openFoodInfoSheet = (
    item: CatalogItem,
    overrideZone?: StorageZone
  ) => {
    const zone = overrideZone || item.recommendedZone;
    setSelectedCatalogItem(item);
    setDraftServings(1);
    setDraftZone(zone);
    setDraftShelfLife(
      zone === "refrigerated"
        ? item.defaultShelfLifeRefrigerated
        : item.defaultShelfLifeFrozen
    );
  };

  const confirmAddCatalogItem = () => {
    if (!selectedCatalogItem) return;
    setFridgeItems((prev) => {
      const existingIdx = prev.findIndex(
        (f) =>
          f.name.toLowerCase() === selectedCatalogItem.name.toLowerCase() &&
          f.zone === draftZone
      );
      if (existingIdx > -1) {
        const copy = [...prev];
        copy[existingIdx] = {
          ...copy[existingIdx],
          servings: copy[existingIdx].servings + draftServings,
        };
        return copy;
      }
      const newItem: FridgeItem = {
        id: `item-${Date.now()}`,
        name: selectedCatalogItem.name,
        category: selectedCatalogItem.category,
        emoji: selectedCatalogItem.emoji,
        zone: draftZone,
        servings: draftServings,
        daysLeft: draftShelfLife,
        shelfLifeDays: selectedCatalogItem.defaultShelfLifeRefrigerated,
        frozenShelfLifeDays: selectedCatalogItem.defaultShelfLifeFrozen,
        dateAdded: selectedCatalogItem.dateAdded,
        expirationDate: selectedCatalogItem.expirationDate,
        storageTip: selectedCatalogItem.storageGuide,
      };
      return [newItem, ...prev];
    });

    setSelectedCatalogItem(null);
    setUploadedPhotoUrl(null);
    setImportScreen("closed");
    setActiveTab("fridge");
    notify(
      `Added ${draftServings}x ${selectedCatalogItem.name} — Suggested List adjusted!`
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setUploadedPhotoUrl(url);
    notify("Auto-recognized: Corn");
    openFoodInfoSheet(CATALOG_ITEMS[1]);
  };

  const toggleMealAbsence = (
    date: string,
    mealType: "Breakfast" | "Lunch" | "Dinner",
    e?: React.MouseEvent
  ) => {
    if (e) e.stopPropagation();
    setWeekSchedule((prev) =>
      prev.map((day) => {
        if (day.date !== date) return day;
        const slot = day.meals[mealType];
        const nextStatus =
          slot.status === "dining_out" ? "planned" : "dining_out";
        return {
          ...day,
          meals: {
            ...day.meals,
            [mealType]: { ...slot, status: nextStatus },
          },
        };
      })
    );
  };

  // Sync calendar schedule button
  const handleImportSchedule = () => {
    let synced = false;
    setWeekSchedule((prev) =>
      prev.map((day) => {
        if (synced || day.date !== selectedDate) return day;
        for (const m of ["Dinner", "Lunch", "Breakfast"] as const) {
          if (day.meals[m].status !== "dining_out") {
            synced = true;
            return {
              ...day,
              meals: {
                ...day.meals,
                [m]: { ...day.meals[m], status: "dining_out" },
              },
            };
          }
        }
        return day;
      })
    );
    notify("Synced schedule: +1 meal out");
  };

  const excludeIngredientById = (ingId: string) => {
    const target = visibleIngredientsInRecipes.find((i) => i.id === ingId);
    setExcludedIngredientIds((prev) =>
      prev.includes(ingId) ? prev : [...prev, ingId]
    );
    setDraggingIngredientId(null);
    setIsOverTrashZone(false);
    if (target) {
      notify(
        `Removed "${target.name}" — Tap "+ Other" to pick an alternative ingredient`
      );
    }
  };

  const handleSelectOtherIngredient = (ing: {
    id: string;
    name: string;
    emoji: string;
    servingsUsed: number;
  }) => {
    setExcludedIngredientIds((prev) => prev.filter((id) => id !== ing.id));
    setAddedOtherIngredients((prev) =>
      prev.some((i) => i.id === ing.id) ? prev : [...prev, ing]
    );
    setShowOtherIngredientModal(false);
    notify(`Added "${ing.name}" to ingredients used`);
  };

  const handleAddCustomOtherIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customOtherIngName.trim()) return;
    const newIng = {
      id: `other-${Date.now()}`,
      name: customOtherIngName.trim(),
      emoji: "🥘",
      servingsUsed: 1,
    };
    setAddedOtherIngredients((prev) => [...prev, newIng]);
    setCustomOtherIngName("");
    setShowOtherIngredientModal(false);
    notify(`Added "${newIng.name}" to ingredients used`);
  };

  const handleTouchEndIngredient = (
    e: React.TouchEvent,
    ingId: string
  ) => {
    const touch = e.changedTouches[0];
    if (touch && trashZoneRef.current) {
      const rect = trashZoneRef.current.getBoundingClientRect();
      if (
        touch.clientY >= rect.top - 24 &&
        touch.clientY <= rect.bottom + 24 &&
        touch.clientX >= rect.left - 24 &&
        touch.clientX <= rect.right + 24
      ) {
        excludeIngredientById(ingId);
        return;
      }
    }
    setDraggingIngredientId(null);
    setIsOverTrashZone(false);
  };

  const handleTouchMoveIngredient = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch && trashZoneRef.current) {
      const rect = trashZoneRef.current.getBoundingClientRect();
      const inside =
        touch.clientY >= rect.top - 24 &&
        touch.clientY <= rect.bottom + 24 &&
        touch.clientX >= rect.left - 24 &&
        touch.clientX <= rect.right + 24;
      setIsOverTrashZone(inside);
    }
  };

  const adjustSuggestedServings = (id: string, delta: number) => {
    setSuggestedDeltaMap((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + delta,
    }));
  };

  const toggleSuggestedCheck = (id: string, currentChecked: boolean) => {
    setSuggestedCheckedMap((prev) => ({
      ...prev,
      [id]: !currentChecked,
    }));
  };

  const importCheckedToFridge = () => {
    const checked = dynamicSuggestedList.filter(
      (i) => i.checked && i.servings > 0
    );
    if (checked.length === 0) {
      notify("Select items to import first");
      return;
    }

    setFridgeItems((prev) => {
      const next = [...prev];
      checked.forEach((it, idx) => {
        const matchIdx = next.findIndex(
          (f) =>
            f.id.toLowerCase().includes(it.fridgeMatchKey) ||
            f.name.toLowerCase() === it.name.toLowerCase()
        );
        if (matchIdx > -1) {
          next[matchIdx] = {
            ...next[matchIdx],
            servings: next[matchIdx].servings + it.servings,
          };
        } else {
          next.unshift({
            id: `bought-${Date.now()}-${idx}`,
            name: it.name,
            category: it.category,
            emoji: it.emoji,
            zone: it.recommendedZone,
            servings: it.servings,
            daysLeft: it.shelfLifeDays,
            shelfLifeDays: it.shelfLifeDays,
            frozenShelfLifeDays: 90,
            dateAdded: "25-12-01",
            expirationDate: "25-12-08",
            storageTip: "Keep sealed at recommended temperature.",
          });
        }
      });
      return next;
    });

    setSuggestedDeltaMap({});
    setManualCategoryCollapse({});
    setActiveTab("fridge");
    notify(
      `Added ${checked.length} items to My Fridge — Suggested List recalculated!`
    );
  };

  // Freshness Progress Bar & Clean Flat Semantic Badge
  const getFreshnessVisuals = (item: FridgeItem) => {
    const maxLife =
      item.zone === "frozen"
        ? Math.max(item.daysLeft, item.frozenShelfLifeDays || 90)
        : Math.max(item.daysLeft, item.shelfLifeDays || 7);
    const pct = Math.min(
      100,
      Math.max(14, Math.round((item.daysLeft / maxLife) * 100))
    );

    if (item.daysLeft <= 1) {
      return {
        badgeClass: "bg-red-500 text-white shadow-2xs",
        barColor: "bg-red-500",
        pct,
      };
    }
    if (item.daysLeft <= 2) {
      return {
        badgeClass: "bg-[#FFC45A] text-[#04453F]",
        barColor: "bg-[#FFC45A]",
        pct,
      };
    }
    if (item.zone === "frozen") {
      return {
        badgeClass: "bg-sky-100 text-sky-900 border border-sky-200/70",
        barColor: "bg-sky-400",
        pct,
      };
    }
    return {
      badgeClass: "bg-[#94C060]/45 text-[#04453F]",
      barColor: "bg-[#94C060]",
      pct,
    };
  };

  // Precision Vernier Caliper Weight Scale
  const renderVernierWeightCard = (readOnly?: boolean) => {
    const ticks = Array.from({ length: 41 }, (_, i) => 50 + i);
    return (
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-4 pro-card-shadow border border-white/80 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#0F2926]">
            Current Weight
          </span>
        </div>

        <div className="text-center">
          <div className="text-3xl font-extrabold text-[#04453F] tracking-tight inline-flex items-baseline gap-1 transition-all">
            <span>{weightKg}</span>
            <span className="text-sm font-bold text-[#658C38]">KG</span>
          </div>
        </div>

        <div className="relative bg-[#F4F6EE]/90 rounded-2xl px-3 pt-3 pb-2 border border-[#04453F]/8 overflow-hidden">
          <div className="flex items-end justify-between h-6 px-1">
            {ticks.map((val) => {
              const isMajor = val % 5 === 0;
              const isSelected = val === weightKg;
              const isNear = Math.abs(val - weightKg) <= 2;
              return (
                <div
                  key={val}
                  className="flex flex-col items-center justify-end h-full"
                >
                  <div
                    className={`rounded-full transition-all duration-150 ${
                      isSelected
                        ? "w-[2.5px] h-5 bg-[#04453F]"
                        : isMajor
                        ? "w-[1.5px] h-3.5 bg-[#04453F]/50"
                        : isNear
                        ? "w-[1.5px] h-2.5 bg-[#94C060]"
                        : "w-[1px] h-2 bg-slate-300"
                    }`}
                  />
                </div>
              );
            })}
          </div>

          <div className="flex justify-between text-[10px] text-slate-400 font-sans font-semibold pt-1.5 px-0.5">
            {[50, 55, 60, 65, 70, 75, 80, 85, 90].map((num) => (
              <span
                key={num}
                className={
                  Math.abs(weightKg - num) <= 2
                    ? "text-[#04453F] font-extrabold"
                    : ""
                }
              >
                {num}
              </span>
            ))}
          </div>

          {!readOnly && (
            <div className="pt-2">
              <input
                type="range"
                min={50}
                max={90}
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full vernier-slider"
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  // Custom iOS Sans-Serif Dropdown Helper (100% Pure English!)
  const renderCustomSansDropdown = (
    key: "avoid" | "allergens" | "flavor" | "reminder",
    currentValue: string,
    options: { value: string; label: string }[],
    onSelect: (val: string) => void
  ) => {
    const isOpen = openDropdownKey === key;
    const currentLabel =
      options.find((o) => o.value === currentValue)?.label || currentValue;

    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenDropdownKey(isOpen ? null : key)}
          className="bg-[#FFC45A]/45 hover:bg-[#FFC45A]/65 active:scale-95 text-[#04453F] font-sans font-semibold px-3.5 py-1.5 rounded-full text-xs flex items-center gap-1.5 transition"
        >
          <span>{currentLabel}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{ duration: 0.18, ease: IOS_EASE }}
              className="absolute right-0 mt-1.5 w-44 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_14px_34px_rgba(4,69,63,0.16)] border border-[#04453F]/15 py-1.5 z-50 font-sans"
            >
              {options.map((opt) => {
                const isSelected = currentValue === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onSelect(opt.value);
                      setOpenDropdownKey(null);
                    }}
                    className={`w-full px-3.5 py-2 text-left text-xs font-sans font-semibold flex items-center justify-between transition ${
                      isSelected
                        ? "bg-[#94C060]/25 text-[#04453F] font-bold"
                        : "text-[#0F2926] hover:bg-[#F4F6EE]"
                    }`}
                  >
                    <span className="font-sans">{opt.label}</span>
                    {isSelected && (
                      <span className="text-[#04453F] font-bold">✓</span>
                    )}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Calendar Card with Smooth [Week | Month] Switcher
  const renderCalendarCard = (compact?: boolean) => (
    <div
      className={`bg-white/95 backdrop-blur-xl rounded-3xl ${
        compact ? "p-3" : "p-3.5"
      } pro-card-shadow border border-white/80 space-y-2.5`}
    >
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#04453F]" />
          <span className="text-xs font-bold text-[#0F2926]">
            December, 2025
          </span>
        </div>

        <div className="bg-[#F4F6EE] p-0.5 rounded-full flex items-center text-[10px] font-bold border border-[#04453F]/10">
          {(["week", "month"] as const).map((mode) => {
            const active = calendarRange === mode;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => setCalendarRange(mode)}
                className={`px-2.5 py-0.5 rounded-full capitalize transition-all duration-200 ${
                  active
                    ? "bg-[#94C060] text-white shadow-2xs"
                    : "text-slate-500 hover:text-[#04453F]"
                }`}
              >
                {mode}
              </button>
            );
          })}
        </div>
      </div>

      {calendarRange === "month" && (
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-slate-400 pt-0.5">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>
      )}

      <div className="grid grid-cols-7 gap-1">
        {visibleCalendarDays.map((d) => {
          const isSelected = selectedDate === d.date;
          const slots = [
            d.meals.Breakfast,
            d.meals.Lunch,
            d.meals.Dinner,
          ];
          return (
            <button
              key={d.date}
              onClick={() => setSelectedDate(d.date)}
              className={`flex flex-col items-center ${
                calendarRange === "month" ? "py-1.5" : "py-2"
              } rounded-2xl transition-all duration-200 active:scale-95 ${
                isSelected
                  ? "bg-[#FFC45A] text-[#04453F] shadow-2xs"
                  : "hover:bg-[#F4F6EE] text-[#0F2926]"
              }`}
            >
              {calendarRange === "week" && (
                <span className="text-[10px] font-semibold opacity-75">
                  {d.dayName}
                </span>
              )}
              <span
                className={`${
                  calendarRange === "month" ? "text-xs" : "text-sm"
                } font-bold mt-0.5`}
              >
                {d.date}
              </span>
              <div className="mt-1 flex items-center gap-[3px]">
                {slots.map((s, idx) => (
                  <span
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full ${
                      s.status === "dining_out"
                        ? "bg-amber-600"
                        : "bg-[#658C38]"
                    }`}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  // Pure English Dropdowns with "Other..." Custom Input
  const renderDietaryDropdownsWithOther = () => (
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-4 pro-card-shadow border border-white/80 space-y-3 text-xs font-sans">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#0F2926]">Foods to Avoid</span>
          {renderCustomSansDropdown(
            "avoid",
            avoidFoods,
            [
              { value: "None", label: "None" },
              { value: "Cilantro", label: "Cilantro" },
              { value: "Spicy", label: "Spicy" },
              { value: "Other", label: "Other..." },
            ],
            setAvoidFoods
          )}
        </div>
        {avoidFoods === "Other" && (
          <input
            type="text"
            value={customAvoidFoods}
            onChange={(e) => setCustomAvoidFoods(e.target.value)}
            placeholder="Please specify foods to avoid..."
            className="w-full px-3 py-2 rounded-xl bg-[#F4F6EE] border border-[#04453F]/15 text-xs font-sans text-[#0F2926] outline-none focus:border-[#04453F]"
          />
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#0F2926]">Allergens</span>
          {renderCustomSansDropdown(
            "allergens",
            allergens,
            [
              { value: "None", label: "None" },
              { value: "Seafood", label: "Seafood" },
              { value: "Peanuts", label: "Peanuts" },
              { value: "Lactose", label: "Lactose" },
              { value: "Other", label: "Other..." },
            ],
            setAllergens
          )}
        </div>
        {allergens === "Other" && (
          <input
            type="text"
            value={customAllergens}
            onChange={(e) => setCustomAllergens(e.target.value)}
            placeholder="Please specify your allergens..."
            className="w-full px-3 py-2 rounded-xl bg-[#F4F6EE] border border-[#04453F]/15 text-xs font-sans text-[#0F2926] outline-none focus:border-[#04453F]"
          />
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#0F2926]">Flavor Preferences</span>
          {renderCustomSansDropdown(
            "flavor",
            flavorPref,
            [
              { value: "Regular", label: "Regular" },
              { value: "Light", label: "Light" },
              { value: "Savory", label: "Savory" },
              { value: "Other", label: "Other..." },
            ],
            setFlavorPref
          )}
        </div>
        {flavorPref === "Other" && (
          <input
            type="text"
            value={customFlavorPref}
            onChange={(e) => setCustomFlavorPref(e.target.value)}
            placeholder="Please specify your flavor preference..."
            className="w-full px-3 py-2 rounded-xl bg-[#F4F6EE] border border-[#04453F]/15 text-xs font-sans text-[#0F2926] outline-none focus:border-[#04453F]"
          />
        )}
      </div>
    </div>
  );

  // Render Fridge Item Row
  const renderEnhancedFridgeRow = (item: FridgeItem, isFrozen?: boolean) => {
    const vis = getFreshnessVisuals(item);
    return (
      <div
        key={item.id}
        onClick={() => setEditingFridgeItem(item)}
        className={`grid grid-cols-12 items-center rounded-2xl px-2.5 py-2.5 cursor-pointer transition-colors duration-150 border ${
          isFrozen
            ? "bg-sky-50/45 hover:bg-sky-50/75 border-sky-100/80"
            : "bg-[#F4F6EE]/85 hover:bg-[#F4F6EE] border-white/60"
        }`}
      >
        <div className="col-span-6 flex items-center gap-2.5 min-w-0 pr-1">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-xl shrink-0 shadow-2xs">
            <span>{item.emoji}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-[#0F2926] leading-tight truncate">
              {item.name}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {item.dateAdded}
            </div>
            <div className="w-full h-1 bg-black/6 rounded-full mt-1 overflow-hidden">
              <div
                style={{ width: `${vis.pct}%` }}
                className={`h-full rounded-full transition-all duration-300 ${vis.barColor}`}
              />
            </div>
          </div>
        </div>

        <div className="col-span-4 flex items-center justify-center gap-1">
          <button
            onClick={(e) => adjustFridgeServings(item.id, -1, e)}
            className="w-6 h-6 rounded-lg bg-white hover:bg-[#FFC45A]/40 active:scale-90 text-[#04453F] font-bold text-xs flex items-center justify-center shadow-2xs transition"
          >
            -
          </button>
          <span className="w-5 text-center text-xs font-bold text-[#0F2926]">
            {item.servings}
          </span>
          <button
            onClick={(e) => adjustFridgeServings(item.id, 1, e)}
            className="w-6 h-6 rounded-lg bg-white hover:bg-[#94C060]/40 active:scale-90 text-[#04453F] font-bold text-xs flex items-center justify-center shadow-2xs transition"
          >
            +
          </button>
        </div>

        <div className="col-span-2 flex justify-end">
          <span
            className={`min-w-[34px] h-7 px-1.5 rounded-xl text-xs font-extrabold flex items-center justify-center ${vis.badgeClass}`}
          >
            {item.daysLeft}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#DCE2D5] flex items-center justify-center sm:p-6 select-none font-sans">
      <Toaster position="top-center" />

      {/* =====================================================================
          NATIVE IPHONE 16 PRO SHELL
         ===================================================================== */}
      <div className="relative w-full h-[100dvh] sm:w-[402px] sm:h-[856px] bg-[#F4F6EE] sm:rounded-[54px] sm:shadow-[0_32px_90px_rgba(4,69,63,0.24),0_0_0_11px_#122421,0_0_0_13px_#324743] overflow-hidden flex flex-col font-sans">
        {/* iOS Status Bar */}
        <div className="pt-3 pb-2 px-7 flex items-center justify-between bg-[#F4F6EE]/90 backdrop-blur-md z-30 shrink-0">
          <span className="text-[14px] font-semibold tracking-tight text-[#0F2926]">
            9:41
          </span>
          <div className="hidden sm:flex w-[114px] h-[31px] bg-[#0B1715] rounded-full items-center justify-between px-3 shadow-inner">
            <div className="w-2.5 h-2.5 rounded-full bg-[#1b332e] ring-1 ring-white/10" />
            <div className="w-2 h-2 rounded-full bg-[#94C060]" />
          </div>
          <div className="flex items-center gap-1.5 text-[#0F2926]">
            <div className="flex items-end gap-[2px] h-3">
              <span className="w-[3px] h-1.5 bg-[#0F2926] rounded-full" />
              <span className="w-[3px] h-2 bg-[#0F2926] rounded-full" />
              <span className="w-[3px] h-2.5 bg-[#0F2926] rounded-full" />
              <span className="w-[3px] h-3 bg-[#0F2926] rounded-full" />
            </div>
            <span className="text-[11px] font-semibold ml-0.5">5G</span>
            <div className="w-6 h-3 rounded-[4px] border border-[#0F2926]/40 p-[1.5px] flex items-center">
              <div className="w-full h-full bg-[#04453F] rounded-[2px]" />
            </div>
          </div>
        </div>

        {/* ===================================================================
            SCREEN 1: LOGIN PAGE
           =================================================================== */}
        {appStage === "login" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, ease: IOS_EASE }}
            className="flex-1 px-6 pt-5 pb-10 flex flex-col justify-between bg-gradient-to-b from-[#F4F6EE] to-[#E9EEDB]"
          >
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="px-7 py-2 rounded-full bg-[#94C060] text-white font-bold text-sm tracking-wide shadow-xs">
                  FRESHDATE
                </div>
              </div>

              <div className="bg-white/95 rounded-2xl p-3.5 flex items-center gap-3 pro-card-shadow border border-white/80">
                <div className="w-10 h-10 rounded-xl bg-[#FFC45A]/30 flex items-center justify-center text-xl shrink-0">
                  🧊
                </div>
                <p className="text-[11px] text-[#0F2926] leading-relaxed font-medium">
                  Track what you have, beat expiration dates, and shop smarter—so every ingredient counts.
                </p>
              </div>

              <div className="bg-white/95 rounded-3xl p-6 pro-card-shadow border border-white/80 space-y-5">
                <div>
                  <label className="text-xs font-bold text-[#0F2926]">
                    Email
                  </label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full mt-1.5 pb-2 border-b border-slate-200 text-sm text-[#0F2926] bg-transparent outline-none focus:border-[#04453F]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#0F2926]">
                    Password
                  </label>
                  <input
                    type="password"
                    defaultValue="••••••••••••"
                    className="w-full mt-1.5 pb-2 border-b border-slate-200 text-sm text-[#0F2926] bg-transparent outline-none focus:border-[#04453F]"
                  />
                  <div className="text-center mt-3">
                    <button
                      type="button"
                      onClick={() => notify("Password reset link sent")}
                      className="text-[11px] text-slate-400 underline"
                    >
                      Forgot your password?
                    </button>
                  </div>
                </div>

                <div className="pt-1 flex justify-center">
                  <button
                    onClick={() => setAppStage("intro")}
                    className="w-44 bg-[#FFC45A] hover:brightness-105 active:scale-95 text-[#04453F] font-bold py-2.5 rounded-full text-xs shadow-xs transition"
                  >
                    Let&apos;s Start
                  </button>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => setAppStage("intro")}
                  className="px-6 py-2.5 rounded-full bg-white/85 hover:bg-white active:scale-95 text-slate-500 font-semibold text-xs border border-white/80 pro-card-shadow transition"
                >
                  I don&apos;t have an account
                </button>
              </div>
            </div>

            <div className="text-center text-[11px] text-slate-400">
              FRESHDATE · Smart Fridge Intervention
            </div>
          </motion.div>
        )}

        {/* ===================================================================
            SCREEN 1.5: POST-LOGIN CONCISE APP INTRODUCTION
           =================================================================== */}
        {appStage === "intro" && (
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, ease: IOS_EASE }}
            className="flex-1 px-5 pt-2 pb-8 flex flex-col justify-between bg-gradient-to-b from-[#F4F6EE] to-[#E9EEDB]"
          >
            <div className="space-y-4">
              {/* Top Bar */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setAppStage("login")}
                  className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#658C38] pro-card-shadow active:scale-90 transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="px-7 py-1.5 rounded-full bg-[#94C060] text-white font-bold text-sm shadow-2xs">
                  FRESHDATE
                </div>
                <button
                  onClick={() => setAppStage("onboarding")}
                  className="text-xs font-bold text-slate-400 hover:text-[#04453F] px-1"
                >
                  Skip
                </button>
              </div>

              {/* Hero Value Summary Card */}
              <div className="relative overflow-hidden bg-gradient-to-br from-[#065A52] via-[#04453F] to-[#022C28] rounded-3xl p-5 text-white pro-card-shadow space-y-2">
                <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full blur-2xl bg-[#94C060]/30 pointer-events-none" />
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#FFC45A] text-[#04453F] text-[10px] font-bold uppercase tracking-wider">
                  What is FRESHDATE?
                </span>
                <h1 className="text-lg font-extrabold leading-snug text-white">
                  Stop Food Waste Before You Shop
                </h1>
                <p className="text-xs text-[#F0E98F]/90 leading-relaxed">
                  A fridge-centered shopping intervention app that links your live fridge inventory with your weekly dining plans—so you only buy what you will actually eat.
                </p>
              </div>

              {/* 3 Concise Core Pillars */}
              <div className="space-y-2.5">
                <div className="bg-white/95 rounded-2xl p-3.5 pro-card-shadow border border-white/80 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#94C060]/20 flex items-center justify-center text-xl shrink-0">
                    🧊
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#0F2926]">
                      1. Track Fridge &amp; Freezer Freshness
                    </h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                      Scan or log groceries in seconds, monitor remaining days, and get storage tips for every item.
                    </p>
                  </div>
                </div>

                <div className="bg-white/95 rounded-2xl p-3.5 pro-card-shadow border border-white/80 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FFC45A]/30 flex items-center justify-center text-xl shrink-0">
                    🗓️
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#0F2926]">
                      2. Sync Plans &amp; Rescue Expiring Food
                    </h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                      Mark meals when you dine out and get recipe recommendations prioritized by expiring ingredients.
                    </p>
                  </div>
                </div>

                <div className="bg-white/95 rounded-2xl p-3.5 pro-card-shadow border border-white/80 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F0E98F]/70 flex items-center justify-center text-xl shrink-0">
                    🛒
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#0F2926]">
                      3. Smart Pre-Shopping Intervention
                    </h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                      Your suggested grocery list automatically deducts existing fridge stock and meals out to prevent overbuying.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-center">
              <button
                onClick={() => setAppStage("onboarding")}
                className="w-44 bg-[#FFC45A] hover:brightness-105 active:scale-95 text-[#04453F] font-bold py-2.5 rounded-full text-xs shadow-sm transition"
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}

        {/* ===================================================================
            SCREEN 2: (FIRST-TIME SIGN-IN) BASIC SETTINGS
           =================================================================== */}
        {appStage === "onboarding" && (
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, ease: IOS_EASE }}
            className="flex-1 overflow-y-auto no-scrollbar px-5 pt-2 pb-8 flex flex-col justify-between bg-gradient-to-b from-[#F4F6EE] to-[#E9EEDB]"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setAppStage("intro")}
                  className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#658C38] pro-card-shadow active:scale-90 transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="px-8 py-1.5 rounded-full bg-[#94C060] text-white font-bold text-sm shadow-2xs">
                  Welcome
                </div>
                <div className="w-8" />
              </div>

              <div className="bg-white/95 rounded-2xl p-3 text-center border border-white/80 pro-card-shadow">
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  The app will recommend recipes and a grocery list based on your personal data and preferences.
                </p>
              </div>

              {renderVernierWeightCard(false)}

              <div className="bg-white/95 rounded-2xl px-4 py-3 pro-card-shadow border border-white/80 flex items-center justify-between">
                <span className="text-xs font-bold text-[#0F2926]">
                  Number of Diners:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDinersCount(Math.max(1, dinersCount - 1))}
                    className="w-7 h-7 rounded-lg bg-[#FFC45A]/35 active:scale-90 text-[#04453F] font-bold text-sm flex items-center justify-center transition"
                  >
                    -
                  </button>
                  <span className="w-7 text-center font-bold text-xs text-[#04453F]">
                    {dinersCount}
                  </span>
                  <button
                    onClick={() => setDinersCount(dinersCount + 1)}
                    className="w-7 h-7 rounded-lg bg-[#FFC45A]/35 active:scale-90 text-[#04453F] font-bold text-sm flex items-center justify-center transition"
                  >
                    +
                  </button>
                </div>
              </div>

              {renderDietaryDropdownsWithOther()}
            </div>

            <div className="pt-4 flex justify-center">
              <button
                onClick={() => {
                  setOpenDropdownKey(null);
                  setAppStage("main");
                  setActiveTab("fridge");
                  notify("Welcome to FRESHDATE!");
                }}
                className="w-36 bg-[#FFC45A] hover:brightness-105 active:scale-95 text-[#04453F] font-bold py-2.5 rounded-full text-xs shadow-sm transition"
              >
                Done
              </button>
            </div>
          </motion.div>
        )}

        {/* ===================================================================
            MAIN APP STAGE (4 TABS)
           =================================================================== */}
        {appStage === "main" && (
          <>
            <main className="flex-1 overflow-y-auto no-scrollbar pb-24">
              {/* -------------------------------------------------------------
                  TAB 1: MY WEEK (Screens #8, #9, #10)
                 ------------------------------------------------------------- */}
              {activeTab === "week" && (
                <motion.div
                  key={`week-${weekSubScreen}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, ease: IOS_EASE }}
                  className="px-4 pt-2 space-y-3.5"
                >
                  {weekSubScreen === "overview" && (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="w-8" />
                        <div className="px-7 py-1.5 rounded-full bg-[#94C060] text-white font-bold text-sm shadow-2xs">
                          My Week
                        </div>
                        <button
                          onClick={() => setImportScreen("hub")}
                          className="w-8 h-8 rounded-full bg-[#94C060] active:scale-90 text-white flex items-center justify-center shadow-2xs transition"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>

                      {renderCalendarCard()}

                      {/* Read-only Total Absences Summary Badge (No - / + buttons!) */}
                      <div className="bg-white/95 rounded-2xl px-4 py-2.5 pro-card-shadow border border-white/80 flex items-center justify-between">
                        <span className="text-xs font-bold text-[#0F2926]">
                          Total absences this {calendarRange}:
                        </span>
                        <span className="px-3.5 py-1 rounded-full bg-[#FFC45A] text-[#04453F] font-bold text-xs">
                          {totalAbsencesCount}{" "}
                          {totalAbsencesCount === 1 ? "meal" : "meals"}
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {(["Breakfast", "Lunch", "Dinner"] as const).map(
                          (mealType) => {
                            const slot = currentDaySchedule.meals[mealType];
                            const isExpanded = expandedMeal === mealType;
                            const isOut = slot.status === "dining_out";

                            return (
                              <div
                                key={mealType}
                                className="bg-white/95 rounded-3xl p-3.5 pro-card-shadow border border-white/80"
                              >
                                <div
                                  onClick={() =>
                                    setExpandedMeal((prev) =>
                                      prev === mealType ? null : mealType
                                    )
                                  }
                                  className="flex items-center justify-between cursor-pointer"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-[#0F2926]">
                                      {mealType}
                                    </span>
                                    <ChevronDown
                                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                                        isExpanded ? "rotate-180" : ""
                                      }`}
                                    />
                                  </div>

                                  <button
                                    onClick={(e) =>
                                      toggleMealAbsence(
                                        currentDaySchedule.date,
                                        mealType,
                                        e
                                      )
                                    }
                                    className={`px-3 py-1 rounded-full text-[11px] font-bold transition ${
                                      isOut
                                        ? "bg-[#FFC45A] text-[#04453F]"
                                        : "bg-[#F4F6EE] text-slate-500 hover:bg-[#94C060]/20 hover:text-[#04453F]"
                                    }`}
                                  >
                                    {isOut ? "Out (Absence)" : "Eat at Home"}
                                  </button>
                                </div>

                                <AnimatePresence initial={false}>
                                  {isExpanded && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{
                                        duration: 0.24,
                                        ease: IOS_EASE,
                                      }}
                                      className="overflow-hidden"
                                    >
                                      <div className="pt-3 mt-2.5 border-t border-slate-100">
                                        {isOut ? (
                                          <div className="py-3 text-center text-xs text-amber-800 bg-[#FFC45A]/15 rounded-2xl font-medium">
                                            Marked as Dining Out — Excluded from grocery quota
                                          </div>
                                        ) : (
                                          <div className="grid grid-cols-3 gap-2.5">
                                            {slot.itemsPreview.map(
                                              (item, idx) => (
                                                <div
                                                  key={idx}
                                                  onClick={() => {
                                                    setRecipeMealFilter(
                                                      mealType
                                                    );
                                                    setWeekSubScreen("recipes");
                                                  }}
                                                  className="bg-[#F4F6EE] hover:bg-[#94C060]/15 active:scale-95 rounded-2xl p-2.5 flex flex-col items-center text-center cursor-pointer transition"
                                                >
                                                  <span className="text-3xl mb-1">
                                                    {item.emoji}
                                                  </span>
                                                  <span className="text-[11px] font-semibold text-[#0F2926] line-clamp-1">
                                                    {item.name}
                                                  </span>
                                                </div>
                                              )
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          }
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <button
                          onClick={() => {
                            if (expandedMeal) setRecipeMealFilter(expandedMeal);
                            setWeekSubScreen("recipes");
                          }}
                          className="bg-[#F0E98F] hover:brightness-98 active:scale-97 text-[#04453F] font-bold py-2.5 px-3 rounded-2xl text-xs shadow-2xs border border-[#04453F]/15 transition"
                        >
                          Recipe Recommendations
                        </button>
                        <button
                          onClick={handleImportSchedule}
                          className="bg-[#F0E98F] hover:brightness-98 active:scale-97 text-[#04453F] font-bold py-2.5 px-3 rounded-2xl text-xs shadow-2xs border border-[#04453F]/15 transition"
                        >
                          Import the Schedule
                        </button>
                      </div>
                    </>
                  )}

                  {/* SCREEN #9: RECIPES */}
                  {weekSubScreen === "recipes" && (
                    <>
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => setWeekSubScreen("overview")}
                          className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#658C38] pro-card-shadow active:scale-90 transition"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="px-7 py-1.5 rounded-full bg-[#94C060] text-white font-bold text-sm shadow-2xs">
                          Recipes
                        </div>
                        <button
                          onClick={() => setImportScreen("hub")}
                          className="w-8 h-8 rounded-full bg-[#94C060] active:scale-90 text-white flex items-center justify-center shadow-2xs transition"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>

                      {renderCalendarCard(true)}

                      <div className="bg-white/95 rounded-3xl p-4 pro-card-shadow border border-white/80 space-y-3 relative">
                        <div className="flex items-center justify-between">
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setShowRecipeMealMenu(!showRecipeMealMenu)
                              }
                              className="px-3.5 py-1.5 rounded-full bg-[#FFC45A] hover:brightness-105 active:scale-95 text-[#04453F] text-xs font-bold flex items-center gap-1 shadow-2xs transition"
                            >
                              <span>{recipeMealFilter}</span>
                              <ChevronDown
                                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                  showRecipeMealMenu ? "rotate-180" : ""
                                }`}
                              />
                            </button>

                            <AnimatePresence>
                              {showRecipeMealMenu && (
                                <motion.div
                                  initial={{ opacity: 0, y: -4, scale: 0.97 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: -4, scale: 0.97 }}
                                  transition={{ duration: 0.16, ease: IOS_EASE }}
                                  className="absolute left-0 mt-1.5 w-32 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-[#04453F]/15 py-1 z-30"
                                >
                                  {(
                                    ["Breakfast", "Lunch", "Dinner"] as const
                                  ).map((m) => (
                                    <button
                                      key={m}
                                      type="button"
                                      onClick={() => {
                                        setRecipeMealFilter(m);
                                        setExpandedMeal(m);
                                        setShowRecipeMealMenu(false);
                                        const firstMatch = RECIPES.find(
                                          (r) => r.mealType === m
                                        );
                                        if (firstMatch)
                                          setActiveRecipe(firstMatch);
                                      }}
                                      className={`w-full px-3.5 py-2 text-left text-xs font-bold flex items-center justify-between hover:bg-[#F4F6EE] ${
                                        recipeMealFilter === m
                                          ? "text-[#04453F] bg-[#FFC45A]/20"
                                          : "text-slate-600"
                                      }`}
                                    >
                                      <span>{m}</span>
                                      {recipeMealFilter === m && <span>✓</span>}
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          <span className="text-[10px] text-slate-400 text-right max-w-[185px] leading-tight">
                            Recommended based on the expiring ingredients in your fridge
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2.5">
                          {recipesForCurrentMeal.map((r) => (
                            <div
                              key={r.id}
                              onClick={() => {
                                setActiveRecipe(r);
                                setWeekSubScreen("details");
                              }}
                              className="bg-[#F4F6EE] hover:ring-2 hover:ring-[#04453F] active:scale-95 rounded-2xl p-2.5 flex flex-col items-center text-center cursor-pointer transition"
                            >
                              <span className="text-3xl mb-1">{r.emoji}</span>
                              <span className="text-[11px] font-bold text-[#0F2926] line-clamp-2 leading-tight">
                                {r.title}
                              </span>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={() => {
                            if (recipesForCurrentMeal[0]) {
                              setActiveRecipe(recipesForCurrentMeal[0]);
                            }
                            setWeekSubScreen("details");
                          }}
                          className="w-full py-2 rounded-full bg-[#F4F6EE] hover:bg-[#94C060]/15 text-slate-500 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#FFC45A]" />
                          <span>
                            Pick a dish to make for{" "}
                            {recipeMealFilter.toLowerCase()}
                          </span>
                        </button>
                      </div>

                      {/* Used Ingredients Card with Drag-to-Delete & "+ Other" */}
                      <div className="bg-white/95 rounded-3xl p-4 pro-card-shadow border border-white/80 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-[#0F2926]">
                              Ingredients Used
                            </span>
                            <span className="text-[10px] text-slate-400">
                              (Drag unwanted down to remove)
                            </span>
                          </div>
                          {(excludedIngredientIds.length > 0 ||
                            addedOtherIngredients.length > 0) && (
                            <button
                              type="button"
                              onClick={() => {
                                setExcludedIngredientIds([]);
                                setAddedOtherIngredients([]);
                                notify("Reset ingredients");
                              }}
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-[#658C38] hover:underline"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Reset</span>
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                          {visibleIngredientsInRecipes.map((ing) => {
                            const isDragging = draggingIngredientId === ing.id;
                            return (
                              <div
                                key={ing.id}
                                draggable
                                onDragStart={(e) => {
                                  e.dataTransfer.setData("text/plain", ing.id);
                                  setDraggingIngredientId(ing.id);
                                }}
                                onDragEnd={() => {
                                  setDraggingIngredientId(null);
                                  setIsOverTrashZone(false);
                                }}
                                onTouchStart={() =>
                                  setDraggingIngredientId(ing.id)
                                }
                                onTouchMove={handleTouchMoveIngredient}
                                onTouchEnd={(e) =>
                                  handleTouchEndIngredient(e, ing.id)
                                }
                                className={`bg-[#F4F6EE] rounded-2xl p-2 flex flex-col items-center text-center cursor-grab active:cursor-grabbing transition ${
                                  isDragging
                                    ? "opacity-40 scale-95 ring-2 ring-red-400"
                                    : "hover:bg-[#94C060]/15"
                                }`}
                              >
                                <span className="text-2xl mb-1">
                                  {ing.emoji}
                                </span>
                                <span className="text-[10px] font-semibold text-[#0F2926] leading-tight">
                                  {ing.name}
                                </span>
                              </div>
                            );
                          })}

                          {/* "+ Other" Card */}
                          <button
                            type="button"
                            onClick={() => setShowOtherIngredientModal(true)}
                            className="bg-[#FFC45A]/25 hover:bg-[#FFC45A]/45 active:scale-95 border border-dashed border-[#04453F]/25 rounded-2xl p-2 flex flex-col items-center justify-center text-center transition"
                          >
                            <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#04453F] mb-1 shadow-2xs">
                              <Plus className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-bold text-[#04453F] leading-tight">
                              Other
                            </span>
                          </button>
                        </div>

                        {/* Drag-to-Delete Drop Zone */}
                        <div
                          ref={trashZoneRef}
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsOverTrashZone(true);
                          }}
                          onDragLeave={() => setIsOverTrashZone(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            const droppedId =
                              e.dataTransfer.getData("text/plain") ||
                              draggingIngredientId;
                            if (droppedId) {
                              excludeIngredientById(droppedId);
                            }
                          }}
                          className={`mt-2 py-2.5 px-3 rounded-2xl border-2 border-dashed flex items-center justify-center gap-2 text-xs font-bold transition ${
                            isOverTrashZone
                              ? "border-red-500 bg-red-50 text-red-600"
                              : draggingIngredientId
                              ? "border-amber-400 bg-amber-50/70 text-amber-800"
                              : "border-slate-200 bg-[#F4F6EE]/60 text-slate-400"
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>
                            {isOverTrashZone
                              ? "Release to remove this ingredient"
                              : "Drag unwanted ingredient here to remove"}
                          </span>
                        </div>
                      </div>
                    </>
                  )}

                  {/* SCREEN #10: RECIPE DETAILS */}
                  {weekSubScreen === "details" && (
                    <>
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => setWeekSubScreen("recipes")}
                          className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#658C38] pro-card-shadow active:scale-90 transition"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="px-8 py-1.5 rounded-full bg-[#94C060] text-white font-bold text-sm shadow-2xs">
                          Details
                        </div>
                        <div className="w-8" />
                      </div>

                      <div className="relative overflow-hidden bg-gradient-to-br from-[#065A52] via-[#04453F] to-[#022C28] rounded-3xl p-4 pro-card-shadow flex items-center gap-4 text-white">
                        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full blur-2xl bg-[#94C060]/25 pointer-events-none" />
                        <div className="w-24 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-5xl flex items-center justify-center shrink-0">
                          {activeRecipe.emoji}
                        </div>
                        <div className="space-y-1 relative z-10">
                          <h2 className="text-base font-bold text-white">
                            {activeRecipe.title}
                          </h2>
                          <div className="inline-flex items-center gap-1.5">
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FFC45A] text-[#04453F]">
                              {activeRecipe.time}
                            </span>
                            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-white/15 text-[#F0E98F]">
                              {activeRecipe.difficulty}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/95 rounded-3xl p-4 pro-card-shadow border border-white/80 space-y-3">
                        <h3 className="text-xs font-bold text-[#0F2926]">
                          Instructions
                        </h3>
                        <div className="space-y-2.5">
                          {activeRecipe.steps.map((s, idx) => (
                            <div key={idx} className="flex items-start gap-2.5">
                              <div className="w-5 h-5 rounded-md bg-[#FFC45A]/45 text-[#04453F] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                {idx + 1}
                              </div>
                              <div>
                                <div className="text-xs font-bold text-[#0F2926]">
                                  {s.title}
                                </div>
                                <p className="text-[11px] text-slate-500 leading-relaxed">
                                  {s.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={() => {
                            notify(`Cooked ${activeRecipe.title}!`);
                            setWeekSubScreen("overview");
                          }}
                          className="w-full mt-2 bg-[#04453F] active:scale-98 text-[#F0E98F] font-bold py-3 rounded-2xl text-xs shadow-sm transition"
                        >
                          Complete Cooking
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {/* -------------------------------------------------------------
                  TAB 2: MY FRIDGE (Screens #11 & #12 — Collapsible Refrigerated & Frozen)
                 ------------------------------------------------------------- */}
              {activeTab === "fridge" && (
                <motion.div
                  key="fridge"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, ease: IOS_EASE }}
                  className="px-4 pt-2 space-y-3.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-8" />
                    <div className="px-7 py-1.5 rounded-full bg-[#94C060] text-white font-bold text-sm shadow-2xs">
                      My Fridge
                    </div>
                    <button
                      onClick={() => setImportScreen("hub")}
                      className="w-8 h-8 rounded-full bg-[#94C060] active:scale-90 text-white flex items-center justify-center shadow-2xs transition"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  {/* CARD 1: COLLAPSIBLE REFRIGERATED */}
                  <div className="bg-white/95 rounded-3xl p-3.5 pro-card-shadow border border-white/80">
                    <div
                      onClick={() =>
                        setCollapsedFridgeZones((prev) => ({
                          ...prev,
                          refrigerated: !prev.refrigerated,
                        }))
                      }
                      className="flex items-center justify-between px-1 cursor-pointer"
                    >
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#F4F6EE] text-[#04453F]">
                        ALL ({refrigeratedItems.length})
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-0.5 rounded-full bg-[#FFC45A] text-[#04453F]">
                        <Thermometer className="w-3 h-3" />
                        <span>Refrigerated</span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            collapsedFridgeZones.refrigerated
                              ? "-rotate-90"
                              : ""
                          }`}
                        />
                      </span>
                    </div>

                    <AnimatePresence initial={false}>
                      {!collapsedFridgeZones.refrigerated && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.24, ease: IOS_EASE }}
                          className="overflow-hidden"
                        >
                          <div className="pt-2 space-y-2">
                            <div className="grid grid-cols-12 text-[10px] font-bold text-slate-400 px-2 pt-1">
                              <div className="col-span-6">Item</div>
                              <div className="col-span-4 text-center">
                                Servings Left
                              </div>
                              <div className="col-span-2 text-right">
                                Days Left
                              </div>
                            </div>

                            <div className="space-y-2">
                              {refrigeratedItems.map((item) =>
                                renderEnhancedFridgeRow(item, false)
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* CARD 2: COLLAPSIBLE FROZEN */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-white/95 via-sky-50/45 to-cyan-50/30 rounded-3xl p-3.5 pro-card-shadow border border-sky-200/60">
                    <Snowflake className="w-24 h-24 text-sky-400/10 absolute -right-4 -top-4 pointer-events-none" />
                    <div
                      onClick={() =>
                        setCollapsedFridgeZones((prev) => ({
                          ...prev,
                          frozen: !prev.frozen,
                        }))
                      }
                      className="flex items-center justify-between px-1 relative z-10 cursor-pointer"
                    >
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-100/80 text-sky-900">
                        ALL ({frozenItems.length})
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-3.5 py-0.5 rounded-full bg-[#FFC45A] text-[#04453F]">
                        <Snowflake className="w-3 h-3 text-sky-700" />
                        <span>Frozen</span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            collapsedFridgeZones.frozen ? "-rotate-90" : ""
                          }`}
                        />
                      </span>
                    </div>

                    <AnimatePresence initial={false}>
                      {!collapsedFridgeZones.frozen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.24, ease: IOS_EASE }}
                          className="overflow-hidden relative z-10"
                        >
                          <div className="pt-2 space-y-2">
                            <div className="grid grid-cols-12 text-[10px] font-bold text-slate-400 px-2 pt-1">
                              <div className="col-span-6">Item</div>
                              <div className="col-span-4 text-center">
                                Servings Left
                              </div>
                              <div className="col-span-2 text-right">
                                Days Left
                              </div>
                            </div>

                            <div className="space-y-2">
                              {frozenItems.map((item) =>
                                renderEnhancedFridgeRow(item, true)
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}

              {/* -------------------------------------------------------------
                  TAB 3: SUGGESTED LIST (Auto-Collapses 0-need categories & removes "0 servings" text!)
                 ------------------------------------------------------------- */}
              {activeTab === "list" && (
                <motion.div
                  key="list"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, ease: IOS_EASE }}
                  className="px-4 pt-2 space-y-3.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-8" />
                    <div className="px-6 py-1.5 rounded-full bg-[#94C060] text-white font-bold text-sm shadow-2xs">
                      Suggested List
                    </div>
                    <button
                      onClick={() => setImportScreen("hub")}
                      className="w-8 h-8 rounded-full bg-[#94C060] active:scale-90 text-white flex items-center justify-center shadow-2xs transition"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="bg-white/95 rounded-2xl p-3 text-center border border-white/80 pro-card-shadow">
                    <p className="text-[11px] text-slate-600 font-medium">
                      Auto-adjusted from{" "}
                      <strong className="text-[#04453F]">
                        {fridgeItems.reduce((s, i) => s + i.servings, 0)}{" "}
                        servings in your fridge
                      </strong>{" "}
                      &{" "}
                      <strong className="text-[#04453F]">
                        {weeklyAbsencesCount} meals out
                      </strong>
                    </p>
                  </div>

                  {(
                    [
                      "Staples",
                      "Produce",
                      "Protein",
                      "Drinks & Condiments",
                    ] as const
                  ).map((catKey) => {
                    const items = dynamicSuggestedList.filter(
                      (i) => i.category === catKey
                    );
                    const quotaInfo = getCategoryDynamicQuota(catKey);
                    // Auto-collapse when netToBuy === 0 (or no items needed), unless user manually toggled it
                    const isCollapsed =
                      manualCategoryCollapse[catKey] !== undefined
                        ? manualCategoryCollapse[catKey]
                        : quotaInfo.netToBuy === 0 || items.length === 0;

                    return (
                      <div
                        key={catKey}
                        className="bg-white/95 rounded-3xl p-4 pro-card-shadow border border-white/80"
                      >
                        <div
                          onClick={() =>
                            setManualCategoryCollapse((prev) => ({
                              ...prev,
                              [catKey]: !isCollapsed,
                            }))
                          }
                          className="flex items-center justify-between cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span className="px-3.5 py-1 rounded-full bg-[#FFC45A] text-[#04453F] text-xs font-bold">
                              {catKey}
                            </span>
                            <span className="text-[10px] text-[#658C38] font-semibold">
                              ({quotaInfo.inFridgeText})
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs font-bold text-[#0F2926]">
                            {/* Only display quotaText when netToBuy > 0 (never show "0 servings (Fridge full)") */}
                            {quotaInfo.quotaText && (
                              <span>{quotaInfo.quotaText}</span>
                            )}
                            <ChevronDown
                              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                                isCollapsed ? "-rotate-90" : ""
                              }`}
                            />
                          </div>
                        </div>

                        <AnimatePresence initial={false}>
                          {!isCollapsed && items.length > 0 && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.24, ease: IOS_EASE }}
                              className="overflow-hidden"
                            >
                              <div className="pt-3 flex overflow-x-auto gap-2.5 pb-1 no-scrollbar snap-x snap-mandatory">
                                {items.map((item) => (
                                  <div
                                    key={item.id}
                                    className={`w-[104px] shrink-0 snap-start rounded-2xl p-2.5 flex flex-col items-center text-center border transition ${
                                      item.checked
                                        ? "bg-[#94C060]/15 border-[#94C060]"
                                        : "bg-[#F4F6EE] border-transparent"
                                    }`}
                                  >
                                    <div className="w-full flex items-center justify-between">
                                      {item.inFridgeServings > 0 ? (
                                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#FFC45A]/45 text-[#04453F]">
                                          Have {item.inFridgeServings}
                                        </span>
                                      ) : (
                                        <span />
                                      )}
                                      <button
                                        type="button"
                                        onClick={() =>
                                          toggleSuggestedCheck(
                                            item.id,
                                            item.checked
                                          )
                                        }
                                        className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] ${
                                          item.checked
                                            ? "bg-[#04453F] text-white"
                                            : "bg-white border border-slate-300"
                                        }`}
                                      >
                                        {item.checked && "✓"}
                                      </button>
                                    </div>

                                    <span
                                      onClick={() =>
                                        toggleSuggestedCheck(
                                          item.id,
                                          item.checked
                                        )
                                      }
                                      className="text-3xl my-1 cursor-pointer"
                                    >
                                      {item.emoji}
                                    </span>
                                    <span className="text-xs font-bold text-[#0F2926] line-clamp-1">
                                      {item.name}
                                    </span>
                                    <span className="text-[10px] font-semibold text-[#04453F] mt-0.5">
                                      {item.servings}{" "}
                                      {item.servings === 1
                                        ? item.unit
                                        : `${item.unit}s`}
                                    </span>

                                    <div className="mt-2 flex items-center gap-1.5">
                                      <button
                                        onClick={() =>
                                          adjustSuggestedServings(item.id, -1)
                                        }
                                        className="w-6 h-6 rounded-lg bg-white active:scale-90 text-[#04453F] font-bold text-xs shadow-2xs transition"
                                      >
                                        -
                                      </button>
                                      <button
                                        onClick={() =>
                                          adjustSuggestedServings(item.id, 1)
                                        }
                                        className="w-6 h-6 rounded-lg bg-white active:scale-90 text-[#04453F] font-bold text-xs shadow-2xs transition"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}

                  <button
                    onClick={importCheckedToFridge}
                    className="w-full bg-[#04453F] active:scale-98 text-[#F0E98F] font-bold py-3.5 rounded-2xl text-xs shadow-sm transition"
                  >
                    Import Selected Items to My Fridge
                  </button>
                </motion.div>
              )}

              {/* -------------------------------------------------------------
                  TAB 4: ME -> PROFILE -> EDIT PROFILE (Screens #14, #15, #16)
                 ------------------------------------------------------------- */}
              {activeTab === "me" && (
                <motion.div
                  key={`me-${meSubScreen}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, ease: IOS_EASE }}
                  className="px-4 pt-2 space-y-3.5"
                >
                  {meSubScreen === "menu" && (
                    <>
                      <div className="flex justify-center">
                        <div className="px-9 py-1.5 rounded-full bg-[#94C060] text-white font-bold text-sm shadow-2xs">
                          Me
                        </div>
                      </div>

                      <div
                        onClick={() => setMeSubScreen("profile_view")}
                        className="relative overflow-hidden bg-gradient-to-br from-[#065A52] via-[#04453F] to-[#022C28] rounded-3xl p-4 text-white flex items-center gap-4 shadow-md cursor-pointer"
                      >
                        <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full blur-2xl bg-[#94C060]/25 pointer-events-none" />
                        <div className="w-14 h-14 rounded-2xl bg-[#FFC45A] text-[#04453F] flex items-center justify-center text-3xl font-bold relative z-10">
                          🙂
                        </div>
                        <div className="relative z-10">
                          <h2 className="font-bold text-base text-white">
                            Freshie
                          </h2>
                          <p className="text-xs text-[#F0E98F]/85 mt-0.5">
                            {weightKg}KG · {dinersCount} Diner(s) ·{" "}
                            {effectiveFlavorPref}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {[
                          {
                            label: "Profile",
                            action: () => setMeSubScreen("profile_view"),
                          },
                          {
                            label: "Account & Household",
                            action: () =>
                              notify("Account & Household synced"),
                          },
                          {
                            label: "Help & Support",
                            action: () =>
                              notify("Opening Storage & Help Guide"),
                          },
                          {
                            label: "Contact Us",
                            action: () => notify("support@freshdate.app"),
                          },
                          {
                            label: "Send Feedback",
                            action: () =>
                              notify("Thank you for your feedback!"),
                          },
                          {
                            label: "About",
                            action: () =>
                              notify(
                                "FRESHDATE v1.0 · Fridge Intervention App"
                              ),
                          },
                          {
                            label: "Settings",
                            action: () => setMeSubScreen("profile_edit"),
                          },
                        ].map((row, idx) => (
                          <button
                            key={idx}
                            onClick={row.action}
                            className="w-full bg-white/95 hover:bg-white active:scale-99 px-4 py-3 rounded-2xl pro-card-shadow border border-white/80 flex items-center justify-between text-xs font-bold text-[#0F2926] transition"
                          >
                            <span>{row.label}</span>
                            <ChevronRight className="w-4 h-4 text-[#658C38]" />
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {meSubScreen === "profile_view" && (
                    <>
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => setMeSubScreen("menu")}
                          className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#658C38] pro-card-shadow active:scale-90 transition"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="px-8 py-1.5 rounded-full bg-[#94C060] text-white font-bold text-sm shadow-2xs">
                          Profile
                        </div>
                        <button
                          onClick={() => setImportScreen("hub")}
                          className="w-8 h-8 rounded-full bg-[#94C060] active:scale-90 text-white flex items-center justify-center shadow-2xs transition"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>

                      {renderVernierWeightCard(true)}

                      <div className="bg-white/95 rounded-2xl px-4 py-3 pro-card-shadow border border-white/80 flex items-center justify-between text-xs font-bold">
                        <span>Number of Diners:</span>
                        <span>{dinersCount}</span>
                      </div>

                      <div className="bg-white/95 rounded-3xl p-4 pro-card-shadow border border-white/80 space-y-3 text-xs">
                        <div className="flex justify-between">
                          <span className="font-bold">Foods to Avoid</span>
                          <span className="text-slate-500">
                            {effectiveAvoidFoods}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-bold">Allergens</span>
                          <span className="text-slate-500">
                            {effectiveAllergens}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-bold">Flavor Preferences</span>
                          <span className="text-slate-500">
                            {effectiveFlavorPref}
                          </span>
                        </div>
                      </div>

                      <div className="pt-6 flex justify-center">
                        <button
                          onClick={() => setMeSubScreen("profile_edit")}
                          className="w-36 bg-[#FFC45A] active:scale-95 text-[#04453F] font-bold py-2.5 rounded-full text-xs shadow-xs transition"
                        >
                          Edit
                        </button>
                      </div>
                    </>
                  )}

                  {meSubScreen === "profile_edit" && (
                    <>
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => {
                            setOpenDropdownKey(null);
                            setMeSubScreen("profile_view");
                          }}
                          className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#658C38] pro-card-shadow active:scale-90 transition"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="px-8 py-1.5 rounded-full bg-[#94C060] text-white font-bold text-sm shadow-2xs">
                          Profile
                        </div>
                        <button
                          onClick={() => setImportScreen("hub")}
                          className="w-8 h-8 rounded-full bg-[#94C060] active:scale-90 text-white flex items-center justify-center shadow-2xs transition"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>

                      {renderVernierWeightCard(false)}

                      <div className="bg-white/95 rounded-2xl px-4 py-3 pro-card-shadow border border-white/80 flex items-center justify-between text-xs">
                        <span className="font-bold">Number of Diners:</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              setDinersCount(Math.max(1, dinersCount - 1))
                            }
                            className="w-6 h-6 rounded-lg bg-[#FFC45A]/30 active:scale-90 text-[#04453F] font-bold transition"
                          >
                            -
                          </button>
                          <span className="w-5 text-center font-bold">
                            {dinersCount}
                          </span>
                          <button
                            onClick={() => setDinersCount(dinersCount + 1)}
                            className="w-6 h-6 rounded-lg bg-[#FFC45A]/30 active:scale-90 text-[#04453F] font-bold transition"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {renderDietaryDropdownsWithOther()}

                      <div className="bg-white/95 rounded-3xl p-4 pro-card-shadow border border-white/80 space-y-3 text-xs font-sans">
                        <div className="font-bold text-[#0F2926]">
                          Notification Settings
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">
                            Enable Expiration Reminder
                          </span>
                          <button
                            onClick={() =>
                              setReminderEnabled(!reminderEnabled)
                            }
                            className={`w-10 h-5 rounded-full p-0.5 transition ${
                              reminderEnabled
                                ? "bg-[#FFC45A]"
                                : "bg-slate-300"
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full bg-white transition transform ${
                                reminderEnabled
                                  ? "translate-x-5"
                                  : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-600">
                              Reminder Interval
                            </span>
                            {renderCustomSansDropdown(
                              "reminder",
                              reminderDaysChoice,
                              [
                                { value: "1", label: "1 day" },
                                { value: "2", label: "2 days" },
                                { value: "3", label: "3 days" },
                                { value: "Other", label: "Other..." },
                              ],
                              setReminderDaysChoice
                            )}
                          </div>

                          {reminderDaysChoice === "Other" && (
                            <div className="flex items-center gap-2 pt-1">
                              <input
                                type="number"
                                min={1}
                                max={30}
                                value={customReminderDays}
                                onChange={(e) =>
                                  setCustomReminderDays(e.target.value)
                                }
                                placeholder="Custom days..."
                                className="flex-1 px-3 py-1.5 rounded-xl bg-[#F4F6EE] border border-[#04453F]/15 text-xs font-sans text-[#0F2926] outline-none"
                              />
                              <span className="text-slate-500 font-semibold">
                                days before
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 flex justify-center">
                        <button
                          onClick={() => {
                            setOpenDropdownKey(null);
                            setMeSubScreen("profile_view");
                            notify("Profile saved");
                          }}
                          className="w-36 bg-[#FFC45A] active:scale-95 text-[#04453F] font-bold py-2.5 rounded-full text-xs shadow-xs transition"
                        >
                          Done
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </main>

            {/* ===============================================================
                MODAL: "+ OTHER" INGREDIENT PICKER IN RECIPES (Pure English!)
               =============================================================== */}
            <AnimatePresence>
              {showOtherIngredientModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: IOS_EASE }}
                  className="absolute inset-0 z-50 bg-black/35 backdrop-blur-xs flex items-end"
                >
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ duration: 0.28, ease: IOS_EASE }}
                    className="w-full bg-white rounded-t-[34px] p-5 space-y-4 shadow-2xl"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-[#04453F]">
                          Choose Another Ingredient
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          Replace unwanted ingredients or add your own
                        </p>
                      </div>
                      <button
                        onClick={() => setShowOtherIngredientModal(false)}
                        className="w-8 h-8 rounded-full bg-[#F4F6EE] flex items-center justify-center text-slate-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {ALTERNATIVE_INGREDIENTS.map((alt) => (
                        <button
                          key={alt.id}
                          type="button"
                          onClick={() => handleSelectOtherIngredient(alt)}
                          className="bg-[#F4F6EE] hover:bg-[#94C060]/20 active:scale-95 rounded-2xl p-2.5 flex flex-col items-center text-center transition"
                        >
                          <span className="text-2xl mb-1">{alt.emoji}</span>
                          <span className="text-[10px] font-bold text-[#0F2926]">
                            {alt.name}
                          </span>
                        </button>
                      ))}
                    </div>

                    <form
                      onSubmit={handleAddCustomOtherIngredient}
                      className="flex gap-2 pt-1"
                    >
                      <input
                        type="text"
                        value={customOtherIngName}
                        onChange={(e) => setCustomOtherIngName(e.target.value)}
                        placeholder="Or type any other ingredient..."
                        className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#F4F6EE] text-xs font-medium outline-none border border-[#04453F]/10 focus:border-[#04453F]"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2.5 rounded-xl bg-[#04453F] text-[#F0E98F] text-xs font-bold"
                      >
                        Add
                      </button>
                    </form>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ===============================================================
                DRAGGABLE BOTTOM SHEET: FOOD DETAIL / STORAGE GUIDE
               =============================================================== */}
            <AnimatePresence>
              {editingFridgeItem && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: IOS_EASE }}
                  className="absolute inset-0 z-40 bg-black/35 backdrop-blur-xs flex items-end"
                >
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ duration: 0.28, ease: IOS_EASE }}
                    drag="y"
                    dragConstraints={{ top: 0, bottom: 260 }}
                    dragElastic={0.15}
                    onDragEnd={(_, info) => {
                      if (info.offset.y > 80) {
                        setEditingFridgeItem(null);
                      }
                    }}
                    className="w-full bg-white rounded-t-[34px] p-5 space-y-4 shadow-2xl"
                  >
                    <div className="w-10 h-1.5 rounded-full bg-slate-200 mx-auto cursor-grab" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#F4F6EE] flex items-center justify-center text-3xl">
                          {editingFridgeItem.emoji}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-[#04453F]">
                            {editingFridgeItem.name}
                          </h3>
                          <span className="text-[11px] text-slate-400">
                            Added {editingFridgeItem.dateAdded} · Expires{" "}
                            {editingFridgeItem.expirationDate}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setEditingFridgeItem(null)}
                        className="w-8 h-8 rounded-full bg-[#F4F6EE] flex items-center justify-center text-slate-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 bg-[#F4F6EE] p-3 rounded-2xl leading-relaxed">
                      <strong className="text-[#04453F]">Storage Guide:</strong>{" "}
                      {editingFridgeItem.storageTip}
                    </p>

                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-600">
                        Storage Location
                      </span>
                      <button
                        onClick={() =>
                          toggleFridgeItemZone(editingFridgeItem.id)
                        }
                        className="px-3.5 py-1.5 rounded-full bg-[#FFC45A] active:scale-95 text-[#04453F] font-bold transition"
                      >
                        Switch to{" "}
                        {editingFridgeItem.zone === "refrigerated"
                          ? `Frozen (${editingFridgeItem.frozenShelfLifeDays}d)`
                          : `Refrigerated (${editingFridgeItem.shelfLifeDays}d)`}
                      </button>
                    </div>

                    <button
                      onClick={() => setEditingFridgeItem(null)}
                      className="w-full bg-[#04453F] text-[#F0E98F] font-bold py-3 rounded-2xl text-xs"
                    >
                      Done
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ===============================================================
                IMPORT SCREENS (#3 IMPORT HUB, #4 SCAN, #5 PHOTO, #6 MANUAL, #7 FOOD INFO)
               =============================================================== */}
            <AnimatePresence>
              {importScreen !== "closed" && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ duration: 0.24, ease: IOS_EASE }}
                  className="absolute inset-0 z-40 bg-[#F4F6EE] flex flex-col"
                >
                  {importScreen === "hub" && (
                    <div className="flex-1 overflow-y-auto px-4 pt-4 pb-8 space-y-3.5 no-scrollbar">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => setImportScreen("closed")}
                          className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#658C38] pro-card-shadow"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="px-8 py-1.5 rounded-full bg-[#94C060] text-white font-bold text-sm shadow-2xs">
                          Import
                        </div>
                        <div className="w-8" />
                      </div>

                      <button
                        onClick={() => {
                          setCameraMode("scan");
                          setImportScreen("scan");
                        }}
                        className="w-full bg-white/95 rounded-2xl p-4 pro-card-shadow border border-white/80 flex items-center justify-between text-left hover:bg-[#94C060]/10 transition"
                      >
                        <div>
                          <div className="text-xs font-bold text-[#0F2926]">
                            Take Photo / Scan / Gallery
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Take a photo of the product or barcode—the system will identify it automatically
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#658C38] shrink-0" />
                      </button>

                      <button
                        onClick={() => setImportScreen("manual")}
                        className="w-full bg-white/95 rounded-2xl p-4 pro-card-shadow border border-white/80 flex items-center justify-between text-left hover:bg-[#94C060]/10 transition"
                      >
                        <span className="text-xs font-bold text-[#0F2926]">
                          Manual Entry
                        </span>
                        <ChevronRight className="w-4 h-4 text-[#658C38] shrink-0" />
                      </button>

                      <div className="bg-white/95 rounded-3xl p-4 pro-card-shadow border border-white/80 space-y-3">
                        <div className="text-xs font-bold text-[#0F2926]">
                          Recent Entries
                        </div>
                        <div className="grid grid-cols-3 gap-2.5">
                          {RECENT_ENTRIES.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => openFoodInfoSheet(item)}
                              className="bg-[#F4F6EE] hover:bg-[#94C060]/20 active:scale-95 rounded-2xl p-3 flex flex-col items-center text-center transition"
                            >
                              <span className="text-3xl mb-1">
                                {item.emoji}
                              </span>
                              <span className="text-[11px] font-semibold text-[#0F2926] line-clamp-1">
                                {item.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {importScreen === "scan" && (
                    <div className="flex-1 bg-[#081210] text-white flex flex-col justify-between relative overflow-hidden">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />

                      <div className="pt-4 px-5 flex items-center justify-between z-20">
                        <button
                          onClick={() => setImportScreen("hub")}
                          className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-[#94C060]"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1 rounded-full bg-white/15 text-xs font-semibold flex items-center gap-1"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload</span>
                        </button>
                      </div>

                      <div className="flex-1 flex flex-col items-center justify-center px-6">
                        {cameraMode === "scan" ? (
                          <div className="w-full h-52 relative flex items-center justify-center border-y border-dashed border-[#94C060]/40">
                            <div className="w-full h-0.5 bg-[#94C060] shadow-[0_0_12px_#94C060] absolute animate-scan" />
                            <span className="text-6xl">🥛</span>
                          </div>
                        ) : (
                          <div className="w-56 h-56 relative flex items-center justify-center">
                            <span className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white/80" />
                            <span className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white/80" />
                            <span className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white/80" />
                            <span className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white/80" />
                            {uploadedPhotoUrl ? (
                              <img
                                src={uploadedPhotoUrl}
                                alt="Uploaded"
                                className="w-full h-full object-cover rounded-2xl"
                              />
                            ) : (
                              <span className="text-6xl">🌽</span>
                            )}
                          </div>
                        )}

                        <div className="mt-5 px-4 py-1.5 rounded-full bg-[#F0E98F] text-[#04453F] text-[11px] font-bold">
                          Align the product — auto recognition
                        </div>

                        <button
                          onClick={() =>
                            openFoodInfoSheet(
                              cameraMode === "scan"
                                ? RECENT_ENTRIES[0]
                                : CATALOG_ITEMS[1]
                            )
                          }
                          className="mt-4 w-14 h-14 rounded-full bg-[#94C060] border-4 border-white/80 shadow-lg active:scale-95 transition"
                        />

                        <div className="flex items-center gap-8 mt-3 text-xs font-bold">
                          <button
                            onClick={() => setCameraMode("scan")}
                            className={
                              cameraMode === "scan"
                                ? "text-white underline underline-offset-4"
                                : "text-white/40"
                            }
                          >
                            Scan
                          </button>
                          <button
                            onClick={() => setCameraMode("photo")}
                            className={
                              cameraMode === "photo"
                                ? "text-white underline underline-offset-4"
                                : "text-white/40"
                            }
                          >
                            Photo
                          </button>
                        </div>
                      </div>

                      <div className="bg-[#04453F] p-3.5 rounded-t-3xl space-y-2">
                        <div className="flex items-center justify-between text-xs text-white/80 px-1">
                          <span>Photos</span>
                          <span className="font-bold text-white">
                            My Photos
                          </span>
                          <span>⌃</span>
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                          {[
                            RECENT_ENTRIES[6],
                            RECENT_ENTRIES[7],
                            RECENT_ENTRIES[2],
                            RECENT_ENTRIES[0],
                            RECENT_ENTRIES[1],
                          ].map((it) => (
                            <button
                              key={it.id}
                              onClick={() => openFoodInfoSheet(it)}
                              className="aspect-square rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-2xl"
                            >
                              {it.emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {importScreen === "manual" && (
                    <div className="flex-1 overflow-y-auto px-4 pt-4 pb-8 flex flex-col justify-between no-scrollbar">
                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => setImportScreen("hub")}
                            className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#658C38] pro-card-shadow"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <div className="px-8 py-1.5 rounded-full bg-[#94C060] text-white font-bold text-sm shadow-2xs">
                            Import
                          </div>
                          <div className="w-8" />
                        </div>

                        <div className="relative">
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search for food"
                            className="w-full pl-4 pr-10 py-2.5 bg-white/95 rounded-full text-xs font-medium outline-none border border-white/80 pro-card-shadow"
                          />
                          <Search className="w-4 h-4 text-[#658C38] absolute right-3.5 top-1/2 -translate-y-1/2" />
                        </div>

                        <div className="bg-white/95 rounded-3xl p-4 pro-card-shadow border border-white/80 space-y-3">
                          <div className="flex items-center justify-between text-xs font-bold border-b border-slate-100 pb-2">
                            {(
                              ["All", "Staples", "Produce", "Protein"] as const
                            ).map((cat) => (
                              <button
                                key={cat}
                                onClick={() => setManualCategory(cat)}
                                className={`px-3 py-1 rounded-full transition ${
                                  manualCategory === cat
                                    ? "bg-[#FFC45A] text-[#04453F]"
                                    : "text-slate-500"
                                }`}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>

                          <div className="grid grid-cols-3 gap-2.5">
                            {filteredCatalog.map((item) => (
                              <button
                                key={item.id}
                                onClick={() =>
                                  openFoodInfoSheet(item, defaultZoneFilter)
                                }
                                className="bg-[#F4F6EE] hover:ring-2 hover:ring-[#04453F] active:scale-95 rounded-2xl p-3 flex flex-col items-center text-center transition"
                              >
                                <span className="text-3xl mb-1">
                                  {item.emoji}
                                </span>
                                <span className="text-[11px] font-semibold text-[#0F2926]">
                                  {item.name}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-4">
                        <button
                          onClick={() => setDefaultZoneFilter("refrigerated")}
                          className={`py-2.5 rounded-full text-xs font-bold border transition ${
                            defaultZoneFilter === "refrigerated"
                              ? "bg-[#F0E98F] text-[#04453F] border-[#04453F]/30 shadow-2xs"
                              : "bg-white text-slate-500 border-slate-200"
                          }`}
                        >
                          Refrigerated
                        </button>
                        <button
                          onClick={() => setDefaultZoneFilter("frozen")}
                          className={`py-2.5 rounded-full text-xs font-bold border transition ${
                            defaultZoneFilter === "frozen"
                              ? "bg-[#F0E98F] text-[#04453F] border-[#04453F]/30 shadow-2xs"
                              : "bg-white text-slate-500 border-slate-200"
                          }`}
                        >
                          Frozen
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SCREEN #7: SMOOTH DRAGGABLE BOTTOM SHEET FOR FOOD INFORMATION */}
                  <AnimatePresence>
                    {selectedCatalogItem && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, ease: IOS_EASE }}
                        className="absolute inset-0 z-50 bg-black/35 backdrop-blur-xs flex items-end"
                      >
                        <motion.div
                          initial={{ y: "100%" }}
                          animate={{ y: 0 }}
                          exit={{ y: "100%" }}
                          transition={{ duration: 0.28, ease: IOS_EASE }}
                          drag="y"
                          dragConstraints={{ top: 0, bottom: 260 }}
                          dragElastic={0.15}
                          onDragEnd={(_, info) => {
                            if (info.offset.y > 80) {
                              setSelectedCatalogItem(null);
                            }
                          }}
                          className="w-full bg-[#F4F6EE] rounded-t-[34px] p-5 space-y-3 shadow-2xl border-t-2 border-[#94C060]"
                        >
                          <div className="w-10 h-1.5 rounded-full bg-slate-300 mx-auto cursor-grab" />

                          <div className="flex items-center justify-between px-1">
                            <h3 className="text-lg font-extrabold text-[#0F2926] flex items-center gap-2">
                              <span>{selectedCatalogItem.emoji}</span>
                              <span>{selectedCatalogItem.name}</span>
                            </h3>
                            <button
                              onClick={() => setSelectedCatalogItem(null)}
                              className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-slate-500"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="bg-white rounded-2xl px-4 py-2.5 flex items-center justify-between text-xs border border-[#04453F]/10">
                            <span className="font-bold text-[#0F2926]">
                              🍴 Servings
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  setDraftServings(
                                    Math.max(1, draftServings - 1)
                                  )
                                }
                                className="w-6 h-6 rounded-lg bg-[#FFC45A]/35 text-[#04453F] font-bold"
                              >
                                -
                              </button>
                              <span className="w-6 text-center font-bold">
                                {draftServings}
                              </span>
                              <button
                                onClick={() =>
                                  setDraftServings(draftServings + 1)
                                }
                                className="w-6 h-6 rounded-lg bg-[#FFC45A]/35 text-[#04453F] font-bold"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div className="bg-white rounded-2xl px-4 py-2.5 flex items-center justify-between text-xs border border-[#04453F]/10">
                            <span className="font-bold text-[#0F2926]">
                              🧊 Storage Location
                            </span>
                            <div className="flex gap-1 bg-[#F4F6EE] p-1 rounded-xl">
                              <button
                                onClick={() => {
                                  setDraftZone("refrigerated");
                                  setDraftShelfLife(
                                    selectedCatalogItem.defaultShelfLifeRefrigerated
                                  );
                                }}
                                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                                  draftZone === "refrigerated"
                                    ? "bg-[#FFC45A] text-[#04453F]"
                                    : "text-slate-500"
                                }`}
                              >
                                Refrigerated
                              </button>
                              <button
                                onClick={() => {
                                  setDraftZone("frozen");
                                  setDraftShelfLife(
                                    selectedCatalogItem.defaultShelfLifeFrozen
                                  );
                                }}
                                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                                  draftZone === "frozen"
                                    ? "bg-[#FFC45A] text-[#04453F]"
                                    : "text-slate-500"
                                }`}
                              >
                                Frozen
                              </button>
                            </div>
                          </div>

                          <div className="bg-white rounded-2xl p-3.5 space-y-2 text-xs border border-[#04453F]/10">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#0F2926]">
                                ⏳ Shelf Life
                              </span>
                              <span className="px-2.5 py-0.5 rounded-md bg-[#F4F6EE] font-semibold">
                                {draftShelfLife} days
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#0F2926]">
                                📅 Date Added
                              </span>
                              <span className="px-2.5 py-0.5 rounded-md bg-[#F4F6EE] font-sans text-[11px]">
                                {selectedCatalogItem.dateAdded}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#0F2926]">
                                🔔 Expiration Date
                              </span>
                              <span className="px-2.5 py-0.5 rounded-md bg-[#F4F6EE] font-sans text-[11px]">
                                {selectedCatalogItem.expirationDate}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={confirmAddCatalogItem}
                            className="w-full bg-[#04453F] text-[#F0E98F] font-bold py-3 rounded-2xl text-xs shadow-md"
                          >
                            Confirm & Add to My Fridge
                          </button>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ===============================================================
                BOTTOM NAVIGATION BAR
               =============================================================== */}
            <nav className="absolute bottom-0 inset-x-0 z-30 bg-[#04453F] px-6 pt-2.5 pb-5 flex items-center justify-between">
              {[
                { id: "week", label: "My Week", icon: Calendar },
                {
                  id: "fridge",
                  label: "My Fridge",
                  icon: Refrigerator,
                  badge: urgentCount,
                },
                { id: "list", label: "Suggested List", icon: ClipboardList },
                { id: "me", label: "Me", icon: User },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setImportScreen("closed");
                      setSelectedCatalogItem(null);
                      setEditingFridgeItem(null);
                      setShowRecipeMealMenu(false);
                      setShowOtherIngredientModal(false);
                      setOpenDropdownKey(null);
                      setWeekSubScreen("overview");
                      setMeSubScreen("menu");
                      setActiveTab(tab.id as ActiveTab);
                    }}
                    className="flex flex-col items-center gap-1 relative active:scale-92 transition-transform"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-200 ${
                        isActive
                          ? "bg-[#F0E98F] text-[#04453F] shadow-xs"
                          : "bg-white/10 text-[#F0E98F] hover:bg-white/20"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    {tab.badge ? (
                      <span className="absolute -top-1 -right-1 z-20 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-[#04453F]">
                        {tab.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </nav>
          </>
        )}

        {/* iOS Home Indicator */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/30 rounded-full z-50 pointer-events-none" />
      </div>
    </div>
  );
}
