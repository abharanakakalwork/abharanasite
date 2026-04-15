export type Category = "All" | "Yoga" | "Sound Healing" | "Feminine Energy" | "Retreats";

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: Exclude<Category, "All">;
  image: string;
  readTime: string;
  content: {
    intro: string;
    sections: { heading: string; body: string }[];
    pullQuote?: string;
    closing: string;
  };
}

export const blogPosts: BlogPost[] = [
  {
    slug: "the-language-of-the-body",
    title: "The Language of the Body",
    excerpt:
      "When we learn to listen deeply, the body becomes our greatest teacher — whispering truths our mind has long overlooked.",
    date: "March 18, 2026",
    category: "Yoga",
    image: "https://abharanakakal.b-cdn.net/assets/within-yoga.png",
    readTime: "5 min read",
    content: {
      intro:
        "For years, I taught yoga the way it was handed to me — technique, alignment, breath. And while those things matter, something kept nagging at the edges of each class. There was a silence beneath the silence. A language I hadn't yet learned.",
      sections: [
        {
          heading: "Turning Inward",
          body: "The body is not a machine to be optimised. It is a living, breathing archive of every emotion, memory, and moment of grace we have ever passed through. When we slow down enough to truly listen — not to fix or to force, but simply to hear — something extraordinary happens. The body exhales. It softens. It begins to tell the truth.",
        },
        {
          heading: "Sensation as Compass",
          body: "In yoga, we often speak of prana — the life force that moves through us. I have come to understand prana less as an abstract concept and more as the living intelligence of sensation itself. When a hip releases in pigeon pose, that is prana speaking. When the chest floods with feeling in a backbend, that is prana saying: yes, here, feel this.",
        },
        {
          heading: "A New Kind of Practice",
          body: "Practices grounded in somatic awareness ask us to arrive before we perform. To sit within the body before we ask it to carry us. To feel the floor beneath our feet and the air moving through our nostrils as if for the very first time. From this place of radical presence, the yoga truly begins.",
        },
      ],
      pullQuote:
        "The pose is never the point. The point is who you are becoming inside the pose.",
      closing:
        "If you are drawn to a practice that honours the full spectrum of your inner life, I would love to walk that path with you. Our next retreat holds space for exactly this kind of deep listening.",
    },
  },
  {
    slug: "sounds-that-heal-what-words-cannot",
    title: "Sounds That Heal What Words Cannot",
    excerpt:
      "Sound is the oldest medicine. Before language, before thought, there was vibration — and it remembered the way home.",
    date: "March 5, 2026",
    category: "Sound Healing",
    image: "https://abharanakakal.b-cdn.net/assets/within-sound.png",
    readTime: "6 min read",
    content: {
      intro:
        "I discovered sound healing during a period of my life when words had simply run out. I had done the therapy, the journalling, the conversations. But a grief lived in my chest that language couldn't reach. Then I lay beneath a singing bowl, and something ancient opened.",
      sections: [
        {
          heading: "Vibration and the Nervous System",
          body: "Sound moves through the body at the cellular level. Sustained tonal frequencies have been shown to shift brainwave states from beta — our alert, analytical mind — into theta and delta, the landscapes of deep rest and inner vision. This is not magic. This is physics, working in service of healing.",
        },
        {
          heading: "The Instruments I Work With",
          body: "I work with Himalayan singing bowls, crystal bowls, a shruti box, and my own voice. Each instrument carries its own quality of tone. The Himalayan bowls are grounding — they call the body back into the earth. The crystal bowls open the upper centres. The voice holds the entire field together.",
        },
        {
          heading: "What Happens in a Session",
          body: "Each session is different, because each person arrives different. Some experience synaesthetic imagery. Some release emotion they didn't know was waiting. Others simply rest so deeply they emerge renewed. There is no wrong experience. What arrives, belongs.",
        },
      ],
      pullQuote:
        "Sound doesn't ask the mind for permission. It goes directly to where the healing needs to happen.",
      closing:
        "If you are curious about what a sound healing session might unlock in you, I offer both individual sessions and immersive sound journeys as part of our retreats. Every note played is an invitation to come home.",
    },
  },
  {
    slug: "reclaiming-the-sacred-feminine",
    title: "Reclaiming the Sacred Feminine",
    excerpt:
      "We were not built to be efficient. We were built to be cyclical, intuitive, soft, and wild all at once.",
    date: "February 20, 2026",
    category: "Feminine Energy",
    image: "https://abharanakakal.b-cdn.net/assets/within-feminine.png",
    readTime: "7 min read",
    content: {
      intro:
        "There is a particular kind of exhaustion that comes from pretending to be linear in a world that rewards it. Women especially — though certainly not exclusively — know this fatigue. It is the tiredness of performing productivity when the body is asking for stillness. Of smiling through the descent when what is needed is the surrender.",
      sections: [
        {
          heading: "The Cycle as Wisdom",
          body: "For much of my adult life, I fought my own rhythms. My winter was an inconvenience. My inner autumn was something to medicate away. It wasn't until I began tracking my cycle alongside my practice that I realised I wasn't broken — I was simply seasonal. And seasons, when honoured, are extraordinarily intelligent.",
        },
        {
          heading: "Shakti — The Intelligence of Creation",
          body: "Feminine energy — Shakti — is not passive. It is the very force of creation itself. It is the intelligence that grows cells and tides and seasons without effort. To reclaim this energy is not to become soft. It is to become undeniable.",
        },
        {
          heading: "Practices That Honour the Feminine",
          body: "Hip-openers. Yin holds. Restorative inversions. Womb meditations. Moon salutations. These are not lesser practices — they are perhaps the more radical ones. In a world that prizes speed and force, choosing slowness and receptivity is an act of quiet revolution.",
        },
      ],
      pullQuote:
        "Rest is not the opposite of productivity. It is the very soil in which something new can grow.",
      closing:
        "Our women's retreats create a container specifically for this kind of reclamation. A space where the feminine is not just tolerated but celebrated, studied, and deepened. Come as you are.",
    },
  },
  {
    slug: "inside-our-sri-lanka-retreat",
    title: "Inside Our Sri Lanka Retreat",
    excerpt:
      "Twelve women. Seven days. One island. What happened in that sacred container will stay with us forever.",
    date: "February 8, 2026",
    category: "Retreats",
    image: "https://abharanakakal.b-cdn.net/assets/within-retreat.png",
    readTime: "8 min read",
    content: {
      intro:
        "Sri Lanka arrived like a dream I hadn't known I was waiting for. The temple bells before dawn. The scent of frangipani and ocean salt. Twelve women gathering around a flame on the first evening, not yet knowing how much they would transform each other.",
      sections: [
        {
          heading: "The Container We Built",
          body: "A retreat is a container — a held space that allows something to dissolve and something else to emerge. The container we built in Sri Lanka was made of morning practice, shared meals, afternoon workshops, and the extraordinary intimacy that ripens between women when they are given permission to be real with one another.",
        },
        {
          heading: "What We Practiced",
          body: "Each morning began before sunrise, with pranayama on the terrace as the sky shifted from ink to gold. The asana practice that followed was rooted in feminine yoga — slow, somatic, responsive. Afternoons were for sound healing, journalling, sacred feminine workshops, and the kind of unhurried rest the body rarely allows itself otherwise.",
        },
        {
          heading: "A Moment That Stayed With Me",
          body: "On the fourth evening, one of the women — who had arrived guarded, quiet, barely making eye contact — stood up during our circle and began to sing. Spontaneously. Unplanned. The room gathered around her in silence. When she finished, no one spoke. We didn't need to. Some moments are complete exactly as they are.",
        },
      ],
      pullQuote:
        "A retreat doesn't change your life. It reveals the life that was always waiting for you.",
      closing:
        "The next retreat is forming now. If something in you is ready — even if the rest of you isn't sure — I hope you'll trust that readiness. Details below.",
    },
  },
  {
    slug: "morning-rituals-that-anchor-the-day",
    title: "Morning Rituals That Anchor the Day",
    excerpt:
      "The first hour of the morning is a conversation with your own soul. What are you saying?",
    date: "January 25, 2026",
    category: "Yoga",
    image: "https://abharanakakal.b-cdn.net/assets/within-inner.png",
    readTime: "4 min read",
    content: {
      intro:
        "I am not a natural morning person. For most of my twenties, mornings were something to survive. Coffee first, consciousness later. It was only when I began to meet each morning with deliberate slowness — before the phone, before the noise — that the days started to feel different. Rooted.",
      sections: [
        {
          heading: "The First Five Minutes",
          body: "Before I rise, I stay. Not scrolling, not planning — just feeling the quality of the morning around me. The light. The temperature. The texture of my own inner weather. This simple pause takes almost no time and completely reorients the day.",
        },
        {
          heading: "Movement as Medicine",
          body: "My morning practice is rarely vigorous. It is often as simple as ten minutes of gentle spinal movement, followed by seated pranayama, followed by whatever feels alive that day. On some mornings, that is a full practice. On others, it is simply pressing my palms together and breathing three times with intention.",
        },
        {
          heading: "The Ritual That Changed Everything",
          body: "Several years ago, I began keeping what I call a morning altar. A small space on my windowsill — a stone, a dried flower, a candle. Each morning I light the candle and sit with it for a few minutes. This practice, more than any asana sequence, has been the root system of my days.",
        },
      ],
      pullQuote:
        "A morning ritual is not a rule. It is a love letter to yourself, written first thing, before the world arrives.",
      closing:
        "I share practices like these in our online classes and in the retreat container. If you want support building your own morning rhythm, come join us.",
    },
  },
  {
    slug: "the-moon-and-the-practice",
    title: "The Moon and the Practice",
    excerpt:
      "She waxes, she wanes, she disappears — and then, faithfully, she returns. The moon has much to teach us about trusting the dark.",
    date: "January 10, 2026",
    category: "Feminine Energy",
    image: "https://abharanakakal.b-cdn.net/assets/within-moon.png",
    readTime: "5 min read",
    content: {
      intro:
        "I began tracking the moon almost accidentally — a friend mentioned it, I downloaded an app, and then one full moon I laid out my mat under the open sky and did something I had never done before. I moved not from a sequence I had planned, but from whatever the moonlight seemed to be asking of me. Something fundamental shifted that evening.",
      sections: [
        {
          heading: "The New Moon as Beginning",
          body: "The new moon is the invitation to plant. To name what you are calling in. To sit in the dark and let your intentions settle like seeds into soil. In practice, the new moon calls for yin yoga, restorative postures, and long, slow exhales. It asks for internality.",
        },
        {
          heading: "The Full Moon as Fullness",
          body: "The full moon is peak energy — expansion, illumination, release. It is the time to move, to celebrate, to flow freely. Moon salutations are particularly beautiful at the full moon, winding and cooling rather than heating and pushing. The full moon asks you to be seen.",
        },
        {
          heading: "Learning to Trust the Dark",
          body: "The waning moon — the slow return to dark — is the part we are least taught to honour. Yet it is here, in the gathering inward, that integration happens. The practice in this phase is surrender: releasing what the full moon illuminated, letting go without reaching.",
        },
      ],
      pullQuote:
        "The moon does not apologise for her darkness. She knows it is the only way back to the light.",
      closing:
        "We run full moon and new moon ceremonies online and within our retreats. These are open circles — come as you are, wherever you are in your own cycle.",
    },
  },
];
