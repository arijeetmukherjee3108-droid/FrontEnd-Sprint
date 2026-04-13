# 🎨 ArtRoast Gallery

An intelligent, AI-powered art gallery that lets you experience classic masterpieces through the hilariously unfiltered eyes of different AI personas. Built for the AI-Assisted Frontend API Sprint.

## 🌟 The Concept

ArtRoast Gallery takes stunning, high-definition public domain artworks from the Art Institute of Chicago and feeds their metadata (and images, conceptually) into the blazing-fast Groq LPU inference engine. 

Instead of a standard, dry museum description, users can choose one of four distinct AI "Art Critics" to roast, review, or analyze the artwork:
*   🎩 **Monsieur Beaumont:** A snooty, dramatic 19th-century Parisian critic.
*   📱 **Zara:** A Gen-Z TikTok reviewer who rates everything on a "vibe check".
*   🕵️ **Agent X:** A conspiracy theorist finding hidden messages everywhere.
*   👶 **Little Timmy:** A 5-year-old taking things very literally.

Oh, and using the Web Speech API, they will read their reviews aloud to you! 🔊

## 🚀 Built With

*   **Frontend Framework:** React + Vite
*   **Data Source (The Fetch):** [Art Institute of Chicago API](https://api.artic.edu/docs/) (Keyless, public domain masterworks).
*   **AI Engine (The Prompt):** [Groq Cloud](https://console.groq.com/docs/openai) running `llama-3.3-70b-versatile` for near-instant text generation.
*   **Voice:** Web Speech API (`SpeechSynthesis`)
*   **Styling:** Vanilla CSS (Glassmorphism, CSS Variables, Keyframe Animations)
*   **Deployment:** Vercel / Netlify

## ✨ Features

*   **Dynamic Prompt Engineering:** Four distinct, highly crafted system prompts that completely change the personality and tone of the AI response.
*   **Live Search & Randomization:** Search the museum's massive public domain archive or pull random sets of paintings.
*   **Premium UI/UX:** A stunning dark mode design with gold accents, smooth hover animations, and glassmorphic modal overlays.
*   **Skeleton Loading States:** Smooth, animated placeholders while images and AI critiques load.
*   **Image Fallbacks:** Uses the API's low-quality image placeholders (`lqip`) via base64 encoded data strings so something is always visible, even if the high-res IIIF images fail.
*   **Text-to-Speech:** Listen to the AI personas read their reviews out loud with adjusted pitch and speeds tailored to their personalities.

## 🛠️ Local Development

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file based on `.env.example`:
    ```bash
    cp .env.example .env
    ```
4.  Add your [Groq API Key](https://console.groq.com/keys) to the `.env` file.
5.  Start the development server:
    ```bash
    npm run dev
    ```

## ⚠️ Hackathon Note regarding `.env`
Per the hackathon rules: *"Because we do not have time to build secure backends, you may temporarily store your Groq API key in your frontend environment variables (.env). You must revoke/delete your key immediately after judging!"*

*Note: In a production environment, API keys should NEVER be exposed to the client. They should be stored in a backend server or serverless function.*
