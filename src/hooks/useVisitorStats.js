import { useEffect, useState } from 'react'
import { fetchVisitorStats } from '/src/lib/supabase.js'

export function useVisitorStats() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchVisitorStats().then(data => {
            setStats(data)
            setLoading(false)
        })
    }, [])

    return { stats, loading }
}
