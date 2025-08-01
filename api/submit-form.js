// api/submit-form.js

// Переменные окружения Vercel для токена и Chat ID
// НИКОГДА не храните эти данные прямо в коде, используйте переменные окружения Vercel!
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error("TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not set in Vercel Environment Variables.");
    // В продакшене можно выбрасывать ошибку, но для отладки просто логируем
}

export default async function handler(request, response) {
    // Разрешаем CORS запросы с вашего фронтенда (если ваш сайт на другом домене/поддомене)
    response.setHeader('Access-Control-Allow-Origin', '*'); // В продакшене лучше указать конкретный домен
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Обработка OPTIONS запросов (preflight requests) для CORS
    if (request.method === 'OPTIONS') {
        return response.status(200).end();
    }

    if (request.method !== 'POST') {
        return response.status(405).json({ message: 'Метод не разрешен. Ожидается POST.' });
    }

    try {
        const data = request.body; // Vercel автоматически парсит JSON для request.body

        // Сбор данных
        const name = data.name || 'Не указано';
        const phone = data.phone || 'Не указано';
        const company = data.company || 'Не указано';
        const position = data.position || 'Не указано';
        const service = data.service || 'Не указано';
        const howHeard = data.howHeard || 'Не указано';
        const timestamp = new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent' }); // Время по Ташкенту

        // Формирование сообщения для Telegram (HTML-форматирование)
        const messageText = `
            <b>&#128221; НОВАЯ ЗАЯВКА С САЙТА &#128221;</b>

            &#128100; <b>Имя:</b> ${name}
            &#128222; <b>Телефон:</b> ${phone}
            &#127970; <b>Компания:</b> ${company}
            &#128188; <b>Должность:</b> ${position}
            &#128187; <b>Интересует услуга:</b> ${service}
            &#128269; <b>Откуда узнал:</b> ${howHeard}

            &#128197; <b>Дата и время:</b> ${timestamp}
        `;

        const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

        const telegramResponse = await fetch(telegramApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: messageText,
                parse_mode: 'HTML' // Важно для использования HTML-тегов
            })
        });

        if (!telegramResponse.ok) {
            const errorData = await telegramResponse.json();
            console.error('Ошибка отправки в Telegram:', errorData);
            return response.status(500).json({ message: 'Ошибка при отправке заявки в Telegram.', telegramError: errorData });
        }

        return response.status(200).json({ message: 'Заявка успешно отправлена.' });

    } catch (error) {
        console.error('Ошибка обработки запроса:', error);
        return response.status(500).json({ message: 'Внутренняя ошибка сервера.', error: error.message });
    }
}