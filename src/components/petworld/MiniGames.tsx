import React, { useState, useEffect, useRef } from 'react';
import { 
  Gamepad2, 
  Sparkles, 
  Trophy, 
  Play, 
  RotateCcw, 
  ArrowLeft, 
  CheckCircle2,
  Heart
} from 'lucide-react';
import { soundService } from '../../services/soundService';

interface MiniGamesProps {
  petName: string;
  onReward: (points: number, happiness: number, exp: number, reason: string) => void;
  onClose: () => void;
}

export const MiniGames: React.FC<MiniGamesProps> = ({
  petName,
  onReward,
  onClose,
}) => {
  const [activeGame, setActiveGame] = useState<'menu' | 'catcher' | 'memory'>('menu');

  // ==========================================
  // GAME 1: TREAT CATCHER
  // ==========================================
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [catcherPlaying, setCatcherPlaying] = useState(false);
  const [catcherScore, setCatcherScore] = useState(0);
  const [catcherTimeLeft, setCatcherTimeLeft] = useState(25);
  const [catcherGameOver, setCatcherGameOver] = useState(false);

  useEffect(() => {
    if (activeGame !== 'catcher' || !catcherPlaying) return;

    let animId: number;
    let timerId: NodeJS.Timeout;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let basketX = canvas.width / 2;
    const basketWidth = 64;
    const basketHeight = 16;
    let score = 0;

    interface DropItem {
      x: number;
      y: number;
      speed: number;
      icon: string;
      points: number;
    }

    let items: DropItem[] = [];
    const itemIcons = [
      { icon: '🍓', points: 10 },
      { icon: '🧋', points: 15 },
      { icon: '🐟', points: 10 },
      { icon: '🍪', points: 10 },
      { icon: '⭐', points: 20 },
    ];

    let spawnCounter = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      basketX = Math.max(basketWidth / 2, Math.min(canvas.width - basketWidth / 2, mouseX));
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        const touchX = e.touches[0].clientX - rect.left;
        basketX = Math.max(basketWidth / 2, Math.min(canvas.width - basketWidth / 2, touchX));
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove);

    // Timer countdown
    timerId = setInterval(() => {
      setCatcherTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerId);
          setCatcherPlaying(false);
          setCatcherGameOver(true);
          soundService.playLevelUp();
          const earned = Math.min(45, Math.max(15, Math.round(score / 5)));
          onReward(earned, 25, 20, 'Treat Catcher');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Game loop
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Spawn falling treats
      spawnCounter++;
      if (spawnCounter % 28 === 0) {
        const pick = itemIcons[Math.floor(Math.random() * itemIcons.length)];
        items.push({
          x: 20 + Math.random() * (canvas.width - 40),
          y: -10,
          speed: 2.2 + Math.random() * 1.5,
          icon: pick.icon,
          points: pick.points,
        });
      }

      // Update & Draw Items
      for (let i = items.length - 1; i >= 0; i--) {
        const it = items[i];
        it.y += it.speed;

        ctx.font = '22px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(it.icon, it.x, it.y);

        // Check collision with basket
        if (
          it.y >= canvas.height - 35 &&
          it.y <= canvas.height - 10 &&
          Math.abs(it.x - basketX) < basketWidth / 2 + 10
        ) {
          score += it.points;
          setCatcherScore(score);
          soundService.playMunch();
          items.splice(i, 1);
          continue;
        }

        // Remove if off bottom
        if (it.y > canvas.height + 20) {
          items.splice(i, 1);
        }
      }

      // Draw Pet's Bowl / Basket
      ctx.save();
      ctx.fillStyle = '#FB7185';
      ctx.beginPath();
      ctx.roundRect(basketX - basketWidth / 2, canvas.height - 24, basketWidth, basketHeight, 8);
      ctx.fill();
      ctx.strokeStyle = '#E11D48';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Cute paw badge on basket
      ctx.font = '12px sans-serif';
      ctx.fillText('🐾', basketX, canvas.height - 12);
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(timerId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, [activeGame, catcherPlaying]);

  const startCatcherGame = () => {
    setCatcherScore(0);
    setCatcherTimeLeft(25);
    setCatcherGameOver(false);
    setCatcherPlaying(true);
    soundService.playChime();
  };

  // ==========================================
  // GAME 2: MEMORY TREAT MATCH
  // ==========================================
  interface MemoryCard {
    id: number;
    icon: string;
    label: string;
    flipped: boolean;
    matched: boolean;
  }

  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [memoryMoves, setMemoryMoves] = useState(0);
  const [memoryWon, setMemoryWon] = useState(false);

  const initMemoryGame = () => {
    const symbols = [
      { icon: '🍓', label: 'Berry' },
      { icon: '🧋', label: 'Boba' },
      { icon: '🧶', label: 'Yarn' },
      { icon: '🎓', label: 'Cap' },
      { icon: '🦆', label: 'Duck' },
      { icon: '⭐', label: 'Star' },
    ];

    const deck: MemoryCard[] = [];
    symbols.forEach((sym, idx) => {
      deck.push({ id: idx * 2, icon: sym.icon, label: sym.label, flipped: false, matched: false });
      deck.push({ id: idx * 2 + 1, icon: sym.icon, label: sym.label, flipped: false, matched: false });
    });

    // Shuffle deck
    deck.sort(() => Math.random() - 0.5);

    setCards(deck);
    setFlippedIds([]);
    setMemoryMoves(0);
    setMemoryWon(false);
    soundService.playChime();
  };

  const handleCardClick = (id: number) => {
    if (flippedIds.length === 2) return;
    const clicked = cards.find((c) => c.id === id);
    if (!clicked || clicked.flipped || clicked.matched) return;

    soundService.playPop();

    const nextFlipped = [...flippedIds, id];
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, flipped: true } : c)));
    setFlippedIds(nextFlipped);

    if (nextFlipped.length === 2) {
      setMemoryMoves((m) => m + 1);
      const [firstId, secondId] = nextFlipped;
      const c1 = cards.find((c) => c.id === firstId);
      const c2 = cards.find((c) => c.id === secondId);

      if (c1 && c2 && c1.icon === c2.icon) {
        soundService.playChime();
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) => (c.id === firstId || c.id === secondId ? { ...c, matched: true } : c))
          );
          setFlippedIds([]);

          // Check if all matched
          setCards((current) => {
            const allDone = current.every((c) => c.matched || c.id === firstId || c.id === secondId);
            if (allDone) {
              setMemoryWon(true);
              soundService.playLevelUp();
              onReward(35, 30, 25, 'Memory Match');
            }
            return current;
          });
        }, 500);
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) => (c.id === firstId || c.id === secondId ? { ...c, flipped: false } : c))
          );
          setFlippedIds([]);
        }, 900);
      }
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-indigo-100 shadow-sm p-6 sm:p-8 text-left space-y-6 max-w-3xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          {activeGame !== 'menu' && (
            <button
              onClick={() => setActiveGame('menu')}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Campus Pet Mini-Games</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">
              {activeGame === 'menu'
                ? `Play Time with ${petName}`
                : activeGame === 'catcher'
                ? 'Campus Snack Catcher'
                : 'Memory Treat Match'}
            </h2>
          </div>
        </div>

        <button
          onClick={onClose}
          className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100"
        >
          Back to Room
        </button>
      </div>

      {/* MENU VIEW */}
      {activeGame === 'menu' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 py-4">
          {/* Card 1: Snack Catcher */}
          <div className="bg-gradient-to-br from-rose-50 to-pink-50/60 rounded-3xl p-6 border border-pink-100 flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-pink-500 text-white flex items-center justify-center text-2xl shadow-sm">
                🍓
              </div>
              <h3 className="text-base font-bold text-slate-900">Campus Snack Catcher</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Move the bowl with your mouse or touch to catch falling boba, berries, and fish treats!
              </p>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-pink-700 bg-pink-100/70 px-2.5 py-1 rounded-lg">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Earn up to 🐾 45 Pet Points + 25 Happiness</span>
              </div>
            </div>

            <button
              onClick={() => {
                setActiveGame('catcher');
                startCatcherGame();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Play Snack Catcher</span>
            </button>
          </div>

          {/* Card 2: Memory Match */}
          <div className="bg-gradient-to-br from-indigo-50 to-sky-50/60 rounded-3xl p-6 border border-indigo-100 flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl shadow-sm">
                🎴
              </div>
              <h3 className="text-base font-bold text-slate-900">Memory Treat Match</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Flip cards to match cozy pairs of campus pet toys and accessories in minimal moves.
              </p>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 bg-indigo-100/70 px-2.5 py-1 rounded-lg">
                <Trophy className="w-3.5 h-3.5" />
                <span>Earn 🐾 35 Pet Points + 30 Happiness</span>
              </div>
            </div>

            <button
              onClick={() => {
                setActiveGame('memory');
                initMemoryGame();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Play Memory Match</span>
            </button>
          </div>
        </div>
      )}

      {/* SNACK CATCHER VIEW */}
      {activeGame === 'catcher' && (
        <div className="space-y-4 flex flex-col items-center">
          <div className="w-full flex items-center justify-between text-xs font-bold px-2">
            <span className="text-slate-600">Time Left: <strong className="text-indigo-600 text-sm">{catcherTimeLeft}s</strong></span>
            <span className="text-slate-600">Score: <strong className="text-pink-600 text-sm">{catcherScore}</strong></span>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-gradient-to-b from-sky-50 to-pink-50/30">
            <canvas
              ref={canvasRef}
              width={420}
              height={320}
              className="block cursor-ew-resize touch-none"
            />

            {catcherGameOver && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-xs flex flex-col items-center justify-center space-y-3 p-6 animate-fadeIn">
                <Trophy className="w-12 h-12 text-amber-500 animate-bounce" />
                <h3 className="text-lg font-bold text-slate-900">Time's Up!</h3>
                <p className="text-xs text-slate-600">
                  {petName} loved chasing treats with you! You scored <strong>{catcherScore}</strong> points!
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={startCatcherGame}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-pink-500 text-white text-xs font-bold"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Play Again</span>
                  </button>
                  <button
                    onClick={() => setActiveGame('menu')}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
                  >
                    Other Games
                  </button>
                </div>
              </div>
            )}
          </div>
          <p className="text-[11px] text-slate-400">Tip: Slide your finger or mouse left and right to catch treats!</p>
        </div>
      )}

      {/* MEMORY MATCH VIEW */}
      {activeGame === 'memory' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold px-2">
            <span className="text-slate-600">Moves: <strong>{memoryMoves}</strong></span>
            <button
              onClick={initMemoryGame}
              className="flex items-center gap-1 text-[11px] text-indigo-600 font-semibold"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Board</span>
            </button>
          </div>

          <div className="grid grid-cols-4 gap-3 max-w-md mx-auto p-2">
            {cards.map((card) => {
              const isVisible = card.flipped || card.matched;
              return (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  disabled={card.matched}
                  className={`h-22 rounded-2xl flex items-center justify-center text-3xl font-bold transition-all transform duration-200 cursor-pointer ${
                    card.matched
                      ? 'bg-emerald-50 border-2 border-emerald-300 opacity-80 scale-95'
                      : isVisible
                      ? 'bg-white border-2 border-indigo-400 shadow-md rotate-0'
                      : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white hover:scale-105 shadow-sm'
                  }`}
                >
                  {isVisible ? card.icon : '🐾'}
                </button>
              );
            })}
          </div>

          {memoryWon && (
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2 animate-fadeIn max-w-md mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <div className="text-sm font-bold text-emerald-900">Puzzle Solved in {memoryMoves} moves!</div>
              <p className="text-xs text-emerald-700">🐾 +35 Pet Points awarded to your balance!</p>
              <button
                onClick={initMemoryGame}
                className="mt-2 px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs"
              >
                Play Again
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
