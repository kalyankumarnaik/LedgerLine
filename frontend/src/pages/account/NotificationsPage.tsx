import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Bell, CheckCheck, CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'ERROR':
        return <XCircle className="w-4 h-4 text-rose-500" />;
      default:
        return <Info className="w-4 h-4 text-violet-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Notification Center</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time security and money movement alerts.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <CheckCheck className="w-4 h-4 mr-1.5" /> Mark All as Read
          </Button>
        )}
      </div>

      <Card>
        <div className="divide-y divide-slate-100 dark:divide-navy-800">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markAsRead(n.id)}
                className={`p-4 flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-navy-850/50 transition-colors ${
                  !n.read ? 'bg-violet-50/40 dark:bg-violet-950/20' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getIcon(n.type)}</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {n.title}
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-violet-500 inline-block" />
                      )}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{n.message}</p>
                    <span className="text-[10px] text-slate-400 font-mono block mt-1">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                <Badge status={n.type} />
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              <Bell className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              You have no notifications at this time.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
