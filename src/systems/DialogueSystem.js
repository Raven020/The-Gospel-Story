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
  const actual = flagValue !== undefined ? flagValue : 0;

  switch (condition.op) {
    case 'eq': return actual === value;
    case 'neq': return actual !== value;
    case 'gt': return actual > value;
    case 'lt': return actual < value;
    case 'gte': return actual >= value;
    case 'lte': return actual <= value;
    default: return true;
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
      // End of current node's text
      if (this._currentNode && this._currentNode.next) {
        this._navigateToNode(this._currentNode.next);
      } else {
        this.close();
      }
      return;
    }

    if (result === 'next') return; // next page of same node

    if (result && result.choice) {
      // Choice selected
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

    // Check node-level condition — skip if false
    if (node.condition && !evalCondition(node.condition, this.questFlags)) {
      if (node.next) {
        this._navigateToNode(node.next);
      } else {
        this.close();
      }
      return;
    }

    this._currentNodeId = nodeId;
    this._currentNode = node;

    // Execute effects
    if (node.effects) {
      for (const effect of node.effects) {
        this._executeEffect(effect);
      }
    }

    // If node has no text (action node), skip to next
    if (!node.text && !node.choices) {
      if (node.next) {
        this._navigateToNode(node.next);
      } else {
        this.close();
      }
      return;
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
          // Auto-advance if single choice
          if (validChoices[0].next) {
            this._navigateToNode(validChoices[0].next);
          } else {
            this.close();
          }
          return;
        }
        this.box.showChoices(validChoices);
      }
    }
  }

  _executeEffect(effect) {
    switch (effect.type) {
      case 'setFlag':
        this.questFlags[effect.flag] = effect.value;
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
