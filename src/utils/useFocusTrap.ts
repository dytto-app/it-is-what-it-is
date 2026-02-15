import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook to trap focus within a container element.
 * When active, Tab/Shift+Tab will cycle through focusable elements within the container.
 * Focus is moved to the first focusable element on mount and restored on unmount.
 */
export function useFocusTrap(isActive: boolean = true) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return [];
    
    const focusableSelectors = [
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    const elements = containerRef.current.querySelectorAll<HTMLElement>(focusableSelectors);
    return Array.from(elements).filter(el => {
      // Filter out hidden elements
      return el.offsetParent !== null;
    });
  }, []);

  useEffect(() => {
    if (!isActive) return;

    // Store the previously focused element
    previouslyFocusedElement.current = document.activeElement as HTMLElement;

    // Focus the first focusable element in the container
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      // Small delay to ensure modal is rendered
      setTimeout(() => {
        focusableElements[0]?.focus();
      }, 10);
    }

    // Restore focus when unmounting
    return () => {
      previouslyFocusedElement.current?.focus();
    };
  }, [isActive, getFocusableElements]);

  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab: If on first element, wrap to last
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: If on last element, wrap to first
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive, getFocusableElements]);

  return containerRef;
}
