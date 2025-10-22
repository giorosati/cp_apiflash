import { useState, useEffect } from 'react'
import './App.css'
import { fetchRandomDog } from './api'

function App() {
  const [dog, setDog] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [banList, setBanList] = useState({})
  const [history, setHistory] = useState([])

  async function handleFetch() {
    setLoading(true)
    setError(null)
    try {
      const maxAttempts = 8
      const res = await fetchRandomDog({ maxAttempts, banList })
      setDog(res)
      setHistory(prev => [res, ...prev].slice(0, 50))
    } catch (err) {
      const msg = err && err.message ? err.message : String(err)
      if (msg.toLowerCase().includes('no non-banned')) {
        setError(`No available result found after multiple attempts. Try removing some bans and try again.`)
      } else {
        setError(msg)
      }
      setDog(null)
    } finally {
      setLoading(false)
    }
  }

  // load ban list from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('banList')
      if (raw) setBanList(JSON.parse(raw))
    } catch (e) {
      // ignore parse errors
    }
  }, [])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('history')
      if (raw) setHistory(JSON.parse(raw))
    } catch (e) {}
  }, [])

  // persist ban list
  useEffect(() => {
    try {
      localStorage.setItem('banList', JSON.stringify(banList))
    } catch (e) {
      // ignore
    }
  }, [banList])

  useEffect(() => {
    try {
      localStorage.setItem('history', JSON.stringify(history))
    } catch (e) {}
  }, [history])

  function addBan(key, value) {
    if (!key || value == null) return
    const trimmed = String(value).trim()
    if (!trimmed) return
    setBanList(prev => {
      const arr = Array.isArray(prev[key]) ? prev[key] : []
      // avoid duplicates (case-insensitive)
      const exists = arr.some(v => String(v).trim().toLowerCase() === trimmed.toLowerCase())
      if (exists) return prev
      return { ...prev, [key]: [...arr, trimmed] }
    })
  }

  function removeBan(key, value) {
    setBanList(prev => {
      if (!prev[key]) return prev
      const arr = prev[key].filter(v => String(v).trim().toLowerCase() !== String(value).trim().toLowerCase())
      const copy = { ...prev }
      if (arr.length) copy[key] = arr
      else delete copy[key]
      return copy
    })
  }

  function loadFromHistory(item) {
    if (!item) return
    setDog(item)
  }

  return (
    <div className="app-container">
      <header>
        <h1>Man's Best Friend</h1>
      </header>

      <div className="fetch-wrapper">
        <button onClick={handleFetch} disabled={loading}>
          {loading ? 'Fetching…' : 'Fetch Dog'}
        </button>
      </div>

      <main>
        <aside className="history-column" aria-label="History">
          <h2 className="history-heading">Previously Viewed</h2>
          <div className="history-list">
            {history.length === 0 && <div className="history-empty">No history</div>}
            {history.map((h, i) => (
              <button key={h.id || i} className="history-item" onClick={() => loadFromHistory(h)}>
                <img src={h.imageUrl} alt={h.attributes.breed} />
                <div className="history-breed">{h.attributes.breed}</div>
              </button>
            ))}
          </div>
        </aside>

        <div className="content-area">
          {error && <div className="error">Error: {error}</div>}

          {dog && (
            <div className="result-card">
              <img src={dog.imageUrl} alt={dog.attributes.breed} />
              <ul>
                <li>
                  <strong>Breed:</strong>{' '}
                  {dog.attributes.breed ? (
                    <button className="attr-btn" onClick={() => addBan('breed', dog.attributes.breed)}>
                      {dog.attributes.breed}
                    </button>
                  ) : (
                    <span>—</span>
                  )}
                </li>
                <li>
                  <strong>Temperament:</strong>{' '}
                  {dog.attributes.temperament ? (
                    dog.attributes.temperament.split(',').map((t, i) => {
                      const v = t.trim()
                      return v ? (
                        <button key={i} className="attr-btn" onClick={() => addBan('temperament', v)}>
                          {v}
                        </button>
                      ) : null
                    })
                  ) : (
                    <span>—</span>
                  )}
                </li>
                <li>
                  <strong>Life span:</strong>{' '}
                  {dog.attributes.life_span ? (
                    <button className="attr-btn" onClick={() => addBan('life_span', dog.attributes.life_span)}>
                      {dog.attributes.life_span}
                    </button>
                  ) : (
                    <span>—</span>
                  )}
                </li>
                <li>
                  <strong>Weight:</strong>{' '}
                  {dog.attributes.weight ? (
                    <button className="attr-btn" onClick={() => addBan('weight', dog.attributes.weight)}>
                      {dog.attributes.weight}
                    </button>
                  ) : (
                    <span>—</span>
                  )}
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Ban list UI */}
        <aside className="ban-list">
          <h3>Ban list</h3>
          {Object.keys(banList).length === 0 && <div>No banned values</div>}
          {Object.entries(banList).map(([key, vals]) => (
            <div key={key} className="ban-group">
              <strong>{key}</strong>
              <div className="ban-values">
                {vals.map((v, i) => (
                  <button key={i} className="ban-item" onClick={() => removeBan(key, v)}>
                    {v} ×
                  </button>
                ))}
              </div>
            </div>
          ))}
        </aside>
      </main>

      <footer>
        <small>Copyright 2025 Giovanni Rosati</small>
      </footer>
    </div>
  )
}

export default App
