import { 
  VirtualPet, 
  PetType, 
  PetMood, 
  PetAccessory, 
  PersonalityType, 
  PetMemory, 
  PetChatMessage, 
  DailyMission, 
  PetShopItem, 
  CommunityPet, 
  GrowthStage,
  CustomHeadConfig,
  SavedHeadImage
} from '../types';

const PET_STORAGE_KEY = 'campusloop_virtual_pet_v3';
const MISSIONS_KEY = 'campusloop_pet_missions_v1';
const COMMUNITY_KEY = 'campusloop_pet_community_v1';
const SAVED_HEADS_KEY = 'campusloop_saved_heads_v1';

export interface PetSpeciesMeta {
  type: PetType;
  name: string;
  category: 'Dog' | 'Cat' | 'Woodland' | 'Farm' | 'Exotic' | 'Fantasy';
  desc: string;
  defaultPersonality: PersonalityType;
  tag: string;
  favFood: string;
  favActivity: string;
  catchphrase: string;
}

export const PET_SPECIES_LIST: PetSpeciesMeta[] = [
  // Dogs
  { type: 'puppy', name: 'Golden Puppy', category: 'Dog', desc: 'Loyal dorm explorer with bright curious eyes and bouncy steps', defaultPersonality: 'playful_puppy', tag: 'Classic', favFood: 'Crunchy Biscuits', favActivity: 'Fetch & Sprinting', catchphrase: 'Woof woof! Let\'s go!' },
  { type: 'corgi', name: 'Cardigan Corgi', category: 'Dog', desc: 'Perky-eared loaf with stubby legs and a heart-shaped tail', defaultPersonality: 'playful_puppy', tag: 'Campus Star', favFood: 'Cheese Cubes', favActivity: 'Belly Rubs', catchphrase: 'Wiggle wiggle!' },
  { type: 'shiba', name: 'Shiba Inu', category: 'Dog', desc: 'Proud golden-tan companion with curly tail and foxlike face', defaultPersonality: 'bold_dino', tag: 'Popular', favFood: 'Salmon Jerky', favActivity: 'Sunbathing', catchphrase: 'Much cozy, very happy!' },
  { type: 'floppy_puppy', name: 'Floppy Hound Puppy', category: 'Dog', desc: 'Gentle soul with velvety drooping ears and soulful sweet eyes', defaultPersonality: 'calm_kitten', tag: 'Cuddly', favFood: 'Peanut Butter Treat', favActivity: 'Nap in Warm Blankets', catchphrase: '*Soft tail thump*' },

  // Cats
  { type: 'kitten', name: 'Cream Peach Kitten', category: 'Cat', desc: 'Soft pastel kitten who loves curled-up study sessions', defaultPersonality: 'calm_kitten', tag: 'Favorite', favFood: 'Tuna Flakes', favActivity: 'Yarn Pouncing', catchphrase: 'Purr... right beside you.' },
  { type: 'fluffy_cat', name: 'Fluffy Ragdoll Cat', category: 'Cat', desc: 'Cloud of soft fur with mesmerizing sky-blue eyes', defaultPersonality: 'calm_kitten', tag: 'Extra Fluffy', favFood: 'Creamy Treat Tube', favActivity: 'Grooming & Lounging', catchphrase: 'Meow, darling.' },
  { type: 'calico_cat', name: 'Tricolor Calico', category: 'Cat', desc: 'Lucky campus talisman with patches of black, orange, and white', defaultPersonality: 'mischievous_croc', tag: 'Lucky Charm', favFood: 'Steamed Shrimp', favActivity: 'Cardboard Box Hideouts', catchphrase: 'Paw-some luck for exams!' },

  // Farm & Friends
  { type: 'piglet', name: 'Teacup Piglet', category: 'Farm', desc: 'Chubby pink companion with a twitchy snout and curly tail', defaultPersonality: 'sleepy_piglet', tag: 'Foodie', favFood: 'Sweet Apples & Melons', favActivity: 'Mud Spas & Snuggling', catchphrase: 'Oink! Is it snack time yet?' },
  { type: 'rabbit', name: 'Chubby Lop Rabbit', category: 'Farm', desc: 'Round puff of fluff with long soft ears and twitchy nose', defaultPersonality: 'calm_kitten', tag: 'Gentle', favFood: 'Crisp Baby Carrots', favActivity: 'Hopping & Chewing Straw', catchphrase: '*Sniff sniff* All good!' },
  { type: 'duck', name: 'Puddle Duckling', category: 'Farm', desc: 'Sunny yellow duckling with orange webbed feet and a soft bill', defaultPersonality: 'cheerful_penguin', tag: 'Sunny', favFood: 'Frozen Peas & Oats', favActivity: 'Splashy Paddle Baths', catchphrase: 'Quack quack! Splish splash!' },

  // Woodland
  { type: 'hamster', name: 'Pouchie Hamster', category: 'Woodland', desc: 'Pocket buddy with round cheeks stuffed with sunflower seeds', defaultPersonality: 'sleepy_piglet', tag: 'Pocket Size', favFood: 'Sunflower Kernels', favActivity: 'Running on Wheel', catchphrase: 'Nom nom nom!' },
  { type: 'fox', name: 'Red Bushy Fox', category: 'Woodland', desc: 'Clever woodland kit with fiery fur and a white-tipped tail', defaultPersonality: 'mischievous_croc', tag: 'Clever', favFood: 'Wild Blackberries', favActivity: 'Sneaky Pounce Games', catchphrase: 'Hehe, what\'s next?' },
  { type: 'bear', name: 'Honey Brown Bear', category: 'Woodland', desc: 'Round teddy-like cub with warm brown fur and gentle paws', defaultPersonality: 'sleepy_piglet', tag: 'Warm Hugs', favFood: 'Honey Toast & Berries', favActivity: 'Big Bear Hugs', catchphrase: 'Roar! (Gently)' },
  { type: 'red_panda', name: 'Cinnamon Red Panda', category: 'Woodland', desc: 'Sweet arboreal friend with a ringed bushy tail and white brow marks', defaultPersonality: 'playful_puppy', tag: 'Adorable', favFood: 'Bamboo Shoots & Grapes', favActivity: 'Two-Legged Paws Up Stand', catchphrase: 'Rawr! (I am fierce!)' },

  // Exotic & Unique
  { type: 'capybara', name: 'Zen Capybara', category: 'Exotic', desc: 'The chillest animal on Earth. Friend to every student and creature', defaultPersonality: 'gentle_capybara', tag: 'Zen Master', favFood: 'Fresh Lettuce & Melon', favActivity: 'Hot Spring Soaks with Yuzu', catchphrase: 'Ok I pull up... relax.' },
  { type: 'crocodile', name: 'Baby River Croc', category: 'Exotic', desc: 'Mischievous little reptile with toothy smile and soft tummy', defaultPersonality: 'mischievous_croc', tag: 'Playful Beast', favFood: 'Grilled Fish Bites', favActivity: 'Mud Slides & Sneaking', catchphrase: 'Chomp! Just kidding!' },
  { type: 'penguin', name: 'Waddling Penguin', category: 'Exotic', desc: 'Formal-suited waddler ready for exam season with cute wing flaps', defaultPersonality: 'cheerful_penguin', tag: 'Study Buddy', favFood: 'Tiny Anchovies', favActivity: 'Ice Belly Sliding', catchphrase: 'Flap flap! Onward to A+!' },
  { type: 'dino', name: 'Baby Sprout Dino', category: 'Exotic', desc: 'Pastel green prehistoric cutie with soft back plates', defaultPersonality: 'bold_dino', tag: 'Dino Power', favFood: 'Clover Salad', favActivity: 'Stompy Happy Dance', catchphrase: 'Rawrr means I love you!' },

  // Fantasy
  { type: 'dragon', name: 'Starlight Dragon', category: 'Fantasy', desc: 'Pastel winged fledgling breathing tiny puffs of heart-shaped smoke', defaultPersonality: 'bold_dino', tag: 'Mythical', favFood: 'Starfruit Slices', favActivity: 'Gliding Over Books', catchphrase: '*Sparkle puff* Behold my magic!' },
  { type: 'unicorn', name: 'Dreamy Unicorn', category: 'Fantasy', desc: 'Pastel rainbow-maned foal with an iridescent spiral horn', defaultPersonality: 'cheerful_penguin', tag: 'Magical', favFood: 'Sugar Plum Treats', favActivity: 'Spreading Rainbow Trails', catchphrase: 'May your dreams sparkle!' },
];

