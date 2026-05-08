import { useState } from 'react'

export default function SearchForm({ years, onSearch, nameLabel = 'Baby name', namePlaceholder = 'e.g. Lucy' }) {
  const [name, setName] = useState('')
  const [birthYear, setBirthYear] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (name.trim() && birthYear) {
      onSearch({ name: name.trim(), birthYear: parseInt(birthYear, 10) })
    }
  }

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <div className="search-fields">
        <div className="field">
          <label htmlFor="name-input">{nameLabel}</label>
          <input
            id="name-input"
            type="text"
            placeholder={namePlaceholder}
            value={name}
            onChange={e => setName(e.target.value)}
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
          />
        </div>
        <div className="field">
          <label htmlFor="year-select">Your birth year</label>
          <select
            id="year-select"
            value={birthYear}
            onChange={e => setBirthYear(e.target.value)}
          >
            <option value="">Select year</option>
            {[...years].reverse().map(y => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={!name.trim() || !birthYear}>
          Find
        </button>
      </div>
    </form>
  )
}
