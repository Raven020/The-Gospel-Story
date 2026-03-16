/**
 * Dialogue trees for Arc 1 - "The Boy Jesus" (Luke 2:41-52).
 * Covers townspeople, temple guard, teachers, young Jesus, and Mary.
 */

export const ARC1_DIALOGUE = {
  // Townspeople — post-discovery nodes gate on found_jesus_in_temple via conditionFail
  townsperson_1: {
    start: {
      condition: { flag: 'found_jesus_in_temple', op: 'eq', value: true },
      conditionFail: 'default',
      speaker: 'Townsperson',
      text: 'Did you hear? They found the boy in the Temple! He was teaching the elders!',
      next: null,
    },
    default: {
      speaker: 'Townsperson',
      text: 'Welcome to Jerusalem! The Passover festival draws many visitors.',
      next: null,
    },
  },

  townsperson_2: {
    start: {
      condition: { flag: 'found_jesus_in_temple', op: 'eq', value: true },
      conditionFail: 'default',
      speaker: 'Merchant',
      text: 'That boy in the Temple — his parents came for him. What a relief!',
      next: null,
    },
    default: {
      speaker: 'Merchant',
      text: 'Fresh bread and fish! Get your Passover supplies here!',
      next: null,
    },
  },

  townsperson_3: {
    start: {
      condition: { flag: 'found_jesus_in_temple', op: 'eq', value: true },
      conditionFail: 'default',
      speaker: 'Townsperson',
      text: 'So the rumor was true! The boy was in the Temple all along, amazing the teachers.',
      next: null,
    },
    default: {
      speaker: 'Townsperson',
      text: 'Have you been to the Temple? They say a young boy has been speaking with the teachers for days!',
      effects: [{ type: 'setFlag', flag: 'heard_about_temple_boy', value: true }],
      next: null,
    },
  },

  // Unique dialogue for townsperson_4 and townsperson_5 (previously reused keys — P5.27)
  townsperson_4: {
    start: {
      condition: { flag: 'found_jesus_in_temple', op: 'eq', value: true },
      conditionFail: 'default',
      speaker: 'Elder',
      text: 'A boy of such wisdom... I wonder what he will become when he is grown.',
      next: null,
    },
    default: {
      speaker: 'Elder',
      text: 'Jerusalem is the heart of our faith. The Temple has stood for generations.',
      next: null,
    },
  },

  townsperson_5: {
    start: {
      condition: { flag: 'found_jesus_in_temple', op: 'eq', value: true },
      conditionFail: 'default',
      speaker: 'Woman',
      text: 'His poor mother was so worried. Thank the Lord they found him safe.',
      next: null,
    },
    default: {
      speaker: 'Woman',
      text: 'The festival crowds are thick this year. Mind your belongings.',
      next: null,
    },
  },

  // Temple guard — post-discovery branch via conditionFail
  temple_guard: {
    start: {
      condition: { flag: 'found_jesus_in_temple', op: 'eq', value: true },
      conditionFail: 'default',
      speaker: 'Temple Guard',
      text: 'You found the boy? His family must be relieved. The teachers will miss him — he was remarkable.',
      next: null,
    },
    default: {
      speaker: 'Temple Guard',
      text: 'The Temple courts are open to all who seek wisdom.',
      choices: [
        { text: 'Have you seen a young boy?', next: 'seen_boy' },
        { text: 'Thank you.', next: null },
      ],
    },
    seen_boy: {
      speaker: 'Temple Guard',
      text: 'A boy? Yes, there is a remarkable youth in the inner court. He has been speaking with the teachers for days!',
      effects: [{ type: 'setFlag', flag: 'talked_to_temple_guard', value: true }],
      next: null,
    },
  },

  // Temple teachers — post-discovery variants
  temple_teacher_1: {
    start: {
      condition: { flag: 'found_jesus_in_temple', op: 'eq', value: true },
      conditionFail: 'default',
      speaker: 'Teacher',
      text: 'I have never met a child like him. He understood things we have debated for years.',
      next: null,
    },
    default: {
      speaker: 'Teacher',
      text: 'This boy amazes us all. His understanding of the Scriptures is beyond his years.',
      next: null,
    },
  },

  temple_teacher_2: {
    start: {
      condition: { flag: 'found_jesus_in_temple', op: 'eq', value: true },
      conditionFail: 'default',
      speaker: 'Teacher',
      text: 'That young boy — he left with his parents. I pray we will hear from him again someday.',
      next: null,
    },
    default: {
      speaker: 'Teacher',
      text: 'We have never seen such wisdom in one so young. He answers every question with insight.',
      next: null,
    },
  },

  // Young Jesus - triggers the finding cutscene
  young_jesus: {
    start: {
      speaker: 'Young Jesus',
      text: 'Did you not know that I must be in my Father\'s house?',
      effects: [{ type: 'setFlag', flag: 'found_jesus_in_temple', value: true }],
      next: 'mary_response',
    },
    mary_response: {
      speaker: 'Mary',
      text: 'Son, why have you treated us so? Your father and I have been searching for you anxiously!',
      next: 'jesus_reply',
    },
    jesus_reply: {
      speaker: 'Young Jesus',
      text: 'Why were you looking for me? Did you not know I must be about my Father\'s business?',
      next: 'narrator',
    },
    narrator: {
      speaker: '',
      text: 'And Jesus went home with them to Nazareth, and was obedient to them. And he grew in wisdom and stature.',
      effects: [{ type: 'setFlag', flag: 'arc1_complete', value: true }],
      next: null,
    },
  },

  // Arc 1→2 transition cutscene narration (plays after arc1_complete on black screen)
  arc1_transition: {
    start: {
      speaker: '',
      text: 'The years passed in Nazareth. Jesus grew in wisdom and stature, and in favor with God and man.',
      next: 'calling',
    },
    calling: {
      speaker: '',
      text: 'Now, in the fifteenth year of Tiberius Caesar, the word of God came to John in the wilderness...',
      next: null,
    },
  },

  // Mary/Joseph searching dialogue — post-discovery variant
  mary_worried: {
    start: {
      condition: { flag: 'found_jesus_in_temple', op: 'eq', value: true },
      conditionFail: 'default',
      speaker: 'Mary',
      text: 'Thank God we found him. Let us go home to Nazareth.',
      next: null,
    },
    default: {
      speaker: 'Mary',
      text: 'Where could Jesus be? We must search Jerusalem. Perhaps someone at the Temple has seen him.',
      next: null,
    },
  },
};
