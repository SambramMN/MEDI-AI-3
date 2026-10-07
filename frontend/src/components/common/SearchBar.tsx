import React, { useState, useEffect } from "react"
import { Search, X, Loader2 } from "lucide-react"

interface SearchBarProps {
  value?: string
  onChange?: (val: string) => void
  onSearch?: (query: string) => void
  placeholder?: string
  isLoading?: boolean
  className?: string
  debounceMs?: number
  autoFocus?: boolean
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value: controlledValue,
  onChange,
  onSearch,
  placeholder = "Search by brand name (e.g. Lipitor), generic name (e.g. Atorvastatin), or active ingredient...",
  isLoading = false,
  className = "",
  debounceMs = 350,
  autoFocus = false,
}) => {
  const [query, setQuery] = useState(controlledValue || "")

  useEffect(() => {
    if (controlledValue !== undefined) {
      setQuery(controlledValue)
    }
  }, [controlledValue])

  useEffect(() => {
    if (!onSearch) return
    const timer = setTimeout(() => {
      onSearch(query.trim())
    }, debounceMs)
    return () => clearTimeout(timer)
  }, [query, debounceMs, onSearch])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    onChange?.(val)
  }

  const handleClear = () => {
    setQuery("")
    onChange?.("")
    onSearch?.("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      onSearch?.(query.trim())
    }
  }

  return (
    <div className={`relative w-full ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
        <Search className="w-4 h-4" />
      </div>

      <input
        type="text"
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition shadow-sm"
      />

      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
        {isLoading ? (
          <Loader2 className="w-4 h-4 text-teal-600 animate-spin" />
        ) : query ? (
          <button
            type="button"
            onClick={handleClear}
            className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}
      </div>
    </div>
  )
}

export default SearchBar
