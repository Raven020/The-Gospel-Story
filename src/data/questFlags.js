/**
 * Quest flag system per specs/dialogue-system.md §11 and IMPLEMENTATION_PLAN Phase 4.3.
 * Single flat object with snake_case, arc-prefixed flags.
 */

/**
 * Predefined quest flags for Arcs 1-3.
 * All flags start at their default values (false/0).
 */
export const INITIAL_FLAGS = {
  // Arc 1 — The Boy Jesus
  arc1_started: false,
  heard_about_temple_boy: false,
  talked_to_temple_guard: false,
  found_jesus_in_temple: false,
  arc1_complete: false,

  // Arc 2 — Baptism & Temptation
  arc2_started: false,
  baptism_complete: false,
  temptation_1_resolved: false,
  temptation_2_resolved: false,
  temptation_3_resolved: false,
  arc2_complete: false,

  // Arc 3 — Calling of the Disciples
  arc3_started: false,
  recruited_peter: false,
  recruited_andrew: false,
  recruited_james: false,
  recruited_john: false,
  recruited_philip: false,
  recruited_nathanael: false,
  recruited_matthew: false,
  arc3_complete: false,

  // General
  current_arc: 1,
};

/**
 * Create a fresh quest flags object with all defaults.
 */
export function createQuestFlags() {
  return { ...INITIAL_FLAGS };
}
