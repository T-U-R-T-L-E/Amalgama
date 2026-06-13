import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Shared Gemini Client following system instructions
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Parse JSON bodies
  app.use(express.json());

  // API Route: Server health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  // API Route: Custom Recipe Formulator via Gemini
  app.post("/api/formulate", async (req, res) => {
    try {
      const { targetProduct, ingredientsAvailable, extraNotes } = req.body;

      if (!targetProduct) {
        return res.status(400).json({ error: "Product name/goal is required." });
      }

      const prompt = `Formulate a detailed, natural, household or cosmetic DIY non-toxic product recipe for: "${targetProduct}".
      The user lists these ingredients available in their home: [${(ingredientsAvailable || []).join(", ")}].
      ${extraNotes ? `Additional user custom goals or requests: "${extraNotes}"` : ""}
      
      Ensure you only formulate completely safe combinations. Strictly avoid petrochemicals, SLS, synthetic parabens, and phthalates. Give specific measurements, detailed safety notes, and estimate the savings. Make the measurements realistic (cups, tablespoons, drops).`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are Amalgama AI, an expert organic green chemist, clean beauty formulator, and eco-toxicologist. Your core specialty is formulating natural self-care, household cleaning, laundry, and hygiene items using safe, edible, or biodegradable organic raw materials. Your outputs must be highly structured, extremely accurate, and strictly free of synthetic toxic chemicals.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "A catchy, beautiful name for the natural formulation" },
              category: { type: Type.STRING, description: "Must be one of: 'beauty', 'cleaning', 'household', 'health', 'personal_care'" },
              description: { type: Type.STRING, description: "A brief, compelling overview of the formulation's benefits and how it compares to high-toxic commercial equivalents" },
              prepTime: { type: Type.STRING, description: "Estimated time to prepare, e.g. '15 mins', '1 hour'" },
              difficulty: { type: Type.STRING, description: "Must be one of: 'easy', 'medium', 'hard'" },
              costEstimate: { type: Type.STRING, description: "Estimated cost of making a batch, e.g. '$0.80 per batch'" },
              retailCostCost: { type: Type.STRING, description: "Average product store price replaced, e.g. '$9.50 store price'" },
              chemicalsAvoided: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of typical chemical ingredients in industrial alternatives that are avoided with this DIY version"
              },
              ingredients: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: "The name of the natural raw ingredient" },
                    amount: { type: Type.STRING, description: "Exact measurements, e.g., '2 tbsp', '5 drops'" },
                    optional: { type: Type.BOOLEAN, description: "Whether this ingredient is optional" }
                  },
                  required: ["name", "amount"]
                }
              },
              instructions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Clean step-by-step sequential instructions to blend, pack, and prepare the formulation"
              },
              safetyNote: { type: Type.STRING, description: "Urgent or useful safety advice, dermal sensitivity warning, or surfaces to avoid" },
              shelfLife: { type: Type.STRING, description: "Recommended shelf life and ideal storage container, e.g., '6 months in dark spray bottle'" },
              tips: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Pro formulation tips or variations"
              }
            },
            required: ["title", "category", "description", "prepTime", "difficulty", "costEstimate", "retailCostCost", "chemicalsAvoided", "ingredients", "instructions", "safetyNote", "shelfLife", "tips"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response received from Gemini formulation service.");
      }

      // Parse the JSON representation back
      const formulatedRecipe = JSON.parse(responseText.trim());
      
      // Inject some unique ID
      formulatedRecipe.id = "custom-" + Date.now();
      formulatedRecipe.isCustom = true;

      return res.json(formulatedRecipe);

    } catch (error: any) {
      console.error("Gemini Formulation Error:", error);
      return res.status(500).json({
        error: "Failed to formulate custom recipe",
        details: error.message || error
      });
    }
  });

  // API Route: Analyzer of Raw Ingredients & Dynamic Finder via Gemini
  app.post("/api/analyze-ingredients", async (req, res) => {
    try {
      const { ingredients } = req.body;

      if (!ingredients || !Array.isArray(ingredients)) {
        return res.status(400).json({ error: "Ingredients array is required." });
      }

      if (ingredients.length === 0) {
        return res.status(400).json({ error: "Please select/provide at least one ingredient." });
      }

      const prompt = `You are a professional chemical formulator and green chemist. Analyze this list of raw household ingredients available in the user's pantry/cabinet: [${ingredients.join(", ")}].
      Choose a premium, commercial-grade beauty, personal care, or household product recipe that can/could be recreated or developed.
      
      Strictly follow these rules:
      1. Analyze the items provided and ensure the recipe can be made using ONLY these ingredients (plus water).
      2. If an essential binding ingredient or preservative is missing for this product, explicitly state what common item they need to get, and you MUST set "can_make_now" to false. If no essential binder/preservative is missing, set "can_make_now" to true.
      3. The "missing_optional_additions" field MUST house any missing essential binders/preservatives (if "can_make_now" is false) or general optional quality enhancement additives (if "can_make_now" is true).
      4. Output strictly in JSON format according to the schema below. Keep brief step-by-step instructions.

      Ingredients array provided: [${ingredients.join(", ")}].`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are Amalgama AI, an expert organic green chemist, clean beauty formulator, and eco-toxicologist. Your core specialty is formulating natural self-care, household cleaning, laundry, and hygiene items using safe, edible, or biodegradable organic raw materials. Respond with valid JSON adhering strictly to the schema.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              can_make_now: { type: Type.BOOLEAN, description: "Whether the recipe can be made using ONLY the provided ingredients plus water. Set to false if any essential binding ingredient or preservative is missing." },
              product_name: { type: Type.STRING, description: "The name of the premium beauty, personal care, or household product" },
              category: { type: Type.STRING, description: "One of: 'Beauty', 'Personal Care', 'Household', 'Cleaning', 'Health'" },
              matching_ingredients_used: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Array of ingredients from the user's provided list that are utilized in this recipe"
              },
              missing_optional_additions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of missing essential ingredients/binders/preservatives (e.g. 'Essential: Beeswax to hold structure') or optional enhancement additions"
              },
              brief_instructions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Brief step-by-step instructions to prepare the product"
              }
            },
            required: ["can_make_now", "product_name", "category", "matching_ingredients_used", "missing_optional_additions", "brief_instructions"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response received from Gemini ingredient analyzer.");
      }

      // Parse and send the structured JSON response
      const result = JSON.parse(responseText.trim());
      return res.json(result);

    } catch (error: any) {
      console.error("Gemini Ingredient Analyzer Error:", error);
      return res.status(500).json({
        error: "Failed to analyze ingredients and generate recipe",
        details: error.message || error
      });
    }
  });

  // API Route: Substitution Engine with skin/hair profile evaluations
  app.post("/api/substitute-ingredient", async (req, res) => {
    try {
      const { targetRecipe, missingIngredient, profile } = req.body;

      if (!targetRecipe || !missingIngredient || !profile) {
        return res.status(400).json({ error: "targetRecipe, missingIngredient, and profile parameters are required." });
      }

      const prompt = `You are an expert cosmetic dermatologist, green organic chemist, and natural beauty formulator.
      A user wants to make a DIY non-toxic recipe: "${targetRecipe}".
      However, they are missing this vital ingredient/pantry element: "${missingIngredient}".
      The user has the following skin or hair profile: "${profile}".

      Suggest exactly 2 to 3 common, easily accessible household alternatives that can replace "${missingIngredient}" under this specific recipe context.
      Make sure to evaluate each replacement alternative based on the user's skin or hair type filter ("${profile}") to ensure safety, prevent breakouts/clogged pores, and avoid irritation (e.g. suggesting jojoba oil or grapeseed oil instead of coconut oil for oily/acne-prone skin because coconut oil is highly comedogenic).
      
      Output strictly in JSON format matching the schema rules below directly.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are Amalgama AI, an expert organic green chemist, clean beauty formulator, and eco-toxicologist. Provide valid JSON adhering strictly to the schema.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              original_ingredient: { 
                type: Type.STRING, 
                description: "The exact name of the requested missing ingredient" 
              },
              recommended_substitutes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { 
                      type: Type.STRING, 
                      description: "Name of the household replacement option" 
                    },
                    why_it_works: { 
                      type: Type.STRING, 
                      description: "Detailed description of why it works as a surrogate, its cosmetic/chemical properties, and how it behaves on the user's skin/hair type profile" 
                    },
                    suitability_rating: { 
                      type: Type.STRING, 
                      description: "Specific compatibility score or advisory (e.g., 'Perfect for Oily Skin / High Linoleic Acid' or 'Avoid if highly Sensitive')" 
                    }
                  },
                  required: ["name", "why_it_works", "suitability_rating"]
                },
                description: "Array containing exactly 2 to 3 household replacements"
              }
            },
            required: ["original_ingredient", "recommended_substitutes"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response received from Gemini ingredient substitution engine.");
      }

      const substituteResult = JSON.parse(responseText.trim());
      return res.json(substituteResult);

    } catch (error: any) {
      console.error("Gemini Substitution Error:", error);
      return res.status(500).json({
        error: "Failed to generate chemical substitutes for this ingredient",
        details: error.message || error
      });
    }
  });

  // API Route: Reverse-Engineering popular store-bought products to create natural "dupes"
  app.post("/api/reverse-engineer-dupe", async (req, res) => {
    try {
      const { commercialProduct } = req.body;

      if (!commercialProduct) {
        return res.status(400).json({ error: "commercialProduct parameter is required." });
      }

      const prompt = `You are an expert cosmetic dermatologist, green organic chemist, and natural beauty/household formulator.
      A user wants to reverse-engineer this popular store-bought commercial product: "${commercialProduct}".
      
      Break down its primary active commercial benefits (such as active ingredients, texture, efficacy, etc.) and create a 100% natural, homemade "dupe" recipe using common kitchen, garden, or easily obtainable pantry ingredients that achieves a similar result.
      Make sure to explain which commercial active ingredient is being mimicked by what natural ingredients (e.g., Hyaluronic acid mimicked by Aloe Vera & Glycerin).

      Output strictly in JSON format matching the schema rules below directly.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are Amalgama AI, an expert organic green chemist, clean beauty formulator, and eco-toxicologist. Provide valid JSON adhering strictly to the schema.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              commercial_target: { 
                type: Type.STRING, 
                description: "The name of the commercial product that is being reverse-engineered" 
              },
              natural_dupe_name: { 
                type: Type.STRING, 
                description: "A beautiful, evocative name for the natural homemade version" 
              },
              commercial_active_mimicked: { 
                type: Type.STRING, 
                description: "Explanation of how the primary active commercial ingredients are mimicked by natural substitutes" 
              },
              ingredients: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { 
                      type: Type.STRING, 
                      description: "The name of the natural kitchen/garden ingredient" 
                    },
                    amount: { 
                      type: Type.STRING, 
                      description: "Precise measurements/ratios for the recipe, e.g. '1/4 cup', '2 tbsp', '5 drops'" 
                    }
                  },
                  required: ["name", "amount"]
                },
                description: "List of natural ingredients required to craft the dupe"
              },
              formulation_steps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Step-by-step instructions to prepare and blend the natural formulation"
              }
            },
            required: ["commercial_target", "natural_dupe_name", "commercial_active_mimicked", "ingredients", "formulation_steps"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response received from Gemini reverse-engineering dupe engine.");
      }

      const dupeResult = JSON.parse(responseText.trim());
      return res.json(dupeResult);

    } catch (error: any) {
      console.error("Gemini Reverse-Engineering Error:", error);
      return res.status(500).json({
        error: "Failed to reverse-engineer commercial product to a natural dupe",
        details: error.message || error
      });
    }
  });

  // API Route: Generate 3 high-demand household products with difficulty level and prep time
  app.post("/api/generate-catalog", async (req, res) => {
    try {
      const { category } = req.body;

      if (!category) {
        return res.status(400).json({ error: "category parameter is required." });
      }

      const prompt = `You are an expert cosmetic dermatologist, green organic chemist, and organic beauty/household formulator.
      Organize the Amalgama app's recipe catalog by generating a list of 3 distinct, high-demand commercial-grade products that can be formulated naturally at home based on the requested category: "${category}".
      The category is one of "Cosmetics", "Personal Care", or "Eco-Home Utility".

      Include a clear difficulty level ("Easy", "Medium", or "Advanced") and estimated prep time for each entry to help filter the app's UI components cleanly.

      Output strictly in JSON format matching the schema rules below directly.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are Amalgama AI, an expert organic green chemist, clean beauty formulator, and eco-toxicologist. Provide valid JSON adhering strictly to the schema.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: { 
                type: Type.STRING, 
                description: "The requested category name (e.g. Cosmetics, Personal Care, or Eco-Home Utility)" 
              },
              products: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { 
                      type: Type.STRING, 
                      description: "The title of the high-demand natural/DIY alternative product" 
                    },
                    difficulty: { 
                      type: Type.STRING, 
                      description: "The difficulty level. Must be exactly 'Easy', 'Medium', or 'Advanced'" 
                    },
                    prep_time: { 
                      type: Type.STRING, 
                      description: "Estimated preparation time, e.g. '10 mins', '25 mins'" 
                    },
                    primary_benefit: { 
                      type: Type.STRING, 
                      description: "Brief summary explaining the primary active benefit of this homemade product" 
                    }
                  },
                  required: ["title", "difficulty", "prep_time", "primary_benefit"]
                },
                description: "List containing exactly 3 distinct high-demand formulations"
              }
            },
            required: ["category", "products"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response received from Gemini recipe catalog generator.");
      }

      const catalogResult = JSON.parse(responseText.trim());
      return res.json(catalogResult);

    } catch (error: any) {
      console.error("Gemini Catalog Generation Error:", error);
      return res.status(500).json({
        error: "Failed to generate high-demand catalog items",
        details: error.message || error
      });
    }
  });

  // API Route: Analyze recipe safety against user profile (skin type and specific allergens)
  app.post("/api/analyze-recipe-safety", async (req, res) => {
    try {
      const { recipeName, ingredients, skinType, allergens } = req.body;

      if (!recipeName || !ingredients || !skinType) {
        return res.status(400).json({ error: "recipeName, ingredients, and skinType parameters are required." });
      }

      const allergensList = Array.isArray(allergens) ? allergens : [allergens].filter(Boolean);

      const prompt = `You are a clinical cosmetic dermatologist, green toxicologist, and highly specialized clean skincare formulator.
      
      We need to analyze a proposed natural recipe for safety and personalization against a user's biological profile:
      - Recipe Name: "${recipeName}"
      - Recipe Ingredients: ${JSON.stringify(ingredients)}
      - User's Skin Type / Condition: "${skinType}"
      - User's Specific Allergens / Sensitivities: ${JSON.stringify(allergensList)}

      Please thoroughly check each ingredient in this recipe.
      1. If any ingredient is a known allergen listed or closely related to the user's specific allergens, flag the recipe as UNSAFE ("is_safe_for_user": false), explain specifically in "risk_assessment", and provide a safe alternative.
      2. If any ingredient is highly comedogenic (pore-clogging, e.g. Coconut Oil, Cocoa Butter, Wheat Germ Oil on Oily/Acne-prone skin) or is highly irritating to their specific skin type/condition (e.g. Lemon juice/baking soda on Sensitive or Eczema-prone skin), flag the recipe as UNSAFE ("is_safe_for_user": false).
      3. Evaluate a safety score from "1" (extreme trigger or severe allergen match) to "10" (100% hypoallergenic, safe, non-comedogenic, completely compatible with their skin type).
      4. Provide a detailed risk assessment explaining compatibility or specific dangers/breakout risks.
      5. "required_modifications" MUST list specific natural ingredient swaps (e.g. "Swap Coconut Oil with Jojoba Oil or Argan Oil to prevent acne flares") or adjustments to make the formula safe for them. Limit each modification to a clear, actionable sentence.

      Output strictly in JSON format matching the schema rules below directly.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are Amalgama AI, an expert organic green chemist, clean beauty formulator, and eco-toxicologist. Provide valid JSON adhering strictly to the schema.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              is_safe_for_user: { 
                type: Type.BOOLEAN, 
                description: "True if the recipe contains zero allergens and is highly compatible with their skin type (no irritants/comedogens). False otherwise." 
              },
              safety_score: { 
                type: Type.STRING, 
                description: "A rating from '1' (highly dangerous/allergen triggered) to '10' (perfectly safe and compatible)" 
              },
              risk_assessment: { 
                type: Type.STRING, 
                description: "Detailed, professional dermatological explanation of ingredient compatibility, allergy risks, or potential skin barrier disruptions" 
              },
              required_modifications: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "If unsafe, lists concrete substitutions and steps to make it safe. If safe, can list helpful optimization tips or be empty."
              }
            },
            required: ["is_safe_for_user", "safety_score", "risk_assessment", "required_modifications"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response received from Gemini safety analyzer.");
      }

      const safetyResult = JSON.parse(responseText.trim());
      return res.json(safetyResult);

    } catch (error: any) {
      console.error("Gemini Safety Analysis Error:", error);
      return res.status(500).json({
        error: "Failed to analyze recipe safety profile",
        details: error.message || error
      });
    }
  });

  // API Route: Generate a precise 24-hour patch test instruction set
  app.post("/api/generate-patch-test", async (req, res) => {
    try {
      const { recipeName, ingredients, category } = req.body;

      if (!recipeName || !ingredients) {
        return res.status(400).json({ error: "recipeName and ingredients parameters are required." });
      }

      const prompt = `You are a clinical cosmetic dermatologist, toxicologist, and expert organic beauty formulator.
      We need a precise, safety-first guide for conducting a 24-hour patch test on a specific natural DIY recipe:
      - Recipe Name: "${recipeName}"
      - Recipe Ingredients: ${JSON.stringify(ingredients)}
      - Optional Category: "${category || ''}"

      Determine the most sensitive and appropriate area of the body for testing this specific formulation type (e.g. behind the ear/back of neck for hair products, inner elbow/forearm for facial/body skincare, under jawline for sensitive face oils). Give a clear rationale.
      Outline step-by-step instructions for a 24-hour timeline, and specify exactly what physical or visual warning signs of irritation (erythema, itching, hives, burning) they must monitor.

      Output strictly in JSON format matching the schema rules below directly.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are Amalgama AI, an expert organic green chemist, clean beauty formulator, and eco-toxicologist. Provide valid JSON adhering strictly to the schema.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              recipe_name: { 
                type: Type.STRING, 
                description: "The name of the checked recipe" 
              },
              recommended_body_area: { 
                type: Type.STRING, 
                description: "E.g., Back of the ear, Inner forearm, Inner elbow, Under jawline, etc." 
              },
              rationale: { 
                type: Type.STRING, 
                description: "Clinical explanation of why this specific area is most appropriate and sensitive for this formulation type" 
              },
              instructions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Sequential list of steps starting from sample prep, cleaning the spot, application duration, washing, and monitoring up to 24 hours"
              },
              visual_signs_to_watch_for: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Visual or sensory signs of irritation to watch for, such as redness, burning, hives, bumps, swelling, or extreme itching"
              },
              emergency_action: { 
                type: Type.STRING, 
                description: "Steps to take if the user registers an active reaction (e.g. wash with cool water immediately, apply soothing oil/cold compress, seek medical care)" 
              }
            },
            required: ["recipe_name", "recommended_body_area", "rationale", "instructions", "visual_signs_to_watch_for", "emergency_action"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response received from Gemini patch test generator.");
      }

      const patchTestResult = JSON.parse(responseText.trim());
      return res.json(patchTestResult);

    } catch (error: any) {
      console.error("Gemini Patch Test Generation Error:", error);
      return res.status(500).json({
        error: "Failed to generate patch test guide",
        details: error.message || error
      });
    }
  });

  // API Route: Dynamically scale recipe ingredients, ratios, and binding components
  app.post("/api/scale-recipe", async (req, res) => {
    try {
      const { recipeName, ingredients, targetVolume, category } = req.body;

      if (!recipeName || !ingredients || !targetVolume) {
        return res.status(400).json({ error: "recipeName, ingredients, and targetVolume parameters are required." });
      }

      const prompt = `You are an expert organic cosmetic chemist, green formulation systems engineer, and clean beauty formulator.
      We need to mathematically and chemically scale a baseline natural recipe to a new target volume or portion request:
      - Recipe Name: "${recipeName}"
      - Target Volume/Portion: "${targetVolume}" (e.g., "single-use batch", "100ml dropper", "250ml jar", "1-liter container", etc.)
      - Baseline Ingredients: ${JSON.stringify(ingredients)}
      - Category: "${category || ''}"

      Instructions:
      1. Mathematically scale each ingredient's measure (e.g., grams, drops, teaspoons, ml) to match the target volume perfectly.
      2. Pay close attention to functional components like binders, gelling agents (like Xanthan Gum), emulsifiers (like Lecithin), and preservatives or active essential oils (like tea tree, oregano, lavender). Ensure they remain within safe skin thresholds (e.g., essential oils usually <= 1% of total, preservatives scaled appropriately to prevent microbial action in larger storage sizes, binder ratio adjusted so consistency stays authentic).
      3. Provide a clear expert explanation of the scaling mathematics, chemical ratios, and stabilizer adjustments.
      4. Provide any necessary instructional adjustments (e.g., longer mixing, different heating, storage considerations) and any shelf life impact for this specific size.

      Output strictly in JSON format matching the schema rules below directly.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are Amalgama AI, an expert organic green chemist, clean beauty formulator, and eco-toxicologist. Provide valid JSON adhering strictly to the schema.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              recipe_name: { 
                type: Type.STRING, 
                description: "The name of the recipe being scaled" 
              },
              target_scale_request: { 
                type: Type.STRING, 
                description: "The targeted scaled volume or portion requested by the user" 
              },
              explanation: { 
                type: Type.STRING, 
                description: "Professional cosmetic chemist explanation of the mathematical ratio scaling, binder stability, and safe dermal thresholds" 
              },
              scaled_ingredients: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: "Name of the ingredient" },
                    original_amount: { type: Type.STRING, description: "The original baseline mount / ratio, e.g. '2 drops', '50ml'" },
                    scaled_amount: { type: Type.STRING, description: "The mathematically and chemically balanced scaled recipe amount" },
                    role: { type: Type.STRING, description: "Functional classification (e.g. Carrier, Active, Binder, Emulsifier, Preservative, Fragrance)" }
                  },
                  required: ["name", "original_amount", "scaled_amount", "role"]
                },
                description: "Fully scaled ingredients set preserving active ratios and safety limits"
              },
              shelf_life_impact: { 
                type: Type.STRING, 
                description: "Impact on shelf life due to larger batch size or different storage containment requirements" 
              },
              instructions_adjustments: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Specific changes or warnings for formulating at this scale (e.g., blending duration, heating, sanitization)"
              }
            },
            required: ["recipe_name", "target_scale_request", "explanation", "scaled_ingredients", "shelf_life_impact", "instructions_adjustments"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response received from Gemini recipe scaling engine.");
      }

      const scaledResult = JSON.parse(responseText.trim());
      return res.json(scaledResult);

    } catch (error: any) {
      console.error("Gemini Scaling Engine Error:", error);
      return res.status(500).json({
        error: "Failed to scale recipe formulation guidelines",
        details: error.message || error
      });
    }
  });

  // API Route: Estimate recipe shelf life, storage specifications, and spoilage indicators
  app.post("/api/estimate-shelf-life", async (req, res) => {
    try {
      const { recipeName, ingredients, category } = req.body;

      if (!recipeName || !ingredients) {
        return res.status(400).json({ error: "recipeName and ingredients parameters are required." });
      }

      const prompt = `You are an expert organic green chemist, clean beauty formulator, and eco-toxicologist.
      We need a professional shelf-life assessment for this freshly crafted DIY natural recipe:
      - Recipe Name: "${recipeName}"
      - Ingredients: ${JSON.stringify(ingredients)}
      - Category: "${category || ''}"

      Instructions:
      1. Analyze the perishable nature of the raw items used (e.g. water-containing ingredients, plant hydrosols, cold-pressed oils, fresh botanicals vs pure lipids/essential oils).
      2. Determine an accurate expiration timeline (estimated_days) indicating how long they will remain microbiologically safe.
      3. Define the exact optimal storage conditions required to prevent bacterial and fungal growth (e.g., refrigeration, dark UV glass containers, sterile handling).
      4. Provide clear sensory and physical spoilage indicators (smell, color separation, texture change) that the user must watch for to stay protected from active pathogens.
      5. Offer 2-3 green chemistry preservation tips to extend stability naturally (such as Vitamin E, rosemary antioxidant, organic citric acid, or strict hygienic practices).

      Output strictly in JSON format matching the schema rules directly.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are Amalgama AI, an expert organic green chemist, clean beauty formulator, and eco-toxicologist. Provide valid JSON adhering strictly to the schema.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              estimated_days: { 
                type: Type.INTEGER, 
                description: "Accurate estimated shelf life in days under recommended storage conditions." 
              },
              timeline_explanation: { 
                type: Type.STRING, 
                description: "Detailed breakdown of why this duration was estimated based on chemical and biological constraints of the raw ingredients." 
              },
              storage_conditions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of storage constraints (e.g., refrigeration, dark glass, airtight seals) to prevent rapid spoilage."
              },
              spoilage_indicators: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    indicator_type: { type: Type.STRING, description: "E.g., Aroma, Visual separation, Color shift, Fungal growth, Texture change" },
                    description: { type: Type.STRING, description: "Detailed physical alert signal to monitor." }
                  },
                  required: ["indicator_type", "description"]
                },
                description: "Key physical and sensory changes that indicate active spoilage has occurred."
              },
              preservation_tips: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Natural organic stabilization ideas to extend shelf life safely."
              }
            },
            required: ["estimated_days", "timeline_explanation", "storage_conditions", "spoilage_indicators", "preservation_tips"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response received from Gemini shelf-life estimation engine.");
      }

      const shelfLifeResult = JSON.parse(responseText.trim());
      return res.json(shelfLifeResult);

    } catch (error: any) {
      console.error("Gemini Shelf-Life Estimation Error:", error);
      return res.status(500).json({
        error: "Failed to estimate formulation shelf life",
        details: error.message || error
      });
    }
  });

  // Vite development vs. production static serving setup
  if (process.env.NODE_ENV !== "production") {
    // Development server mapping
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware loaded.");
  } else {
    // Production static compiled mapping
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Serving static production assets from /dist folder.");
  }

  // Bind exclusively to port 3000 at host 0.0.0.0
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Amalgama Server successfully booted on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
  });
}

startServer().catch((err) => {
  console.error("Critical Server Boot Failure:", err);
});
