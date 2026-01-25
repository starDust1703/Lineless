"use client";
import { redirect } from "next/dist/server/api-utils";
import { createClient } from "../../../lib/supabase/client";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [nearbyQueues, setNearbyQueues] = useState([])
  const [myQueues, setMyQueues] = useState([])
  const [qid, setQid] = useState('')
  const [queueName, setQueueName] = useState('')
  const [adminKey, setAdminKey] = useState('')
  const [user, setUser] = useState(null)

  /* ----------- QUEUES NEAR ME ----------- */
  useEffect(() => {
    if (!user) return

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords

      // naive approach: fetch all, sort by population
      const { data } = await supabase
        .from('queues')
        .select('*')
        .order('population', { ascending: false })

      setNearbyQueues(data || [])
    })
  }, [user])

  /* ----------- MY QUEUES ----------- */
  useEffect(() => {
    if (!user) return

    const fetchMyQueues = async () => {
      const { data } = await supabase
        .from('queue_members')
        .select('position, queues(id, name)')
        .eq('user_id', user.id)
        .order('position', { ascending: true })

      setMyQueues(data || [])
    }

    fetchMyQueues()
  }, [user])

  /* ----------- JOIN QUEUE ----------- */
  const joinQueue = async () => {
    if (!qid) return

    const { error } = await supabase.rpc('join_queue', {
      q_id: qid
    })

    if (error) alert(error.message)
    else alert('Joined queue')
  }

    /* ----------- CREATE QUEUE ----------- */
  const createQueue = async () => {
    if (!queueName || !adminKey) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('admin_key, is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin || profile.admin_key !== adminKey) {
      alert('Invalid admin key')
      return
    }

    const { error } = await supabase.from('queues').insert({
      name: queueName,
      created_by: user.id,
      population: 0
    })

    if (error) alert(error.message)
    else alert('Queue created')
  }

  /* ------------------ UI ------------------ */
  return (
    <div className="min-h-[80vh] p-6 space-y-10">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Queues Near Me */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Queues Near Me</h2>
        <ul className="space-y-2">
          {nearbyQueues.map(q => (
            <li key={q.id} className="border p-2 rounded">
              {q.name} — {q.population} people
            </li>
          ))}
        </ul>
      </section>

      {/* Join Queue */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Join a Queue</h2>
        <input
          className="border p-2 mr-2"
          placeholder="Queue ID"
          value={qid}
          onChange={e => setQid(e.target.value)}
        />
        <button className="border px-4 py-2" onClick={joinQueue}>
          Join
        </button>
      </section>

      {/* Create Queue */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Create Queue (Admin)</h2>
        <input
          className="border p-2 mr-2"
          placeholder="Queue name"
          value={queueName}
          onChange={e => setQueueName(e.target.value)}
        />
        <input
          className="border p-2 mr-2"
          placeholder="Admin key"
          value={adminKey}
          onChange={e => setAdminKey(e.target.value)}
        />
        <button className="border px-4 py-2" onClick={createQueue}>
          Create
        </button>
      </section>

      {/* My Queues */}
      <section>
        <h2 className="text-xl font-semibold mb-2">My Queues</h2>
        <ul className="space-y-2">
          {myQueues.map((q, i) => (
            <li key={i} className="border p-2 rounded">
              {q.queues.name} — Position #{q.position}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
