"use client";
import { useState, useEffect } from 'react';
import { MapPin, Users, LogIn, Clock, Navigation, MapPinned, X, BellPlus, LogOut, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '../../../lib/supabase/client';
import { useSearchParams } from 'next/navigation';
import UserHeader from '../../../components/UserHeader';
import Link from 'next/link';
import Modal from '../../../components/ui/Modal';
import { requestNotificationPermission, sendNotification } from '../../../lib/notifications/notification';
import Dropdown from '../../../components/ui/DropDown';

const Dashboard = () => {
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);
  const [nearbyQueues, setNearbyQueues] = useState([]);
  const [userQueues, setUserQueues] = useState([]);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") ?? "nearby");
  const [joinQueue, setJoinQueue] = useState(null);
  const [isJoining, setIsJoining] = useState(false);
  const [joinQueueKey, setJoinQueueKey] = useState(searchParams.get("q") ?? "");
  const [notifyFor, setNotifyFor] = useState(null);
  const [notifyRank, setNotifyRank] = useState(1);
  const [isSettingNotify, setIsSettingNotify] = useState(false);
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
          if (payload.new.position <= payload.new.notify_rank && !payload.new.is_notified) {
            handleNotification(payload.new);
          }
          fetchNearbyQueues();
        }
      ).on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queues',
        },
        (payload) => {
          fetchNearbyQueues();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const getCurrLocation = () => {
    if (location) return Promise.resolve(location);

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          };
          setLocation(loc);
          resolve(loc);
        },
        reject
      );
    });
  };

  const initializeDashboard = async () => {
    await requestNotificationPermission();

    try {
      const { data: { user } } = await supabase.auth.getUser();

      setUser(user);
      await Promise.all([fetchNearbyQueues(), fetchUserQueues(user)]);
      setLoading(false);
    } catch (err) {
      toast.error("Failed to initialize dashboard");
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

  const fetchNearbyQueues = async () => {
    try {
      const { data, error } = await supabase
        .from('queues')
        .select('*')
        .order('population', { ascending: false });

      if (error) throw error;

      const loc = await getCurrLocation()
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
        .select('*, queues(name, population, live, latitude, longitude)')
        .eq('user_id', User.id)
        .order('position', { ascending: true });

      if (error) throw error;

      const loc = await getCurrLocation()
      const distIncluded = data.map(qm => ({
        ...qm,
        distance: calculateDistance(
          loc.latitude,
          loc.longitude,
          qm.queues.latitude,
          qm.queues.longitude
        )
      }));
      setUserQueues(distIncluded);
    } catch (err) {
      console.error('Error fetching user queues:', err);
    }
  };

  const handleJoinQueue = async (queueId) => {
    if (isJoining) return;
    setIsJoining(true);

    try {
      let queueName = null;
      let qId = queueId;

      if (!qId) {
        const { data, error } = await supabase
          .from('queues')
          .select('id, name')
          .eq('q_key', joinQueueKey)
          .single();

        if (error || !data) throw new Error("Please enter a valid queue key");

        qId = data.id;
        queueName = data.name;
      }

      const { error } = await supabase.rpc('join_queue', { q_id: qId });
      if (error) throw error;

      setJoinQueueKey('');
      return queueName ?? "queue";
    } finally {
      setIsJoining(false);
    }
  };

  const handleSetNotify = async (qm_id) => {
    if (isSettingNotify) return;
    setIsSettingNotify(true);

    try {
      const { error } = await supabase
        .from('queue_members')
        .update({ notify_rank: notifyRank, is_notified: false })
        .eq('id', qm_id);
      if (error) throw error;

      setNotifyRank(1);
      setNotifyFor(null);
    } finally {
      setIsSettingNotify(false);
    }
  };

  const handleNotification = async (qm) => {
    const queueName =
      userQueues.find(q => q.id === qm.id)?.queues?.name || "Queue";

    await sendNotification(
      "Your turn is approaching",
      `You are now at position ${qm.position} in ${queueName}`
    );
    await supabase
      .from('queue_members')
      .update({ notify_rank: null, is_notified: true })
      .eq('id', qm.id);
  }

  const handleLeaveQueue = async (qmId) => {
    const { error } = await supabase.rpc('leave_queue', {
      qm_id: qmId,
    });

    if (error) return console.error(error);

    setUserQueues(prev =>
      prev.filter(qm => qm.id !== qmId)
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto border-(--muted-foreground)"></div>
          <p className="mt-4 text-(--muted-foreground)">Loading dashboard...</p>
        </div>
      </div>
    );
  }

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

  const LiveDot = () => {
    return (
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
      </span>
    );
  };

  const PausedDot = () => {
    return (
      <span className="relative flex h-3 w-3">
        <span className="absolute inline-flex h-full w-full rounded-full bg-gray-400 opacity-40"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-gray-500"></span>
      </span>
    );
  };

  return (
    <div className="min-h-[90vh]">
      <UserHeader user={user} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-8">
          <h1 className="text-3xl text-(--foreground) font-bold mb-2 sm:text-4xl">LineLess Dashboard</h1>
          <p className="text-(--muted-foreground) text-sm sm:text-[16px]">Join in queues digitally</p>
        </div>

        <div className="flex gap-2 mb-6 rounded-lg p-1 shadow bg-(--card) text-xs sm:text-[16px] overflow-x-auto">
          <button
            onClick={() => setActiveTab('nearby')}
            className={`flex-1 min-w-40 sm:min-w-48 py-3 px-4 rounded-md font-medium transition-colors cursor-pointer flex items-center justify-center ${activeTab === 'nearby' ? "text-(--primary-foreground) bg-(--primary)" : "text-(--muted-foreground)"}`}
          >
            <Navigation className="inline w-4 h-4 mr-2" />
            <div className="whitespace-nowrap">Nearby Queues</div>
          </button>
          <button
            onClick={() => setActiveTab('my-queues')}
            className={`flex-1 min-w-40 sm:min-w-48 py-3 px-4 rounded-md font-medium transition-colors cursor-pointer flex items-center justify-center ${activeTab === 'my-queues' ? "text-(--primary-foreground) bg-(--primary)" : "text-(--muted-foreground)"}`}
          >
            <Clock className="inline w-4 h-4 mr-2" />
            <div className="whitespace-nowrap">My Queues</div>
          </button>
          <button
            onClick={() => setActiveTab('join')}
            className={`flex-1 min-w-40 sm:min-w-48 py-3 px-4 rounded-md font-medium transition-colors cursor-pointer flex items-center justify-center ${activeTab === 'join' ? "text-(--primary-foreground) bg-(--primary)" : "text-(--muted-foreground)"}`}
          >
            <LogIn className="inline w-4 h-4 mr-2" />
            <div className="whitespace-nowrap">Join Queue</div>
          </button>
        </div>

        <div className="rounded-lg shadow-lg p-4 sm:p-6 bg-(--card)">
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
                      className="border rounded-lg p-4 sm:p-5 transition-shadow hover:shadow-md border-(--border)"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <div className='flex gap-2 items-center'>
                            {queue.live ? <LiveDot /> : <PausedDot />}
                            <h3 className="text-lg font-semibold text-(--ring)">{queue.name}</h3>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2 text-sm text-(--muted-foreground)">
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
                        {queue.live ?
                          <button
                            onClick={() => setJoinQueue(queue)}
                            className="w-full sm:w-auto px-4 py-2 rounded-md transition-colors bg-(--primary) text-(--primary-foreground) cursor-pointer hover:opacity-90"
                          >
                            Join
                          </button> :
                          <span className="w-full sm:w-auto text-center px-4 py-2 rounded-md transition-colors bg-(--muted-foreground) text-(--primary-foreground) cursor-default">Paused</span>}
                      </div>
                      <Modal
                        open={joinQueue === queue}
                        setOpen={() => {
                          setJoinQueue(null);
                          setJoinQueueKey("");
                        }}
                        comp={
                          <div>
                            <X
                              className='text-(--foreground) cursor-pointer hover:text-(--foreground)/80 rounded-lg mb-3'
                              onClick={() => {
                                setJoinQueue(null);
                                setJoinQueueKey("");
                              }}
                            />
                            <h2 className="mb-6 text-2xl font-semibold">
                              Enter Queue key for {queue.name}
                            </h2>
                            <form onSubmit={(e) => {
                              e.preventDefault();
                              if (joinQueueKey != queue.q_key) {
                                return toast.error("Queue key does not match");
                              }
                              setJoinQueue(null);
                              toast.promise(
                                handleJoinQueue(queue.id),
                                {
                                  loading: "Joining...",
                                  success: () => `Joined ${queue.name} at position ${queue.population + 1}`,
                                  error: err => err.message,
                                }
                              )
                              setJoinQueueKey("");
                            }} className='flex flex-col items-center justify-center'>
                              <div className='w-full max-w-sm flex flex-col gap-6'>
                                <div className="grid gap-2">
                                  <label htmlFor="name">Queue key</label>
                                  <input
                                    id="name"
                                    type="text"
                                    placeholder="Enter queue key here"
                                    required
                                    value={joinQueueKey}
                                    autoComplete='off'
                                    onChange={(e) => setJoinQueueKey(e.target.value)}
                                    className="p-1 -my-1 border-2 border-(--muted-foreground)/40 px-3 rounded focus:border-(--ring) focus:border-2 w-full"
                                  />
                                </div>
                                <button type="submit" className={`px-4 py-2 rounded-md bg-(--foreground) text-(--background) font-bold text-md hover:opacity-80 transition w-full ${isJoining ? "cursor-not-allowed" : "cursor-pointer"}`} disabled={isJoining}>
                                  {isJoining ? "Joining..." : "Join"}
                                </button>
                              </div>
                            </form>
                          </div>
                        }
                      />
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
                      className="border border-(--border) rounded-lg p-4 sm:p-5 transition-shadow hover:shadow-md">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className='flex gap-2 items-center'>
                            {qm.queues.live ? <LiveDot /> : <PausedDot />}
                            <h3 className="text-lg font-semibold text-(--ring)">
                              {qm.queues.name}
                            </h3>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-(--muted-foreground)">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {qm.distance?.toFixed(2)} km away
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4 self-start sm:self-center" />
                              Joined {formatDateTime(new Date(qm.joined_at))}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full lg:w-auto justify-start">
                          <div className="hidden sm:flex flex-wrap items-center gap-3 sm:gap-4">
                            {qm.position > 1 &&
                              <button
                                className='cursor-pointer border border-(--border) hover:bg-(--muted-foreground)/10 p-2 rounded-full transition'
                                onClick={() => {
                                  setNotifyFor(qm.id);
                                  setNotifyRank(qm.notify_rank || 1)
                                }}>
                                <BellPlus />
                              </button>
                            }
                            <Link
                              href={`https://www.google.com/maps/dir/?api=1&destination=${qm.queues.latitude},${qm.queues.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className='text-(--ring) cursor-pointer border border-(--border) hover:bg-(--muted-foreground)/10 p-2 rounded-full transition'>
                              <MapPinned />
                            </Link>
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
                              className="py-2 px-4 rounded-md font-medium transition-colors focus:ring-2 bg-(--destructive) text-(--destructive-foreground) cursor-pointer shadow-md hover:opacity-90"
                            >
                              Quit
                            </button>
                          </div>

                          <div className="sm:hidden flex justify-between w-full px-2">
                            <div className='flex flex-col'>
                              <div className="text-2xl font-bold text-(--foreground)">
                                #{qm.position}
                              </div>
                              <div className="text-xs text-(--muted-foreground)">
                                Your Position
                              </div>
                            </div>
                            <div className="text-left sm:text-right sm:ml-auto">
                              <Dropdown
                                trigger={<button className="list-none p-2 rounded-full border border-(--border) bg-(--muted)/40 text-sm font-medium cursor-pointer select-none">
                                  <MoreVertical />
                                </button>}
                                items={[
                                  qm.position > 1 && {
                                    label: <div className="flex items-center gap-2">
                                      <BellPlus className="size-4" />
                                      Notify
                                    </div>,
                                    onClick: () => {
                                      setNotifyFor(qm.id);
                                      setNotifyRank(qm.notify_rank || 1)
                                    }
                                  }, {
                                    label: <Link
                                      href={`https://www.google.com/maps/dir/?api=1&destination=${qm.queues.latitude},${qm.queues.longitude}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-2"
                                    >
                                      <MapPinned className="size-4" />
                                      Directions
                                    </Link>
                                  },
                                  {
                                    label:
                                      <div
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
                                        className="flex items-center gap-2 text-(--destructive)"
                                      >
                                        <LogOut className='size-4'/>
                                        Quit
                                      </div>
                                  }
                                ]}
                                styles={'bottom-10'} />
                            </div>
                          </div>

                          <Modal
                            open={notifyFor === qm.id}
                            setOpen={() => setNotifyFor(null)}
                            comp={
                              <div className="p-5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setJoinQueue(null);
                                    setJoinQueueKey("");
                                  }}
                                  className="absolute top-3 right-3 p-1 rounded-md hover:bg-(--muted) transition"
                                >
                                  <X className="w-4 h-4 text-(--muted-foreground)" />
                                </button>

                                <h3 className="text-base font-semibold mb-4">
                                  Notify Before Turn
                                </h3>

                                <form
                                  className="flex flex-col gap-4"
                                  onSubmit={(e) => {
                                    e.preventDefault();
                                    toast.promise(
                                      handleSetNotify(qm.id),
                                      {
                                        loading: "Setting...",
                                        success: () =>
                                          `Notification at rank ${notifyRank} for ${qm.queues.name}`,
                                        error: "Error",
                                      }
                                    );
                                  }}
                                >

                                  <label className="text-sm text-(--muted-foreground)">
                                    Alert before rank:
                                    <span className="ml-2 font-semibold text-(--foreground)">
                                      {notifyRank}
                                    </span>
                                  </label>

                                  <div className="flex flex-col items-center gap-2">
                                    <input
                                      type="range"
                                      min={1}
                                      max={qm.position - 1}
                                      step={1}
                                      value={notifyRank}
                                      onChange={(e) => setNotifyRank(Number(e.target.value))}
                                      className="slider w-full"
                                    />

                                    <div className="flex justify-between w-full text-xs text-(--muted-foreground)">
                                      <span>1</span>
                                      <span>{qm.position - 1}</span>
                                    </div>
                                  </div>

                                  <button
                                    type="submit"
                                    disabled={isSettingNotify}
                                    className={`w-full py-2 rounded-lg text-sm font-medium transition ${isSettingNotify ? "bg-(--muted) text-(--muted-foreground) cursor-not-allowed" : "bg-indigo-500 hover:bg-indigo-600 text-white shadow"}`}
                                  >
                                    {isSettingNotify ? "Setting..." : "Set Alert"}
                                  </button>

                                </form>
                              </div>
                            }
                          />

                          <div className="text-left sm:text-right sm:ml-auto not-sm:hidden">
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

              <form onSubmit={(e) => {
                e.preventDefault(),
                  toast.promise(
                    handleJoinQueue(),
                    {
                      loading: "Joining...",
                      success: (res) => `Joined ${res || "queue"}`,
                      error: (err) => err.message,
                    }
                  )
              }} className="flex flex-col items-center">
                <div className='max-w-md w-full'>
                  <label htmlFor='qKey' className="block text-sm font-medium mb-2 text-(--foreground)">
                    Queue key
                  </label>

                  <input
                    id='qKey'
                    type="text"
                    value={joinQueueKey}
                    onChange={(e) => setJoinQueueKey(e.target.value)}
                    placeholder="Enter queue key"
                    className="w-full px-4 py-2 rounded-md bg-(--background) text-(--foreground) border border-(--input) focus:ring-2 focus:ring-(--ring)" />

                  <button
                    type='submit'
                    className="mt-4 w-full py-2 px-4 rounded-md font-medium transition-colors bg-(--primary) text-(--primary-foreground) hover:opacity-90 cursor-pointer">
                    Join Queue
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
