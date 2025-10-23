"use client"

import React from "react"
import { AnimatePresence, motion, type HTMLMotionProps } from "framer-motion"
import { Send } from "lucide-react"

import { cn } from "@/lib/utils"

export interface ExpandableButtonProps {
  /**
   * Controls whether the button is in its expanded state.
   * When true, shows both icon and text. When false, shows only the icon.
   */
  expanded?: boolean
  /**
   * Callback function called when the expanded state changes.
   * @param open - The new expanded state
   */
  onExpandedChange?: (open: boolean) => void
  /**
   * The icon to display in the button.
   * Shows in both collapsed and expanded states.
   */
  icon?: React.ReactNode
  /**
   * Callback for when search is submitted
   */
  onSearch?: (query: string) => void
}

export function ExpandableButton({
  expanded: expandedProp,
  onExpandedChange: setExpandedProp,
  icon,
  onSearch,
  className,
  onClick,
  children,
  ...props
}: HTMLMotionProps<"div"> & ExpandableButtonProps) {
  const [_expanded, _setExpanded] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")
  const [suggestions, setSuggestions] = React.useState<string[]>([])
  const [isLoadingSuggestions, setIsLoadingSuggestions] = React.useState(false)
  const [suggestionSelected, setSuggestionSelected] = React.useState(false)

  const expanded = expandedProp ?? _expanded

  const setExpanded = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const expandedState =
        typeof value === "function" ? value(expanded) : value

      if (setExpandedProp) {
        setExpandedProp(expandedState)
      } else {
        _setExpanded(expandedState)
      }
    },
    [setExpandedProp, expanded],
  )

  const inputRef = React.useRef<HTMLInputElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const onClickHandler = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!expanded) {
      setExpanded(true)
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
    onClick?.(e as any)
  }

  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  const handleSearch = () => {
    if (inputValue.trim()) {
      onSearch?.(inputValue)
      console.log("Searching for:", inputValue)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // Fetch suggestions from OpenAI
  const fetchSuggestions = React.useCallback(async (query: string) => {
    if (query.length < 1) {
      setSuggestions([])
      return
    }

    setIsLoadingSuggestions(true)
    
    try {
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      })

      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.suggestions || [])
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error)
      setSuggestions([])
    } finally {
      setIsLoadingSuggestions(false)
    }
  }, [])

  // Debounce suggestions
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue && expanded && !suggestionSelected) {
        fetchSuggestions(inputValue)
      } else {
        setSuggestions([])
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [inputValue, expanded, fetchSuggestions, suggestionSelected])

  // Handle click outside to collapse (with animation sequence)
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        // First, close suggestions with animation
        if (suggestions.length > 0) {
          setSuggestions([])
          // Wait for suggestions close animation to complete (200ms) before collapsing search bar
          setTimeout(() => {
            if (setExpandedProp) {
              setExpandedProp(false)
            } else {
              _setExpanded(false)
            }
            setInputValue("")
            setSuggestionSelected(false)
          }, 250) // Slightly longer than suggestion exit animation
        } else {
          // No suggestions open, close immediately
          if (setExpandedProp) {
            setExpandedProp(false)
          } else {
            _setExpanded(false)
          }
          setInputValue("")
          setSuggestionSelected(false)
        }
      }
    }

    if (expanded) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [expanded, setExpandedProp, _setExpanded, suggestions.length])
  
  return (
    <div ref={containerRef} className="relative">
      <motion.div
        onClick={onClickHandler}
        className={cn(
          "text-primary-foreground bg-primary relative flex h-10 items-center overflow-hidden rounded-xl text-lg font-medium cursor-pointer",
          className,
        )}
        style={{
          minWidth: "48px",
        }}
        initial={{ width: 48 }}
        animate={{
          width: expanded ? 350 : 48,
        }}
        transition={{
          type: "spring",
          stiffness: 170,
          damping: 20,
          mass: 1,
          bounce: 0.2,
        }}
        {...props}
      >
      <AnimatePresence mode="wait">
        {expanded ? (
          <motion.div
            key="active"
            className={cn("flex h-full w-full items-center px-3 gap-2")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            <motion.div
              className="flex-shrink-0"
              initial={{ scale: 1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
              {icon}
            </motion.div>
            <motion.input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value)
                setSuggestionSelected(false) // Allow suggestions again when user types
              }}
              onKeyPress={handleKeyPress}
              placeholder="Search personalities..."
              className="bg-transparent border-none outline-none text-primary-foreground placeholder:text-primary-foreground/60 flex-1 text-sm"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.05, ease: [0.4, 0, 0.2, 1] }}
              onClick={handleInputClick}
            />
            <motion.button
              type="button"
              className="flex-shrink-0 hover:opacity-80 transition-opacity"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
              onClick={(e) => {
                e.stopPropagation()
                handleSearch()
              }}
            >
              <Send size={18} />
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="inactive"
            className={cn("flex items-center justify-center w-full h-full")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            {icon}
          </motion.div>
        )}
      </AnimatePresence>
      </motion.div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {expanded && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-12 left-0 w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden z-50"
            style={{ width: "350px" }}
          >
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-800 dark:text-gray-200 text-sm border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                onClick={() => {
                  setInputValue(suggestion)
                  setSuggestionSelected(true) // Mark that a suggestion was selected
                  setSuggestions([]) // Close suggestions immediately
                  onSearch?.(suggestion)
                }}
              >
                {suggestion}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
