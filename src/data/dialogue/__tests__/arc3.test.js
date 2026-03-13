import { describe, it, expect } from 'vitest';
import { ARC3_DIALOGUE } from '../arc3.js';

describe('ARC3_DIALOGUE', () => {
  it('all dialogue keys have a start node', () => {
    for (const [key, tree] of Object.entries(ARC3_DIALOGUE)) {
      expect(tree.start, `Dialogue '${key}' missing start node`).toBeDefined();
    }
  });

  it('each node has non-empty text', () => {
    for (const [key, tree] of Object.entries(ARC3_DIALOGUE)) {
      for (const [nodeId, node] of Object.entries(tree)) {
        expect(typeof node.text, `${key}.${nodeId} text`).toBe('string');
        expect(node.text.length, `${key}.${nodeId} text empty`).toBeGreaterThan(0);
      }
    }
  });

  it('speaker is a string when present', () => {
    for (const [key, tree] of Object.entries(ARC3_DIALOGUE)) {
      for (const [nodeId, node] of Object.entries(tree)) {
        if (node.speaker !== undefined) {
          expect(typeof node.speaker, `${key}.${nodeId} speaker`).toBe('string');
        }
      }
    }
  });

  it('choices have text and valid next references', () => {
    for (const [key, tree] of Object.entries(ARC3_DIALOGUE)) {
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
    for (const [key, tree] of Object.entries(ARC3_DIALOGUE)) {
      for (const [nodeId, node] of Object.entries(tree)) {
        if (node.next !== null && node.next !== undefined) {
          expect(tree[node.next], `${key}.${nodeId} next '${node.next}' not found`).toBeDefined();
        }
      }
    }
  });

  it('effects have type field', () => {
    for (const [key, tree] of Object.entries(ARC3_DIALOGUE)) {
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

  it('has expected dialogue trees for all recruitable disciples', () => {
    expect(ARC3_DIALOGUE.peter_recruit).toBeDefined();
    expect(ARC3_DIALOGUE.andrew_recruit).toBeDefined();
    expect(ARC3_DIALOGUE.james_recruit).toBeDefined();
    expect(ARC3_DIALOGUE.john_disciple_recruit).toBeDefined();
    expect(ARC3_DIALOGUE.philip_recruit).toBeDefined();
    expect(ARC3_DIALOGUE.nathanael_recruit).toBeDefined();
    expect(ARC3_DIALOGUE.matthew_recruit).toBeDefined();
  });

  it('has townsperson dialogue', () => {
    expect(ARC3_DIALOGUE.townsperson_cap_1).toBeDefined();
    expect(ARC3_DIALOGUE.townsperson_cap_2).toBeDefined();
  });

  it('recruitment effects reference valid roster member IDs', () => {
    const validIds = ['peter', 'andrew', 'james', 'john', 'philip', 'nathanael', 'matthew'];
    for (const [key, tree] of Object.entries(ARC3_DIALOGUE)) {
      for (const [nodeId, node] of Object.entries(tree)) {
        if (node.effects) {
          for (const effect of node.effects) {
            if (effect.type === 'recruitMember') {
              expect(validIds, `${key}.${nodeId} recruitMember '${effect.memberId}'`).toContain(effect.memberId);
            }
          }
        }
      }
    }
  });
});