export const PERSONALITY_PRESETS: Record<PersonalityType, { title: string; desc: string; sampleGreeting: string }> = {
  playful_puppy: {
    title: 'Playful & Energetic',
    desc: 'High spirited, enthusiastic, always wants to play and loves cheering you on.',
    sampleGreeting: 'You\'re back! I waited right by the door for you! What are we doing today?'
  },
  calm_kitten: {
    title: 'Calm & Affectionate',
    desc: 'Gentle, soothing presence that loves quiet study sessions and cozy cuddles.',
    sampleGreeting: 'Welcome home... take a deep breath. Let\'s curl up and relax.'
  },
  mischievous_croc: {
    title: 'Mischievous & Curious',
    desc: 'Cheeky jokes, playful teasing, and endless curiosity about campus life.',
    sampleGreeting: 'Hehe, look who finally showed up! Did you bring me anything good from the cafe?'
  },
  sleepy_piglet: {
    title: 'Sleepy Foodie',
    desc: 'Loves delicious snacks, afternoon naps, and reminding you not to skip meals.',
    sampleGreeting: '*Yawns* Oh hey! Did you eat lunch yet? Because I was dreaming of snacks...'
  },
  scholarly_owl: {
    title: 'Scholarly & Wise',
    desc: 'Thoughtful, supportive, great listener, and loves discussing coursework and ideas.',
    sampleGreeting: 'Greetings! Ready to conquer your assignments today? Remember to stay hydrated.'
  },
  cheerful_penguin: {
    title: 'Cheerful & Dramatic',
    desc: 'Expressive, excitable, treats everyday campus moments like grand adventures.',
    sampleGreeting: 'TA-DA! The greatest companion in campus history is delighted by your arrival!'
  },
  gentle_capybara: {
    title: 'Zen & Unbothered',
    desc: 'Deeply relaxed, peaceful aura that instantly dissolves exam stress.',
    sampleGreeting: 'Hello friend. Don\'t rush. Everything is going to be just fine.'
  },
  bold_dino: {
    title: 'Bold & Adventurous',
    desc: 'Courageous, fiery optimism, ready to tackle any tough midterm with you.',
    sampleGreeting: 'Rrr-rawr! Today is our day! Nothing can stop us!'
  }
};

