import React, { useState } from 'react';
import { 
  Gift, 
  MapPin, 
  Heart, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Recycle, 
  Search,
  MessageCircle,
  Clock
} from 'lucide-react';
import { Listing } from '../types';

interface FreeReuseViewProps {
  onClaimItem: (item: Listing, pickupSpot: string, note: string) => void;
}

const SAMPLE_FREE_ITEMS: Listing[] = [
  {
    id: 'free-1',
    title: 'Moving Out: 12 Wooden Clothes Hangers & Shoe Rack Set',
    description: 'Graduating this semester! High quality wood hangers and a light 3-tier fabric shoe rack. Good clean condition. Don\'t want them to end up in the campus dumpster.',
    price: 0,
    category: 'Dorm Essentials',
    condition: 'Good',
    sellerName: 'Wong Jia Ling',
    sellerContact: 'jialing.w@campus.edu.my',
    sellerAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    sellerRating: 5.0,
    campusLocation: 'Kolej Kediaman 5 (KK5) Ground Floor',
    imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80',
    createdAt: '2026-10-27T08:00:00Z',
    status: 'Active',
    listingType: 'Free',
  },
  {
    id: 'free-2',
    title: 'Chemistry 101 Lecture Summary Binders + Flashcards',
    description: 'Full semester 1 general chemistry comprehensive revision notes, color-coded summaries, and flashcards. Super helpful for upcoming midterms.',
    price: 0,
    category: 'Textbooks',
    condition: 'Good',
    sellerName: 'Ahmad Daniel',
    sellerContact: 'ahmad.d@campus.edu.my',
    sellerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    sellerRating: 4.9,
    campusLocation: 'Science Faculty Gazebo',
    imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
    createdAt: '2026-10-26T16:20:00Z',
    status: 'Active',
    listingType: 'Free',
  },
  {
    id: 'free-3',
    title: 'Desk Organizer, Pen Holder & Unused Notebooks (Pack of 3)',
    description: 'Surplus stationery from club welcome pack. 3 lined A5 notebooks and a white mesh pen organizer. Completely unused.',
    price: 0,
    category: 'Stationery',
    condition: 'New',
    sellerName: 'Kavita Devi',
    sellerContact: 'kavita.d@campus.edu.my',
    sellerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    sellerRating: 4.8,
    campusLocation: 'FCSIT Student Lounge',
    imageUrl: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=600&q=80',
    createdAt: '2026-10-25T11:00:00Z',
    status: 'Active',
    listingType: 'Free',
  },
  {
    id: 'free-4',
    title: 'Surge Protected 4-Way Power Extension Cord (2 Metres)',
    description: 'Works perfectly, LED switch illuminates. Replaced with longer 5m cable for dual monitor desk setup. Free to any junior needing extra sockets.',
    price: 0,
    category: 'Electronics',
    condition: 'Good',
    sellerName: 'Marcus Teoh',
    sellerContact: 'marcus.t@campus.edu.my',
    sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    sellerRating: 5.0,
    campusLocation: 'Engineering Cafeteria',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    createdAt: '2026-10-24T14:40:00Z',
    status: 'Active',
    listingType: 'Free',
  }
];

export const FreeReuseView: React.FC<FreeReuseViewProps> = ({
  onClaimItem
}) => {
  const [items, setItems] = useState<Listing[]>(SAMPLE_FREE_ITEMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<Listing | null>(null);
  const [pickupNote, setPickupNote] = useState('');
  const [pickupTime, setPickupTime] = useState('Today after 4 PM');
  const [claimedIds, setClaimedIds] = useState<string[]>([]);

  const filteredItems = items.filter(item => {
    return (
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.campusLocation.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleConfirmClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setClaimedIds(prev => [...prev, selectedItem.id]);
    onClaimItem(selectedItem, pickupTime, pickupNote);
    setSelectedItem(null);
    setPickupNote('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 rounded-2xl p-6 border border-emerald-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-emerald-200 text-xs font-bold text-emerald-800">
            <Recycle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Zero Waste Campus Circular Initiative (RM 0)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Free & Reuse: Keep Good Items in the Loop
          </h1>
          <p className="text-sm text-slate-600 max-w-xl">
            Seniors graduating or clearing dorm rooms pass down clean essentials, binders, and appliances 
            for free to peers. Everything here is 100% free of charge!
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl border border-emerald-200 shadow-xs max-w-xs space-y-1.5 text-center">
          <div className="text-2xl font-black text-emerald-700">128 kg</div>
          <div className="text-xs font-bold text-slate-800">Campus Waste Diverted</div>
          <p className="text-[11px] text-slate-500">From second-hand loop reuses this semester</p>
        </div>
      </div>

      {/* Search Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm font-bold text-slate-800">
          Available Free Giveaways ({filteredItems.length})
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search free giveaways..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredItems.map((item) => {
          const isClaimed = claimedIds.includes(item.id);

          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border ${isClaimed ? 'border-slate-200 opacity-75' : 'border-slate-200 hover:shadow-md'} overflow-hidden shadow-xs transition-all flex flex-col justify-between`}
            >
              <div>
                <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold shadow-xs flex items-center gap-1">
                    <Gift className="w-3.5 h-3.5" />
                    FREE (RM 0)
                  </div>
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[10px] font-bold text-slate-700">
                    {item.condition}
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
                    {item.category}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {item.description}
                  </p>

                  <div className="pt-2 flex items-center justify-between text-xs text-slate-600 border-t border-slate-100">
                    <span className="flex items-center gap-1 truncate max-w-[140px]">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{item.campusLocation}</span>
                    </span>
                    <span className="text-[11px] text-slate-400 shrink-0">
                      by {item.sellerName.split(' ')[0]}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0">
                {isClaimed ? (
                  <div className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Claim Request Sent</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>Claim Free Item</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Claim Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Free Campus Giveaway</span>
                <h3 className="text-sm font-bold text-slate-900">Claim "{selectedItem.title}"</h3>
              </div>
              <button 
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
              <div><strong>Giver:</strong> {selectedItem.sellerName}</div>
              <div><strong>Pickup Location:</strong> {selectedItem.campusLocation}</div>
              <div className="text-[11px] text-emerald-700">Please arrive punctually to respect the donor's schedule!</div>
            </div>

            <form onSubmit={handleConfirmClaim} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Proposed Meetup / Pickup Time
                </label>
                <input
                  type="text"
                  required
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  placeholder="e.g. Today between 4-5 PM, or tomorrow morning"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Brief Note to Giver
                </label>
                <textarea
                  rows={2}
                  required
                  value={pickupNote}
                  onChange={(e) => setPickupNote(e.target.value)}
                  placeholder="e.g. Hi! I can come right down to KK5 to pick this up. Thank you so much!"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  Confirm Free Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
