import { 
  Listing, 
  TradeRequest, 
  UserProfile, 
  Review, 
  ChatConversation, 
  VirtualPet, 
  BudgetTransaction, 
  BudgetSettings 
} from '../types';

export const INITIAL_LISTINGS: Listing[] = [
  {
    id: 'list-1',
    title: 'Calculus: Early Transcendentals (8th Ed) - Stewart',
    description: 'Clean copy used for Engineering MAT112. No missing pages, minimal pencil markings in Chapter 3 & 4. Includes laminated quick reference formula sheet. Saved me RM 150 compared to the campus bookstore!',
    price: 45,
    category: 'Textbooks',
    condition: 'Like New',
    location: 'Central Library Foyer / FCSIT Study Area',
    campusLocation: 'Central Library Foyer',
    listingType: 'Trade',
    isbn: '978-1285741550',
    courseCode: 'MAT112',
    author: 'James Stewart',
    edition: '8th Edition',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80'
    ],
    isActualPhoto: true,
    sellerExplanation: 'Selling after scoring A- in MAT112 last semester. Stored in dorm bookshelf.',
    sellerName: 'Danial Hakim',
    sellerContact: 'danial.hakim@campus.edu.my',
    sellerFaculty: 'Mechanical Engineering (Year 2)',
    sellerRating: 4.9,
    createdAt: '2026-10-25T14:30:00Z',
    status: 'Active',
    marketAverage: 65,
    referencePriceMin: 40,
    referencePriceMax: 85,
    competitors: [
      { platform: 'Shopee', price: 78, condition: 'Used', shippingCost: 6.5, matchConfidence: 'Exact' },
      { platform: 'Lazada', price: 92, condition: 'Brand New', shippingCost: 8.0, matchConfidence: 'Exact' },
      { platform: 'Taobao', price: 68, condition: 'Used', shippingCost: 15.0, matchConfidence: 'Close Match' }
    ],
    priceHistory: [
      { date: 'Oct 01', price: 55 },
      { date: 'Oct 15', price: 50 },
      { date: 'Oct 25', price: 45 }
    ]
  },
  {
    id: 'list-2',
    title: 'Logitech MX Master 3S Wireless Performance Mouse',
    description: 'Graphite grey, quiet clicks with 8K DPI sensor. Perfect for architecture, CAD modeling, and programming. Fully tested Bluetooth & Logi Bolt. Comes with USB-C braided charging cable.',
    price: 195,
    category: 'Electronics',
    condition: 'Good',
    location: 'Student Activity Centre (SAC) or KK8 Cafeteria',
    campusLocation: 'Student Activity Centre (SAC)',
    listingType: 'Trade',
    imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80'
    ],
    isActualPhoto: true,
    sellerExplanation: 'Upgraded to trackball mouse for wrist ergonomic reasons. Normal light shine on thumb grip.',
    sellerName: 'Rachel Tan',
    sellerContact: 'rachel.tan@campus.edu.my',
    sellerFaculty: 'Computer Science (Year 3)',
    sellerRating: 4.8,
    createdAt: '2026-10-26T09:15:00Z',
    status: 'Active',
    marketAverage: 285,
    referencePriceMin: 260,
    referencePriceMax: 340,
    competitors: [
      { platform: 'Shopee', price: 299, condition: 'Brand New', shippingCost: 0, matchConfidence: 'Exact' },
      { platform: 'Lazada', price: 315, condition: 'Brand New', shippingCost: 0, matchConfidence: 'Exact' },
      { platform: 'Pinduoduo', price: 250, condition: 'Refurbished', shippingCost: 22.0, matchConfidence: 'Close Match' }
    ],
    priceHistory: [
      { date: 'Oct 10', price: 220 },
      { date: 'Oct 20', price: 205 },
      { date: 'Oct 26', price: 195 }
    ]
  },
  {
    id: 'list-3',
    title: 'Baseus 65W GaN Fast Charger + 100W 2m Cable',
    description: 'Triple-port charger (2x USB-C + 1x USB-A). Charges your laptop, tablet, and iPhone at once from one wall socket in lecture halls or libraries. Lightweight GaN technology.',
    price: 68,
    category: 'Electronics',
    condition: 'Like New',
    location: 'Engineering Faculty Block B or Library',
    campusLocation: 'Engineering Faculty Block B',
    listingType: 'Trade',
    imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80'
    ],
    isActualPhoto: true,
    sellerExplanation: 'Got an extra charger bundled with my new laptop bag. Barely used 2 times.',
    sellerName: 'Farhan Azim',
    sellerContact: 'farhan.azim@campus.edu.my',
    sellerFaculty: 'Electrical Engineering (Year 2)',
    sellerRating: 5.0,
    createdAt: '2026-10-26T16:45:00Z',
    status: 'Active',
    marketAverage: 95,
    referencePriceMin: 85,
    referencePriceMax: 120,
    competitors: [
      { platform: 'Shopee', price: 92, condition: 'Brand New', shippingCost: 4.5, matchConfidence: 'Exact' },
      { platform: 'Lazada', price: 98, condition: 'Brand New', shippingCost: 5.0, matchConfidence: 'Exact' }
    ],
    priceHistory: [
      { date: 'Oct 20', price: 75 },
      { date: 'Oct 26', price: 68 }
    ]
  },
  {
    id: 'list-4',
    title: 'Foldable Dorm Study Desk + Ergonomic Mesh Chair',
    description: 'Moving out of Kolej Kediaman 4. Desk measures 100cm x 60cm, sturdy steel legs. Mesh chair has adjustable lumbar support. Fits easily into dorm bedrooms.',
    price: 110,
    category: 'Dorm Essentials',
    condition: 'Good',
    location: 'Kolej Kediaman 4 (KK4), Block C Ground Floor',
    campusLocation: 'Kolej Kediaman 4 (KK4)',
    listingType: 'Clearance',
    clearanceTag: 'Moving Out',
    isBundle: true,
    imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=600&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=600&q=80'
    ],
    isActualPhoto: true,
    sellerExplanation: 'Moving to off-campus apartment with furnished furniture. Self-pickup at KK4 lobby.',
    sellerName: 'Mei Ling',
    sellerContact: 'meiling.chan@campus.edu.my',
    sellerFaculty: 'Business & Accountancy (Year 3)',
    sellerRating: 4.7,
    createdAt: '2026-10-24T18:20:00Z',
    status: 'Active',
    marketAverage: 180,
    referencePriceMin: 150,
    referencePriceMax: 240,
    competitors: [
      { platform: 'Shopee', price: 165, condition: 'Brand New', shippingCost: 35.0, matchConfidence: 'Close Match' },
      { platform: 'Taobao', price: 140, condition: 'Brand New', shippingCost: 60.0, matchConfidence: 'Close Match' }
    ],
    priceHistory: [
      { date: 'Oct 15', price: 130 },
      { date: 'Oct 24', price: 110 }
    ]
  },
  {
    id: 'list-5',
    title: 'Arduino Mega 2560 R3 + Full Sensor Lab Kit',
    description: 'Complete with breadboard, ultrasonic sensors, stepper motor, RFID reader, and jumper wires. Essential for embedded systems, mechatronics, and IoT projects.',
    price: 75,
    category: 'Project Equipment',
    condition: 'Brand New',
    location: 'Engineering Lab 3 / Kolej Kediaman 7',
    campusLocation: 'Engineering Lab 3',
    listingType: 'Trade',
    courseCode: 'ECE205',
    imageUrl: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=600&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=600&q=80'
    ],
    isActualPhoto: true,
    sellerExplanation: 'Bought for semester group project, but teammates ended up using STM32 boards instead.',
    sellerName: 'Kenji Wong',
    sellerContact: 'kenji.wong@campus.edu.my',
    sellerFaculty: 'Computer & Communication Systems',
    sellerRating: 5.0,
    createdAt: '2026-10-27T08:00:00Z',
    status: 'Active',
    marketAverage: 110,
    referencePriceMin: 95,
    referencePriceMax: 145,
    competitors: [
      { platform: 'Shopee', price: 105, condition: 'Brand New', shippingCost: 5.5, matchConfidence: 'Exact' },
      { platform: 'Lazada', price: 115, condition: 'Brand New', shippingCost: 6.0, matchConfidence: 'Exact' },
      { platform: 'Taobao', price: 82, condition: 'Brand New', shippingCost: 18.0, matchConfidence: 'Exact' }
    ],
    priceHistory: [
      { date: 'Oct 20', price: 85 },
      { date: 'Oct 27', price: 75 }
    ]
  },
  {
    id: 'list-6',
    title: 'Campbell Biology 11th Edition (Global Edition)',
    description: 'Gold standard biology reference textbook for pre-med, biotechnology, and biomedical sciences. Crisp color diagrams, glossary, and self-quizzes intact.',
    price: 85,
    category: 'Textbooks',
    condition: 'Like New',
    location: 'Science Faculty Gazebo or Medical Foyer',
    campusLocation: 'Science Faculty Gazebo',
    listingType: 'Trade',
    isbn: '978-1292170435',
    author: 'Lisa A. Urry',
    edition: '11th Edition',
    courseCode: 'BIO101',
    imageUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?auto=format&fit=crop&w=600&q=80',
    isActualPhoto: true,
    sellerExplanation: 'Finished first year pre-clinical bio modules. Handled with protective clear plastic wrapper.',
    sellerName: 'Nurul Izzati',
    sellerContact: 'nurul.izzati@campus.edu.my',
    sellerFaculty: 'Faculty of Science (Biotech)',
    sellerRating: 4.9,
    createdAt: '2026-10-25T11:30:00Z',
    status: 'Active',
    marketAverage: 145,
    referencePriceMin: 120,
    referencePriceMax: 190,
    competitors: [
      { platform: 'Shopee', price: 135, condition: 'Used', shippingCost: 8.0, matchConfidence: 'Exact' },
      { platform: 'Lazada', price: 175, condition: 'Brand New', shippingCost: 10.0, matchConfidence: 'Exact' }
    ],
    priceHistory: [
      { date: 'Oct 05', price: 110 },
      { date: 'Oct 18', price: 95 },
      { date: 'Oct 25', price: 85 }
    ]
  }
];

