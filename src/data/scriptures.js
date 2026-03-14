/**
 * Scripture challenges used in the battle scripture selection mini-game.
 * Each challenge presents the enemy's taunt and three verse options;
 * exactly one option is correct.
 */

export const SCRIPTURE_CHALLENGES = {
  temptation_bread: {
    id: 'temptation_bread',
    challenge: "Turn these stones to bread!",
    options: [
      { text: "Man shall not live by bread alone", ref: "Deut. 8:3", correct: true },
      { text: "Give us this day our daily bread", ref: "Matt. 6:11", correct: false },
      { text: "I am the bread of life", ref: "John 6:35", correct: false },
    ],
  },
  temptation_pinnacle: {
    id: 'temptation_pinnacle',
    challenge: "Throw yourself down!",
    options: [
      { text: "You shall not put the Lord to the test", ref: "Deut. 6:16", correct: true },
      { text: "The Lord is my shepherd", ref: "Psalm 23:1", correct: false },
      { text: "Be still and know that I am God", ref: "Psalm 46:10", correct: false },
    ],
  },
  temptation_kingdoms: {
    id: 'temptation_kingdoms',
    challenge: "All this I will give you!",
    options: [
      { text: "Worship the Lord your God only", ref: "Deut. 6:13", correct: true },
      { text: "The earth is the Lord's", ref: "Psalm 24:1", correct: false },
      { text: "Store up treasures in heaven", ref: "Matt. 6:20", correct: false },
    ],
  },
  // Generic challenges for random encounters
  doubt_challenge: {
    id: 'doubt_challenge',
    challenge: "How can you be sure?",
    options: [
      { text: "Faith is the substance of hope", ref: "Heb. 11:1", correct: true },
      { text: "The Lord is my light", ref: "Psalm 27:1", correct: false },
      { text: "Love is patient and kind", ref: "1 Cor. 13:4", correct: false },
    ],
  },
  fear_challenge: {
    id: 'fear_challenge',
    challenge: "Be afraid! You cannot win!",
    options: [
      { text: "God has not given a spirit of fear", ref: "2 Tim. 1:7", correct: true },
      { text: "The Lord is my shepherd", ref: "Psalm 23:1", correct: false },
      { text: "Love your neighbor as yourself", ref: "Mark 12:31", correct: false },
    ],
  },
  pride_challenge: {
    id: 'pride_challenge',
    challenge: "You are nothing!",
    options: [
      { text: "Pride goes before destruction", ref: "Prov. 16:18", correct: true },
      { text: "Be strong and courageous", ref: "Josh. 1:9", correct: false },
      { text: "I can do all things through Christ", ref: "Phil. 4:13", correct: false },
    ],
  },
  deception_challenge: {
    id: 'deception_challenge',
    challenge: "Truth is just a point of view!",
    options: [
      { text: "The truth will set you free", ref: "John 8:32", correct: true },
      { text: "In the beginning was the Word", ref: "John 1:1", correct: false },
      { text: "A gentle answer turns away wrath", ref: "Prov. 15:1", correct: false },
    ],
  },
  temptation_challenge: {
    id: 'temptation_challenge',
    challenge: "Give in to your desires!",
    options: [
      { text: "Resist the devil and he will flee", ref: "James 4:7", correct: true },
      { text: "The Lord is my strength", ref: "Psalm 28:7", correct: false },
      { text: "Ask and it shall be given", ref: "Matt. 7:7", correct: false },
    ],
  },
  greed_challenge: {
    id: 'greed_challenge',
    challenge: "You deserve more!",
    options: [
      { text: "The love of money is a root of evil", ref: "1 Tim. 6:10", correct: true },
      { text: "Give and it will be given to you", ref: "Luke 6:38", correct: false },
      { text: "Where your treasure is, your heart is", ref: "Matt. 6:21", correct: false },
    ],
  },
};

// Map enemy IDs to their scripture challenge
export const ENEMY_SCRIPTURE = {
  doubt: 'doubt_challenge',
  fear: 'fear_challenge',
  temptation: 'temptation_challenge',
  pride: 'pride_challenge',
  greed: 'greed_challenge',
  deception: 'deception_challenge',
  satan: 'temptation_bread', // default for encounter 1
  satan_2: 'temptation_pinnacle',
  satan_3: 'temptation_kingdoms',
};
