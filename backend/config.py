import os
from dotenv import load_dotenv

load_dotenv()

NIM_API_KEY = os.getenv("NIM_API_KEY")
if not NIM_API_KEY:
    raise ValueError("NIM_API_KEY not set in .env")