export const INITIAL_TRADE_REQUESTS: TradeRequest[] = [
  {
    id: 'req-1',
    listingId: 'list-1',
    listingTitle: 'Calculus: Early Transcendentals (8th Ed)',
    listingPrice: 45,
    listingImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    sellerName: 'Danial Hakim',
    buyerName: 'Alex Tan',
    buyerContact: '012-345-6789',
    offeredPrice: 40,
    pickupLocation: 'Central Library Foyer',
    message: 'Hi Danial! Can we meet tomorrow at 2 PM after my lecture? I can pay with exact cash or DuitNow.',
    status: 'Pending',
    createdAt: '2026-10-27T08:30:00Z',
    isSentByCurrentUser: true,
  },
  {
    id: 'req-2',
    listingId: 'list-1',
    listingTitle: 'Calculus: Early Transcendentals (8th Ed)',
    listingPrice: 45,
    listingImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    sellerName: 'Danial Hakim',
    buyerName: 'Alex Tan',
    buyerContact: '012-345-6789',
    offeredPrice: 45,
    pickupLocation: 'Central Library Foyer',
    message: 'Thanks for the quick response! Meetup went great.',
    status: 'Completed',
    createdAt: '2026-10-25T15:00:00Z',
    isSentByCurrentUser: true,
    hasBuyerReviewed: true,
    hasSellerReviewed: true,
  }
];

