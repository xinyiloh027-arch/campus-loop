import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  Info,
  DollarSign
} from 'lucide-react';

interface TextbookEditionCheckerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBookForSearch?: (title: string) => void;
}

interface TextbookMatch {
  courseCode: string;
  courseTitle: string;
  recommendedEdition: string;
  recommendedPriceNew: number;
  olderEditionSafe: string;
  olderEditionAvgPrice: number;
  savingsRm: number;
  safeVerdict: 'Fully Compatible' | 'Minor Variations (Safe)' | 'New Edition Required';
  notes: string;
  isbnNew: string;
  isbnOld: string;
}

const TEXTBOOK_DATABASE: TextbookMatch[] = [
  {
    courseCode: 'MAT112',
    courseTitle: 'Calculus & Analytical Geometry',
    recommendedEdition: 'Stewart Calculus 9th Edition (2020)',
    recommendedPriceNew: 195,
    olderEditionSafe: 'Stewart Calculus 8th Edition (2015)',
    olderEditionAvgPrice: 45,
    savingsRm: 150,
    safeVerdict: 'Fully Compatible',
    notes: 'Chapters 1 through 12 have identical theorem proofs and formulas. Exercises 4.2 and 7.1 have 2 renumbered questions which lecturers provide PDF errata for. 100% recommended to buy 8th edition second-hand.',
    isbnNew: '978-1305480513',
    isbnOld: '978-1285741550',
  },
  {
    courseCode: 'FCSIT101',
    courseTitle: 'Introduction to Computer Science & Python',
    recommendedEdition: 'Python Crash Course 3rd Edition',
    recommendedPriceNew: 145,
    olderEditionSafe: 'Python Crash Course 2nd Edition',
    olderEditionAvgPrice: 35,
    savingsRm: 110,
    safeVerdict: 'Fully Compatible',
    notes: '2nd edition covers identical Python 3 fundamentals. 3rd edition only updates minor third-party library versions (Pygame and Matplotlib). Safe to use 2nd edition for the entire semester.',
    isbnNew: '978-1718502703',
    isbnOld: '978-1593279288',
  },
  {
    courseCode: 'ECO101',
    courseTitle: 'Principles of Microeconomics',
    recommendedEdition: 'Mankiw Principles of Microeconomics 9th Ed',
    recommendedPriceNew: 175,
    olderEditionSafe: 'Mankiw Principles 8th Edition',
    olderEditionAvgPrice: 40,
    savingsRm: 135,
    safeVerdict: 'Minor Variations (Safe)',
    notes: 'Economic models and curves are identical. Real-world case study vignettes use 2017 data instead of 2020 data, which does not affect quiz or exam performance.',
    isbnNew: '978-0357133484',
    isbnOld: '978-1305971493',
  },
  {
    courseCode: 'ENG204',
    courseTitle: 'Electric Circuits & Signal Analysis',
    recommendedEdition: 'Nilsson Electric Circuits 11th Edition',
    recommendedPriceNew: 210,
    olderEditionSafe: 'Nilsson Electric Circuits 10th Edition',
    olderEditionAvgPrice: 50,
    savingsRm: 160,
    safeVerdict: 'Fully Compatible',
    notes: 'Circuit schematics and Laplace transform problem sets match page for page. Verified with course coordinator syllabus.',
    isbnNew: '978-0134746968',
    isbnOld: '978-0133760033',
  }
];

export const TextbookEditionCheckerModal: React.FC<TextbookEditionCheckerModalProps> = ({
  isOpen,
  onClose,
  onSelectBookForSearch,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<TextbookMatch | null>(TEXTBOOK_DATABASE[0]);

  if (!isOpen) return null;

  const filtered = TEXTBOOK_DATABASE.filter(item => 
    item.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.recommendedEdition.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.isbnNew.includes(searchQuery) ||
    item.isbnOld.includes(searchQuery)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center shadow-2xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Textbook Edition & Syllabus Checker</h2>
              <p className="text-xs text-slate-500">
                Compare syllabus-required editions against cheaper older editions. Don't overpay for textbooks!
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold text-sm p-1"
          >
            ✕
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by course code (e.g. MAT112), title, or ISBN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Quick Course Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {filtered.map(book => (
            <button
              key={book.courseCode}
              onClick={() => setSelectedBook(book)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedBook?.courseCode === book.courseCode
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {book.courseCode}: {book.courseTitle}
            </button>
          ))}
        </div>

        {/* Selected Book Comparison Card */}
        {selectedBook && (
          <div className="bg-slate-50/70 rounded-2xl border border-slate-200 p-5 space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
              <div>
                <span className="text-xs font-black text-indigo-700 tracking-wider">
                  {selectedBook.courseCode}
                </span>
                <h3 className="text-base font-bold text-slate-900">{selectedBook.courseTitle}</h3>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{selectedBook.safeVerdict}</span>
              </div>
            </div>

            {/* Price & Edition Comparison Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* New Edition */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                <div className="text-[11px] font-semibold text-slate-500 uppercase">Bookstore Recommended</div>
                <div className="text-xs font-bold text-slate-900">{selectedBook.recommendedEdition}</div>
                <div className="text-sm font-black text-slate-700 pt-1">
                  Brand New: <span className="line-through text-slate-400">RM {selectedBook.recommendedPriceNew}</span>
                </div>
                <div className="text-[10px] text-slate-400">ISBN: {selectedBook.isbnNew}</div>
              </div>

              {/* Older Safe Edition */}
              <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-1">
                <div className="text-[11px] font-semibold text-emerald-800 uppercase flex items-center justify-between">
                  <span>Smart CampusLoop Pick</span>
                  <span className="text-emerald-700 font-bold">Save RM {selectedBook.savingsRm}!</span>
                </div>
                <div className="text-xs font-bold text-emerald-950">{selectedBook.olderEditionSafe}</div>
                <div className="text-sm font-black text-emerald-700 pt-1">
                  Average Used: RM {selectedBook.olderEditionAvgPrice}
                </div>
                <div className="text-[10px] text-emerald-700">ISBN: {selectedBook.isbnOld}</div>
              </div>
            </div>

            {/* Syllabus Analysis Notes */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-indigo-700">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Syllabus & Problem Set Compatibility Analysis</span>
              </div>
              <p className="leading-relaxed text-slate-600">
                {selectedBook.notes}
              </p>
            </div>

            {/* Action button */}
            <div className="pt-2 flex items-center justify-end">
              <button
                onClick={() => {
                  if (onSelectBookForSearch) {
                    onSelectBookForSearch(selectedBook.olderEditionSafe);
                  }
                  onClose();
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <span>Find "{selectedBook.olderEditionSafe}" on CampusLoop</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
