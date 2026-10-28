import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  Plus, 
  ArrowRight, 
  Search, 
  AlertCircle,
  HelpCircle,
  Sparkles,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { BorrowRequest, BorrowStatus, Listing } from '../types';

interface BorrowViewProps {
  listings: Listing[];
  onSendBorrowRequest: (req: Omit<BorrowRequest, 'id' | 'createdAt' | 'status' | 'isSentByCurrentUser'>) => void;
  onUpdateBorrowStatus: (requestId: string, nextStatus: BorrowStatus) => void;
}

const SAMPLE_BORROW_ITEMS: Listing[] = [
  {
    id: 'borrow-1',
    title: 'Casio fx-570EX ClassWiz Scientific Calculator',
    description: 'Perfect for engineering and statistics midterms. Brand new batteries, clean casing, and approved for all university exams. Available for 1 to 5 days.',
    price: 5,
    category: 'Electronics',
    condition: 'Like New',
    sellerName: 'Hafiz Rahim',
    sellerContact: 'hafiz.r@campus.edu.my',
    sellerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    sellerRating: 4.9,
    campusLocation: 'Engineering Faculty Block B',
    imageUrl: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=600&q=80',
    createdAt: '2026-10-26T10:00:00Z',
    status: 'Active',
    listingType: 'Borrow',
    borrowFeePerDay: 5,
    depositRequired: 30,
    maxBorrowDays: 7,
    availablePeriod: 'Weekdays & Exam Weeks',
    returnConditions: 'Return with clean protective hard case and battery working.',
  },
  {
    id: 'borrow-2',
    title: 'Sony Alpha 6400 4K Camera + 16-50mm Lens',
    description: 'Great for media students, final year project interviews, or club event photography. Includes 64GB SD card and 2 rechargeable batteries.',
    price: 35,
    category: 'Electronics',
    condition: 'Like New',
    sellerName: 'Nadia Azman',
    sellerContact: 'nadia.azman@campus.edu.my',
    sellerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    sellerRating: 5.0,
    campusLocation: 'Student Activity Centre (SAC)',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
    createdAt: '2026-10-25T14:30:00Z',
    status: 'Active',
    listingType: 'Borrow',
    borrowFeePerDay: 35,
    depositRequired: 150,
    maxBorrowDays: 4,
    availablePeriod: 'Thursday - Sunday',
    returnConditions: 'Must inspect lens on collection. Handle with neck strap at all times.',
  },
  {
    id: 'borrow-3',
    title: 'Philips Garment Steamer & Portable Dorm Iron',
    description: 'Compact handheld steamer to press formal wear and interview suits before presentation days. Heats up in 30 seconds.',
    price: 8,
    category: 'Dorm Essentials',
    condition: 'Good',
    sellerName: 'Darren Lim',
    sellerContact: 'darren.lim@campus.edu.my',
    sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    sellerRating: 4.8,
    campusLocation: 'Residential College 4 (Aman Hall)',
    imageUrl: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=600&q=80',
    createdAt: '2026-10-24T09:15:00Z',
    status: 'Active',
    listingType: 'Borrow',
    borrowFeePerDay: 8,
    depositRequired: 40,
    maxBorrowDays: 3,
    availablePeriod: 'Anytime',
    returnConditions: 'Empty water reservoir completely before returning.',
  },
  {
    id: 'borrow-4',
    title: 'Portable 1080p HDMI Mini Projector + Screen',
    description: 'Perfect for project group reviews, society movie nights, or dorm movie sessions. HDMI cable and remote included.',
    price: 20,
    category: 'Project Equipment',
    condition: 'Good',
    sellerName: 'Priya Raman',
    sellerContact: 'priya.r@campus.edu.my',
    sellerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    sellerRating: 4.9,
    campusLocation: 'Faculty of Science Library',
    imageUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80',
    createdAt: '2026-10-23T11:00:00Z',
    status: 'Active',
    listingType: 'Borrow',
    borrowFeePerDay: 20,
    depositRequired: 80,
    maxBorrowDays: 5,
    availablePeriod: 'Weekends & Evenings',
    returnConditions: 'Store in padded carrying pouch. Check HDMI output on pickup.',
  }
];

const INITIAL_BORROW_REQUESTS: BorrowRequest[] = [
  {
    id: 'breq-1',
    listingId: 'borrow-1',
    listingTitle: 'Casio fx-570EX ClassWiz Scientific Calculator',
    listingImage: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=600&q=80',
    lenderName: 'Hafiz Rahim',
    borrowerName: 'Alex Tan',
    borrowerContact: '012-345-6789',
    startDate: '2026-10-28',
    endDate: '2026-10-30',
    days: 3,
    feePerDay: 5,
    totalFee: 15,
    deposit: 30,
    status: 'Accepted',
    createdAt: '2026-10-27T08:00:00Z',
    isSentByCurrentUser: true,
  },
  {
    id: 'breq-2',
    listingId: 'borrow-2',
    listingTitle: 'Sony Alpha 6400 4K Camera + 16-50mm Lens',
    listingImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
    lenderName: 'Nadia Azman',
    borrowerName: 'Alex Tan',
    borrowerContact: '012-345-6789',
    startDate: '2026-11-01',
    endDate: '2026-11-02',
    days: 2,
    feePerDay: 35,
    totalFee: 70,
    deposit: 150,
    status: 'Pending',
    createdAt: '2026-10-27T10:15:00Z',
    isSentByCurrentUser: true,
  }
];

