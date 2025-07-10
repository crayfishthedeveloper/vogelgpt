# web_chat.py
import os
from flask import Flask, render_template, request, jsonify
from chatbot import Chatbot

app = Flask(__name__)
bot = Chatbot(model="gpt-4o")  # You can change the model if needed

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    user_message = request.json.get("message")
    response = bot.ask(user_message)
    return jsonify({"response": response})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))  # Use PORT env variable if set (Render sets this)
    app.run(host="0.0.0.0", port=port, debug=True)
