# web_chat.py
from flask import Flask, render_template, request, jsonify
from chatbot import Chatbot

app = Flask(__name__)
bot = Chatbot(model="gpt-4o")  # or "gpt-3.5-turbo" if you prefer

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    user_message = request.json.get("message")
    response = bot.ask(user_message)
    return jsonify({"response": response})

if __name__ == "__main__":
    app.run(debug=True)
