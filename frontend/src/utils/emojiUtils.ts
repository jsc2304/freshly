// Emoji mapping for food items
export const getProductEmoji = (name: string, category: string): string => {
  const productName = name.toLowerCase();
  
  // Specific product mapping
  const productEmojiMap: { [key: string]: string } = {
    // Fruits
    'apfel': '🍎',
    'äpfel': '🍎',
    'apple': '🍎',
    'banane': '🍌',
    'bananen': '🍌',
    'banana': '🍌',
    'orange': '🍊',
    'orangen': '🍊',
    'zitrone': '🍋',
    'zitronen': '🍋',
    'lemon': '🍋',
    'traube': '🍇',
    'trauben': '🍇',
    'weintraube': '🍇',
    'weintrauben': '🍇',
    'erdbeere': '🍓',
    'erdbeeren': '🍓',
    'strawberry': '🍓',
    'kirsche': '🍒',
    'kirschen': '🍒',
    'cherry': '🍒',
    'pfirsich': '🍑',
    'peach': '🍑',
    'ananas': '🍍',
    'pineapple': '🍍',
    'wassermelone': '🍉',
    'melone': '🍈',
    'kiwi': '🥝',
    'avocado': '🥑',
    'kokosnuss': '🥥',
    'coconut': '🥥',
    
    // Vegetables
    'tomate': '🍅',
    'tomaten': '🍅',
    'tomato': '🍅',
    'aubergine': '🍆',
    'eggplant': '🍆',
    'karotte': '🥕',
    'karotten': '🥕',
    'möhre': '🥕',
    'möhren': '🥕',
    'carrot': '🥕',
    'paprika': '🌶️',
    'pepper': '🌶️',
    'chili': '🌶️',
    'mais': '🌽',
    'corn': '🌽',
    'brokkoli': '🥦',
    'broccoli': '🥦',
    'salat': '🥬',
    'lettuce': '🥬',
    'gurke': '🥒',
    'gurken': '🥒',
    'cucumber': '🥒',
    'zwiebel': '🧅',
    'zwiebeln': '🧅',
    'onion': '🧅',
    'knoblauch': '🧄',
    'garlic': '🧄',
    'kartoffel': '🥔',
    'kartoffeln': '🥔',
    'potato': '🥔',
    'süßkartoffel': '🍠',
    'pilz': '🍄',
    'pilze': '🍄',
    'champignon': '🍄',
    'champignons': '🍄',
    'mushroom': '🍄',
    
    // Bread & Grains
    'brot': '🍞',
    'bread': '🍞',
    'bagel': '🥯',
    'croissant': '🥐',
    'baguette': '🥖',
    'pasta': '🍝',
    'nudeln': '🍝',
    'spaghetti': '🍝',
    'reis': '🍚',
    'rice': '🍚',
    
    // Dairy
    'käse': '🧀',
    'cheese': '🧀',
    'milch': '🥛',
    'milk': '🥛',
    'butter': '🧈',
    'ei': '🥚',
    'eier': '🥚',
    'egg': '🥚',
    'eggs': '🥚',
    
    // Meat & Fish
    'hähnchen': '🍗',
    'chicken': '🍗',
    'hühnchen': '🍗',
    'speck': '🥓',
    'bacon': '🥓',
    'wurst': '🌭',
    'hotdog': '🌭',
    'fisch': '🐟',
    'fish': '🐟',
    'lachs': '🐟',
    'salmon': '🐟',
    'garnele': '🦐',
    'shrimp': '🦐',
    
    // Beverages
    'kaffee': '☕',
    'coffee': '☕',
    'tee': '🍵',
    'tea': '🍵',
    'bier': '🍺',
    'beer': '🍺',
    'wein': '🍷',
    'wine': '🍷',
    'saft': '🧃',
    'juice': '🧃',
    'wasser': '💧',
    'water': '💧',
    'limonade': '🥤',
    'cola': '🥤',
    'soda': '🥤',
    
    // Snacks & Sweets
    'schokolade': '🍫',
    'chocolate': '🍫',
    'keks': '🍪',
    'cookie': '🍪',
    'kuchen': '🍰',
    'cake': '🍰',
    'eis': '🍦',
    'ice cream': '🍦',
    'nuss': '🥜',
    'nüsse': '🥜',
    'nuts': '🥜',
    'erdnuss': '🥜',
    'peanut': '🥜',
    'mandel': '🥜',
    'almond': '🥜',
    'walnuss': '🥜',
    'walnut': '🥜',
    
    // Herbs & Spices
    'basilikum': '🌿',
    'basil': '🌿',
    'petersilie': '🌿',
    'parsley': '🌿',
    'dill': '🌿',
    'oregano': '🌿',
    'thymian': '🌿',
    'thyme': '🌿',
    
    // Other
    'honig': '🍯',
    'honey': '🍯',
    'öl': '🫒',
    'oil': '🫒',
    'olivenöl': '🫒',
    'olive oil': '🫒',
    'salz': '🧂',
    'salt': '🧂',
  };
  
  // Check for exact matches first
  if (productEmojiMap[productName]) {
    return productEmojiMap[productName];
  }
  
  // Check for partial matches
  for (const [key, emoji] of Object.entries(productEmojiMap)) {
    if (productName.includes(key) || key.includes(productName)) {
      return emoji;
    }
  }
  
  // Fallback to category emoji if no specific product match
  const categoryEmojiMap: { [key: string]: string } = {
    'obst': '🍎',
    'gemüse': '🥕',
    'fleisch': '🥩',
    'milchprodukte': '🥛',
    'getreideprodukte': '🌾',
    'getränke': '🥤',
    'sonstiges': '📦'
  };
  
  return categoryEmojiMap[category.toLowerCase()] || '';
};

// Get category emoji
export const getCategoryEmoji = (category: string): string => {
  const categoryEmojiMap: { [key: string]: string } = {
    'obst': '🍎',
    'gemüse': '🥕',
    'fleisch': '🥩',
    'milchprodukte': '🥛',
    'getreideprodukte': '🌾',
    'getränke': '🥤',
    'sonstiges': '📦'
  };
  
  return categoryEmojiMap[category.toLowerCase()] || '📦';
};
