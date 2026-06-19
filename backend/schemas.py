from pydantic import BaseModel, Field
from typing import List

class GameChanges(BaseModel):
    health_delta: int = Field(description="Change in player health. Negative for damage, positive for healing.")
    inventory_added: List[str] = Field(description="Items added to the player's inventory this turn.")
    inventory_removed: List[str] = Field(description="Items removed from the player's inventory this turn.")

class GameState(BaseModel):
    room_title: str = Field(description="Punchy, atmospheric name of the current location.")
    story_text: str = Field(description="Vivid description of what happens next and the environment.")
    ascii_art: str = Field(description="A beautiful 5 to 10 line retro ASCII art graphic depicting the scene.")
    theme_palette: str = Field(description="Visual style matching the genre. Must be exactly one of: 'cyberpunk'")
    game_changes: GameChanges = Field(description="Mechanical adjustments to health or equipment.")
    options: List[str] = Field(description="Exactly 3 creative and distinct branching paths for the user.")
    is_game_over: bool = Field(description="Set to True only if the player dies or completes their final goal.")
    game_over_reason: str = Field(description="A wrap-up sentence if the game ends. If the game is NOT over, return an empty string.")