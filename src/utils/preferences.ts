/**
 * User preferences stored in localStorage
 */

import { SessionCategory } from '../types';

const DEFAULT_CATEGORY_KEY = 'defaultBreakCategory';

export const PreferenceUtils = {
  /** Get the user's default break category (null = no preference / ask each time) */
  getDefaultCategory(): SessionCategory | null {
    const stored = localStorage.getItem(DEFAULT_CATEGORY_KEY);
    if (stored && ['bathroom', 'coffee', 'lunch', 'walk', 'chat', 'other'].includes(stored)) {
      return stored as SessionCategory;
    }
    return null;
  },

  /** Set the user's default break category (null to clear) */
  setDefaultCategory(category: SessionCategory | null): void {
    if (category) {
      localStorage.setItem(DEFAULT_CATEGORY_KEY, category);
    } else {
      localStorage.removeItem(DEFAULT_CATEGORY_KEY);
    }
  },
};