export const BorrowView: React.FC<BorrowViewProps> = ({
  listings,
  onSendBorrowRequest,
  onUpdateBorrowStatus,
}) => {
  const [subTab, setSubTab] = useState<'available' | 'my-requests' | 'lend'>('available');
  const [searchQuery, setSearchQuery] = useState('');
  const [requests, setRequests] = useState<BorrowRequest[]>(INITIAL_BORROW_REQUESTS);

  // Selected item to borrow modal
  const [selectedItem, setSelectedItem] = useState<Listing | null>(null);
  const [borrowDays, setBorrowDays] = useState(2);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [borrowerContact, setBorrowerContact] = useState('012-345-6789');
  const [borrowMessage, setBorrowMessage] = useState('Need this for midterm week presentation. Will keep it spotless!');

  // Combine mock items with any active borrow listings passed from props
  const allBorrowItems = React.useMemo(() => {
    const fromProps = listings.filter(l => l.listingType === 'Borrow');
    const existingIds = new Set(fromProps.map(i => i.id));
    return [...fromProps, ...SAMPLE_BORROW_ITEMS.filter(i => !existingIds.has(i.id))];
  }, [listings]);

  const filteredItems = allBorrowItems.filter(item => {
    const loc = item.campusLocation || item.location || '';
    return (
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleOpenBorrowModal = (item: Listing) => {
    setSelectedItem(item);
    setBorrowDays(2);
  };

  const handleSubmitBorrowRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    const feePerDay = selectedItem.borrowFeePerDay || selectedItem.price || 5;
    const deposit = selectedItem.depositRequired || 20;
    const totalFee = feePerDay * borrowDays;

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + borrowDays);

    const newReq: BorrowRequest = {
      id: `breq-${Date.now()}`,
      listingId: selectedItem.id,
      listingTitle: selectedItem.title,
      listingImage: selectedItem.imageUrl,
      lenderName: selectedItem.sellerName,
      borrowerName: 'Alex Tan',
      borrowerContact: borrowerContact.trim() || 'alex.t@campus.edu.my',
      startDate,
      endDate: endDate.toISOString().split('T')[0],
      days: borrowDays,
      feePerDay,
      totalFee,
      deposit,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      isSentByCurrentUser: true,
    };

    setRequests(prev => [newReq, ...prev]);
    onSendBorrowRequest(newReq);
    setSelectedItem(null);
    setSubTab('my-requests');
  };

  const handleProgressStatus = (reqId: string, currentStatus: BorrowStatus) => {
    let nextStatus: BorrowStatus = currentStatus;
    if (currentStatus === 'Accepted') nextStatus = 'Ready for Collection';
    else if (currentStatus === 'Ready for Collection') nextStatus = 'Borrowed';
    else if (currentStatus === 'Borrowed') nextStatus = 'Return Pending';
    else if (currentStatus === 'Return Pending') nextStatus = 'Returned';

    setRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: nextStatus } : r));
    onUpdateBorrowStatus(reqId, nextStatus);
  };

  const getStatusBadge = (status: BorrowStatus) => {
    switch (status) {
      case 'Pending':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Pending Approval</span>;
      case 'Accepted':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">Accepted by Lender</span>;
      case 'Ready for Collection':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">Ready for Collection</span>;
      case 'Borrowed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Currently Borrowed</span>;
      case 'Return Pending':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">Return Handover In Progress</span>;
      case 'Returned':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">Returned & Deposit Refunded</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-teal-50 via-sky-50 to-indigo-50 rounded-2xl p-6 border border-teal-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-teal-200 text-xs font-bold text-teal-800">
            <RefreshCw className="w-3.5 h-3.5 text-teal-600" />
            <span>Campus Sharing Economy & Borrow Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Borrow What You Need. Lend What You Don't.
          </h1>
          <p className="text-sm text-slate-600 max-w-xl">
            Why spend RM 100+ on a scientific calculator or lab gown you'll only use for one exam? 
            Borrow verified gear from peers with clear daily rates and transparent deposits.
          </p>
        </div>

        {/* Quick Safety Rule Banner */}
        <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl border border-teal-200 shadow-xs max-w-xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <ShieldAlert className="w-4 h-4 text-teal-600" />
            <span>Campus Guarantee Protection</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            All lenders inspect items on handover. Refundable deposits are returned upon prompt and clean return.
          </p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setSubTab('available')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              subTab === 'available'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Available to Borrow ({filteredItems.length})
          </button>
          <button
            onClick={() => setSubTab('my-requests')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              subTab === 'my-requests'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>My Borrow Requests</span>
            <span className="px-1.5 py-0.5 rounded-full text-[11px] bg-teal-100 text-teal-800 font-bold">
              {requests.length}
            </span>
          </button>
        </div>

        <div className="relative w-64 hidden sm:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search borrow gear..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Tab: Available Items */}
      {subTab === 'available' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-teal-600 text-white text-[11px] font-bold shadow-xs flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    RM {item.borrowFeePerDay || item.price} / day
                  </div>
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[10px] font-bold text-slate-700">
                    Deposit: RM {item.depositRequired || 20}
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="text-[11px] font-semibold text-teal-700 uppercase tracking-wider">
                    {item.category} · Max {item.maxBorrowDays || 7} Days
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {item.description}
                  </p>

                  <div className="pt-2 flex items-center justify-between text-xs text-slate-600 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {item.campusLocation}
                    </span>
                    <span className="font-semibold text-slate-700">
                      ★ {item.sellerRating || 4.9}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0">
                <button
                  onClick={() => handleOpenBorrowModal(item)}
                  className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Request to Borrow</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: My Borrow Requests */}
      {subTab === 'my-requests' && (
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
              <RefreshCw className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-800">No Active Borrow Requests</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Explore items above to borrow scientific gear, camera lenses, or dorm tools.
              </p>
            </div>
          ) : (
            requests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={req.listingImage}
                    alt={req.listingTitle}
                    className="w-20 h-20 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{req.listingTitle}</h4>
                      {getStatusBadge(req.status)}
                    </div>
                    <div className="text-xs text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                      <span>Lender: <strong className="text-slate-800">{req.lenderName}</strong></span>
                      <span>Period: {req.startDate} to {req.endDate} ({req.days} days)</span>
                      <span>Total Rental: <strong className="text-teal-700">RM {req.totalFee}</strong></span>
                      <span>Security Deposit: RM {req.deposit} (Refundable)</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Requested on {new Date(req.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Status action stepper */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  {req.status === 'Accepted' && (
                    <button
                      onClick={() => handleProgressStatus(req.id, req.status)}
                      className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold transition-colors"
                    >
                      Confirm Item Collected
                    </button>
                  )}
                  {req.status === 'Ready for Collection' && (
                    <button
                      onClick={() => handleProgressStatus(req.id, req.status)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors"
                    >
                      Picked Up & Inspected
                    </button>
                  )}
                  {req.status === 'Borrowed' && (
                    <button
                      onClick={() => handleProgressStatus(req.id, req.status)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
                    >
                      Initiate Return
                    </button>
                  )}
                  {req.status === 'Return Pending' && (
                    <button
                      onClick={() => handleProgressStatus(req.id, req.status)}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition-colors"
                    >
                      Complete Return & Refund Deposit
                    </button>
                  )}
                  {req.status === 'Returned' && (
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Cycle Completed
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Borrow Request Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">Borrow Request</span>
                <h3 className="text-base font-bold text-slate-900">{selectedItem.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-teal-50/60 rounded-xl border border-teal-100 text-xs text-teal-900">
              <ShieldAlert className="w-5 h-5 text-teal-600 shrink-0" />
              <div>
                <strong>Lender Pickup Location:</strong> {selectedItem.campusLocation}
                <div className="text-[11px] text-teal-700 mt-0.5">{selectedItem.returnConditions}</div>
              </div>
            </div>

            <form onSubmit={handleSubmitBorrowRequest} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Start Pickup Date
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedItem.maxBorrowDays || 14}
                    value={borrowDays}
                    onChange={(e) => setBorrowDays(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Your Campus WhatsApp / Phone
                </label>
                <input
                  type="text"
                  required
                  value={borrowerContact}
                  onChange={(e) => setBorrowerContact(e.target.value)}
                  placeholder="012-345-6789"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Note to Lender
                </label>
                <textarea
                  rows={2}
                  value={borrowMessage}
                  onChange={(e) => setBorrowMessage(e.target.value)}
                  placeholder="Briefly state intended use (e.g. course code or midterm)..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              {/* Price Calculation breakdown */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Rental (RM {selectedItem.borrowFeePerDay || selectedItem.price} × {borrowDays} days)</span>
                  <span className="font-semibold text-slate-900">
                    RM {((selectedItem.borrowFeePerDay || selectedItem.price) * borrowDays).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Security Deposit (Refundable upon safe return)</span>
                  <span className="font-semibold text-slate-900">
                    RM {(selectedItem.depositRequired || 20).toFixed(2)}
                  </span>
                </div>
                <div className="pt-1.5 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-sm">
                  <span>Total Amount Due on Handover</span>
                  <span className="text-teal-700">
                    RM {(((selectedItem.borrowFeePerDay || selectedItem.price) * borrowDays) + (selectedItem.depositRequired || 20)).toFixed(2)}
                  </span>
                </div>
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
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  Send Borrow Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
