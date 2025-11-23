import { useState, useCallback } from 'react';

/**
 * Hook for managing selection state (checkboxes, multi-select, etc.)
 * @param initialSelected - Initial set of selected IDs
 * @returns Object with selection state and helper functions
 */
export const useSelection = <T extends string = string>(initialSelected: Set<T> = new Set()) => {
  const [selected, setSelected] = useState<Set<T>>(initialSelected);

  const toggle = useCallback((id: T) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback((ids: T[]) => {
    setSelected(new Set(ids));
  }, []);

  const deselectAll = useCallback(() => {
    setSelected(new Set());
  }, []);

  const isSelected = useCallback((id: T) => {
    return selected.has(id);
  }, [selected]);

  const toggleAll = useCallback((ids: T[]) => {
    if (selected.size === ids.length) {
      deselectAll();
    } else {
      selectAll(ids);
    }
  }, [selected.size, selectAll, deselectAll]);

  return {
    selected,
    toggle,
    selectAll,
    deselectAll,
    isSelected,
    toggleAll,
    count: selected.size,
  };
};
