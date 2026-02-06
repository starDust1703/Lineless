"use client";
import { createClient } from "../../../../lib/supabase/client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Queue() {
  const { qKey } = useParams();
  const supabase = createClient();
  const [user, setUser] = useState(null);
  const router = useRouter();
  const [queue, setQueue] = useState(null);
  const [queueMems, setQueueMems] = useState([]);
  const [loading, setloading] = useState(true);
  const [location, setLocation] = useState("Unknown Location");

  const getLocName = async (lat, lon) => {
    const res = await fetch(`/api/geoloc?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`);
    const data = await res.json();
    if (!data || data.length === 0) {
      throw new Error("Unknown Location");
    }

    setLocation(data?.name || data?.display_name);

    return data;
  };

  const getQueue = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    const { data } = await supabase
      .from('queues')
      .select('*')
      .eq('created_by', user.id)
      .eq('q_key', qKey)
      .single();
    if (!data) {
      setloading(false);
      router.replace('/not-found');
      return;
    }
    setQueue(data);

    fetchQueueMembers(data);
    if (data.loc_name) setLocation(data.loc_name);
    else getLocName(data.latitude, data.longitude);
  }

  useEffect(() => {
    getQueue();
  }, [])

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
          getQueue();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchQueueMembers = async (Queue) => {
    if (!Queue) return;
    const { data } = await supabase
      .from('queue_members')
      .select('*')
      .eq('queue_id', Queue.id)
      .order('position', { ascending: true });

    const qMems = data.map(qm => ({
      ...qm,
      userName: getName(qm.user_id)
    }))
    setQueueMems(qMems);
  }

  const getName = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', userId)
      .single();

    return data.name;
  }

  const callNext = async () => {
    if (!queueMems.length) return;
    const { data, error } = await supabase.rpc('call_next', {
      p_queue_member_id: queueMems[0].id,
    });

    if (error) throw error;

    console.log('Called next:', data);
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

  const toggleStatus = async () => {
    if (!queue) return;
    const nextLive = !queue.live;
    const { error } = await supabase
      .from('queues')
      .update({ live: nextLive })
      .eq('id', queue.id);
    if (error) throw error;
    setQueue((prev) => (prev ? { ...prev, live: nextLive } : prev));
  }

  if (loading && !queue) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto border-(--muted-foreground)"></div>
          <p className="mt-4 text-(--muted-foreground)">Loading queue...</p>
        </div>
      </div>
    );
  }

  return queue ? (
    <div className="min-h-[90vh]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl text-(--foreground) font-bold mb-2 sm:text-4xl">LineLess Queue</h1>
          <p className="text-(--muted-foreground) text-sm sm:text-[16px]">Manage your queues digitally</p>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-(--ring) text-2xl font-bold">{queue.name}</h3>
            <p>Population: {queue.population}</p>
            <p>
              Venue: {Math.f16round(queue.latitude)}, {Math.f16round(queue.longitude)}
              {' '}(<span className="truncate inline-block max-w-40 align-bottom">{location}</span>)
            </p>

          </div>

          <div className="flex gap-2">
            <button className="p-2 cursor-pointer hover:bg-(--muted)/70 rounded-lg" onClick={() => toggleStatus()}>
              {queue.live ? "Pause" : "Resume"}
            </button>

            {queueMems.length ?
              <button className="p-2 cursor-pointer hover:bg-(--muted)/70 rounded-lg" onClick={() => callNext()}>Next</button>
              : null
            }
          </div>
        </div>
        {queueMems.length ?
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-(--foreground) mb-3">
              Queue Members
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {queueMems.map((qm, index) => (
                <div
                  key={qm.id}
                  className="rounded-lg border border-(--border) bg-(--card) p-4 flex flex-col gap-1"
                >
                  <div className="text-sm text-(--muted-foreground)">
                    Position #{index + 1}
                  </div>

                  <div className="text-sm font-mono text-(--foreground) truncate">
                    {qm.userName}
                  </div>

                  <div className="text-xs text-(--muted-foreground)">
                    Joined at {formatDateTime(new Date(qm.joined_at))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          : null}

      </div>
    </div>
  ) : null;
}
