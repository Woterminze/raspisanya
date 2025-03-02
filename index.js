const TelegramBot = require('node-telegram-bot-api');

const token = 'ваш_токен';

const bot = new TelegramBot(token, { polling: true });

// Базовый список дежурных, в случае перезапуска бота значение сбросится на него
const dutyList = ['Юля', 'Булат', 'Яна'];

// Объект для хранения состояния бота
const commandsState = {};

// Функция для вычисления номера недели в году по стандарту ISO
function getISOWeekNumber(date) {
    const target = new Date(date);
    // Преобразуем день недели так, чтобы понедельник был 0, а воскресенье — 6
    const dayNr = (date.getDay() + 6) % 7;
    // Перемещаемся к четвергу текущей недели, т.к. именно он определяет неделю по стандарту ISO
    target.setDate(target.getDate() - dayNr + 3);
    // Получаем дату 4 января текущего года — она всегда попадает в первую неделю
    const firstThursday = new Date(target.getFullYear(), 0, 4);
    // Вычисляем разницу в миллисекундах и переводим в недели
    const diff = target - firstThursday;
    return 1 + Math.round(diff / (7 * 24 * 60 * 60 * 1000));
}

//Функция для получения данных о неделе
function getWeekRange(date = new Date()) {
    // Копируем дату, чтобы не изменять исходный объект
    const current = new Date(date);
    // Получаем номер дня недели (0 = воскресенье, 1 = понедельник, ..., 6 = суббота)
    let day = current.getDay();
    // Если день = 0 (воскресенье), считаем его 7-м днем
    if (day === 0) {
        day = 7;
    }
    // Вычисляем понедельник: отнимаем (day - 1) дней
    const monday = new Date(current);
    monday.setDate(current.getDate() - (day - 1));
    // Вычисляем воскресенье: прибавляем (7 - day) дней
    const sunday = new Date(current);
    sunday.setDate(current.getDate() + (7 - day));
    // Вспомогательная функция для форматирования даты в dd.mm.yyyy
    function formatDate(d) {
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0'); // месяцы начинаются с 0
        const yyyy = d.getFullYear();
        return `${dd}.${mm}.${yyyy}`;
    }
    return `${formatDate(monday)} - ${formatDate(sunday)}`;
}

// Команда старта работы с ботом
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;

    await bot.sendMessage(chatId, `Привет, ${msg.from.first_name}! Используй одну из команд, чтобы начать работу :)`);
})

// Команда для получения дежурного
bot.onText(/\/who_is_on_duty/, async (msg) => {
    const chatId = msg.chat.id;
    const currDate = new Date();
    // Получаем номер текущей недели
    const currentWeek = getISOWeekNumber(currDate);
    // Получаем данные о неделе
    const weekRange = getWeekRange(currDate);
    // Вычисляем индекс: для первой недели используем индекс 0, для второй — 1 и т.д.
    const personOnDuty = dutyList[(currentWeek - 1) % dutyList.length];
    // Получаем ответ о том, кто дежурный
    await bot.sendMessage(chatId, `На этой неделе ${weekRange} (${currentWeek} календарная неделя) дежурит ${personOnDuty}`);
});

// Команда для получения списка дежурных
bot.onText(/\/duty_list/, async (msg) => {
    const chatId = msg.chat.id;
    // Получаем список дежурных
    await bot.sendMessage(chatId, dutyList.join('\n'));
})

// Команда для изменения списка дежурных
bot.onText(/\/change_duty_list/, async (msg) => {
    const chatId = msg.chat.id;

    // Меняем состояние чата, чтобы получить возможность его изменить (иначе бот не поймет что от него хотят)
    commandsState[chatId] = 'waiting_for_names';

    // Просим ввести список дежурных
    await bot.sendMessage(chatId, 'Введите список дежурных через запятую')
})

// Обработчик всех сообщений
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Логируем все сообщения
    console.log(`Получено сообщение от ${msg.from.username || msg.from.first_name}: ${msg.text}`);

    // Если бот ожидает имена от пользователя
    if (commandsState[chatId] === 'waiting_for_names') {
        // Проверяем, чтобы сообщение не было самой командой
        if (text.startsWith('/')) return;

        // Разбиваем строку на имена по запятой и удаляем лишние пробелы
        const names = text.split(',').map(name => name.trim()).filter(name => name.length > 0);

        if (names.length === 0) {
            await bot.sendMessage(chatId, "Вы не ввели ни одного имени. Попробуйте ещё раз.");
        } else {
            // Заполняем массив дежурных новыми именами
            dutyList.splice(0, dutyList.length, ...names);
            // Возвращаем ответ с полученными именами
            await bot.sendMessage(chatId, "Вы ввели следующие имена: " + names.join(', '));
        }
        // Сбрасываем состояние диалога для данного чата
        delete commandsState[chatId];
    }
});

// Логируем начало работы бота
console.log('bot started');