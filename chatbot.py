# chatbot.py
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key)

class Chatbot:
    def __init__(self, model="gpt-4o"):
        self.model = model
        self.history = []

    def ask(self, user_message):
        self.history.append({"role": "user", "content": user_message})
        response = client.chat.completions.create(
            model=self.model,
            messages=self.history
        )
        ai_message = response.choices[0].message.content
        self.history.append({"role": "assistant", "content": ai_message})
        return ai_message

    def reset(self):
        self.history = []
