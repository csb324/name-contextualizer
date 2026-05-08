import { useState, useEffect, useMemo } from 'react'
import SearchForm from './components/SearchForm'
import Results from './components/Results'
import { buildByYear } from './utils/nameData'

export default function App() {
  const [girlsData, setGirlsData] = useState(null)
  const [boysData, setBoysData] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [query, setQuery] = useState(null)

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

  const byYearGirls = useMemo(() => buildByYear(girlsData?.data), [girlsData])
  const byYearBoys = useMemo(() => buildByYear(boysData?.data), [boysData])

  const years = girlsData?.years || []
  const loading = !girlsData && !loadError

  function handleNameClick(name) {
    if (!query) return
    setQuery({ name, refYear: query.compareYear, compareYear: query.refYear })
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Name Contextualizer</h1>
      </header>

      <main>
        {loading && <p className="status">Loading name data…</p>}
        {loadError && <p className="status error">{loadError}</p>}
        {!loading && !loadError && (
          <>
            <SearchForm years={years} onSearch={setQuery} />
            {query && (
              <Results
                key={`${query.name}-${query.refYear}-${query.compareYear}`}
                query={query}
                girlsData={girlsData}
                boysData={boysData}
                byYearGirls={byYearGirls}
                byYearBoys={byYearBoys}
                onNameClick={handleNameClick}
              />
            )}
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
