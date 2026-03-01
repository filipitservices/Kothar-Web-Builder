/**
 * Element Constraint Debugging & Validation Utilities
 *
 * Helpful functions for testing, validating, and understanding element constraints
 */

import { ELEMENT_CONSTRAINTS, getMaxInstances, getElementPosition } from './elementConstraints';

/** Minimal shape for constraint validation (elements need at least a type). */
export interface ConstraintElement {
  type: string;
}

/**
 * Validate a list of elements against all constraints
 * Returns validation report with any violations
 */
export function validateElementList(elements: ConstraintElement[]) {
  const report = {
    valid: true,
    violations: [] as string[],
    warnings: [] as string[]
  };

  const typeCounts = new Map<string, number>();
  elements.forEach((el) => {
    typeCounts.set(el.type, (typeCounts.get(el.type) || 0) + 1);
  });

  typeCounts.forEach((count, type) => {
    const maxAllowed = getMaxInstances(type);
    if (count > maxAllowed && maxAllowed !== Infinity) {
      report.valid = false;
      report.violations.push(
        `Element "${type}" appears ${count} times but max is ${maxAllowed}`
      );
    }
  });

  const positionedElements = ELEMENT_CONSTRAINTS.filter((c) => c.position);
  const elementsByPosition = new Map<string, ConstraintElement[]>();

  positionedElements.forEach((config) => {
    const matching = elements.filter((el) => el.type === config.type);
    if (matching.length > 0) {
      elementsByPosition.set(config.position ?? 'middle', matching);
    }
  });

  return report;
}

/**
 * Generate a human-readable summary of constraints
 */
export function getConstraintSummary(): string {
  let summary = 'Element Constraints Summary\n';
  summary += '===========================\n\n';

  const unique = ELEMENT_CONSTRAINTS.filter((c) => c.unique);
  const limited = ELEMENT_CONSTRAINTS.filter((c) => c.maxInstances && !c.unique);
  const unlimited = ELEMENT_CONSTRAINTS.filter(
    (c) => !c.unique && !c.maxInstances
  );

  if (unique.length > 0) {
    summary += 'Unique Elements (max 1):\n';
    unique.forEach((c) => {
      const pos = c.position ? ` [${c.position}]` : '';
      summary += `  - ${c.label} (${c.type})${pos}\n`;
    });
    summary += '\n';
  }

  if (limited.length > 0) {
    summary += 'Limited Elements:\n';
    limited.forEach((c) => {
      summary += `  - ${c.label} (${c.type}): max ${c.maxInstances}\n`;
    });
    summary += '\n';
  }

  if (unlimited.length > 0) {
    summary += 'Unlimited Elements:\n';
    unlimited.forEach((c) => {
      summary += `  - ${c.label} (${c.type})\n`;
    });
    summary += '\n';
  }

  return summary;
}

/**
 * Check if an element list respects all constraints
 * Useful for form validation
 */
export function isValidElementList(elements: ConstraintElement[]): boolean {
  const report = validateElementList(elements);
  return report.valid && report.violations.length === 0;
}

/**
 * Get list of elements that would be removed if constraints were applied
 */
export function getExcessElements(elements: ConstraintElement[]): ConstraintElement[] {
  const excess: ConstraintElement[] = [];
  const instanceCount = new Map<string, number>();

  elements.forEach((item) => {
    const maxAllowed = getMaxInstances(item.type);
    const currentCount = instanceCount.get(item.type) || 0;

    if (currentCount >= maxAllowed && maxAllowed !== Infinity) {
      excess.push(item);
    } else {
      instanceCount.set(item.type, currentCount + 1);
    }
  });

  return excess;
}

/**
 * Get element types that currently violate constraints
 */
export function getViolatingTypes(elements: ConstraintElement[]): string[] {
  const typeCounts = new Map<string, number>();
  elements.forEach((el) => {
    typeCounts.set(el.type, (typeCounts.get(el.type) || 0) + 1);
  });

  const violating: string[] = [];
  typeCounts.forEach((count, type) => {
    const maxAllowed = getMaxInstances(type);
    if (count > maxAllowed && maxAllowed !== Infinity) {
      violating.push(type);
    }
  });

  return violating;
}
