/**
 * Utility for handling contenteditable elements in a type-safe way
 */

/**
 * Extract text content from a FocusEvent target (contenteditable element)
 * @param event - The FocusEvent from a contenteditable element
 * @returns The trimmed text content, or empty string if not available
 */
export function extractContentEditableText(event: FocusEvent): string {
  const target = event.target;
  
  if (!(target instanceof HTMLElement)) {
    return '';
  }
  
  return target.textContent?.trim() || '';
}

/**
 * Blur a contenteditable element on Enter key press
 * @param event - The KeyboardEvent from a contenteditable element
 */
export function blurOnEnter(event: KeyboardEvent): void {
  const target = event.target;
  
  if (target instanceof HTMLElement) {
    target.blur();
  }
}

/**
 * Type guard to check if an element is contenteditable
 * @param element - The element to check
 * @returns True if the element is contenteditable
 */
export function isContentEditable(element: unknown): element is HTMLElement {
  return element instanceof HTMLElement && 
         element.isContentEditable;
}
