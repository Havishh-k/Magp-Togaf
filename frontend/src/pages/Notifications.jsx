import { useEffect, useState } from 'react';
import api from '../api';
import { Bell, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications/');
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    await api.patch(`/notifications/${id}/read`);
    fetchNotifications();
  };

  const markAllAsRead = async () => {
    await api.post('/notifications/read-all');
    fetchNotifications();
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <Bell className="w-6 h-6 text-neutral-500" />
          Notifications
          {unreadCount > 0 && (
            <span className="bg-primary-100 text-primary-800 text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount} New
            </span>
          )}
        </h1>
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="text-sm font-medium text-primary-600 hover:text-primary-800 transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-neutral-500 dark:text-neutral-400">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-neutral-500 dark:text-neutral-400">You have no notifications.</div>
        ) : (
          <div className="divide-y divide-neutral-200 dark:divide-slate-800">
            {notifications.map(notif => (
              <div 
                key={notif.id} 
                className={clsx("p-4 transition-colors", notif.is_read ? "bg-white dark:bg-slate-900 opacity-70" : "bg-primary-50/50 dark:bg-slate-800")}
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className={clsx("text-sm", notif.is_read ? "font-medium text-neutral-700 dark:text-neutral-300" : "font-bold text-neutral-900 dark:text-white")}>
                      {notif.title}
                    </h3>
                    <p className="text-sm text-neutral-600 mt-1">{notif.message}</p>
                    <p className="text-xs text-neutral-400 mt-2">{new Date(notif.created_at).toLocaleString()}</p>
                  </div>
                  {!notif.is_read && (
                    <button 
                      onClick={() => markAsRead(notif.id)}
                      className="text-neutral-400 hover:text-primary-600 transition-colors"
                      title="Mark as read"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
