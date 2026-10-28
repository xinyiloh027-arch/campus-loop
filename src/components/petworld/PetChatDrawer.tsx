import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Brain, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  ShieldCheck, 
  MessageSquare,
  HelpCircle
} from 'lucide-react';
import { VirtualPet, PetChatMessage, PetMemory, PetMood } from '../../types';
import { petWorldService } from '../../services/petWorldService';
import { soundService } from '../../services/soundService';
import { PetVisual } from './PetVisual';

interface PetChatDrawerProps {
  pet: VirtualPet;
  onUpdatePet: (updated: VirtualPet) => void;
  onClose: () => void;
  userName?: string;
}

export const PetChatDrawer: React.FC<PetChatDrawerProps> = ({
  pet,
  onUpdatePet,
  onClose,
  userName = 'Alex',
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'memories'>('chat');
  const [inputMessage, setInputMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [editingMemoryId, setEditingMemoryId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [pet.chatHistory, isThinking]);

  // Handle Send message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isThinking) return;

    soundService.playPop();
    setInputMessage('');

    const userMsg: PetChatMessage = {
      id: `cmsg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: 'Just now',
    };

    const nextHistory = [...pet.chatHistory, userMsg];
    let workingPet: VirtualPet = {
      ...pet,
      chatHistory: nextHistory,
    };
    onUpdatePet(workingPet);

    setIsThinking(true);

    try {
      const response = await petWorldService.generatePetReply(workingPet, text, userName);

      // If a memory was extracted and memory is enabled, record it
      if (response.extractedMemory && workingPet.memoryEnabled) {
        workingPet = petWorldService.addMemory(
          workingPet,
          response.extractedMemory.topic,
          response.extractedMemory.detail,
          'chat'
        );
      }

      const petMsg: PetChatMessage = {
        id: `cmsg-pet-${Date.now()}`,
        sender: 'pet',
        text: response.text,
        timestamp: 'Just now',
        moodReaction: response.moodReaction,
      };

      const finalPet: VirtualPet = {
        ...workingPet,
        mood: response.moodReaction,
        chatHistory: [...workingPet.chatHistory, petMsg],
      };

      soundService.playChime();
      onUpdatePet(finalPet);
    } catch (e) {
      console.error('Error generating pet reply:', e);
    } finally {
      setIsThinking(false);
    }
  };

  // Quick conversation prompts
  const starterPrompts = [
    'I had a really tiring day at school.',
    'I finally finished my course project!',
    'Did you eat lunch yet?',
    'What do you remember about me?',
    'I need some encouragement today.',
  ];

  // Memory operations
  const handleSaveMemoryEdit = (id: string) => {
    if (!editingText.trim()) return;
    const updated = petWorldService.updateMemory(pet, id, editingText.trim());
    onUpdatePet(updated);
    setEditingMemoryId(null);
    soundService.playChime();
  };

  const handleDeleteMemory = (id: string) => {
    const updated = petWorldService.deleteMemory(pet, id);
    onUpdatePet(updated);
    soundService.playPop();
  };

  const handleToggleMemory = () => {
    const updated = petWorldService.toggleMemory(pet);
    onUpdatePet(updated);
    soundService.playPop();
  };

  return (
    <div className="bg-white rounded-3xl border border-indigo-100 shadow-xl overflow-hidden flex flex-col h-[600px] max-w-2xl mx-auto text-left">
      
      {/* Top Bar with Pet Bio & Tabs */}
      <div className="bg-gradient-to-r from-indigo-50 via-rose-50 to-amber-50 p-4 border-b border-indigo-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white shadow-2xs border border-indigo-100 flex items-center justify-center shrink-0">
            <PetVisual
              type={pet.type}
              mood={pet.mood}
              size={48}
              isCustomPet={pet.isCustomPet}
              customHead={pet.customHead}
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-slate-900">{pet.name}</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                {pet.personalityTitle}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 italic">"{pet.catchphrase}"</p>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'chat'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-white/80'
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setActiveTab('memories')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
              activeTab === 'memories'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-white/80'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Memories ({pet.memories.length})</span>
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/80 text-slate-400 hover:text-slate-700 ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CHAT TAB */}
      {activeTab === 'chat' && (
        <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
          
          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
            {pet.chatHistory.map((msg) => {
              const isPet = msg.sender === 'pet';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isPet ? 'justify-start' : 'justify-end'}`}
                >
                  {isPet && (
                    <div className="w-8 h-8 rounded-full bg-pink-100 border border-pink-200 flex items-center justify-center shrink-0 text-base">
                      🐾
                    </div>
                  )}

                  <div
                    className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-2xs ${
                      isPet
                        ? 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                        : 'bg-indigo-600 text-white font-medium rounded-tr-xs'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span
                      className={`block text-[9px] mt-1 ${
                        isPet ? 'text-slate-400' : 'text-indigo-200 text-right'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {isThinking && (
              <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                <span>{pet.name} is thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Starters Chips */}
          <div className="px-4 py-2 border-t border-slate-100 bg-white/70 overflow-x-auto scrollbar-none flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 shrink-0">Try saying:</span>
            {starterPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 whitespace-nowrap border border-indigo-100 transition-colors shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={`Chat with ${pet.name} about your day, classes, food...`}
              className="flex-1 px-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isThinking}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white transition-all cursor-pointer shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* MEMORIES TAB */}
      {activeTab === 'memories' && (
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
          
          {/* Memory explanation & toggle card */}
          <div className="p-4 bg-white rounded-2xl border border-indigo-100 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-600" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Conversation Memory</h4>
                  <p className="text-[11px] text-slate-500">
                    Allows {pet.name} to remember your campus major, favorite treats, and past chats.
                  </p>
                </div>
              </div>

              {/* Toggle switch */}
              <button
                onClick={handleToggleMemory}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  pet.memoryEnabled ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    pet.memoryEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Private & Local: Stored only in your browser. Never exposed on shared cards.</span>
            </div>
          </div>

          {/* Memories List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Saved Memories ({pet.memories.length})
            </h4>

            {pet.memories.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                No memories recorded yet! Chat with {pet.name} about your courses, snacks, or hobbies to build memories.
              </div>
            ) : (
              pet.memories.map((mem) => (
                <div
                  key={mem.id}
                  className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex items-start justify-between gap-3 text-xs"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[10px]">
                        {mem.topic}
                      </span>
                      <span className="text-[10px] text-slate-400">{mem.date}</span>
                    </div>

                    {editingMemoryId === mem.id ? (
                      <div className="flex items-center gap-1.5 mt-1">
                        <input
                          type="text"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="flex-1 px-2 py-1 text-xs border border-indigo-300 rounded-lg focus:outline-none"
                        />
                        <button
                          onClick={() => handleSaveMemoryEdit(mem.id)}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingMemoryId(null)}
                          className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-slate-700 text-xs font-medium">{mem.detail}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setEditingMemoryId(mem.id);
                        setEditingText(mem.detail);
                      }}
                      className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                      title="Edit memory"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteMemory(mem.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      title="Delete memory"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}

    </div>
  );
};
