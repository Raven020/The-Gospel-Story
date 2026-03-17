/**
 * Dialogue trees for Arc 3 - "Calling of the Disciples."
 * Covers fishermen recruitment at Galilee, Capernaum townspeople,
 * and disciple recruitment events for Peter, Andrew, James, John,
 * Philip, Nathanael, and Matthew.
 */

export const ARC3_DIALOGUE = {
  // --- Galilee arrival proclamation (Matthew 4:12-17) ---
  galilee_arrival: {
    start: {
      speaker: '',
      text: 'When Jesus heard that John had been arrested, he withdrew into Galilee and settled by the sea.',
      next: 'proclamation',
    },
    proclamation: {
      speaker: 'Jesus',
      text: 'Repent, for the kingdom of heaven is at hand.',
      next: 'narrator_end',
    },
    narrator_end: {
      speaker: '',
      text: 'And he went throughout all Galilee, teaching and proclaiming the good news of the kingdom.',
      next: null,
    },
  },

  // --- Fishermen at the Sea of Galilee ---

  peter_recruit: {
    start: {
      speaker: 'Simon Peter',
      text: 'We have toiled all night and caught nothing... The nets are empty. There are no fish.',
      choices: [
        { text: 'Put out into the deep water and let down your nets for a catch.', next: 'peter_doubt' },
        { text: 'How long have you been out?', next: 'fishing' },
      ],
    },
    fishing: {
      speaker: 'Simon Peter',
      text: 'All night, Teacher. Every spot we know. The sea gave us nothing. We are finished for the day.',
      next: null,
    },
    peter_doubt: {
      speaker: 'Simon Peter',
      text: 'Master... we have worked through the night and caught nothing. But at your word, I will let down the nets.',
      next: 'miracle_cast',
    },
    miracle_cast: {
      speaker: '',
      text: 'Simon and his brother Andrew rowed out from the dock. When they let down the nets, the water churned and boiled with fish — so many that the nets began to tear.',
      next: 'call_partners',
    },
    call_partners: {
      speaker: 'Simon Peter',
      text: 'James! John! Come quickly — bring the other boat! The nets are breaking!',
      next: 'boats_filled',
    },
    boats_filled: {
      speaker: '',
      text: 'Both boats came. Both were filled to the point of sinking. Everyone on the shore stood watching, astonished.',
      next: 'peter_falls',
    },
    peter_falls: {
      speaker: 'Simon Peter',
      text: 'Depart from me, Lord, for I am a sinful man!',
      next: 'jesus_calls',
    },
    jesus_calls: {
      speaker: 'Jesus',
      text: 'Do not be afraid, Simon. From now on you will catch men.',
      next: 'peter_response',
    },
    peter_response: {
      speaker: 'Simon Peter',
      text: '...\n\nThey brought the boats to land, left everything, and followed him.',
      effects: [
        { type: 'recruitMember', memberId: 'peter' },
        { type: 'setFlag', flag: 'recruited_peter', value: true },
        { type: 'setFlag', flag: 'arc3_started', value: true },
      ],
      next: null,
    },
  },

  andrew_recruit: {
    start: {
      speaker: 'Andrew',
      text: 'My brother Simon speaks of you. Are you truly the one John spoke of?',
      choices: [
        { text: 'Come and see.', next: 'andrew_response' },
        { text: 'Tell me about John.', next: 'about_john' },
      ],
    },
    about_john: {
      speaker: 'Andrew',
      text: 'John the Baptist. He said one greater than him was coming. I was his disciple.',
      next: null,
    },
    andrew_response: {
      speaker: 'Andrew',
      text: 'We have found the Messiah! I will follow you, Teacher.',
      effects: [
        { type: 'recruitMember', memberId: 'andrew' },
        { type: 'setFlag', flag: 'recruited_andrew', value: true },
      ],
      next: null,
    },
  },

  james_recruit: {
    start: {
      speaker: 'James',
      text: 'We are mending our nets. Our father Zebedee needs us here.',
      choices: [
        { text: 'Come, follow me.', next: 'james_response' },
        { text: 'Your nets look worn.', next: 'nets' },
      ],
    },
    nets: {
      speaker: 'James',
      text: 'A fisherman\'s life is hard work. These nets have seen many seasons.',
      next: null,
    },
    james_response: {
      speaker: 'James',
      text: 'There is something about you... Yes. I will come.',
      effects: [
        { type: 'recruitMember', memberId: 'james' },
        { type: 'setFlag', flag: 'recruited_james', value: true },
      ],
      next: null,
    },
  },

  john_disciple_recruit: {
    start: {
      speaker: 'John',
      text: 'My brother James and I are sons of thunder! Where he goes, I follow.',
      choices: [
        { text: 'Will you follow me as well?', next: 'john_response' },
        { text: 'Sons of thunder?', next: 'thunder' },
      ],
    },
    thunder: {
      speaker: 'John',
      text: 'Ha! Our father gave us that name. We are... passionate.',
      next: null,
    },
    john_response: {
      speaker: 'John',
      text: 'With all my heart, Teacher. I will be with you always.',
      effects: [
        { type: 'recruitMember', memberId: 'john' },
        { type: 'setFlag', flag: 'recruited_john', value: true },
      ],
      next: null,
    },
  },

  // --- Capernaum recruitment ---

  philip_recruit: {
    start: {
      speaker: 'Philip',
      text: 'I am from Bethsaida, the same town as Peter and Andrew. They told me about you.',
      choices: [
        { text: 'Follow me.', next: 'philip_response' },
        { text: 'What did they say?', next: 'what_said' },
      ],
    },
    what_said: {
      speaker: 'Philip',
      text: 'That you are the one Moses wrote about! The one the prophets foretold!',
      next: null,
    },
    philip_response: {
      speaker: 'Philip',
      text: 'I must tell Nathanael! We have found him!',
      effects: [
        { type: 'recruitMember', memberId: 'philip' },
        { type: 'setFlag', flag: 'recruited_philip', value: true },
      ],
      next: null,
    },
  },

  nathanael_recruit: {
    start: {
      speaker: 'Nathanael',
      text: 'Can anything good come out of Nazareth?',
      choices: [
        { text: 'Come and see.', next: 'nathanael_response' },
        { text: 'You speak plainly.', next: 'plainly' },
      ],
    },
    plainly: {
      speaker: 'Nathanael',
      text: 'I say what I think. Philip says you are special, but I have doubts.',
      next: null,
    },
    nathanael_response: {
      speaker: 'Jesus',
      text: 'Before Philip called you, I saw you under the fig tree.',
      next: 'nathanael_amazed',
    },
    nathanael_amazed: {
      speaker: 'Nathanael',
      text: 'Rabbi! You are the Son of God! You are the King of Israel!',
      effects: [
        { type: 'recruitMember', memberId: 'nathanael' },
        { type: 'setFlag', flag: 'recruited_nathanael', value: true },
      ],
      next: null,
    },
  },

  matthew_recruit: {
    start: {
      speaker: 'Matthew',
      text: 'I am Levi the tax collector. Most people avoid me. Why do you approach?',
      choices: [
        { text: 'Follow me.', next: 'matthew_response' },
        { text: 'Why do they avoid you?', next: 'avoid' },
      ],
    },
    avoid: {
      speaker: 'Matthew',
      text: 'Tax collectors are despised. We work for Rome. But I am tired of this life.',
      next: null,
    },
    matthew_response: {
      speaker: 'Matthew',
      text: 'You would have me? A tax collector? ... I will leave everything. I will follow you.',
      effects: [
        { type: 'recruitMember', memberId: 'matthew' },
        { type: 'setFlag', flag: 'recruited_matthew', value: true },
      ],
      next: null,
    },
  },

  // --- Mountain of Choosing (Luke 6:12-16) ---

  mountain_choosing: {
    start: {
      speaker: '',
      text: 'Jesus went up on the mountain to pray, and spent the night in prayer to God.',
      next: 'calling',
    },
    calling: {
      speaker: 'Jesus',
      text: 'You have been chosen. From among all who follow, I have called you to be my apostles.',
      next: 'commission',
    },
    commission: {
      speaker: 'Jesus',
      text: 'Go and proclaim the kingdom of God. Heal the sick, raise the dead, cast out demons.',
      effects: [{ type: 'setFlag', flag: 'arc3_complete', value: true }],
      next: null,
    },
  },

  // Arc 3 ending narration (plays after mountain commission)
  arc3_ending: {
    start: {
      speaker: '',
      text: 'And so the twelve were chosen. Together they would walk the roads of Galilee, proclaiming the kingdom of God.',
      next: 'closing',
    },
    closing: {
      speaker: '',
      text: 'The journey had only begun. Greater trials and wonders lay ahead for Jesus and his disciples.',
      next: null,
    },
  },

  // --- Capernaum townspeople ---

  townsperson_cap_1: {
    start: {
      speaker: 'Townsperson',
      text: 'Capernaum is a busy town. Fishermen, traders, and tax collectors all pass through.',
      next: null,
    },
  },

  townsperson_cap_2: {
    start: {
      speaker: 'Elder',
      text: 'A new teacher has arrived from Nazareth. Some say he heals the sick.',
      next: null,
    },
  },
};
