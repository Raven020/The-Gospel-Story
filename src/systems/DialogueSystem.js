/**
 * Dialogue system per specs/dialogue-system.md.
 * State machine managing dialogue node traversal, conditions, effects, choices.
 * Uses DialogueBox for rendering. Dialogue data loaded from src/data/dialogue/.
 */

import { DialogueBox } from '../ui/DialogueBox.js';

/**
 * Evaluate a condition against quest flags.
 * Condition format: { flag, op, value }
 * Ops: eq, neq, gt, lt, gte, lte
 */
export function evalCondition(condition, questFlags) {
  if (!condition) return true;
  const flagValue = questFlags[condition.flag];
  const value = condition.value;
  const actual = flagValue !== undefined ? flagValue : false;

  switch (condition.op) {
    case 'eq': return actual === value;
    case 'neq': return actual !== value;
    case 'gt': return actual > value;
    case 'lt': return actual < value;
    case 'gte': return actual >= value;
    case 'lte': return actual <= value;
    default: return false;
  }
}

export class DialogueSystem {
  constructor({ questFlags, onEffect }) {
    this.box = new DialogueBox();
    this.questFlags = questFlags || {};
    this.onEffect = onEffect || (() => {});

    this._module = null;       // current dialogue module data
    this._nodes = null;        // nodes map from current dialogue
    this._currentNodeId = null;
    this._currentNode = null;
    this._pendingEffects = []; // effects deferred until player advances past text
  }

  get isOpen() {
    return this.box.active;
  }

  /**
   * Open a dialogue tree.
   * @param {object} dialogueData - The dialogue export (object with node IDs as keys)
   * @param {string} startNodeId - Starting node ID (default: 'start')
   */
  open(dialogueData, startNodeId = 'start') {
    this._nodes = dialogueData;
    this._navigateToNode(startNodeId);
  }

  close() {
    this.box.close();
    this._nodes = null;
    this._currentNodeId = null;
    this._currentNode = null;
    this._pendingEffects = [];
  }

  /**
   * Update per frame.
   */
  update() {
    this.box.update();
  }

  /**
   * Handle confirm/action press.
   */
  onActionPress() {
    if (!this.box.active) return;

    const result = this.box.onConfirm();

    if (result === null) return; // text still revealing

    if (result === 'done') {
      // End of current node's text — flush deferred effects now that player has advanced
      this._flushPendingEffects();
      if (this._currentNode && this._currentNode.next) {
        this._navigateToNode(this._currentNode.next);
      } else {
        this.close();
      }
      return;
    }

    if (result === 'next') return; // next page of same node

    if (result && result.choice) {
      // Choice selected — flush deferred effects then follow the choice
      this._flushPendingEffects();
      const choice = result.choice;
      if (choice.next) {
        this._navigateToNode(choice.next);
      } else {
        this.close();
      }
    }
  }

  /**
   * Handle directional input (for choice navigation).
   */
  onDirectional(dir) {
    this.box.onDirection(dir);
  }

  /**
   * Render the dialogue box.
   */
  render(ctx, frameCount) {
    this.box.render(ctx, frameCount);
  }

  _navigateToNode(nodeId) {
    const node = this._nodes[nodeId];
    if (!node) {
      this.close();
      return;
    }

    // Check node-level condition — skip if false.
    // conditionFail overrides next as the fallback when the condition is false,
    // enabling pre/post-flag dialogue branches from the same start node.
    if (node.condition && !evalCondition(node.condition, this.questFlags)) {
      const fallback = node.conditionFail || node.next;
      if (fallback) {
        this._navigateToNode(fallback);
      } else {
        this.close();
      }
      return;
    }

    this._currentNodeId = nodeId;
    this._currentNode = node;

    // If node has no text (action node), execute effects immediately and skip to next.
    // Action nodes are invisible to the player so there is no "after advancing" moment.
    if (!node.text && !node.choices) {
      if (node.effects) {
        for (const effect of node.effects) {
          this._executeEffect(effect);
        }
      }
      if (node.next) {
        this._navigateToNode(node.next);
      } else {
        this.close();
      }
      return;
    }

    // Node has text/choices — defer effects until after the player advances past this node
    if (node.effects) {
      this._pendingEffects = node.effects.slice();
    } else {
      this._pendingEffects = [];
    }

    // Open dialogue box with text
    if (node.text) {
      this.box.open(node.speaker || '', node.text);
    }

    // If node has choices, filter by conditions and show
    if (node.choices) {
      const validChoices = node.choices.filter(
        (c) => !c.condition || evalCondition(c.condition, this.questFlags)
      );

      if (validChoices.length > 0) {
        if (validChoices.length === 1 && node.autoAdvanceSingleChoice) {
          // Auto-advance if single choice — execute effects before following next
          const choice = validChoices[0];
          if (choice.effects) {
            for (const effect of choice.effects) {
              this._executeEffect(effect);
            }
          }
          if (choice.next) {
            this._navigateToNode(choice.next);
          } else {
            this.close();
          }
          return;
        }
        this.box.showChoices(validChoices);
      }
    }
  }

  /**
   * Execute and clear all deferred effects stored from the current node.
   * Called when the player advances past a text node.
   */
  _flushPendingEffects() {
    for (const effect of this._pendingEffects) {
      this._executeEffect(effect);
    }
    this._pendingEffects = [];
  }

  _executeEffect(effect) {
    switch (effect.type) {
      case 'setFlag':
        this.questFlags[effect.flag] = effect.value;
        this.onEffect(effect);
        break;
      case 'giveItem':
      case 'removeItem':
      case 'recruitMember':
      case 'triggerEvent':
      case 'playSound':
      case 'playMusic':
      case 'setNpcState':
        this.onEffect(effect);
        break;
    }
  }
}
