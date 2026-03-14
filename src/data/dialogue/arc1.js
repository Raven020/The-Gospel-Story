/**
 * Dialogue trees for Arc 1 - "The Boy Jesus" (Luke 2:41-52).
 * Covers townspeople, temple guard, teachers, young Jesus, and Mary.
 */

export const ARC1_DIALOGUE = {
  // Townspeople
  townsperson_1: {
    start: {
      speaker: 'Townsperson',
      text: 'Welcome to Jerusalem! The Passover festival draws many visitors.',
      next: null,
    },
  },

  townsperson_2: {
    start: {
      speaker: 'Merchant',
      text: 'Fresh bread and fish! Get your Passover supplies here!',
      next: null,
    },
  },

  townsperson_3: {
    start: {
      speaker: 'Townsperson',
      text: 'Have you been to the Temple? They say a young boy has been speaking with the teachers for days!',
      effects: [{ type: 'setFlag', flag: 'heard_about_temple_boy', value: true }],
      next: null,
    },
  },

  // Temple guard - conditional dialogue based on quest flags
  temple_guard: {
    start: {
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

  // Temple teachers
  temple_teacher_1: {
    start: {
      speaker: 'Teacher',
      text: 'This boy amazes us all. His understanding of the Scriptures is beyond his years.',
      next: null,
    },
  },

  temple_teacher_2: {
    start: {
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

  // Mary/Joseph searching dialogue
  mary_worried: {
    start: {
      speaker: 'Mary',
      text: 'Where could Jesus be? We must search Jerusalem. Perhaps someone at the Temple has seen him.',
      next: null,
    },
  },
};
