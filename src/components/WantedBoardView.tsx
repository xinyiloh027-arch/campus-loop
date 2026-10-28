import React, { useState } from 'react';
import { 
  HelpCircle, 
  Plus, 
  MapPin, 
  Tag, 
  Clock, 
  MessageSquare, 
  CheckCircle2, 
  Search,
  Filter,
  Send,
  Sparkles
} from 'lucide-react';
import { WantedPost, Category } from '../types';

interface WantedBoardViewProps {
  onOpenDirectChat?: (recipientName: string, initialText?: string) => void;
}

const INITIAL_WANTED_POSTS: WantedPost[] = [
  {
    id: 'wanted-1',
    title: 'Looking for Stewart Calculus 8th/9th Edition (Hardcopy)',
    description: 'Taking MAT112 next semester and need a clean physical copy. Any notes or formulas marked inside are actually a bonus! Willing to pick up anywhere on campus.',
    category: 'Textbooks',
    maxBudget: 70,
    preferredLocation: 'Central Library or Mahallah Ali',
    urgency: 'Medium',
    seekerName: 'Farhan Zulkifli',
    seekerAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
    seekerContact: 'farhan.z@student.edu.my',
    status: 'Open',
    createdAt: '2026-10-26T14:00:00Z',
    responsesCount: 3,
    interestedMode: 'Buy',
  },
  {
    id: 'wanted-2',
    title: 'Urgent: Mini Fridge for Dorm Room (Moving In)',
    description: 'Need a small working 50L-70L mini bar fridge for dorm room snacks and medicine. Must be energy efficient and in quiet working condition. Can arrange transport trolley.',
    category: 'Dorm Essentials',
    maxBudget: 180,
    preferredLocation: 'Residential College 8 or Lake Park',
    urgency: 'Urgent',
    seekerName: 'Chloe Lim',
    seekerAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    seekerContact: 'chloe.lim@student.edu.my',
    status: 'Open',
    createdAt: '2026-10-27T08:30:00Z',
    responsesCount: 2,
    interestedMode: 'Buy',
  },
  {
    id: 'wanted-3',
    title: 'Need to Borrow USB-C to HDMI Multi-Port Hub for 3 Days',
    description: 'MacBook HDMI port died right before final design presentation on Thursday! Happy to pay a small borrow fee or buy a cup of campus iced matcha.',
    category: 'Electronics',
    maxBudget: 15,
    preferredLocation: 'Design & Built Faculty Block C',
    urgency: 'Urgent',
    seekerName: 'Suresh Nair',
    seekerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    seekerContact: 'suresh.nair@student.edu.my',
    status: 'Open',
    createdAt: '2026-10-27T09:45:00Z',
    responsesCount: 1,
    interestedMode: 'Borrow',
  },
  {
    id: 'wanted-4',
    title: 'Seeking Badminton Racket & Shuttlecocks for Weekend Play',
    description: 'Looking to buy a decent beginner/intermediate Yonex or Lining racket. Nothing too fancy, just for sports hall sessions.',
    category: 'Sports Equipment',
    maxBudget: 60,
    preferredLocation: 'Campus Sports Complex',
    urgency: 'Flexible',
    seekerName: 'Aina Sofea',
    seekerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    seekerContact: 'aina.s@student.edu.my',
    status: 'Open',
    createdAt: '2026-10-25T11:20:00Z',
    responsesCount: 0,
    interestedMode: 'Buy',
  }
];

