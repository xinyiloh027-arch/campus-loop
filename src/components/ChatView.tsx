import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  Search, 
  ArrowLeft, 
  ShieldCheck, 
  Info, 
  CheckCheck,
  User,
  ShoppingBag
} from 'lucide-react';
import { ChatConversation, ChatMessage, Listing } from '../types';
import { storageService } from '../services/storageService';

interface ChatViewProps {
  conversations: ChatConversation[];
  listings: Listing[];
  onSelectListing: (listing: Listing) => void;
  onRefreshConversations: () => void;
  activeConversationId?: string;
  onSelectConversation?: (convoId: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  conversations,
  listings,
  onSelectListing,
  onRefreshConversations,
  activeConversationId,
  onSelectConversation,
}) => {
  const [selectedConvoId, setSelectedConvoId] = useState<string>(
    activeConversationId || conversations[0]?.id || ''
  );
  const [inputText, setInputText] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [isMobileViewingChat, setIsMobileViewingChat] = useState<boolean>(!!activeConversationId);

  // Sync if activeConversationId changes from parent
  React.useEffect(() => {
    if (activeConversationId) {
      setSelectedConvoId(activeConversationId);
      setIsMobileViewingChat(true);
    }
  }, [activeConversationId]);

  const activeConvo = conversations.find((c) => c.id === selectedConvoId) || conversations[0];

  const handleSelectConvo = (convo: ChatConversation) => {
    setSelectedConvoId(convo.id);
    setIsMobileViewingChat(true);
    if (onSelectConversation) {
      onSelectConversation(convo.id);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConvo) return;

    storageService.sendChatMessage(activeConvo.id, inputText.trim());
    setInputText('');
    onRefreshConversations();
  };

  const filteredConvos = conversations.filter((c) =>
    c.name.toLowerCase().includes(searchFilter.toLowerCase().trim())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 text-left">
      
      {/* Top Prototype Note */}
      <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-100 text-xs text-blue-900 mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong>Campus Messaging Prototype:</strong> Messages are stored locally in your browser to simulate student buyer-seller communication and negotiate campus meetups.
          </span>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex h-[620px]">
        
        {/* Left Sidebar: Conversation List (Hidden on mobile if viewing chat) */}
        <div className={`w-full md:w-80 border-r border-slate-200 flex flex-col bg-slate-50/50 ${
          isMobileViewingChat ? 'hidden md:flex' : 'flex'
        }`}>
          {/* Search bar */}
          <div className="p-3.5 border-b border-slate-200 bg-white">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search chats by student name..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredConvos.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No chats found
              </div>
            ) : (
              filteredConvos.map((convo) => {
                const isSelected = convo.id === activeConvo?.id;
                return (
                  <div
                    key={convo.id}
                    onClick={() => handleSelectConvo(convo)}
                    className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50/80 border-l-4 border-blue-600' : 'hover:bg-slate-100/70 bg-white'
                    }`}
                  >
                    <div className="relative shrink-0">
                      {convo.avatar ? (
                        <img
                          src={convo.avatar}
                          alt={convo.name}
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-bold text-sm flex items-center justify-center">
                          {convo.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      {convo.unreadCount && convo.unreadCount > 0 ? (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
                          {convo.unreadCount}
                        </span>
                      ) : null}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`text-xs font-bold truncate ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                          {convo.name}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {convo.lastMessageTime || 'Just now'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {convo.lastMessage || 'Start conversation...'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right / Full View: Active Conversation */}
        <div className={`flex-1 flex flex-col bg-white ${
          !isMobileViewingChat ? 'hidden md:flex' : 'flex'
        }`}>
          {activeConvo ? (
            <>
              {/* Chat Header */}
              <div className="p-3.5 sm:p-4 border-b border-slate-200 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsMobileViewingChat(false)}
                    className="p-1.5 -ml-1 text-slate-600 hover:bg-slate-100 rounded-xl md:hidden"
                    title="Back to conversations"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div className="relative">
                    {activeConvo.avatar ? (
                      <img
                        src={activeConvo.avatar}
                        alt={activeConvo.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                        {activeConvo.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900">{activeConvo.name}</h3>
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Verified
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {activeConvo.participants.find(p => p.name === activeConvo.name)?.role || 'Campus Senior'}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="hidden sm:inline">Active on Campus</span>
                </div>
              </div>

              {/* Message History */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/40">
                {activeConvo.messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                    <MessageSquare className="w-8 h-8 text-slate-300" />
                    <p className="text-xs">No messages yet. Send a message to arrange a campus handover or negotiate price!</p>
                  </div>
                ) : (
                  activeConvo.messages.map((msg) => {
                    const isMe = msg.senderId === 'user-current' || msg.senderName === 'Alex Tan';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        {/* Shared product card in message */}
                        {msg.sharedListing && (
                          <div 
                            onClick={() => {
                              const found = listings.find((l) => l.id === msg.sharedListing?.id);
                              if (found) onSelectListing(found);
                            }}
                            className={`mb-1 p-2 rounded-2xl border max-w-xs flex items-center gap-2.5 cursor-pointer shadow-2xs transition-all hover:scale-[1.01] ${
                              isMe ? 'bg-blue-50 border-blue-200 text-left' : 'bg-white border-slate-200 text-left'
                            }`}
                          >
                            <img
                              src={msg.sharedListing.imageUrl}
                              alt={msg.sharedListing.title}
                              className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200"
                            />
                            <div className="min-w-0 flex-1">
                              <span className="text-[9px] font-bold text-blue-600 block uppercase">Product Enquiry</span>
                              <div className="text-xs font-semibold text-slate-900 truncate">
                                {msg.sharedListing.title}
                              </div>
                              <div className="text-xs font-bold text-blue-700">
                                RM {msg.sharedListing.price.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Bubble */}
                        <div
                          className={`max-w-[80%] sm:max-w-md px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                            isMe
                              ? 'bg-blue-600 text-white rounded-br-xs'
                              : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                          }`}
                        >
                          {msg.text}
                        </div>

                        {/* Timestamp */}
                        <span className="text-[10px] text-slate-400 mt-1 px-1">
                          {msg.timestamp || 'Just now'}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Message Input Bar */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message to discuss meetup time or price..."
                  className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white text-slate-800"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className={`p-2.5 sm:px-4 sm:py-2.5 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                    inputText.trim()
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <MessageSquare className="w-12 h-12 text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">Select a conversation</p>
              <p className="text-xs text-slate-400">Chat with campus sellers about product condition and meetup locations.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
