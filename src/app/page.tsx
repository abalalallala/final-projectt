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

// ============================================================================
// UNIFIED GRAPHIC DESIGN TOKENS (Original Gradients + Refrigerator Outer Frame)
// ============================================================================
// 1. Containers:
// - FRIDGE_FRAME_CLS: Original design's Green-to-Butter-Yellow gradient refrigerator outer frame
// - CONTEXT_BAR_CLS: Level 0 context summary strip inside the refrigerator frame
// - CARD_CLS: Level 1 white inner refrigerator compartment card (rounded-[20px] p-4)
// - TILE_CLS: Level 2 inner item tile (rounded-[14px])
const FRIDGE_FRAME_CLS = "fridge-outer-frame p-3 space-y-3 relative";
const CONTEXT_BAR_CLS =
  "bg-white/80 backdrop-blur-xs border-[1.5px] border-[#04453F]/14 rounded-[16px] px-3.5 py-2.5 shadow-2xs";
const CARD_CLS =
  "bg-white/96 rounded-[20px] p-4 pro-card-shadow border-[1.5px] border-[#04453F]/16 relative";
const TILE_CLS = "bg-[#F4F6EE] rounded-[14px]";

// 2. Typography: 4 strict levels
const T_HEADER_PILL =
  "h-9 px-7 rounded-full sage-gradient-pill text-white font-bold text-[15px] tracking-tight flex items-center justify-center";
const T_CARD_TITLE = "text-[14px] font-bold text-[#0F2926] tracking-tight";
const T_ITEM_NAME = "text-[13px] font-semibold text-[#0F2926]";
const T_META = "text-[11px] font-medium text-slate-400";

// 3. Unified Clickable Button System (Original Warm Amber Gradient Family)
const BTN_PRIMARY =
  "amber-gradient-btn hover:brightness-105 active:scale-96 text-[#04453F] font-bold text-[13px] rounded-full px-6 py-2.5 transition cursor-pointer inline-flex items-center justify-center gap-1.5";
const BTN_PILL_ACTIVE =
  "amber-gradient-btn hover:brightness-105 active:scale-95 text-[#04453F] font-bold text-[12px] rounded-full px-3.5 py-1.5 transition cursor-pointer inline-flex items-center justify-center gap-1.5";
const BTN_STEPPER =
  "w-5 h-5 rounded-full bg-[#F4F6EE] hover:bg-[#FFC45A] active:scale-90 text-[#04453F] font-bold text-[12px] flex items-center justify-center transition cursor-pointer";
const BTN_ICON_CIRCLE =
  "w-9 h-9 rounded-full amber-gradient-btn hover:brightness-105 active:scale-90 text-[#04453F] flex items-center justify-center transition cursor-pointer";