export const INITIAL_USER_PROFILE: UserProfile = {
  name: 'Alex Tan',
  studentId: 'UM2024-88421',
  email: 'alex.tan@student.edu.my',
  faculty: 'Faculty of Computer Science & Information Tech',
  dorm: 'Kolej Kediaman 8 (KK8), Room 314',
  contactHandle: '@alex_tan_um (WhatsApp/Telegram)',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  verifiedStudent: true,
  role: 'both',
  verifiedTransactionsCount: 8,
  savedListingIds: ['list-2', 'list-5'],
};

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    transactionId: 'req-2',
    listingId: 'list-1',
    listingTitle: 'Calculus: Early Transcendentals (8th Ed)',
    reviewerName: 'Alex Tan',
    reviewerRole: 'Buyer',
    revieweeName: 'Danial Hakim',
    rating: 5,
    comment: 'Super fast meetup at the library! The formula sheet and exam summaries were neatly clipped inside as promised. Very friendly senior.',
    isVerifiedTransaction: true,
    createdAt: '2026-10-25T16:00:00Z',
  },
  {
    id: 'rev-2',
    transactionId: 'req-2',
    listingId: 'list-1',
    listingTitle: 'Calculus: Early Transcendentals (8th Ed)',
    reviewerName: 'Danial Hakim',
    reviewerRole: 'Seller',
    revieweeName: 'Alex Tan',
    rating: 5,
    comment: 'Alex arrived right on time at the library entrance with exact cash. Great peer to trade with!',
    isVerifiedTransaction: true,
    createdAt: '2026-10-25T16:15:00Z',
  }
];

