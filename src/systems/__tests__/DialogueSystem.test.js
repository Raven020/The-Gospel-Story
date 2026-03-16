import { describe, it, expect, vi } from 'vitest';
import { DialogueSystem, evalCondition } from '../DialogueSystem.js';

describe('evalCondition', () => {
  it('returns true when no condition', () => {
    expect(evalCondition(null, {})).toBe(true);
    expect(evalCondition(undefined, {})).toBe(true);
  });

  it('evaluates eq correctly', () => {
    expect(evalCondition({ flag: 'x', op: 'eq', value: 1 }, { x: 1 })).toBe(true);
    expect(evalCondition({ flag: 'x', op: 'eq', value: 1 }, { x: 2 })).toBe(false);
  });

  it('evaluates neq correctly', () => {
    expect(evalCondition({ flag: 'x', op: 'neq', value: 1 }, { x: 2 })).toBe(true);
    expect(evalCondition({ flag: 'x', op: 'neq', value: 1 }, { x: 1 })).toBe(false);
  });

  it('evaluates gt/lt/gte/lte', () => {
    expect(evalCondition({ flag: 'x', op: 'gt', value: 5 }, { x: 6 })).toBe(true);
    expect(evalCondition({ flag: 'x', op: 'lt', value: 5 }, { x: 4 })).toBe(true);
    expect(evalCondition({ flag: 'x', op: 'gte', value: 5 }, { x: 5 })).toBe(true);
    expect(evalCondition({ flag: 'x', op: 'lte', value: 5 }, { x: 5 })).toBe(true);
  });

  it('treats missing flag as false', () => {
    expect(evalCondition({ flag: 'missing', op: 'eq', value: false }, {})).toBe(true);
    expect(evalCondition({ flag: 'missing', op: 'eq', value: 0 }, {})).toBe(false);
  });

  it('returns false for unknown operator', () => {
    expect(evalCondition({ flag: 'x', op: 'invalid', value: 1 }, { x: 1 })).toBe(false);
  });
});

describe('DialogueSystem', () => {
  const simpleDialogue = {
    start: {
      speaker: 'Jesus',
      text: 'Peace be with you.',
      next: 'node2',
    },
    node2: {
      speaker: 'Jesus',
      text: 'Follow me.',
      next: null,
    },
  };

  it('opens and traverses dialogue nodes', () => {
    const ds = new DialogueSystem({});
    ds.open(simpleDialogue, 'start');

    expect(ds.isOpen).toBe(true);
    expect(ds.box.speaker).toBe('Jesus');

    // Skip text and advance
    ds.onActionPress(); // skip to full
    ds.onActionPress(); // advance to node2 (returns 'done' from box, navigates to next)

    expect(ds.box.speaker).toBe('Jesus');

    // Skip and close
    ds.onActionPress(); // skip
    ds.onActionPress(); // done, next is null -> close
    expect(ds.isOpen).toBe(false);
  });

  it('executes setFlag effects after player advances past text', () => {
    const flags = {};
    const dialogue = {
      start: {
        speaker: '',
        text: 'You found it!',
        effects: [{ type: 'setFlag', flag: 'found_item', value: true }],
        next: null,
      },
    };

    const ds = new DialogueSystem({ questFlags: flags });
    ds.open(dialogue, 'start');

    // Effect is deferred — not fired yet while text is displaying
    expect(flags.found_item).toBeUndefined();

    // Skip text reveal then advance past the node
    ds.onActionPress(); // fast-forward text
    ds.onActionPress(); // confirm 'done' — effects fire here

    expect(flags.found_item).toBe(true);
  });

  it('calls onEffect for non-flag effects after player advances past text', () => {
    const onEffect = vi.fn();
    const dialogue = {
      start: {
        text: 'Welcome!',
        effects: [{ type: 'giveItem', item: 'bread', quantity: 3 }],
        next: null,
      },
    };

    const ds = new DialogueSystem({ onEffect });
    ds.open(dialogue, 'start');

    // Effect is deferred — not fired yet while text is displaying
    expect(onEffect).not.toHaveBeenCalled();

    // Skip text reveal then advance past the node
    ds.onActionPress(); // fast-forward text
    ds.onActionPress(); // confirm 'done' — effects fire here

    expect(onEffect).toHaveBeenCalledWith({ type: 'giveItem', item: 'bread', quantity: 3 });
  });

  it('skips nodes with false conditions', () => {
    const dialogue = {
      start: {
        text: 'Should skip',
        condition: { flag: 'x', op: 'eq', value: 1 },
        next: 'fallback',
      },
      fallback: {
        text: 'Reached fallback.',
        next: null,
      },
    };

    const ds = new DialogueSystem({ questFlags: { x: 0 } });
    ds.open(dialogue, 'start');

    // Should have skipped 'start' and gone to 'fallback'
    expect(ds.box.active).toBe(true);
    expect(ds._currentNodeId).toBe('fallback');
  });

  it('handles choices with condition filtering', () => {
    const dialogue = {
      start: {
        speaker: 'NPC',
        text: 'What say you?',
        choices: [
          { text: 'Yes', next: 'yes', condition: { flag: 'can_say_yes', op: 'eq', value: true } },
          { text: 'No', next: 'no' },
        ],
      },
      yes: { text: 'Good!', next: null },
      no: { text: 'Fine.', next: null },
    };

    const ds = new DialogueSystem({ questFlags: { can_say_yes: false } });
    ds.open(dialogue, 'start');

    // Only 'No' should be visible since condition fails
    expect(ds.box.choices).toHaveLength(1);
    expect(ds.box.choices[0].text).toBe('No');
  });

  it('handles action nodes (no text, only effects)', () => {
    const onEffect = vi.fn();
    const dialogue = {
      start: {
        effects: [{ type: 'setFlag', flag: 'visited', value: true }],
        next: 'greeting',
      },
      greeting: {
        speaker: 'NPC',
        text: 'Hello again!',
        next: null,
      },
    };

    const flags = {};
    const ds = new DialogueSystem({ questFlags: flags, onEffect });
    ds.open(dialogue, 'start');

    expect(flags.visited).toBe(true);
    expect(ds._currentNodeId).toBe('greeting');
  });

  it('uses conditionFail as alternate fallback when condition is false', () => {
    const dialogue = {
      start: {
        condition: { flag: 'found', op: 'eq', value: true },
        conditionFail: 'default',
        speaker: 'NPC',
        text: 'Post-discovery text',
        next: null,
      },
      default: {
        speaker: 'NPC',
        text: 'Default text',
        next: null,
      },
    };

    // Condition false → should navigate to conditionFail node
    const ds1 = new DialogueSystem({ questFlags: { found: false } });
    ds1.open(dialogue, 'start');
    expect(ds1._currentNodeId).toBe('default');

    // Condition true → should show the start node normally
    const ds2 = new DialogueSystem({ questFlags: { found: true } });
    ds2.open(dialogue, 'start');
    expect(ds2._currentNodeId).toBe('start');
  });

  it('close resets everything', () => {
    const ds = new DialogueSystem({});
    ds.open(simpleDialogue, 'start');
    ds.close();

    expect(ds.isOpen).toBe(false);
    expect(ds._nodes).toBeNull();
  });
});
