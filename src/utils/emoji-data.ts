export interface EmojiItem {
  emoji: string;
  name: string;
  category: EmojiCategory;
  keywords: string[];
}

export type EmojiCategory =
  | 'Popular'
  | 'Fitness'
  | 'Health'
  | 'Work'
  | 'Home'
  | 'Hobbies'
  | 'Symbols';

export const EMOJI_CATEGORIES: EmojiCategory[] = [
  'Popular',
  'Fitness',
  'Health',
  'Work',
  'Home',
  'Hobbies',
  'Symbols',
];

export const POPULAR_EMOJIS = [
  '🏃', '📚', '💧', '🍎', '💪', '😴',
  '🧘', '✍️', '🎯', '🎵', '🍳', '🌿',
  '💊', '🧹', '🛒', '💰', '🎨', '☕',
];

export const EMOJI_DATASET: EmojiItem[] = [
  // --- FITNESS ---
  { emoji: '🏃', name: 'Running', category: 'Fitness', keywords: ['run', 'running', 'jog', 'sprint', 'cardio', 'exercise'] },
  { emoji: '🏃‍♀️', name: 'Woman Running', category: 'Fitness', keywords: ['run', 'running', 'jog', 'cardio', 'woman'] },
  { emoji: '🚴', name: 'Cycling', category: 'Fitness', keywords: ['bike', 'biking', 'cycle', 'cycling', 'cardio'] },
  { emoji: '🏋️', name: 'Weightlifting', category: 'Fitness', keywords: ['gym', 'weights', 'workout', 'lift', 'fitness', 'muscle'] },
  { emoji: '💪', name: 'Flexed Biceps', category: 'Fitness', keywords: ['muscle', 'strength', 'power', 'gym', 'workout'] },
  { emoji: '🧘', name: 'Yoga', category: 'Fitness', keywords: ['stretch', 'meditation', 'zen', 'mindfulness', 'balance'] },
  { emoji: '🏊', name: 'Swimming', category: 'Fitness', keywords: ['swim', 'pool', 'water', 'cardio', 'laps'] },
  { emoji: '🤸', name: 'Cartwheel / Gymnastics', category: 'Fitness', keywords: ['gymnastic', 'stretch', 'flexibility', 'active'] },
  { emoji: '🚶', name: 'Walking', category: 'Fitness', keywords: ['walk', 'steps', 'stroll', 'pedometer', 'movement'] },
  { emoji: '🥊', name: 'Boxing Glove', category: 'Fitness', keywords: ['boxing', 'fight', 'punch', 'sparring', 'kickboxing'] },
  { emoji: '🧗', name: 'Climbing', category: 'Fitness', keywords: ['climb', 'bouldering', 'rock', 'mountain', 'adventure'] },
  { emoji: '⚽', name: 'Soccer', category: 'Fitness', keywords: ['football', 'soccer', 'ball', 'match', 'kick'] },
  { emoji: '🏀', name: 'Basketball', category: 'Fitness', keywords: ['hoops', 'basketball', 'ball', 'game'] },
  { emoji: '🎾', name: 'Tennis', category: 'Fitness', keywords: ['tennis', 'racket', 'court', 'match'] },
  { emoji: '🥋', name: 'Martial Arts', category: 'Fitness', keywords: ['karate', 'judo', 'dojo', 'taekwondo'] },
  { emoji: '⛷️', name: 'Skiing', category: 'Fitness', keywords: ['ski', 'snow', 'winter', 'slope'] },
  { emoji: '🛹', name: 'Skateboarding', category: 'Fitness', keywords: ['skate', 'board', 'ride', 'park'] },
  { emoji: '🎽', name: 'Running Shirt', category: 'Fitness', keywords: ['marathon', 'race', 'track', 'sport'] },

  // --- HEALTH & NUTRITION ---
  { emoji: '💧', name: 'Water Drop', category: 'Health', keywords: ['water', 'hydrate', 'hydration', 'drink', 'fluid'] },
  { emoji: '🍎', name: 'Red Apple', category: 'Health', keywords: ['apple', 'fruit', 'eat', 'diet', 'snack', 'healthy'] },
  { emoji: '🍏', name: 'Green Apple', category: 'Health', keywords: ['apple', 'fruit', 'green', 'healthy', 'diet'] },
  { emoji: '🥗', name: 'Green Salad', category: 'Health', keywords: ['salad', 'vegetable', 'healthy', 'diet', 'nutrition', 'meal'] },
  { emoji: '🥑', name: 'Avocado', category: 'Health', keywords: ['avocado', 'healthy', 'fat', 'toast', 'keto'] },
  { emoji: '🥦', name: 'Broccoli', category: 'Health', keywords: ['veggies', 'vegetable', 'greens', 'healthy', 'nutrition'] },
  { emoji: '🍌', name: 'Banana', category: 'Health', keywords: ['banana', 'fruit', 'potassium', 'snack'] },
  { emoji: '🍊', name: 'Tangerine', category: 'Health', keywords: ['orange', 'vitamin', 'fruit', 'citrus'] },
  { emoji: '🍓', name: 'Strawberry', category: 'Health', keywords: ['berry', 'fruit', 'sweet', 'snack'] },
  { emoji: '☕', name: 'Coffee / Hot Drink', category: 'Health', keywords: ['coffee', 'caffeine', 'espresso', 'morning', 'drink'] },
  { emoji: '🍵', name: 'Teacup', category: 'Health', keywords: ['tea', 'green tea', 'matcha', 'herbal', 'relax'] },
  { emoji: '🥛', name: 'Glass of Milk', category: 'Health', keywords: ['milk', 'calcium', 'drink', 'protein'] },
  { emoji: '🍳', name: 'Cooking Egg', category: 'Health', keywords: ['breakfast', 'egg', 'protein', 'cook', 'food'] },
  { emoji: '💊', name: 'Pill / Medicine', category: 'Health', keywords: ['pill', 'vitamin', 'supplement', 'medicine', 'health', 'meds'] },
  { emoji: '😴', name: 'Sleeping Face', category: 'Health', keywords: ['sleep', 'nap', 'rest', 'bedtime', 'recovery'] },
  { emoji: '🛌', name: 'Person in Bed', category: 'Health', keywords: ['sleep', 'bed', 'rest', 'early night'] },
  { emoji: '🧊', name: 'Ice Cube', category: 'Health', keywords: ['ice', 'cold plunge', 'bath', 'recovery'] },

  // --- WORK & STUDY ---
  { emoji: '📚', name: 'Books', category: 'Work', keywords: ['book', 'read', 'reading', 'study', 'learn', 'library'] },
  { emoji: '📖', name: 'Open Book', category: 'Work', keywords: ['reading', 'novel', 'study', 'chapter'] },
  { emoji: '✍️', name: 'Writing Hand', category: 'Work', keywords: ['write', 'writing', 'journal', 'essay', 'pen'] },
  { emoji: '💻', name: 'Laptop', category: 'Work', keywords: ['code', 'coding', 'computer', 'work', 'email', 'dev'] },
  { emoji: '🎯', name: 'Bullseye / Target', category: 'Work', keywords: ['target', 'goal', 'focus', 'objective', 'aim'] },
  { emoji: '📝', name: 'Memo / Notes', category: 'Work', keywords: ['note', 'task', 'list', 'plan', 'todo'] },
  { emoji: '🧠', name: 'Brain', category: 'Work', keywords: ['mind', 'think', 'learning', 'memory', 'focus', 'brainstorm'] },
  { emoji: '💼', name: 'Briefcase', category: 'Work', keywords: ['work', 'job', 'office', 'business', 'career'] },
  { emoji: '🎓', name: 'Graduation Cap', category: 'Work', keywords: ['education', 'degree', 'course', 'study', 'school'] },
  { emoji: '📊', name: 'Bar Chart', category: 'Work', keywords: ['chart', 'analytics', 'report', 'metrics', 'stats'] },
  { emoji: '📈', name: 'Trending Up Chart', category: 'Work', keywords: ['growth', 'progress', 'increase', 'profit'] },
  { emoji: '🔬', name: 'Microscope', category: 'Work', keywords: ['science', 'research', 'experiment', 'lab'] },
  { emoji: '📐', name: 'Ruler / Geometry', category: 'Work', keywords: ['design', 'math', 'measure', 'engineering'] },
  { emoji: '💡', name: 'Light Bulb', category: 'Work', keywords: ['idea', 'creative', 'solution', 'brainstorm'] },
  { emoji: '📅', name: 'Calendar', category: 'Work', keywords: ['schedule', 'plan', 'date', 'agenda'] },

  // --- HOME & LIVING ---
  { emoji: '🧹', name: 'Broom', category: 'Home', keywords: ['clean', 'sweep', 'chores', 'housework', 'tidy'] },
  { emoji: '🧽', name: 'Sponge', category: 'Home', keywords: ['dishes', 'wash', 'clean', 'scrub'] },
  { emoji: '🧺', name: 'Laundry Basket', category: 'Home', keywords: ['laundry', 'wash clothes', 'fold', 'chores'] },
  { emoji: '🪴', name: 'Potted Plant', category: 'Home', keywords: ['plant', 'water plant', 'garden', 'green', 'nature'] },
  { emoji: '🐕', name: 'Dog', category: 'Home', keywords: ['dog', 'walk dog', 'pet', 'puppy', 'animal'] },
  { emoji: '🐈', name: 'Cat', category: 'Home', keywords: ['cat', 'pet', 'kitten', 'feed cat'] },
  { emoji: '🌅', name: 'Sunrise', category: 'Home', keywords: ['morning', 'wake up', 'early', 'dawn', 'routine'] },
  { emoji: '🛁', name: 'Bathtub', category: 'Home', keywords: ['bath', 'shower', 'hygiene', 'relax', 'self care'] },
  { emoji: '🛋️', name: 'Couch', category: 'Home', keywords: ['relax', 'lounge', 'rest', 'sofa'] },
  { emoji: '🛒', name: 'Shopping Cart', category: 'Home', keywords: ['shop', 'groceries', 'buy', 'store', 'market'] },
  { emoji: '💰', name: 'Money Bag', category: 'Home', keywords: ['budget', 'money', 'save', 'finance', 'expenses'] },
  { emoji: '🔑', name: 'Key', category: 'Home', keywords: ['lock', 'home', 'house', 'security'] },
  { emoji: '📦', name: 'Package / Box', category: 'Home', keywords: ['deliver', 'mail', 'organize', 'pack'] },

  // --- HOBBIES & MIND ---
  { emoji: '🎨', name: 'Artist Palette', category: 'Hobbies', keywords: ['art', 'paint', 'draw', 'sketch', 'creative'] },
  { emoji: '🎵', name: 'Musical Note', category: 'Hobbies', keywords: ['music', 'song', 'listen', 'audio', 'playlist'] },
  { emoji: '🎸', name: 'Guitar', category: 'Hobbies', keywords: ['guitar', 'instrument', 'practice', 'play music'] },
  { emoji: '🎹', name: 'Musical Keyboard', category: 'Hobbies', keywords: ['piano', 'keys', 'music', 'practice'] },
  { emoji: '🎮', name: 'Video Game', category: 'Hobbies', keywords: ['game', 'gaming', 'play', 'console'] },
  { emoji: '📸', name: 'Camera', category: 'Hobbies', keywords: ['photo', 'photography', 'picture', 'snap'] },
  { emoji: '🎬', name: 'Clapper Board', category: 'Hobbies', keywords: ['movie', 'film', 'watch', 'cinema'] },
  { emoji: '🌿', name: 'Herb / Leaf', category: 'Hobbies', keywords: ['nature', 'outdoors', 'eco', 'herbs', 'green'] },
  { emoji: '🤝', name: 'Handshake', category: 'Hobbies', keywords: ['social', 'meetup', 'friends', 'network', 'connect'] },
  { emoji: '♟️', name: 'Chess Pawn', category: 'Hobbies', keywords: ['chess', 'strategy', 'board game', 'puzzle'] },
  { emoji: '🧩', name: 'Puzzle Piece', category: 'Hobbies', keywords: ['puzzle', 'problem solving', 'game'] },

  // --- SYMBOLS & BADGES ---
  { emoji: '✅', name: 'Check Mark', category: 'Symbols', keywords: ['done', 'complete', 'check', 'task', 'yes'] },
  { emoji: '⭐', name: 'Star', category: 'Symbols', keywords: ['star', 'priority', 'important', 'favorite'] },
  { emoji: '🔥', name: 'Fire', category: 'Symbols', keywords: ['streak', 'hot', 'fire', 'energy', 'momentum'] },
  { emoji: '❤️', name: 'Red Heart', category: 'Symbols', keywords: ['heart', 'love', 'health', 'favorite', 'care'] },
  { emoji: '🏆', name: 'Trophy', category: 'Symbols', keywords: ['win', 'reward', 'achievement', 'trophy', 'prize'] },
  { emoji: '⏰', name: 'Alarm Clock', category: 'Symbols', keywords: ['time', 'alarm', 'reminder', 'clock', 'early'] },
  { emoji: '🔔', name: 'Bell', category: 'Symbols', keywords: ['notification', 'alert', 'remind', 'bell'] },
  { emoji: '⚡', name: 'High Voltage / Bolt', category: 'Symbols', keywords: ['energy', 'fast', 'quick', 'power', 'bolt'] },
  { emoji: '🌟', name: 'Glowing Star', category: 'Symbols', keywords: ['sparkle', 'magic', 'special', 'star'] },
  { emoji: '📌', name: 'Pushpin', category: 'Symbols', keywords: ['pin', 'pinned', 'important', 'reminder'] },
  { emoji: '🚀', name: 'Rocket', category: 'Symbols', keywords: ['launch', 'boost', 'fast', 'progress', 'rocket'] },
  { emoji: '💎', name: 'Gem Stone', category: 'Symbols', keywords: ['gem', 'diamond', 'valuable', 'habit', 'streak'] },
  { emoji: '⏳', name: 'Hourglass', category: 'Symbols', keywords: ['timer', 'time', 'countdown', 'wait'] },
];

/**
 * Searches emojis by keyword, name, or category.
 */
export function searchEmojis(query: string, category: EmojiCategory = 'Popular'): EmojiItem[] {
  const trimmed = query.trim().toLowerCase();

  // If search query is empty, filter by category
  if (!trimmed) {
    if (category === 'Popular') {
      const popularSet = new Set(POPULAR_EMOJIS);
      return EMOJI_DATASET.filter((item) => popularSet.has(item.emoji));
    }
    return EMOJI_DATASET.filter((item) => item.category === category);
  }

  // Live keyword & name matching
  return EMOJI_DATASET.filter((item) => {
    const matchesName = item.name.toLowerCase().includes(trimmed);
    const matchesCategory = item.category.toLowerCase().includes(trimmed);
    const matchesKeywords = item.keywords.some((kw) => kw.toLowerCase().includes(trimmed));
    const matchesDirectEmoji = item.emoji === trimmed;
    return matchesName || matchesCategory || matchesKeywords || matchesDirectEmoji;
  });
}
