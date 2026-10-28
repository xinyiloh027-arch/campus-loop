export const ALLOWED_UTM_DOMAINS = [
  'graduate.utm.my',
  'student.utm.my',
  'utm.my',
] as const;

export type UtmDomain = typeof ALLOWED_UTM_DOMAINS[number];

export type AccountState = 
  | 'Signed Out' 
  | 'Email Verification Pending' 
  | 'Verified UTM Member' 
  | 'Suspended';

export interface UTMUser {
  id: string;
  email: string;
  name: string;
  studentId?: string;
  faculty?: string;
  role: 'student' | 'staff';
  accountState: AccountState;
  emailVerified: boolean;
  isSuspended: boolean;
  avatarUrl?: string;
  contactHandle?: string;
  dorm?: string;
  verifiedTransactionsCount?: number;
  createdAt: string;
}

export interface AuthSession {
  token: string;
  user: UTMUser;
  expiresAt: number;
}

export const MALL_CATEGORIES = [
  'Textbooks & Notes',
  'Electronics',
  'Stationery',
  'Dorm Essentials',
  'Clothing & Accessories',
  'Sports & Fitness',
  'Beauty & Personal Care',
  'Food & Snacks',
  'Other Items',
] as const;

export type MallCategory = typeof MALL_CATEGORIES[number];

export type Category = 
  | 'All'
  | 'Textbooks & Notes'
  | 'Electronics'
  | 'Stationery'
  | 'Dorm Essentials'
  | 'Clothing & Accessories'
  | 'Sports & Fitness'
  | 'Beauty & Personal Care'
  | 'Food & Snacks'
  | 'Other Items'
  // Legacy aliases for compatibility
  | 'Textbooks'
  | 'Project Equipment'
  | 'Clothing'
  | 'Sports Equipment'
  | 'Other';

export interface CartItem {
  id: string;
  listingId: string;
  listing: Listing;
  quantity: number;
  selected: boolean;
  addedAt: string;
}

export type Condition = 'Brand New' | 'Like New' | 'Good' | 'Fair';

export type ListingStatus = 'Active' | 'Reserved' | 'Completed' | 'Removed';

export type ListingType = 'Trade' | 'Borrow' | 'Free' | 'Clearance';

export type ClearanceTag = 
  | 'Graduation Clearance' 
  | 'Moving Out' 
  | 'Next Semester Bundle' 
  | 'Flash Deal';

export type UserRole = 'buyer' | 'seller' | 'both';

export type RequestStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Completed';

export interface CompetitorPrice {
  platform: 'Shopee' | 'Lazada' | 'Taobao' | 'Pinduoduo';
  price: number;
  condition: 'Brand New' | 'Refurbished' | 'Used' | 'New';
  shippingCost?: number;
  matchConfidence?: 'Exact' | 'Close Match' | 'General';
  url?: string;
  currency?: string;
  lastUpdated?: string;
}

export interface PriceHistoryPoint {
  date: string;
  price: number;
  source?: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number; // In Ringgit Malaysia (RM)
  category: Exclude<Category, 'All'>;
  condition: Condition;
  campusLocation?: string;
  location?: string;
  imageUrl: string;
  additionalImages?: string[];
  isActualPhoto?: boolean;
  sellerExplanation?: string;
  sellerName: string;
  sellerContact?: string;
  sellerFaculty?: string;
  sellerAvatar?: string;
  sellerRating?: number;
  isUserCreated?: boolean;
  createdAt: string;
  status: ListingStatus;
  listingType?: ListingType;
  
  // Borrowing specifics
  borrowFeePerDay?: number;
  depositRequired?: number;
  maxBorrowDays?: number;
  availablePeriod?: string;
  returnConditions?: string;

  // Clearance and bundles
  clearanceTag?: ClearanceTag;
  isBundle?: boolean;
  bundleItemsCount?: number;

  // Textbook specifics (Edition Checker)
  isbn?: string;
  author?: string;
  edition?: string;
  courseCode?: string;
  publisher?: string;
  publicationYear?: number;

  // Price Intelligence
  referencePriceMin?: number;
  referencePriceMax?: number;
  marketAverage?: number;
  competitors?: CompetitorPrice[];
  priceHistory?: PriceHistoryPoint[];
}

