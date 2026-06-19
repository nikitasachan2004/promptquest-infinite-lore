# PromptQuest: Infinite Lore

PromptQuest: Infinite Lore is a cinematic AI text-adventure experience built with a React terminal-style frontend and a FastAPI backend. Players drop into a custom scenario, choose a tone or genre, and let an AI game master generate each story turn with branching choices, ASCII art, health changes, and inventory updates.

## Why This Project Stands Out

- Custom scenario input instead of a fixed story start
- AI-generated branching narrative with three distinct actions every turn
- Retro-futurist terminal UI with glitch effects, scanlines, biome-aware backgrounds, and typewriter pacing
- Stateful gameplay with health, inventory, game-over conditions, and turn history
- Sound-driven interaction feedback for boot, typing, warnings, pickups, and choices
- FastAPI backend wired to NVIDIA NIM through the OpenAI-compatible SDK

## Tech Stack

- Frontend: React 18, Vite, Tailwind CSS
- Backend: FastAPI, Uvicorn, Pydantic
- AI runtime: NVIDIA NIM using the OpenAI-compatible `openai` Python SDK

## Project Structure

```text
infinite-lore/
├── backend/
│   ├── config.py
│   ├── engine.py
│   ├── main.py
│   ├── requirements.txt
│   └── schemas.py
├── frontend/
│   ├── package.json
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── index.css
│   │   └── main.jsx
│   └── vite.config.js
└── README.md
```

## Core Gameplay Flow

1. The app opens with a boot sequence and briefing screen.
2. The player writes a scenario prompt and optionally selects genre tags.
3. The frontend sends the turn request to the FastAPI backend.
4. The backend asks the AI model to return strict JSON describing the next scene.
5. The frontend normalizes that response into game state, updates health and inventory, and renders the result with terminal effects.
6. The player selects one of three follow-up actions and the loop continues.

## Features

### Frontend

- Full-screen immersive terminal interface
- Animated boot flow and scenario briefing screen
- Typewriter story reveal with skip support
- Terminal log that preserves recent turns
- Health HUD and inventory panel
- Dynamic backgrounds based on story biome keywords
- Web Audio API sound design for interaction feedback

### Backend

- FastAPI endpoint for generating story turns
- Retry logic for temporary AI rate limiting
- JSON cleanup and recovery when the model returns messy output
- Timeout protection around long-running AI calls
- CORS enabled for local frontend development

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/nikitasachan2004/promptquest-infinite-lore.git
cd promptquest-infinite-lore
```

### 2. Backend setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file inside `backend/`:

```env
NIM_API_KEY=your_nvidia_nim_api_key_here
```

Start the backend:

```bash
uvicorn main:app --reload
```

The backend runs at `http://127.0.0.1:8000`.

### 3. Frontend setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://127.0.0.1:5173`.

## API

### `POST /game/turn`

Generates the next story turn.

Example request body:

```json
{
  "previous_state": {
    "room_title": "SECTOR ZERO",
    "story_text": "The terminal boots. Static clears. You are here.",
    "options": ["Look around", "Check your gear", "Jack into the network"],
    "health": 100,
    "inventory": []
  },
  "player_action": "Inspect the neon alley for surveillance drones",
  "theme": "cyberpunk"
}
```

Example response shape:

```json
{
  "room_title": "GLASSWIRE ALLEY",
  "story_text": "A surveillance drone descends through the acid mist...",
  "ascii_art": "ASCII scene here",
  "theme_palette": "cyberpunk",
  "game_changes": {
    "health_delta": -10,
    "inventory_added": ["signal jammer"],
    "inventory_removed": []
  },
  "options": [
    "Use the signal jammer on the descending drone",
    "Dive into the service hatch under the flickering sign",
    "Call out to the figure watching from the fire escape"
  ],
  "is_game_over": false,
  "game_over_reason": ""
}
```

## Environment Notes

- The backend currently targets NVIDIA NIM at `https://integrate.api.nvidia.com/v1`.
- The default model in the code is `meta/llama-3.1-8b-instruct`.
- CORS is open for local development, which is convenient during prototyping but should be tightened for production.

## Development Notes

- Frontend entry point: [frontend/src/App.jsx](/Users/nikitasachan/Documents/CODING/infinite-lore/frontend/src/App.jsx)
- Backend API entry point: [backend/main.py](/Users/nikitasachan/Documents/CODING/infinite-lore/backend/main.py)
- Story generation engine: [backend/engine.py](/Users/nikitasachan/Documents/CODING/infinite-lore/backend/engine.py)

## Future Improvements

- Save/load runs so players can continue adventures later
- Multiple model backends or switchable providers
- Better prompt validation and richer theme support
- Production deploy configuration for frontend and API
- Automated tests for state normalization and response parsing

## License

No license file is currently included in the repository. Add one before distributing or accepting external contributions.
