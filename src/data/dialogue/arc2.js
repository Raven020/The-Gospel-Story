/**
 * Dialogue trees for Arc 2 - "Baptism & Temptation" (Matthew 3-4).
 * Covers John the Baptist, crowd NPCs, Satan's three temptations, and angel.
 */

export const ARC2_DIALOGUE = {
  // John the Baptist at Jordan River
  john_baptist: {
    start: {
      speaker: 'John',
      text: 'Repent, for the kingdom of heaven is at hand!',
      choices: [
        { text: 'I have come to be baptized.', next: 'baptize' },
        { text: 'Who are you?', next: 'who' },
      ],
    },
    who: {
      speaker: 'John',
      text: 'I am a voice crying in the wilderness. I baptize with water, but one comes after me who is mightier.',
      next: null,
    },
    baptize: {
      speaker: 'John',
      text: 'I need to be baptized by you, and do you come to me?',
      next: 'jesus_reply',
    },
    jesus_reply: {
      speaker: 'Jesus',
      text: 'Let it be so now, for thus it is fitting to fulfill all righteousness.',
      effects: [
        { type: 'setFlag', flag: 'baptism_complete', value: true },
      ],
      next: 'narrator',
    },
    narrator: {
      speaker: '',
      text: 'And the heavens opened, and the Spirit descended like a dove. A voice said: This is my beloved Son, with whom I am well pleased.',
      next: null,
    },
  },

  // Crowd NPCs at Jordan River
  crowd_1: {
    start: {
      speaker: 'Pilgrim',
      text: 'John speaks with such authority! Many have been baptized today.',
      next: null,
    },
  },
  crowd_2: {
    start: {
      speaker: 'Fisherman',
      text: 'I came from Galilee to hear John preach. His words pierce the heart.',
      next: null,
    },
  },
  crowd_3: {
    start: {
      speaker: 'Woman',
      text: 'They say the Messiah is coming soon. Could John be the one?',
      next: null,
    },
  },

  // Satan temptation dialogues (triggered by cutscene events in wilderness)
  satan_temptation_1: {
    start: {
      speaker: 'Satan',
      text: 'If you are the Son of God, command these stones to become bread!',
      next: 'jesus_rebuttal',
    },
    jesus_rebuttal: {
      speaker: 'Jesus',
      text: 'It is written: Man shall not live by bread alone, but by every word that comes from the mouth of God.',
      next: null,
    },
  },
  satan_temptation_2: {
    start: {
      speaker: 'Satan',
      text: 'If you are the Son of God, throw yourself down from the pinnacle of the temple!',
      next: 'satan_quote',
    },
    satan_quote: {
      speaker: 'Satan',
      text: 'For it is written: He will command his angels concerning you, and they will lift you up in their hands.',
      next: 'jesus_rebuttal',
    },
    jesus_rebuttal: {
      speaker: 'Jesus',
      text: 'Again it is written: You shall not put the Lord your God to the test.',
      next: null,
    },
  },
  satan_temptation_3: {
    start: {
      speaker: 'Satan',
      text: 'All these kingdoms I will give you, if you fall down and worship me!',
      next: 'jesus_rebuttal',
    },
    jesus_rebuttal: {
      speaker: 'Jesus',
      text: 'Be gone, Satan! For it is written: You shall worship the Lord your God, and him only shall you serve.',
      next: null,
    },
  },

  // Angel ministering after temptation
  angel_minister: {
    start: {
      speaker: 'Angel',
      text: 'The tempter has fled. Be strengthened, Son of God. Angels attend to you.',
      effects: [{ type: 'setFlag', flag: 'arc2_complete', value: true }],
      next: null,
    },
  },

  // Arc 2→3 transition narration (plays after temptation victory, before warp to Galilee)
  arc2_transition: {
    start: {
      speaker: '',
      text: 'Jesus returned to Galilee in the power of the Spirit, and news about him spread through the whole countryside.',
      next: 'galilee_intro',
    },
    galilee_intro: {
      speaker: '',
      text: 'By the Sea of Galilee, fishermen mended their nets. Among them were those who would become the first disciples.',
      next: null,
    },
  },
};
