import { describe, it, expect } from 'vitest';
import { ARC2_DIALOGUE } from '../arc2.js';

describe('ARC2_DIALOGUE', () => {
  it('all dialogue keys have a start node', () => {
    for (const [key, tree] of Object.entries(ARC2_DIALOGUE)) {
      expect(tree.start, `Dialogue '${key}' missing start node`).toBeDefined();
    }
  });

  it('each node has non-empty text', () => {
    for (const [key, tree] of Object.entries(ARC2_DIALOGUE)) {
      for (const [nodeId, node] of Object.entries(tree)) {
        expect(typeof node.text, `${key}.${nodeId} text`).toBe('string');
        expect(node.text.length, `${key}.${nodeId} text empty`).toBeGreaterThan(0);
      }
    }
  });

  it('speaker is a string when present', () => {
    for (const [key, tree] of Object.entries(ARC2_DIALOGUE)) {
      for (const [nodeId, node] of Object.entries(tree)) {
        if (node.speaker !== undefined) {
          expect(typeof node.speaker, `${key}.${nodeId} speaker`).toBe('string');
        }
      }
    }
  });

  it('choices have text and valid next references', () => {
    for (const [key, tree] of Object.entries(ARC2_DIALOGUE)) {
      for (const [nodeId, node] of Object.entries(tree)) {
        if (node.choices) {
          expect(Array.isArray(node.choices)).toBe(true);
          for (const choice of node.choices) {
            expect(typeof choice.text).toBe('string');
            expect(choice.text.length).toBeGreaterThan(0);
            if (choice.next !== null && choice.next !== undefined) {
              expect(tree[choice.next], `${key}.${nodeId} choice next '${choice.next}' not found`).toBeDefined();
            }
          }
        }
      }
    }
  });

  it('next references exist in the same tree or are null', () => {
    for (const [key, tree] of Object.entries(ARC2_DIALOGUE)) {
      for (const [nodeId, node] of Object.entries(tree)) {
        if (node.next !== null && node.next !== undefined) {
          expect(tree[node.next], `${key}.${nodeId} next '${node.next}' not found`).toBeDefined();
        }
      }
    }
  });

  it('effects have type field', () => {
    for (const [key, tree] of Object.entries(ARC2_DIALOGUE)) {
      for (const [nodeId, node] of Object.entries(tree)) {
        if (node.effects) {
          expect(Array.isArray(node.effects)).toBe(true);
          for (const effect of node.effects) {
            expect(typeof effect.type).toBe('string');
          }
        }
      }
    }
  });

  it('has expected dialogue trees', () => {
    expect(ARC2_DIALOGUE.john_baptist).toBeDefined();
    expect(ARC2_DIALOGUE.satan_temptation_1).toBeDefined();
    expect(ARC2_DIALOGUE.satan_temptation_2).toBeDefined();
    expect(ARC2_DIALOGUE.satan_temptation_3).toBeDefined();
    expect(ARC2_DIALOGUE.angel_minister).toBeDefined();
    expect(ARC2_DIALOGUE.crowd_1).toBeDefined();
    expect(ARC2_DIALOGUE.crowd_2).toBeDefined();
    expect(ARC2_DIALOGUE.crowd_3).toBeDefined();
  });
});
