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
    <div className="min-h-[90vh] bg-(--background)">
      <div className="max-w-7xl mx-auto px-4 py-8">

        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-(--foreground)">
            LineLess Queue
          </h1>
          <p className="text-(--muted-foreground) text-sm sm:text-base">
            Manage your queues digitally
          </p>
        </div>

        <div className="rounded-2xl border border-(--border) bg-(--card) p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-bold text-(--foreground)">
                  {queue.name}
                </h3>

                <span
                  className={`text-xs px-2 py-1 rounded-md font-medium
              ${queue.live
                      ? "bg-green-500/15 text-green-500"
                      : "bg-yellow-500/15 text-yellow-500"}`}
                >
                  {queue.live ? "LIVE" : "PAUSED"}
                </span>
              </div>

              <p className="text-sm text-(--muted-foreground)">
                Population: <span className="text-(--foreground) font-medium">{queue.population}</span>
              </p>

              <p className="text-sm text-(--muted-foreground)">
                Venue:
                <span className="truncate inline-block max-w-44 align-bottom ml-1 text-(--foreground)">
                  {location}
                </span>
                {" "}({Math.f16round(queue.latitude)}, {Math.f16round(queue.longitude)})
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={toggleStatus}
                className="px-4 py-2 rounded-lg text-sm font-medium
              bg-(--muted) hover:bg-(--muted)/70
              transition active:scale-[0.97]"
              >
                {queue.live ? "Pause" : "Resume"}
              </button>

              {queueMems.length > 0 && (
                <button
                  onClick={callNext}
                  className="px-4 py-2 rounded-lg text-sm font-medium
                bg-(--ring) text-white
                hover:opacity-90 transition active:scale-[0.97]"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold text-(--foreground) mb-3">
            Queue Members
          </h2>

          {queueMems.length === 0 ? (
            <div className="rounded-xl border border-dashed border-(--border) p-8 text-center text-(--muted-foreground)">
              No one in queue. Peaceful. Suspiciously peaceful.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">

              {queueMems.map((qm, index) => (
                <div
                  key={qm.id}
                  className="rounded-xl border border-(--border)
                bg-(--card) p-4 flex flex-col gap-1
                hover:shadow-md hover:border-(--ring)/40
                transition"
                >
                  <div className="text-xs text-(--muted-foreground)">
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
          )}
        </div>

      </div>
    </div>

  ) : null;
};
