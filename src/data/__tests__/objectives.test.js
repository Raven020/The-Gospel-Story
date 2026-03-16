import { describe, it, expect } from 'vitest';
import { getCurrentObjective } from '../objectives.js';
import { createQuestFlags } from '../questFlags.js';

describe('getCurrentObjective', () => {
  it('returns empty string for null flags', () => {
    expect(getCurrentObjective(null)).toBe('');
  });

  it('returns arc 1 initial objective', () => {
    const flags = createQuestFlags();
    expect(getCurrentObjective(flags)).toBe('> Search for Jesus');
  });

  it('progresses through arc 1 objectives', () => {
    const flags = createQuestFlags();
    flags.heard_about_temple_boy = true;
    expect(getCurrentObjective(flags)).toBe('> Ask at the Temple');

    flags.talked_to_temple_guard = true;
    expect(getCurrentObjective(flags)).toBe('> Find Jesus in the Temple');

    flags.found_jesus_in_temple = true;
    expect(getCurrentObjective(flags)).toBe('> Return to Nazareth');
  });

  it('progresses through arc 2 objectives', () => {
    const flags = createQuestFlags();
    flags.current_arc = 2;
    expect(getCurrentObjective(flags)).toBe('> Go to the Jordan River');

    flags.baptism_complete = true;
    expect(getCurrentObjective(flags)).toBe('> Face the wilderness');

    flags.temptation_1_resolved = true;
    expect(getCurrentObjective(flags)).toBe('> Resist temptation');

    flags.temptation_2_resolved = true;
    expect(getCurrentObjective(flags)).toBe('> Stand firm');

    flags.temptation_3_resolved = true;
    expect(getCurrentObjective(flags)).toBe('> Return from the wilderness');
  });

  it('progresses through arc 3 objectives', () => {
    const flags = createQuestFlags();
    flags.current_arc = 3;
    expect(getCurrentObjective(flags)).toBe('> Go to the Sea of Galilee');

    flags.recruited_peter = true;
    expect(getCurrentObjective(flags)).toBe('> Call Andrew');

    flags.recruited_andrew = true;
    expect(getCurrentObjective(flags)).toBe('> Call James');

    flags.recruited_james = true;
    expect(getCurrentObjective(flags)).toBe('> Call John');

    flags.recruited_john = true;
    expect(getCurrentObjective(flags)).toBe('> Call Philip');

    flags.recruited_philip = true;
    expect(getCurrentObjective(flags)).toBe('> Call Nathanael');

    flags.recruited_nathanael = true;
    expect(getCurrentObjective(flags)).toBe('> Call Matthew');

    flags.recruited_matthew = true;
    expect(getCurrentObjective(flags)).toBe('> Ascend the mountain');

    flags.arc3_complete = true;
    expect(getCurrentObjective(flags)).toBe('> The twelve are chosen');
  });
});
