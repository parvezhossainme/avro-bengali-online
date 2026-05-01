'use client';

import { useEffect, useLayoutEffect, useReducer, useRef, useState } from 'react';

import avroPhonetic from 'nodejs-avro-phonetic';

const initialState = {
  mode: 'bn',
  text: '',
  compose: '',
};

function removeLastCharacter(value) {
  return Array.from(value).slice(0, -1).join('');
}

function buildSuggestionItems(compose) {
  if (!compose) {
    return [];
  }

  const romanVariants = [
    compose,
    compose.slice(0, -1),
    compose.slice(1),
    compose.replace(/[aeiou]$/i, ''),
    `${compose}a`,
    `${compose}i`,
    `${compose}o`,
    `${compose}r`,
  ];

  const suggestions = [];
  const seen = new Set();

  for (const roman of romanVariants) {
    if (!roman) {
      continue;
    }

    const label = avroPhonetic.parse(roman);

    if (!label || seen.has(label)) {
      continue;
    }

    seen.add(label);
    suggestions.push({ label, roman });
  }

  if (!seen.has(compose)) {
    suggestions.push({ label: compose, roman: compose, isRoman: true });
  }

  return suggestions.slice(0, 4);
}

function measureCaretAnchor(textarea, text, popupWidth) {
  const container = textarea.parentElement;

  if (!container) {
    return null;
  }

  const computedStyle = window.getComputedStyle(textarea);
  const mirror = document.createElement('div');
  const marker = document.createElement('span');

  mirror.style.position = 'absolute';
  mirror.style.visibility = 'hidden';
  mirror.style.pointerEvents = 'none';
  mirror.style.whiteSpace = 'pre-wrap';
  mirror.style.wordBreak = 'break-word';
  mirror.style.overflow = 'hidden';
  mirror.style.inset = '0';
  mirror.style.margin = computedStyle.margin;
  mirror.style.padding = computedStyle.padding;
  mirror.style.border = computedStyle.border;
  mirror.style.boxSizing = computedStyle.boxSizing;
  mirror.style.width = `${textarea.clientWidth}px`;
  mirror.style.height = `${textarea.clientHeight}px`;
  mirror.style.font = computedStyle.font;
  mirror.style.fontSize = computedStyle.fontSize;
  mirror.style.fontFamily = computedStyle.fontFamily;
  mirror.style.fontWeight = computedStyle.fontWeight;
  mirror.style.fontStyle = computedStyle.fontStyle;
  mirror.style.letterSpacing = computedStyle.letterSpacing;
  mirror.style.lineHeight = computedStyle.lineHeight;
  mirror.style.textIndent = computedStyle.textIndent;
  mirror.style.textTransform = computedStyle.textTransform;
  mirror.style.textAlign = computedStyle.textAlign;
  mirror.style.direction = computedStyle.direction;
  mirror.style.tabSize = computedStyle.tabSize;
  mirror.style.overflowWrap = 'break-word';

  const caretPosition = textarea.selectionStart ?? text.length;
  mirror.textContent = text.slice(0, caretPosition);
  marker.textContent = '\u200b';
  mirror.appendChild(marker);
  mirror.appendChild(document.createTextNode(text.slice(caretPosition)));
  container.appendChild(mirror);

  const containerRect = container.getBoundingClientRect();
  const markerRect = marker.getBoundingClientRect();
  const lineHeight = Number.parseFloat(computedStyle.lineHeight) || 24;
  const availableWidth = containerRect.width - popupWidth - 12;
  const left = Math.max(12, Math.min(markerRect.left - containerRect.left, availableWidth));
  const top = Math.max(12, markerRect.top - containerRect.top + lineHeight + 6);

  container.removeChild(mirror);

  return { left, top };
}

