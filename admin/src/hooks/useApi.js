import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

export function useApi(url, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const res = await axios.get(url)
      setData(res.data)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }, [url])

  useEffect(() => { fetch() }, [fetch, ...deps])

  return { data, loading, error, refetch: fetch, setData }
}
