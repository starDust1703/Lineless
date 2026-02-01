"use client";
import { useState, useEffect } from 'react';
import { Users, Plus, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '../../../lib/supabase/client';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [userQueues, setUserQueues] = useState([]);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("create");
  const [newQueue, setNewQueue] = useState({ name: "", adminKey: "", qKey: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const supabase = createClient();

  useEffect(() => {
    initializeDashboard();
  }, []);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('queue-live')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queue_members',
        },
        async (payload) => {
          const queueId =
            payload.new?.queue_id || payload.old?.queue_id;
          if (!queueId) {
            if (payload.eventType === 'DELETE') fetchUserQueues(user);
            return;
          }
          const { count } = await supabase
            .from('queue_members')
            .select('*', { count: 'exact', head: true })
            .eq('queue_id', queueId);

          setUserQueues((prev) =>
            prev.map((q) =>
              q.id === queueId ? { ...q, population: count } : q
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const initializeDashboard = async () => {
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const loc = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };

            const { data: { user } } = await supabase.auth.getUser();

            setUser(user);
            setLocation(loc);

            if (user) {
              await fetchUserQueues(user);
            }

            setLoading(false);
          },
          (error) => {
            console.error('Location error:', error);
            setLoading(false);
          }
        );
      }

    } catch (err) {
      setError('Failed to initialize dashboard');
      setLoading(false);
    }
  };

  const fetchUserQueues = async (User) => {
    try {
      if (!User) return;

      const { data, error } = await supabase
        .from('queues')
        .select('*')
        .eq('created_by', User.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserQueues(data || []);
    } catch (err) {
      console.error('Error fetching your queues:', err);
    }
  };

  const handleCreateQueue = async () => {
    try {
      setError('');
      setSuccess('');

      if (!location) {
        setError('Location not available');
        return;
      }

      const { data, error } = await supabase.rpc('create_queue', {
        p_name: newQueue.name,
        p_q_key: newQueue.qKey,
        p_admin_key: newQueue.adminKey,
        p_latitude: location.latitude,
        p_longitude: location.longitude,
      });

      if (error) throw error;

      setUserQueues(prev => [data, ...prev]);
      setActiveTab('manage');
      setSuccess('Queue created successfully!');
      setNewQueue({ name: '', adminKey: '', qKey: '' });
    } catch (err) {
      setError(err.message ?? 'Failed to create queue');
    }
  };

  const handleDeleteQueue = async (queueId) => {
    const { error } = await supabase.rpc('delete_queue', {
      p_queue_id: queueId,
    });

    if (error) throw error;

    setUserQueues(prev => prev.filter(q => q.id !== queueId));
  };

  const formatDateTime = (date = new Date()) => {
    const now = new Date();

    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const time = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    if (isToday) return `${time} · Today`;

    const datePart = date.toLocaleDateString([], {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

    return `${time} · ${datePart}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--background)">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto border-(--muted-foreground)"></div>
          <p className="mt-4 text-(--muted-foreground)">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[90vh] bg-(--background)">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl text-(--foreground) font-bold mb-2 sm:text-4xl">LineLess Admin</h1>
          <p className="text-(--muted-foreground) text-sm sm:text-[16px]">Manage your queues digitally</p>
        </div>

        {error && (
          <div className="mb-4 p-4 border rounded bg-(--destructive) text-(--destructive-foreground) border-(--destructive)">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 border rounded bg-(--success-bg) border-(--success) text-(--success)">
            {success}
          </div>
        )}
        <div className='w-full flex justify-center'>
          <div className="flex gap-2 w-2xl mb-6 rounded-lg p-1 shadow bg-(--card) text-xs sm:text-[16px]">
            <button
              onClick={() => setActiveTab('create')}
              className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors cursor-pointer flex items-center justify-center ${activeTab === 'create' ? "text-(--primary-foreground) bg-(--primary)" : "text-(--muted-foreground)"}`}
            >
              <Plus className="inline w-4 h-4 mr-2" />
              <div>Create Queue</div>
            </button>

            <button
              onClick={() => setActiveTab('manage')}
              className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors cursor-pointer flex items-center justify-center ${activeTab === 'manage' ? "text-(--primary-foreground) bg-(--primary)" : "text-(--muted-foreground)"}`}
            >
              <Clock className="inline w-4 h-4 mr-2" />
              <div>Manage Queues</div>
            </button>
          </div>
        </div>

        <div className="rounded-lg shadow-lg p-6 bg-(--card)">
          {activeTab === 'manage' && (
            <div>
              <h2 className="sm:text-2xl text-xl font-bold mb-2 text-(--foreground)">Manage Your Queues</h2>
              <p className="mb-6 text-(--muted-foreground) text-xs sm:text-sm">Modify and Delete your Queues</p>
              <div className="space-y-4">
                {userQueues.length === 0 ? (
                  <p className="text-center py-8 text-(--muted-foreground)">You haven't created any queue yet</p>
                ) : (
                  userQueues.map((queue) => (
                    <div
                      key={queue.id}
                      className="border border-(--border) rounded-lg p-4 transition-shadow hover:shadow-md">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-(--ring)">
                            {queue.name}
                          </h3>

                          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-(--muted-foreground)">
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {queue.population} total
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              Created {formatDateTime(new Date(queue.created_at))}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <button
                            onClick={() =>
                              toast.promise(
                                handleDeleteQueue(queue.id),
                                {
                                  loading: "Deleting...",
                                  success: () => `Deleted ${queue.name}`,
                                  error: "Error",
                                }
                              )
                            }
                            className="py-2 px-4 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 bg-(--destructive) text-(--destructive-foreground) cursor-pointer shadow-md hover:opacity-90"
                          >
                            Delete
                          </button>

                          <div className="text-right">
                            <div className="text-2xl font-bold text-(--foreground)">
                              {queue.population}
                            </div>
                            <div className="text-xs text-(--muted-foreground)">
                              Members
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'create' && (
            <div>
              <h2 className="sm:text-2xl text-xl font-bold mb-2 text-(--foreground)">
                Create a New Queue
              </h2>

              <p className="mb-6 text-(--muted-foreground) text-xs sm:text-sm">
                Admin access required
              </p>

              <div className="flex flex-col items-center">
                <div className='max-w-md w-full space-y-4'>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-(--foreground)">
                      Queue Name
                    </label>

                    <input
                      type="text"
                      value={newQueue.name}
                      onChange={(e) =>
                        setNewQueue({ ...newQueue, name: e.target.value })
                      }
                      placeholder="e.g., Hospital Registration"
                      className="w-full px-4 py-2 rounded-md bg-(--background) text-(--foreground) border border-(--input) focus:outline-none focus:ring-2 focus:ring-(--ring)"
                      required />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-(--foreground)">
                      Queue Key
                    </label>

                    <input
                      value={newQueue.qKey}
                      onChange={(e) =>
                        setNewQueue({ ...newQueue, qKey: e.target.value })
                      }
                      placeholder="Create a Queue key"
                      className="w-full px-4 py-2 rounded-md bg-(--background) text-(--foreground) border border-(--input) focus:outline-none focus:ring-2 focus:ring-(--ring)"
                      required />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-(--foreground)">
                      Admin Key
                    </label>

                    <input
                      type="password"
                      value={newQueue.adminKey}
                      onChange={(e) =>
                        setNewQueue({ ...newQueue, adminKey: e.target.value })
                      }
                      placeholder="Enter your admin key"
                      className="w-full px-4 py-2 rounded-md bg-(--background) text-(--foreground) border border-(--input) focus:outline-none focus:ring-2 focus:ring-(--ring)"
                      required />
                  </div>

                  <button
                    onClick={handleCreateQueue}
                    className="mt-4 w-full py-2 px-4 rounded-md font-medium transition-colors bg-(--primary) text-(--primary-foreground) hover:opacity-90 cursor-pointer">
                    Create Queue
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;