function editorReducer(state, action) {
  switch (action.type) {
    case 'toggle-mode': {
      if (state.mode === 'bn') {
        return {
          mode: 'en',
          text: `${state.text}${avroPhonetic.parse(state.compose)}`,
          compose: '',
        };
      }

      return {
        ...state,
        mode: 'bn',
      };
    }

    case 'insert-char': {
      if (state.mode === 'bn') {
        return {
          ...state,
          compose: `${state.compose}${action.char}`,
        };
      }

      return {
        ...state,
        text: `${state.text}${action.char}`,
      };
    }

    case 'backspace': {
      if (state.mode === 'bn' && state.compose) {
        return {
          ...state,
          compose: removeLastCharacter(state.compose),
        };
      }

      return {
        ...state,
        text: removeLastCharacter(state.text),
      };
    }

    case 'commit': {
      if (state.mode !== 'bn') {
        return state;
      }

      return {
        ...state,
        text: `${state.text}${avroPhonetic.parse(state.compose)}${action.separator}`,
        compose: '',
      };
    }

    case 'paste': {
      if (state.mode === 'bn') {
        return {
          ...state,
          text: `${state.text}${avroPhonetic.parse(state.compose)}${avroPhonetic.parse(action.text)}`,
          compose: '',
        };
      }

      return {
        ...state,
        text: `${state.text}${action.text}`,
      };
    }

    case 'append-compose': {
      if (state.mode !== 'bn') {
        return state;
      }

      return {
        ...state,
        compose: `${state.compose}${action.text}`,
      };
    }

    case 'set-compose': {
      if (state.mode !== 'bn') {
        return state;
      }

      return {
        ...state,
        compose: action.compose,
      };
    }

    case 'accept-suggestion': {
      if (state.mode !== 'bn') {
        return state;
      }

      return {
        ...state,
        text: `${state.text}${action.value}`,
        compose: '',
      };
    }

    case 'set-text': {
      return {
        ...state,
        text: action.text,
      };
    }

    default:
      return state;
  }
}