export interface TradeRequest {
  id: string;
  listingId: string;
  listingTitle: string;
  listingPrice: number;
  listingImage: string;
  sellerName: string;
  buyerName: string;
  buyerContact: string;
  offeredPrice: number;
  pickupLocation: string;
  message: string;
  status: RequestStatus;
  createdAt: string;
  isSentByCurrentUser: boolean;
  hasBuyerReviewed?: boolean;
  hasSellerReviewed?: boolean;
}

export type BorrowStatus = 
  | 'Pending' 
  | 'Accepted' 
  | 'Rejected' 
  | 'Ready for Collection' 
  | 'Borrowed' 
  | 'Return Pending' 
  | 'Returned' 
  | 'Cancelled';

export interface BorrowRequest {
  id: string;
  listingId: string;
  listingTitle: string;
  listingImage: string;
  lenderName: string;
  borrowerName: string;
  borrowerContact: string;
  startDate: string;
  endDate: string;
  days: number;
  feePerDay: number;
  totalFee: number;
  deposit: number;
  status: BorrowStatus;
  createdAt: string;
  isSentByCurrentUser: boolean;
}

export interface WantedPost {
  id: string;
  title: string;
  description: string;
  category: Exclude<Category, 'All'>;
  maxBudget: number;
  preferredCondition?: Condition;
  location?: string;
  preferredLocation?: string;
  preferredType?: 'Buy' | 'Borrow' | 'Free';
  interestedMode?: 'Buy' | 'Borrow' | 'Free';
  urgency?: 'Flexible' | 'Medium' | 'Urgent';
  requesterName?: string;
  requesterContact?: string;
  seekerName?: string;
  seekerContact?: string;
  seekerAvatar?: string;
  deadline?: string;
  status: 'Open' | 'Fulfilled' | 'Closed';
  createdAt: string;
  isSentByCurrentUser?: boolean;
  responses?: WantedResponse[];
  responsesCount?: number;
}

export interface WantedResponse {
  id: string;
  wantedPostId: string;
  responderName: string;
  responderContact: string;
  message: string;
  offeredPrice: number;
  linkedListingId?: string;
  createdAt: string;
}

export interface FreeClaimRequest {
  id: string;
  listingId: string;
  listingTitle: string;
  listingImage: string;
  ownerName: string;
  claimantName: string;
  claimantContact: string;
  reason?: string;
  status: 'Pending' | 'Reserved' | 'Claimed' | 'Cancelled';
  createdAt: string;
  isSentByCurrentUser: boolean;
}

export interface UserProfile {
  id?: string;
  name: string;
  studentId: string;
  email: string;
  faculty: string;
  dorm: string;
  contactHandle: string;
  avatarUrl: string;
  verifiedStudent: boolean;
  role: UserRole;
  verifiedTransactionsCount: number;
  savedListingIds: string[];
  accountState?: AccountState;
  emailVerified?: boolean;
  isSuspended?: boolean;
}

export interface Review {
  id: string;
  transactionId: string;
  listingId: string;
  listingTitle: string;
  reviewerName: string;
  reviewerRole: 'Buyer' | 'Seller';
  revieweeName: string;
  rating: number; // 1-5
  comment: string;
  isVerifiedTransaction: boolean;
  reported?: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: string;
  sharedListing?: {
    id: string;
    title: string;
    price: number;
    imageUrl: string;
  };
}

export interface ChatConversation {
  id: string;
  type: 'direct' | 'group';
  name: string;
  avatar?: string;
  participants: Array<{
    id: string;
    name: string;
    role: string;
  }>;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  isBlocked?: boolean;
  messages: ChatMessage[];
}

export type PetType = 
  | 'puppy' 
  | 'corgi' 
  | 'shiba' 
  | 'floppy_puppy'
  | 'kitten' 
  | 'fluffy_cat' 
  | 'calico_cat' 
  | 'piglet' 
  | 'crocodile' 
  | 'rabbit' 
  | 'bunny' 
  | 'hamster' 
  | 'penguin' 
  | 'duck' 
  | 'fox' 
  | 'bear' 
  | 'capybara' 
  | 'red_panda' 
  | 'dino' 
  | 'dragon' 
  | 'unicorn'
  | 'cat' 
  | 'otter' 
  | 'owl';

