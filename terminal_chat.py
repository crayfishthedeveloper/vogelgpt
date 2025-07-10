# terminal_chat.py
from chatbot import Chatbot

def main():
    bot = Chatbot()
    print("AI Chatbot (type 'exit' to quit, 'reset' to clear history)")
    while True:
        user_input = input("You: ")
        if user_input.lower() == "exit":
            break
        if user_input.lower() == "reset":
            bot.reset()
            print("Chat history cleared.")
            continue
        response = bot.ask(user_input)
        print("Bot:", response)

if __name__ == "__main__":
    main()
