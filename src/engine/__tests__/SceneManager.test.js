import { describe, it, expect, vi } from 'vitest';
import { SceneManager } from '../SceneManager.js';

describe('SceneManager', () => {
  it('starts with no current scene', () => {
    const sm = new SceneManager();
    expect(sm.currentName).toBeNull();
    expect(sm.current).toBeNull();
  });

  it('registers and switches to a scene', () => {
    const sm = new SceneManager();
    const scene = { enter: vi.fn(), update: vi.fn(), render: vi.fn(), exit: vi.fn() };
    sm.register('test', scene);
    sm.switch('test');

    expect(sm.currentName).toBe('test');
    expect(sm.current).toBe(scene);
    expect(scene.enter).toHaveBeenCalledOnce();
  });

  it('calls exit on previous scene when switching', () => {
    const sm = new SceneManager();
    const scene1 = { enter: vi.fn(), exit: vi.fn() };
    const scene2 = { enter: vi.fn() };
    sm.register('s1', scene1);
    sm.register('s2', scene2);

    sm.switch('s1');
    sm.switch('s2');

    expect(scene1.exit).toHaveBeenCalledOnce();
    expect(scene2.enter).toHaveBeenCalledOnce();
  });

  it('throws on switching to unregistered scene', () => {
    const sm = new SceneManager();
    expect(() => sm.switch('nope')).toThrow('Scene not found: nope');
  });

  it('delegates update and render to current scene', () => {
    const sm = new SceneManager();
    const scene = { update: vi.fn(), render: vi.fn() };
    sm.register('test', scene);
    sm.switch('test');

    sm.update(0.016);
    sm.render({});

    expect(scene.update).toHaveBeenCalledWith(0.016);
    expect(scene.render).toHaveBeenCalledWith({});
  });

  it('does nothing if no current scene on update/render', () => {
    const sm = new SceneManager();
    expect(() => {
      sm.update(0.016);
      sm.render({});
    }).not.toThrow();
  });

  it('handles scenes without optional methods', () => {
    const sm = new SceneManager();
    sm.register('minimal', {});
    expect(() => sm.switch('minimal')).not.toThrow();
    expect(() => {
      sm.update(0.016);
      sm.render({});
    }).not.toThrow();
  });
});