export default function HomeShell() {
  const textareaRef = useRef(null);
  const editorBodyRef = useRef(null);
  const [state, dispatch] = useReducer(editorReducer, initialState);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const [popupPosition, setPopupPosition] = useState({ left: 0, top: 0, visible: false });

  const displayValue = state.mode === 'bn' ? `${state.text}${avroPhonetic.parse(state.compose)}` : state.text;
  const suggestionItems = state.mode === 'bn' ? buildSuggestionItems(state.compose) : [];
  const activeSuggestionIndexWithinBounds = Math.min(activeSuggestionIndex, Math.max(suggestionItems.length - 1, 0));
  const activeSuggestion = suggestionItems[activeSuggestionIndexWithinBounds] || suggestionItems[0] || null;

  useEffect(() => {
    if (state.mode !== 'bn' || !textareaRef.current) {
      return;
    }

    textareaRef.current.focus();
    const endPosition = displayValue.length;
    textareaRef.current.setSelectionRange(endPosition, endPosition);
  }, [displayValue, state.mode]);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea || state.mode !== 'bn' || suggestionItems.length === 0) {
      setPopupPosition((current) => (current.visible ? { ...current, visible: false } : current));
      return;
    }

    const nextPosition = measureCaretAnchor(textarea, displayValue, 176);

    if (!nextPosition) {
      return;
    }

    setPopupPosition({ ...nextPosition, visible: true });
  }, [displayValue, state.mode, suggestionItems.length]);

  const toggleMode = () => {
    dispatch({ type: 'toggle-mode' });
  };

  const commitCompose = (separator = '') => {
    dispatch({ type: 'commit', separator });
  };

  const handleKeyDown = (event) => {
    if (state.mode !== 'bn') {
      return;
    }

    if (suggestionItems.length > 0) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveSuggestionIndex((currentIndex) => Math.min(currentIndex + 1, suggestionItems.length - 1));
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveSuggestionIndex((currentIndex) => Math.max(currentIndex - 1, 0));
        return;
      }

      if (event.key === 'Tab' || event.key === 'Enter') {
        event.preventDefault();
        dispatch({ type: 'accept-suggestion', value: activeSuggestion?.label || displayValue });
        return;
      }
    }

    if ((event.ctrlKey || event.metaKey) && event.key === '.') {
      event.preventDefault();
      toggleMode();
      return;
    }

    if (event.key === 'Backspace') {
      event.preventDefault();
      dispatch({ type: 'backspace' });
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      commitCompose('\n');
      return;
    }

    if (event.key === ' ') {
      event.preventDefault();
      commitCompose(' ');
      return;
    }
  };

  const handleChange = (event) => {
    if (state.mode === 'bn') {
      const nextValue = event.target.value;
      if (nextValue === displayValue) {
        return;
      }

      if (nextValue.length > displayValue.length) {
        dispatch({ type: 'append-compose', text: nextValue.slice(displayValue.length) });
        return;
      }

      if (nextValue.length < displayValue.length) {
        const nextTail = nextValue.slice(state.text.length);
        let nextCompose = '';

        for (let index = state.compose.length; index >= 0; index -= 1) {
          const candidate = state.compose.slice(0, index);

          if (avroPhonetic.parse(candidate) === nextTail) {
            nextCompose = candidate;
            break;
          }
        }

        dispatch({ type: 'set-compose', compose: nextCompose });
      }

      return;
    }

    if (state.mode === 'en') {
      dispatch({ type: 'set-text', text: event.target.value });
    }
  };

  const handlePaste = (event) => {
    if (state.mode !== 'bn') {
      return;
    }

    event.preventDefault();
    const pastedText = event.clipboardData.getData('text/plain');

    if (!pastedText) {
      return;
    }

    dispatch({ type: 'paste', text: pastedText });
  };

  return (
    <div className="relative h-dvh overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(255,167,41,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.12),transparent_28%),linear-gradient(180deg,#0b1020_0%,#15111f_100%)] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-size-[3rem_3rem] opacity-70" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-amber-400/15 to-transparent blur-3xl" />

      <div className="relative flex h-full flex-col gap-2 overflow-hidden p-2 sm:p-3 lg:p-4">
        <header className="flex shrink-0 items-center justify-between rounded-3xl border border-white/10 bg-slate-950/55 px-3 py-2 shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:px-4">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-amber-300/90">
            AvroPad
          </p>

          <button
            type="button"
            onClick={toggleMode}
            className="inline-flex items-center rounded-full border border-white/10 bg-white/5 p-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-300"
            aria-label="Toggle input mode"
          >
            <span className={`rounded-full px-3 py-1 transition ${state.mode === 'bn' ? 'bg-amber-400 text-slate-950' : 'text-slate-300'}`}>
              BN
            </span>
            <span className={`rounded-full px-3 py-1 transition ${state.mode === 'en' ? 'bg-amber-400 text-slate-950' : 'text-slate-300'}`}>
              EN
            </span>
          </button>
        </header>

        <main className="min-h-0 flex-1 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/55 p-2 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-3">
          <div ref={editorBodyRef} className="relative h-full min-h-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            {suggestionItems.length > 0 ? (
              <div
                className={`absolute z-20 w-36 overflow-hidden rounded-xl border border-black/30 bg-[#2a2a2a] shadow-[0_18px_40px_rgba(0,0,0,0.35)] transition-opacity duration-100 ${popupPosition.visible ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
                style={{
                  left: `${popupPosition.left}px`,
                  top: `${popupPosition.top}px`,
                }}
              >
                {suggestionItems.map((item, index) => {
                  const selected = index === activeSuggestionIndexWithinBounds;

                  return (
                    <button
                      key={`${item.label}-${item.roman}`}
                      type="button"
                      onMouseDown={(event) => {
                        event.preventDefault();
                        dispatch({ type: 'accept-suggestion', value: item.label });
                      }}
                      className={`flex w-full items-center justify-between border-b border-white/8 px-3 py-2.5 text-left text-[0.98rem] leading-none transition last:border-b-0 ${selected ? 'bg-[#ff9f43] text-slate-900' : item.isRoman ? 'text-[#ff9f43]' : 'text-slate-200 hover:bg-white/6'}`}
                    >
                      <span className="truncate">{item.label}</span>
                      {selected ? <span className="ml-2 text-[0.55rem] uppercase tracking-[0.28em] text-slate-900/70">selected</span> : null}
                    </button>
                  );
                })}
              </div>
            ) : null}

            <textarea
              ref={textareaRef}
              value={displayValue}
              onKeyDown={handleKeyDown}
              onChange={handleChange}
              onPaste={handlePaste}
              placeholder="Type here"
              spellCheck
              autoCapitalize="off"
              autoComplete="on"
              autoCorrect="on"
              style={{ caretColor: '#f8fafc' }}
              className="absolute inset-0 h-full w-full resize-none overflow-y-auto bg-transparent p-3 text-[1rem] leading-7 text-slate-100 outline-none placeholder:text-slate-500 sm:p-4"
            />
            </div>
        </main>
      </div>
    </div>
  );
}
