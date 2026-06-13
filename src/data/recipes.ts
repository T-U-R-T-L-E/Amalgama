import { Recipe, Ingredient, ChemicalImpact, CategoryType } from '../types';

export const CABIN_INGREDIENTS: string[] = [
  "Baking Soda (Sodium Bicarbonate)",
  "White Vinegar (Acetic Acid)",
  "Apple Cider Vinegar",
  "Citric Acid Powder",
  "Washing Soda (Sodium Carbonate)",
  "Liquid Castile Soap",
  "Bar Castile Soap (grated)",
  "Coconut Oil",
  "Shea Butter",
  "Beeswax Pellets (or Soy Wax)",
  "Jojoba Oil",
  "Arrowroot Powder (or Cornstarch)",
  "Epsom Salt (Magnesium Sulfate)",
  "Coarse Sea Salt",
  "Active Charcoal Powder",
  "Witch Hazel Extract",
  "Aloe Vera Gel",
  "Vegetable Glycerin",
  "Tea Tree Essential Oil",
  "Lavender Essential Oil",
  "Lemon or Sweet Orange Essential Oil",
  "Peppermint Essential Oil",
  "Distilled Water"
];

export const INGREDIENT_PROFILES: Ingredient[] = [
  {
    id: "ing-1",
    name: "Baking Soda (Sodium Bicarbonate)",
    description: "A mildly alkaline mineral powder that excels at absorbing odors, neutralizing volatile acids, and serving as a safe, gentle abrasive for polishing enamel or scrubbing tile countertops.",
    safetyLevel: "excellent",
    safetyDescription: "Food grade, non-hazardous, entirely biodegradable. Highly protective for sensitive skin but should be rinsed off surfaces to avoid powdery residue.",
    properties: ["Mild Abrasive", "Deodorizing", "Alkalizing", "pH Buffering"],
    commonUses: ["Natural deodorants", "Scrubbing pastes", "Toothpaste binder", "Refrigerator deodorizer"]
  },
  {
    id: "ing-2",
    name: "White Vinegar (Acetic Acid)",
    description: "A natural product of fermentation. Its low pH dissolves hard water calcium deposits, soap scum, cuts through stubborn grease, and acts as a mild antibacterial agent.",
    safetyLevel: "excellent",
    safetyDescription: "Safe for environment, highly edible. Strong odor which dissipates quickly leaving zero trace chemicals. (Do not use on granite, marble, or quartzite as acidity can etch stone).",
    properties: ["Antibacterial", "Hard Water Descaling", "Degreasing", "Deodorizing"],
    commonUses: ["Glass cleaner", "Rinse aid", "All-purpose counter disinfectant", "Hair clarifying rinse"]
  },
  {
    id: "ing-3",
    name: "Citric Acid Powder",
    description: "Highly concentrated natural organic acid derived from citrus fermentation. Incredible for dissolving rust, removing mineral scale build-up, and reacting with sodium bicarbonate to create a beautiful effervescent fizz.",
    safetyLevel: "safe",
    safetyDescription: "Concentrated dry acid, can cause mild eye irritation in raw dust form. Completely non-toxic once diluted or reacted.",
    properties: ["Descaling", "pH Modifying", "Effervescent", "Chelating Agent"],
    commonUses: ["Toilet bowl fizzers", "Bath bombs", "Dishwasher clarifying booster", "Descaling coffee pots"]
  },
  {
    id: "ing-4",
    name: "Washing Soda (Sodium Carbonate)",
    description: "A highly alkaline cousin of baking soda, processed to remove excess water molecules. Acts as an aggressive degreaser, laundry emulsifier, and mineral binder to 'soften' hard water.",
    safetyLevel: "handle_with_care",
    safetyDescription: "Strong alkali. Wear gloves when using raw, as it can strip protective natural oils from bare hands. Strictly non-toxic to ecosystem.",
    properties: ["Strong Alkali", "Degreasing", "Water Softening", "Surfactant Booster"],
    commonUses: ["Heavy-duty laundry powder", "Degreasing oven racks", "Dishwashing powder booster"]
  },
  {
    id: "ing-5",
    name: "Liquid Castile Soap",
    description: "A traditional vegetable-oil-based saponified soap (usually olive oil, coconut, or hemp), free of sodium lauryl sulfates (SLS), synthetic lathering agents, or formaldehyde preservatives.",
    safetyLevel: "excellent",
    safetyDescription: "Extremely gentle, safe for infant wash, 100% marine-life safe, completely biodegradable. Highly concentrated.",
    properties: ["Mild Cleansing", "Saponified Surfactant", "Emulsifying", "Biodegradable"],
    commonUses: ["All-natural face wash", "Base for dish soap", "Floor cleaning base", "Pet shampoo"]
  },
  {
    id: "ing-6",
    name: "Coconut Oil",
    description: "A deeply nourishing, semi-solid tropical oil naturally rich in lauric acid, giving it gentle antimicrobial and moisture-locking capabilities.",
    safetyLevel: "excellent",
    safetyDescription: "Edible, completely safe for skin and lips. Excellent shelf-life stability due to saturated fat structure.",
    properties: ["Moisturizing", "Antimicrobial", "Barrier Lock", "Deeply Conditioning"],
    commonUses: ["Lip balms", "Deodorant paste base", "Body butters", "Wood moisturizing butter"]
  },
  {
    id: "ing-7",
    name: "Beeswax Pellets (or Soy Wax)",
    description: "A pure structural wax harvested from apiaries. Provides a natural barrier to water, thickens oils, and delivers beautiful structure to self-care sticks and wood polishes.",
    safetyLevel: "excellent",
    safetyDescription: "Perfect skin compatibility, creates a non-clogging protective lock. Highly biodegradable.",
    properties: ["Stabilizing", "Thickening", "Skin Protecting", "Emollient Structuralizer"],
    commonUses: ["Lip balms", "Solids colognes", "Wood and leather wax sealers", "Reusable food wraps"]
  },
  {
    id: "ing-8",
    name: "Arrowroot Powder (or Cornstarch)",
    description: "A fine, ultra-soft powder derived from tropical roots. It excels at absorbing excess moisture and grease without drying the skin, leaving a dry, silky matte finish.",
    safetyLevel: "excellent",
    safetyDescription: "Completely natural food starch, highly tolerable for sensitive skin. Great alternative to toxic talcum powder.",
    properties: ["Highly Absorbent", "Skin Softening", "Mattifying", "Texturizing"],
    commonUses: ["Dry shampoo", "Deodorant sweat absorber", "Body powders", "Thickener for cream cosmetics"]
  },
  {
    id: "ing-9",
    name: "Tea Tree Essential Oil",
    description: "A powerful, concentrated botanical extract distilled from Melaleuca leaves. Renowned for its potent natural antibacterial and antifungal activities.",
    safetyLevel: "safe",
    safetyDescription: "Must be properly diluted in a carrier oil or formulation before skin contact. Do not ingest. Keep away from pets.",
    properties: ["Antifungal", "Antibacterial", "Anti-inflammatory", "Antiseptic"],
    commonUses: ["Acne spot treatments", "Mold/mildew spray", "Anti-dandruff shampoo additive", "Active hand sanitizer"]
  },
  {
    id: "ing-10",
    name: "Lavender Essential Oil",
    description: "A beautiful, calming, and soothing terpene-rich essence extracted from lavender florets. Promotes skin cell regeneration and eases superficial dermal redness.",
    safetyLevel: "excellent",
    safetyDescription: "One of the gentlest essential oils. Safe for most skin types when lightly diluted, bringing wonderful aromatic peace.",
    properties: ["Skin Soothing", "Relaxing Aromatherapy", "Mild Antiseptic", "Cell Regenerating"],
    commonUses: ["Sleep pillow sprays", "Calming body lotions", "Soothing burn salves", "Scented laundry boosters"]
  },
  {
    id: "ing-11",
    name: "Peppermint Essential Oil",
    description: "A refreshing, high-menthol oil that delivers an immediate cooling sensation, stimulates local blood flow, and exhibits mild antimicrobial properties.",
    safetyLevel: "safe",
    safetyDescription: "Highly refreshing but potent. May cause tingling on sensitive skin and should not be used near the eyes.",
    properties: ["Cooling Stimulant", "Deodorizing", "Antiseptic Booster", "Vasodilating"],
    commonUses: ["Minty toothpastes", "Cooling foot rub sprays", "Insect repelling mist", "Muscle soothing balms"]
  },
  {
    id: "ing-12",
    name: "Raw Wildflower Honey",
    description: "An ancient, enzyme-rich nectar of wildflowers. It is a powerful natural humectant that pulls moisture directly from the air into dry skin barrier matrices.",
    safetyLevel: "excellent",
    safetyDescription: "Highly edible, extremely bio-compatible. Packed with active glucose oxidase enzymes that generate sterile micro-environments on skin.",
    properties: ["Natural Humectant", "Antibacterial Enzymes", "Wound Healing", "Anti-inflammatory"],
    commonUses: ["Hydrating face masks", "Glow-boosting skin cleansers", "Soothing lip scrub binding", "Acne spot treatment"]
  },
  {
    id: "ing-13",
    name: "Colloidal Oatmeal (Oats)",
    description: "Finely milled whole oat grains that disperse evenly in liquids. Rich in avenanthramides, starch, and beta-glucans that calm chronic itchiness and restore irritated skin barriers.",
    safetyLevel: "excellent",
    safetyDescription: "Hypoallergenic, dermatologist-recommended, food-safe. Remarkably soothing for eczema, dry skin, and hives.",
    properties: ["Anti-inflammatory", "Skin Soothing", "Anti-itch Humectant", "Barrier Restorational"],
    commonUses: ["Soothing bath teas", "Calming eczema creams", "Gentle facial scrubs", "Sensitive skin body washes"]
  },
  {
    id: "ing-14",
    name: "Bentonite Clay (Calcium Bentonite)",
    description: "An incredibly powerful volcanic clay. Its molecular structure carries a strong negative electrical charge when hydrated, binding and pulling positively charged toxins and oils from the skin.",
    safetyLevel: "safe",
    safetyDescription: "Natural mineral earth. Thoroughly detoxifying, but can be highly drying if left on sensitive skin for too long.",
    properties: ["Deeply Detoxifying", "Highly Absorbent", "Minerally Fortifying", "Skin Tightening"],
    commonUses: ["Deep pore facial masks", "Detoxifying armpit clays", "Drawing salves", "Natural soap coloring"]
  },
  {
    id: "ing-15",
    name: "Kaolin White Clay",
    description: "A beautifully soft, mild aluminosilicate clay. Offers very gentle absorption of impurities and oil without completely stripping the skin's lipid barrier, leaving a silky finish.",
    safetyLevel: "excellent",
    safetyDescription: "The absolute gentlest of all косметических clays. Perfect for dry, delicate, or mature skin types.",
    properties: ["Gentle Exfoliant", "Milky Softening", "Mild Absorbent", "Sensitive Skin Safe"],
    commonUses: ["Gentle makeup powders", "Soothing facial masks", "Active deodorants for sensitive skin", "Mineral toothpastes"]
  },
  {
    id: "ing-16",
    name: "Apple Cider Vinegar",
    description: "A partially fermented apple cider containing raw malic and acetic acids. Restores the acid mantle of hair stems and skin surfaces to seal cuticles and discourage yeast bloom.",
    safetyLevel: "excellent",
    safetyDescription: "Highly beneficial when diluted. Always dilute 1:4 with water to prevent skin irritation from concentrated acidity.",
    properties: ["Clarifying Acid", "pH Balancing", "Anti-dandruff", "Skin Tonifying"],
    commonUses: ["Shine-boosting hair rinses", "Clarifying skin toners", "Soothing sunburn sprays", "Wart removal compresses"]
  },
  {
    id: "ing-17",
    name: "Witch Hazel Extract",
    description: "A clean distillate from Hamamelis twigs, rich in natural tannins. It acts as a powerful non-alcoholic astringent that targets tissue swelling and oily congestion.",
    safetyLevel: "excellent",
    safetyDescription: "Highly soothing, very low irritation risk. Prefer alcohol-free versions when formulating for dehydrated or reactive skin.",
    properties: ["Natural Astringent", "Pore Tightening", "Anti-inflammatory", "Skin Clarifying"],
    commonUses: ["Soothing facial toners", "Aftershave splashes", "Puffy eye compresses", "Blemish control mist"]
  },
  {
    id: "ing-18",
    name: "Aloe Vera Gel",
    description: "The clear inner gel of the Aloe barbadensis leaf, rich in complex polysaccharides, amino acids, and water. Speeds skin healing, reduces inflammation, and hydrates deep tissues.",
    safetyLevel: "excellent",
    safetyDescription: "Wonderfully cooling, hypoallergenic, and deeply hydrating. Instant relief for sunburns, cuts, or dehydration.",
    properties: ["Deep Hydration", "Cooling Relief", "Soothing Humectant", "Tissue Repairing"],
    commonUses: ["Sunburn relief gels", "Moisturizing serums", "Soothing hair masks", "After-sun cooling mists"]
  }
];

