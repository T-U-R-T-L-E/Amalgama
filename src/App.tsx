import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import { 
  CURATED_RECIPES, 
  INGREDIENT_PROFILES, 
  CHEMICAL_HAZARDS, 
  CABIN_INGREDIENTS,
  CATEGORY_DESCRIPTIONS
} from './data/recipes';
import { Recipe, SavedRecipe, CategoryType, Ingredient, ChemicalImpact } from './types';

// Firebase Integrations
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, doc, setDoc, deleteDoc, getDocs, onSnapshot } from 'firebase/firestore';
import { 
  auth, 
  db, 
  signInWithPopup, 
  signOut, 
  googleProvider, 
  handleFirestoreError, 
  OperationType 
} from './firebase';

import { 
  Search, 
  Filter, 
  Atom, 
  Sparkles, 
  Calculator, 
  ShieldCheck, 
  Clock, 
  Trash2, 
  Plus, 
  Check, 
  Heart, 
  Info, 
  AlertTriangle, 
  RefreshCw, 
  TrendingUp, 
  Compass, 
  BookOpen, 
  ChevronRight, 
  DollarSign, 
  Globe,
  Leaf,
  Folder,
  FolderPlus,
  ArrowRightLeft,
  Scale,
  Hourglass
} from 'lucide-react';

