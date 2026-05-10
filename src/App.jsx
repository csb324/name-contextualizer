import { useState, useEffect, useMemo } from 'react'
import SearchForm from './components/SearchForm'
import Results from './components/Results'
import ErrorBoundary from './components/ErrorBoundary'
import { buildByYear } from './utils/nameData'

function queryFromURL() {
  const p = new URLSearchParams(window.location.search)
  const name = p.get('name')
  const ref = p.get('ref')
  const compare = p.get('compare')
  if (name && ref && compare) {
    return { name, refYear: parseInt(ref, 10), compareYear: parseInt(compare, 10) }
  }
  return null
}

export default function App() {
  const [girlsData, setGirlsData] = useState(null)
  const [boysData, setBoysData] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [query, setQuery] = useState(() => queryFromURL())

  useEffect(() => {
    Promise.all([
      fetch('/data/girls.json').then(r => r.json()),
      fetch('/data/boys.json').then(r => r.json()),
    ])
      .then(([girls, boys]) => {
        setGirlsData(girls)
        setBoysData(boys)
      })
      .catch(() =>
        setLoadError('Could not load name data. Run npm run process-data first.')
      )
  }, [])

  useEffect(() => {
    function onPop() {
      setQuery(queryFromURL())
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  function navigate(q) {
    const p = new URLSearchParams({ name: q.name, ref: q.refYear, compare: q.compareYear })
    window.history.pushState(null, '', `?${p}`)
    setQuery(q)
  }

  function handleNameClick(name) {
    if (!query) return
    navigate({ name, refYear: query.compareYear, compareYear: query.refYear })
  }

  const byYearGirls = useMemo(() => buildByYear(girlsData?.data), [girlsData])
  const byYearBoys = useMemo(() => buildByYear(boysData?.data), [boysData])

  const years = girlsData?.years || []
  const loading = !girlsData && !loadError

  return (
    <div className="app">
      <header className="app-header">
        <h1>Baby Name Contextualizer</h1>
      </header>

      <main>
        {loading && <p className="status">Loading name data…</p>}
        {loadError && <p className="status error">{loadError}</p>}
        {!loading && !loadError && (
          <>
            <SearchForm years={years} onSearch={navigate} initialQuery={query} />
                        
            {query && (
              <ErrorBoundary resetKey={`${query.name}-${query.refYear}-${query.compareYear}`}>
                <Results
                  key={`${query.name}-${query.refYear}-${query.compareYear}`}
                  query={query}
                  girlsData={girlsData}
                  boysData={boysData}
                  byYearGirls={byYearGirls}
                  byYearBoys={byYearBoys}
                  onNameClick={handleNameClick}
                />
              </ErrorBoundary>
            )}


            <div className="intro">
              <p className="intro-lead">What does a baby name really mean?</p>
              <p>
                Rank alone doesn't tell you. The name landscape has fragmented over the decades. Any given name accounts for a smaller share of babies 
                than the same rank would have meant in earlier years.                  
              </p>
              <p>
                In 1990, approximately 2.45% of baby girls were named Jessica. It was the #1 name. This year, the #1 name 
                for baby girls is Olivia, but only 0.84% of girls born last year were given that name. Olivia may be "Most Popular",
                but it only feels as popular as a 1990 Amber, Rachel, or Courtney.
              </p>
              <p>
                Enter the name you're considering, the year to look it up in, and a year to compare against — usually the year you were born. You'll see which names from that year carried the same weight, which names had a similar rise or fall, and where the name might be headed.
              </p>
            </div>

          </>
        )}
      </main>

      <footer>
        <p>
          Made with love by Clara Beyer Bower.
        </p>
        <p>
          Data:{' '}
          <a
            href="https://www.ssa.gov/oact/babynames/"
            target="_blank"
            rel="noreferrer"
          >
            U.S. Social Security Administration
          </a>
        </p>
      </footer>
    </div>
  )
}
