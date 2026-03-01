/**
 * useElementConstraints
 * Provides utility functions for enforcing element constraints
 *
 * Constraints are defined in config/elementConstraints.ts
 */

import { ELEMENT_CONSTRAINTS, getMaxInstances, getElementPosition } from '../config/elementConstraints';
import type { ConstraintElement } from '../config/elementConstraintUtils';

export function useElementConstraints() {
  const removeDuplicates = (list: ConstraintElement[]) => {
    const instanceCount = new Map<string, number>();

    return list.filter((item) => {
      const maxAllowed = getMaxInstances(item.type);

      // If no constraint defined for this type, allow it
      if (maxAllowed === Infinity) {
        return true;
      }

      // Track instances of this type
      const currentCount = instanceCount.get(item.type) || 0;

      if (currentCount < maxAllowed) {
        instanceCount.set(item.type, currentCount + 1);
        return true; // Keep this instance
      }

      return false; // Remove excess instance
    });
  };

  /**
   * Enforce positioning constraints for specific elements
   * 
   * Elements with position: 'top' go to the beginning
   * Elements with position: 'bottom' go to the end
   * Everything else stays in the middle in their original order
   */
  const enforceElementPositions = (list: ConstraintElement[]) => {
    const topElements: ConstraintElement[] = [];
    const bottomElements: ConstraintElement[] = [];
    const middleElements: ConstraintElement[] = [];

    // Partition elements by their position constraint
    list.forEach((item) => {
      const position = getElementPosition(item.type);

      if (position === 'top') {
        topElements.push(item);
      } else if (position === 'bottom') {
        bottomElements.push(item);
      } else {
        middleElements.push(item);
      }
    });

    // Reconstruct: top + middle + bottom
    return [...topElements, ...middleElements, ...bottomElements];
  };

  /**
   * Apply all element constraints
   * 1. Remove duplicates/excess instances
   * 2. Enforce positioning rules
   * 3. Return validated list
   */
  const applyConstraints = (list: ConstraintElement[]) => {
    const unique = removeDuplicates(list);
    return enforceElementPositions(unique);
  };

  const canAddElement = (type: string, currentList: ConstraintElement[]): boolean => {
    const maxAllowed = getMaxInstances(type);
    const currentCount = currentList.filter((item) => item.type === type).length;
    return currentCount < maxAllowed;
  };

  /**
   * Get all available constraint configurations
   * Useful for UI that needs to display constraint info
   */
  const getAllConstraints = () => ELEMENT_CONSTRAINTS;

  /**
   * Get constraint info for a specific element type
   */
  const getConstraintInfo = (type: string) => {
    return ELEMENT_CONSTRAINTS.find((c) => c.type === type);
  };

  return {
    removeDuplicates,
    enforceElementPositions,
    applyConstraints,
    canAddElement,
    getAllConstraints,
    getConstraintInfo
  };
}