export type PetMood = 'happy' | 'hungry' | 'sleepy' | 'excited' | 'content' | 'clean' | 'playful';

export type PetActionState = 'idle' | 'eating' | 'bathing' | 'playing' | 'sleeping' | 'toilet' | 'talking' | 'celebrating';

export type GrowthStage = 'baby' | 'young' | 'grown';

export type PetAccessory = 
  | 'none' 
  | 'glasses' 
  | 'grad_cap' 
  | 'scarf' 
  | 'badge' 
  | 'bow' 
  | 'sweater' 
  | 'backpack'
  | 'chef_hat'
  | 'flower_crown'
  | 'party_crown'
  | 'beanie'
  | 'cool_shades'
  | 'raincoat'
  | 'cozy_hoodie'
  | 'bell_collar';

export type PersonalityType = 
  | 'playful_puppy' 
  | 'calm_kitten' 
  | 'mischievous_croc' 
  | 'sleepy_piglet' 
  | 'scholarly_owl' 
  | 'cheerful_penguin' 
  | 'gentle_capybara'
  | 'bold_dino';

export interface CustomHeadConfig {
  imageUrl: string;
  zoom: number; // 0.5 to 2.5
  offsetX: number; // -100 to 100
  offsetY: number; // -100 to 100
  rotation: number; // -45 to 45
  flipHorizontal?: boolean;
  maskShape?: 'circle' | 'oval' | 'smooth' | 'collar';
}

export interface SavedHeadImage {
  id: string;
  name: string;
  imageUrl: string;
  savedAt: string;
  config: CustomHeadConfig;
}

export interface PetMemory {
  id: string;
  topic: string;
  detail: string;
  date: string;
  source: 'chat' | 'interaction' | 'user';
}

export interface PetChatMessage {
  id: string;
  sender: 'user' | 'pet';
  text: string;
  timestamp: string;
  moodReaction?: PetMood;
}

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  rewardPoints: number;
  currentCount: number;
  targetCount: number;
  completed: boolean;
  claimed: boolean;
  category: 'feed' | 'bathe' | 'play' | 'dress' | 'talk' | 'checkin';
}

export interface PetShopItem {
  id: string;
  name: string;
  category: 'food' | 'toy' | 'accessory' | 'furniture' | 'theme';
  cost: number;
  icon: string;
  description: string;
  effectLabel?: string;
  unlocked?: boolean;
}

export interface CommunityPet {
  id: string;
  ownerName: string;
  ownerFaculty: string;
  petName: string;
  petType: PetType;
  growthStage: GrowthStage;
  level: number;
  mood: PetMood;
  accessory: PetAccessory;
  quote: string;
  pawsCount: number;
  hasHighPawed?: boolean;
  isCustomPet?: boolean;
  customHead?: CustomHeadConfig | null;
  roomTheme: string;
}

export interface VirtualPet {
  name: string;
  type: PetType;
  petType?: PetType;
  mood: PetMood;
  hunger: number; // 0 - 100
  energy: number; // 0 - 100
  happiness: number; // 0 - 100
  cleanliness: number; // 0 - 100
  level: number;
  exp: number;
  petPoints: number;
  accessory: PetAccessory;
  outfit?: string;
  roomTheme?: 'dorm' | 'garden' | 'library' | 'dreamland' | 'tropical';
  roomDecorations?: string[];
  
  // Custom Head Studio
  isCustomPet?: boolean;
  selectedBodyType?: PetType;
  customHead?: CustomHeadConfig | null;

  // Personality & Memory
  personalityType: PersonalityType;
  personalityTitle: string;
  speakingStyle: 'friendly' | 'enthusiastic' | 'scholarly' | 'cute' | 'sassy';
  favouriteActivity: string;
  favouriteFood: string;
  catchphrase: string;
  memoryEnabled: boolean;
  memories: PetMemory[];
  chatHistory: PetChatMessage[];

  // Growth & Progression
  growthStage: GrowthStage;
  friendshipLevel: number;
  friendshipExp: number;
  lastFed: string;
  lastBathed?: string;
  lastPlayed: string;
  lastRested?: string;
  lastToilet?: string;
  lastDailyClaim?: string;
  dailyPointsEarned: number;
  maxDailyPoints: number;
  achievements: string[];
  inventory: string[];
  isPublicInShowcase?: boolean;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  plantType?: 'sunflower' | 'succulent' | 'bonsai' | 'lavender';
  plantStage?: string;
  category?: string;
  deadline?: string;
  rewardPetItem?: string;
  isCompleted?: boolean;
  createdAt?: string;
}

