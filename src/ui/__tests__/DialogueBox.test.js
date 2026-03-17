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

  it('renders text body and choices together (UI-01)', () => {
    const box = new DialogueBox();
    box.open('Teacher', 'What is the greatest commandment?');
    box.onConfirm(); // skip to full reveal
    box.showChoices([
      { text: 'Love the Lord', next: 'correct' },
      { text: 'Honor the Sabbath', next: 'wrong' },
    ]);

    const ctx = { fillStyle: '', fillRect: vi.fn(), globalAlpha: 1 };
    // Should render without errors — both question header and choices
    expect(() => box.render(ctx, 0)).not.toThrow();
    // Choices should be present alongside text pages
    expect(box.choices).toHaveLength(2);
    expect(box.pages.length).toBeGreaterThan(0);
  });

  it('caps visible choices at 4 with scroll (UI-02)', () => {
    const box = new DialogueBox();
    box.open('', 'Pick one:');
    box.onConfirm();
    box.showChoices([
      { text: 'A', next: 'a' },
      { text: 'B', next: 'b' },
      { text: 'C', next: 'c' },
      { text: 'D', next: 'd' },
      { text: 'E', next: 'e' },
    ]);

    expect(box._choiceScrollOffset).toBe(0);

    // Navigate down to choice E (index 4)
    box.onDirection('down'); // index 1
    box.onDirection('down'); // index 2
    box.onDirection('down'); // index 3
    box.onDirection('down'); // index 4 — should trigger scroll
    expect(box.choiceIndex).toBe(4);
    expect(box._choiceScrollOffset).toBe(1); // scrolled to show items 1-4

    // Navigate back up to choice A (index 0)
    box.onDirection('up'); // index 3
    box.onDirection('up'); // index 2
    box.onDirection('up'); // index 1
    box.onDirection('up'); // index 0 — should scroll back
    expect(box.choiceIndex).toBe(0);
    expect(box._choiceScrollOffset).toBe(0);
  });

  it('renders choices with scroll offset without errors', () => {
    const box = new DialogueBox();
    box.open('', 'Pick:');
    box.onConfirm();
    box.showChoices([
      { text: 'A', next: 'a' },
      { text: 'B', next: 'b' },
      { text: 'C', next: 'c' },
      { text: 'D', next: 'd' },
      { text: 'E', next: 'e' },
    ]);
    box.onDirection('down');
    box.onDirection('down');
    box.onDirection('down');
    box.onDirection('down'); // scroll to show B-E

    const ctx = { fillStyle: '', fillRect: vi.fn(), globalAlpha: 1 };
    expect(() => box.render(ctx, 0)).not.toThrow();
  });
});
