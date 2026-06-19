from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import asyncio
from engine import generate_story_turn

app = FastAPI(title="PromptQuest Backend Engine")

# Allow local React development server to communicate with the Python backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TurnRequest(BaseModel):
    previous_state: Optional[Dict[str, Any]] = None
    player_action: str
    theme: Optional[str] = "cyberpunk"

@app.get("/")
def read_root():
    return {"status": "PromptQuest Engine Online"}

@app.post("/game/turn")
async def play_turn(request: TurnRequest):
    try:
        # Run the engine with a 30 second timeout
        new_state = await asyncio.wait_for(
            asyncio.to_thread(
                generate_story_turn,
                request.previous_state,
                request.player_action,
                request.theme
            ),
            timeout=60.0
        )
        return new_state
    except asyncio.TimeoutError:
        print("\n" + "="*50)
        print("⏱️  API RESPONSE TIMEOUT (60s)")
        print("="*50 + "\n")
        raise HTTPException(status_code=504, detail="AI response timed out — try again")
    except Exception as e:
        import traceback
        print("\n" + "="*50)
        print("🚨 CRITICAL BACKEND ERROR 🚨")
        traceback.print_exc()
        print("="*50 + "\n")
        raise HTTPException(status_code=500, detail=str(e))