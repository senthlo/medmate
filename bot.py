from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes

# 🔑 Твой токен
TOKEN = "8217212355:AAHNpxagULlESucIQiXDJklCIVs1cV9Mq5s"

# 🌐 Ссылка на Web App
WEB_APP_URL = "https://senthlo.github.io/medmate/"

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [
        [InlineKeyboardButton("Открыть MedMate 🎮", web_app={"url": WEB_APP_URL})]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text(
        "Привет! 👋 Нажми кнопку ниже, чтобы открыть MedMate и начать подготовку к аккредитации:",
        reply_markup=reply_markup
    )

def main():
    app = ApplicationBuilder().token(TOKEN).build()
    app.add_handler(CommandHandler("start", start))

    print("✅ Бот запущен! Не закрывай это окно.")
    app.run_polling()  # 🚀 Без asyncio.run()

if __name__ == "__main__":
    main()
