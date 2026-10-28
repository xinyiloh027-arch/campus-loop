import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  Plus, 
  Users, 
  ShieldAlert, 
  Ban, 
  Share2, 
  ExternalLink, 
  X, 
  Search,
  CheckCircle2,
  Info
} from 'lucide-react';
import { ChatConversation, ChatMessage, Listing } from '../types';
import { storageService } from '../services/storageService';

interface ChatViewProps {
  conversations: ChatConversation[];
  listings: Listing[];
  onSelectListing: (listing: Listing) => void;
  onRefreshConversations: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  conversations,
  listings,
  onSelectListing,
  onRefreshConversations,
}) => {
  const [selectedConvoId, setSelectedConvoId] = useState<string>(conversations[0]?.id || '');
  const [inputText, setInputText] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupMembers, setGroupMembers] = useState('Danial Hakim, Rachel Tan, Kenji Wong');

  const activeConvo = conversations.find((c) => c.id === selectedConvoId) || conversations[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConvo) return;

    storageService.sendChatMessage(activeConvo.id, inputText.trim());
    setInputText('');
    onRefreshConversations();
  };

  const handleShareListing = (listing: Listing) => {
    if (!activeConvo) return;
    storageService.sendChatMessage(
      activeConvo.id,
      `Hey! Check out this listing on CampusLoop: ${listing.title}`,
      {
        id: listing.id,
        title: listing.title,
        price: listing.price,
        imageUrl: listing.imageUrl,
      }
    );
    setShowShareModal(false);
    onRefreshConversations();
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    const membersList = groupMembers.split(',').map((m) => m.trim()).filter(Boolean);
    const newGroup = storageService.createGroupChat(groupName.trim(), membersList);
    setGroupName('');
    setShowNewGroupModal(false);
    onRefreshConversations();
    setSelectedConvoId(newGroup.id);
  };

  const handleToggleBlock = () => {
    if (!activeConvo) return;
    storageService.blockChat(activeConvo.id);
    onRefreshConversations();
  };

  const filteredConvos = conversations.filter((c) =>
    c.name.toLowerCase().includes(searchFilter.toLowerCase().trim())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 mb-1">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Campus Direct Messages</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Classmate Messaging & Trade Chats
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Coordinate campus meetups, negotiate prices, and swap equipment safely.
          </p>
        </div>

        <button
          onClick={() => setShowNewGroupModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm self-start sm:self-auto transition-all"
        >
          <Users className="w-4 h-4" />
          <span>+ Create Group Chat</span>
        </button>
      </div>

      {/* Main Chat Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
        
        {/* Left: Conversation List (4 Cols) */}
        <div className="md:col-span-4 border-r border-slate-200/80 flex flex-col">
          {/* Search Bar */}
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* List items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredConvos.map((convo) => {
              const isSelected = activeConvo?.id === convo.id;

              return (
                <button
                  key={convo.id}
                  onClick={() => setSelectedConvoId(convo.id)}
                  className={`w-full p-3.5 text-left flex items-start gap-3 transition-colors ${
                    isSelected ? 'bg-indigo-50/60' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-400 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                    {convo.name.charAt(0)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs truncate ${isSelected ? 'font-bold text-indigo-950' : 'font-semibold text-slate-900'}`}>
                        {convo.name}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {convo.lastMessageTime}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {convo.isBlocked ? '⚠️ Conversation Blocked' : convo.lastMessage || 'No messages yet'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Active Chat Conversation (8 Cols) */}
        <div className="md:col-span-8 flex flex-col justify-between bg-slate-50/30">
          {activeConvo ? (
            <>
              {/* Chat Top Header */}
              <div className="p-4 bg-white border-b border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                    {activeConvo.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {activeConvo.name}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {activeConvo.type === 'group' ? 'Group Chat · Campus Peers' : 'Direct Student Message'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share Item</span>
                  </button>
                  <button
                    onClick={handleToggleBlock}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      activeConvo.isBlocked
                        ? 'text-rose-700 bg-rose-50 border-rose-200'
                        : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100 border-slate-200'
                    }`}
                    title={activeConvo.isBlocked ? 'Unblock user' : 'Block user'}
                  >
                    <Ban className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chat Messages Feed */}
              <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[420px]">
                {activeConvo.isBlocked ? (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-center text-xs text-rose-700">
                    You have blocked this conversation. You can unblock it anytime using the shield button above.
                  </div>
                ) : (
                  activeConvo.messages.map((msg) => {
                    const isMe = msg.senderId === 'user-current';

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <span className="text-[10px] text-slate-400 mb-0.5 px-1">
                          {msg.senderName} · {msg.timestamp}
                        </span>

                        <div
                          className={`max-w-sm rounded-2xl p-3 text-xs shadow-2xs leading-relaxed ${
                            isMe
                              ? 'bg-indigo-600 text-white rounded-br-xs'
                              : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                          }`}
                        >
                          <p>{msg.text}</p>

                          {/* Attached Shared Listing Card */}
                          {msg.sharedListing && (
                            <div className="mt-2.5 p-2 bg-black/10 rounded-xl flex items-center gap-2.5">
                              <img
                                src={msg.sharedListing.imageUrl}
                                alt={msg.sharedListing.title}
                                className="w-10 h-10 rounded-lg object-cover bg-slate-200 shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <span className="block font-bold text-xs truncate">
                                  {msg.sharedListing.title}
                                </span>
                                <span className="text-[11px] opacity-90 block">
                                  RM {msg.sharedListing.price}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200/80 flex items-center gap-2">
                <input
                  type="text"
                  placeholder={activeConvo.isBlocked ? 'Unblock conversation to send messages...' : 'Write a message to your classmate...'}
                  disabled={activeConvo.isBlocked}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={activeConvo.isBlocked || !inputText.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl shadow-2xs transition-all flex items-center gap-1.5 text-xs font-semibold"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="p-12 text-center text-xs text-slate-400">
              Select or create a conversation.
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: Share a Listing into Chat */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Share a Marketplace Listing
              </h3>
              <button onClick={() => setShowShareModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Pick an item to share directly with {activeConvo?.name}:
            </p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {listings.map((l) => (
                <div
                  key={l.id}
                  onClick={() => handleShareListing(l)}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 flex items-center gap-3 cursor-pointer transition-all"
                >
                  <img
                    src={l.imageUrl}
                    alt={l.title}
                    className="w-10 h-10 rounded-lg object-cover bg-slate-100"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-slate-900 truncate block">
                      {l.title}
                    </span>
                    <span className="text-[11px] text-indigo-600 font-semibold">
                      RM {l.price} · {l.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Create Group Chat */}
      {showNewGroupModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Create Campus Group Chat
              </h3>
              <button onClick={() => setShowNewGroupModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleCreateGroup} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Group Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mahallah 8 Dorm Traders or Math 101 Book Club"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Invite Classmates (Comma separated)
                </label>
                <input
                  type="text"
                  value={groupMembers}
                  onChange={(e) => setGroupMembers(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewGroupModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