export const WantedBoardView: React.FC<WantedBoardViewProps> = ({
  onOpenDirectChat
}) => {
  const [posts, setPosts] = useState<WantedPost[]>(INITIAL_WANTED_POSTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [respondingToPost, setRespondingToPost] = useState<WantedPost | null>(null);
  const [offerPrice, setOfferPrice] = useState<number>(50);
  const [offerMessage, setOfferMessage] = useState('');

  // Create Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<Exclude<Category, 'All'>>('Textbooks');
  const [newBudget, setNewBudget] = useState<number>(50);
  const [newLocation, setNewLocation] = useState('Central Library');
  const [newUrgency, setNewUrgency] = useState<'Flexible' | 'Medium' | 'Urgent'>('Medium');
  const [newMode, setNewMode] = useState<'Buy' | 'Borrow' | 'Free'>('Buy');

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || newBudget <= 0) return;

    const newPost: WantedPost = {
      id: `wanted-${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim() || 'No additional notes provided.',
      category: newCategory,
      maxBudget: Number(newBudget),
      preferredLocation: newLocation.trim() || 'Any Campus Point',
      urgency: newUrgency,
      seekerName: 'Alex Tan',
      seekerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      seekerContact: 'alex.tan@campus.edu.my',
      status: 'Open',
      createdAt: new Date().toISOString(),
      responsesCount: 0,
      interestedMode: newMode,
    };

    setPosts([newPost, ...posts]);
    setShowCreateModal(false);
    // Reset form
    setNewTitle('');
    setNewDesc('');
    setNewBudget(50);
  };

  const handleSendOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!respondingToPost) return;

    // Increment responses count
    setPosts(prev => prev.map(p => p.id === respondingToPost.id ? { ...p, responsesCount: (p.responsesCount || 0) + 1 } : p));
    
    if (onOpenDirectChat) {
      const recipient = respondingToPost.seekerName || 'Campus Peer';
      onOpenDirectChat(recipient, `Hi ${recipient}! I saw your Wanted post for "${respondingToPost.title}". I have an item that matches for RM ${offerPrice}: "${offerMessage}"`);
    }

    setRespondingToPost(null);
    setOfferMessage('');
  };

  const getUrgencyBadge = (urgency?: 'Flexible' | 'Medium' | 'Urgent') => {
    switch (urgency) {
      case 'Urgent':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">Urgent Priority</span>;
      case 'Medium':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">Needed this Week</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">Flexible Timing</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-indigo-50 rounded-2xl p-6 border border-amber-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-amber-200 text-xs font-bold text-amber-800">
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Campus Community "Looking For" Bulletin</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Can't Find It? Post What You Need.
          </h1>
          <p className="text-sm text-slate-600 max-w-xl">
            Ask your fellow students for textbooks, dorm appliances, or project gear that haven't been listed yet. 
            Peers with unused items will reach out to you with offers!
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Post a Wanted Request</span>
        </button>
      </div>

      {/* Controls: Search and Category Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['All', 'Textbooks', 'Electronics', 'Dorm Essentials', 'Sports Equipment', 'Project Equipment'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search wanted items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>
      </div>

      {/* Wanted Post Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {post.category} · {post.interestedMode || post.preferredType || 'Buy'}
                </span>
                {getUrgencyBadge(post.urgency)}
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 line-clamp-2 leading-snug">
                  {post.title}
                </h3>
                <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                  {post.description}
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Max Budget / Willing to Pay:</span>
                  <span className="text-sm font-bold text-indigo-600">RM {post.maxBudget}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{post.preferredLocation || post.location || 'Campus Meetup'}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src={post.seekerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                  alt={post.seekerName || 'Campus Seeker'}
                  className="w-7 h-7 rounded-full object-cover border border-slate-200"
                />
                <div className="text-[11px]">
                  <div className="font-semibold text-slate-800">{post.seekerName || 'Campus Student'}</div>
                  <div className="text-slate-400">{post.responsesCount || 0} offers received</div>
                </div>
              </div>

              <button
                onClick={() => {
                  setRespondingToPost(post);
                  setOfferPrice(Math.min(post.maxBudget, 45));
                }}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Offer Item</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Wanted Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Post a "Looking For" Request</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  What item are you looking for? *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scientific Calculator Casio fx-570EX or Hall 3 mini fridge"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as Exclude<Category, 'All'>)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Textbooks">Textbooks</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Dorm Essentials">Dorm Essentials</option>
                    <option value="Project Equipment">Project Equipment</option>
                    <option value="Sports Equipment">Sports Equipment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Max Budget (RM) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newBudget}
                    onChange={(e) => setNewBudget(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Urgency</label>
                  <select
                    value={newUrgency}
                    onChange={(e) => setNewUrgency(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Flexible">Flexible (Anytime this month)</option>
                    <option value="Medium">Medium (Within a week)</option>
                    <option value="Urgent">Urgent (Within 48 hours)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Intent</label>
                  <select
                    value={newMode}
                    onChange={(e) => setNewMode(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Buy">Buy Permanently</option>
                    <option value="Borrow">Borrow for a few days</option>
                    <option value="Free">Looking for giveaway</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Convenient Meetup Spot</label>
                <input
                  type="text"
                  placeholder="e.g. Central Library, Faculty of Engineering, RC4"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Details & Condition Requirements</label>
                <textarea
                  rows={3}
                  placeholder="Specify model numbers, acceptable editions, or whether scratches/wear are okay..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  Publish Wanted Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Offer / Respond Modal */}
      {respondingToPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Propose Your Item</span>
                <h3 className="text-sm font-bold text-slate-900">Offer to {respondingToPost.seekerName || 'Student'}</h3>
              </div>
              <button 
                onClick={() => setRespondingToPost(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
              <div className="font-semibold text-slate-800">{respondingToPost.title}</div>
              <div className="text-slate-500">Max Budget: RM {respondingToPost.maxBudget} · Location: {respondingToPost.preferredLocation || 'Campus Meetup'}</div>
            </div>

            <form onSubmit={handleSendOffer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Offered Price (RM)</label>
                <input
                  type="number"
                  min="0"
                  max={respondingToPost.maxBudget * 1.5}
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Message / Condition Details</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. I have this exact edition in great condition, no missing pages. Can meetup at Central Library today!"
                  value={offerMessage}
                  onChange={(e) => setOfferMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRespondingToPost(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Offer & Open Chat</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