export default function FreshDateApp() {
  // =========================================================================
  // 1. AUTH & ONBOARDING FLOW
  // =========================================================================
  const [appStage, setAppStage] = useState<AppStage>("login");
  const [userEmail, setUserEmail] = useState("freshie@freshdate.app");

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

  // Import Flow State
  const [importScreen, setImportScreen] = useState<ImportScreen>("closed");
  const [cameraMode, setCameraMode] = useState<"scan" | "photo">("scan");
  const [manualCategory, setManualCategory] = useState<
    "All" | "Staples" | "Produce" | "Protein"
  >("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [defaultZoneFilter, setDefaultZoneFilter] =
    useState<StorageZone>("refrigerated");

  const [selectedCatalogItem, setSelectedCatalogItem] =
    useState<CatalogItem | null>(null);
  const [draftServings, setDraftServings] = useState(1);
  const [draftZone, setDraftZone] = useState<StorageZone>("refrigerated");
  const [draftShelfLife, setDraftShelfLife] = useState(5);

  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // =========================================================================
  // 3. MY WEEK & RECIPES STATE
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
  const [manualCategoryCollapse, setManualCategoryCollapse] = useState<
    Record<string, boolean>
  >({});

  // Me State
  const [meSubScreen, setMeSubScreen] = useState<MeSubScreen>("menu");

  const notify = (msg: string) => {
    toast.success(msg, {
      style: {
        background: "#04453F",
        color: "#F0E98F",
        border: "1px solid rgba(148,192,96,0.35)",
        borderRadius: "16px",
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
        quotaText: "",
        inFridgeText: `In fridge: ${totalInFridge}`,
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
      quotaText: `${netToBuy}–${netToBuy + 1} srv`,
      inFridgeText: `In fridge: ${totalInFridge}`,
    };
  };

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
    }).filter((item) => item.servings > 0);
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
            notify(`Finished ${item.name} — Suggested List updated`);
            if (editingFridgeItem?.id === id) setEditingFridgeItem(null);
            return null;
          }
          notify(`${item.name}: ${nextServings} srv`);
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
            toFreezer ? "Frozen" : "Refrigerated"
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
    notify(`Added ${draftServings}x ${selectedCatalogItem.name}`);
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
      notify(`Removed "${target.name}"`);
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
    notify(`Added "${ing.name}"`);
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
    notify(`Added "${newIng.name}"`);
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
    notify(`Added ${checked.length} items to My Fridge`);
  };

  // Freshness Progress Bar & Semantic Status Indicator (Non-button status tag)
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
        badgeClass: "bg-red-500 text-white",
        barColor: "bg-red-500",
        pct,
      };
    }
    if (item.daysLeft <= 2) {
      return {
        badgeClass: "bg-amber-100 text-amber-900",
        barColor: "bg-amber-500",
        pct,
      };
    }
    if (item.zone === "frozen") {
      return {
        badgeClass: "bg-sky-100 text-sky-900",
        barColor: "bg-sky-400",
        pct,
      };
    }
    return {
      badgeClass: "bg-[#94C060]/30 text-[#04453F]",
      barColor: "bg-[#94C060]",
      pct,
    };
  };

  // Precision Vernier Caliper Weight Scale
  const renderVernierWeightCard = (readOnly?: boolean) => {
    const ticks = Array.from({ length: 41 }, (_, i) => 50 + i);
    return (
      <div className={`${CARD_CLS} space-y-2.5`}>
        <div className="flex items-center justify-between">
          <span className={T_CARD_TITLE}>Current Weight</span>
          <span className="text-[16px] font-extrabold text-[#04453F]">
            {weightKg} KG
          </span>
        </div>

        <div className={`${TILE_CLS} px-3 pt-3 pb-2 overflow-hidden`}>
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

  // Unified Interactive Dropdown Button
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
          className={BTN_PILL_ACTIVE}
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
              className="absolute right-0 mt-1.5 w-44 bg-white rounded-[16px] shadow-[0_14px_34px_rgba(4,69,63,0.16)] border border-[#04453F]/12 py-1.5 z-50 font-sans"
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
                    className={`w-full px-3.5 py-2 text-left text-[12px] font-sans font-semibold flex items-center justify-between transition ${
                      isSelected
                        ? "bg-[#94C060]/20 text-[#04453F] font-bold"
                        : "text-[#0F2926] hover:bg-[#F4F6EE]"
                    }`}
                  >
                    <span>{opt.label}</span>
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

  // Calendar Card with Unified Typography & Button Styles
  const renderCalendarCard = () => (
    <div className={`${CARD_CLS} space-y-3`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#04453F]" />
          <span className={T_CARD_TITLE}>December, 2025</span>
        </div>

        {/* Unified Interactive Segmented Buttons */}
        <div className="bg-[#F4F6EE] p-1 rounded-full flex items-center gap-1">
          {(["week", "month"] as const).map((mode) => {
            const active = calendarRange === mode;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => setCalendarRange(mode)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold capitalize transition-all duration-200 cursor-pointer ${
                  active
                    ? "bg-[#FFC45A] text-[#04453F] shadow-2xs"
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
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-slate-400">
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
              } rounded-[12px] transition-all duration-200 active:scale-95 cursor-pointer ${
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
              <span className="text-[13px] font-bold mt-0.5">{d.date}</span>
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

  // Dietary Preferences Card with Unified Typography & Buttons
  const renderDietaryDropdownsWithOther = () => (
    <div className={`${CARD_CLS} space-y-3`}>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className={T_ITEM_NAME}>Foods to Avoid</span>
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
            className={`w-full px-3 py-2 ${TILE_CLS} border border-[#04453F]/15 text-[12px] text-[#0F2926] outline-none focus:border-[#04453F]`}
          />
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className={T_ITEM_NAME}>Allergens</span>
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
            className={`w-full px-3 py-2 ${TILE_CLS} border border-[#04453F]/15 text-[12px] text-[#0F2926] outline-none focus:border-[#04453F]`}
          />
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className={T_ITEM_NAME}>Flavor Preferences</span>
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
            className={`w-full px-3 py-2 ${TILE_CLS} border border-[#04453F]/15 text-[12px] text-[#0F2926] outline-none focus:border-[#04453F]`}
          />
        )}
      </div>
    </div>
  );

  // Unified Modern Integrated Stepper Capsule [ -  1  + ]
  const renderStepperCapsule = (
    value: number,
    onDecrement: (e: React.MouseEvent) => void,
    onIncrement: (e: React.MouseEvent) => void,
    fullWidth?: boolean
  ) => (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`h-7 rounded-full bg-white border border-[#04453F]/10 shadow-2xs inline-flex items-center justify-between px-1 ${
        fullWidth ? "w-full" : "gap-1.5"
      }`}
    >
      <button type="button" onClick={onDecrement} className={BTN_STEPPER}>
        -
      </button>
      <span className="min-w-[20px] text-center text-[12px] font-extrabold text-[#0F2926]">
        {value}
      </span>
      <button type="button" onClick={onIncrement} className={BTN_STEPPER}>
        +
      </button>
    </div>
  );

  // Render Fridge Item Row (Uniform 14px inner radius, 13px item name, integrated stepper capsule)
  const renderEnhancedFridgeRow = (item: FridgeItem, isFrozen?: boolean) => {
    const vis = getFreshnessVisuals(item);
    return (
      <div
        key={item.id}
        onClick={() => setEditingFridgeItem(item)}
        className={`grid grid-cols-12 items-center rounded-[14px] px-2.5 py-2.5 cursor-pointer transition-colors duration-150 ${
          isFrozen
            ? "bg-sky-50/60 hover:bg-sky-100/60"
            : "bg-[#F4F6EE] hover:bg-[#EAEFDE]"
        }`}
      >
        <div className="col-span-6 flex items-center gap-2.5 min-w-0 pr-1">
          <div className="w-10 h-10 rounded-[10px] bg-white flex items-center justify-center text-xl shrink-0 shadow-2xs">
            <span>{item.emoji}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className={`${T_ITEM_NAME} leading-tight truncate`}>
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

        {/* Integrated Stepper Capsule */}
        <div className="col-span-4 flex items-center justify-center">
          {renderStepperCapsule(
            item.servings,
            (e) => adjustFridgeServings(item.id, -1, e),
            (e) => adjustFridgeServings(item.id, 1, e)
          )}
        </div>

        {/* Non-clickable Status Badge */}
        <div className="col-span-2 flex justify-end">
          <span
            className={`min-w-[34px] h-7 px-1.5 rounded-[10px] text-[12px] font-extrabold flex items-center justify-center ${vis.badgeClass}`}
          >
            {item.daysLeft}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#F4F6EE] select-none font-sans">
      <Toaster position="top-center" />

      {/* =====================================================================
          CLEAN MOBILE WEB APP CONTAINER (NO FAKE PHONE FRAME OR STATUS BAR)
         ===================================================================== */}
      <div className="relative w-full max-w-[480px] min-h-[100dvh] mx-auto bg-[#F4F6EE] flex flex-col font-sans">
        {/* ===================================================================
            SCREEN 1: LOGIN PAGE (Inside Gradient Refrigerator Outer Frame)
           =================================================================== */}
        {appStage === "login" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, ease: IOS_EASE }}
            className="flex-1 px-4 pt-5 pb-8 flex flex-col justify-between bg-[#F4F6EE]"
          >
            <div className="space-y-3.5 flex-1 flex flex-col">
              <div className="flex justify-center">
                <div className={T_HEADER_PILL}>FRESHDATE</div>
              </div>

              <div className={`${FRIDGE_FRAME_CLS} flex-1 flex flex-col justify-between p-4`}>
                {/* Fridge Top Hinge & Side Door Handle Accents */}
                <span className="w-8 h-1.5 rounded-full bg-white/70 border border-[#04453F]/25 absolute -top-1 right-7 pointer-events-none" />
                <span className="w-1.5 h-12 rounded-full bg-white/75 border border-[#04453F]/25 shadow-inner absolute right-1 top-1/3 pointer-events-none" />

                <div className="space-y-4">
                  <div className={`${CARD_CLS} flex items-center gap-3`}>
                    <div className="w-10 h-10 rounded-[12px] bg-[#F4F6EE] flex items-center justify-center text-xl shrink-0">
                      🧊
                    </div>
                    <p className="text-[12px] text-[#0F2926] leading-relaxed font-medium">
                      Track what you have, beat expiration dates, and shop smarter—so every ingredient counts.
                    </p>
                  </div>

                  <div className={`${CARD_CLS} space-y-5`}>
                    <div>
                      <label className={T_ITEM_NAME}>Email</label>
                      <input
                        type="email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        className="w-full mt-1.5 pb-2 border-b border-slate-200 text-[13px] text-[#0F2926] bg-transparent outline-none focus:border-[#04453F]"
                      />
                    </div>

                    <div>
                      <label className={T_ITEM_NAME}>Password</label>
                      <input
                        type="password"
                        defaultValue="••••••••••••"
                        className="w-full mt-1.5 pb-2 border-b border-slate-200 text-[13px] text-[#0F2926] bg-transparent outline-none focus:border-[#04453F]"
                      />
                      <div className="text-center mt-3">
                        <button
                          type="button"
                          onClick={() => notify("Password reset link sent")}
                          className="text-[11px] text-slate-400 underline cursor-pointer"
                        >
                          Forgot your password?
                        </button>
                      </div>
                    </div>

                    <div className="pt-1 flex justify-center">
                      <button
                        onClick={() => setAppStage("intro")}
                        className={`w-44 ${BTN_PRIMARY}`}
                      >
                        Let&apos;s Start
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-center pt-1">
                    <button
                      onClick={() => setAppStage("intro")}
                      className={BTN_PILL_ACTIVE}
                    >
                      I don&apos;t have an account
                    </button>
                  </div>
                </div>

                <div className="text-center text-[11px] font-semibold text-[#04453F]/65 pt-4">
                  FRESHDATE · Smart Fridge Intervention
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ===================================================================
            SCREEN 1.5: MINIMAL WELCOME (Inside Gradient Refrigerator Frame)
           =================================================================== */}
        {appStage === "intro" && (
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, ease: IOS_EASE }}
            className="flex-1 px-4 pt-5 pb-8 flex flex-col bg-[#F4F6EE] space-y-3.5"
          >
            <div className="flex items-center justify-between">
              <button
                onClick={() => setAppStage("login")}
                className={BTN_ICON_CIRCLE}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className={T_HEADER_PILL}>Welcome</div>
              <div className="w-9" />
            </div>

            <div className={`${FRIDGE_FRAME_CLS} flex-1 flex flex-col justify-between p-5`}>
              <span className="w-8 h-1.5 rounded-full bg-white/70 border border-[#04453F]/25 absolute -top-1 right-7 pointer-events-none" />
              <span className="w-1.5 h-12 rounded-full bg-white/75 border border-[#04453F]/25 shadow-inner absolute right-1 top-1/3 pointer-events-none" />

              <div className="flex-1 flex items-center">
                <div className={`${CARD_CLS} w-full py-10 px-6 text-center space-y-4`}>
                  <div className="w-16 h-16 rounded-[16px] bg-gradient-to-b from-[#EFF5E6] to-[#F9F7DF] border border-[#04453F]/10 mx-auto flex items-center justify-center text-3xl shadow-2xs">
                    🧊
                  </div>
                  <h1 className="text-[24px] font-extrabold text-[#04453F] tracking-tight">
                    Welcome
                  </h1>
                  <p className="text-[13px] text-slate-600 leading-relaxed max-w-[260px] mx-auto">
                    FRESHDATE links your fridge inventory with your weekly dining plans so you only buy what you will actually eat.
                  </p>
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <button
                  onClick={() => setAppStage("onboarding")}
                  className={`w-44 ${BTN_PRIMARY}`}
                >
                  Continue
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ===================================================================
            SCREEN 2: BASIC SETTINGS (Inside Gradient Refrigerator Outer Frame)
           =================================================================== */}
        {appStage === "onboarding" && (
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, ease: IOS_EASE }}
            className="flex-1 overflow-y-auto no-scrollbar px-4 pt-5 pb-8 flex flex-col bg-[#F4F6EE] space-y-3.5"
          >
            <div className="flex items-center justify-between">
              <button
                onClick={() => setAppStage("intro")}
                className={BTN_ICON_CIRCLE}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className={T_HEADER_PILL}>Basic Settings</div>
              <div className="w-9" />
            </div>

            <div className={`${FRIDGE_FRAME_CLS} flex-1 flex flex-col justify-between p-3.5`}>
              <span className="w-8 h-1.5 rounded-full bg-white/70 border border-[#04453F]/25 absolute -top-1 right-7 pointer-events-none" />
              <span className="w-1.5 h-12 rounded-full bg-white/75 border border-[#04453F]/25 shadow-inner absolute right-1 top-1/3 pointer-events-none" />

              <div className="space-y-3">
                {renderVernierWeightCard(false)}

                <div className={`${CARD_CLS} flex items-center justify-between`}>
                  <span className={T_CARD_TITLE}>Number of Diners</span>
                  {renderStepperCapsule(
                    dinersCount,
                    () => setDinersCount(Math.max(1, dinersCount - 1)),
                    () => setDinersCount(dinersCount + 1)
                  )}
                </div>

                {renderDietaryDropdownsWithOther()}
              </div>

              <div className="pt-5 pb-1 flex justify-center">
                <button
                  onClick={() => {
                    setOpenDropdownKey(null);
                    setAppStage("main");
                    setActiveTab("fridge");
                    notify("Welcome to FRESHDATE!");
                  }}
                  className={`w-44 ${BTN_PRIMARY}`}
                >
                  Done
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ===================================================================
            MAIN APP STAGE (4 TABS)
           =================================================================== */}
        {appStage === "main" && (
          <>
            <main className="flex-1 overflow-y-auto no-scrollbar pt-2 pb-28">
              {/* -------------------------------------------------------------
                  TAB 1: MY WEEK (Screens #8, #9, #10 inside Fridge Outer Frame)
                 ------------------------------------------------------------- */}
              {activeTab === "week" && (
                <motion.div
                  key={`week-${weekSubScreen}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, ease: IOS_EASE }}
                  className="px-3.5 pt-2 space-y-3"
                >
                  {weekSubScreen === "overview" && (
                    <>
                      <div className="flex items-center justify-between px-0.5">
                        <div className="w-9" />
                        <div className={T_HEADER_PILL}>My Week</div>
                        <button
                          onClick={() => setImportScreen("hub")}
                          className={BTN_ICON_CIRCLE}
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>

                      <div className={FRIDGE_FRAME_CLS}>
                        <span className="w-8 h-1.5 rounded-full bg-white/70 border border-[#04453F]/25 absolute -top-1 right-7 pointer-events-none" />
                        <span className="w-1.5 h-10 rounded-full bg-white/75 border border-[#04453F]/25 shadow-inner absolute right-1 top-28 pointer-events-none" />

                        {renderCalendarCard()}

                        <div
                          className={`${CONTEXT_BAR_CLS} flex items-center justify-between`}
                        >
                          <span className="text-[12px] font-bold text-[#0F2926]">
                            Total absences this {calendarRange}
                          </span>
                          <span className="text-[12px] font-extrabold text-[#04453F] amber-gradient-btn px-3 py-0.5 rounded-full">
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
                                <div key={mealType} className={CARD_CLS}>
                                  <div
                                    onClick={() =>
                                      setExpandedMeal((prev) =>
                                        prev === mealType ? null : mealType
                                      )
                                    }
                                    className="flex items-center justify-between cursor-pointer"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className={T_CARD_TITLE}>
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
                                      className={BTN_PILL_ACTIVE}
                                    >
                                      <span
                                        className={`w-2 h-2 rounded-full ${
                                          isOut ? "bg-amber-700" : "bg-[#658C38]"
                                        }`}
                                      />
                                      <span>
                                        {isOut ? "Out (Absence)" : "Eat at Home"}
                                      </span>
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
                                        <div className="pt-3 mt-3 border-t border-slate-100">
                                          {isOut ? (
                                            <div
                                              className={`py-3 text-center text-[12px] text-amber-800 ${TILE_CLS} font-medium`}
                                            >
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
                                                    className={`${TILE_CLS} hover:bg-[#94C060]/15 active:scale-95 p-2.5 flex flex-col items-center text-center cursor-pointer transition`}
                                                  >
                                                    <span className="text-3xl mb-1">
                                                      {item.emoji}
                                                    </span>
                                                    <span
                                                      className={`${T_ITEM_NAME} line-clamp-1`}
                                                    >
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
                              if (expandedMeal)
                                setRecipeMealFilter(expandedMeal);
                              setWeekSubScreen("recipes");
                            }}
                            className={`${BTN_PRIMARY} w-full px-3`}
                          >
                            Recipe Matches
                          </button>
                          <button
                            onClick={handleImportSchedule}
                            className={`${BTN_PRIMARY} w-full px-3`}
                          >
                            Import Schedule
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {/* SCREEN #9: RECIPES */}
                  {weekSubScreen === "recipes" && (
                    <>
                      <div className="flex items-center justify-between px-0.5">
                        <button
                          onClick={() => setWeekSubScreen("overview")}
                          className={BTN_ICON_CIRCLE}
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className={T_HEADER_PILL}>Recipes</div>
                        <button
                          onClick={() => setImportScreen("hub")}
                          className={BTN_ICON_CIRCLE}
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>

                      <div className={FRIDGE_FRAME_CLS}>
                        <span className="w-8 h-1.5 rounded-full bg-white/70 border border-[#04453F]/25 absolute -top-1 right-7 pointer-events-none" />

                        {renderCalendarCard()}

                        <div className={`${CARD_CLS} space-y-3 relative`}>
                          <div className="flex items-center justify-between">
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() =>
                                  setShowRecipeMealMenu(!showRecipeMealMenu)
                                }
                                className={BTN_PILL_ACTIVE}
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
                                    transition={{
                                      duration: 0.16,
                                      ease: IOS_EASE,
                                    }}
                                    className="absolute left-0 mt-1.5 w-32 bg-white rounded-[16px] shadow-xl border border-[#04453F]/12 py-1 z-30"
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
                                        className={`w-full px-3.5 py-2 text-left text-[12px] font-bold flex items-center justify-between hover:bg-[#F4F6EE] ${
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

                            <span
                              className={`${T_META} text-right max-w-[180px]`}
                            >
                              Matched to expiring fridge items
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
                                className={`${TILE_CLS} hover:ring-2 hover:ring-[#04453F] active:scale-95 p-2.5 flex flex-col items-center text-center cursor-pointer transition`}
                              >
                                <span className="text-3xl mb-1">{r.emoji}</span>
                                <span
                                  className={`${T_ITEM_NAME} line-clamp-2 leading-tight`}
                                >
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
                            className={`w-full ${BTN_PRIMARY}`}
                          >
                            <Sparkles className="w-3.5 h-3.5 text-[#04453F]" />
                            <span>
                              Pick a dish for {recipeMealFilter.toLowerCase()}
                            </span>
                          </button>
                        </div>

                        {/* Used Ingredients Card */}
                        <div className={`${CARD_CLS} space-y-3`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className={T_CARD_TITLE}>
                                Ingredients Used
                              </span>
                              <span className={T_META}>
                                (Drag down to remove)
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
                                className={BTN_PILL_ACTIVE}
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Reset</span>
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-4 gap-2">
                            {visibleIngredientsInRecipes.map((ing) => {
                              const isDragging =
                                draggingIngredientId === ing.id;
                              return (
                                <div
                                  key={ing.id}
                                  draggable
                                  onDragStart={(e) => {
                                    e.dataTransfer.setData(
                                      "text/plain",
                                      ing.id
                                    );
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
                                  className={`${TILE_CLS} p-2 flex flex-col items-center text-center cursor-grab active:cursor-grabbing transition ${
                                    isDragging
                                      ? "opacity-40 scale-95 ring-2 ring-red-400"
                                      : "hover:bg-[#94C060]/15"
                                  }`}
                                >
                                  <span className="text-2xl mb-1">
                                    {ing.emoji}
                                  </span>
                                  <span className="text-[11px] font-semibold text-[#0F2926] leading-tight">
                                    {ing.name}
                                  </span>
                                </div>
                              );
                            })}

                            <button
                              type="button"
                              onClick={() => setShowOtherIngredientModal(true)}
                              className={`${TILE_CLS} hover:bg-[#94C060]/15 active:scale-95 p-2 flex flex-col items-center justify-center text-center transition cursor-pointer`}
                            >
                              <div className={BTN_STEPPER}>
                                <Plus className="w-4 h-4" />
                              </div>
                              <span className="text-[11px] font-bold text-[#04453F] leading-tight mt-1">
                                Other
                              </span>
                            </button>
                          </div>

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
                            className={`mt-2 py-2.5 px-3 rounded-[12px] border-2 border-dashed flex items-center justify-center gap-2 text-[12px] font-bold transition ${
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
                      </div>
                    </>
                  )}

                  {/* SCREEN #10: RECIPE DETAILS */}
                  {weekSubScreen === "details" && (
                    <>
                      <div className="flex items-center justify-between px-0.5">
                        <button
                          onClick={() => setWeekSubScreen("recipes")}
                          className={BTN_ICON_CIRCLE}
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className={T_HEADER_PILL}>Details</div>
                        <div className="w-9" />
                      </div>

                      <div className={FRIDGE_FRAME_CLS}>
                        <span className="w-8 h-1.5 rounded-full bg-white/70 border border-[#04453F]/25 absolute -top-1 right-7 pointer-events-none" />

                        <div className={`${CARD_CLS} flex items-center gap-4`}>
                          <div className="w-20 h-20 rounded-[14px] bg-[#F4F6EE] text-4xl flex items-center justify-center shrink-0">
                            {activeRecipe.emoji}
                          </div>
                          <div className="space-y-1.5">
                            <h2 className="text-[16px] font-bold text-[#0F2926]">
                              {activeRecipe.title}
                            </h2>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#F4F6EE] text-[#04453F]">
                                {activeRecipe.time}
                              </span>
                              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#94C060]/25 text-[#04453F]">
                                {activeRecipe.difficulty}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className={`${CARD_CLS} space-y-3`}>
                          <h3 className={T_CARD_TITLE}>Instructions</h3>
                          <div className="space-y-2.5">
                            {activeRecipe.steps.map((s, idx) => (
                              <div
                                key={idx}
                                className="flex items-start gap-2.5"
                              >
                                <div className="w-5 h-5 rounded-[6px] bg-[#F4F6EE] text-[#04453F] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                  {idx + 1}
                                </div>
                                <div>
                                  <div className={T_ITEM_NAME}>{s.title}</div>
                                  <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                                    {s.description}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="pt-2">
                            <button
                              onClick={() => {
                                notify(`Cooked ${activeRecipe.title}!`);
                                setWeekSubScreen("overview");
                              }}
                              className={`w-full ${BTN_PRIMARY}`}
                            >
                              Complete Cooking
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {/* -------------------------------------------------------------
                  TAB 2: MY FRIDGE (Original Two-Door Refrigerator Outer Frame & Gradients)
                 ------------------------------------------------------------- */}
              {activeTab === "fridge" && (
                <motion.div
                  key="fridge"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, ease: IOS_EASE }}
                  className="px-3.5 pt-2 space-y-3"
                >
                  <div className="flex items-center justify-between px-0.5">
                    <div className="w-9" />
                    <div className={T_HEADER_PILL}>My Fridge</div>
                    <button
                      onClick={() => setImportScreen("hub")}
                      className={BTN_ICON_CIRCLE}
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  {/* DOUBLE-DOOR REFRIGERATOR OUTER CABINET WITH GREEN-TO-BUTTER-YELLOW GRADIENT */}
                  <div className="fridge-outer-frame p-3 relative">
                    {/* Top Fridge Hinge Cap */}
                    <span className="w-8 h-1.5 rounded-full bg-white/75 border border-[#04453F]/25 absolute -top-1 right-7 pointer-events-none" />

                    {/* UPPER DOOR COMPARTMENT: REFRIGERATED */}
                    <div className={`${CARD_CLS} relative`}>
                      {/* Upper Door Recessed Handle Accent */}
                      <span className="w-1.5 h-10 rounded-full bg-[#F4F6EE] border border-[#04453F]/20 shadow-inner absolute -right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />

                      <div
                        onClick={() =>
                          setCollapsedFridgeZones((prev) => ({
                            ...prev,
                            refrigerated: !prev.refrigerated,
                          }))
                        }
                        className="flex items-center justify-between cursor-pointer"
                      >
                        <span className="px-3 py-1 rounded-full bg-[#EFF3E8] border border-[#04453F]/12 text-[11px] font-extrabold text-[#04453F]">
                          ALL ({refrigeratedItems.length})
                        </span>

                        <div className="flex items-center gap-1.5">
                          <span className={BTN_PILL_ACTIVE}>
                            <Thermometer className="w-3.5 h-3.5 text-[#04453F]" />
                            <span>Refrigerated</span>
                          </span>
                          <ChevronDown
                            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                              !collapsedFridgeZones.refrigerated
                                ? "rotate-180"
                                : ""
                            }`}
                          />
                        </div>
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
                            <div className="pt-2.5 space-y-2">
                              <div className="grid grid-cols-12 text-[11px] font-semibold text-slate-400 px-2">
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

                    {/* REFRIGERATOR DOOR SEAM / GASKET DIVIDER */}
                    <div className="relative py-2 flex items-center justify-center">
                      <span className="w-2.5 h-2 rounded-r-full bg-[#04453F]/20 absolute -left-3" />
                      <div className="w-full h-[2px] bg-[#04453F]/15 rounded-full shadow-[0_1px_0_rgba(255,255,255,0.7)]" />
                      <span className="w-5 h-1.5 rounded-full bg-white/75 border border-[#04453F]/25 absolute right-4" />
                      <span className="w-2.5 h-2 rounded-l-full bg-[#04453F]/20 absolute -right-3" />
                    </div>

                    {/* LOWER DOOR COMPARTMENT: FROZEN */}
                    <div className={`${CARD_CLS} relative`}>
                      {/* Lower Freezer Door Recessed Handle Accent */}
                      <span className="w-1.5 h-10 rounded-full bg-[#F4F6EE] border border-[#04453F]/20 shadow-inner absolute -right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />

                      <div
                        onClick={() =>
                          setCollapsedFridgeZones((prev) => ({
                            ...prev,
                            frozen: !prev.frozen,
                          }))
                        }
                        className="flex items-center justify-between cursor-pointer"
                      >
                        <span className="px-3 py-1 rounded-full bg-[#EFF3E8] border border-[#04453F]/12 text-[11px] font-extrabold text-[#04453F]">
                          ALL ({frozenItems.length})
                        </span>

                        <div className="flex items-center gap-1.5">
                          <span className={BTN_PILL_ACTIVE}>
                            <Snowflake className="w-3.5 h-3.5 text-[#04453F]" />
                            <span>Frozen</span>
                          </span>
                          <ChevronDown
                            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                              !collapsedFridgeZones.frozen ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                      </div>

                      <AnimatePresence initial={false}>
                        {!collapsedFridgeZones.frozen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.24, ease: IOS_EASE }}
                            className="overflow-hidden"
                          >
                            <div className="pt-2.5 space-y-2">
                              <div className="grid grid-cols-12 text-[11px] font-semibold text-slate-400 px-2">
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
                  </div>
                </motion.div>
              )}

              {/* -------------------------------------------------------------
                  TAB 3: SUGGESTED LIST (Inside Gradient Refrigerator Frame)
                 ------------------------------------------------------------- */}
              {activeTab === "list" && (
                <motion.div
                  key="list"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, ease: IOS_EASE }}
                  className="px-3.5 pt-2 space-y-3"
                >
                  <div className="flex items-center justify-between px-0.5">
                    <div className="w-9" />
                    <div className={T_HEADER_PILL}>Suggested List</div>
                    <button
                      onClick={() => setImportScreen("hub")}
                      className={BTN_ICON_CIRCLE}
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  <div className={FRIDGE_FRAME_CLS}>
                    <span className="w-8 h-1.5 rounded-full bg-white/75 border border-[#04453F]/25 absolute -top-1 right-7 pointer-events-none" />
                    <span className="w-1.5 h-10 rounded-full bg-white/75 border border-[#04453F]/25 shadow-inner absolute right-1 top-28 pointer-events-none" />

                    {/* Level 0 Context Summary Bar inside Fridge Frame */}
                    <div
                      className={`${CONTEXT_BAR_CLS} flex items-center justify-between text-[12px]`}
                    >
                      <span className="font-semibold text-[#0F2926]">
                        Auto-adjusted quota
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[#04453F] bg-[#EFF3E8] px-2.5 py-0.5 rounded-full text-[11px]">
                          {fridgeItems.reduce((s, i) => s + i.servings, 0)} in
                          fridge
                        </span>
                        <span className="font-bold text-[#04453F] bg-[#EFF3E8] px-2.5 py-0.5 rounded-full text-[11px]">
                          {weeklyAbsencesCount} meals out
                        </span>
                      </div>
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
                      const isCollapsed =
                        manualCategoryCollapse[catKey] !== undefined
                          ? manualCategoryCollapse[catKey]
                          : quotaInfo.netToBuy === 0 || items.length === 0;

                      return (
                        <div key={catKey} className={CARD_CLS}>
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
                              <span className={T_CARD_TITLE}>{catKey}</span>
                              <span className={T_META}>
                                · {quotaInfo.inFridgeText}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {quotaInfo.quotaText ? (
                                <span className="text-[11px] font-extrabold text-[#04453F] bg-[#F4F6EE] px-2.5 py-0.5 rounded-full">
                                  Buy {quotaInfo.quotaText}
                                </span>
                              ) : (
                                <span className="text-[11px] font-bold text-[#658C38] bg-[#94C060]/18 px-2.5 py-0.5 rounded-full">
                                  Stocked ✓
                                </span>
                              )}
                              <ChevronDown
                                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                                  !isCollapsed ? "rotate-180" : ""
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
                                <div className="pt-3 mt-3 border-t border-slate-100 -mx-4 px-4 flex overflow-x-auto gap-2.5 pb-1 no-scrollbar snap-x snap-mandatory">
                                  {items.map((item) => (
                                    <div
                                      key={item.id}
                                      onClick={() =>
                                        toggleSuggestedCheck(
                                          item.id,
                                          item.checked
                                        )
                                      }
                                      className={`w-[112px] shrink-0 snap-start rounded-[16px] p-2.5 flex flex-col justify-between border-[1.5px] transition-all duration-150 cursor-pointer ${
                                        item.checked
                                          ? "bg-gradient-to-b from-[#FFFDF4] to-[#FFF6DC] border-[#FFC45A] shadow-2xs"
                                          : "bg-[#F5F7F0] border-transparent opacity-80 hover:opacity-100"
                                      }`}
                                    >
                                      {/* Tier 1: Fridge Status Tag + Circular Selection Check */}
                                      <div className="w-full flex items-center justify-between">
                                        <span className="text-[10px] font-semibold text-slate-400">
                                          {item.inFridgeServings > 0
                                            ? `Have ${item.inFridgeServings}`
                                            : "Suggested"}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleSuggestedCheck(
                                              item.id,
                                              item.checked
                                            );
                                          }}
                                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-extrabold transition cursor-pointer ${
                                            item.checked
                                              ? "amber-gradient-btn text-[#04453F]"
                                              : "bg-white border-[1.5px] border-slate-300 text-transparent"
                                          }`}
                                        >
                                          ✓
                                        </button>
                                      </div>

                                      {/* Tier 2: Crisp White Icon Stage with Soft Radial Halo + Item Name */}
                                      <div className="my-2 flex flex-col items-center text-center">
                                        <div className="w-11 h-11 rounded-[12px] bg-white shadow-2xs flex items-center justify-center text-2xl mb-1.5 bg-[radial-gradient(circle,rgba(148,192,96,0.2)_0%,transparent_72%)]">
                                          {item.emoji}
                                        </div>
                                        <span
                                          className={`${T_ITEM_NAME} line-clamp-1 w-full`}
                                        >
                                          {item.name}
                                        </span>
                                      </div>

                                      {/* Tier 3: Integrated Stepper Capsule [ -  1  + ] */}
                                      {renderStepperCapsule(
                                        item.servings,
                                        (e) => {
                                          e.stopPropagation();
                                          adjustSuggestedServings(item.id, -1);
                                        },
                                        (e) => {
                                          e.stopPropagation();
                                          adjustSuggestedServings(item.id, 1);
                                        },
                                        true
                                      )}
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
                      className={`w-full ${BTN_PRIMARY} py-3`}
                    >
                      Import Selected Items to My Fridge
                    </button>
                  </div>
                </motion.div>
              )}

              {/* -------------------------------------------------------------
                  TAB 4: ME -> PROFILE -> EDIT PROFILE (Inside Fridge Frame)
                 ------------------------------------------------------------- */}
              {activeTab === "me" && (
                <motion.div
                  key={`me-${meSubScreen}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, ease: IOS_EASE }}
                  className="px-3.5 pt-2 space-y-3"
                >
                  {meSubScreen === "menu" && (
                    <>
                      <div className="flex justify-center">
                        <div className={T_HEADER_PILL}>Me</div>
                      </div>

                      <div className={FRIDGE_FRAME_CLS}>
                        <span className="w-8 h-1.5 rounded-full bg-white/75 border border-[#04453F]/25 absolute -top-1 right-7 pointer-events-none" />
                        <span className="w-1.5 h-10 rounded-full bg-white/75 border border-[#04453F]/25 shadow-inner absolute right-1 top-28 pointer-events-none" />

                        {/* Original Design Dark Forest-Green Gradient Profile Header Card */}
                        <div
                          onClick={() => setMeSubScreen("profile_view")}
                          className="bg-gradient-to-br from-[#065A52] via-[#04453F] to-[#022C28] text-white rounded-[20px] p-4 border-[1.5px] border-[#04453F]/40 shadow-md flex items-center justify-between cursor-pointer"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-[14px] amber-gradient-btn flex items-center justify-center text-2xl">
                              🙂
                            </div>
                            <div>
                              <h2 className="text-[15px] font-bold text-white">
                                Freshie
                              </h2>
                              <p className="text-[11px] font-medium text-[#F0E98F]/85 mt-0.5">
                                {weightKg} KG · {dinersCount} Diner(s) ·{" "}
                                {effectiveFlavorPref}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#F0E98F]" />
                        </div>

                        <div
                          className={`${CARD_CLS} divide-y divide-slate-100 p-0 overflow-hidden`}
                        >
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
                              action: () => setAppStage("intro"),
                            },
                            {
                              label: "Settings",
                              action: () => setMeSubScreen("profile_edit"),
                            },
                          ].map((row, idx) => (
                            <button
                              key={idx}
                              onClick={row.action}
                              className={`w-full px-4 py-3.5 hover:bg-[#F4F6EE] flex items-center justify-between ${T_ITEM_NAME} transition cursor-pointer`}
                            >
                              <span>{row.label}</span>
                              <ChevronRight className="w-4 h-4 text-slate-400" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {meSubScreen === "profile_view" && (
                    <>
                      <div className="flex items-center justify-between px-0.5">
                        <button
                          onClick={() => setMeSubScreen("menu")}
                          className={BTN_ICON_CIRCLE}
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className={T_HEADER_PILL}>Profile</div>
                        <div className="w-9" />
                      </div>

                      <div className={FRIDGE_FRAME_CLS}>
                        <span className="w-8 h-1.5 rounded-full bg-white/75 border border-[#04453F]/25 absolute -top-1 right-7 pointer-events-none" />

                        {renderVernierWeightCard(true)}

                        <div
                          className={`${CARD_CLS} flex items-center justify-between`}
                        >
                          <span className={T_CARD_TITLE}>Number of Diners</span>
                          <span className="text-[14px] font-extrabold text-[#04453F]">
                            {dinersCount}
                          </span>
                        </div>

                        <div className={`${CARD_CLS} space-y-3`}>
                          <div className="flex justify-between items-center">
                            <span className={T_ITEM_NAME}>Foods to Avoid</span>
                            <span className={T_META}>
                              {effectiveAvoidFoods}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className={T_ITEM_NAME}>Allergens</span>
                            <span className={T_META}>{effectiveAllergens}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className={T_ITEM_NAME}>
                              Flavor Preferences
                            </span>
                            <span className={T_META}>
                              {effectiveFlavorPref}
                            </span>
                          </div>
                        </div>

                        <div className="pt-4 pb-1 flex justify-center">
                          <button
                            onClick={() => setMeSubScreen("profile_edit")}
                            className={`w-44 ${BTN_PRIMARY}`}
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {meSubScreen === "profile_edit" && (
                    <>
                      <div className="flex items-center justify-between px-0.5">
                        <button
                          onClick={() => {
                            setOpenDropdownKey(null);
                            setMeSubScreen("profile_view");
                          }}
                          className={BTN_ICON_CIRCLE}
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className={T_HEADER_PILL}>Profile</div>
                        <div className="w-9" />
                      </div>

                      <div className={FRIDGE_FRAME_CLS}>
                        <span className="w-8 h-1.5 rounded-full bg-white/75 border border-[#04453F]/25 absolute -top-1 right-7 pointer-events-none" />

                        {renderVernierWeightCard(false)}

                        <div
                          className={`${CARD_CLS} flex items-center justify-between`}
                        >
                          <span className={T_CARD_TITLE}>Number of Diners</span>
                          {renderStepperCapsule(
                            dinersCount,
                            () => setDinersCount(Math.max(1, dinersCount - 1)),
                            () => setDinersCount(dinersCount + 1)
                          )}
                        </div>

                        {renderDietaryDropdownsWithOther()}

                        <div className={`${CARD_CLS} space-y-3`}>
                          <div className={T_CARD_TITLE}>
                            Notification Settings
                          </div>
                          <div className="flex items-center justify-between">
                            <span className={T_ITEM_NAME}>
                              Enable Expiration Reminder
                            </span>
                            <button
                              onClick={() =>
                                setReminderEnabled(!reminderEnabled)
                              }
                              className={`w-11 h-6 rounded-full p-0.5 transition cursor-pointer ${
                                reminderEnabled
                                  ? "bg-[#FFC45A]"
                                  : "bg-slate-300"
                              }`}
                            >
                              <div
                                className={`w-5 h-5 rounded-full bg-white transition transform ${
                                  reminderEnabled
                                    ? "translate-x-5"
                                    : "translate-x-0"
                                }`}
                              />
                            </button>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className={T_ITEM_NAME}>
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
                                  className={`flex-1 px-3 py-1.5 ${TILE_CLS} border border-[#04453F]/15 text-[12px] text-[#0F2926] outline-none`}
                                />
                                <span className={T_META}>days before</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="pt-2 pb-1 flex justify-center">
                          <button
                            onClick={() => {
                              setOpenDropdownKey(null);
                              setMeSubScreen("profile_view");
                              notify("Profile saved");
                            }}
                            className={`w-44 ${BTN_PRIMARY}`}
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </main>

            {/* ===============================================================
                MODAL: "+ OTHER" INGREDIENT PICKER IN RECIPES
               =============================================================== */}
            <AnimatePresence>
              {showOtherIngredientModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: IOS_EASE }}
                  className="fixed inset-0 max-w-[480px] mx-auto z-50 bg-black/35 backdrop-blur-xs flex items-end"
                >
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ duration: 0.28, ease: IOS_EASE }}
                    className="w-full bg-white rounded-t-[28px] p-5 space-y-4 shadow-2xl"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className={T_CARD_TITLE}>
                          Choose Another Ingredient
                        </h3>
                        <p className={T_META}>
                          Replace unwanted ingredients or add your own
                        </p>
                      </div>
                      <button
                        onClick={() => setShowOtherIngredientModal(false)}
                        className={BTN_ICON_CIRCLE}
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
                          className={`${TILE_CLS} hover:bg-[#94C060]/20 active:scale-95 p-2.5 flex flex-col items-center text-center transition cursor-pointer`}
                        >
                          <span className="text-2xl mb-1">{alt.emoji}</span>
                          <span className="text-[11px] font-bold text-[#0F2926]">
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
                        className={`flex-1 px-3.5 py-2.5 ${TILE_CLS} text-[12px] font-medium outline-none border border-[#04453F]/10 focus:border-[#04453F]`}
                      />
                      <button type="submit" className={BTN_PRIMARY}>
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
                  className="fixed inset-0 max-w-[480px] mx-auto z-40 bg-black/35 backdrop-blur-xs flex items-end"
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
                    className="w-full bg-white rounded-t-[28px] p-5 space-y-4 shadow-2xl"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 ${TILE_CLS} flex items-center justify-center text-3xl`}
                        >
                          {editingFridgeItem.emoji}
                        </div>
                        <div>
                          <h3 className={T_CARD_TITLE}>
                            {editingFridgeItem.name}
                          </h3>
                          <span className={T_META}>
                            Added {editingFridgeItem.dateAdded} · Expires{" "}
                            {editingFridgeItem.expirationDate}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setEditingFridgeItem(null)}
                        className={BTN_ICON_CIRCLE}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <p
                      className={`text-[12px] text-slate-600 ${TILE_CLS} p-3 leading-relaxed`}
                    >
                      <strong className="text-[#04453F]">Storage Guide:</strong>{" "}
                      {editingFridgeItem.storageTip}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className={T_ITEM_NAME}>Storage Location</span>
                      <button
                        onClick={() =>
                          toggleFridgeItemZone(editingFridgeItem.id)
                        }
                        className={BTN_PILL_ACTIVE}
                      >
                        Switch to{" "}
                        {editingFridgeItem.zone === "refrigerated"
                          ? `Frozen (${editingFridgeItem.frozenShelfLifeDays}d)`
                          : `Refrigerated (${editingFridgeItem.shelfLifeDays}d)`}
                      </button>
                    </div>

                    <button
                      onClick={() => setEditingFridgeItem(null)}
                      className={`w-full ${BTN_PRIMARY}`}
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
                  className="fixed inset-0 max-w-[480px] mx-auto z-40 bg-[#F4F6EE] flex flex-col"
                >
                  {importScreen === "hub" && (
                    <div className="flex-1 overflow-y-auto px-3.5 pt-4 pb-8 space-y-3 no-scrollbar">
                      <div className="flex items-center justify-between px-0.5">
                        <button
                          onClick={() => setImportScreen("closed")}
                          className={BTN_ICON_CIRCLE}
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className={T_HEADER_PILL}>Import</div>
                        <div className="w-9" />
                      </div>

                      <div className={FRIDGE_FRAME_CLS}>
                        <span className="w-8 h-1.5 rounded-full bg-white/75 border border-[#04453F]/25 absolute -top-1 right-7 pointer-events-none" />
                        <span className="w-1.5 h-10 rounded-full bg-white/75 border border-[#04453F]/25 shadow-inner absolute right-1 top-28 pointer-events-none" />

                        <button
                          onClick={() => {
                            setCameraMode("scan");
                            setImportScreen("scan");
                          }}
                          className={`w-full ${CARD_CLS} flex items-center justify-between text-left hover:bg-[#94C060]/10 transition cursor-pointer`}
                        >
                          <div>
                            <div className={T_CARD_TITLE}>
                              Take Photo / Scan / Gallery
                            </div>
                            <p className={`${T_META} mt-0.5`}>
                              Take a photo of the product or barcode—auto identified
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                        </button>

                        <button
                          onClick={() => setImportScreen("manual")}
                          className={`w-full ${CARD_CLS} flex items-center justify-between text-left hover:bg-[#94C060]/10 transition cursor-pointer`}
                        >
                          <span className={T_CARD_TITLE}>Manual Entry</span>
                          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                        </button>

                        <div className={`${CARD_CLS} space-y-3`}>
                          <div className={T_CARD_TITLE}>Recent Entries</div>
                          <div className="grid grid-cols-3 gap-2.5">
                            {RECENT_ENTRIES.map((item) => (
                              <button
                                key={item.id}
                                onClick={() => openFoodInfoSheet(item)}
                                className={`${TILE_CLS} hover:bg-[#94C060]/20 active:scale-95 p-3 flex flex-col items-center text-center transition cursor-pointer`}
                              >
                                <span className="text-3xl mb-1">
                                  {item.emoji}
                                </span>
                                <span className={`${T_ITEM_NAME} line-clamp-1`}>
                                  {item.name}
                                </span>
                              </button>
                            ))}
                          </div>
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
                          className={BTN_ICON_CIRCLE}
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className={BTN_PILL_ACTIVE}
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
                                className="w-full h-full object-cover rounded-[16px]"
                              />
                            ) : (
                              <span className="text-6xl">🌽</span>
                            )}
                          </div>
                        )}

                        <div className="mt-5 px-4 py-1.5 rounded-full bg-white/15 text-white text-[12px] font-medium">
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
                          className="mt-4 w-14 h-14 rounded-full bg-[#FFC45A] border-4 border-white/80 shadow-lg active:scale-95 transition cursor-pointer"
                        />

                        <div className="bg-white/10 p-1 rounded-full flex items-center gap-1 mt-4">
                          {(["scan", "photo"] as const).map((m) => (
                            <button
                              key={m}
                              onClick={() => setCameraMode(m)}
                              className={
                                cameraMode === m
                                  ? `${BTN_PILL_ACTIVE} capitalize`
                                  : "text-white/70 text-[12px] font-bold px-3.5 py-1.5 capitalize cursor-pointer"
                              }
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="bg-[#04453F] p-4 rounded-t-[20px] space-y-2">
                        <div className="flex items-center justify-between text-[12px] text-white/80 px-1">
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
                              className="aspect-square rounded-[12px] bg-white/10 hover:bg-white/20 flex items-center justify-center text-2xl cursor-pointer"
                            >
                              {it.emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {importScreen === "manual" && (
                    <div className="flex-1 overflow-y-auto px-3.5 pt-4 pb-8 flex flex-col no-scrollbar space-y-3">
                      <div className="flex items-center justify-between px-0.5">
                        <button
                          onClick={() => setImportScreen("hub")}
                          className={BTN_ICON_CIRCLE}
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className={T_HEADER_PILL}>Import</div>
                        <div className="w-9" />
                      </div>

                      <div className={`${FRIDGE_FRAME_CLS} flex-1 flex flex-col justify-between`}>
                        <span className="w-8 h-1.5 rounded-full bg-white/75 border border-[#04453F]/25 absolute -top-1 right-7 pointer-events-none" />

                        <div className="space-y-3">
                          <div className="relative">
                            <input
                              type="text"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder="Search for food"
                              className="w-full pl-4 pr-10 py-2.5 bg-white/95 rounded-full text-[13px] font-medium outline-none border-[1.5px] border-[#04453F]/16 pro-card-shadow"
                            />
                            <Search className="w-4 h-4 text-[#658C38] absolute right-3.5 top-1/2 -translate-y-1/2" />
                          </div>

                          <div className={`${CARD_CLS} space-y-3`}>
                            <div className="bg-[#F4F6EE] p-1 rounded-full grid grid-cols-4 gap-1">
                              {(
                                [
                                  "All",
                                  "Staples",
                                  "Produce",
                                  "Protein",
                                ] as const
                              ).map((cat) => (
                                <button
                                  key={cat}
                                  onClick={() => setManualCategory(cat)}
                                  className={
                                    manualCategory === cat
                                      ? `${BTN_PILL_ACTIVE} w-full`
                                      : "py-1.5 text-[12px] font-bold text-slate-500 hover:text-[#04453F] cursor-pointer"
                                  }
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
                                  className={`${TILE_CLS} hover:ring-2 hover:ring-[#04453F] active:scale-95 p-3 flex flex-col items-center text-center transition cursor-pointer`}
                                >
                                  <span className="text-3xl mb-1">
                                    {item.emoji}
                                  </span>
                                  <span className={T_ITEM_NAME}>
                                    {item.name}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="bg-white/95 p-1.5 rounded-full pro-card-shadow border-[1.5px] border-[#04453F]/14 grid grid-cols-2 gap-1.5 mt-4">
                          <button
                            onClick={() => setDefaultZoneFilter("refrigerated")}
                            className={
                              defaultZoneFilter === "refrigerated"
                                ? `${BTN_PRIMARY} w-full`
                                : "py-2.5 rounded-full text-[13px] font-bold text-slate-500 hover:text-[#04453F] cursor-pointer"
                            }
                          >
                            Refrigerated
                          </button>
                          <button
                            onClick={() => setDefaultZoneFilter("frozen")}
                            className={
                              defaultZoneFilter === "frozen"
                                ? `${BTN_PRIMARY} w-full`
                                : "py-2.5 rounded-full text-[13px] font-bold text-slate-500 hover:text-[#04453F] cursor-pointer"
                            }
                          >
                            Frozen
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SCREEN #7: FOOD INFORMATION BOTTOM SHEET */}
                  <AnimatePresence>
                    {selectedCatalogItem && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, ease: IOS_EASE }}
                        className="fixed inset-0 max-w-[480px] mx-auto z-50 bg-black/35 backdrop-blur-xs flex items-end"
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
                          className="w-full bg-[#F4F6EE] rounded-t-[28px] p-5 space-y-3 shadow-2xl border-t-2 border-[#94C060]"
                        >
                          <div className="flex items-center justify-between px-1">
                            <h3 className="text-[16px] font-extrabold text-[#0F2926] flex items-center gap-2">
                              <span>{selectedCatalogItem.emoji}</span>
                              <span>{selectedCatalogItem.name}</span>
                            </h3>
                            <button
                              onClick={() => setSelectedCatalogItem(null)}
                              className={BTN_ICON_CIRCLE}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div
                            className={`${CARD_CLS} py-2.5 flex items-center justify-between`}
                          >
                            <span className={T_ITEM_NAME}>Servings</span>
                            {renderStepperCapsule(
                              draftServings,
                              () =>
                                setDraftServings(Math.max(1, draftServings - 1)),
                              () => setDraftServings(draftServings + 1)
                            )}
                          </div>

                          <div
                            className={`${CARD_CLS} py-2.5 flex items-center justify-between`}
                          >
                            <span className={T_ITEM_NAME}>
                              Storage Location
                            </span>
                            <div className="bg-[#F4F6EE] p-1 rounded-full flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setDraftZone("refrigerated");
                                  setDraftShelfLife(
                                    selectedCatalogItem.defaultShelfLifeRefrigerated
                                  );
                                }}
                                className={
                                  draftZone === "refrigerated"
                                    ? BTN_PILL_ACTIVE
                                    : "px-3 py-1 text-[12px] font-bold text-slate-500 hover:text-[#04453F] cursor-pointer"
                                }
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
                                className={
                                  draftZone === "frozen"
                                    ? BTN_PILL_ACTIVE
                                    : "px-3 py-1 text-[12px] font-bold text-slate-500 hover:text-[#04453F] cursor-pointer"
                                }
                              >
                                Frozen
                              </button>
                            </div>
                          </div>

                          <div className={`${CARD_CLS} space-y-2`}>
                            <div className="flex items-center justify-between">
                              <span className={T_ITEM_NAME}>Shelf Life</span>
                              <span className={T_META}>
                                {draftShelfLife} days
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className={T_ITEM_NAME}>Date Added</span>
                              <span className={T_META}>
                                {selectedCatalogItem.dateAdded}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className={T_ITEM_NAME}>
                                Expiration Date
                              </span>
                              <span className={T_META}>
                                {selectedCatalogItem.expirationDate}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={confirmAddCatalogItem}
                            className={`w-full ${BTN_PRIMARY} py-3`}
                          >
                            Confirm &amp; Add to My Fridge
                          </button>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ===============================================================
                MODERN FLOATING CAPSULE BOTTOM NAVIGATION BAR (NO FAKE HOME BAR)
               =============================================================== */}
            <div className="fixed bottom-0 inset-x-0 z-30 max-w-[480px] mx-auto px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-2 pointer-events-none">
              <nav className="pointer-events-auto bg-white/95 backdrop-blur-xl border border-[#04453F]/10 rounded-full p-1.5 shadow-[0_12px_32px_rgba(4,69,63,0.12)] grid grid-cols-4 gap-1">
                {[
                  { id: "week", label: "Week", icon: Calendar },
                  {
                    id: "fridge",
                    label: "Fridge",
                    icon: Refrigerator,
                    badge: urgentCount,
                  },
                  { id: "list", label: "List", icon: ClipboardList },
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
                      className="relative py-2 rounded-full flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform cursor-pointer"
                    >
                      {isActive && (
                        <motion.div
                          layoutId="modern-nav-active-pill"
                          transition={{ duration: 0.25, ease: IOS_EASE }}
                          className="absolute inset-0 bg-[#FFC45A] rounded-full shadow-2xs"
                        />
                      )}
                      <div className="relative z-10 flex items-center justify-center">
                        <Icon
                          strokeWidth={isActive ? 2.4 : 1.9}
                          className={`w-[19px] h-[19px] transition-colors duration-200 ${
                            isActive
                              ? "text-[#04453F]"
                              : "text-slate-400 hover:text-[#04453F]"
                          }`}
                        />
                        {tab.badge ? (
                          <span className=" -top-1.5 -right-2.5 absolute min-w-[15px] h-[15px] px-1 rounded-full bg-red-500 text-white text-[9px] font-extrabold flex items-center justify-center ring-2 ring-white">
                            {tab.badge}
                          </span>
                        ) : null}
                      </div>
                      <span
                        className={`relative z-10 text-[10px] tracking-tight transition-colors duration-200 ${
                          isActive
                            ? "font-extrabold text-[#04453F]"
                            : "font-semibold text-slate-400"
                        }`}
                      >
                        {tab.label}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