export const SHOP_ITEMS: PetShopItem[] = [
  // Foods
  { id: 'food_bento', name: 'Campus Study Bento', category: 'food', cost: 15, icon: '🍱', description: 'Fresh salmon, tamagoyaki & rice. +35 Hunger, +15 Happiness', effectLabel: '+35 Hunger' },
  { id: 'food_berries', name: 'Sweet Forest Berries', category: 'food', cost: 10, icon: '🍓', description: 'Juicy strawberries and blueberries. +20 Hunger, +20 Happiness', effectLabel: '+20 Hunger, +20 Happy' },
  { id: 'food_boba', name: 'Mini Matcha Boba', category: 'food', cost: 20, icon: '🧋', description: 'Campus favourite iced drink with mini tapioca pearls. +25 Happiness', effectLabel: '+25 Happy' },
  { id: 'food_golden_apple', name: 'Dean\'s Golden Apple', category: 'food', cost: 45, icon: '🍎', description: 'Special harvest apple. +40 Hunger, +30 Energy, +30 Happiness', effectLabel: 'Full Recovery' },
  { id: 'food_fish_treat', name: 'Crispy Salmon Flakes', category: 'food', cost: 12, icon: '🐟', description: 'Savory crispy snack packed with omega-3s for fluffy coats.', effectLabel: '+25 Hunger' },

  // Toys
  { id: 'toy_yarn', name: 'Rainbow Wool Yarn', category: 'toy', cost: 25, icon: '🧶', description: 'Soft bouncy ball with a tinkling bell inside. +30 Happiness', effectLabel: '+30 Happy' },
  { id: 'toy_duck', name: 'Squeaky Yellow Duck', category: 'toy', cost: 20, icon: '🦆', description: 'Classic rubber duck that lets out a merry squeak when poked.', effectLabel: '+20 Happy' },
  { id: 'toy_soccer', name: 'Mini Foam Soccer Ball', category: 'toy', cost: 30, icon: '⚽', description: 'Lightweight ball for active dribbling across the dorm rug.', effectLabel: '+35 Happy, +20 Exp' },
  { id: 'toy_wand', name: 'Sparkle Feather Wand', category: 'toy', cost: 35, icon: '🪄', description: 'Iridescent ribbons and soft feathers for high-jump leaps.', effectLabel: '+40 Happy' },

  // Accessories & Outfits
  { id: 'acc_grad_cap', name: 'Dean\'s Scholar Cap', category: 'accessory', cost: 60, icon: '🎓', description: 'Collegiate graduation cap with gleaming gold tassel.' },
  { id: 'acc_glasses', name: 'Honor Roll Wire Glasses', category: 'accessory', cost: 40, icon: '👓', description: 'Round gold-rimmed spectacles for late night reading.' },
  { id: 'acc_party_crown', name: 'Royal Golden Crown', category: 'accessory', cost: 120, icon: '👑', description: 'Majestic miniature crown with ruby and emerald gems.' },
  { id: 'acc_flower_crown', name: 'Pastel Daisy Crown', category: 'accessory', cost: 50, icon: '🌸', description: 'Hand-woven fresh spring daisies and baby\'s breath.' },
  { id: 'acc_beanie', name: 'Campus Knitted Beanie', category: 'accessory', cost: 45, icon: '🧢', description: 'Slouchy ribbed beanie in warm oatmeal wool.' },
  { id: 'acc_cool_shades', name: 'Star-Strut Sunshades', category: 'accessory', cost: 55, icon: '🕶️', description: 'Sleek dark shades for strolling through campus corridors.' },
  { id: 'acc_bow', name: 'Peach Satin Ribbon Bow', category: 'accessory', cost: 30, icon: '🎀', description: 'Silky pastel ribbon tied with loving care.' },
  { id: 'acc_scarf', name: 'Lecture Hall Knitted Scarf', category: 'accessory', cost: 40, icon: '🧣', description: 'Striped collegiate scarf to stay warm in freezing air-con.' },
  { id: 'acc_sweater', name: 'Varsity Cableknit Sweater', category: 'accessory', cost: 80, icon: '🧶', description: 'Classic campus knit sweater with heritage stripes.' },
  { id: 'acc_raincoat', name: 'Sunny Puddle Raincoat', category: 'accessory', cost: 75, icon: '🧥', description: 'Waterproof bright yellow coat for rainy monsoon days.' },
  { id: 'acc_cozy_hoodie', name: 'Oversized Campus Hoodie', category: 'accessory', cost: 85, icon: '👕', description: 'Ultra-soft fleece hoodie with tiny ear holes.' },
  { id: 'acc_badge', name: 'Eco Champion Star Badge', category: 'accessory', cost: 35, icon: '⭐', description: 'Gleaming golden star for sustainable campus trading.' },
  { id: 'acc_chef_hat', name: 'Master Chef Hat', category: 'accessory', cost: 65, icon: '🧑‍🍳', description: 'Tall white toque for culinary and baking adventures.' },
  { id: 'acc_backpack', name: 'Miniature Student Satchel', category: 'accessory', cost: 50, icon: '🎒', description: 'Tiny faux-leather bag packed with miniature pencils.' },

  // Themes
  { id: 'theme_dorm', name: 'Cozy Campus Dorm', category: 'theme', cost: 0, icon: '🛏️', description: 'Warm fairy lights, textbook shelf, study rug, and desk lamp.' },
  { id: 'theme_garden', name: 'Pastel Sakura Garden', category: 'theme', cost: 150, icon: '🌸', description: 'Fluttering cherry blossom petals, stone lantern and wooden deck.' },
  { id: 'theme_library', name: 'Midnight Library Nook', category: 'theme', cost: 180, icon: '📚', description: 'Tall mahogany bookshelves, brass lamp and stained glass window.' },
  { id: 'theme_dreamland', name: 'Cloud Dreamland', category: 'theme', cost: 220, icon: '☁️', description: 'Fluffy pink marshmallow clouds, crescent moon and star mobile.' },
  { id: 'theme_tropical', name: 'Tropical River Haven', category: 'theme', cost: 200, icon: '🌴', description: 'Gentle babbling stream, smooth river pebbles and lush ferns.' }
];

