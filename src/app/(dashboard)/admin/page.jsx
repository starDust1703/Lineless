"use client";
import { useState, useEffect } from 'react';
import { Users, Plus, Clock, UserRoundPen, QrCode, X, Download } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '../../../lib/supabase/client';
import { useRouter } from 'next/navigation';
import Modal from '../../../components/ui/Modal';

const AdminDashboard = () => {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userQueues, setUserQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("create");
  const [newQueue, setNewQueue] = useState({ name: "", qKey: "", venue: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openQueueId, setOpenQueueId] = useState(false);

  useEffect(() => {
    fetchUserQueues();
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

  const fetchUserQueues = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('queues')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserQueues(data || []);
      setLoading(false);
    } catch (err) {
      setError('Failed to initialize dashboard');
      setLoading(false);
    }
  };

  const getCurrLocation = () => {
    return new Promise(
      (resolve, reject) => {
        if (!navigator.geolocation) {
          reject("Geolocation not supported");
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const loc = {
              lat: position.coords.latitude,
              lon: position.coords.longitude,
            };

            resolve(loc);
          },
          (error) => {
            reject(error);
          }
        );
      }
    );
  };

  const getCoordinates = async (loc) => {
    const res = await fetch(`/api/geocode?q=${encodeURIComponent(loc)}`);
    const data = await res.json();
    if (!data || data.length === 0) {
      throw new Error("Invalid venue");
    }

    return data?.[0];
  };

  const handleCreateQueue = async (e) => {
    e.preventDefault();
    if (!newQueue.name || !newQueue.qKey) {
      throw new Error("Queue name and key are required");
    }

    try {
      setError('');
      setSuccess('');

      const { lat, lon } = (newQueue.venue ? await getCoordinates(newQueue.venue) : await getCurrLocation());

      const { data, error } = await supabase.rpc('create_queue', {
        p_name: newQueue.name,
        p_q_key: newQueue.qKey,
        p_latitude: Number(lat),
        p_longitude: Number(lon),
        p_loc_name: newQueue.venue || null
      });

      if (error) throw error;

      setUserQueues(prev => [data, ...prev]);
      setActiveTab('manage');
      setSuccess('Queue created successfully!');
      setNewQueue({ name: '', qKey: '', venue: '' });
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

  const downloadQR = async (qrUrl, qKey) => {
    try {
      const res = await fetch(qrUrl);
      const blob = await res.blob();

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${qKey}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("QR download failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto border-(--muted-foreground)"></div>
          <p className="mt-4 text-(--muted-foreground)">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[90vh]">
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
          {activeTab === 'create' && (
            <div>
              <h2 className="sm:text-2xl text-xl font-bold mb-2 text-(--foreground)">
                Create a New Queue
              </h2>

              <p className="mb-6 text-(--muted-foreground) text-xs sm:text-sm">
                Admin access required
              </p>

              <form onSubmit={handleCreateQueue} className="flex flex-col items-center">
                <div className='max-w-md w-full space-y-4'>
                  <div>
                    <label htmlFor='qName' className="block text-sm font-medium mb-2 text-(--foreground)">
                      Queue Name
                    </label>

                    <input
                      id='qName'
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
                    <label htmlFor='venue' className="block text-sm font-medium mb-2 text-(--foreground)">
                      Venue
                    </label>

                    <input
                      id='venue'
                      value={newQueue.venue}
                      onChange={(e) => setNewQueue({ ...newQueue, venue: e.target.value })}
                      placeholder="Enter venue address (defaults to your location)"
                      className="w-full px-4 py-2 rounded-md bg-(--background) text-(--foreground) border border-(--input) focus:outline-none focus:ring-2 focus:ring-(--ring)" />
                  </div>

                  <div>
                    <label htmlFor='qKey' className="block text-sm font-medium mb-2 text-(--foreground)">
                      Queue Key
                    </label>

                    <input
                      id='qKey'
                      value={newQueue.qKey}
                      onChange={(e) =>
                        setNewQueue({ ...newQueue, qKey: e.target.value })
                      }
                      placeholder="Create a Queue key"
                      className="w-full px-4 py-2 rounded-md bg-(--background) text-(--foreground) border border-(--input) focus:outline-none focus:ring-2 focus:ring-(--ring)"
                      required />
                  </div>

                  <button
                    type='submit'
                    className="mt-4 w-full py-2 px-4 rounded-md font-medium transition-colors bg-(--primary) text-(--primary-foreground) hover:opacity-90 cursor-pointer">
                    Create Queue
                  </button>
                </div>
              </form>
            </div>
          )}

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
                          <button className='text-(--muted-foreground) cursor-pointer border border-(--border) hover:bg-(--muted-foreground)/10 p-2 rounded-lg outline-none' onClick={() => setOpenQueueId(queue.id)}>
                            <QrCode />
                          </button>
                          <Modal
                            open={openQueueId === queue.id}
                            setOpen={() => setOpenQueueId(null)}
                            comp={
                              <div>
                                <div className='flex justify-between items-center p-2 mb-3'>
                                  <X
                                    className='text-(--foreground) cursor-pointer hover:text-(--foreground)/80 rounded-lg'
                                    onClick={() => setOpenQueueId(null)}
                                  />

                                  <Download
                                    className='text-(--foreground) cursor-pointer hover:text-(--foreground)/80 rounded-lg'
                                    onClick={() =>
                                      downloadQR(
                                        `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(queue.q_key)}`,
                                        queue.q_key
                                      )
                                    }
                                  />
                                </div>

                                <div className='flex justify-center p-4'>
                                  <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(queue.q_key)}`}
                                    alt='qr-code'
                                  />
                                </div>

                                <div className='flex justify-center text-xl font-semibold'>
                                  <p>{queue.q_key}</p>
                                </div>
                              </div>
                            }
                          />

                          <button className='text-(--ring) cursor-pointer border border-(--border) hover:bg-(--muted-foreground)/10 p-2 rounded-4xl' onClick={() => router.push(`/admin/${queue.q_key}`)}>
                            <UserRoundPen />
                          </button>
                          {!queue.population &&
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
                          }
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
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;