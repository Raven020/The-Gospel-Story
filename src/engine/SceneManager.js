/**
 * Scene state machine: Title -> Overworld -> Battle -> etc.
 * Each scene implements enter(), exit(), update(dt), render(ctx).
 */

export class SceneManager {
  constructor() {
    this._scenes = {};
    this._current = null;
    this._currentName = null;
  }

  register(name, scene) {
    this._scenes[name] = scene;
  }

  get currentName() {
    return this._currentName;
  }

  get current() {
    return this._current;
  }

  switch(name) {
    const scene = this._scenes[name];
    if (!scene) throw new Error(`Scene not found: ${name}`);
    if (this._current && this._current.exit) this._current.exit();
    this._currentName = name;
    this._current = scene;
    if (this._current.enter) this._current.enter();
  }

  update(dt) {
    if (this._current && this._current.update) this._current.update(dt);
  }

  render(ctx) {
    if (this._current && this._current.render) this._current.render(ctx);
  }
}