export type BudgetCategory = 
  | 'Food'
  | 'Transportation'
  | 'Education'
  | 'Accommodation'
  | 'Entertainment'
  | 'Shopping'
  | 'CampusLoop'
  | 'Other';

export interface BudgetTransaction {
  id: string;
  type: 'expense' | 'income';
  amount: number;
  category: BudgetCategory;
  date: string;
  note?: string;
  importedFromTradeId?: string;
}

export interface BudgetSettings {
  monthlyBudget: number;
  warningThresholdPercent: number;
}

export type NotificationType = 
  | 'trade' 
  | 'borrow' 
  | 'wanted' 
  | 'budget' 
  | 'system'
  | 'trade_request'
  | 'borrow_reminder'
  | 'price_alert'
  | 'budget_warning'
  | 'pet_milestone'
  | 'rental'
  | 'rental_request'
  | 'rental_approved'
  | 'rental_rejected'
  | 'rental_return_reminder'
  | 'rental_inspected'
  | 'rental_refunded'
  | 'rental_dispute';

export interface CampusNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read?: boolean;
  isRead?: boolean;
  timestamp?: string;
  createdAt?: string;
  linkTab?: string;
  relatedRentalId?: string;
}

// ==========================================
// RENTAL SYSTEM TYPES
// ==========================================

export const RENTAL_CATEGORIES = [
  'Calculators & Study Equipment',
  'Electronics',
  'Cameras & Photography',
  'Sports Equipment',
  'Dorm Essentials',
  'Clothing & Accessories',
  'Event & Project Equipment',
  'Other Items',
] as const;

export type RentalCategory = typeof RENTAL_CATEGORIES[number];

export type RentalStatus = 
  | 'Pending Approval'
  | 'Approved'
  | 'Ready for Handover'
  | 'Rented Out'
  | 'Return Pending'
  | 'Inspection Pending'
  | 'Refund Pending'
  | 'Dispute'
  | 'Completed'
  | 'Rejected'
  | 'Cancelled';

export type DepositStatus = 
  | 'Not Paid'
  | 'Paid'
  | 'Refund Pending'
  | 'Refunded'
  | 'Dispute';

export interface RentalItem {
  id: string;
  name: string;
  description: string;
  category: RentalCategory;
  condition: Condition;
  images: string[];
  imageUrl: string;
  pricePerDay: number; // in RM
  securityDeposit: number; // refundable in RM
  availableDates: string;
  pickupLocation: string;
  rules: string;
  ownerId: string;
  ownerName: string;
  ownerContact: string;
  ownerAvatar?: string;
  ownerRating?: number;
  ownerFaculty?: string;
  isAvailable: boolean; // can be paused or deactivated by owner
  isUserCreated?: boolean;
  createdAt: string;
}

export interface RentalRequest {
  id: string;
  rentalItemId: string;
  rentalItemName: string;
  rentalItemImage: string;
  ownerId: string;
  ownerName: string;
  ownerContact: string;
  renterId: string;
  renterName: string;
  renterContact: string;
  startDate: string; // YYYY-MM-DD
  returnDate: string; // YYYY-MM-DD
  days: number;
  pricePerDay: number;
  rentalFeeTotal: number;
  securityDeposit: number;
  totalBeforeRental: number; // rentalFeeTotal + securityDeposit
  pickupLocation: string;
  message?: string;
  status: RentalStatus;
  depositStatus: DepositStatus;

  // Handover condition
  handoverConditionNotes?: string;
  handoverConfirmedAt?: string;

  // Return inspection
  returnReportedAt?: string;
  returnConditionNotes?: string;
  inspectionPassed?: boolean;
  proposedDeduction?: number;
  deductionReason?: string;
  disputeNotes?: string;
  renterDisputeResponse?: string;

  // Refund record
  refundAmount?: number;
  refundDate?: string;
  isSimulatedPayment?: boolean;
  isSentByCurrentUser?: boolean;

  createdAt: string;
  updatedAt: string;
}
