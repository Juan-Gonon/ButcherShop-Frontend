import { useCallback, useEffect, useState } from 'react'
import { searchClients } from '../services/clientSearchService'
import type { ClientSearchResult } from '../types/clientSearch'

type ClientSearchStatus =
  | 'idle'
  | 'waiting'
  | 'loading'
  | 'error'
  | 'empty'
  | 'success'

const DEBOUNCE_DELAY_MS = 350

export const useClientSearch = () => {
  const [query, setQueryState] = useState('')
  const [searchVersion, setSearchVersion] = useState(0)
  const [retryCount, setRetryCount] = useState(0)
  const [queryResult, setQueryResult] = useState<{
    query: string
    version: number
    request: number
    clients: ClientSearchResult[]
    status: Exclude<ClientSearchStatus, 'waiting'>
    error: string | null
  } | null>(null)

  const normalizedQuery = query.trim()

  useEffect(() => {
    if (!normalizedQuery) {
      return
    }

    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => {
      setQueryResult({
        query: normalizedQuery,
        version: searchVersion,
        request: retryCount,
        clients: [],
        status: 'loading',
        error: null
      })

      searchClients(normalizedQuery, controller.signal)
        .then((clients) => {
          if (controller.signal.aborted) return

          setQueryResult({
            query: normalizedQuery,
            version: searchVersion,
            request: retryCount,
            clients,
            status: clients.length === 0 ? 'empty' : 'success',
            error: null
          })
        })
        .catch(() => {
          if (controller.signal.aborted) return

          setQueryResult({
            query: normalizedQuery,
            version: searchVersion,
            request: retryCount,
            clients: [],
            status: 'error',
            error: 'No se pudieron buscar clientes. Intenta de nuevo.'
          })
        })
    }, DEBOUNCE_DELAY_MS)

    return () => {
      window.clearTimeout(timeoutId)
      controller.abort()
    }
  }, [normalizedQuery, retryCount, searchVersion])

  const currentResult =
    queryResult?.query === normalizedQuery &&
    queryResult.version === searchVersion &&
    queryResult.request === retryCount
      ? queryResult
      : null
  const status: ClientSearchStatus =
    currentResult?.status ?? (normalizedQuery ? 'waiting' : 'idle')

  const retry = useCallback(() => {
    setRetryCount((count) => count + 1)
  }, [])

  const setQuery = useCallback((nextQuery: string) => {
    setQueryState(nextQuery)
    setSearchVersion((version) => version + 1)
  }, [])

  return {
    query,
    setQuery,
    normalizedQuery,
    clients: currentResult?.clients ?? [],
    status,
    loading: currentResult?.status === 'loading',
    error: currentResult?.error ?? null,
    retry
  }
}
