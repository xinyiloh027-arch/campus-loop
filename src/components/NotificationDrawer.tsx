import React from 'react';
import { 
  Bell, 
  Trash2, 
  Tag, 
  ShoppingBag, 
  AlertCircle, 
  Sparkles, 
  ExternalLink,
  BookOpen,
  RefreshCw,
  Gift
} from 'lucide-react';
import { CampusNotification, NotificationType } from '../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: CampusNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onNavigateTab?: (tab: any) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onNavigateTab,
}) => {
  if (!isOpen) return null;

  const isNotificationRead = (n: CampusNotification) => {
    return n.isRead === true || n.read === true;
  };

  const unreadCount = notifications.filter(n => !isNotificationRead(n)).length;

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'trade':
      case 'trade_request':
        return <ShoppingBag className="w-4 h-4 text-sky-600" />;
      case 'borrow':
      case 'borrow_reminder':
        return <RefreshCw className="w-4 h-4 text-teal-600" />;
      case 'price_alert':
        return <Tag className="w-4 h-4 text-purple-600" />;
      case 'budget':
      case 'budget_warning':
        return <AlertCircle className="w-4 h-4 text-rose-600" />;
      case 'pet_milestone':
        return <Sparkles className="w-4 h-4 text-emerald-600" />;
      default:
        return <Bell className="w-4 h-4 text-indigo-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-2xs flex justify-end">
      <div 
        className="w-full max-w-sm sm:max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Notifications</h3>
              <p className="text-xs text-slate-500">
                {unreadCount > 0 ? `${unreadCount} unread campus updates` : 'All caught up!'}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold text-sm p-1 rounded-lg hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
          <button
            onClick={onMarkAllAsRead}
            disabled={unreadCount === 0}
            className={`font-semibold transition-colors ${unreadCount > 0 ? 'text-indigo-600 hover:text-indigo-800' : 'text-slate-400 cursor-not-allowed'}`}
          >
            Mark all as read
          </button>

          <button
            onClick={onClearAll}
            disabled={notifications.length === 0}
            className="text-slate-500 hover:text-rose-600 font-semibold transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear list</span>
          </button>
        </div>

        {/* List of Notifications */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <Bell className="w-10 h-10 text-slate-200 mx-auto" />
              <div className="text-sm font-bold text-slate-700">No Notifications</div>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Trade requests, borrow due dates, and price drop benchmarks will appear here.
              </p>
            </div>
          ) : (
            notifications.map((n) => {
              const isRead = isNotificationRead(n);
              const timeDisplay = n.createdAt || n.timestamp || 'Recent';

              return (
                <div
                  key={n.id}
                  onClick={() => onMarkAsRead(n.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isRead 
                      ? 'bg-white border-slate-100 hover:bg-slate-50/80' 
                      : 'bg-indigo-50/40 border-indigo-200/80 shadow-2xs hover:bg-indigo-50/70'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{n.title}</h4>
                        <span className="text-[10px] text-slate-400 shrink-0">{timeDisplay}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {n.message}
                      </p>

                      {n.linkTab && onNavigateTab && (
                        <div className="pt-1.5 flex justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onMarkAsRead(n.id);
                              onNavigateTab(n.linkTab);
                              onClose();
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
                          >
                            <span>Open View</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