export default function App() {
  // Navigation & tabs
  const [currentTab, setCurrentTab] = useState<string>('recipes');
  
  // Library filtering & search
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(CURATED_RECIPES[0].id);

  // Active / selected recipe detail
  const activeRecipe = CURATED_RECIPES.find(r => r.id === selectedRecipeId) || 
                       CURATED_RECIPES[0];

  // Saved Recipes Library (Persisted in localStorage)
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [personalNotesInput, setPersonalNotesInput] = useState<string>('');

  // AI Formulator states
  const [targetProduct, setTargetProduct] = useState<string>('');
  const [selectedCabinIngredients, setSelectedCabinIngredients] = useState<string[]>([]);
  const [extraNotes, setExtraNotes] = useState<string>('');
  const [formulating, setFormulating] = useState<boolean>(false);
  const [formulatedRecipe, setFormulatedRecipe] = useState<Recipe | null>(null);
  const [formulationError, setFormulationError] = useState<string | null>(null);

  // Ingredient-based Matchmaker Finder states
  const [labMode, setLabMode] = useState<'recreate' | 'matchmaker' | 'substitution' | 'dupe'>('recreate');
  const [matchmaking, setMatchmaking] = useState<boolean>(false);
  const [matchmakerResult, setMatchmakerResult] = useState<any | null>(null);
  const [matchmakerError, setMatchmakerError] = useState<string | null>(null);
  const [customIngredients, setCustomIngredients] = useState<string[]>([]);
  const [customIngInput, setCustomIngInput] = useState<string>('');

  // Substitution Engine states
  const [targetRecipeForSub, setTargetRecipeForSub] = useState<string>('');
  const [missingIngredientForSub, setMissingIngredientForSub] = useState<string>('');
  const [userProfileForSub, setUserProfileForSub] = useState<string>('Oily & Acne-Prone Skin');
  const [submittingSub, setSubmittingSub] = useState<boolean>(false);
  const [substituteResult, setSubstituteResult] = useState<any | null>(null);
  const [substituteError, setSubstituteError] = useState<string | null>(null);

  // Reverse-Engineering Dupe states
  const [commercialProductForDupe, setCommercialProductForDupe] = useState<string>('');
  const [submittingDupe, setSubmittingDupe] = useState<boolean>(false);
  const [dupeResult, setDupeResult] = useState<any | null>(null);
  const [dupeError, setDupeError] = useState<string | null>(null);

  // Catalog Organizer state variables
  const [catalogCategory, setCatalogCategory] = useState<string>('Cosmetics');
  const [submittingCatalog, setSubmittingCatalog] = useState<boolean>(false);
  const [catalogResult, setCatalogResult] = useState<any | null>(null);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  // Safety & Allergen Audit state variables
  const [userSkinType, setUserSkinType] = useState<string>(() => {
    return localStorage.getItem('amalgama_user_skin_type') || 'Sensitive & Acne-Prone';
  });
  const [userAllergens, setUserAllergens] = useState<string>(() => {
    return localStorage.getItem('amalgama_user_allergens') || 'Lavender, Lemon, Peanuts';
  });
  const [auditedRecipeId, setAuditedRecipeId] = useState<string | null>(null);
  const [auditingSafety, setAuditingSafety] = useState<boolean>(false);
  const [auditResult, setAuditResult] = useState<any | null>(null);
  const [auditError, setAuditError] = useState<string | null>(null);

  // Patch Test Generator state variables
  const [patchTestedRecipeId, setPatchTestedRecipeId] = useState<string | null>(null);
  const [generatingPatchTest, setGeneratingPatchTest] = useState<boolean>(false);
  const [patchTestResult, setPatchTestResult] = useState<any | null>(null);
  const [patchTestError, setPatchTestError] = useState<string | null>(null);

  // Ingredient Scaling Engine state variables
  const [targetScaleVolume, setTargetScaleVolume] = useState<string>('250ml Jar');
  const [scalingRecipeId, setScalingRecipeId] = useState<string | null>(null);
  const [scalingInProgress, setScalingInProgress] = useState<boolean>(false);
  const [scalingResult, setScalingResult] = useState<any | null>(null);
  const [scalingError, setScalingError] = useState<string | null>(null);

  // Shelf-Life Estimation Engine state variables
  const [shelfLifeRecipeId, setShelfLifeRecipeId] = useState<string | null>(null);
  const [estimatingShelfLife, setEstimatingShelfLife] = useState<boolean>(false);
  const [shelfLifeResult, setShelfLifeResult] = useState<any | null>(null);
  const [shelfLifeError, setShelfLifeError] = useState<string | null>(null);

  // Custom User Formulation List (recipes that the user generated themselves)
  const [customRecipes, setCustomRecipes] = useState<Recipe[]>([]);

  // Custom themed collections of recipes
  const [collectionsList, setCollectionsList] = useState<string[]>(() => {
    const defaultCols = ['Spring Cleaning Recipes', 'Summer Skincare'];
    try {
      const savedCols = localStorage.getItem('amalgama_custom_collections');
      if (savedCols) {
        const parsed = JSON.parse(savedCols);
        if (Array.isArray(parsed)) {
          return Array.from(new Set([...defaultCols, ...parsed]));
        }
      }
    } catch (e) {
      console.error("Failed to parse custom collections:", e);
    }
    return defaultCols;
  });
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);

  // Natural Ingredients Bio-Profiles Interactive states
  const [ingSearchQuery, setIngSearchQuery] = useState<string>('');
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [expandedIngId, setExpandedIngId] = useState<string | null>(null);

  // Savings Audit Inputs
  const [madeQuantities, setMadeQuantities] = useState<Record<string, number>>({
    'rec-1': 3, // All purpose cleaner (batches/year)
    'rec-2': 4, // Peppermint deodorant
    'rec-3': 6, // Lip balm
    'rec-4': 12, // Laundry powder
    'rec-5': 5, // Toothpaste
  });

  // Firebase Auth & Sync State
  const [user, setUser] = useState<User | null>(null);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error' | null>(null);

  // Sign in handler
  const handleSignIn = async () => {
    try {
      setSyncStatus('syncing');
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Sign in failed:", err);
      setSyncStatus('error');
    }
  };

  // Sign out handler
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // Clear current state back to local storage defaults
      setSavedRecipes([]);
      setCustomRecipes([]);
      setMadeQuantities({
        'rec-1': 3,
        'rec-2': 4,
        'rec-3': 6,
        'rec-4': 12,
        'rec-5': 5,
      });
      setUser(null);
      setSyncStatus(null);
      setCollectionsList(['Spring Cleaning Recipes', 'Summer Skincare']);
      setSelectedCollection(null);
      const storedCols = localStorage.getItem('amalgama_custom_collections');
      if (storedCols) {
        try {
          setCollectionsList(JSON.parse(storedCols));
        } catch (e) {
          console.error(e);
        }
      }
      // reload from local storage
      const storedSaved = localStorage.getItem('amalgama_saved_recipes');
      if (storedSaved) setSavedRecipes(JSON.parse(storedSaved));
      const storedCustom = localStorage.getItem('amalgama_custom_recipes');
      if (storedCustom) setCustomRecipes(JSON.parse(storedCustom));
      const storedQuantities = localStorage.getItem('amalgama_audit_quantities');
      if (storedQuantities) setMadeQuantities(JSON.parse(storedQuantities));
    } catch (err) {
      console.error("Sign out failed:", err);
    }
  };

  // Load state from localStorage on boot
  useEffect(() => {
    try {
      const storedSaved = localStorage.getItem('amalgama_saved_recipes');
      if (storedSaved) {
        setSavedRecipes(JSON.parse(storedSaved));
      }
      
      const storedCustom = localStorage.getItem('amalgama_custom_recipes');
      if (storedCustom) {
        setCustomRecipes(JSON.parse(storedCustom));
      }

      const storedQuantities = localStorage.getItem('amalgama_audit_quantities');
      if (storedQuantities) {
        setMadeQuantities(JSON.parse(storedQuantities));
      }
    } catch (e) {
      console.error("Failed to load local storage state:", e);
    }
  }, []);

  // Real-time Firebase Sync listener
  useEffect(() => {
    let unsubscribeSaved: () => void = () => {};
    let unsubscribeCustom: () => void = () => {};
    let unsubscribeAudit: () => void = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        setSyncStatus('syncing');
        try {
          const uid = currentUser.uid;

          // 1. Subscribe to Saved Recipes
          const savedColRef = collection(db, `users/${uid}/savedRecipes`);
          unsubscribeSaved = onSnapshot(savedColRef, (snapshot) => {
            const remoteSaved: SavedRecipe[] = [];
            snapshot.forEach((docSnapshot) => {
              remoteSaved.push(docSnapshot.data() as SavedRecipe);
            });
            setSavedRecipes(remoteSaved);
            localStorage.setItem('amalgama_saved_recipes', JSON.stringify(remoteSaved));
            setSyncStatus('synced');
          }, (error) => {
            console.error("Firestore Saved Recipes read blocked:", error);
            setSyncStatus('error');
          });

          // 2. Subscribe to Custom Recipes
          const customColRef = collection(db, `users/${uid}/customRecipes`);
          unsubscribeCustom = onSnapshot(customColRef, (snapshot) => {
            const remoteCustom: Recipe[] = [];
            snapshot.forEach((docSnapshot) => {
              remoteCustom.push(docSnapshot.data() as Recipe);
            });
            setCustomRecipes(remoteCustom);
            localStorage.setItem('amalgama_custom_recipes', JSON.stringify(remoteCustom));
          }, (error) => {
            console.error("Firestore Custom Recipes read blocked:", error);
          });

          // 3. Subscribe to Audit Quantities
          const auditColRef = collection(db, `users/${uid}/auditQuantities`);
          unsubscribeAudit = onSnapshot(auditColRef, (snapshot) => {
            const remoteQuantities: Record<string, number> = {};
            snapshot.forEach((docSnapshot) => {
              const data = docSnapshot.data();
              if (data) {
                remoteQuantities[docSnapshot.id] = data.quantity;
              }
            });
            setMadeQuantities(remoteQuantities);
            localStorage.setItem('amalgama_audit_quantities', JSON.stringify(remoteQuantities));
          }, (error) => {
            console.error("Firestore Audit Quantities read blocked:", error);
          });

          // -- ONE-TIME INITIAL SYNC MERGE --
          // Read current local storage values and seed them onto Firebase to prevent losing pre-login edits
          const localSavedStr = localStorage.getItem('amalgama_saved_recipes');
          const localSaved: SavedRecipe[] = localSavedStr ? JSON.parse(localSavedStr) : [];
          
          const localCustomStr = localStorage.getItem('amalgama_custom_recipes');
          const localCustom: Recipe[] = localCustomStr ? JSON.parse(localCustomStr) : [];

          const localQuantitiesStr = localStorage.getItem('amalgama_audit_quantities');
          const localQuantities: Record<string, number> = localQuantitiesStr ? JSON.parse(localQuantitiesStr) : {};

          if (localSaved.length > 0) {
            for (const item of localSaved) {
              await setDoc(doc(db, `users/${uid}/savedRecipes`, item.id), item).catch(err => {
                handleFirestoreError(err, OperationType.WRITE, `users/${uid}/savedRecipes/${item.id}`);
              });
            }
          }
          if (localCustom.length > 0) {
            for (const item of localCustom) {
              await setDoc(doc(db, `users/${uid}/customRecipes`, item.id), item).catch(err => {
                handleFirestoreError(err, OperationType.WRITE, `users/${uid}/customRecipes/${item.id}`);
              });
            }
          }
          if (Object.keys(localQuantities).length > 0) {
            for (const [recId, qty] of Object.entries(localQuantities)) {
              await setDoc(doc(db, `users/${uid}/auditQuantities`, recId), { recipeId: recId, quantity: qty }).catch(err => {
                handleFirestoreError(err, OperationType.WRITE, `users/${uid}/auditQuantities/${recId}`);
              });
            }
          }

        } catch (e) {
          console.error("Error setting up real-time firestore listeners:", e);
          setSyncStatus('error');
        }
      } else {
        unsubscribeSaved();
        unsubscribeCustom();
        unsubscribeAudit();
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeSaved();
      unsubscribeCustom();
      unsubscribeAudit();
    };
  }, []);

  // Save to localStorage and sync with Firebase if logged in
  const saveRecipesToLocal = async (newSaved: SavedRecipe[]) => {
    setSavedRecipes(newSaved);
    localStorage.setItem('amalgama_saved_recipes', JSON.stringify(newSaved));
    
    if (user) {
      setSyncStatus('syncing');
      try {
        const uid = user.uid;
        // Detect and delete deleted items from database
        const localIds = newSaved.map(r => r.id);
        const savedColRef = collection(db, `users/${uid}/savedRecipes`);
        const snapshot = await getDocs(savedColRef).catch(e => {
          handleFirestoreError(e, OperationType.LIST, `users/${uid}/savedRecipes`);
        });
        
        if (snapshot) {
          for (const document of snapshot.docs) {
            if (!localIds.includes(document.id)) {
              await deleteDoc(doc(db, `users/${uid}/savedRecipes`, document.id)).catch(e => {
                handleFirestoreError(e, OperationType.DELETE, `users/${uid}/savedRecipes/${document.id}`);
              });
            }
          }
        }

        // Add/set items
        for (const item of newSaved) {
          const itemPath = `users/${uid}/savedRecipes/${item.id}`;
          await setDoc(doc(db, itemPath), item).catch(err => {
            handleFirestoreError(err, OperationType.WRITE, itemPath);
          });
        }
        setSyncStatus('synced');
      } catch (err) {
        console.error("Error updating saved recipes database:", err);
        setSyncStatus('error');
      }
    }
  };

  const saveCustomRecipesToLocal = async (newCustom: Recipe[]) => {
    setCustomRecipes(newCustom);
    localStorage.setItem('amalgama_custom_recipes', JSON.stringify(newCustom));

    if (user) {
      setSyncStatus('syncing');
      try {
        const uid = user.uid;
        // Detect and delete deleted items from database
        const localIds = newCustom.map(r => r.id);
        const customColRef = collection(db, `users/${uid}/customRecipes`);
        const snapshot = await getDocs(customColRef).catch(e => {
          handleFirestoreError(e, OperationType.LIST, `users/${uid}/customRecipes`);
        });
        
        if (snapshot) {
          for (const document of snapshot.docs) {
            if (!localIds.includes(document.id)) {
              await deleteDoc(doc(db, `users/${uid}/customRecipes`, document.id)).catch(e => {
                handleFirestoreError(e, OperationType.DELETE, `users/${uid}/customRecipes/${document.id}`);
              });
            }
          }
        }

        // Add/set items
        for (const item of newCustom) {
          const itemPath = `users/${uid}/customRecipes/${item.id}`;
          await setDoc(doc(db, itemPath), item).catch(err => {
            handleFirestoreError(err, OperationType.WRITE, itemPath);
          });
        }
        setSyncStatus('synced');
      } catch (err) {
        console.error("Error updating custom recipes database:", err);
        setSyncStatus('error');
      }
    }
  };

  const saveAuditQuantitiesToLocal = async (newQuantities: Record<string, number>) => {
    setMadeQuantities(newQuantities);
    localStorage.setItem('amalgama_audit_quantities', JSON.stringify(newQuantities));

    if (user) {
      setSyncStatus('syncing');
      try {
        const uid = user.uid;
        // Detect and delete deleted items from database
        const auditColRef = collection(db, `users/${uid}/auditQuantities`);
        const snapshot = await getDocs(auditColRef).catch(e => {
          handleFirestoreError(e, OperationType.LIST, `users/${uid}/auditQuantities`);
        });

        if (snapshot) {
          for (const document of snapshot.docs) {
            if (newQuantities[document.id] === undefined) {
              await deleteDoc(doc(db, `users/${uid}/auditQuantities`, document.id)).catch(e => {
                handleFirestoreError(e, OperationType.DELETE, `users/${uid}/auditQuantities/${document.id}`);
              });
            }
          }
        }

        // Add/set updated ones
        for (const [recId, qty] of Object.entries(newQuantities)) {
          const itemPath = `users/${uid}/auditQuantities/${recId}`;
          await setDoc(doc(db, itemPath), { recipeId: recId, quantity: qty }).catch(err => {
            handleFirestoreError(err, OperationType.WRITE, itemPath);
          });
        }
        setSyncStatus('synced');
      } catch (err) {
        console.error("Error updating audit quantities database:", err);
        setSyncStatus('error');
      }
    }
  };


  // Combine curated and custom recipes for lookups/browsing
  const allRecipesList = [...CURATED_RECIPES, ...customRecipes];

  // Check if a recipe is bookmarked
  const isBookmarked = (id: string) => savedRecipes.some(r => r.id === id);

  // Toggle bookmark / save formulation
  const handleToggleBookmark = (recipe: Recipe) => {
    if (isBookmarked(recipe.id)) {
      const filtered = savedRecipes.filter(r => r.id !== recipe.id);
      saveRecipesToLocal(filtered);
    } else {
      const newSavedItem: SavedRecipe = {
        ...recipe,
        savedAt: new Date().toLocaleDateString(),
        personalNotes: ''
      };
      saveRecipesToLocal([...savedRecipes, newSavedItem]);
    }
  };

  // Create a new collection
  const handleCreateCollection = (collectionName: string, assignToRecipeId?: string) => {
    const trimmed = collectionName.trim();
    if (!trimmed) return;
    
    let updatedList = [...collectionsList];
    if (!collectionsList.includes(trimmed)) {
      updatedList = [...collectionsList, trimmed];
      setCollectionsList(updatedList);
      localStorage.setItem('amalgama_custom_collections', JSON.stringify(updatedList));
    }
    
    if (assignToRecipeId) {
      handleToggleRecipeCollection(assignToRecipeId, trimmed);
    }
  };

  // Delete a custom collection
  const handleDeleteCollection = (collectionName: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (confirm(`Are you sure you want to delete the collection "${collectionName}"? This will only remove the collection folder, your bookmarked recipes will remain safe in your Favorites list.`)) {
      const updatedList = collectionsList.filter(c => c !== collectionName);
      setCollectionsList(updatedList);
      localStorage.setItem('amalgama_custom_collections', JSON.stringify(updatedList));
      
      // Remove this collection tag from all saved recipes
      const updatedSaved = savedRecipes.map(r => {
        if (r.collections?.includes(collectionName)) {
          return {
            ...r,
            collections: r.collections.filter(c => c !== collectionName)
          };
        }
        return r;
      });
      saveRecipesToLocal(updatedSaved);
      
      if (selectedCollection === collectionName) {
        setSelectedCollection(null);
      }
    }
  };

  // Toggle membership of a recipe inside a collection
  const handleToggleRecipeCollection = (recipeId: string, collectionName: string) => {
    const isSaved = isBookmarked(recipeId);
    let updatedSaved: SavedRecipe[] = [];
    
    if (!isSaved) {
      // Find the recipe in curated or custom list to save it first
      const recipeToSave = allRecipesList.find(r => r.id === recipeId);
      if (recipeToSave) {
        const newSavedItem: SavedRecipe = {
          ...recipeToSave,
          savedAt: new Date().toLocaleDateString(),
          personalNotes: '',
          collections: [collectionName]
        };
        updatedSaved = [...savedRecipes, newSavedItem];
      }
    } else {
      updatedSaved = savedRecipes.map(r => {
        if (r.id === recipeId) {
          const currentCols = r.collections || [];
          const updatedCols = currentCols.includes(collectionName)
            ? currentCols.filter(c => c !== collectionName)
            : [...currentCols, collectionName];
          return {
            ...r,
            collections: updatedCols
          };
        }
        return r;
      });
    }
    
    if (updatedSaved.length > 0) {
      saveRecipesToLocal(updatedSaved);
    }
  };

  // Update personal notes on bookmarked items
  const handleSaveNotes = (id: string) => {
    const updated = savedRecipes.map(r => {
      if (r.id === id) {
        return { ...r, personalNotes: personalNotesInput };
      }
      return r;
    });
    saveRecipesToLocal(updated);
    alert("Personal formulation notes saved!");
  };

  // Handle ingredient toggle in the AI formulation panel
  const handleToggleCabinIngredient = (ingredientName: string) => {
    if (selectedCabinIngredients.includes(ingredientName)) {
      setSelectedCabinIngredients(selectedCabinIngredients.filter(i => i !== ingredientName));
    } else {
      setSelectedCabinIngredients([...selectedCabinIngredients, ingredientName]);
    }
  };

  // Fetch formulation from server (Gemini API Proxy)
  const handleTriggerFormulator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetProduct.trim()) {
      setFormulationError("Please enter what product you want to formulate.");
      return;
    }

    setFormulating(true);
    setFormulationError(null);
    setFormulatedRecipe(null);

    try {
      const response = await fetch('/api/formulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetProduct: targetProduct,
          ingredientsAvailable: selectedCabinIngredients,
          extraNotes: extraNotes
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || "Formulation failed.");
      }

      const parsedRecipe = await response.json();
      setFormulatedRecipe(parsedRecipe);
    } catch (err: any) {
      console.error(err);
      setFormulationError(err.message || "An unexpected error occurred during synthesis.");
    } finally {
      setFormulating(false);
    }
  };

  // Handle ingredient-matching search via Gemini API Proxy
  const handleTriggerMatchmaker = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    const allIngredients = [...selectedCabinIngredients, ...customIngredients];
    if (allIngredients.length === 0) {
      setMatchmakerError("Please select at least one cabin pantry ingredient or type a custom item below.");
      return;
    }

    setMatchmaking(true);
    setMatchmakerError(null);
    setMatchmakerResult(null);

    try {
      const response = await fetch('/api/analyze-ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients: allIngredients
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || "Ingredient alignment failed.");
      }

      const parsedJSON = await response.json();
      setMatchmakerResult(parsedJSON);
    } catch (err: any) {
      console.error(err);
      setMatchmakerError(err.message || "An unexpected error occurred during ingredient analysis.");
    } finally {
      setMatchmaking(false);
    }
  };

  // Add custom ingredients to list
  const handleAddCustomIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customIngInput.trim();
    if (!trimmed) return;
    if (customIngredients.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      alert("This item is already added!");
      return;
    }
    setCustomIngredients([...customIngredients, trimmed]);
    setCustomIngInput('');
  };

  // Remove custom added ingredient
  const handleRemoveCustomIngredient = (item: string) => {
    setCustomIngredients(customIngredients.filter(c => c !== item));
  };

  // Handle ingredient substitutions via Gemini API Proxy
  const handleTriggerSubstitution = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!targetRecipeForSub.trim()) {
      setSubstituteError("Please specify a target recipe/formula context (e.g. Lavender Lip Balm or Moisturizing Conditioner).");
      return;
    }
    if (!missingIngredientForSub.trim()) {
      setSubstituteError("Please specify the missing ingredient you wish to replace (e.g. Coconut oil).");
      return;
    }
    if (!userProfileForSub.trim()) {
      setSubstituteError("Please specify the user's skin/hair profile (e.g. dry & acne-prone/sensitive skin/fine hair).");
      return;
    }

    setSubmittingSub(true);
    setSubstituteError(null);
    setSubstituteResult(null);

    try {
      const response = await fetch('/api/substitute-ingredient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRecipe: targetRecipeForSub,
          missingIngredient: missingIngredientForSub,
          profile: userProfileForSub
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || "Substitution match failed.");
      }

      const parsedJSON = await response.json();
      setSubstituteResult(parsedJSON);
    } catch (err: any) {
      console.error(err);
      setSubstituteError(err.message || "An unexpected error occurred during substitution matching.");
    } finally {
      setSubmittingSub(false);
    }
  };

  // Handle product reverse-engineering via Gemini API Proxy
  const handleTriggerDupe = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!commercialProductForDupe.trim()) {
      setDupeError("Please specify a popular store-bought product name or type (e.g., Neutrogena Hydro Boost or Dawn Dish Soap).");
      return;
    }

    setSubmittingDupe(true);
    setDupeError(null);
    setDupeResult(null);

    try {
      const response = await fetch('/api/reverse-engineer-dupe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commercialProduct: commercialProductForDupe
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || "Reverse-engineering failed.");
      }

      const parsedJSON = await response.json();
      setDupeResult(parsedJSON);
    } catch (err: any) {
      console.error(err);
      setDupeError(err.message || "An unexpected error occurred during reverse-engineering.");
    } finally {
      setSubmittingDupe(false);
    }
  };

  // Handle recipe catalog organizer generation via Gemini API Proxy
  const handleTriggerCatalog = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!catalogCategory.trim()) {
      setCatalogError("Please select a high-demand category.");
      return;
    }

    setSubmittingCatalog(true);
    setCatalogError(null);
    setCatalogResult(null);

    try {
      const response = await fetch('/api/generate-catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: catalogCategory
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || "Catalog generation failed.");
      }

      const parsedJSON = await response.json();
      setCatalogResult(parsedJSON);
    } catch (err: any) {
      console.error(err);
      setCatalogError(err.message || "An unexpected error occurred while generating the catalog list.");
    } finally {
      setSubmittingCatalog(false);
    }
  };

  // Perform biological and dermal safety evaluation
  const handleTriggerSafetyAudit = async (recipe: Recipe) => {
    if (!recipe) return;
    
    // Save preferences to local storage of the browser
    localStorage.setItem('amalgama_user_skin_type', userSkinType);
    localStorage.setItem('amalgama_user_allergens', userAllergens);

    setAuditingSafety(true);
    setAuditError(null);
    setAuditResult(null);
    setAuditedRecipeId(recipe.id);

    try {
      const parsedAllergens = userAllergens
        .split(',')
        .map(x => x.trim())
        .filter(Boolean);

      const ingredientsList = recipe.ingredients?.map(ing => ing.name) || [];

      const response = await fetch('/api/analyze-recipe-safety', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeName: recipe.title,
          ingredients: ingredientsList,
          skinType: userSkinType,
          allergens: parsedAllergens
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || "Safety audit execution interrupted.");
      }

      const parsedJSON = await response.json();
      setAuditResult(parsedJSON);
    } catch (err: any) {
      console.error(err);
      setAuditError(err.message || "An unexpected error occurred during safety evaluation.");
    } finally {
      setAuditingSafety(false);
    }
  };

  // Perform a 24-Hour Patch Test generation
  const handleTriggerPatchTest = async (recipe: Recipe) => {
    if (!recipe) return;

    setGeneratingPatchTest(true);
    setPatchTestError(null);
    setPatchTestResult(null);
    setPatchTestedRecipeId(recipe.id);

    try {
      const ingredientsList = recipe.ingredients?.map(ing => ing.name) || [];

      const response = await fetch('/api/generate-patch-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeName: recipe.title,
          ingredients: ingredientsList,
          category: recipe.category
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || "Patch test generation failed.");
      }

      const parsedJSON = await response.json();
      setPatchTestResult(parsedJSON);
    } catch (err: any) {
      console.error(err);
      setPatchTestError(err.message || "An unexpected error occurred during patch test formulation.");
    } finally {
      setGeneratingPatchTest(false);
    }
  };

  // Perform dynamic recipe ingredient ratio and volume scaling
  const handleTriggerRecipeScale = async (recipe: Recipe) => {
    if (!recipe) return;
    if (!targetScaleVolume.trim()) {
      setScalingError("Please select or enter a target volume.");
      return;
    }

    setScalingInProgress(true);
    setScalingError(null);
    setScalingResult(null);
    setScalingRecipeId(recipe.id);

    try {
      const response = await fetch('/api/scale-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeName: recipe.title,
          ingredients: recipe.ingredients,
          targetVolume: targetScaleVolume,
          category: recipe.category
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || "Formulation scaling failed.");
      }

      const parsedJSON = await response.json();
      setScalingResult(parsedJSON);
    } catch (err: any) {
      console.error(err);
      setScalingError(err.message || "An unexpected error occurred while scaling ingredients.");
    } finally {
      setScalingInProgress(false);
    }
  };

  // Perform shelf life and preservation audit on the recipe
  const handleTriggerShelfLifeEstimation = async (recipe: Recipe) => {
    if (!recipe) return;

    setEstimatingShelfLife(true);
    setShelfLifeError(null);
    setShelfLifeResult(null);
    setShelfLifeRecipeId(recipe.id);

    try {
      const ingredientsList = recipe.ingredients?.map(ing => ing.name) || [];

      const response = await fetch('/api/estimate-shelf-life', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeName: recipe.title,
          ingredients: ingredientsList,
          category: recipe.category
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || "Shelf-life analysis failed.");
      }

      const parsedJSON = await response.json();
      setShelfLifeResult(parsedJSON);
    } catch (err: any) {
      console.error(err);
      setShelfLifeError(err.message || "An unexpected error occurred while estimating shelf life.");
    } finally {
      setEstimatingShelfLife(false);
    }
  };

  // Save AI-formulated recipe to library
  const handleSaveFormulatedRecipe = () => {
    if (!formulatedRecipe) return;
    
    // Check if copy already exists
    if (customRecipes.some(r => r.title === formulatedRecipe.title)) {
      alert("A formulation with this name already exists in your local library!");
      return;
    }

    const updatedCustom = [...customRecipes, formulatedRecipe];
    saveCustomRecipesToLocal(updatedCustom);
    
    // Automatically bookmark it as well
    const newSavedItem: SavedRecipe = {
      ...formulatedRecipe,
      savedAt: new Date().toLocaleDateString(),
      personalNotes: 'Formulated with Amalgama AI.'
    };
    saveRecipesToLocal([...savedRecipes, newSavedItem]);
    
    // Switch to recipes explorer tab and select it
    setSelectedRecipeId(formulatedRecipe.id);
    setCurrentTab('recipes');
    alert(`"${formulatedRecipe.title}" added to your Master Collection!`);
  };

  // Remove custom generated recipe
  const handleRemoveCustomRecipe = (id: string) => {
    if (confirm("Are you sure you want to remove this custom formulation from your collection?")) {
      const filteredCustom = customRecipes.filter(r => r.id !== id);
      saveCustomRecipesToLocal(filteredCustom);
      
      const filteredSaved = savedRecipes.filter(r => r.id !== id);
      saveRecipesToLocal(filteredSaved);

      if (selectedRecipeId === id) {
        setSelectedRecipeId(CURATED_RECIPES[0].id);
      }
    }
  };

  // Filtered recipes list
  const filteredRecipes = allRecipesList.filter(recipe => {
    const matchesCategory = selectedCategory ? recipe.category === selectedCategory : true;
    const matchesCollection = selectedCollection 
      ? (selectedCollection === 'all_favorites' 
          ? isBookmarked(recipe.id) 
          : savedRecipes.some(r => r.id === recipe.id && r.collections?.includes(selectedCollection))) 
      : true;
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          recipe.chemicalsAvoided.some(chem => chem.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          recipe.ingredients.some(ing => ing.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesCollection && matchesSearch;
  });

  // Calculate Cumulative Eco-metrics
  const totalSyntheticAvoidedCount = savedRecipes.reduce((sum, r) => sum + r.chemicalsAvoided.length, 0);

  // Financial audit metrics calculator
  const calculateFinancialMetrics = () => {
    let totalSpentDIY = 0;
    let totalSpentRetail = 0;
    let totalSaves = 0;

    allRecipesList.forEach(recipe => {
      const quantityYearObj = madeQuantities[recipe.id] || 0;
      if (quantityYearObj > 0) {
        // Extract float value from string e.g. "$0.45 per bottle" -> 0.45
        const diyCostMatch = recipe.costEstimate.match(/\$(\d+\.?\d*)/);
        const diyCost = diyCostMatch ? parseFloat(diyCostMatch[1]) : 0.50;

        // Retail cost format e.g. "$6.50 commercial brand" -> 6.50
        const retailCostMatch = recipe.retailCostCost.match(/\$(\d+\.?\d*)/);
        const retailCost = retailCostMatch ? parseFloat(retailCostMatch[1]) : 7.00;

        totalSpentDIY += diyCost * quantityYearObj;
        totalSpentRetail += retailCost * quantityYearObj;
      }
    });

    totalSaves = totalSpentRetail - totalSpentDIY;
    return {
      spentDIY: totalSpentDIY.toFixed(2),
      spentRetail: totalSpentRetail.toFixed(2),
      savings: totalSaves.toFixed(2),
      batchesCount: (Object.values(madeQuantities) as number[]).reduce((a, b) => a + b, 0)
    };
  };

  const auditStats = calculateFinancialMetrics();

  // Handle quantitative inputs
  const handleQuantityChange = (recipeId: string, val: number) => {
    const updated = { ...madeQuantities, [recipeId]: Math.max(0, val) };
    saveAuditQuantitiesToLocal(updated);
  };

  // Pre-populate input for personal notes when active recipe expands
  useEffect(() => {
    if (activeRecipe) {
      const savedVersion = savedRecipes.find(r => r.id === activeRecipe.id);
      setPersonalNotesInput(savedVersion?.personalNotes || '');
    }
  }, [selectedRecipeId, savedRecipes]);

  // Quick helper to convert category standard ids to clean labels
  const getCategoryLabel = (cat: CategoryType) => {
    return CATEGORY_DESCRIPTIONS[cat]?.title || cat;
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C3314] font-sans flex flex-col antialiased selection:bg-[#4B5320] selection:text-white">
      
      {/* Top Header Integration */}
      <Header 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        savedFormulationsCount={savedRecipes.length}
        user={user}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        syncStatus={syncStatus}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        
        {/* Banner with Amalgama philosophy to establish the "Bento Grid" organic vibe */}
        <div id="welcome_hero_card" className="bg-[#4B5320] text-[#F5F1E6] rounded-3xl p-6 sm:p-8 border border-[#E6E2D3] shadow-xs relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-y-4 translate-x-4">
            <Atom className="w-80 h-80 text-white" />
          </div>
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 w-full">
            <div className="max-w-2xl space-y-4 text-left">
              <div className="inline-flex items-center gap-2 bg-[#F5F1E6]/15 hover:bg-[#F5F1E6]/25 text-white px-3 h-7 rounded-full text-[11px] font-semibold uppercase tracking-wider transition-colors duration-200">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                Live Organic Synthesis Enabled
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif italic font-medium leading-tight text-[#F5F1E6]">
                Formulate non-toxic daily household alternatives.
              </h2>
              <p className="text-sm sm:text-base text-[#F5F1E6]/85 max-w-xl leading-relaxed">
                Industrial cosmetics and clean solutions are filled with bio-accumulative synthetic chemicals. 
                Amalgama opens up a world of safe, clean chemistry using edible pantry elements like white vinegar, Castile, and pure vegetable oils.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <button 
                  onClick={() => setCurrentTab('lab')}
                  id="hero_custom_formulate_btn"
                  className="bg-[#F5F1E6] text-[#2C3314] hover:bg-white text-xs font-bold uppercase tracking-widest px-5 py-3 rounded-xl transition-all duration-200 shadow-xs flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Synthesize Custom DIY Formula
                </button>
                <button 
                  onClick={() => {
                    setSelectedCategory(null);
                    setCurrentTab('recipes');
                  }}
                  className="bg-transparent hover:bg-white/10 text-white border border-[#F5F1E6]/35 text-xs font-bold uppercase tracking-widest px-5 py-3 rounded-xl transition-colors duration-200"
                >
                  Browse Our Curated Recipes ({CURATED_RECIPES.length})
                </button>
              </div>
            </div>

            {/* Prominent Logo Canvas */}
            <div className="shrink-0 bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 flex flex-col items-center justify-center space-y-3 text-center w-full lg:w-64 relative overflow-hidden group">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/10 to-amber-500/10 rounded-3xl blur-md opacity-30 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative flex justify-center items-center h-28 w-28 bg-white/10 rounded-2xl border border-white/10 p-2">
                <img 
                  src="https://intelligent-cyan-fnfyqx3r.edgeone.app/logo%204.png" 
                  alt="Amalgama Naturalist Lab Logo" 
                  className="h-24 w-auto object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)] transform hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                  id="hero_prominent_logo"
                />
              </div>
              <div className="relative space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#F5F1E6]">
                  Amalgama
                </h4>
                <p className="text-[9px] text-[#F5F1E6]/70 uppercase tracking-widest font-mono">
                  Pure Clean Laboratory
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ======================= TAB: MAIN BROWSE EXPLORER ======================= */}
        {currentTab === 'recipes' && (
          <div className="space-y-8" id="recipes_tab_content">
            
            {/* -------------------- MAIN BENTO WIDGETS DECK -------------------- */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Daily Selection Hero (Featured Recipe of the Day) */}
              <div className="md:col-span-12 lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#E6E2D3] shadow-xs flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 bg-[#F5F1E6] text-[#4B5320] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      <Compass className="w-3.5 h-3.5" />
                      Daily Selection
                    </div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400">
                      • 10-15 Min Prep Time
                    </span>
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-serif italic text-gray-900 leading-tight mb-4">
                    All-Purpose Herbal Citrus Cleanser
                  </h3>
                  <p className="text-sm text-gray-600 max-w-lg leading-relaxed">
                    A gorgeous, natural solvent powered by organic citrus peel oils and vinegar. It dissolves kitchen countertop grease, targets soap scum, and sanitizes glazed tiles naturally. Let's make chemistry delightful!
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <button 
                    onClick={() => {
                      setSelectedRecipeId('rec-1');
                      const element = document.getElementById('recipe_details_pane');
                      if (element) element.scrollIntoView({ behavior: 'smooth' });
                    }}
                    id="daily_view_btn"
                    className="bg-[#4B5320] text-white hover:bg-[#3D441A] px-6 py-3.5 rounded-xl font-bold uppercase text-xs tracking-widest transition-all duration-200 shadow-xs"
                  >
                    View Formula Steps
                  </button>
                  <button 
                    onClick={() => handleToggleBookmark(CURATED_RECIPES[0])}
                    className={`border border-[#E6E2D3] px-6 py-3.5 rounded-xl font-bold uppercase text-xs tracking-widest transition-all duration-200 flex items-center gap-1.5 ${
                      isBookmarked('rec-1') 
                        ? 'bg-rose-50 text-rose-700 border-rose-200' 
                        : 'hover:bg-[#F5F1E6]'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isBookmarked('rec-1') ? 'fill-rose-500 text-rose-500' : 'text-gray-400'}`} />
                    {isBookmarked('rec-1') ? 'Saved to Bookmarks' : 'Bookmark Daily'}
                  </button>
                </div>
              </div>

              {/* Instant Category Bento Board */}
              <div className="md:col-span-6 lg:col-span-5 bg-[#4B5320] rounded-3xl p-6 text-white flex flex-col justify-between">
                <div>
                  <h4 className="text-xs uppercase tracking-[0.2em] text-[#F5F1E6]/60 font-bold mb-4">
                    Filter Curated Recipes
                  </h4>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {(Object.keys(CATEGORY_DESCRIPTIONS) as CategoryType[]).map((catKey) => {
                      const item = CATEGORY_DESCRIPTIONS[catKey];
                      const count = allRecipesList.filter(r => r.category === catKey).length;
                      const isSelected = selectedCategory === catKey;
                      return (
                        <div 
                          key={catKey}
                          onClick={() => {
                            setSelectedCategory(isSelected ? null : catKey);
                          }}
                          className={`p-3 rounded-2xl cursor-pointer transition-all duration-200 border flex flex-col justify-between h-[75px] ${
                            isSelected 
                              ? 'bg-white text-[#2C3314] border-white scale-[1.02] shadow-sm' 
                              : 'bg-white/10 hover:bg-white/15 border-transparent text-[#F5F1E6]'
                          }`}
                        >
                          <div className="flex items-center space-x-1.5">
                            <span className="text-base">{item.icon}</span>
                            <p className="text-xs font-bold tracking-tight leading-tight line-clamp-1">{item.title}</p>
                          </div>
                          <p className={`text-[10px] self-end font-mono ${isSelected ? 'text-[#4B5320] font-semibold' : 'text-[#F5F1E6]/70'}`}>
                            {count} {count === 1 ? 'recipe' : 'recipes'}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center">
                  <span className="text-[11px] uppercase tracking-wider text-[#F5F1E6]/70">
                    Active category filter:
                  </span>
                  <button 
                    onClick={() => setSelectedCategory(null)}
                    disabled={!selectedCategory}
                    className="text-[11px] font-bold underline disabled:opacity-40 hover:text-white"
                  >
                    Clear Filter
                  </button>
                </div>
              </div>

              {/* Eco Impact Live Counter Card */}
              <div className="md:col-span-6 lg:col-span-3 bg-[#F5F1E6] rounded-3xl p-6 border border-[#E6E2D3] flex flex-col justify-between text-center min-h-[220px]">
                <h4 className="text-[10px] uppercase font-bold tracking-widest text-[#4B5320]/60">
                  Chemical Blockhouse
                </h4>
                <div>
                  <p className="text-5xl font-serif font-bold italic text-[#2C3314] animate-bounce">
                    {totalSyntheticAvoidedCount || 14}
                  </p>
                  <p className="text-xs uppercase font-bold text-[#4B5320] mt-1">
                    Synthetics Spared
                  </p>
                </div>
                <div className="text-xs text-gray-500 italic px-2">
                  {savedRecipes.length > 0 
                    ? `Based on ${savedRecipes.length} bookmarked natural formulation recipes.` 
                    : "Bookmark formulas below to track your chemical offsets!"}
                </div>
              </div>

              {/* Pantry Core Basics Widget */}
              <div className="md:col-span-6 lg:col-span-4 bg-white rounded-3xl p-6 border border-[#E6E2D3] flex flex-col justify-between min-h-[220px]">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                    The Cabin Pantry
                  </h4>
                  <span className="text-[10px] bg-emerald-50 text-emerald-800 font-mono px-2 py-0.5 rounded border border-emerald-100 uppercase">
                    Non-Toxic Base
                  </span>
                </div>
                <div className="space-y-2.5 overflow-y-auto max-h-[140px] pr-1">
                  {[
                    { name: 'Baking Soda', stat: 'Alkaline' },
                    { name: 'White Vinegar', stat: 'Mild Acid' },
                    { name: 'Liquid Castile', stat: 'Clean Soap' },
                    { name: 'Pure Essential Oils', stat: 'Organic scent' }
                  ].map((basic, idx) => (
                    <div key={idx} className="flex justify-between items-center py-1 border-b border-gray-50">
                      <span className="text-xs text-gray-800 font-semibold">{basic.name}</span>
                      <span className="text-[10px] font-mono text-gray-400 uppercase">{basic.stat}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] italic text-[#4B5320]/85 mt-2">
                  Replace 90% of toxic spray triggers with these key elements.
                </p>
              </div>

              {/* Expert Quote & Community Tip */}
              <div className="md:col-span-6 lg:col-span-5 bg-[#F5F1E6] rounded-3xl p-6 border border-[#E6E2D3] flex flex-col justify-center items-center relative min-h-[220px]">
                <div className="absolute top-4 left-6 text-[10px] uppercase font-bold text-[#4B5320]/50 tracking-widest">
                  Clean Chemistry Guideline
                </div>
                <blockquote className="text-base sm:text-lg font-serif italic text-center px-4 leading-relaxed text-[#2C3314] mt-4">
                  "Infuse plain white vinegar with leftover orange, tangelo, or grapefruit peels for 14 days to naturally isolate d-limonene solvent."
                </blockquote>
                <div className="mt-4 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#4B5320] flex items-center justify-center text-[8px] text-white font-bold">
                    🌿
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#4B5320]">
                    Amalgama Naturalist Lab
                  </span>
                </div>
              </div>

            </div>

            {/* -------------------- HIGH-DEMAND COMMERCIAL CATALOG ORGANIZER -------------------- */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E6E2D3] space-y-6" id="catalog_organizer_section">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase bg-[#4B5320]/15 text-[#4B5320] px-2.5 py-1 rounded-md font-mono">
                      Catalog Organizer
                    </span>
                    <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-serif italic font-bold text-gray-900">
                    High-Demand Product Formulations
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed max-w-2xl">
                    Discover 3 distinct, premium-grade commercial products that can be crafted at home naturally. Select a category below to generate clean formulation structures with difficulty ratings and prep times.
                  </p>
                </div>

                {/* Category Selection Filter Pills */}
                <div className="flex flex-wrap items-center gap-2">
                  {['Cosmetics', 'Personal Care', 'Eco-Home Utility'].map((categoryName) => (
                    <button
                      key={categoryName}
                      type="button"
                      onClick={() => setCatalogCategory(categoryName)}
                      className={`text-[10px] px-3.5 py-2 rounded-xl font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        catalogCategory === categoryName
                          ? 'bg-[#4B5320] text-[#F5F1E6] shadow-xs'
                          : 'bg-[#F2EDDF] hover:bg-[#E6E2D3] text-gray-800'
                      }`}
                    >
                      {categoryName}
                    </button>
                  ))}
                  
                  <button
                    onClick={handleTriggerCatalog}
                    disabled={submittingCatalog}
                    id="trigger_catalog_btn"
                    className="bg-amber-600 hover:bg-amber-700 disabled:bg-gray-250 text-white font-bold text-[10px] uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:text-gray-400"
                  >
                    {submittingCatalog ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Filter className="w-3.5 h-3.5" />
                        <span>Build Catalog List</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Error block */}
              {catalogError && (
                <div className="bg-rose-50 text-rose-800 p-4 rounded-2xl border border-rose-150 text-xs font-semibold">
                  ⚠️ {catalogError}
                </div>
              )}

              {/* Placeholder */}
              {!catalogResult && !submittingCatalog && !catalogError && (
                <div className="bg-[#FAF7F0]/60 p-8 rounded-2xl border border-[#E6E2D3] text-center space-y-2">
                  <p className="font-serif italic font-bold text-gray-800 text-sm">
                    Select a high-demand category and trigger the organizer to see tailored, zero-waste results.
                  </p>
                  <p className="text-xs text-gray-500">
                    Our AI deconstructs high-end commercial products to outline precise homemade recipes.
                  </p>
                </div>
              )}

              {/* Loading State */}
              {submittingCatalog && (
                <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                  <div className="w-10 h-10 rounded-full border-4 border-dashed border-[#4B5320] animate-spin"></div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-900">Assembling Commercial Catalog Structure...</p>
                    <p className="text-[11px] text-gray-500">Sorting by difficulty, preparation metrics, and clean organic chemistry constraints.</p>
                  </div>
                </div>
              )}

              {/* Results */}
              {catalogResult && !submittingCatalog && !catalogError && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn" id="catalog_results_container">
                  {catalogResult.products?.map((product: any, idx: number) => (
                    <div 
                      key={idx} 
                      className="bg-[#FAF7F0] hover:bg-[#FAF7F0]/80 p-5 rounded-2xl border border-[#E6E2D3] flex flex-col justify-between space-y-4 transition-colors"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-mono font-bold tracking-wide">
                          <span className={`px-2 py-0.5 rounded border uppercase ${
                            product.difficulty?.toLowerCase() === 'easy' 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-150' 
                              : product.difficulty?.toLowerCase() === 'medium' 
                                ? 'bg-amber-50 text-amber-800 border-amber-150' 
                                : 'bg-indigo-50 text-indigo-800 border-indigo-150'
                          }`}>
                            {product.difficulty}
                          </span>
                          <span className="text-gray-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            {product.prep_time}
                          </span>
                        </div>
                        <h4 className="text-lg font-serif italic text-gray-900 font-bold leading-tight">
                          {product.title}
                        </h4>
                        <p className="text-xs text-gray-700 leading-relaxed font-medium">
                          {product.primary_benefit}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-gray-150/65 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-[#4B5320] uppercase font-mono tracking-wider">
                          🌿 100% Homemade
                        </span>
                        
                        <button
                          onClick={() => {
                            setLabMode('recreate');
                            setCurrentTab('lab');
                            alert(`💡 Tip: Switch to "AI Formulation Core" and use our Target Re-creator to customize your formulation for "${product.title}" !`);
                          }}
                          className="text-[10px] bg-[#4B5320] text-white hover:bg-[#3D441A] px-3 py-1.5 rounded-lg font-bold uppercase transition-all shadow-xs cursor-pointer"
                        >
                          Formulate DIY
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* -------------------- DUAL-PANE LIBRARY COMPACT RENDERER -------------------- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
              
              {/* Left Column: List of Formulations Grid */}
              <div className="lg:col-span-5 space-y-4">
                
                {/* Search Bar / Input */}
                <div className="bg-white rounded-2xl p-4 border border-[#E6E2D3] space-y-3">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <Search className="w-4 h-4 text-gray-400" />
                    </span>
                    <input 
                      type="text" 
                      placeholder="Search ingredients, avoided toxins..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 text-xs bg-[#F5F1E6]/30 border border-[#E6E2D3] rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#4B5320] text-gray-950"
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-gray-500 font-medium">
                    <span>
                      Found <strong>{filteredRecipes.length}</strong> matching recipe{filteredRecipes.length !== 1 && 's'}
                    </span>
                    {(selectedCategory || searchQuery || selectedCollection) && (
                      <button 
                        onClick={() => {
                          setSelectedCategory(null);
                          setSearchQuery('');
                          setSelectedCollection(null);
                        }}
                        className="text-[#4B5320] hover:underline font-bold"
                      >
                        Reset Filters
                      </button>
                    )}
                  </div>
                </div>

                {/* Personal Collections Navigation widget */}
                <div className="bg-white rounded-2xl p-4 border border-[#E6E2D3] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#4B5320]">
                      <Folder className="w-4 h-4 text-[#4B5320]/80" />
                      Saved & Collections
                    </div>
                    {selectedCollection && (
                      <button 
                        onClick={() => setSelectedCollection(null)}
                        className="text-[10px] font-bold text-[#4B5320] hover:underline"
                      >
                        Show All
                      </button>
                    )}
                  </div>

                  {/* Collections List Pills */}
                  <div className="flex flex-col gap-1.5 max-h-[220px] overflow-y-auto pr-1">
                    {/* All Library Pill */}
                    <button
                      onClick={() => setSelectedCollection(null)}
                      className={`flex items-center justify-between w-full p-2.5 rounded-xl text-xs font-medium transition-all text-left ${
                        selectedCollection === null
                          ? 'bg-[#4B5320] text-white border border-[#4B5320]'
                          : 'bg-[#F5F1E6]/30 hover:bg-[#F5F1E6]/75 text-gray-750 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>All Library Formulations</span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${selectedCollection === null ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                        {allRecipesList.length}
                      </span>
                    </button>

                    {/* Bookmarked / Favorites Pill */}
                    <button
                      onClick={() => setSelectedCollection('all_favorites')}
                      className={`flex items-center justify-between w-full p-2.5 rounded-xl text-xs font-medium transition-all text-left ${
                        selectedCollection === 'all_favorites'
                          ? 'bg-rose-600 text-white border border-rose-600'
                          : 'bg-[#F5F1E6]/30 hover:bg-[#F5F1E6]/75 text-gray-750 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Heart className="w-3.5 h-3.5 fill-current" />
                        <span>My Saved Favorites</span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${selectedCollection === 'all_favorites' ? 'bg-white/20 text-white' : 'bg-rose-50 text-rose-705'}`}>
                        {savedRecipes.length}
                      </span>
                    </button>

                    {/* Custom collections */}
                    {collectionsList.map(col => {
                      const count = savedRecipes.filter(r => r.collections?.includes(col)).length;
                      const isSelected = selectedCollection === col;
                      const isPreseeded = col === 'Spring Cleaning Recipes' || col === 'Summer Skincare';
                      
                      return (
                        <div
                          key={col}
                          onClick={() => setSelectedCollection(isSelected ? null : col)}
                          className={`group flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                            isSelected
                              ? 'bg-[#2C3314] text-white border border-[#2C3314] shadow-xs'
                              : 'bg-[#F5F1E6]/30 hover:bg-[#F5F1E6]/75 text-gray-750 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Folder className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-gray-400'}`} />
                            <span className="truncate">{col}</span>
                          </div>
                          
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${isSelected ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-800'}`}>
                              {count}
                            </span>
                            {!isPreseeded && (
                              <button
                                onClick={(e) => handleDeleteCollection(col, e)}
                                className={`text-xs opacity-0 group-hover:opacity-100 hover:text-rose-500 transition-opacity p-0.5 ${isSelected ? 'hidden' : ''}`}
                                title="Delete collection folder"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-rose-600" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Inline Create new collection control */}
                  <div className="pt-2 border-t border-gray-100 flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="Add custom folder name..."
                      id="sidebar_new_col_input"
                      className="flex-1 px-3 py-2 text-xs bg-[#F5F1E6]/30 border border-[#E6E2D3] rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#4B5320] text-gray-950"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const input = e.currentTarget;
                          if (input.value.trim()) {
                            handleCreateCollection(input.value.trim());
                            input.value = '';
                          }
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        const el = document.getElementById('sidebar_new_col_input') as HTMLInputElement;
                        if (el && el.value.trim()) {
                          handleCreateCollection(el.value.trim());
                          el.value = '';
                        }
                      }}
                      className="p-2 bg-[#F5F1E6] hover:bg-[#E6E2D3] text-[#4B5320] rounded-xl transition-all"
                      title="Create new collection folder"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {selectedCategory && (
                  <div className="bg-[#4B5320]/5 border border-[#4B5320]/15 rounded-2xl p-4 text-[#2C3314] space-y-1 animate-fadeIn">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-lg">{CATEGORY_DESCRIPTIONS[selectedCategory]?.icon}</span>
                      <h4 className="font-serif font-bold text-sm text-[#4B5320]">
                        {CATEGORY_DESCRIPTIONS[selectedCategory]?.title}
                      </h4>
                    </div>
                    <p className="text-[11px] text-gray-600 leading-relaxed font-normal">
                      {CATEGORY_DESCRIPTIONS[selectedCategory]?.description}
                    </p>
                  </div>
                )}

                {/* Recipe items array list */}
                <div className="space-y-3 overflow-y-auto max-h-[640px] pr-2">
                  {filteredRecipes.length > 0 ? (
                    filteredRecipes.map((recipe) => {
                      const isSelected = selectedRecipeId === recipe.id;
                      const saved = isBookmarked(recipe.id);
                      
                      return (
                        <div
                          key={recipe.id}
                          onClick={() => setSelectedRecipeId(recipe.id)}
                          className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer text-left relative ${
                            isSelected 
                              ? 'bg-white border-[#4B5320] ring-1 ring-[#4B5320] scale-[1.01] shadow-xs' 
                              : 'bg-white border-[#E6E2D3] hover:border-gray-300'
                          }`}
                        >
                          {/* Bookmarked Tiny Heart Badge */}
                          {saved && (
                            <div className="absolute top-3 right-3 text-rose-500">
                              <Heart className="w-4 h-4 fill-rose-500" />
                            </div>
                          )}

                          <div className="flex items-center space-x-1.5 mb-2">
                            <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#F5F1E6] text-[#4B5320] flex items-center gap-1 font-semibold">
                              <span>{CATEGORY_DESCRIPTIONS[recipe.category]?.icon}</span>
                              <span>{getCategoryLabel(recipe.category)}</span>
                            </span>
                            {recipe.isCustom && (
                              <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-0.5">
                                <Sparkles className="w-2.5 h-2.5" /> AI Crafted
                              </span>
                            )}
                            <span className="text-[10px] text-gray-400">
                              • {recipe.prepTime}
                            </span>
                          </div>

                          <h4 className="text-base font-serif font-bold text-gray-950 mb-1 leading-tight">
                            {recipe.title}
                          </h4>

                          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                            {recipe.description}
                          </p>

                          {/* Collection badging on the recipe item template */}
                          {saved && (
                            (() => {
                              const savedRecord = savedRecipes.find(sr => sr.id === recipe.id);
                              const colsObj = savedRecord?.collections || [];
                              if (colsObj.length > 0) {
                                return (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {colsObj.map(c => (
                                      <span key={c} className="text-[8px] uppercase tracking-wider font-bold text-[#4B5320] bg-[#F5F1E6] px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                        <Folder className="w-2 h-2 text-[#4B5320]" />
                                        {c}
                                      </span>
                                    ))}
                                  </div>
                                );
                              }
                              return null;
                            })()
                          )}

                          <div className="mt-3 pt-2.5 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400">
                            <span>Cost: <strong className="text-gray-700">{recipe.costEstimate.split(' ')[0]}</strong></span>
                            <span>Saves: <strong className="text-emerald-700">{recipe.retailCostCost.split(' ')[0]} commercial</strong></span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="bg-white rounded-2xl p-8 border border-[#E6E2D3] text-center space-y-3">
                      <p className="text-sm text-gray-500">
                        No recipe matches your current path or filters.
                      </p>
                      <button 
                        onClick={() => {
                          setSelectedCategory(null);
                          setSearchQuery('');
                        }}
                        className="text-xs font-bold uppercase text-[#4B5320] bg-[#F5F1E6] hover:bg-[#E6E2D3] px-4 py-2 rounded-lg transition-colors"
                      >
                        Reset filters
                      </button>
                    </div>
                  )}
                </div>

                {/* Left Column footer links */}
                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 text-xs text-emerald-800 space-y-2">
                  <h5 className="font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Bypassing Endocrine Disruptors
                  </h5>
                  <p className="text-[11px] leading-relaxed text-emerald-950/80">
                    Industrial cleaners emit chemicals like DEP phthalates which act as artificial estrogens in biological cells. Making items yourself removes this constant baseline hazard!
                  </p>
                </div>

              </div>

              {/* Right Column: Recipe Details Detail Panel */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#E6E2D3] shadow-xs space-y-6" id="recipe_details_pane">
                
                {/* Info block for selected card */}
                {activeRecipe ? (
                  <div className="space-y-6">
                    
                    <div className="flex justify-between items-start flex-wrap gap-4 border-b border-gray-100 pb-5">
                      <div className="space-y-1 max-w-[70%]">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono uppercase tracking-wider bg-[#F5F1E6] text-[#4B5320] px-2.5 py-0.5 rounded-md font-semibold flex items-center gap-1">
                            <span>{CATEGORY_DESCRIPTIONS[activeRecipe.category]?.icon}</span>
                            <span>{getCategoryLabel(activeRecipe.category)}</span>
                          </span>
                          <span className={`text-[10px] uppercase px-2 py-0.5 rounded font-bold ${
                            activeRecipe.difficulty === 'easy' ? 'bg-green-50 text-green-700 border border-green-200' :
                            activeRecipe.difficulty === 'medium' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {activeRecipe.difficulty} difficulty
                          </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-serif italic text-gray-900 mt-2">
                          {activeRecipe.title}
                        </h2>
                        {CATEGORY_DESCRIPTIONS[activeRecipe.category] && (
                          <p className="text-xs text-gray-550 italic leading-relaxed pt-1 flex items-start gap-1">
                            <span className="font-semibold text-[#4B5320] shrink-0">{CATEGORY_DESCRIPTIONS[activeRecipe.category].title}:</span>
                            <span className="text-gray-600">{CATEGORY_DESCRIPTIONS[activeRecipe.category].description}</span>
                          </p>
                        )}
                      </div>

                      {/* Header actions on selected recipe */}
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleToggleBookmark(activeRecipe)}
                          className={`p-3 rounded-xl border transition-colors duration-150 ${
                            isBookmarked(activeRecipe.id)
                              ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                              : 'bg-gray-50 text-gray-400 border-gray-100 hover:text-gray-900 hover:bg-gray-100'
                          }`}
                          title="Bookmark formula"
                        >
                          <Heart className={`w-[18px] h-[18px] ${isBookmarked(activeRecipe.id) ? 'fill-rose-500' : ''}`} />
                        </button>
                        {activeRecipe.isCustom && (
                          <button 
                            onClick={() => handleRemoveCustomRecipe(activeRecipe.id)}
                            className="p-3 rounded-xl border bg-gray-50 border-gray-100 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                            title="Delete custom formulation"
                          >
                            <Trash2 className="w-[18px] h-[18px]" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Bio Summary / Cost Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-[#F5F1E6]/40 p-4 rounded-2xl border border-[#E6E2D3]/60 text-center">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-gray-500">DIY Recipe Cost</span>
                        <p className="text-lg font-serif font-bold text-emerald-800 mt-1">{activeRecipe.costEstimate}</p>
                      </div>
                      <div className="bg-[#F5F1E6]/40 p-4 rounded-2xl border border-[#E6E2D3]/60 text-center">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-gray-500">Retail Brand Cost</span>
                        <p className="text-lg font-serif font-bold text-gray-600 mt-1">{activeRecipe.retailCostCost}</p>
                      </div>
                      <div className="bg-[#F5F1E6]/40 p-4 rounded-2xl border border-[#E6E2D3]/60 text-center">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-gray-500">Estimated Shelf Life</span>
                        <p className="text-xs font-semibold text-[#4B5320] mt-2.5 line-clamp-2">{activeRecipe.shelfLife}</p>
                      </div>
                    </div>

                    {/* Personal Collections Assignment Card */}
                    <div className="bg-[#F5F1E6]/30 p-5 rounded-3xl border border-[#E6E2D3] space-y-3 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[#4B5320] uppercase tracking-wider flex items-center gap-1.5 font-semibold">
                          <Folder className="w-4 h-4 text-[#4B5320]" />
                          Organize in Collections
                        </h4>
                        {!isBookmarked(activeRecipe.id) && (
                          <span className="text-[10px] text-gray-400 italic">
                            Save to Favorites to organize!
                          </span>
                        )}
                      </div>
                      
                      {isBookmarked(activeRecipe.id) ? (
                        <div className="space-y-3">
                          <p className="text-[11px] text-gray-500 leading-normal">
                            Group this formulation into custom themed collections to plan your organic routines:
                          </p>
                          {/* List of checkboxes for each collection */}
                          <div className="flex flex-wrap gap-2">
                            {collectionsList.map(col => {
                              const savedItem = savedRecipes.find(r => r.id === activeRecipe.id);
                              const hasCollection = savedItem?.collections?.includes(col) || false;
                              
                              return (
                                <button
                                  key={col}
                                  onClick={() => handleToggleRecipeCollection(activeRecipe.id, col)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                                    hasCollection
                                      ? 'bg-[#2C3314] text-white border border-[#2C3314] shadow-xs'
                                      : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                                  }`}
                                >
                                  <div className={`w-1.5 h-1.5 rounded-full ${hasCollection ? 'bg-emerald-400 animate-pulse' : 'bg-gray-300'}`} />
                                  <span>{col}</span>
                                </button>
                              );
                            })}
                          </div>
                          
                          {/* Quick Add Custom Collection Inline */}
                          <div className="flex items-center gap-1.5 max-w-sm pt-1">
                            <input
                              type="text"
                              placeholder="Create custom folder name..."
                              id="detail_new_col_input"
                              className="flex-1 px-3 py-1.5 text-xs bg-white border border-[#E6E2D3] rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#4B5320] text-gray-950"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  const input = e.currentTarget;
                                  if (input.value.trim()) {
                                    handleCreateCollection(input.value.trim(), activeRecipe.id);
                                    input.value = '';
                                  }
                                }
                              }}
                            />
                            <button
                              onClick={() => {
                                const el = document.getElementById('detail_new_col_input') as HTMLInputElement;
                                if (el && el.value.trim()) {
                                  handleCreateCollection(el.value.trim(), activeRecipe.id);
                                  el.value = '';
                                }
                              }}
                              className="px-3 py-1.5 bg-[#4B5320] text-white hover:bg-[#3D441A] rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shrink-0"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 bg-white/50 rounded-2xl border border-dashed border-[#E6E2D3]">
                          <p className="text-xs text-gray-600 max-w-sm leading-relaxed">
                            Organize your formulations inside folder themes like <strong>'Spring Cleaning Recipes'</strong> or <strong>'Summer Skincare'</strong>! 
                          </p>
                          <button
                            onClick={() => handleToggleBookmark(activeRecipe)}
                            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold uppercase tracking-widest shrink-0 transition-colors flex items-center gap-1.5"
                          >
                            <Heart className="w-3.5 h-3.5" />
                            Save Favorite
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Avoided Toxic Agents Section */}
                    <div className="bg-rose-50/50 hover:bg-rose-50 rounded-2xl p-4 sm:p-5 border border-rose-100 space-y-2">
                      <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-600 animate-pulse" />
                        Avoids Industrial Synthetic Toxins
                      </h4>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-rose-950 font-medium list-inside list-disc">
                        {activeRecipe.chemicalsAvoided.map((chem, idx) => (
                          <li key={idx} className="opacity-90">{chem}</li>
                        ))}
                      </ul>
                    </div>

                    {/* -------------------- DERMATOLOGICAL & ALLERGEN SAFETY AUDIT -------------------- */}
                    <div className="bg-[#FAF7F0] hover:border-amber-200 rounded-3xl p-5 sm:p-6 border border-[#E6E2D3] space-y-4 shadow-2xs" id="safety_audit_section">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase bg-[#4B5320]/15 text-[#4B5320] px-2.5 py-1 rounded-md font-mono">
                            Personalized Safety & Allergen Security
                          </span>
                          <ShieldCheck className="w-4 h-4 text-emerald-600 animate-pulse" />
                        </div>
                        <h4 className="text-base font-serif italic text-gray-900 font-bold">
                          Dermatological Compatibility Verification
                        </h4>
                        <p className="text-[11px] text-gray-500 leading-normal">
                          Cross-reference and analyze the formulation's botanical raw materials against your specific dermis profile and any critical compound allergies.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-gray-750 uppercase tracking-wider">
                            My Skin Type / Condition
                          </label>
                          <select
                            value={userSkinType}
                            onChange={(e) => {
                              setUserSkinType(e.target.value);
                              localStorage.setItem('amalgama_user_skin_type', e.target.value);
                            }}
                            className="w-full bg-white border border-[#E6E2D3] rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-[#4B5320] text-gray-950 font-medium cursor-pointer"
                          >
                            <option value="Oily & Acne-Prone (Prone to clogged pores)">Oily & Acne-Prone (Prone to clogged pores)</option>
                            <option value="Sensitive & Rosacea-Prone skin">Sensitive / Rosacea-Prone skin</option>
                            <option value="Dry & Flaky / Eczema-Prone">Dry & Flaky / Eczema-Prone</option>
                            <option value="Normal / Balanced">Normal & Balanced</option>
                            <option value="Combination skin">Combination Skin</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-gray-755 uppercase tracking-wider">
                            My Known Allergens / Irritants
                          </label>
                          <input
                            type="text"
                            value={userAllergens}
                            onChange={(e) => {
                              setUserAllergens(e.target.value);
                              localStorage.setItem('amalgama_user_allergens', e.target.value);
                            }}
                            placeholder="e.g. Lavender, Lemon, Peanuts, Beeswax, Soy"
                            className="w-full bg-white border border-[#E6E2D3] rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-[#4B5320] text-gray-950 font-medium"
                          />
                        </div>
                      </div>

                      <div className="pt-1 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <span className="text-[10px] text-gray-400 italic">
                          💡 Settings persistent in browser storage
                        </span>
                        <button
                          onClick={() => handleTriggerSafetyAudit(activeRecipe)}
                          disabled={auditingSafety}
                          id="trigger_safety_audit_btn"
                          className="bg-[#4B5320] hover:bg-[#3D441A] disabled:bg-gray-250 text-[#F5F1E6] disabled:text-gray-400 text-[10px] font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          {auditingSafety ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Analyzing compatibility...</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Audit Formulation Safety</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Safety Audit Error Panel */}
                      {auditError && (
                        <div className="bg-rose-50 text-rose-800 p-4 rounded-xl border border-rose-150 text-xs font-semibold">
                          ⚠️ {auditError}
                        </div>
                      )}

                      {/* Safety Audit Results Render */}
                      {auditResult && auditedRecipeId === activeRecipe.id && !auditingSafety && (
                        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E6E2D3] space-y-4 animate-scaleIn" id="safety_audit_results">
                          
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F5F1E6] pb-3.5">
                            <div className="flex items-center gap-2.5">
                              {auditResult.is_safe_for_user ? (
                                <div className="flex items-center bg-emerald-55/65 text-emerald-800 border border-emerald-200 rounded-xl px-3 py-1.5 text-xs font-bold gap-1 mt-0.5">
                                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                  <span>SAFE FOR YOUR PROFILE</span>
                                </div>
                              ) : (
                                <div className="flex items-center bg-rose-55/65 text-rose-800 border border-rose-200 rounded-xl px-3 py-1.5 text-xs font-bold gap-1 mt-0.5" id="unsafe_badge_indicator">
                                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 animate-pulse" />
                                  <span>POTENTIAL BIOLOGICAL DANGER (UNSAFE)</span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2 bg-[#FAF7F0] border border-[#E6E2D3] rounded-xl px-3 py-1 text-xs font-mono">
                              <span className="text-[10px] text-gray-500 font-sans tracking-wide">COMPATIBILITY SCORE</span>
                              <span className={`font-bold text-sm ${
                                Number(auditResult.safety_score) >= 8 
                                  ? 'text-emerald-700' 
                                  : Number(auditResult.safety_score) >= 5 
                                    ? 'text-amber-700' 
                                    : 'text-rose-700'
                              }`} id="safety_score_indicator">
                                {auditResult.safety_score} / 10
                              </span>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">
                              Dermatologist Risk Assessment
                            </span>
                            <p className="text-xs text-gray-700 leading-relaxed font-medium">
                              {auditResult.risk_assessment}
                            </p>
                          </div>

                          {auditResult.required_modifications && auditResult.required_modifications.length > 0 && (
                            <div className="space-y-2 pt-2 border-t border-[#F5F1E6]" id="required_modifications_container">
                              <span className="block text-[10px] font-bold text-rose-800 uppercase tracking-widest font-mono">
                                Required Formulation Adjustments & Cleaner Swaps
                              </span>
                              <ul className="space-y-1.5">
                                {auditResult.required_modifications.map((mod: string, idx: number) => (
                                  <li key={idx} className="flex items-start gap-1.5 text-xs text-gray-850 font-medium">
                                    <span className="text-rose-500 mt-0.5 text-xs shrink-0">⚠️</span>
                                    <span>{mod}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {auditResult.is_safe_for_user && (
                            <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 flex items-start gap-2">
                              <span className="text-emerald-700">🌱</span>
                              <p className="text-[11px] text-emerald-950 font-medium leading-normal">
                                Excellent choice! Every natural compound in this formula aligns cleanly with your profile constraints. Enjoy crafting!
                              </p>
                            </div>
                          )}

                        </div>
                      )}
                    </div>

                    {/* -------------------- 24-HOUR SAFETY PATCH TEST PROCESSOR -------------------- */}
                    <div className="bg-[#F9F7F1]/80 hover:border-[#4B5320]/25 rounded-3xl p-5 sm:p-6 border border-[#E6E2D3] space-y-4 shadow-2xs" id="patch_test_session">
                      <div className="space-y-1.55">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase bg-amber-600/15 text-amber-800 px-2.5 py-1 rounded-md font-mono">
                            24h Safety Timing Protocol
                          </span>
                          <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                        </div>
                        <h4 className="text-base font-serif italic text-gray-900 font-bold">
                          Personalized 24-Hour Dermal Patch Test Guide
                        </h4>
                        <p className="text-[11px] text-gray-500 leading-normal">
                          Before applying any homemade formulation, generate custom safety checkpoints tailored to this recipe's specific biological compounds, complete with target body zones and warning signs.
                        </p>
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={() => handleTriggerPatchTest(activeRecipe)}
                          disabled={generatingPatchTest}
                          id="trigger_patch_test_btn"
                          className="bg-amber-600 hover:bg-amber-700 disabled:bg-gray-250 text-white disabled:text-gray-400 text-[10px] font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          {generatingPatchTest ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Mapping dermal spot...</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5" />
                              <span>Generate Patch Test Guide</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Patch Test Error Display */}
                      {patchTestError && (
                        <div className="bg-rose-50 text-rose-800 p-4 rounded-xl border border-rose-150 text-xs font-semibold">
                          ⚠️ {patchTestError}
                        </div>
                      )}

                      {/* Patch Test Loading Indicator */}
                      {generatingPatchTest && (
                        <div className="flex flex-col items-center justify-center py-6 text-center space-y-2.5 bg-white rounded-2xl border border-[#E6E2D3]">
                          <div className="w-8 h-8 rounded-full border-3 border-dashed border-amber-600 animate-spin"></div>
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold text-gray-950">Calculating biological safety zones...</p>
                            <p className="text-[10px] text-gray-500">Matching ingredients with sensory dermis reaction timelines.</p>
                          </div>
                        </div>
                      )}

                      {/* Patch Test Success Render Block */}
                      {patchTestResult && patchTestedRecipeId === activeRecipe.id && !generatingPatchTest && (
                        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E6E2D3] space-y-4 animate-scaleIn" id="patch_test_results">
                          
                          {/* Ideal Testing Zone & Clinical Rationale */}
                          <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-200/50 space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">📍</span>
                              <div className="space-y-0.5">
                                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest font-mono block">
                                  Highest-Sensitivity Target Spot
                                </span>
                                <h5 className="text-sm font-bold text-gray-950">
                                  {patchTestResult.recommended_body_area}
                                </h5>
                              </div>
                            </div>
                            <p className="text-xs text-gray-700 leading-relaxed font-medium pl-6">
                              <strong>Clinical Rationale:</strong> {patchTestResult.rationale}
                            </p>
                          </div>

                          {/* Chronological Steps / Timeline */}
                          <div className="space-y-2.5">
                            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">
                              24-Hour Clinical Timeline Checkpoints
                            </span>
                            
                            <div className="grid grid-cols-1 gap-2">
                              {patchTestResult.instructions?.map((step: string, idx: number) => {
                                // Design custom visual timelines
                                let checkpointLabel = `Phase ${idx + 1}`;
                                if (idx === 0) checkpointLabel = "Hour 0: Cleanse & Prep";
                                else if (idx === 1) checkpointLabel = "Hour 1: Apply & Watch";
                                else if (idx === patchTestResult.instructions.length - 1) checkpointLabel = "Hour 24: final audit";
                                else checkpointLabel = `Hour ${Math.round(24 / (patchTestResult.instructions.length - 1) * idx)}: Monitor`;

                                return (
                                  <div key={idx} className="flex gap-3 bg-[#FAF7F0]/40 p-3 rounded-xl border border-gray-100 font-medium">
                                    <div className="flex flex-col items-center">
                                      <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center shrink-0">
                                        {idx + 1}
                                      </div>
                                      {idx < patchTestResult.instructions.length - 1 && (
                                        <div className="w-0.5 bg-gray-200 grow my-1"></div>
                                      )}
                                    </div>
                                    <div className="space-y-1">
                                      <span className="text-[9px] font-bold text-amber-700 uppercase tracking-wider block font-mono">
                                        {checkpointLabel}
                                      </span>
                                      <p className="text-xs text-gray-700 leading-relaxed font-medium">
                                        {step}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Irritation / Warning Indicators & Emergency Actions */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#F5F1E6]">
                            
                            <div className="space-y-2 bg-rose-50/30 p-3.5 rounded-xl border border-rose-100" id="sensory_warning_indicators">
                              <span className="text-[10px] font-bold text-rose-800 uppercase tracking-widest font-mono block">
                                🚨 Irritation Triggers To Watch For
                              </span>
                              <ul className="space-y-1.5">
                                {patchTestResult.visual_signs_to_watch_for?.map((sign: string, idx: number) => (
                                  <li key={idx} className="flex items-start gap-1.5 text-xs text-gray-800 font-medium">
                                    <span className="text-rose-500 mt-0.5 text-xs shrink-0">•</span>
                                    <span>{sign}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-gray-150/70" id="emergency_safety_wash">
                              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono block">
                                🛡️ Reaction Mitigation Steps
                              </span>
                              <p className="text-xs text-gray-700 leading-relaxed font-semibold">
                                {patchTestResult.emergency_action}
                              </p>
                            </div>

                          </div>

                        </div>
                      )}
                    </div>

                    {/* -------------------- DYNAMIC PORTION & INGREDIENT SCALING ENGINE -------------------- */}
                    <div className="bg-[#FAF7F0] hover:border-[#4B5320]/20 rounded-3xl p-5 sm:p-6 border border-[#E6E2D3] space-y-4 shadow-2xs" id="recipe_scaling_section">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase bg-[#4B5320]/15 text-[#4B5320] px-2.5 py-1 rounded-md font-mono">
                            Chemical Ratio & Portion Scaling
                          </span>
                          <Scale className="w-4 h-4 text-[#4B5320]" />
                        </div>
                        <h4 className="text-base font-serif italic text-gray-900 font-bold">
                          Dynamic Ingredient Scaling System
                        </h4>
                        <p className="text-[11px] text-gray-500 leading-normal">
                          Mathematically scale baseline amounts for batch portion sizes (droppers, jars, bulk containers) while dynamically recalculating emulsion binders, gelling agents, and preservative thresholds for optimal chemistry stability.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">
                          Target Volume / Portion Format
                        </label>

                        <div className="flex flex-wrap gap-2">
                          {[
                            'Single-use compact batch',
                            '100ml Dropper bottle',
                            '250ml Cosmetic jar',
                            '500ml Spray bottle',
                            '1-Liter bulk container'
                          ].map((volumePreset) => (
                            <button
                              key={volumePreset}
                              type="button"
                              onClick={() => {
                                setTargetScaleVolume(volumePreset);
                              }}
                              className={`text-[10px] px-3 py-1.5 rounded-lg font-bold uppercase transition-all cursor-pointer ${
                                targetScaleVolume === volumePreset
                                  ? 'bg-[#4B5320] text-white shadow-xs'
                                  : 'bg-white border border-[#E6E2D3] hover:bg-[#F2EDDF] text-gray-800'
                              }`}
                            >
                              {volumePreset}
                            </button>
                          ))}
                        </div>

                        <div className="flex items-center gap-3 pt-1">
                          <input
                            type="text"
                            value={targetScaleVolume}
                            onChange={(e) => setTargetScaleVolume(e.target.value)}
                            placeholder="Or type custom size, e.g. 350ml jar..."
                            className="bg-white border border-[#E6E2D3] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#4B5320] focus:outline-hidden text-gray-905 font-medium grow"
                          />
                          
                          <button
                            onClick={() => handleTriggerRecipeScale(activeRecipe)}
                            disabled={scalingInProgress}
                            id="trigger_scaling_btn"
                            className="bg-[#4B5320] hover:bg-[#3D441A] disabled:bg-gray-250 text-white disabled:text-gray-400 text-[10px] font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            {scalingInProgress ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Recalculating...</span>
                              </>
                            ) : (
                              <>
                                <Scale className="w-3.5 h-3.5" />
                                <span>Scale Recipe</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Scaling Error Indicator */}
                      {scalingError && (
                        <div className="bg-rose-50 text-rose-800 p-4 rounded-xl border border-rose-150 text-xs font-semibold">
                          ⚠️ {scalingError}
                        </div>
                      )}

                      {/* Loading state indicator */}
                      {scalingInProgress && (
                        <div className="flex flex-col items-center justify-center py-8 text-center space-y-2 bg-white rounded-2xl border border-gray-100">
                          <div className="w-8 h-8 rounded-full border-3 border-dashed border-[#4B5320] animate-spin"></div>
                          <p className="text-xs font-bold text-gray-950">Calculating chemical scaling proportions...</p>
                        </div>
                      )}

                      {/* Scaling Success Output */}
                      {scalingResult && scalingRecipeId === activeRecipe.id && !scalingInProgress && (
                        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E6E2D3] space-y-5 animate-scaleIn" id="scaling_results_panel">
                          
                          <div className="border-b border-gray-100 pb-3">
                            <span className="text-[9px] font-bold text-[#4B5320] uppercase tracking-widest font-mono block">
                              Formulation Engineer Analysis
                            </span>
                            <p className="text-xs text-gray-700 leading-relaxed font-semibold">
                              {scalingResult.explanation}
                            </p>
                          </div>

                          {/* Scaled Ingredients Table */}
                          <div className="space-y-2">
                            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">
                              Recipient Portion Ingredients ({scalingResult.scaled_ingredients?.length})
                            </span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3" id="scaled_ingredients_grid">
                              {scalingResult.scaled_ingredients?.map((item: any, idx: number) => (
                                <div key={idx} className="flex flex-col justify-between p-3 bg-[#FAF7F0] rounded-xl border border-gray-150/50 space-y-1">
                                  <div className="flex justify-between items-start">
                                    <span className="text-xs font-bold text-gray-950">{item.name}</span>
                                    <span className="text-[10px] uppercase font-mono font-bold bg-[#4B5320]/10 text-[#4B5320] px-1.5 py-0.5 rounded">
                                      {item.role}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center text-xs text-gray-650 font-medium">
                                    <span>Base: <strong className="text-gray-550">{item.original_amount}</strong></span>
                                    <span>👉 Scaled: <strong className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">{item.scaled_amount}</strong></span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Shelf Life & Mixing Warnings */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                            
                            <div className="space-y-1" id="scaling_shelf_life_card">
                              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest font-mono block">
                                📅 Scaled Shelf Life Impact
                              </span>
                              <p className="text-xs text-gray-700 leading-relaxed font-semibold">
                                {scalingResult.shelf_life_impact}
                              </p>
                            </div>

                            <div className="space-y-1" id="scaling_instructions_adjustments">
                              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest font-mono block">
                                🥣 Instruction Scaling adjustments
                              </span>
                              <ul className="space-y-1">
                                {scalingResult.instructions_adjustments?.map((adj: string, idx: number) => (
                                  <li key={idx} className="flex gap-1.5 text-xs text-gray-750 font-medium font-semibold">
                                    <span className="text-amber-500 text-xs shrink-0">•</span>
                                    <span>{adj}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                          </div>

                        </div>
                      )}
                    </div>

                    {/* -------------------- SHELF LIFE & PERISHABLES ESTIMATION ENGINE -------------------- */}
                    <div className="bg-[#FAF7F0] hover:border-[#4B5320]/20 rounded-3xl p-5 sm:p-6 border border-[#E6E2D3] space-y-4 shadow-2xs" id="shelf_life_estimation_section">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase bg-amber-600/15 text-amber-800 px-2.5 py-1 rounded-md font-mono">
                            Shelf-Life & Perishability Engine
                          </span>
                          <Hourglass className="w-4 h-4 text-amber-600 animate-pulse" />
                        </div>
                        <h4 className="text-base font-serif italic text-gray-900 font-bold">
                          Natural Stability & Shelf-Life Estimation
                        </h4>
                        <p className="text-[11px] text-gray-500 leading-normal">
                          Run a microbiological and chemical decomposition audit to estimate the safe shelf-life of your freshly formulated DIY product, based on the organic perishability of raw ingredients.
                        </p>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => handleTriggerShelfLifeEstimation(activeRecipe)}
                          disabled={estimatingShelfLife}
                          id="trigger_shelf_life_btn"
                          className="bg-amber-600 hover:bg-amber-700 disabled:bg-gray-250 text-white disabled:text-gray-400 text-[10px] font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          {estimatingShelfLife ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Decomposing ingredients...</span>
                            </>
                          ) : (
                            <>
                              <Hourglass className="w-3.5 h-3.5" />
                              <span>Estimate Shelf-Life & Stability</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Error Block */}
                      {shelfLifeError && (
                        <div className="bg-rose-50 text-rose-800 p-4 rounded-xl border border-rose-150 text-xs font-semibold">
                          ⚠️ {shelfLifeError}
                        </div>
                      )}

                      {/* Loading status indicator */}
                      {estimatingShelfLife && (
                        <div className="flex flex-col items-center justify-center py-8 text-center space-y-2 bg-white rounded-2xl border border-gray-100">
                          <div className="w-8 h-8 rounded-full border-3 border-dashed border-amber-600 animate-spin"></div>
                          <p className="text-xs font-bold text-gray-950">Performing perishability chemistry calculations...</p>
                        </div>
                      )}

                      {/* Shelf Life Success Panel */}
                      {shelfLifeResult && shelfLifeRecipeId === activeRecipe.id && !estimatingShelfLife && (
                        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E6E2D3] space-y-5 animate-scaleIn" id="shelf_life_results_panel">
                          
                          {/* Expiration Timeline Display */}
                          <div className="bg-[#FAF7F0] p-4 rounded-2xl border border-[#E6E2D3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest font-mono block">
                                Safe Expiration Timeline
                              </span>
                              <p className="text-xs text-gray-750 leading-relaxed font-semibold">
                                {shelfLifeResult.timeline_explanation}
                              </p>
                            </div>
                            <div className="bg-amber-600 text-white font-serif font-bold text-lg sm:text-xl px-5 py-3 rounded-2xl flex flex-col items-center shrink-0 min-w-[120px] shadow-sm">
                              <span className="text-3xl tracking-tight font-extrabold">{shelfLifeResult.estimated_days}</span>
                              <span className="text-[9px] uppercase tracking-wider font-sans font-bold">Days Safety</span>
                            </div>
                          </div>

                          {/* Storage Conditions block */}
                          <div className="space-y-2">
                            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">
                              Optimal Storage Protocol
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {shelfLifeResult.storage_conditions?.map((cond: string, idx: number) => (
                                <div key={idx} className="bg-gray-50/70 p-3 rounded-xl border border-gray-100 flex gap-2">
                                  <span className="mt-0.5 text-xs text-[#4B5320]">🔒</span>
                                  <p className="text-xs text-gray-700 leading-relaxed font-medium">
                                    {cond}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Spoilage Indicators Table */}
                          <div className="space-y-2">
                            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">
                              Physical Spoilage Alerts to Monitor
                            </span>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border-t border-b border-gray-100 py-3" id="spoilage_indicators_grid">
                              {shelfLifeResult.spoilage_indicators?.map((ind: any, idx: number) => (
                                <div key={idx} className="p-3 bg-rose-50/30 rounded-xl border border-rose-100/60 flex flex-col space-y-1">
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-rose-900">{ind.indicator_type}</span>
                                    <span className="text-[9px] uppercase font-mono font-bold bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded animate-pulse">
                                      ALERT
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-gray-700 leading-relaxed font-medium">
                                    {ind.description}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Preservation Tips block */}
                          <div className="space-y-2">
                            <span className="block text-[10px] font-bold text-[#4B5320] uppercase tracking-widest font-mono">
                              Stability Extension Tips
                            </span>
                            <ul className="space-y-1.5">
                              {shelfLifeResult.preservation_tips?.map((tip: string, idx: number) => (
                                <li key={idx} className="flex gap-2 text-xs text-gray-800 font-medium">
                                  <span className="text-emerald-500 mt-0.5 shrink-0">🌿</span>
                                  <span>{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                        </div>
                      )}
                    </div>

                    {/* Ingredients Checklist */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-[#4B5320]">
                        Formulation Ingredients ({activeRecipe.ingredients.length})
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {activeRecipe.ingredients.map((ing, idx) => (
                          <div key={idx} className="flex items-center space-x-2.5 p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
                            <div className="text-xs">
                              <span className="font-bold text-gray-800">{ing.amount}</span> of <span className="text-gray-600 font-medium">{ing.name}</span>
                              {ing.optional && <span className="text-[9px] text-[#4B5320] ml-1 uppercase">(Optional)</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Step-by-Step Instructions */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-[#4B5320]">
                        Step-by-Step Laboratory Instructions
                      </h4>
                      <div className="space-y-3.5">
                        {activeRecipe.instructions.map((step, idx) => (
                          <div key={idx} className="flex items-start space-x-3 text-xs leading-relaxed text-gray-700">
                            <span className="bg-[#F5F1E6] text-[#4B5320] font-mono font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                              {idx + 1}
                            </span>
                            <p className="pt-0.5">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Safety Warnings & Chemistry Tips */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider flex items-center gap-1">
                          <Info className="w-3.5 h-3.5" /> Safety Notes
                        </span>
                        <p className="text-[11px] leading-relaxed text-amber-950 font-medium">
                          {activeRecipe.safetyNote}
                        </p>
                      </div>
                      <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-sky-800 tracking-wider">
                          🔬 Botanical Tips
                        </span>
                        <ul className="text-[11px] leading-relaxed text-sky-950 list-disc list-inside space-y-1 font-medium">
                          {activeRecipe.tips.map((tip, idx) => (
                            <li key={idx}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Bookmarked Personal Notes Logger */}
                    {isBookmarked(activeRecipe.id) && (
                      <div className="border-t border-gray-100 pt-5 space-y-2">
                        <label className="block text-xs font-bold text-gray-900 uppercase">
                          Your Formulation Notebook & Notes
                        </label>
                        <p className="text-[10px] text-gray-500">
                          Add custom adjustments, date of last test batch, or smell preferences. This persists to your browser storage.
                        </p>
                        <div className="flex gap-2">
                          <textarea
                            value={personalNotesInput}
                            onChange={(e) => setPersonalNotesInput(e.target.value)}
                            placeholder="Example: Doubled the tea tree oil for a stronger scent. Steeping batch since June 12th."
                            className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs w-full focus:outline-hidden focus:ring-1 focus:ring-[#4B5320] text-gray-950"
                            rows={2}
                          />
                        </div>
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleSaveNotes(activeRecipe.id)}
                            className="bg-[#4B5320] text-[#F5F1E6] hover:bg-[#2C3314] text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition-colors"
                          >
                            Save Notes
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                ) : (
                  <div className="text-center py-16 text-gray-400">
                    <p>Select a recipe from the sidebar to inspect clean formulation steps.</p>
                  </div>
                )}

              </div>

            </div>

            {/* -------------------- INGREDIENTS BIO INDEX GRID -------------------- */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E6E2D3] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-xl sm:text-2xl font-serif italic text-gray-900">
                    Clean Ingredients Bio-Profiles
                  </h3>
                  <p className="text-xs text-gray-500">
                    Detailed inspection of safely bio-compatible minerals, lipids, and acids utilized in our formulations.
                  </p>
                </div>
                
                {/* Search Bar */}
                <div className="relative max-w-xs w-full">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={ingSearchQuery}
                    onChange={(e) => setIngSearchQuery(e.target.value)}
                    placeholder="Search ingredients, uses, properties..."
                    className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 hover:bg-gray-100/60 focus:bg-white text-gray-900 border border-gray-200 focus:border-[#4B5320] rounded-xl focus:outline-none transition-all duration-200"
                  />
                  {ingSearchQuery && (
                    <button 
                      onClick={() => setIngSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-gray-400 hover:text-gray-650"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Interactive Quick Filter Pills */}
              <div className="flex flex-wrap gap-2 items-center bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mr-2 flex items-center gap-1">
                  <Filter className="w-3 h-3 text-[#4B5320]" /> Filter by Property:
                </span>
                <button
                  onClick={() => setSelectedProperty(null)}
                  className={`px-3 py-1 text-[11px] rounded-full transition-all duration-200 border ${
                    !selectedProperty
                      ? 'bg-[#4B5320] text-white border-[#4B5320] font-semibold shadow-sm'
                      : 'bg-white hover:bg-gray-100 text-gray-600 border-gray-200'
                  }`}
                >
                  All Properties
                </button>
                {["Antibacterial", "Moisturizing", "Mild Abrasive", "Highly Absorbent", "Skin Soothing", "Anti-inflammatory", "Deodorizing"].map((prop) => {
                  const isSelected = selectedProperty === prop;
                  return (
                    <button
                      key={prop}
                      onClick={() => setSelectedProperty(isSelected ? null : prop)}
                      className={`px-3 py-1 text-[11px] rounded-full transition-all duration-200 border flex items-center gap-1 ${
                        isSelected
                          ? 'bg-[#4B5320] text-white border-[#4B5320] font-semibold shadow-sm'
                          : 'bg-white hover:bg-gray-100 text-gray-600 border-gray-200'
                      }`}
                    >
                      <span>{prop}</span>
                    </button>
                  );
                })}
              </div>

              {/* Results count indicator */}
              <div className="flex justify-between items-center text-xs text-gray-500 font-mono">
                <div>
                  {(ingSearchQuery || selectedProperty) ? (
                    <span>
                      Found <strong className="text-gray-900">{INGREDIENT_PROFILES.filter(ing => {
                        const matchesSearch = ingSearchQuery
                          ? ing.name.toLowerCase().includes(ingSearchQuery.toLowerCase()) ||
                            ing.description.toLowerCase().includes(ingSearchQuery.toLowerCase()) ||
                            (ing.properties || []).some(p => p.toLowerCase().includes(ingSearchQuery.toLowerCase())) ||
                            ing.commonUses.some(u => u.toLowerCase().includes(ingSearchQuery.toLowerCase()))
                          : true;
                        const matchesProperty = selectedProperty
                          ? (ing.properties || []).some(p => p.toLowerCase().includes(selectedProperty.toLowerCase()))
                          : true;
                        return matchesSearch && matchesProperty;
                      }).length}</strong> matching ingredient(s)
                    </span>
                  ) : (
                    <span>Showing all {INGREDIENT_PROFILES.length} bio-compatible ingredients</span>
                  )}
                </div>
                {(ingSearchQuery || selectedProperty) && (
                  <button
                    onClick={() => {
                      setIngSearchQuery('');
                      setSelectedProperty(null);
                    }}
                    className="text-[#4B5320] hover:underline font-semibold"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>

              {/* Ingredients Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {INGREDIENT_PROFILES.filter((ing) => {
                  const matchesSearch = ingSearchQuery
                    ? ing.name.toLowerCase().includes(ingSearchQuery.toLowerCase()) ||
                      ing.description.toLowerCase().includes(ingSearchQuery.toLowerCase()) ||
                      (ing.properties || []).some(p => p.toLowerCase().includes(ingSearchQuery.toLowerCase())) ||
                      ing.commonUses.some(u => u.toLowerCase().includes(ingSearchQuery.toLowerCase()))
                    : true;
                  const matchesProperty = selectedProperty
                    ? (ing.properties || []).some(p => p.toLowerCase().includes(selectedProperty.toLowerCase()))
                    : true;
                  return matchesSearch && matchesProperty;
                }).length === 0 ? (
                  <div className="col-span-full py-12 text-center space-y-3 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-sm font-medium text-gray-500">No natural ingredients match your search filters.</p>
                    <button 
                      onClick={() => {
                        setIngSearchQuery('');
                        setSelectedProperty(null);
                      }}
                      className="px-4 py-2 bg-[#4B5320] text-white text-xs font-semibold rounded-xl hover:scale-105 transition-all duration-200 shadow-sm"
                    >
                      Reset Search Filters
                    </button>
                  </div>
                ) : (
                  INGREDIENT_PROFILES.filter((ing) => {
                    const matchesSearch = ingSearchQuery
                      ? ing.name.toLowerCase().includes(ingSearchQuery.toLowerCase()) ||
                        ing.description.toLowerCase().includes(ingSearchQuery.toLowerCase()) ||
                        (ing.properties || []).some(p => p.toLowerCase().includes(ingSearchQuery.toLowerCase())) ||
                        ing.commonUses.some(u => u.toLowerCase().includes(ingSearchQuery.toLowerCase()))
                      : true;
                    const matchesProperty = selectedProperty
                      ? (ing.properties || []).some(p => p.toLowerCase().includes(selectedProperty.toLowerCase()))
                      : true;
                    return matchesSearch && matchesProperty;
                  }).map((ing) => {
                    const isExpanded = expandedIngId === ing.id;
                    return (
                      <div 
                        key={ing.id} 
                        onClick={() => setExpandedIngId(isExpanded ? null : ing.id)}
                        className={`bg-gray-50 hover:bg-gray-100/70 p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 ${
                          isExpanded ? 'border-[#4B5320] bg-[#4B5320]/5 ring-1 ring-[#4B5320]/20 scale-[1.01]' : 'border-gray-100 hover:scale-[1.005]'
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${
                              ing.safetyLevel === 'excellent' ? 'bg-green-100 text-green-800' :
                              ing.safetyLevel === 'safe' ? 'bg-emerald-55 text-emerald-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              Safety: {ing.safetyLevel.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">
                              {isExpanded ? 'Hide ▲' : 'Details ▼'}
                            </span>
                          </div>
                          
                          <div className="space-y-1">
                            <h4 className="text-sm font-bold text-gray-950 leading-tight">{ing.name}</h4>
                            
                            {/* Display Ingredient Properties */}
                            {ing.properties && ing.properties.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-1">
                                {ing.properties.map((prop, idx) => (
                                  <span 
                                    key={idx} 
                                    className="text-[8px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-[#4B5320]/10 text-[#4B5320]"
                                  >
                                    {prop}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <p className={`text-[11px] leading-relaxed text-gray-600 ${isExpanded ? '' : 'line-clamp-3'}`}>
                            {ing.description}
                          </p>
                          
                          {isExpanded && (
                            <div className="pt-3 border-t border-dashed border-gray-200 text-[11px] space-y-1.5 animate-fadeIn">
                              <span className="font-bold text-[#4B5320] uppercase text-[9px] tracking-wider block">Bio-Safety Profile:</span>
                              <p className="text-gray-600 leading-relaxed font-normal">{ing.safetyDescription}</p>
                            </div>
                          )}
                        </div>

                        <div className="pt-2.5 border-t border-gray-200/60 space-y-1">
                          <div className="text-[10px] font-bold uppercase text-[#4B5320]">Common Uses:</div>
                          <div className="flex flex-wrap gap-1">
                            {ing.commonUses.map((use, i) => (
                              <span key={i} className="text-[9px] bg-white border border-gray-200 text-gray-500 px-1.5 py-0.5 rounded">
                                {use}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* -------------------- TOXIC CHEMICALS WATCHLIST BANNER -------------------- */}
            <div className="bg-[#4B5320] text-white rounded-3xl p-6 sm:p-8 space-y-6 border border-[#E6E2D3]">
              <div className="max-w-2xl space-y-2">
                <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-[#F5F1E6]/70">
                  Toxicological Risk Monitor
                </span>
                <h3 className="text-xl sm:text-2xl font-serif italic text-[#F5F1E6]">
                  Mass-Market Chemical Watchlist
                </h3>
                <p className="text-xs text-[#F5F1E6]/80 leading-relaxed">
                  These industrial additives are heavily saturated in everyday liquid laundry gels, standard commercial deodorants, and surface anti-bac hand sprays. Click below to inspect their biological threat level.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {CHEMICAL_HAZARDS.map((chem) => (
                  <div key={chem.id} className="bg-white/10 hover:bg-white/15 p-5 rounded-2xl border border-white/10 flex flex-col justify-between space-y-4 transition-colors">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] uppercase tracking-wider text-[#F5F1E6]/50 font-bold">{chem.type}</span>
                        <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold text-[10px] px-2 py-0.5 rounded">
                          Toxicity: {chem.score}/10
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white tracking-tight">{chem.name}</h4>
                      <div className="text-[11px] leading-relaxed text-[#F5F1E6]/80">
                        <strong className="text-[#F5F1E6]">Hazards:</strong> {chem.hazards}
                      </div>
                      <p className="text-[11px] italic text-[#F5F1E6]/70 pt-1 leading-normal border-t border-white/5">
                        "{chem.whyAvoid}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ======================= TAB: AI LAB FORMULATOR ======================= */}
        {currentTab === 'lab' && (
          <div className="space-y-8" id="lab_tab_content">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Formulator Controls (Left Column) */}
              <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-[#E6E2D3] shadow-xs space-y-6">
                <div className="space-y-1.5 border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    Amalgama AI Lab
                  </div>
                  <h3 className="text-xl sm:text-2xl font-serif italic text-gray-900">
                    Organic Synthesis Machine
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Select natural materials in your pantry, recreate store bought items safely, or analyze arrays of raw compounds to trigger recipes matching only what you have!
                  </p>
                </div>

                {/* Sub-mode segmented switcher pill */}
                <div className="grid grid-cols-4 gap-1 bg-[#F5F1E6]/60 p-1 rounded-2xl border border-[#E6E2D3]">
                  <button
                    type="button"
                    onClick={() => { setLabMode('recreate'); setFormulatedRecipe(null); }}
                    className={`py-2 px-0.5 text-[9px] font-bold rounded-xl transition-all uppercase tracking-wider text-center ${
                      labMode === 'recreate'
                        ? 'bg-[#4B5320] text-white shadow-xs'
                        : 'text-[#4B5320] hover:bg-[#F5F1E6]'
                    }`}
                  >
                    Re-creator
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLabMode('matchmaker'); setMatchmakerResult(null); }}
                    id="mode_matchmaker_btn"
                    className={`py-2 px-0.5 text-[9px] font-bold rounded-xl transition-all uppercase tracking-wider text-center ${
                      labMode === 'matchmaker'
                        ? 'bg-[#4B5320] text-white shadow-xs'
                        : 'text-[#4B5320] hover:bg-[#F5F1E6]'
                    }`}
                  >
                    Matchmaker
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLabMode('substitution'); setSubstituteResult(null); }}
                    id="mode_substitution_btn"
                    className={`py-2 px-0.5 text-[9px] font-bold rounded-xl transition-all uppercase tracking-wider text-center ${
                      labMode === 'substitution'
                        ? 'bg-[#4B5320] text-white shadow-xs'
                        : 'text-[#4B5320] hover:bg-[#F5F1E6]'
                    }`}
                  >
                    Substitutes
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLabMode('dupe'); setDupeResult(null); }}
                    id="mode_dupe_btn"
                    className={`py-2 px-0.5 text-[9px] font-bold rounded-xl transition-all uppercase tracking-wider text-center ${
                      labMode === 'dupe'
                        ? 'bg-[#4B5320] text-white shadow-xs'
                        : 'text-[#4B5320] hover:bg-[#F5F1E6]'
                    }`}
                  >
                    Dupes
                  </button>
                </div>

                {/* MODE A: Target product recreator formulary */}
                {labMode === 'recreate' && (
                  <form onSubmit={handleTriggerFormulator} className="space-y-5" id="formform_recreate">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase text-[#4B5320]">
                        1. Target Non-Toxic Product
                      </label>
                      <input 
                        type="text"
                        required
                        value={targetProduct}
                        onChange={(e) => setTargetProduct(e.target.value)}
                        placeholder="e.g., Lavender Baby Shampoo, Rust Dissolving paste"
                        className="w-full px-4 py-2.5 text-xs bg-[#F5F1E6]/20 border border-[#E6E2D3] rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#4B5320] text-gray-950 placeholder:text-gray-400 font-medium"
                      />
                      <p className="text-[10px] text-gray-400 italic">
                        Be as specific as you like, or suggest safety constraints!
                      </p>
                    </div>

                    {/* Pantry select indicators */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase text-[#4B5320] flex justify-between">
                        <span>2. Ingredients Cabin Pantry (Select Owned)</span>
                        <span className="text-[10px] text-[#4B5320] font-normal font-mono">
                          {selectedCabinIngredients.length} selected
                        </span>
                      </label>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-1">
                        {CABIN_INGREDIENTS.map((ing) => {
                          const active = selectedCabinIngredients.includes(ing);
                          return (
                            <div
                              key={ing}
                              onClick={() => handleToggleCabinIngredient(ing)}
                              className={`flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transitioning-all duration-150 ${
                                active 
                                  ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950' 
                                  : 'bg-gray-50 border-gray-100 hover:border-gray-200 text-gray-700'
                              }`}
                            >
                              <input 
                                type="checkbox"
                                checked={active}
                                onChange={() => {}} // Controlled by outer div click
                                className="rounded border-gray-300 text-emerald-700 focus:ring-emerald-500 w-3 h-3 pointer-events-none"
                              />
                              <span className="text-[10px] font-medium truncate">{ing}</span>
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="flex justify-between items-center text-[10px]">
                        <button 
                          type="button"
                          onClick={() => setSelectedCabinIngredients([...CABIN_INGREDIENTS])}
                          className="text-gray-500 hover:text-gray-800 underline font-semibold"
                        >
                          Select All
                        </button>
                        <button 
                          type="button"
                          onClick={() => setSelectedCabinIngredients([])}
                          className="text-gray-500 hover:text-gray-800 underline font-semibold"
                        >
                          Clear Selection
                        </button>
                      </div>
                    </div>

                    {/* Special requests/extra details */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase text-[#4B5320]">
                        3. Formulation Constraints & Extra Notes (Optional)
                      </label>
                      <textarea
                        value={extraNotes}
                        onChange={(e) => setExtraNotes(e.target.value)}
                        placeholder="e.g. Ensure it is safe for cats, I have extremely dry skin, or make it extra citrus scented..."
                        className="w-full px-4 py-2.5 text-xs bg-[#F5F1E6]/20 border border-[#E6E2D3] rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#4B5320] text-gray-950 placeholder:text-gray-400 font-medium"
                        rows={2}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={formulating}
                      id="submit_formulate_btn"
                      className="w-full bg-[#4B5320] text-[#F5F1E6] hover:bg-[#3D441A] disabled:bg-gray-200 disabled:text-gray-400 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      {formulating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-[#F5F1E6]/50" />
                          <span>Formulating clean mixture...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-[#F5F1E6]" />
                          <span>Initiate Clean Synthesis</span>
                        </>
                      )}
                    </button>

                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-[11px] text-gray-500 leading-relaxed font-medium">
                      🔍 <strong>AI Engine:</strong> Custom Goals trigger <code>gemini-3.5-flash</code> to reconstruct organic formulas matching target name parameters precisely.
                    </div>
                  </form>
                )}

                {/* MODE B: Pantry Matchmaker formulation matching */}
                {labMode === 'matchmaker' && (
                  <div className="space-y-5" id="formform_matchmaker">
                    {/* Cabin Selector */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase text-[#4B5320] flex justify-between">
                        <span>1. Cabin Pantry Ingredients (Check Owned)</span>
                        <span className="text-[10px] text-[#4B5320] font-normal font-mono">
                          {selectedCabinIngredients.length} checked
                        </span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1">
                        {CABIN_INGREDIENTS.map((ing) => {
                          const active = selectedCabinIngredients.includes(ing);
                          return (
                            <div
                              key={ing}
                              onClick={() => handleToggleCabinIngredient(ing)}
                              className={`flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transitioning-all duration-150 ${
                                active 
                                  ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950' 
                                  : 'bg-gray-50 border-gray-100 hover:border-gray-200 text-gray-700'
                              }`}
                            >
                              <input 
                                type="checkbox"
                                checked={active}
                                onChange={() => {}} 
                                className="rounded border-gray-300 text-emerald-700 focus:ring-emerald-500 w-3 h-3 pointer-events-none"
                              />
                              <span className="text-[10px] font-medium truncate">{ing}</span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex justify-between items-center text-[10px] border-b border-gray-100 pb-2">
                        <button 
                          type="button"
                          onClick={() => setSelectedCabinIngredients([...CABIN_INGREDIENTS])}
                          className="text-gray-500 hover:text-gray-800 underline font-semibold"
                        >
                          Select All Checkbox
                        </button>
                        <button 
                          type="button"
                          onClick={() => setSelectedCabinIngredients([])}
                          className="text-gray-500 hover:text-gray-800 underline font-semibold"
                        >
                          Reset Checkbox
                        </button>
                      </div>
                    </div>

                    {/* Custom Input addition array */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase text-[#4B5320]">
                        2. Type & Add Other Household Elements
                      </label>
                      <form onSubmit={handleAddCustomIngredient} className="flex gap-2">
                        <input 
                          type="text"
                          placeholder="e.g. Baking soda brand, Orange peel, Rosewater..."
                          value={customIngInput}
                          onChange={(e) => setCustomIngInput(e.target.value)}
                          className="flex-1 px-4 py-2 text-xs bg-[#F5F1E6]/20 border border-[#E6E2D3] rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#4B5320] text-gray-950 placeholder:text-gray-400 font-medium"
                        />
                        <button 
                          type="submit"
                          id="add_custom_ing_btn"
                          className="px-4 py-2 bg-[#4B5320] text-[#F5F1E6] hover:bg-[#3D441A] rounded-xl text-xs font-bold uppercase transition-colors shrink-0"
                        >
                          Add Item
                        </button>
                      </form>

                      {/* Display added items array as beautiful pills */}
                      {customIngredients.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1.5 max-h-[110px] overflow-y-auto pr-1">
                          {customIngredients.map(item => (
                            <span key={item} className="inline-flex items-center gap-1.5 bg-[#FAF7F0] text-[#4B5320] text-[9px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-lg border border-[#E6E2D3]">
                              {item}
                              <button 
                                type="button" 
                                onClick={() => handleRemoveCustomIngredient(item)} 
                                className="hover:text-rose-600 font-bold transition-colors"
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Launch Analysis Button */}
                    <button
                      type="button"
                      onClick={handleTriggerMatchmaker}
                      disabled={matchmaking}
                      id="trigger_matchmaker_btn"
                      className="w-full bg-[#4B5320] text-[#F5F1E6] hover:bg-[#3D441A] disabled:bg-gray-200 disabled:text-gray-400 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      {matchmaking ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-[#F5F1E6]/50" />
                          <span>Searching recipe options...</span>
                        </>
                      ) : (
                        <>
                          <Compass className="w-4 h-4 text-[#F5F1E6]" />
                          <span>Search Eligible Recipes</span>
                        </>
                      )}
                    </button>

                    <div className="bg-amber-50/50 p-3.5 rounded-xl border border-amber-100 text-[11px] text-amber-900 leading-relaxed font-semibold">
                      💡 <strong>Exclusive Match Mandate:</strong> Matchmaker builds standard beauty/household remedies strictly bounded to items selected above. It alerts you if preservatives or binder binders are missing.
                    </div>
                  </div>
                )}

                {/* MODE C: Substitution Engine form */}
                {labMode === 'substitution' && (
                  <form onSubmit={handleTriggerSubstitution} className="space-y-5" id="formform_substitution">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase text-[#4B5320]">
                        1. Target Recipe or Formula Name
                      </label>
                      <input 
                        type="text"
                        required
                        value={targetRecipeForSub}
                        onChange={(e) => setTargetRecipeForSub(e.target.value)}
                        placeholder="e.g., Lavender Lip Balm, Hair Moist Conditioner"
                        className="w-full px-4 py-2.5 text-xs bg-[#F5F1E6]/20 border border-[#E6E2D3] rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#4B5320] text-gray-950 placeholder:text-gray-400 font-medium"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase text-[#4B5320]">
                        2. Specific Missing Ingredient
                      </label>
                      <input 
                        type="text"
                        required
                        value={missingIngredientForSub}
                        onChange={(e) => setMissingIngredientForSub(e.target.value)}
                        placeholder="e.g., Coconut oil, Beeswax, Aloe vera gel"
                        className="w-full px-4 py-2.5 text-xs bg-[#F5F1E6]/20 border border-[#E6E2D3] rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#4B5320] text-gray-950 placeholder:text-gray-400 font-medium"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase text-[#4B5320]">
                        3. Skin or Hair Type Profile
                      </label>
                      <select
                        value={userProfileForSub}
                        onChange={(e) => setUserProfileForSub(e.target.value)}
                        className="w-full px-4 py-2.5 text-xs bg-[#F5F1E6]/20 border border-[#E6E2D3] rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#4B5320] text-gray-950 font-medium animate-fadeIn"
                      >
                        <option value="Oily & Acne-Prone Skin">Oily & Acne-Prone Skin</option>
                        <option value="Dry & Sensitive Skin">Dry & Sensitive Skin</option>
                        <option value="Eczema-Prone / Highly Reactive Skin">Eczema-Prone / Highly Reactive Skin</option>
                        <option value="Curly & Frizzy Hair">Curly & Frizzy Hair</option>
                        <option value="Fine / Thin / Fragile Hair">Fine / Thin / Fragile Hair</option>
                        <option value="Normal / Balanced Skin Profile">Normal / Balanced Skin Profile</option>
                      </select>
                      
                      <p className="text-[10px] text-gray-400 italic">
                        Evaluation matches alternatives with perfect dermal compatibility and minimal comedogenicity.
                      </p>
                    </div>

                    {/* Launch Substitution Button */}
                    <button
                      type="submit"
                      disabled={submittingSub}
                      id="trigger_substitution_btn"
                      className="w-full bg-[#4B5320] text-[#F5F1E6] hover:bg-[#3D441A] disabled:bg-gray-200 disabled:text-gray-400 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      {submittingSub ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-[#F5F1E6]/50" />
                          <span>Searching substitutes...</span>
                        </>
                      ) : (
                        <>
                          <ArrowRightLeft className="w-4 h-4 text-[#F5F1E6]" />
                          <span>Suggest Safe Substitutes</span>
                        </>
                      )}
                    </button>

                    <div className="bg-[#FAF7F0] p-3 rounded-xl border border-gray-150 text-[11px] text-[#4B5320] leading-relaxed font-semibold">
                      🌿 <strong>Comedogenic Protective Shield:</strong> Substitutions automatically down-rank any options that clog pores or trigger reactions depending on skin attributes.
                    </div>
                  </form>
                )}

                {/* MODE D: Reverse Engineering Dupe form */}
                {labMode === 'dupe' && (
                  <form onSubmit={handleTriggerDupe} className="space-y-5" id="formform_dupe">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase text-[#4B5320]">
                        1. Store-Bought Product Target
                      </label>
                      <input 
                        type="text"
                        required
                        value={commercialProductForDupe}
                        onChange={(e) => setCommercialProductForDupe(e.target.value)}
                        placeholder="e.g., Neutrogena Hydro Boost, Dawn Dish Soap, Estée Lauder Advanced Night Repair"
                        className="w-full px-4 py-2.5 text-xs bg-[#F5F1E6]/20 border border-[#E6E2D3] rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#4B5320] text-gray-950 placeholder:text-gray-400 font-medium"
                      />
                      <p className="text-[10px] text-gray-400 italic">
                        Input any skincare, hair care, washing, or cleaning product to craft a kitchen alternative.
                      </p>
                    </div>

                    {/* Launch Dupe Button */}
                    <button
                      type="submit"
                      disabled={submittingDupe}
                      id="trigger_dupe_btn"
                      className="w-full bg-[#4B5320] text-[#F5F1E6] hover:bg-[#3D441A] disabled:bg-gray-200 disabled:text-gray-400 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      {submittingDupe ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-[#F5F1E6]/50" />
                          <span>Reverse-engineering...</span>
                        </>
                      ) : (
                        <>
                          <ArrowRightLeft className="w-4 h-4 text-[#F5F1E6]" />
                          <span>Generate Natural Dupe</span>
                        </>
                      )}
                    </button>

                    <div className="bg-[#FAF7F0] p-3 rounded-xl border border-gray-150 text-[11px] text-[#4B5320] leading-relaxed font-semibold">
                      🧪 <strong>Active-Ingredient Mimicking:</strong> Evaluates commercial chemical benefits and pairs them up with safe kitchen or garden analogs (like replacing Hyaluronic Acid with Glycerin and Aloe Vera).
                    </div>
                  </form>
                )}
              </div>

              {/* Formulator/Matchmaker Results (Right Column) */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#E6E2D3] shadow-sm min-h-[440px] flex flex-col justify-between">
                
                {/* 1. Mode A: Recreate Loading States */}
                {labMode === 'recreate' && formulating && (
                  <div id="loading_formulate_status" className="flex-1 flex flex-col items-center justify-center space-y-4 text-center py-16">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full border-4 border-dashed border-emerald-600 animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Leaf className="w-6 h-6 text-emerald-700 animate-pulse" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-gray-950">Synthesizing Chemical Breakdown...</p>
                      <p className="text-xs text-gray-500 max-w-xs">
                        Converting your request to safe, biodegradable molecular compounds using <code>gemini-3.5-flash</code>.
                      </p>
                    </div>
                  </div>
                )}

                {/* 1. Mode A: Recreate Error States */}
                {labMode === 'recreate' && formulationError && (
                  <div className="flex-1 flex flex-col items-center justify-center py-12 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-150">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-gray-900">Synthesis Encountered an Issue</h4>
                      <p className="text-xs text-red-700 max-w-md leading-relaxed">
                        {formulationError}
                      </p>
                    </div>
                    <button 
                      onClick={() => setFormulationError(null)}
                      className="bg-gray-100 hover:bg-gray-200 text-xs px-4 py-2 rounded-lg font-bold"
                    >
                      Acknowledge & Try Again
                    </button>
                  </div>
                )}

                {/* 1. Mode A: Recreate Placeholder State */}
                {labMode === 'recreate' && !formulating && !formulationError && !formulatedRecipe && (
                  <div className="flex-1 flex flex-col items-center justify-center py-16 text-center space-y-5">
                    <div className="w-20 h-20 bg-[#F5F1E6] rounded-full flex items-center justify-center text-gray-400">
                      <Compass className="w-10 h-10 text-[#4B5320]/75" />
                    </div>
                    <div className="space-y-1.5 max-w-md">
                      <h4 className="text-base font-serif italic font-bold text-gray-900">
                        Synthesis Result Awaiting Trigger
                      </h4>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Enter your desired output goal or product on the left, and check what items you have on hand to test. The custom recipe will appear here in detailed beauty.
                      </p>
                    </div>

                    {/* Fun suggestion tags */}
                    <div className="pt-2">
                      <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2.5">
                        Try these popular ideas:
                      </div>
                      <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                        {[
                          "Non-Toxic Cat Ant-Repellent Spray",
                          "Organic Eucalyptus Beard Balm",
                          "Citrus Shower Glass Scum Remover",
                          "Active Charcoal Shoe Odor absorbers",
                          "Zero-chemical Liquid Dish Soap"
                        ].map((idea, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setTargetProduct(idea);
                              // Auto pre-populate some useful pantry items
                              setSelectedCabinIngredients(["Baking Soda (Sodium Bicarbonate)", "White Vinegar (Acetic Acid)", "Liquid Castile Soap", "Tea Tree Essential Oil", "Distilled Water"]);
                            }}
                            className="text-[10px] bg-gray-50 hover:bg-[#F5F1E6] border border-gray-100 py-1.5 px-3 rounded-lg text-gray-600 font-medium"
                          >
                            {idea}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 1. Mode A: Recreate Recipe Presenter Panel */}
                {labMode === 'recreate' && !formulating && !formulationError && formulatedRecipe && (
                  <div id="recipe_outcome_panel" className="flex-1 space-y-6 animate-fadeIn">
                    
                    <div className="flex justify-between items-start flex-wrap gap-3 border-b border-gray-100 pb-4">
                      <div>
                        <span className="text-[10px] uppercase bg-green-50 text-green-800 border border-green-200 px-2.5 py-0.5 rounded font-bold font-mono">
                          Synthesis Complete in 3.5-Flash
                        </span>
                        <h3 className="text-2xl font-serif italic text-gray-900 mt-2 font-bold select-all">
                          {formulatedRecipe.title}
                        </h3>
                        <p className="text-xs text-[#4B5320] font-semibold">
                          Replaced Item: <span className="line-through text-red-500">{formulatedRecipe.retailCostCost}</span> • Make cost: <strong className="text-emerald-700">{formulatedRecipe.costEstimate}</strong>
                        </p>
                      </div>

                      {/* Action to book with master list */}
                      <button
                        onClick={handleSaveFormulatedRecipe}
                        id="save_formulation_to_collection_btn"
                        className="bg-[#4B5320] text-white hover:bg-[#3D441A] px-4 py-2.5 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all shadow-xs flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Save to Collection</span>
                      </button>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed italic">
                      "{formulatedRecipe.description}"
                    </p>

                    {/* Ingredients List */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500">
                        Ingredients Quantities Formulated
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {formulatedRecipe.ingredients.map((ing, i) => (
                          <div key={i} className="bg-gray-50 border border-gray-100 p-2.5 rounded-lg text-xs flex justify-between items-center">
                            <span className="font-semibold text-gray-800">{ing.name}</span>
                            <span className="bg-[#F5F1E6] text-[#4B5320] px-2 py-0.5 rounded text-[10px] font-mono">{ing.amount}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Step guidance */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-[#4B5320]">
                        Formulation Instructions
                      </h4>
                      <div className="space-y-2.5">
                        {formulatedRecipe.instructions.map((inst, i) => (
                          <div key={i} className="flex space-x-2 text-xs leading-relaxed text-gray-700">
                            <span className="bg-[#F5F1E6] text-[#4B5320] w-4 h-4 rounded-full flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">
                              {i+1}
                            </span>
                            <p>{inst}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Safety Footing */}
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
                        ⚠️ Organic Chemistry Safety Notice
                      </span>
                      <p className="text-[11px] leading-relaxed text-amber-950">
                        {formulatedRecipe.safetyNote}
                      </p>
                    </div>

                    {/* Micro information row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs select-all">
                      <div>
                        <strong className="text-gray-900 block font-bold mb-1">Estimated Shelf Life:</strong>
                        <span className="text-gray-600">{formulatedRecipe.shelfLife}</span>
                      </div>
                      <div>
                        <strong className="text-gray-900 block font-bold mb-1">Toxins avoided of industrial origin:</strong>
                        <span className="text-rose-700 font-medium">{formulatedRecipe.chemicalsAvoided.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                )}


                {/* 2. Mode B: Matchmaker Loading States */}
                {labMode === 'matchmaker' && matchmaking && (
                  <div id="loading_matchmaker_status" className="flex-1 flex flex-col items-center justify-center space-y-4 text-center py-16">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full border-4 border-dashed border-[#4B5320] animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Atom className="w-6 h-6 text-[#4B5320] animate-pulse" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-gray-950">Aligning Compound Matrices...</p>
                      <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                        Cross-referencing selected raw ingredients to locate premium recipes using only items on hand via <code>gemini-3.5-flash</code>.
                      </p>
                    </div>
                  </div>
                )}

                {/* 2. Mode B: Matchmaker Error State */}
                {labMode === 'matchmaker' && matchmakerError && (
                  <div className="flex-1 flex flex-col items-center justify-center py-12 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-150">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-gray-900">Analysis Alignment Refined</h4>
                      <p className="text-xs text-red-700 max-w-md leading-relaxed">
                        {matchmakerError}
                      </p>
                    </div>
                    <button 
                      onClick={() => setMatchmakerError(null)}
                      className="bg-gray-100 hover:bg-gray-200 text-xs px-4 py-2 rounded-lg font-bold"
                    >
                      Acknowledge & Retry
                    </button>
                  </div>
                )}

                {/* 2. Mode B: Matchmaker Placeholder Setup */}
                {labMode === 'matchmaker' && !matchmaking && !matchmakerError && !matchmakerResult && (
                  <div className="flex-1 flex flex-col items-center justify-center py-16 text-center space-y-5">
                    <div className="w-20 h-20 bg-[#F5F1E6] rounded-full flex items-center justify-center text-gray-400">
                      <Atom className="w-10 h-10 text-[#4B5320]/75" />
                    </div>
                    <div className="space-y-1.5 max-w-md">
                      <h4 className="text-base font-serif italic font-bold text-gray-900">
                        Formula Match Center
                      </h4>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Mark checkbox pantry items or type custom ones on the left, then click <strong>Search Eligible Recipes</strong>. Our AI organic system will discover what professional products you can craft right now with zero leftover residue.
                      </p>
                    </div>

                    <div className="pt-2">
                      <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">
                        Dynamic suggestions:
                      </div>
                      <div className="flex flex-wrap gap-2 justify-center max-w-md">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCabinIngredients(["White Vinegar (Acetic Acid)", "Citric Acid Powder", "Distilled Water"]);
                            setCustomIngredients(["Orange peels"]);
                          }}
                          className="text-[10px] bg-gray-50 hover:bg-[#F5F1E6] border border-gray-100 py-1 px-2.5 rounded-lg text-gray-650 font-medium"
                        >
                          Scale Cleanser (Vinegar + Orange)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCabinIngredients(["Liquid Castile Soap", "Aloe Vera Gel", "Distilled Water", "Lavender Essential Oil"]);
                            setCustomIngredients([]);
                          }}
                          className="text-[10px] bg-gray-50 hover:bg-[#F5F1E6] border border-gray-100 py-1 px-2.5 rounded-lg text-gray-650 font-medium"
                        >
                          Delicate Wash (Castile Soap + Lavender)
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Mode B: Matchmaker Recipe Results Premium Design Block */}
                {labMode === 'matchmaker' && !matchmaking && !matchmakerError && matchmakerResult && (
                  <div id="cabin_matchmaker_panel" className="flex-1 space-y-6 animate-fadeIn">
                    
                    {/* Header bar and badge elements */}
                    <div className="border-b border-gray-100 pb-4 space-y-3">
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <span className="text-[10px] uppercase bg-[#FAF7F0] text-[#4B5320] border border-[#E6E2D3] px-2.5 py-0.5 rounded-md font-bold font-mono">
                          Category: {matchmakerResult.category || "Personal Care"}
                        </span>
                        
                        {/* Status Checker Badging */}
                        {matchmakerResult.can_make_now ? (
                          <span className="text-[10px] uppercase bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-md font-bold flex items-center gap-1 font-mono">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Can Make Now ✅
                          </span>
                        ) : (
                          <span className="text-[10px] uppercase bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-md font-bold flex items-center gap-1 font-mono">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Binder Missing ⚠️
                          </span>
                        )}
                      </div>

                      <h3 className="text-2xl font-serif italic text-gray-900 font-bold select-all">
                        {matchmakerResult.product_name}
                      </h3>
                      
                      {matchmakerResult.can_make_now ? (
                        <p className="text-xs text-emerald-800 font-normal leading-relaxed bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                          🎉 <strong>Ready to blend:</strong> You have all required primary agents on hand to formulate a professional batch of this recipe!
                        </p>
                      ) : (
                        <p className="text-xs text-amber-900 font-normal leading-relaxed bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                          ⚠️ <strong>Essential Binder/Preservative Missing:</strong> While the base elements line up, you need to acquire the essential stabilizer listed below to construct a stable commercial-weight formulation.
                        </p>
                      )}
                    </div>

                    {/* 1. Ingredients in Pantry Used */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-[#4B5320]">
                        Matching Ingredients Used ({matchmakerResult.matching_ingredients_used?.length || 0})
                      </h4>
                      <div className="flex flex-wrap gap-1.5 select-all">
                        {matchmakerResult.matching_ingredients_used?.map((ing: string, i: number) => (
                          <span key={i} className="text-[10px] font-bold uppercase tracking-wide bg-emerald-50 text-emerald-900 px-2.5 py-1 rounded-lg border border-emerald-150 flex items-center gap-1 pr-3">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                            {ing}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* 2. Additions / Binders alerts */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500">
                        {matchmakerResult.can_make_now 
                          ? "Optional Enhancements & Preservation Upgrades" 
                          : "Essential Binders, Preservatives or Enhancers You Need to Get"
                        }
                      </h4>
                      {matchmakerResult.missing_optional_additions && matchmakerResult.missing_optional_additions.length > 0 ? (
                        <div className={`p-4 rounded-xl border text-xs space-y-2 ${
                          matchmakerResult.can_make_now 
                            ? 'bg-blue-50/50 border-blue-100 text-blue-950' 
                            : 'bg-rose-50 border-rose-100 text-rose-950'
                        }`}>
                          <ul className="list-disc list-inside space-y-1 font-semibold select-all">
                            {matchmakerResult.missing_optional_additions.map((add: string, i: number) => (
                              <li key={i} className="leading-relaxed font-bold">{add}</li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 leading-relaxed font-medium bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                          No missing ingredients - your pantry alignment is pristine and optimized!
                        </p>
                      )}
                    </div>

                    {/* 3. Steps Sequential workflow */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-[#4B5320]">
                        Step-by-Step Laboratory Workflow Instructions
                      </h4>
                      <div className="space-y-2.5 select-all">
                        {matchmakerResult.brief_instructions?.map((step: string, i: number) => (
                          <div key={i} className="flex space-x-3 text-xs leading-relaxed text-gray-700">
                            <span className="bg-[#4B5320] text-[#F5F1E6] w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5 shadow-xs">
                              {i + 1}
                            </span>
                            <p className="font-medium pt-0.5">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Save to library helper */}
                    <div className="pt-3 border-t border-gray-100 flex justify-end">
                      <button
                        onClick={() => {
                          // Format Matchmaker outcome into standard Recipe object to save to local library list
                          const formattedRecipe: Recipe = {
                            id: "custom-" + Date.now(),
                            title: matchmakerResult.product_name,
                            category: (matchmakerResult.category?.toLowerCase() === 'beauty' || matchmakerResult.category?.toLowerCase() === 'cleaning' || matchmakerResult.category?.toLowerCase() === 'household' || matchmakerResult.category?.toLowerCase() === 'health' || matchmakerResult.category?.toLowerCase() === 'personal_care')
                              ? matchmakerResult.category?.toLowerCase() as CategoryType
                              : 'personal_care',
                            description: `Pantry aligned formula utilizing: ${matchmakerResult.matching_ingredients_used?.join(', ')}. Can make now: ${matchmakerResult.can_make_now ? 'Yes' : 'No'} (${matchmakerResult.missing_optional_additions?.join(', ') || 'No missing items'}).`,
                            prepTime: "15 mins",
                            difficulty: "easy",
                            costEstimate: "$1.20 per batch",
                            retailCostCost: "$12.00 commercial value",
                            chemicalsAvoided: ["Synthetic Sulfates", "Parabens", "PEG Compounds", "Fragrance Phthalates"],
                            ingredients: [
                              ...matchmakerResult.matching_ingredients_used?.map((name: string) => ({ name, amount: "As desired", optional: false })) || [],
                              ...matchmakerResult.missing_optional_additions?.map((name: string) => ({ name, amount: "Need to acquire", optional: true })) || []
                            ],
                            instructions: matchmakerResult.brief_instructions || [],
                            safetyNote: "Ensure custom raw batches are stored in cool glass vessels to maximize zero-synthetic life boundaries.",
                            shelfLife: "3 months in dynamic container.",
                            tips: ["Re-test patch skin for general biological sensitivity before full coverage.", "Keep stored out of direct warm midday sunlight."],
                            isCustom: true
                          };
                          
                          setFormulatedRecipe(formattedRecipe);
                          handleSaveFormulatedRecipe();
                        }}
                        className="bg-[#4B5320] text-white hover:bg-[#3D441A] px-4 py-2 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all shadow-xs flex items-center gap-1.5"
                      >
                        <FolderPlus className="w-4 h-4" />
                        <span>Save Matched Recipe to Library</span>
                      </button>
                    </div>

                  </div>
                )}


                {/* 3. Mode C: Substitution Loading States */}
                {labMode === 'substitution' && submittingSub && (
                  <div id="loading_substitution_status" className="flex-1 flex flex-col items-center justify-center space-y-4 text-center py-16">
                    <div className="relative animate-fadeIn">
                      <div className="w-16 h-16 rounded-full border-4 border-dashed border-[#4B5320] animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ArrowRightLeft className="w-6 h-6 text-[#4B5320] animate-pulse" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-gray-950">Analyzing Comedogenic Profiles...</p>
                      <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                        Evaluating household alternatives against the user's hair and skin attributes to prevent irritation or clogged pores using <code>gemini-3.5-flash</code>.
                      </p>
                    </div>
                  </div>
                )}

                {/* 3. Mode C: Substitution Error State */}
                {labMode === 'substitution' && substituteError && (
                  <div className="flex-1 flex flex-col items-center justify-center py-12 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-150">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-gray-900">Evaluation Disrupted</h4>
                      <p className="text-xs text-red-700 max-w-md leading-relaxed">
                        {substituteError}
                      </p>
                    </div>
                    <button 
                      onClick={() => setSubstituteError(null)}
                      className="bg-gray-100 hover:bg-gray-200 text-xs px-4 py-2 rounded-lg font-bold"
                    >
                      Acknowledge & Retry
                    </button>
                  </div>
                )}

                {/* 3. Mode C: Substitution Placeholder State */}
                {labMode === 'substitution' && !submittingSub && !substituteError && !substituteResult && (
                  <div className="flex-1 flex flex-col items-center justify-center py-16 text-center space-y-5">
                    <div className="w-20 h-20 bg-[#F5F1E6] rounded-full flex items-center justify-center text-gray-450">
                      <ArrowRightLeft className="w-10 h-10 text-[#4B5320]/75" />
                    </div>
                    <div className="space-y-1.5 max-w-md animate-fadeIn">
                      <h4 className="text-base font-serif italic font-bold text-gray-900">
                        Amalgama Substitution Guard
                      </h4>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Don't let a missing ingredient pause your organic crafting! Feed us your target recipe and the unavailable item on the left.
                      </p>
                      <p className="text-xs text-gray-550 leading-relaxed font-semibold bg-emerald-50/20 text-[#4B5320] p-2.5 rounded-xl border border-emerald-100">
                        ⚡ Out-of-the-box support for dermally sensitive skin profile evaluations (such as preventing severe breakouts when swapping oils).
                      </p>
                    </div>
                  </div>
                )}

                {/* 3. Mode C: Substitution Result display block */}
                {labMode === 'substitution' && !submittingSub && !substituteError && substituteResult && (
                  <div id="substitution_results_panel" className="flex-1 space-y-6 animate-fadeIn">
                    
                    <div className="border-b border-gray-100 pb-4 space-y-2">
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <span className="text-[10px] uppercase bg-amber-55/10 text-amber-900 border border-amber-250/30 px-2.5 py-0.5 rounded-md font-bold font-mono">
                          Missing: {substituteResult.original_ingredient}
                        </span>
                        
                        <span className="text-[10px] uppercase bg-[#FAF7F0] text-[#4B5320] border border-[#E6E2D3] px-2.5 py-0.5 rounded-md font-bold font-mono">
                          Target Profile: {userProfileForSub}
                        </span>
                      </div>

                      <h3 className="text-2xl font-serif italic text-gray-900 font-bold">
                        Smart Substitutes Recycled
                      </h3>
                      <p className="text-xs text-gray-650 leading-relaxed">
                        Based on your target recipe <strong className="text-gray-900">"{targetRecipeForSub}"</strong>, these organic alternatives will replace the chemical properties without triggering dermal stress.
                      </p>
                    </div>

                    {/* Loop through recommend substitutes array */}
                    <div className="space-y-4">
                      {substituteResult.recommended_substitutes?.map((sub: any, i: number) => (
                        <div key={i} className="bg-[#FAF7F0]/60 p-4 rounded-2xl border border-[#E6E2D3] space-y-2 select-all hover:bg-[#FAF7F0] transition-colors">
                          <div className="flex justify-between items-start flex-wrap gap-2">
                            <span className="font-serif italic font-bold text-[#4B5320] text-sm flex items-center gap-1.5">
                              <span className="w-6 h-6 rounded-full bg-[#4B5320] text-[#F5F1E6] text-[11px] font-bold font-mono flex items-center justify-center shrink-0">
                                {i + 1}
                              </span>
                              {sub.name}
                            </span>
                            
                            <span className="text-[10px] bg-[#4B5320]/10 text-[#4B5320] border border-[#4B5320]/20 font-bold tracking-wide px-2.5 py-0.5 rounded-lg font-mono">
                              {sub.suitability_rating}
                            </span>
                          </div>

                          <p className="text-xs text-gray-700 leading-relaxed pl-7 font-medium">
                            {sub.why_it_works}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100 text-[11px] text-emerald-950 leading-relaxed">
                      💡 <strong>Dermatological Clean Standard:</strong> These substitutes have been matched for biological safekeeping. Always execute a 24-hr patch test on your wrist before major skin coverage!
                    </div>
                  </div>
                )}

                {/* 4. Mode D: Dupe Loading States */}
                {labMode === 'dupe' && submittingDupe && (
                  <div id="loading_dupe_status" className="flex-1 flex flex-col items-center justify-center space-y-4 text-center py-16">
                    <div className="relative animate-fadeIn">
                      <div className="w-16 h-16 rounded-full border-4 border-dashed border-[#4B5320] animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ArrowRightLeft className="w-6 h-6 text-[#4B5320] animate-pulse" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-gray-950">Reverse Engineering Product...</p>
                      <p className="text-xs text-gray-550 max-w-xs leading-relaxed">
                        Deconstructing active chemical structures and matching them with natural, garden, or kitchen analogs using <code>gemini-3.5-flash</code>.
                      </p>
                    </div>
                  </div>
                )}

                {/* 4. Mode D: Dupe Error State */}
                {labMode === 'dupe' && dupeError && (
                  <div className="flex-1 flex flex-col items-center justify-center py-12 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-150">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-gray-900">Deconstruction Aborted</h4>
                      <p className="text-xs text-red-700 max-w-md leading-relaxed">
                        {dupeError}
                      </p>
                    </div>
                    <button 
                      onClick={() => setDupeError(null)}
                      className="bg-gray-100 hover:bg-gray-200 text-xs px-4 py-2 rounded-lg font-bold"
                    >
                      Acknowledge & Retry
                    </button>
                  </div>
                )}

                {/* 4. Mode D: Dupe Placeholder State */}
                {labMode === 'dupe' && !submittingDupe && !dupeError && !dupeResult && (
                  <div className="flex-1 flex flex-col items-center justify-center py-16 text-center space-y-5">
                    <div className="w-20 h-20 bg-[#F5F1E6] rounded-full flex items-center justify-center text-gray-450">
                      <Sparkles className="w-10 h-10 text-[#4B5320]/75" />
                    </div>
                    <div className="space-y-1.5 max-w-md animate-fadeIn">
                      <h4 className="text-base font-serif italic font-bold text-gray-900">
                        Amalgama Dupe Engine
                      </h4>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Unveil the active complexes behind commercial luxury brands and synthesize a non-toxic household replica! Feed us your target item on the left.
                      </p>
                      <p className="text-xs text-[#4B5320] leading-relaxed font-semibold bg-[#F5F1E6]/60 p-2.5 rounded-xl border border-[#E6E2D3]">
                        ⚡ Create natural alternatives to famous products like Clinique, Neutrogena, Tide, Dawn, or organic luxury moisturisers.
                      </p>
                    </div>
                  </div>
                )}

                {/* 4. Mode D: Dupe Result display block */}
                {labMode === 'dupe' && !submittingDupe && !dupeError && dupeResult && (
                  <div id="dupe_results_panel" className="flex-1 space-y-6 animate-fadeIn">
                    
                    <div className="border-b border-gray-100 pb-4 space-y-3">
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <span className="text-[10px] uppercase bg-amber-55/10 text-amber-900 border border-amber-250/30 px-2.5 py-0.5 rounded-md font-bold font-mono">
                          Target: {dupeResult.commercial_target}
                        </span>
                        
                        <span className="text-[10px] uppercase bg-green-55/10 text-emerald-900 border border-emerald-250/20 px-2.5 py-0.5 rounded-md font-bold font-mono">
                          100% Natural Dupe Alternative
                        </span>
                      </div>

                      <h3 className="text-2xl font-serif italic text-gray-900 font-bold">
                        {dupeResult.natural_dupe_name}
                      </h3>
                      
                      <div className="bg-[#FAF7F0] p-4 rounded-xl border border-[#000000]/5 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-[#4B5320] block font-mono">
                          🧪 Active-Ingredient Mimicry Formula:
                        </span>
                        <p className="text-xs text-[#4B5320] font-medium leading-relaxed">
                          {dupeResult.commercial_active_mimicked}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left: Ingredients */}
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold uppercase text-[#4B5320] block tracking-wide">
                          Needed raw ingredients:
                        </span>
                        <ul className="space-y-1.5">
                          {dupeResult.ingredients?.map((ing: any, i: number) => (
                            <li key={i} className="text-xs text-gray-700 flex justify-between py-1 border-b border-gray-100/60 font-medium">
                              <span>• {ing.name}</span>
                              <span className="font-mono text-gray-500 font-semibold">{ing.amount}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Right: Steps */}
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold uppercase text-[#4B5320] block tracking-wide">
                          Formulation instructions:
                        </span>
                        <ol className="space-y-2 text-xs text-gray-700 font-medium">
                          {dupeResult.formulation_steps?.map((step: string, i: number) => (
                            <li key={i} className="flex gap-2 leading-relaxed">
                              <span className="font-mono text-[#4B5320] font-bold">{i + 1}.</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>

                    <div className="flex justify-end pt-3 border-t border-gray-100">
                      <button
                        onClick={() => {
                          const formattedRecipe: Recipe = {
                            id: "dupe-" + Date.now(),
                            title: dupeResult.natural_dupe_name,
                            category: "beauty",
                            description: `A 100% natural homemade dupe for ${dupeResult.commercial_target}. Mimicry Strategy: ${dupeResult.commercial_active_mimicked}`,
                            prepTime: "10 mins",
                            difficulty: "easy",
                            costEstimate: "$1.50 per batch",
                            retailCostCost: "$18.00 store value",
                            chemicalsAvoided: ["Industrial Emulsifiers", "Synthetic Preservatives", "Silicones", "Artificial Colorants"],
                            ingredients: dupeResult.ingredients?.map((ing: any) => ({
                              name: ing.name,
                              amount: ing.amount,
                              optional: false
                            })) || [],
                            instructions: dupeResult.formulation_steps || [],
                            safetyNote: "Store in a sanitized glass jar or dispenser in the refrigerator to maximize shelf life of fresh ingredients.",
                            shelfLife: "2-4 weeks",
                            tips: ["Always shake well before use.", "Execute a 24-hr wrist patch test first."],
                            isCustom: true
                          };
                          
                          const updated = [...customRecipes, formattedRecipe];
                          setCustomRecipes(updated);
                          localStorage.setItem('amalgama_custom_recipes', JSON.stringify(updated));
                          alert("🎉 Success! Reverse-engineered dupe saved directly to your local library.");
                        }}
                        className="bg-[#4B5320] text-white hover:bg-[#3D441A] px-5 py-2.5 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <FolderPlus className="w-4 h-4" />
                        <span>Save Dupe to Personal Library</span>
                      </button>
                    </div>

                  </div>
                )}

              </div>

            </div>

          </div>
        )}

        {/* ======================= TAB: SAVINGS AUDIT & IMPACT TRACKER ======================= */}
        {currentTab === 'calculator' && (
          <div className="space-y-8" id="calculator_tab_content">
            
            {/* Introductory statement */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E6E2D3] [grid-template-columns:1fr] space-y-5">
              <div className="max-w-2xl space-y-1">
                <span className="text-xs font-bold text-[#4B5320] uppercase tracking-widest">
                  Financial Audit & Chemical Relief
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif italic text-gray-950">
                  Formulation Savings & Offset Calculator
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Natural formulations are not just safer to carry around or apply to your body; they cost as much as <strong>90% less</strong> than premium synthetic boutique store alternatives. Calculate your annual offset or change the batch inputs below to compute dynamic scores!
                </p>
              </div>

              {/* Multi-grid indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                <div className="bg-[#4B5320] text-white p-5 rounded-2xl border border-emerald-950/20 text-center space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-[#F5F1E6]/70">Annual DIY Budget Spent</span>
                  <p className="text-3xl font-serif italic font-bold text-white">${auditStats.spentDIY}</p>
                </div>
                <div className="bg-[#F5F1E6] text-gray-800 p-5 rounded-2xl border border-[#E6E2D3] text-center space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-gray-500">Substituted Commercial Cost</span>
                  <p className="text-3xl font-serif italic font-bold text-gray-900">${auditStats.spentRetail}</p>
                </div>
                <div className="bg-emerald-50 text-emerald-900 p-5 rounded-2xl border border-emerald-100 text-center space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-emerald-800 font-semibold">Total Cash Saved Yearly</span>
                  <p className="font-serif italic font-bold text-2xl sm:text-3xl text-emerald-700">${auditStats.savings}</p>
                </div>
                <div className="bg-rose-50 text-rose-900 p-5 rounded-2xl border border-rose-100 text-center space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-rose-800 font-semibold">Avoided Bioaccumulative Doses</span>
                  <p className="text-3xl font-serif italic font-bold text-rose-600">
                    {auditStats.batchesCount * 3} doses
                  </p>
                </div>
              </div>
            </div>

            {/* Dynamic Inputs grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column for adjusting quantities */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#E6E2D3] shadow-xs space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                    Your Household Batch Quantities (Per Year)
                  </h4>
                  <span className="text-[10px] text-gray-400">
                    Increases represent batches fabricated
                  </span>
                </div>

                <div className="space-y-4">
                  {allRecipesList.map((recipe) => {
                    const count = madeQuantities[recipe.id] || 0;
                    return (
                      <div key={recipe.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 gap-4">
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase font-bold text-[#4B5320] bg-[#F5F1E6] px-2 py-0.5 rounded flex items-center gap-1 w-fit">
                            <span>{CATEGORY_DESCRIPTIONS[recipe.category]?.icon}</span>
                            <span>{getCategoryLabel(recipe.category)}</span>
                          </span>
                          <h5 className="text-xs font-bold text-gray-950 mt-1">{recipe.title}</h5>
                          <p className="text-[10px] text-gray-400">
                            DIY: <strong>{recipe.costEstimate}</strong> vs Retail: <strong>{recipe.retailCostCost.split(' ')[0]}</strong>
                          </p>
                        </div>

                        {/* Counter adjust triggers */}
                        <div className="flex items-center space-x-3 self-end sm:self-auto">
                          <button 
                            type="button"
                            onClick={() => handleQuantityChange(recipe.id, count - 1)}
                            className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold flex items-center justify-center text-xs"
                          >
                            -
                          </button>
                          <span className="text-xs font-mono font-bold w-6 text-center">{count}</span>
                          <button 
                            type="button"
                            onClick={() => handleQuantityChange(recipe.id, count + 1)}
                            className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold flex items-center justify-center text-xs"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column showing chemical details avoided with those choices */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Micro bento tracking panel */}
                <div className="bg-[#4B5320] text-emerald-50 rounded-3xl p-6 sm:p-8 space-y-4">
                  <h4 className="text-xs font-bold uppercase text-[#F5F1E6] tracking-widest">
                    Your Synthetic Chemistry Offset
                  </h4>
                  <p className="text-xs text-[#F5F1E6]/80 leading-relaxed">
                    By making a total of <strong>{auditStats.batchesCount}</strong> organic batches in your home pantry this year, you completely bypass:
                  </p>

                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between items-center text-xs border-b border-white/10 pb-2">
                      <span>Phthalates in synthetic laundry scents</span>
                      <span className="font-bold text-emerald-300">COMPLETELY ZEROED</span>
                    </div>
                    <div className="flex justify-between items-center text-xs border-b border-white/10 pb-2">
                      <span>Sodium Lauryl Sulfate skin allergies</span>
                      <span className="font-bold text-emerald-300">PREVENTED</span>
                    </div>
                    <div className="flex justify-between items-center text-xs border-b border-white/10 pb-2">
                      <span>Triclosan and bacterial superbugs</span>
                      <span className="font-bold text-emerald-300">ELIMINATED</span>
                    </div>
                    <div className="flex justify-between items-center text-xs pb-1">
                      <span>Ethylene Oxide carcinogens in shampoo</span>
                      <span className="font-bold text-emerald-300">AVOIDED</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-300 h-full" style={{ width: `${Math.min(100, (auditStats.batchesCount * 3))}%` }}></div>
                    </div>
                    <div className="flex justify-between text-[9px] text-[#F5F1E6]/60 mt-1.5 uppercase font-mono tracking-wider">
                      <span>Toxin Burden Level</span>
                      <span>{Math.max(0, 100 - (auditStats.batchesCount * 3))}% Less exposure</span>
                    </div>
                  </div>
                </div>

                {/* Direct tips panel */}
                <div className="bg-white rounded-3xl p-6 border border-[#E6E2D3] space-y-4">
                  <h4 className="text-xs font-bold uppercase text-[#2C3314] tracking-wider">
                    How to Optimize the Sourcing of Ingredients
                  </h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    To make your DIY organic switch as cost-efficient as possible:
                  </p>

                  <div className="space-y-3 font-medium text-xs text-gray-800">
                    <div className="flex gap-2.5">
                      <span className="text-emerald-700 font-bold shrink-0">✓</span>
                      <p>Shed the marketing: Buy Baking Soda and Vinegar in giant gallons in warehouse clubs or baker supply hubs. It reduces costs by 70% compared to small spice bottles.</p>
                    </div>
                    <div className="flex gap-2.5">
                      <span className="text-emerald-700 font-bold shrink-0">✓</span>
                      <p>Invest in reusable dark amber glass spray heads and metal tins. Plastic reactive materials break down under pure citrus d-limonene over long terms.</p>
                    </div>
                    <div className="flex gap-2.5">
                      <span className="text-emerald-700 font-bold shrink-0">✓</span>
                      <p>Castile liquid soap can be diluted up to 1:4 with distilled water for hand wash dispensers, reducing soap usage volume significantly.</p>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

      </main>

      {/* Decorative Elegant Bottom Footer */}
      <footer className="mt-16 bg-white border-t border-[#E6E2D3] py-8 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-xs text-gray-500 font-medium">
          
          <div className="flex items-center space-x-2.5">
            <img 
              src="https://intelligent-cyan-fnfyqx3r.edgeone.app/logo%204.png" 
              alt="Amalgama footer logo" 
              className="h-8 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
            <span>&copy; {new Date().getFullYear()} AMALGAMA NATURAL CHEMISTRY LAB • ALL RIGHTS RESERVED</span>
          </div>

          <div className="flex flex-wrap gap-5 text-gray-400">
            <span className="hover:text-gray-900 cursor-pointer" onClick={() => setCurrentTab('recipes')}>Discover Database</span>
            <span className="hover:text-gray-900 cursor-pointer" onClick={() => setCurrentTab('lab')}>AI formulation Core</span>
            <span className="hover:text-gray-900 cursor-pointer" onClick={() => setCurrentTab('calculator')}>Savings Log</span>
          </div>

        </div>
      </footer>

    </div>
  );
}