const INITIAL_COMMUNITY_PETS: CommunityPet[] = [
  {
    id: 'cpet-1',
    ownerName: 'Nurul Aisyah',
    ownerFaculty: 'Faculty of Computing (UTM)',
    petName: 'Boba',
    petType: 'corgi',
    growthStage: 'young',
    level: 5,
    mood: 'excited',
    accessory: 'grad_cap',
    quote: 'Boba supervised my entire Operating Systems lab and didn\'t fall asleep once!',
    pawsCount: 42,
    roomTheme: 'dorm'
  },
  {
    id: 'cpet-2',
    ownerName: 'Darren Tan',
    ownerFaculty: 'Faculty of Electrical Engineering',
    petName: 'Matcha',
    petType: 'capybara',
    growthStage: 'grown',
    level: 8,
    mood: 'content',
    accessory: 'flower_crown',
    quote: 'Finals week? Matcha recommends taking a deep breath and drinking warm tea.',
    pawsCount: 78,
    roomTheme: 'garden'
  },
  {
    id: 'cpet-3',
    ownerName: 'Siti Sarah',
    ownerFaculty: 'Faculty of Built Environment',
    petName: 'Waffles',
    petType: 'piglet',
    growthStage: 'young',
    level: 4,
    mood: 'happy',
    accessory: 'chef_hat',
    quote: 'Always reminding me to take lunch breaks between studio drafting sessions!',
    pawsCount: 31,
    roomTheme: 'dorm'
  },
  {
    id: 'cpet-4',
    ownerName: 'Kavita Nair',
    ownerFaculty: 'Faculty of Science',
    petName: 'Pip',
    petType: 'penguin',
    growthStage: 'baby',
    level: 3,
    mood: 'happy',
    accessory: 'scarf',
    quote: 'Waddling through physics formulas with utmost determination.',
    pawsCount: 56,
    roomTheme: 'library'
  },
  {
    id: 'cpet-5',
    ownerName: 'Hafiz Rahim',
    ownerFaculty: 'Faculty of Mechanical Engineering',
    petName: 'Sprout',
    petType: 'dino',
    growthStage: 'young',
    level: 6,
    mood: 'playful',
    accessory: 'cool_shades',
    quote: 'We built a CAD model of a giant chew toy. 10/10 would engineer again.',
    pawsCount: 64,
    roomTheme: 'tropical'
  }
];

