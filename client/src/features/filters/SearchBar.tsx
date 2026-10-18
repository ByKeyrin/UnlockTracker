import { useMemo, useRef, useState } from 'react';
import type { UnlockGame } from '../../types';

/** Clé du localStorage utilisée pour persister l'historique des recherches. */
const HISTORY_STORAGE_KEY = 'sweatbook_search_history';

/** Nombre maximal de recherches conservées dans l'historique. */
const HISTORY_MAX = 8;

/** Nombre maximal de suggestions affichées. */
const SUGGESTIONS_MAX = 6;

/**
 * Props du composant {@link SearchBar}.
 */
export interface SearchBarProps {
  /** Recherche textuelle courante (contrôlée). */
  value: string;
  /** Callback déclenché à chaque frappe (recherche instantanée). */
  onChange: (recherche: string) => void;
  /** Collection utilisée pour proposer les suggestions. */
  games?: UnlockGame[];
  /** Texte d'aide affiché quand l'input est vide. */
  placeholder?: string;
}

/**
 * Barre de recherche instantanée avec suggestions (autocomplete sur les noms
 * et thèmes des jeux) et historique des recherches persisté dans le
 * localStorage.
 *
 * @param props - Props du composant
 * @example
 * <SearchBar value={recherche} onChange={setRecherche} games={allGames} />
 */
export function SearchBar({
  value,
  onChange,
  games = [],
  placeholder = 'Nom ou thème…',
}: SearchBarProps) {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<string[]>(() => loadHistory());
  const inputRef = useRef<HTMLInputElement>(null);

  // Suggestions : noms et thèmes des jeux correspondant à la saisie.
  const suggestions = useMemo(() => {
    const query = normaliser(value.trim());
    if (query === '') return [];
    const candidats = new Set<string>();
    for (const game of games) {
      if (normaliser(game.nom).includes(query)) candidats.add(game.nom);
      if (normaliser(game.theme).includes(query)) candidats.add(game.theme);
      if (candidats.size >= SUGGESTIONS_MAX) break;
    }
    return [...candidats].slice(0, SUGGESTIONS_MAX);
  }, [games, value]);

  const showHistory = open && value.trim() === '' && history.length > 0;
  const showSuggestions = open && value.trim() !== '' && suggestions.length > 0;

  /** Valide une recherche : met à jour l'input, l'historique et ferme la liste. */
  const commitSearch = (terme: string) => {
    const nettoye = terme.trim();
    onChange(nettoye);
    if (nettoye !== '') {
      const next = [nettoye, ...history.filter((h) => h !== nettoye)].slice(
        0,
        HISTORY_MAX,
      );
      setHistory(next);
      saveHistory(next);
    }
    setOpen(false);
    inputRef.current?.blur();
  };

  /** Supprime une entrée de l'historique. */
  const removeHistoryItem = (terme: string) => {
    const next = history.filter((h) => h !== terme);
    setHistory(next);
    saveHistory(next);
  };

  /** Vide entièrement l'historique des recherches. */
  const clearHistory = () => {
    setHistory([]);
    saveHistory([]);
  };

  return (
    <div
      className="relative"
      onBlur={(event) => {
        // Ferme la liste uniquement si le focus quitte vraiment le composant.
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
        }
      }}
    >
      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-300">
        Rechercher
        <div className="relative">
          <input
            ref={inputRef}
            type="search"
            role="combobox"
            aria-expanded={showHistory || showSuggestions}
            aria-controls="searchbar-listbox"
            aria-autocomplete="list"
            value={value}
            onChange={(event) => {
              onChange(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                const terme = (showSuggestions ? suggestions[0] : value) ?? '';
                commitSearch(terme);
              } else if (event.key === 'Escape') {
                setOpen(false);
              }
            }}
            placeholder={placeholder}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-9 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-indigo-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
          {value !== '' && (
            <button
              type="button"
              aria-label="Effacer la recherche"
              onClick={() => {
                onChange('');
                inputRef.current?.focus();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-1.5 py-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
            >
              ✕
            </button>
          )}
        </div>
      </label>

      {/* Liste déroulante : suggestions ou historique */}
      {showSuggestions && (
        <ul
          id="searchbar-listbox"
          role="listbox"
          aria-label="Suggestions de recherche"
          className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800"
        >
          {suggestions.map((suggestion) => (
            <li key={suggestion} role="option" aria-selected="false">
              <button
                type="button"
                onClick={() => commitSearch(suggestion)}
                className="block w-full px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-indigo-50 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                🔍 {suggestion}
              </button>
            </li>
          ))}
        </ul>
      )}

      {showHistory && (
        <div
          id="searchbar-listbox"
          className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800"
        >
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Recherches récentes
            </span>
            <button
              type="button"
              onClick={clearHistory}
              className="text-xs text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Tout effacer
            </button>
          </div>
          <ul aria-label="Historique des recherches">
            {history.map((terme) => (
              <li
                key={terme}
                className="flex items-center justify-between gap-2 px-3 py-1.5"
              >
                <button
                  type="button"
                  onClick={() => commitSearch(terme)}
                  className="flex-1 text-left text-sm text-slate-700 transition-colors hover:bg-indigo-50 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  🕘 {terme}
                </button>
                <button
                  type="button"
                  aria-label={`Supprimer « ${terme} » de l'historique`}
                  onClick={() => removeHistoryItem(terme)}
                  className="rounded-full px-1.5 py-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Lit l'historique des recherches depuis le localStorage.
 *
 * @returns La liste des recherches récentes (plus récente en premier)
 */
function loadHistory(): string[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (raw === null) return [];
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === 'string');
    }
    return [];
  } catch {
    // localStorage indisponible ou JSON corrompu : historique vide.
    return [];
  }
}

/**
 * Écrit l'historique des recherches dans le localStorage.
 *
 * @param history - Liste des recherches récentes à persister
 */
function saveHistory(history: string[]): void {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch {
    // localStorage indisponible : on ignore silencieusement la persistance.
  }
}

/**
 * Normalise un texte pour une comparaison insensible à la casse et aux accents.
 *
 * @param texte - Texte à normaliser
 * @returns Le texte en minuscules sans accents
 */
function normaliser(texte: string): string {
  return texte
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

export default SearchBar;
