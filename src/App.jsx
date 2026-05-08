import { useState, useEffect, useMemo } from 'react'
import SearchForm from './components/SearchForm'
import Results from './components/Results'
import ReverseResults from './components/ReverseResults'
import { buildByYear } from './utils/nameData'

export default function App() {
  const [girlsData, setGirlsData] = useState(null)
  const [boysData, setBoysData] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [mode, setMode] = useState('forward')
  const [query, setQuery] = useState(null)

  function switchMode(newMode) {
    setMode(newMode)
    setQuery(null)
  }

  function handleNameClick(name, birthYear, targetMode) {
    setMode(targetMode)
    setQuery({ name, birthYear })
  }

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

  return (
    <div className="app">
      <header className="app-header">
        <h1>Name Contextualizer</h1>
      </header>

      <nav className="tab-bar">
        <button
          className={`tab-btn ${mode === 'forward' ? 'active' : ''}`}
          onClick={() => switchMode('forward')}
        >
          Baby name → your era
          <span className="tab-desc">What would this name have been called when you were born?</span>
        </button>
        <button
          className={`tab-btn ${mode === 'reverse' ? 'active' : ''}`}
          onClick={() => switchMode('reverse')}
        >
          Your name → today
          <span className="tab-desc">What baby names today are as popular as your name was?</span>
        </button>
      </nav>

      <main>
        {loading && <p className="status">Loading name data…</p>}
        {loadError && <p className="status error">{loadError}</p>}
        {!loading && !loadError && (
          <>
            <SearchForm
              years={years}
              onSearch={setQuery}
              namePlaceholder={mode === 'forward' ? 'e.g. Lucy' : 'e.g. Andrew'}
              nameLabel={mode === 'forward' ? 'Baby name' : 'Your name'}
            />
            {query && mode === 'forward' && (
              <Results
                key={`fwd-${query.name}-${query.birthYear}`}
                query={query}
                girlsData={girlsData}
                boysData={boysData}
                byYearGirls={byYearGirls}
                byYearBoys={byYearBoys}
                onNameClick={(name, birthYear) => handleNameClick(name, birthYear, 'reverse')}
              />
            )}
            {query && mode === 'reverse' && (
              <ReverseResults
                key={`rev-${query.name}-${query.birthYear}`}
                query={query}
                girlsData={girlsData}
                boysData={boysData}
                byYearGirls={byYearGirls}
                byYearBoys={byYearBoys}
                onNameClick={(name, birthYear) => handleNameClick(name, birthYear, 'forward')}
              />
            )}
          </>
        )}
      </main>

      <footer>
        <p>Made with love by Clara Beyer Bower.</p>
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
