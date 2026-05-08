import { useState } from 'react'

export default function SearchForm({ years, onSearch }) {
  const latestYear = years.length ? Math.max(...years) : ''
  const [name, setName] = useState('')
  const [refYear, setRefYear] = useState(latestYear ? String(latestYear) : '')
  const [compareYear, setCompareYear] = useState('')

  function handleSwap() {
    setRefYear(compareYear)
    setCompareYear(refYear)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (name.trim() && refYear && compareYear) {
      onSearch({ name: name.trim(), refYear: parseInt(refYear, 10), compareYear: parseInt(compareYear, 10) })
    }
  }

  const canSubmit = name.trim() && refYear && compareYear

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <div className="search-fields">
        <div className="field">
          <label htmlFor="name-input">Baby name</label>
          <input
            id="name-input"
            type="text"
            placeholder="e.g. Grace"
            value={name}
            onChange={e => setName(e.target.value)}
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
          />
        </div>
        <div className="field">
          <label htmlFor="ref-year-select">Look up in</label>
          <select
            id="ref-year-select"
            value={refYear}
            onChange={e => setRefYear(e.target.value)}
          >
            <option value="">Select year</option>
            {[...years].reverse().map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <button type="button" className="swap-btn" onClick={handleSwap} aria-label="Swap years">
          ⇅
        </button>
        <div className="field">
          <label htmlFor="compare-year-select">Find comparables in</label>
          <select
            id="compare-year-select"
            value={compareYear}
            onChange={e => setCompareYear(e.target.value)}
          >
            <option value="">Select year</option>
            {[...years].reverse().map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={!canSubmit}>
          Find
        </button>
      </div>
    </form>
  )
}