export const CHEMICAL_HAZARDS: ChemicalImpact[] = [
  {
    id: "chem-1",
    name: "Phthalates (DEP, DBP, DEHP)",
    type: "Synthetic Fragrances & Plastics",
    hazards: "Endocrine Disruption & Developmental Toxicity",
    whyAvoid: "Used to make synthetic perfume scents last longer and soften plastic bottles. Linked to reproductive issues and thyroid disruption. Listed as potential carcinogens and ecosystem toxins.",
    score: 8
  },
  {
    id: "chem-2",
    name: "Sodium Lauryl/Laureth Sulfate (SLS/SLES)",
    type: "Surfactants / Foaming Agents",
    hazards: "Severe Skin Irritation & Ethylene Oxide Contamination",
    whyAvoid: "Creates dense foam in commercial shampoos and dish soaps. Highly striping to lipids, leading to eczema. SLES can be contaminated with 1,4-Dioxane, a known animal carcinogen.",
    score: 6
  },
  {
    id: "chem-3",
    name: "Triclosan & Triclocarban",
    type: "Antibacterial Preservatives",
    hazards: "Hormonal Alterations & Bacterial Superbug Resistance",
    whyAvoid: "Encountered in commercial hand sanitizers, bar soaps, and toothpaste. Bio-accumulates in water bodies, poisoning amphibians, and damages hormonal systems in humans.",
    score: 9
  },
  {
    id: "chem-4",
    name: "Parabens (Methyl-, Propyl-, Butyl-)",
    type: "Synthetic Preservatives",
    hazards: "Estrogen Mimicry & Skin Bio-accumulation",
    whyAvoid: "Found in almost all commercial makeup and facial washes. Acts as a weak estrogen mimic in tissues, potentially feeding estrogen-sensitive growths. Easily absorbed through skin dermis.",
    score: 7
  },
  {
    id: "chem-5",
    name: "Formaldehyde Releasers (DMDM Hydantoin, Imidazolidinyl Urea)",
    type: "Preservatives",
    hazards: "Contact Allergies & Known Inhalation Carcinogenicity",
    whyAvoid: "Slowly emit minute traces of formaldehyde over their shelf-life to prevent bacterial growth. Can cause chronic dermal allergies, hair loss, and is classified as a top-tier respiratory hazard.",
    score: 8
  },
  {
    id: "chem-6",
    name: "Quaternary Ammonium Compounds (Quats)",
    type: "Disinfectants & Softeners",
    hazards: "Asthma Inducers & Aquatic Toxicity",
    whyAvoid: "Commonly found in surface antibacterial wipes and fabric liquid softeners. Can trigger contact dermatitis and severe respiratory reactions, and persists long-term in local waterways.",
    score: 7
  }
];

