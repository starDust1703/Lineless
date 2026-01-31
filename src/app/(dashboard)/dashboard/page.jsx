"use client";
import { useState, useEffect } from 'react';
import { MapPin, Users, LogIn, Clock, Navigation } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '../../../lib/supabase/client';
import { useSearchParams } from 'next/navigation';

const Dashboard = () => {
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);
  const [nearbyQueues, setNearbyQueues] = useState([]);
  const [userQueues, setUserQueues] = useState([]);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") ?? "nearby");
  const [joinQueueKey, setJoinQueueKey] = useState(searchParams.get("q") ?? "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const supabase = createClient();

  useEffect(() => {
    initializeDashboard();
  }, []);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('queue-members-live')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queue_members',
        },
        (payload) => {
          fetchUserQueues(user);
          if (location) fetchNearbyQueues(location);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, location]);

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
            await Promise.all([fetchNearbyQueues(loc), fetchUserQueues(user)]);
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

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const fetchNearbyQueues = async (loc) => {
    try {
      const { data, error } = await supabase
        .from('queues')
        .select('*')
        .order('population', { ascending: false });

      if (error) throw error;

      const queuesWithDistance = data.map(queue => ({
        ...queue,
        distance: calculateDistance(
          loc.latitude,
          loc.longitude,
          queue.latitude,
          queue.longitude
        )
      })).sort((a, b) => {
        if (a.distance !== b.distance) {
          return a.distance - b.distance; // closer first
        }
        return b.population - a.population; // more crowded first
      });

      setNearbyQueues(queuesWithDistance);
    } catch (err) {
      console.error('Error fetching queues:', err);
    }
  };

  const fetchUserQueues = async (User) => {
    try {
      if (!User) return;

      const { data, error } = await supabase
        .from('queue_members')
        .select('*, queues(name, population)')
        .eq('user_id', User.id)
        .order('position', { ascending: true });

      if (error) throw error;
      setUserQueues((data || []).sort((a, b) => a.position - b.position));
    } catch (err) {
      console.error('Error fetching user queues:', err);
    }
  };

  const handleJoinQueue = async (queueId) => {
    const res = (!queueId) ? await supabase.from('queues').select('*').eq('q_key', joinQueueKey).single() : null;

    if (!queueId && !res?.data) throw new Error("Please enter a valid queue key");

    const { error } = await supabase.rpc('join_queue', {
      q_id: queueId || res?.data.id
    });

    if (error) throw error;

    setJoinQueueKey('');

    // await Promise.all([
    //   fetchNearbyQueues(location),
    //   fetchUserQueues(user),
    // ]);

    return res?.data?.name ?? null;
  };

  const handleLeaveQueue = async (qmId) => {
    const { error } = await supabase.rpc('leave_queue', {
      qm_id: qmId,
    });

    if (error) return console.error(error);

    // await Promise.all([
    //   fetchNearbyQueues(location),
    //   fetchUserQueues(user),
    // ]);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--background)">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto border-(--muted)"></div>
          <p className="mt-4 text-(--muted-foreground)">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[90vh] bg-(--background)">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl text-(--foreground) font-bold mb-2 sm:text-4xl">LineLess Dashboard</h1>
          <p className="text-(--muted-foreground) text-sm sm:text-[16px]">Join in queues digitally</p>
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

        <div className="flex gap-2 mb-6 rounded-lg p-1 shadow bg-(--card) text-xs sm:text-[16px]">
          <button
            onClick={() => setActiveTab('nearby')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors cursor-pointer flex items-center justify-center ${activeTab === 'nearby' ? "text-(--primary-foreground) bg-(--primary)" : "text-(--muted-foreground)"}`}
          >
            <Navigation className="inline w-4 h-4 mr-2" />
            <div>Nearby Queues</div>
          </button>
          <button
            onClick={() => setActiveTab('my-queues')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors cursor-pointer flex items-center justify-center ${activeTab === 'my-queues' ? "text-(--primary-foreground) bg-(--primary)" : "text-(--muted-foreground)"}`}
          >
            <Clock className="inline w-4 h-4 mr-2" />
            <div>My Queues</div>
          </button>
          <button
            onClick={() => setActiveTab('join')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors cursor-pointer flex items-center justify-center ${activeTab === 'join' ? "text-(--primary-foreground) bg-(--primary)" : "text-(--muted-foreground)"}`}
          >
            <LogIn className="inline w-4 h-4 mr-2" />
            <div>Join Queue</div>
          </button>
        </div>

        <div className="rounded-lg shadow-lg p-6 bg-(--card)">
          {activeTab === 'nearby' && (
            <div>
              <h2 className="sm:text-2xl text-xl mb-2 font-bold text-(--foreground)">Queues Near You</h2>
              <p className="mb-6 text-(--muted-foreground) text-xs sm:text-sm">Sorted by distance</p>
              <div className="space-y-4">
                {nearbyQueues.length === 0 ? (
                  <p className="text-center py-8 text-(--muted-foreground)">No queues nearby</p>
                ) : (
                  nearbyQueues.map((queue) => (
                    <div
                      key={queue.id}
                      className="border rounded-lg p-4 transition-shadow hover:shadow-md border-(--border)"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-(--ring)">{queue.name}</h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-(--muted-foreground)">
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {queue.population} in queue
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {queue.distance?.toFixed(2)} km away
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            toast.promise(
                              handleJoinQueue(queue.id),
                              {
                                loading: "Joining...",
                                success: () => `Joined ${queue.name} at position ${queue.population + 1}`,
                                error: err => err.message,
                              }
                            )
                          }
                          className="px-4 py-2 rounded-md transition-colors bg-(--primary) text-(--primary-foreground) cursor-pointer hover:opacity-90"
                        >
                          Join
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'my-queues' && (
            <div>
              <h2 className="sm:text-2xl text-xl font-bold mb-2 text-(--foreground)">Your Active Queues</h2>
              <p className="mb-6 text-(--muted-foreground) text-xs sm:text-sm">Sorted by your position</p>
              <div className="space-y-4">
                {userQueues.length === 0 ? (
                  <p className="text-center py-8 text-(--muted-foreground)">You're not in any queues</p>
                ) : (
                  userQueues.map((qm) => (
                    <div
                      key={qm.id}
                      className="border border-(--border) rounded-lg p-4 transition-shadow hover:shadow-md">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-(--ring)">
                            {qm.queues.name}
                          </h3>

                          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-(--muted-foreground)">
                            <span className="font-medium text-(--foreground)">
                              Position: #{qm.position}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {qm.queues.population} total
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              Joined {new Date(qm.joined_at).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <button
                            onClick={() =>
                              toast.promise(
                                handleLeaveQueue(qm.id),
                                {
                                  loading: "Quitting...",
                                  success: () => `Exited ${qm.queues.name}`,
                                  error: "Error",
                                }
                              )
                            }
                            className="py-2 px-4 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 bg-(--destructive) text-(--destructive-foreground) cursor-pointer shadow-md hover:opacity-90"
                          >
                            Quit
                          </button>

                          <div className="text-right">
                            <div className="text-2xl font-bold text-(--foreground)">
                              #{qm.position}
                            </div>
                            <div className="text-xs text-(--muted-foreground)">
                              Your Position
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

          {activeTab === 'join' && (
            <div>
              <h2 className="sm:text-2xl text-xl font-bold mb-2 text-(--foreground)">
                Join a Queue
              </h2>

              <p className="mb-6 text-(--muted-foreground) text-xs sm:text-sm">
                Enter the QKey to join
              </p>

              <div className="flex flex-col items-center">
                <div className='max-w-md w-full'>
                  <label className="block text-sm font-medium mb-2 text-(--foreground)">
                    Queue key
                  </label>

                  <input
                    type="text"
                    value={joinQueueKey}
                    onChange={(e) => setJoinQueueKey(e.target.value)}
                    placeholder="Enter queue key"
                    className="w-full px-4 py-2 rounded-md bg-(--background) text-(--foreground) border border-(--input) focus:outline-none focus:ring-2 focus:ring-(--ring)" />

                  <button
                    onClick={() =>
                      toast.promise(
                        handleJoinQueue(),
                        {
                          loading: "Joining...",
                          success: (res) => `Joined ${res || qm.queues.name}`,
                          error: (err) => err.message,
                        }
                      )
                    }
                    className="mt-4 w-full py-2 px-4 rounded-md font-medium transition-colors bg-(--primary) text-(--primary-foreground) hover:opacity-90 cursor-pointer">
                    Join Queue
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