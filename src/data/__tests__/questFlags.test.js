import { describe, it, expect } from 'vitest';
import { createQuestFlags, INITIAL_FLAGS } from '../questFlags.js';

describe('questFlags', () => {
  it('creates a copy of initial flags', () => {
    const flags = createQuestFlags();
    expect(flags).toEqual(INITIAL_FLAGS);
    expect(flags).not.toBe(INITIAL_FLAGS);
  });

  it('has Arc 1 flags', () => {
    const flags = createQuestFlags();
    expect(flags.arc1_started).toBe(false);
    expect(flags.found_jesus_in_temple).toBe(false);
    expect(flags.arc1_complete).toBe(false);
  });

  it('has Arc 2 flags', () => {
    const flags = createQuestFlags();
    expect(flags.baptism_complete).toBe(false);
    expect(flags.temptation_1_resolved).toBe(false);
  });

  it('has Arc 3 recruitment flags', () => {
    const flags = createQuestFlags();
    expect(flags.recruited_peter).toBe(false);
    expect(flags.recruited_nathanael).toBe(false);
  });

  it('starts at arc 1', () => {
    const flags = createQuestFlags();
    expect(flags.current_arc).toBe(1);
  });

  it('can be mutated independently', () => {
    const flags1 = createQuestFlags();
    const flags2 = createQuestFlags();
    flags1.arc1_started = true;
    expect(flags2.arc1_started).toBe(false);
  });
});
