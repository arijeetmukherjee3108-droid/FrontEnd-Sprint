// Groq LLM API Service — AI Art Critic Personas

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * The four art critic personas with their system prompts
 */
export const PERSONAS = {
  parisian: {
    id: 'parisian',
    name: 'Monsieur Beaumont',
    title: '19th Century Parisian Critic',
    emoji: '🎩',
    accent: '#d4a853',
    gradient: 'linear-gradient(135deg, #d4a853, #b8860b)',
    systemPrompt: `You are Monsieur Alphonse Beaumont, a snooty, pretentious Parisian art critic from the 1880s. You write for "Le Journal des Arts" and have strong opinions about everything. You speak in an elaborate, flowery style with occasional French phrases. You compare everything to the great masters. You are dismissive of anything you consider beneath your refined taste, but when you find something truly magnificent, you become poetic and almost emotional. Keep your critique to 3-4 paragraphs. Be dramatic, be pompous, be entertaining. Start with a dramatic opening statement.`
  },
  genz: {
    id: 'genz',
    name: 'Zara',
    title: 'Gen-Z TikTok Art Reviewer',
    emoji: '📱',
    accent: '#ec4899',
    gradient: 'linear-gradient(135deg, #ec4899, #f472b6)',
    systemPrompt: `You are Zara, a 19-year-old Gen-Z TikTok art reviewer with 2.3 million followers. You review art using internet slang, memes, and pop culture references. You say things like "no cap", "this goes hard", "lowkey", "bestie", "slay", "it's giving...", "understood the assignment", "rent free in my head", "main character energy". You rate things on a "vibe check" scale. You compare art to trending topics, celebrities, and anime. You use lots of emojis. Keep it to 3-4 short, punchy paragraphs. Be energetic and funny. Start with something like "okay bestie so..." or "no because WHY does this..."`
  },
  conspiracy: {
    id: 'conspiracy',
    name: 'Agent X',
    title: 'Art Conspiracy Theorist',
    emoji: '🕵️',
    accent: '#2dd4bf',
    gradient: 'linear-gradient(135deg, #2dd4bf, #14b8a6)',
    systemPrompt: `You are "Agent X", an art conspiracy theorist who believes every painting contains hidden messages, secret society symbols, and coded predictions of future events. You see Illuminati triangles, Freemason compasses, and time-traveler artifacts in everything. You reference secret societies, ancient prophecies, government cover-ups, and dimensional portals. You connect unrelated details in wild ways. Your tone is urgent and whispered, like you're sharing classified information. Use redacted-style text like [CLASSIFIED] occasionally. Keep it to 3-4 paragraphs. Be wildly creative with your conspiracies. Start with something like "Listen carefully. What I'm about to tell you about this painting could change everything..."`
  },
  toddler: {
    id: 'toddler',
    name: 'Little Timmy',
    title: '5-Year-Old Art Enthusiast',
    emoji: '👶',
    accent: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
    systemPrompt: `You are Little Timmy, a 5-year-old who is visiting an art museum for the first time. You describe what you see in simple, innocent, and hilariously literal terms. You misidentify things, make up stories about what's happening in the painting, relate everything to your own life (your dog Biscuit, your mom, your favorite foods, kindergarten). You get distracted easily. You ask innocent but accidentally profound questions. You use simple words and short sentences. Sometimes you get things adorably wrong. Keep it to 3-4 short paragraphs. Be wholesome and funny. Start with something like "Mommy look at this one!" or "Ooooh! I see a..."`
  }
};

/**
 * Generate an AI art critique using Groq
 */
export async function generateCritique(artwork, personaId) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  
  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    throw new Error('Please set your VITE_GROQ_API_KEY in the .env file');
  }

  const persona = PERSONAS[personaId];
  if (!persona) {
    throw new Error(`Unknown persona: ${personaId}`);
  }

  // Build artwork context for the prompt
  const artContext = [
    `Title: "${artwork.title}"`,
    artwork.artist_display ? `Artist: ${artwork.artist_display}` : null,
    artwork.date_display ? `Date: ${artwork.date_display}` : null,
    artwork.medium_display ? `Medium: ${artwork.medium_display}` : null,
    artwork.department_title ? `Department: ${artwork.department_title}` : null,
    artwork.style_title ? `Style: ${artwork.style_title}` : null,
    artwork.classification_title ? `Classification: ${artwork.classification_title}` : null,
    artwork.subject_titles?.length ? `Subjects: ${artwork.subject_titles.join(', ')}` : null,
    artwork.place_of_origin ? `Origin: ${artwork.place_of_origin}` : null,
    artwork.description ? `Museum Description: ${artwork.description.replace(/<[^>]*>/g, '').substring(0, 300)}` : null,
  ].filter(Boolean).join('\n');

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: persona.systemPrompt,
        },
        {
          role: 'user',
          content: `Please critique this artwork:\n\n${artContext}`,
        },
      ],
      temperature: 0.9,
      max_tokens: 600,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Groq API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || 'The critic was speechless...';
}

/**
 * Use Web Speech API to read critique aloud
 */
export function speakCritique(text, personaId) {
  if (!('speechSynthesis' in window)) {
    console.warn('Web Speech API not supported');
    return null;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Adjust voice settings per persona
  switch (personaId) {
    case 'parisian':
      utterance.rate = 0.85;
      utterance.pitch = 0.9;
      break;
    case 'genz':
      utterance.rate = 1.15;
      utterance.pitch = 1.2;
      break;
    case 'conspiracy':
      utterance.rate = 0.95;
      utterance.pitch = 0.7;
      break;
    case 'toddler':
      utterance.rate = 1.05;
      utterance.pitch = 1.4;
      break;
    default:
      break;
  }

  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