export const CURATED_RECIPES: Recipe[] = [
  {
    id: "rec-1",
    title: "All-Purpose Herbal Citrus Cleanser",
    category: "cleaning",
    description: "An incredible deep-cleaning countertop spray powered by organic citrus oils and acetic acid. Excellent for cutting soap scum, heavy grease, kitchen grease, and leaving a natural refreshing garden citrus scent.",
    prepTime: "10 mins (plus optional steeping)",
    difficulty: "easy",
    costEstimate: "$0.45 per bottle (16 oz)",
    retailCostCost: "$6.50 commercial brand",
    chemicalsAvoided: ["Quaternary Ammonium Compounds (Quats)", "Synthetic Fragrances/Phthalates", "Chlorine Bleach Derivatives", "Isothiazolinone Preservatives"],
    ingredients: [
      { name: "White Vinegar (Acetic Acid)", amount: "1 cup" },
      { name: "Distilled Water", amount: "1 cup" },
      { name: "Skins of Orange, Lemon, or Grapefruit", amount: "From 3-4 fruits" },
      { name: "Tea Tree Essential Oil (antibacterial booster)", amount: "10 drops" },
      { name: "Lavender Essential Oil (optional aesthetic)", amount: "5 drops" }
    ],
    instructions: [
      "Option A (Concentrated Steep): Pack citrus peels into an airtight glass jar and cover fully with White Vinegar. Let steep in a dark cupboard for 1-2 weeks. Strain the golden vinegar liquid into a measuring cup.",
      "Option B (Quick Mix): If using immediately, combine plain white vinegar directly with distilled water.",
      "Pour 1 cup of citrus-infused vinegar (or plain vinegar) into a 16 oz glass spray bottle.",
      "Add 1 cup of distilled water.",
      "Drip the tea tree and lavender essential oils directly into the liquid.",
      "Gently swirl to distribute the oils before each use.",
      "Spray liberally on glazed tile, stainless steel, glass, stove tops, and sealed counters. Wipe clean with a microfiber cloth."
    ],
    safetyNote: "Do not use on granite, marble, slate, or other calcified natural stone counters. The acid will degrade/etch the polished stone finish over time.",
    shelfLife: "Indefinite (The citrus vinegar is highly self-preserving)",
    tips: [
      "Citrus peel oils (specifically d-limonene) naturally dissolve adhesives and sticky tags.",
      "Always use a spray head that is chemical-resistant, ideally in an amber or dark glass container to preserve the therapeutic properties of organic essential oils."
    ],
    rating: 4.8
  },
  {
    id: "rec-2",
    title: "Baking Soda & Peppermint Active Deodorant",
    category: "personal_care",
    description: "An incredibly effective, skin-nourishing dry paste that neutralizes odor-causing bacteria instantly without clogging lymph node sweat pathways like commercial aluminum-based antiperspirants.",
    prepTime: "15 mins",
    difficulty: "easy",
    costEstimate: "$1.10 per container (2 oz)",
    retailCostCost: "$8.00 organic store stick",
    chemicalsAvoided: ["Aluminum Zirconium (sweat gland plugs)", "Synthetic Parabens (preservative mimic)", "Propylene Glycol (penetration enhancer)", "Triclosan (disinfectant hazard)"],
    ingredients: [
      { name: "Coconut Oil (semi-solid base)", amount: "3 tablespoons" },
      { name: "Baking Soda (Sodium Bicarbonate)", amount: "2 tablespoons" },
      { name: "Arrowroot Powder (or Cornstarch)", amount: "2 tablespoons" },
      { name: "Shea Butter (deep soothing butter)", amount: "1 tablespoon" },
      { name: "Tea Tree Essential Oil (bacteria-fighting)", amount: "5 drops" },
      { name: "Lavender or Peppermint Essential Oil", amount: "4 drops" }
    ],
    instructions: [
      "In a small heat-safe bowl, combine the Shea Butter and Coconut Oil.",
      "Melt gently by placing the bowl inside a wide skillet of simmering water (Double-Boiler method) or microwave in short 15-second intervals.",
      "Once fully liquid, remove from heat and whisk in the Baking Soda and Arrowroot Powder until perfectly creamy and free of lumps.",
      "Drip the selected Essential Oils into the mixture and stir thoroughly.",
      "Pour the warm liquid paste into a clean 2 oz shallow glass jar or an empty cleaned deodorant stick casing.",
      "Allow to cool at room temperature or place in the refrigerator for 25 minutes to solidify.",
      "To apply: Scoop a tiny pea-sized sphere of cream with clean fingertips and massage gently into each clean underarm. It quickly melts into the skin with zero residue."
    ],
    safetyNote: "If you have ultra-sensitive skin that develops a light pink rash over consecutive weeks, lower the Baking Soda to 1 tablespoon and increase the Arrowroot Powder by 1 additional tablespoon.",
    shelfLife: "Approx. 6 to 9 months (Keep in a cool place as pure coconut oil turns liquid above 76°F / 24°C)",
    tips: [
      "Underarm detox is real! If transitioning from a commercial drug store stick, your pores may need 3-5 days to flush trapped aluminum plugs and normalize sweating.",
      "A dry underarm environment prevents bacterial breakdown which is the prime source of body odor."
    ],
    rating: 4.9
  },
  {
    id: "rec-3",
    title: "Beeswax & Jojoba Botanic Lip Balm",
    category: "beauty",
    description: "An rich, moisture-retaining lip therapy butter containing zero mineral oil, petroleum petroleum-gels, or synthetic flavor dyes. Deeply repairs chapped lips and forms a protective organic shield.",
    prepTime: "20 mins",
    difficulty: "medium",
    costEstimate: "$0.30 per tube",
    retailCostCost: "$4.50 specialty lip repair",
    chemicalsAvoided: ["Petrolatum/Mineral Oil (petroleum refinement byproduct)", "BHT (butylated hydroxytoluene preservative)", "Synthetic Dyes (Coal-Tar dyes group Red #40)", "Saccharin artificial sweeteners"],
    ingredients: [
      { name: "Beeswax Pellets (provides protective grip)", amount: "1 tablespoon" },
      { name: "Coconut Oil", amount: "1 tablespoon" },
      { name: "Jojoba Oil (matches skin sebum)", amount: "1 tablespoon" },
      { name: "Shea Butter (heals skin micro-cracks)", amount: "0.5 tablespoon" },
      { name: "Sweet Orange or Peppermint Essential Oil", amount: "6 drops" }
    ],
    instructions: [
      "Sterilize 4-5 empty lip balm tubes or small cosmetic tins and stand them upright on a stable flat tray.",
      "Combine the Beeswax pellets, Jojoba oil, Coconut oil, and Shea Butter together in a clean glass pyrex measuring pitcher.",
      "Place the bottom of the pitcher inside a saucepan containing 1 inch of water (creating an easy pitcher double-boiler). Melt on low heat, stir with a clean bamboo chopstick.",
      "As soon as the last wax pellet melts into a gorgeous transparent amber oil, turn off the heat immediately.",
      "Add the essential oils; stir briefly.",
      "Quickly but carefully pour the hot liquid mixture directly into the lip balm containers, filling them all the way to the top lip.",
      "Let sit rest undisturbed for about 30 minutes without shaking or moving the containers. A beautiful small dimple will develop automatically as the wax cools and solidifies.",
      "Cap the tubes when cooled to ambient temperature. Ready for use!"
    ],
    safetyNote: "Do not heat the essential oils excessively to avoid vaporizing their natural therapeutic compounds. Beeswax melts at roughly 147°F (64°C). Keep warm but not boiling.",
    shelfLife: "At least 12 months (Thanks to the protective naturally high antioxidant properties of Jojoba oil and Beeswax)",
    tips: [
      "Jojoba Oil is technically a liquid wax ester that chemically mirrors your skin's natural moisturizing factors, allowing rapid non-greasy absorption.",
      "You can add a tiny pinch of natural beet powder if a mild rosy lip stain tint is desired!"
    ],
    rating: 4.7
  },
  {
    id: "rec-4",
    title: "Eco Laundry Powder Booster & Detergent",
    category: "cleaning",
    description: "An incredibly powerful, scent-neutral laundry powder that lifts organic grime, softens local washing water, dissolves grease, and leaves laundry impeccably clean with zero synthetic optical brighteners.",
    prepTime: "15 mins",
    difficulty: "easy",
    costEstimate: "$0.08 per load",
    retailCostCost: "$0.45 per commercial pod dose",
    chemicalsAvoided: ["Optical Brighteners (UV dye chemical residues)", "Sodium Polyacrylate (toxic gel binders)", "Synthetic Fragrances (accumulates in textiles)", "Linear Alkylbenzene Sulfonate (non-biodegradable surfactants)"],
    ingredients: [
      { name: "Washing Soda (active minerals)", amount: "2 parts (e.g., 2 cups)" },
      { name: "Baking Soda (deodorizing booster)", amount: "2 parts (e.g., 2 cups)" },
      { name: "Pure Unscented Castile Bar Soap (grated into flakes)", amount: "1 part (e.g., 1 cup)" },
      { name: "Epsom Salt (dissolves hard water minerals)", amount: "0.5 part (e.g., 0.5 cup)" },
      { name: "Lemon or Lavender Essential Oil", amount: "25 drops" }
    ],
    instructions: [
      "Ensure the grated Castile Bar Soap is grated very finely using a food processor or a microplane cheese grater until they form a fine powder or small flakes.",
      "In a large plastic bowl or ceramic basin, thoroughly mix the raw Washing Soda, Baking Soda, and Epsom Salt together using a wood spoon.",
      "Slowly add the fine Castile Soap flakes and stir evenly to distribute.",
      "Drizzle the Essential Oils over the mixture.",
      "Stir rigorously or blend briefly with a food processor (strictly dedicated to soap making) to break up oil clumps and achieve a completely consistent dry texture.",
      "Store the detergent powder in a wide-mouth dry glass gallon jar with a tight cork or lid.",
      "Use 1-2 level tablespoons per load directly inside the washing machine drum. Works exceptionally well in cold as well as warm water cycles."
    ],
    safetyNote: "Since Washing Soda is an effective alkali, avoid breathing in raw rising dust while mixing the powder. Stir slowly.",
    shelfLife: "Up to 1 year when stored in a cool, bone-dry cupboard. Moisture will cause clumping.",
    tips: [
      "If you have an High-Efficiency (HE) machine, this formula is highly compatible because it is low-sudsing - commercial suds are mostly synthetic additives that do not aid in cleaning!",
      "Replace liquid softeners with 1/2 cup of distilled white vinegar in your machine's fabric softener tray. It naturally strips residual soap alkalinity, neutralizes smells, and leaves fabrics incredibly soft!"
    ],
    rating: 4.8
  },
  {
    id: "rec-5",
    title: "Eco-Active Mineral Toothpaste Paste",
    category: "health",
    description: "A gentle cleaning mineral paste containing active clay, organic oils, and minerals to scrub away surface plaque, refresh breathing spaces, and remineralize tooth surfaces naturally.",
    prepTime: "10 mins",
    difficulty: "easy",
    costEstimate: "$0.80 per jar (3 oz)",
    retailCostCost: "$7.50 boutique herbal tube",
    chemicalsAvoided: ["Fluoride (synthetic dose concerns)", "Sodium Methyl Cocoyl Taurate & SLS", "Saccharin & Aspartame artificial sugars", "Hydrated Silica (highly aggressive micro-particles)"],
    ingredients: [
      { name: "Coconut Oil", amount: "3 tablespoons" },
      { name: "Baking Soda (very fine grid)", amount: "2 tablespoons" },
      { name: "Arrowroot Powder (thickener & smooth feeling)", amount: "1 tablespoon" },
      { name: "Active Charcoal Powder (optional whitening/deodorizer)", amount: "0.5 teaspoon" },
      { name: "Peppermint Essential Oil (extra clean breath)", amount: "10 drops" },
      { name: "Vegetable Glycerin (moisture stabilizer)", amount: "1 teaspoon" }
    ],
    instructions: [
      "If the Coconut Oil is super hard, soften it slightly until it becomes workable and paste-like (do not melt into a fully clear warm liquid unless necessary).",
      "Stir the mineral dry elements (Baking Soda, Arrowroot Powder, and Charcoal if using) together in a clean shallow ceramic dish.",
      "Slowly blend in the Coconut Oil and Vegetable Glycerin using a small silicone spoon or a wooden popsicle stick.",
      "Mash and fold the paste back and forth until it reaches an entirely smooth, consistent paste texture mimicking traditional tubes.",
      "Drip the Peppermint Essential Oil into the mix, stirring thoroughly to disperse uniformly.",
      "Transfer into a sterilized 3 oz wide-mouth glass jar.",
      "How to use: Dip a clean bamboo spatula or scoop a tiny portion onto your dry toothbrush. Brush for 2 full minutes as routine, then rinse clean with warm water."
    ],
    safetyNote: "Essential oils must be 100% pure therapeutic grade. Charcoal is absorbent, so brush gently to avoid staining grout or wearing enamel excessively.",
    shelfLife: "Approx. 4-6 months when sealed tight to prevent air-drying.",
    tips: [
      "Because coconut oil naturally melts at 76°F, the toothpaste paste can become slightly liquid in warm summer climates. A quick stir and a few minutes in a cool room is all it takes to restore texture.",
      "This recipe does not generate heavy foam since it avoids toxic synthetic detergents. Foam is purely visual and has no functional role in dental bio-plaque removal!"
    ],
    rating: 4.6
  },
  {
    id: "rec-6",
    title: "Lavender Face and Body Glow Scrub",
    category: "beauty",
    description: "A nourishing botanical exfoliator that sloughs away dead skin cells, helps combat acne due to Lavender oil, and provides deep organic lipid hydration for polished skin.",
    prepTime: "5 mins",
    difficulty: "easy",
    costEstimate: "$0.60 per batch (4 oz)",
    retailCostCost: "$12.00 boutique body scrub",
    chemicalsAvoided: ["Microbeads (Microplastic polluting rivers)", "Synthetic Parabens (preservatives)", "Polysorbate 20 (emulsifiers)", "Phenoxyethanol (moderate skin allergen)"],
    ingredients: [
      { name: "Coarse Sea Salt (or Organic Sugar)", amount: "0.5 cup" },
      { name: "Jojoba Oil (or Sweet Almond Oil)", amount: "3 tablespoons" },
      { name: "Coconut Oil (melted)", amount: "1 tablespoon" },
      { name: "Lavender Essential Oil", amount: "10 drops" },
      { name: "Dried Lavender Buds (optional luxury feel)", amount: "1 teaspoon" }
    ],
    instructions: [
      "In a medium clean jar or bowl, blend the melted coconut oil with the Jojoba oil.",
      "Add the Coarse Sea Salt (or fine raw cane sugar if formulating a facial exfoliator) into the liquid oils.",
      "Add the Lavender Essential Oil and dry Lavender buds to the mixture.",
      "Stir thoroughly with a wooden spatula until all salt/sugar structures are thoroughly coated with oil, achieving a textured paste-like wet-sand consistency.",
      "Tightly close the lid and store near your sink or bath.",
      "To use: Scoop 1 tablespoon out during a warm bath or face cleaning, massage gently onto damp skin in circular motions. Rinse with clean water and towel dry. The soothing oils will remain in skin pores for deep hydration."
    ],
    safetyNote: "The oils can make smooth tile shower surfaces slightly slippery. Apply carefully and wash shower floor periodically.",
    shelfLife: "6 months (Avoid introducing regular bath water droplets directly inside the main jar to keep it entirely dry and self-preserving).",
    tips: [
      "Sugar grains are finer and possess glycolic acid, making sugar perfect for sensitive facial skins.",
      "Coarse sea salt has wonderful sulfur minerals that revitalize circulation on legs and calloused feet."
    ],
    rating: 4.8
  },
  {
    id: "rec-7",
    title: "Organic Linseed & Beeswax Wood Butter",
    category: "household",
    description: "A deep-conditioning wax that revives dry wood grains, nourishes wood fibers on salad bowls or raw furniture, and protects with a satin organic waterproof outer seal.",
    prepTime: "20 mins",
    difficulty: "easy",
    costEstimate: "$1.20 per jar (4 oz)",
    retailCostCost: "$14.00 premium paste wax",
    chemicalsAvoided: ["Naphtha/Petroleum Distillates (respiratory toxins)", "Toluene & Benzene derivatives", "Synthetic Polyurethane dry-hardeners", "Artificial Turpentine scents"],
    ingredients: [
      { name: "Beeswax Pellets (for solid water resistance)", amount: "1 cup (grated or tiny pellets)" },
      { name: "Coconut Oil (or Raw Linseed Oil / Jojoba)", amount: "3 cups" },
      { name: "Lemon or Orange Essential Oil", amount: "15 drops" }
    ],
    instructions: [
      "Using a 1:3 ratio, combine 1 cup of Beeswax with 3 cups of pure Oil (Coconut or Linseed/Jojoba) in a dedicated heatproof double boiler setup.",
      "Warm slowly on low-medium stove heat until the beeswax fully liquefies into the oil base.",
      "Stir gently with a clean dry wooden dowel or spoon to secure a uniform blend.",
      "Turn off the heat and quickly fold in the lemon/orange essential oil. Citrus oil is a wood tonic and serves to naturally sanitize wood pores.",
      "Slowly pour the golden amber fluid into a wide shallow tin, glass jar, or silicon soap molds.",
      "Let cool undisturbed at room temperature for roughly 2-3 hours until it solidifies into a soft wax butter consistency.",
      "To use: Scoop a small smear onto a clean lint-free soft cotton cloth. Buff vigorously into wood grains. Let penetrate for 30 minutes, then wipe off any excess with a clean dry dry-cloth."
    ],
    safetyNote: "If using raw linseed oil, make sure it is pure raw linseed oil, NOT boiled linseed oil (commercial 'boiled' linseed contains toxic synthetic heavy metal drying agents).",
    shelfLife: "Virtually unlimited when stored sealed in a dark cool shelf.",
    tips: [
      "This recipe is extremely safe for child wooden toys and cutting boards or cooking utensils, as it contains absolutely zero petroleum distillates or chemical hardeners.",
      "It makes a fabulous leather conditioner for boots and saddles too!"
    ],
    rating: 4.9
  }
];

export const CATEGORY_DESCRIPTIONS: Record<CategoryType, { title: string; description: string; icon: string }> = {
  beauty: {
    title: 'Beauty Products',
    description: 'Nourishing cosmetics, lip therapies, and face formulations made from safe, plant-derived botanical waxes and organic oils.',
    icon: '🌸'
  },
  cleaning: {
    title: 'Cleaning Solutions',
    description: 'High-efficacy countertop sprays, grease cutters, and safe detergents powered by organic acids and natural citrus essential oils.',
    icon: '✨'
  },
  household: {
    title: 'Household Items',
    description: 'Deep-conditioning wood polishes, leather restorers, and home care items that contain absolutely zero petroleum distillates or toluene.',
    icon: '🏡'
  },
  health: {
    title: 'Health & Wellness',
    description: 'Oral hygiene, clean mineral toothpastes, and active botanical therapy blends designed to protect your physical well-being.',
    icon: '❤️'
  },
  personal_care: {
    title: 'Personal Care',
    description: 'Skin-nourishing deodorants, body powders, and hygiene essentials that neutralize odor and absorb sweat without blocking pores.',
    icon: '🧴'
  }
};

