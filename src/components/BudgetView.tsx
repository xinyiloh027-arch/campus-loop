import React, { useState } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  PlusCircle, 
  Trash2, 
  AlertTriangle, 
  ShoppingBag, 
  X,
  Sparkles
} from 'lucide-react';
import { BudgetTransaction, BudgetCategory, BudgetSettings, TradeRequest } from '../types';
import { storageService } from '../services/storageService';

interface BudgetViewProps {
  transactions: BudgetTransaction[];
  settings: BudgetSettings;
  tradeRequests: TradeRequest[];
  onRefreshData: () => void;
}

const CATEGORIES: BudgetCategory[] = [
  'Food',
  'Transportation',
  'Education',
  'Accommodation',
  'Entertainment',
  'Shopping',
  'CampusLoop',
  'Other',
];

export const BudgetView: React.FC<BudgetViewProps> = ({
  transactions,
  settings,
  tradeRequests,
  onRefreshData,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingSettings, setEditingSettings] = useState(false);
  const [monthlyBudgetInput, setMonthlyBudgetInput] = useState(settings.monthlyBudget.toString());

  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<BudgetCategory>('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const remainingBudget = settings.monthlyBudget - totalExpenses;
  const spendingPercent = Math.round((totalExpenses / (settings.monthlyBudget || 1)) * 100);

  const isOverBudget = spendingPercent >= 100;
  const isNearBudget = spendingPercent >= settings.warningThresholdPercent && !isOverBudget;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return;

    storageService.addBudgetTransaction({
      type,
      amount: num,
      category,
      date,
      note: note.trim() || undefined,
    });

    setAmount('');
    setNote('');
    setShowAddModal(false);
    onRefreshData();
  };

  const handleDelete = (id: string) => {
    storageService.deleteBudgetTransaction(id);
    onRefreshData();
  };

  const handleSaveBudget = () => {
    const num = parseFloat(monthlyBudgetInput);
    if (!isNaN(num) && num > 0) {
      storageService.updateBudgetSettings({
        ...settings,
        monthlyBudget: num,
      });
      setEditingSettings(false);
      onRefreshData();
    }
  };

  const importedTradeIds = new Set(transactions.map((t) => t.importedFromTradeId).filter(Boolean));
  const availableCompletedTrades = tradeRequests.filter(
    (tr) => tr.status === 'Completed' && !importedTradeIds.has(tr.id)
  );

  const handleImportTrade = (trade: TradeRequest) => {
    const isExpense = trade.isSentByCurrentUser;

    storageService.addBudgetTransaction({
      type: isExpense ? 'expense' : 'income',
      amount: trade.offeredPrice || trade.listingPrice,
      category: 'CampusLoop',
      date: new Date(trade.createdAt).toISOString().split('T')[0],
      note: `${isExpense ? 'Bought' : 'Sold'}: ${trade.listingTitle}`,
      importedFromTradeId: trade.id,
    });

    onRefreshData();
  };

  const filteredTransactions = transactions.filter((t) =>
    filterCategory === 'All' ? true : t.category === filterCategory
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-1">
            <Wallet className="w-3.5 h-3.5" />
            <span>Campus Personal Finance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Budget & Student Spending Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Keep track of food, accommodation, textbooks, and campus marketplace trades without financial stress.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {availableCompletedTrades.length > 0 && (
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Import Trade ({availableCompletedTrades.length})</span>
            </button>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add Entry</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Monthly Budget Goal</span>
            <button
              onClick={() => setEditingSettings(!editingSettings)}
              className="text-[11px] text-indigo-600 hover:underline"
            >
              {editingSettings ? 'Cancel' : 'Edit'}
            </button>
          </div>
          {editingSettings ? (
            <div className="flex items-center gap-1 mt-1">
              <input
                type="number"
                value={monthlyBudgetInput}
                onChange={(e) => setMonthlyBudgetInput(e.target.value)}
                className="w-24 px-2 py-1 text-sm border rounded"
              />
              <button
                onClick={handleSaveBudget}
                className="px-2 py-1 bg-indigo-600 text-white text-xs font-bold rounded"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="text-2xl font-bold text-slate-900 tabular-nums">
              RM {settings.monthlyBudget.toFixed(0)}
            </div>
          )}
          <span className="text-[11px] text-slate-400 block">Target spending ceiling</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-xs text-slate-500 font-medium block">Total Expenses This Month</span>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            RM {totalExpenses.toFixed(2)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-rose-600 font-medium">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>{spendingPercent}% of budget spent</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-xs text-slate-500 font-medium block">Total Income / Allowance</span>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            RM {totalIncome.toFixed(2)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Allowance & Trades</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-xs text-slate-500 font-medium block">Remaining Safe Allowance</span>
          <div className={`text-2xl font-black tabular-nums ${remainingBudget < 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            RM {remainingBudget.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-400 block">
            {remainingBudget < 0 ? 'Budget exceeded' : 'Available for safe spending'}
          </span>
        </div>
      </div>

      {/* Overspending Alerts */}
      {isOverBudget && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700 space-y-1">
            <h4 className="font-bold text-amber-950">
              Budget Notice: You have reached 100% of your RM {settings.monthlyBudget} monthly budget.
            </h4>
            <p className="leading-relaxed">
              No stress — unexpected semester course materials and printing happen! Consider reviewing upcoming non-essential leisure expenses, or listing unused textbooks on CampusLoop to boost your student allowance.
            </p>
          </div>
        </div>
      )}

      {isNearBudget && (
        <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700 space-y-1">
            <h4 className="font-bold text-sky-950">
              Heads Up: You have used {spendingPercent}% of your monthly allowance.
            </h4>
            <p className="leading-relaxed">
              You still have <strong>RM {remainingBudget.toFixed(2)}</strong> remaining. Pacing your weekly dining and shopping will keep you comfortably on track!
            </p>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
          <span>Monthly Spending Progress</span>
          <span className="tabular-nums">
            RM {totalExpenses.toFixed(0)} / RM {settings.monthlyBudget.toFixed(0)} ({spendingPercent}%)
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isOverBudget ? 'bg-rose-500' : isNearBudget ? 'bg-amber-500' : 'bg-indigo-600'
            }`}
            style={{ width: `${Math.min(100, spendingPercent)}%` }}
          />
        </div>
      </div>

      {/* Transactions Table & Category Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Transaction Records
            </h3>
            <span className="text-xs text-slate-400">
              Showing {filteredTransactions.length} recorded entries
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setFilterCategory('All')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                filterCategory === 'All' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  filterCategory === cat ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No transaction records found under this filter. Click "+ Add Entry" to record an expense or allowance.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Description / Note</th>
                  <th className="py-2.5 px-3 text-right">Amount (RM)</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 text-slate-500 tabular-nums">{tx.date}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                        tx.category === 'CampusLoop'
                          ? 'bg-indigo-50 text-indigo-700'
                          : tx.category === 'Food'
                          ? 'bg-amber-50 text-amber-800'
                          : tx.category === 'Education'
                          ? 'bg-sky-50 text-sky-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-800 max-w-xs truncate">
                      {tx.note || '—'}
                      {tx.importedFromTradeId && (
                        <span className="ml-1 text-[10px] text-indigo-600 bg-indigo-50 px-1 py-0.2 rounded font-normal">
                          Marketplace Trade
                        </span>
                      )}
                    </td>
                    <td className={`py-3 px-3 text-right font-bold tabular-nums ${
                      tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                    }`}>
                      {tx.type === 'income' ? '+' : '-'}RM {tx.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handleDelete(tx.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="Delete transaction"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Add Spending or Income</h3>
              <button onClick={() => setShowAddModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`py-1.5 text-xs font-bold rounded ${
                    type === 'expense' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`py-1.5 text-xs font-bold rounded ${
                    type === 'income' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Income / Allowance
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Amount in RM <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">RM</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    placeholder="25.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="w-full pl-10 pr-3 py-1.5 text-xs bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as BudgetCategory)}
                  className="w-full px-3 py-1.5 text-xs bg-white rounded-lg border border-slate-200"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Note (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Mahallah cafe breakfast or Midterm textbook"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white rounded-lg border border-slate-200"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Import Marketplace Trades
              </h3>
              <button onClick={() => setShowImportModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              One-click import your completed peer transactions into your budget (duplicates are automatically prevented):
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {availableCompletedTrades.map((t) => (
                <div
                  key={t.id}
                  className="p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3 bg-slate-50"
                >
                  <div className="min-w-0 flex-1 text-xs">
                    <span className="font-bold text-slate-900 truncate block">
                      {t.listingTitle}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {t.isSentByCurrentUser ? 'Purchase' : 'Sale'} · RM {t.offeredPrice}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      handleImportTrade(t);
                      if (availableCompletedTrades.length <= 1) setShowImportModal(false);
                    }}
                    className="px-3 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shrink-0"
                  >
                    Import
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
