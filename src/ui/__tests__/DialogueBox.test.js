import { describe, it, expect, vi } from 'vitest';
import { DialogueBox } from '../DialogueBox.js';

describe('DialogueBox', () => {
  it('starts inactive', () => {
    const box = new DialogueBox();
    expect(box.active).toBe(false);
  });

  it('opens with text and speaker', () => {
    const box = new DialogueBox();
    box.open('Jesus', 'Peace be with you.');
    expect(box.active).toBe(true);
    expect(box.speaker).toBe('Jesus');
    expect(box.pages.length).toBeGreaterThan(0);
  });

  it('paginates long text into 2-line pages', () => {
    const box = new DialogueBox();
    const longText = 'This is a very long piece of dialogue text that should span multiple lines and therefore be split into multiple pages for the dialogue box to display.';
    box.open('NPC', longText);
    expect(box.pages.length).toBeGreaterThan(1);
    box.pages.forEach(p => {
      expect(p.lines.length).toBeLessThanOrEqual(2);
    });
  });

  it('typewriter reveals text over frames', () => {
    const box = new DialogueBox();
    box.open('', 'Hello');
    expect(box.fullyRevealed).toBe(false);

    box.update(); // reveal 2 chars
    expect(box.revealIndex).toBe(2);

    box.update(); // reveal 2 more
    expect(box.revealIndex).toBe(4);

    box.update(); // reveal to 5 (end)
    expect(box.fullyRevealed).toBe(true);
  });

  it('onConfirm skips to full reveal first', () => {
    const box = new DialogueBox();
    box.open('', 'Hello World');
    box.update(); // partial

    const result = box.onConfirm();
    expect(result).toBeNull(); // skip happened, not advance
    expect(box.fullyRevealed).toBe(true);
  });

  it('onConfirm advances to next page', () => {
    const box = new DialogueBox();
    // Force multi-page
    const text = 'Line one text here for page. Line two text here for page. Line three text for another page. Line four text should be on page two.';
    box.open('', text);

    // Skip to full
    box.onConfirm();
    // Advance
    const result = box.onConfirm();
    expect(result).toBe('next');
    expect(box.pageIndex).toBe(1);
  });

  it('onConfirm returns done on last page', () => {
    const box = new DialogueBox();
    box.open('', 'Short.');

    box.onConfirm(); // skip
    const result = box.onConfirm(); // done
    expect(result).toBe('done');
  });

  it('handles choices', () => {
    const box = new DialogueBox();
    box.open('NPC', 'Choose:');
    box.onConfirm(); // skip to full

    box.showChoices([
      { text: 'Option A', next: 'a' },
      { text: 'Option B', next: 'b' },
    ]);

    expect(box.choices).toHaveLength(2);
    expect(box.choiceIndex).toBe(0);

    box.onDirection('down');
    expect(box.choiceIndex).toBe(1);

    box.onDirection('down');
    expect(box.choiceIndex).toBe(0); // wraps

    const result = box.onConfirm();
    expect(result.choiceIndex).toBe(0);
    expect(result.choice.next).toBe('a');
  });

  it('close resets state', () => {
    const box = new DialogueBox();
    box.open('NPC', 'Hello');
    box.close();
    expect(box.active).toBe(false);
    expect(box.pages).toEqual([]);
  });

  it('renders without errors', () => {
    const box = new DialogueBox();
    box.open('Jesus', 'Hello.');
    const ctx = { fillStyle: '', fillRect: vi.fn(), globalAlpha: 1 };
    expect(() => box.render(ctx, 0)).not.toThrow();
  });
});
