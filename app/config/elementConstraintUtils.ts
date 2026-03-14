/**
 * Element Constraint Utilities
 *
 * Minimal shape for constraint validation (elements need at least a type).
 * Constraint logic lives in elementConstraints.ts and useElementConstraints.
 */

/** Minimal shape for constraint validation (elements need at least a type). */
export interface ConstraintElement {
  type: string;
}