export const petWorldService = {
  // --- GET PET ---
  getPet(): VirtualPet {
    try {
      const raw = localStorage.getItem(PET_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Ensure all required fields exist for backward compatibility
        return this.sanitizePet(parsed);
      }
    } catch (e) {
      console.warn('Could not read pet from localStorage:', e);
    }

    const defaultPet = this.createDefaultPet();
    this.savePet(defaultPet);
    return defaultPet;
  },

  createDefaultPet(): VirtualPet {
    return {
      name: 'Mochi',
      type: 'corgi',
      petType: 'corgi',
      mood: 'happy',
      hunger: 85,
      energy: 90,
      happiness: 95,
      cleanliness: 90,
      level: 3,
      exp: 40,
      petPoints: 180,
      accessory: 'grad_cap',
      roomTheme: 'dorm',
      roomDecorations: ['cushion_bed', 'snack_bowl', 'potted_monstera', 'wool_yarn', 'fairy_lights'],
      isCustomPet: false,
      selectedBodyType: 'corgi',
      customHead: null,

      personalityType: 'playful_puppy',
      personalityTitle: 'Playful & Energetic',
      speakingStyle: 'enthusiastic',
      favouriteActivity: 'Belly Rubs & Library Strolls',
      favouriteFood: 'Cheese Cubes & Berry Bento',
      catchphrase: 'Woof woof! We got this!',
      memoryEnabled: true,
      memories: [
        {
          id: 'mem-1',
          topic: 'University Course',
          detail: 'Alex is studying engineering at UTM campus.',
          date: 'Yesterday',
          source: 'user'
        },
        {
          id: 'mem-2',
          topic: 'Favourite Treat',
          detail: 'Loves iced matcha and campus cafeteria snacks.',
          date: '2 days ago',
          source: 'chat'
        }
      ],
      chatHistory: [
        {
          id: 'chat-1',
          sender: 'pet',
          text: 'Woof! Welcome to Pet World! I\'m Mochi, your campus companion. How was your day at university?',
          timestamp: 'Just now',
          moodReaction: 'happy'
        }
      ],

      growthStage: 'young',
      friendshipLevel: 3,
      friendshipExp: 65,
      lastFed: 'An hour ago',
      lastBathed: 'Yesterday',
      lastPlayed: 'Today',
      lastRested: 'Last night',
      lastToilet: 'Today',
      dailyPointsEarned: 50,
      maxDailyPoints: 350,
      achievements: [
        'Welcome to Pet World',
        'First Belly Rub',
        'Campus Scholar',
        'Clean Whiskers'
      ],
      inventory: ['food_bento', 'food_berries', 'toy_yarn', 'acc_grad_cap', 'acc_glasses', 'acc_bow', 'theme_dorm'],
      isPublicInShowcase: true
    };
  },

  sanitizePet(p: any): VirtualPet {
    const defaults = this.createDefaultPet();
    const level = typeof p.level === 'number' ? p.level : 1;
    const growthStage: GrowthStage = level >= 8 ? 'grown' : level >= 4 ? 'young' : 'baby';

    return {
      ...defaults,
      ...p,
      type: p.type || p.petType || 'corgi',
      petType: p.petType || p.type || 'corgi',
      hunger: typeof p.hunger === 'number' ? Math.min(100, Math.max(0, p.hunger)) : 80,
      energy: typeof p.energy === 'number' ? Math.min(100, Math.max(0, p.energy)) : 80,
      happiness: typeof p.happiness === 'number' ? Math.min(100, Math.max(0, p.happiness)) : 80,
      cleanliness: typeof p.cleanliness === 'number' ? Math.min(100, Math.max(0, p.cleanliness)) : 85,
      petPoints: typeof p.petPoints === 'number' ? p.petPoints : 150,
      growthStage: p.growthStage || growthStage,
      friendshipLevel: typeof p.friendshipLevel === 'number' ? p.friendshipLevel : Math.max(1, Math.floor(level / 2)),
      friendshipExp: typeof p.friendshipExp === 'number' ? p.friendshipExp : 40,
      personalityType: p.personalityType || 'playful_puppy',
      memories: Array.isArray(p.memories) ? p.memories : defaults.memories,
      chatHistory: Array.isArray(p.chatHistory) ? p.chatHistory : defaults.chatHistory,
      inventory: Array.isArray(p.inventory) ? p.inventory : defaults.inventory,
      roomDecorations: Array.isArray(p.roomDecorations) ? p.roomDecorations : defaults.roomDecorations,
      dailyPointsEarned: typeof p.dailyPointsEarned === 'number' ? p.dailyPointsEarned : 0,
      maxDailyPoints: 350,
      memoryEnabled: p.memoryEnabled !== false,
    };
  },

  savePet(pet: VirtualPet): VirtualPet {
    try {
      localStorage.setItem(PET_STORAGE_KEY, JSON.stringify(pet));
    } catch (e) {
      console.error('Failed to save pet to localStorage:', e);
    }
    return pet;
  },

  // --- ADOPT A READY-MADE PET ---
  adoptPet(type: PetType, name: string, personality: PersonalityType): VirtualPet {
    const current = this.getPet();
    const meta = PET_SPECIES_LIST.find(s => s.type === type);
    const pMeta = PERSONALITY_PRESETS[personality];

    const updated: VirtualPet = {
      ...current,
      name: name.trim() || meta?.name || 'Mochi',
      type,
      petType: type,
      selectedBodyType: type,
      isCustomPet: false,
      customHead: null,
      personalityType: personality,
      personalityTitle: pMeta?.title || 'Friendly Companion',
      favouriteFood: meta?.favFood || current.favouriteFood,
      favouriteActivity: meta?.favActivity || current.favouriteActivity,
      catchphrase: meta?.catchphrase || current.catchphrase,
      mood: 'excited',
      chatHistory: [
        {
          id: `chat-${Date.now()}`,
          sender: 'pet',
          text: `Hi there! I\'m ${name.trim() || meta?.name}! I\'m so happy you adopted me into your dorm room. Let\'s make wonderful memories!`,
          timestamp: 'Just now',
          moodReaction: 'excited'
        }
      ]
    };

    return this.savePet(updated);
  },

  // --- CUSTOM PET STUDIO SAVE ---
  saveCustomPet(
    name: string,
    bodyType: PetType,
    personality: PersonalityType,
    customHead: CustomHeadConfig
  ): VirtualPet {
    const current = this.getPet();
    const pMeta = PERSONALITY_PRESETS[personality];

    const updated: VirtualPet = {
      ...current,
      name: name.trim() || 'Custom Buddy',
      type: bodyType,
      petType: bodyType,
      selectedBodyType: bodyType,
      isCustomPet: true,
      customHead,
      personalityType: personality,
      personalityTitle: pMeta?.title || 'Custom Companion',
      mood: 'excited',
      chatHistory: [
        {
          id: `chat-${Date.now()}`,
          sender: 'pet',
          text: `Ta-da! Look at my new custom look! How do I look? I feel amazing!`,
          timestamp: 'Just now',
          moodReaction: 'excited'
        }
      ]
    };

    // Automatically add to user's persistent "My Saved Heads" image gallery
    this.saveHeadImage(name.trim() || 'My Custom Head', customHead);

    return this.savePet(updated);
  },

  // --- POINTS & PROGRESSION ---
  awardPoints(pet: VirtualPet, amount: number, reason: string): { pet: VirtualPet; awarded: number } {
    const currentEarned = pet.dailyPointsEarned || 0;
    const remainingCap = Math.max(0, pet.maxDailyPoints - currentEarned);
    const actualAward = Math.min(amount, remainingCap);

    let nextExp = pet.exp + Math.ceil(amount / 2);
    let nextLevel = pet.level;
    let nextFriendshipExp = pet.friendshipExp + Math.ceil(amount / 3);
    let nextFriendshipLevel = pet.friendshipLevel;
    let newAchievements = [...pet.achievements];

    // Level up check (every 100 EXP)
    while (nextExp >= 100) {
      nextLevel += 1;
      nextExp -= 100;
      if (!newAchievements.includes(`Level ${nextLevel} Milestone`)) {
        newAchievements.push(`Level ${nextLevel} Milestone`);
      }
    }

    // Friendship level up check (every 100 Friendship EXP)
    while (nextFriendshipExp >= 100) {
      nextFriendshipLevel += 1;
      nextFriendshipExp -= 100;
      if (!newAchievements.includes(`Friendship Rank ${nextFriendshipLevel}`)) {
        newAchievements.push(`Friendship Rank ${nextFriendshipLevel}`);
      }
    }

    const growthStage: GrowthStage = nextLevel >= 8 ? 'grown' : nextLevel >= 4 ? 'young' : 'baby';

    const updated: VirtualPet = {
      ...pet,
      petPoints: pet.petPoints + actualAward,
      dailyPointsEarned: currentEarned + actualAward,
      exp: nextExp,
      level: nextLevel,
      friendshipExp: nextFriendshipExp,
      friendshipLevel: nextFriendshipLevel,
      growthStage,
      achievements: newAchievements
    };

    this.savePet(updated);
    return { pet: updated, awarded: actualAward };
  },

  // Daily check-in claim
  claimDailyCheckin(pet: VirtualPet): { pet: VirtualPet; success: boolean; message: string } {
    const today = new Date().toDateString();
    if (pet.lastDailyClaim === today) {
      return { pet, success: false, message: 'You have already collected today\'s 🐾 50 Pet Points! Come back tomorrow.' };
    }

    const { pet: updated, awarded } = this.awardPoints(
      { ...pet, lastDailyClaim: today, dailyPointsEarned: 0 },
      50,
      'Daily Check-in'
    );

    return { 
      pet: updated, 
      success: true, 
      message: `🎉 Daily Check-in Collected! +${awarded} Pet Points awarded!` 
    };
  },

  // --- INTERACTIONS ---
  feedPet(pet: VirtualPet, foodItemId?: string): { pet: VirtualPet; message: string } {
    const hungerGain = 30;
    const happinessGain = 15;
    const energyGain = 5;

    let pointsAwarded = 15;
    let foodName = 'delicious snack';

    if (foodItemId) {
      const item = SHOP_ITEMS.find(i => i.id === foodItemId);
      if (item) foodName = item.name;
    }

    const updatedStats: VirtualPet = {
      ...pet,
      hunger: Math.min(100, pet.hunger + hungerGain),
      happiness: Math.min(100, pet.happiness + happinessGain),
      energy: Math.min(100, pet.energy + energyGain),
      mood: 'happy',
      lastFed: 'Just now'
    };

    const { pet: withPoints } = this.awardPoints(updatedStats, pointsAwarded, 'Feeding');
    const msg = `Yum! ${pet.name} eagerly devoured the ${foodName}! (+${hungerGain} Hunger, +${happinessGain} Happiness)`;
    return { pet: withPoints, message: msg };
  },

  bathePet(pet: VirtualPet): { pet: VirtualPet; message: string } {
    const happinessGain = 20;
    const cleanlinessGain = 100 - pet.cleanliness;

    const updatedStats: VirtualPet = {
      ...pet,
      cleanliness: 100,
      happiness: Math.min(100, pet.happiness + happinessGain),
      mood: 'clean',
      lastBathed: 'Just now'
    };

    const { pet: withPoints } = this.awardPoints(updatedStats, 20, 'Bathing');
    return { 
      pet: withPoints, 
      message: `Splish splash! ${pet.name} is smelling fresh and squeaky clean! (+100% Cleanliness, +20 Happiness)` 
    };
  },

  restPet(pet: VirtualPet): { pet: VirtualPet; message: string } {
    const updatedStats: VirtualPet = {
      ...pet,
      energy: 100,
      happiness: Math.min(100, pet.happiness + 10),
      mood: 'sleepy',
      lastRested: 'Just now'
    };

    const { pet: withPoints } = this.awardPoints(updatedStats, 10, 'Tucking into bed');
    return { 
      pet: withPoints, 
      message: `Shh... ${pet.name} is curled up cozily in bed, snoring softly. Energy fully restored! (⚡ 100%)` 
    };
  },

  toiletPet(pet: VirtualPet): { pet: VirtualPet; message: string } {
    const updatedStats: VirtualPet = {
      ...pet,
      cleanliness: Math.min(100, pet.cleanliness + 15),
      happiness: Math.min(100, pet.happiness + 10),
      mood: 'content',
      lastToilet: 'Just now'
    };

    const { pet: withPoints } = this.awardPoints(updatedStats, 15, 'Tidying litter/potty');
    return { 
      pet: withPoints, 
      message: `Sparkle clean! ${pet.name} used the tidy potty area and gave you a thankful paw! ✨` 
    };
  },

  equipAccessory(pet: VirtualPet, accessory: PetAccessory): VirtualPet {
    const updated: VirtualPet = {
      ...pet,
      accessory,
      mood: 'excited'
    };
    return this.savePet(updated);
  },

  changeRoomTheme(pet: VirtualPet, theme: VirtualPet['roomTheme']): VirtualPet {
    const updated: VirtualPet = {
      ...pet,
      roomTheme: theme
    };
    return this.savePet(updated);
  },

  // --- MEMORY SYSTEM ---
  addMemory(pet: VirtualPet, topic: string, detail: string, source: 'chat' | 'interaction' | 'user' = 'chat'): VirtualPet {
    if (!pet.memoryEnabled) return pet;

    const newMemory: PetMemory = {
      id: `mem-${Date.now()}`,
      topic,
      detail,
      date: 'Just now',
      source
    };

    const updated: VirtualPet = {
      ...pet,
      memories: [newMemory, ...pet.memories.slice(0, 19)] // Keep up to 20 memories
    };

    return this.savePet(updated);
  },

  updateMemory(pet: VirtualPet, memoryId: string, updatedDetail: string): VirtualPet {
    const updated: VirtualPet = {
      ...pet,
      memories: pet.memories.map(m => m.id === memoryId ? { ...m, detail: updatedDetail } : m)
    };
    return this.savePet(updated);
  },

  deleteMemory(pet: VirtualPet, memoryId: string): VirtualPet {
    const updated: VirtualPet = {
      ...pet,
      memories: pet.memories.filter(m => m.id !== memoryId)
    };
    return this.savePet(updated);
  },

  toggleMemory(pet: VirtualPet): VirtualPet {
    const updated: VirtualPet = {
      ...pet,
      memoryEnabled: !pet.memoryEnabled
    };
    return this.savePet(updated);
  },

  // --- CONVERSATION & CHAT INTELLIGENCE ENGINE ---
  async generatePetReply(
    pet: VirtualPet, 
    userMessage: string, 
    userName: string = 'Alex'
  ): Promise<{ text: string; moodReaction: PetMood; extractedMemory?: { topic: string; detail: string } }> {
    const msg = userMessage.toLowerCase().trim();
    const pType = pet.personalityType;
    const name = pet.name;
    const catchphrase = pet.catchphrase;

    // Detect if user is sharing a memorable fact:
    let extractedMemory: { topic: string; detail: string } | undefined;

    if (msg.includes('my major is') || msg.includes('i study') || msg.includes('studying')) {
      const match = userMessage.match(/(?:my major is|i study|studying)\s+([a-zA-Z\s]+)/i);
      if (match && match[1]) {
        extractedMemory = { topic: 'Studies', detail: `${userName} studies ${match[1].trim()}` };
      }
    } else if (msg.includes('i love') || msg.includes('my favourite is') || msg.includes('favorite')) {
      extractedMemory = { topic: 'Favorites', detail: `${userName} shared: "${userMessage}"` };
    } else if (msg.includes('tired') || msg.includes('exhausted') || msg.includes('stress') || msg.includes('exam')) {
      extractedMemory = { topic: 'Mood State', detail: `${userName} had a stressful/tiring academic day` };
    } else if (msg.includes('project') || msg.includes('finished') || msg.includes('done with')) {
      extractedMemory = { topic: 'Accomplishment', detail: `${userName} completed an important campus task` };
    }

    // Contextual responses tailored to personality
    let reply = '';
    let reaction: PetMood = 'happy';

    // 1. Fatigue / Stress
    if (msg.includes('tired') || msg.includes('exhausted') || msg.includes('rough day') || msg.includes('hard day') || msg.includes('stress')) {
      reaction = 'content';
      if (pType === 'calm_kitten' || pType === 'gentle_capybara') {
        reply = `Oh no, ${userName}... University days can be so draining. Come sit down and rest with me. Do you want to talk about what happened, or should we just enjoy some calm silence together?`;
      } else if (pType === 'playful_puppy') {
        reply = `Aww, rough day? Let me give you the biggest, gentlest tail-wagging hug! ${catchphrase} You worked so hard today, and I am so super proud of you!`;
      } else if (pType === 'sleepy_piglet') {
        reply = `*Rubs snout against your hand* You sound completely worn out. Let's declare an emergency cozy timeout! How about a cup of warm tea and an afternoon power nap?`;
      } else {
        reply = `I can hear how much energy you spent today, ${userName}. Take off your heavy bag, take a deep breath. You're safe back in our room now.`;
      }
    }
    // 2. Achievements / Finished project / Passed exam
    else if (msg.includes('finished') || msg.includes('submitted') || msg.includes('passed') || msg.includes('did it') || msg.includes('got an a') || msg.includes('celebrate')) {
      reaction = 'excited';
      if (pType === 'cheerful_penguin' || pType === 'bold_dino') {
        reply = `WAIT, YOU ACTUALLY FINISHED IT?! 🎉 THAT IS ENORMOUS! ${catchphrase} We need confetti, celebration dance, and perhaps a celebratory treat?! You are truly unstoppable!`;
      } else if (pType === 'playful_puppy') {
        reply = `YAYYY! *Bounces in happy circles* I knew you could do it! All those late nights at the library paid off! High paw, ${userName}!`;
      } else {
        reply = `Congratulations, ${userName}! That was such a massive hurdle. Celebrating your hard work feels wonderful. Can we share a little celebration snack together?`;
      }
    }
    // 3. Food / Hunger / Eating
    else if (msg.includes('hungry') || msg.includes('dinner') || msg.includes('lunch') || msg.includes('breakfast') || msg.includes('boba') || msg.includes('food')) {
      reaction = 'hungry';
      if (pType === 'sleepy_piglet') {
        reply = `Did someone say FOOD?! *Ears perk up instantly* My tummy is rumbling just thinking about campus cafeteria goodies! Did you grab something tasty for yourself too?`;
      } else {
        reply = `Ooh, food time is the best time! Make sure you don't skip meals between classes, ${userName}. What's on the menu today?`;
      }
    }
    // 4. Greetings
    else if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg.startsWith('yo')) {
      reaction = 'happy';
      const greetingMeta = PERSONALITY_PRESETS[pType]?.sampleGreeting;
      reply = greetingMeta || `Hello ${userName}! It's so nice to chat with you. How are your classes going today?`;
    }
    // 5. Questions about pet / feelings
    else if (msg.includes('how are you') || msg.includes('how do you feel') || msg.includes('you doing')) {
      reaction = pet.happiness > 70 ? 'happy' : 'hungry';
      reply = `I'm feeling cozy right now! My happiness is at ${pet.happiness}% and I love spending time in our room. ${catchphrase} Thanks for asking after me!`;
    }
    // 6. Memory reflection (refer to past memory if available)
    else if (pet.memoryEnabled && pet.memories.length > 0 && (msg.includes('remember') || msg.includes('what do you know') || msg.includes('memory'))) {
      const topMem = pet.memories[0];
      reaction = 'excited';
      reply = `Of course I remember! I remember that ${topMem.detail.toLowerCase()}! I always keep our conversations close to heart.`;
    }
    // 7. General catch-all with personality styling
    else {
      reaction = 'happy';
      if (pType === 'playful_puppy') {
        reply = `That\'s so interesting, ${userName}! Tell me more! I love listening to you talk about your campus day. *Wags tail happily*`;
      } else if (pType === 'calm_kitten') {
        reply = `I understand. *Purrs softly* It feels nice having someone to share your thoughts with. I\'m always right here beside you.`;
      } else if (pType === 'mischievous_croc') {
        reply = `Hehe, really? You campus humans have the wildest stories! ${catchphrase} What are we getting up to next?`;
      } else if (pType === 'scholarly_owl') {
        reply = `A thoughtful observation, ${userName}. Navigating university life is full of lessons like that. Keep your momentum going!`;
      } else {
        reply = `I hear you loud and clear, ${userName}. It makes me so happy when you drop by to chat with me in Pet World!`;
      }
    }

    return { text: reply, moodReaction: reaction, extractedMemory };
  },

  // --- COMMUNITY SHOWCASE ---
  getCommunityPets(): CommunityPet[] {
    try {
      const stored = localStorage.getItem(COMMUNITY_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return INITIAL_COMMUNITY_PETS;
  },

  toggleHighPaw(petId: string): CommunityPet[] {
    const list = this.getCommunityPets();
    const updated = list.map(p => {
      if (p.id === petId) {
        const hasHighPawed = !p.hasHighPawed;
        const pawsCount = hasHighPawed ? p.pawsCount + 1 : Math.max(0, p.pawsCount - 1);
        return { ...p, hasHighPawed, pawsCount };
      }
      return p;
    });
    try {
      localStorage.setItem(COMMUNITY_KEY, JSON.stringify(updated));
    } catch {}
    return updated;
  },

  publishToCommunity(pet: VirtualPet, userQuote: string, ownerName: string, ownerFaculty: string): CommunityPet[] {
    const list = this.getCommunityPets();
    const newEntry: CommunityPet = {
      id: `cpet-${Date.now()}`,
      ownerName: ownerName || 'Campus Student',
      ownerFaculty: ownerFaculty || 'UTM Student',
      petName: pet.name,
      petType: pet.type,
      growthStage: pet.growthStage,
      level: pet.level,
      mood: pet.mood,
      accessory: pet.accessory,
      quote: userQuote.trim() || pet.catchphrase || 'Happy student pet in Pet World!',
      pawsCount: 1,
      hasHighPawed: true,
      isCustomPet: pet.isCustomPet,
      customHead: pet.customHead,
      roomTheme: pet.roomTheme || 'dorm'
    };

    const updated = [newEntry, ...list.filter(p => p.ownerName !== ownerName)];
    try {
      localStorage.setItem(COMMUNITY_KEY, JSON.stringify(updated));
    } catch {}
    return updated;
  },

  // --- DAILY MISSIONS ---
  getDailyMissions(): DailyMission[] {
    try {
      const stored = localStorage.getItem(MISSIONS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}

    const initialMissions: DailyMission[] = [
      { id: 'm-1', title: 'Breakfast & Feast', description: 'Feed your pet 2 tasty snacks today', rewardPoints: 30, currentCount: 1, targetCount: 2, completed: false, claimed: false, category: 'feed' },
      { id: 'm-2', title: 'Squeaky Clean Whiskers', description: 'Give your pet a warm bubbly bath', rewardPoints: 25, currentCount: 1, targetCount: 1, completed: true, claimed: false, category: 'bathe' },
      { id: 'm-3', title: 'Playful Moments', description: 'Play a mini-game or toss a toy', rewardPoints: 35, currentCount: 0, targetCount: 1, completed: false, claimed: false, category: 'play' },
      { id: 'm-4', title: 'Heartfelt Chat', description: 'Send a message to your pet and share your day', rewardPoints: 20, currentCount: 1, targetCount: 1, completed: true, claimed: false, category: 'talk' },
      { id: 'm-5', title: 'Fashion Statement', description: 'Try on or equip an accessory in the wardrobe', rewardPoints: 20, currentCount: 0, targetCount: 1, completed: false, claimed: false, category: 'dress' }
    ];

    try {
      localStorage.setItem(MISSIONS_KEY, JSON.stringify(initialMissions));
    } catch {}
    return initialMissions;
  },

  claimMissionReward(missionId: string, pet: VirtualPet): { pet: VirtualPet; missions: DailyMission[]; awarded: number } {
    const missions = this.getDailyMissions();
    let awarded = 0;
    const updatedMissions = missions.map(m => {
      if (m.id === missionId && m.completed && !m.claimed) {
        awarded = m.rewardPoints;
        return { ...m, claimed: true };
      }
      return m;
    });

    try {
      localStorage.setItem(MISSIONS_KEY, JSON.stringify(updatedMissions));
    } catch {}

    if (awarded > 0) {
      const { pet: updatedPet } = this.awardPoints(pet, awarded, 'Mission Reward');
      return { pet: updatedPet, missions: updatedMissions, awarded };
    }

    return { pet, missions: updatedMissions, awarded: 0 };
  },

  // --- SAVED HEADS IMAGE GALLERY ---
  getSavedHeads(): SavedHeadImage[] {
    try {
      const stored = localStorage.getItem(SAVED_HEADS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  },

  saveHeadImage(name: string, config: CustomHeadConfig): SavedHeadImage {
    const list = this.getSavedHeads();
    const newEntry: SavedHeadImage = {
      id: `head-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim() || 'Custom Head Photo',
      imageUrl: config.imageUrl,
      savedAt: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      config,
    };
    const updated = [newEntry, ...list.filter(h => h.imageUrl !== config.imageUrl)];
    try {
      localStorage.setItem(SAVED_HEADS_KEY, JSON.stringify(updated));
    } catch {}
    return newEntry;
  },

  deleteSavedHead(headId: string): { 
    updatedHeads: SavedHeadImage[]; 
    wasActivePetHead: boolean; 
    deletedHead: SavedHeadImage | null 
  } {
    const list = this.getSavedHeads();
    const target = list.find(h => h.id === headId) || null;
    const currentPet = this.getPet();
    const wasActivePetHead = Boolean(
      currentPet.isCustomPet && 
      currentPet.customHead && 
      target && 
      currentPet.customHead.imageUrl === target.imageUrl
    );

    const updatedHeads = list.filter(h => h.id !== headId);
    try {
      localStorage.setItem(SAVED_HEADS_KEY, JSON.stringify(updatedHeads));
    } catch {}

    return { updatedHeads, wasActivePetHead, deletedHead: target };
  },

  removeCustomHeadFromPet(): VirtualPet {
    const current = this.getPet();
    const updated: VirtualPet = {
      ...current,
      isCustomPet: false,
      customHead: null,
      mood: 'happy'
    };
    return this.savePet(updated);
  },

  applySavedHeadToPet(savedHead: SavedHeadImage): VirtualPet {
    const current = this.getPet();
    const updated: VirtualPet = {
      ...current,
      isCustomPet: true,
      customHead: savedHead.config,
      mood: 'excited'
    };
    return this.savePet(updated);
  }
};
