"use client";
import React, { useState, useEffect } from 'react';
import { MapPin, Users, Plus, LogIn, Clock, Navigation } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { createClient } from '../../../lib/supabase/client';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [nearbyQueues, setNearbyQueues] = useState([]);
  const [userQueues, setUserQueues] = useState([]);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('nearby');
  const [joinQueueId, setJoinQueueId] = useState('');
  const [newQueue, setNewQueue] = useState({ name: '', adminKey: '', passKey: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const supabase = createClient();

  useEffect(() => {
    initializeDashboard();
  }, []);

  const initializeDashboard = async () => {
    try {
      // Get user location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const loc = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };
            await fetchNearbyQueues(loc);
            setLocation(loc);
          },
          (error) => {
            console.error('Location error:', error);
          }
        );
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      // Fetch user queues
      await fetchUserQueues(user);

      setLoading(false);
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

      // Add distance calculation and sort
      const queuesWithDistance = data.map(queue => ({
        ...queue,
        distance: calculateDistance(
          loc.latitude,
          loc.longitude,
          queue.latitude,
          queue.longitude
        )
      }));

      // Sort by population (already done), but you can also sort by distance
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
      setUserQueues(data || []);
    } catch (err) {
      console.error('Error fetching user queues:', err);
    }
  };

  const handleJoinQueue = async (queueId) => {
    const qId = queueId || joinQueueId;
    if (!qId) throw new Error('Please enter a queue ID');

    const { data, error } = await supabase.rpc('join_queue', {
      q_id: qId,
      u_id: user.id,
    });

    if (error) throw error;

    setJoinQueueId('');

    await Promise.all([
      fetchNearbyQueues(location),
      fetchUserQueues(user),
    ]);
  };

  const handleLeaveQueue = async (qmId) => {
    const { error } = await supabase.rpc('leave_queue', {
      qm_id: qmId,
    });

    if (error) return console.error(error);

    await Promise.all([
      fetchNearbyQueues(location),
      fetchUserQueues(user),
    ]);
  };

  const handleCreateQueue = async () => {
    try {
      setError('');
      setSuccess('');

      if (!newQueue.name) {
        setError('Please enter a queue name');
        return;
      }
      if (!newQueue.passKey) {
        setError('Please enter a pass key');
        return;
      }
      if (newQueue.passKey.length > 16) {
        setError('Pass key can be atmost 16 characters');
        return;
      }

      // Verify admin key
      const { data: profile } = await supabase
        .from('profiles')
        .select('admin_key')
        .eq('id', user.id)
        .single();

      if (!profile?.admin_key || profile.admin_key !== newQueue.adminKey) {
        setError('Invalid admin key');
        return;
      }

      if (!location) {
        setError('Location not available');
        return;
      }

      // Create queue
      await supabase.from('queues').insert({
        name: newQueue.name,
        created_by: user.id,
        pass: newQueue.passKey,
        latitude: location.latitude,
        longitude: location.longitude,
        population: 0
      }).catch((err) => {
        setError(err);
      });

      setSuccess('Queue created successfully!');
      setNewQueue({ name: '', adminKey: '', passKey: '' });
      await fetchNearbyQueues(location);
      setActiveTab('nearby');
    } catch (err) {
      setError('Failed to create queue');
    }
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
          <h1 className="text-4xl text-(--foreground) font-bold mb-2">LineLess Dashboard</h1>
          <p className="text-(--muted-foreground)">Manage your queues digitally</p>
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

        <div className="flex gap-2 mb-6 rounded-lg p-1 shadow bg-(--card)">
          <button
            onClick={() => setActiveTab('nearby')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors cursor-pointer ${activeTab === 'nearby' ? "text-(--primary-foreground) bg-(--primary)" : "text-(--muted-foreground)"}`}
          >
            <Navigation className="inline w-4 h-4 mr-2" />
            Nearby Queues
          </button>
          <button
            onClick={() => setActiveTab('my-queues')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors cursor-pointer ${activeTab === 'my-queues' ? "text-(--primary-foreground) bg-(--primary)" : "text-(--muted-foreground)"}`}
          >
            <Clock className="inline w-4 h-4 mr-2" />
            My Queues
          </button>
          <button
            onClick={() => setActiveTab('join')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors cursor-pointer ${activeTab === 'join' ? "text-(--primary-foreground) bg-(--primary)" : "text-(--muted-foreground)"}`}
          >
            <LogIn className="inline w-4 h-4 mr-2" />
            Join Queue
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors cursor-pointer ${activeTab === 'create' ? "text-(--primary-foreground) bg-(--primary)" : "text-(--muted-foreground)"}`}
          >
            <Plus className="inline w-4 h-4 mr-2" />
            Create Queue
          </button>
        </div>

        <div className="rounded-lg shadow-lg p-6 bg-(--card)">
          {activeTab === 'nearby' && (
            <div>
              <h2 className="text-2xl mb-2 font-bold text-(--foreground)">Queues Near You</h2>
              <p className="mb-6 text-(--muted-foreground)">Sorted by popularity</p>
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
                            toast.promise(handleJoinQueue(), {
                              loading: "Joining...",
                              success: `Joined Queue ${queue.name} at position ${queue.population + 1}`,
                              error: (err) => err.message,
                            }, {
                              success: {
                                style: { background: "#16a34a", color: "white" }
                              },
                              error: {
                                style: { background: "#dc2626", color: "white" }
                              }
                            })
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
              <h2 className="text-2xl font-bold mb-2 text-(--foreground)">Your Active Queues</h2>
              <p className="mb-6 text-(--muted-foreground)">Sorted by your position</p>
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
                                  loading: "Loading...",
                                  success: () => `Exited Queue ${qm.queues.name}`,
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
              <h2 className="text-2xl font-bold mb-2 text-(--foreground)">
                Join a Queue
              </h2>

              <p className="mb-6 text-(--muted-foreground)">
                Enter the QKey to join
              </p>

              <div className="flex flex-col items-center">
                <div className='max-w-md w-full'>
                  <label className="block text-sm font-medium mb-2 text-(--foreground)">
                    Queue key
                  </label>

                  <input
                    type="text"
                    value={joinQueueId}
                    onChange={(e) => setJoinQueueId(e.target.value)}
                    placeholder="Enter queue key"
                    className="w-full px-4 py-2 rounded-md bg-(--background) text-(--foreground) border border-(--input) focus:outline-none focus:ring-2 focus:ring-(--ring)" />

                  <button
                    onClick={() =>
                      toast.promise(
                        handleJoinQueue(),
                        {
                          loading: "Joining...",
                          success: () => `Joined ${qm.queues.name}`,
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

          {activeTab === 'create' && (
            <div>
              <h2 className="text-2xl font-bold mb-2 text-(--foreground)">
                Create a New Queue
              </h2>

              <p className="mb-6 text-(--muted-foreground)">
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
                      value={newQueue.passKey}
                      onChange={(e) =>
                        setNewQueue({ ...newQueue, passKey: e.target.value })
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
    </div >
  );
};

export default Dashboard;