# Расписаня 1.1

Это простой Telegram-бот, написанный на Node.js с использованием библиотеки [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api).
Его предназначение - получение информации о дежурных)

## Команды

- **/start** — Приветствие пользователя.
- **/who_is_on_duty** — Определение дежурного в зависимости от текущей недели года.
- **/duty_list** — Получение списка дежурных.
- **/change_duty_list** — Изменение списка дежурных.

## Установка

1. **Клонируйте репозиторий:**
   ```bash
   git clone <URL_репозитория>
   cd telegram-bot
   ```
   
2. **Установите зависимости:**
   ### npm
   ```bash
   npm install
   ```
   ### pnpm
   ```bash
   pnpm install
   ```
   
   ### yarn
   ```bash
   yarn install
   ```

## Запуск бота
   ```bash
   node index.js
   ```

Бот будет работать в режиме polling, ожидая входящие сообщения.