export const INITIAL_CHAT_CONVERSATIONS: ChatConversation[] = [
  {
    id: 'chat-rachel',
    type: 'direct',
    name: 'Rachel Tan',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    participants: [
      { id: 'user-rachel', name: 'Rachel Tan', role: 'Seller · FCSIT Year 3' },
      { id: 'user-current', name: 'Alex Tan', role: 'Buyer' }
    ],
    lastMessage: 'Sure Alex, I have the Logi Bolt dongle in my bag. See you at FCSIT Block A at 4:15 PM!',
    lastMessageTime: '10:42 AM',
    unreadCount: 1,
    messages: [
      {
        id: 'msg-1',
        senderId: 'user-current',
        senderName: 'Alex Tan',
        text: 'Hi Rachel! Interested in your Logitech MX Master 3S. Would you be willing to do RM 185?',
        timestamp: '10:30 AM',
        sharedListing: {
          id: 'list-2',
          title: 'Logitech MX Master 3S Wireless Performance Mouse',
          price: 195,
          imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80'
        }
      },
      {
        id: 'msg-2',
        senderId: 'user-rachel',
        senderName: 'Rachel Tan',
        text: 'Hi Alex! Yes, RM 185 is fair since you are also from FCSIT. Are you on campus today?',
        timestamp: '10:35 AM'
      }
    ]
  }
];

export const INITIAL_VIRTUAL_PET: VirtualPet = {
  name: 'Mochi',
  type: 'kitten',
  petType: 'kitten',
  mood: 'happy',
  hunger: 85,
  energy: 75,
  happiness: 92,
  level: 3,
  exp: 45,
  accessory: 'grad_cap',
  roomTheme: 'dorm',
  roomDecorations: ['cushion_bed', 'snack_bowl', 'potted_monstera'],
  lastFed: '2 hours ago',
  lastPlayed: '1 hour ago',
  achievements: [
    'Adopted First Campus Companion',
    'Fed 10 Healthy Dorm Snacks',
    'Completed First CampusLoop Trade'
  ]
};

export const INITIAL_BUDGET_SETTINGS: BudgetSettings = {
  monthlyBudget: 650,
  warningThresholdPercent: 80,
};

export const INITIAL_BUDGET_TRANSACTIONS: BudgetTransaction[] = [
  {
    id: 'tx-1',
    type: 'expense',
    amount: 45,
    category: 'Education',
    date: '2026-10-25',
    note: 'Second-hand Calculus 8th Ed Textbook (Saved RM 150 vs new)',
    importedFromTradeId: 'req-2',
  },
  {
    id: 'tx-2',
    type: 'expense',
    amount: 14.50,
    category: 'Food',
    date: '2026-10-26',
    note: 'Campus Cafeteria Lunch + Teh O Ais',
  },
  {
    id: 'tx-3',
    type: 'income',
    amount: 80,
    category: 'CampusLoop',
    date: '2026-10-24',
    note: 'Sold old graphing calculator to junior',
  }
];


export const POPULAR_CAMPUS_LOCATIONS: string[] = [
  'Central Library Foyer',
  'Student Activity Centre (SAC)',
  'Faculty of Computer Science & IT (FCSIT)',
  'Faculty of Engineering Block B',
  'Faculty of Science Gazebo',
  'Kolej Kediaman 4 (KK4)',
  'Kolej Kediaman 8 (KK8)',
  'Kolej Kediaman 5 (KK5)',
  'Campus Sports Complex',
  'Medical Faculty Foyer',
  'Central Cafeteria',
  'Other',
];
