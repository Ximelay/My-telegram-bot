// ОБОЗНАЧЕНИЯ КОММЕНТАРИЕВ!!!
// !текст! - очень важная информация для текста
// ?код? - важная информация для кода
// TODO проверка TODO - различные проверки кода
// *код => объяснение к нему* - пояснения за код
// QWERTY - другое

//импортируем библиотеки dotenv и grammy

require('dotenv').config()
const { Bot, GrammyError, HttpError, Keyboard, Context } = require('grammy')

const https = require('https')

const fetch = require('node-fetch')

const bot = new Bot(process.env.BOT_API_KEY) //?подключаем API бота

const vkAccessToken = process.env.VK_ACCESS_TOKEN

const tgId = process.env.TG_ID

bot.api.setMyCommands([
	{
		command: 'start',
		description: 'Начало работы',
	},
	{
		command: 'help',
		description: 'Команды бота',
	},
	{
		command: 'social',
		description: 'Социальные сети:',
	},
	{
		command: 'vk_f',
		description: 'Проверка страницы на фейковость',
	},
])
// Получение информации о боте

bot.command('start', async ctx => {
	await ctx.reply(
		'Привет! Я telegram-bot, можешь воспользоваться необходимыми командами для общения со мной, удачи!',
		{
			parse_mode: 'HTML',
		}
	)
})

bot.command('help', async ctx => {
	await ctx.reply(
		'Доступные команды:\n/start - Старт бота\n/help - Команды бота\n/social - Клавиатура\n/vk_f - Проверка страницы VK на фейковость'
	)
})

bot.hears('creator_ximelay', async ctx => {
	if (ctx.from.id === tgId) {
		await ctx.reply(
			'Привет, Ximelay. Скоро этот раздел будет исключительно для тебя'
		)
	} else {
		await ctx.reply('Эта команда исключительно для админа(')
	}
})


// Обработчик команды для очистки чата
bot.command('clear', async (ctx) => {
    // Проверяем, имеет ли пользователь права на удаление сообщений (например, администратор или создатель чата)
    if (ctx.from.id == tgId) {
			try {
				// Получаем идентификатор чата
				const chatId = ctx.chat.id
				// Получаем список всех сообщений в чате
				const messages = await getChatHistory(chatId)
				// Проходимся по каждому сообщению и удаляем его
				for (const message of messages) {
					await deleteMessage(chatId, message.message_id)
				}
				await ctx.reply('Chat cleared successfully')
			} catch (error) {
				console.error('Error while clearing chat:', error)
				await ctx.reply('Error while clearing chat')
			}
		} else {
			await ctx.reply('You do not have permission to clear the chat.')
		}
});

// Функция для получения истории чата
async function getChatHistory(chatId) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.telegram.org',
            path: `/bot${bot}/getChatHistory?chat_id=${chatId}&limit=1000`,
            method: 'GET'
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                const result = JSON.parse(data);
                if (result.ok) {
                    resolve(result.result.messages);
                } else {
                    reject(result);
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
}

// Функция для удаления сообщения в чате
async function deleteMessage(chatId, messageId) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.telegram.org',
            path: `/bot${bot.token}/deleteMessage`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            res.on('data', () => {
                // Успешно удалено
                resolve();
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        const postData = JSON.stringify({
            chat_id: chatId,
            message_id: messageId
        });

        req.write(postData);
        req.end();
    });
}


bot.command('social', async ctx => {
	const moodKeyboard = new Keyboard()
		.text('Telegram')
		.row()
		.text('VK')
		.row()
		.text('GitHub')
		.resized() //* создаст клавиатуру, где с каждой новой строки будет выведено новое слово с размерами по содержимому
	await ctx.reply('Ваши соц. сети:', {
		reply_markup: moodKeyboard,
	})
})

bot.hears('Telegram', async ctx => {
	await ctx.reply(`Ваш id в Telegram: ${ctx.from.id}`)
})

bot.hears('VK', async ctx => {
	await ctx.reply(`VK: https://m.vk.com`)
})

bot.hears('GitHub', async ctx => {
	await ctx.reply('GitHub: https://github.com')
})

bot.command('vk_f', ctx => {
	ctx.reply(
		'Привет! Отправь мне ссылку на страницу ВКонтакте, и я проверю её на "фейковость".'
	)
})

bot.on('message', async ctx => {
	const text = ctx.message.text
	if (text.startsWith('https://vk.com/')) {
		const userId = text.split('/').pop()
		const vkResponse = await fetch(
			`https://api.vk.com/method/users.get?user_ids=${userId}&fields=is_closed&access_token=${vkAccessToken}&v=5.131`
		)
		const userData = await vkResponse.json()
		if (userData.response && userData.response[0]) {
			const user = userData.response[0]
			if (user.is_closed === 1) {
				ctx.reply('Страница закрыта, возможно, это фейк.')
			} else {
				ctx.reply('Страница открыта, вероятно, это настоящий аккаунт.')
			}
		} else {
			ctx.reply('Не удалось получить информацию о странице.')
		}
	} else {
		ctx.reply('Отправьте ссылку на страницу ВКонтакте.')
	}
})

bot.catch(err => {
	// TODO проверка на различные ошибки
	const ctx = err.ctx
	console.log(`Ошибка при обработке обновления ${ctx.update.update_id}:`)
	const e = err.error

	if (e instanceof GrammyError) {
		console.error('Ошибка в запросе:', e.description)
	} else if (e instanceof HttpError) {
		console.error('Не удалось связаться с Telegram:', e)
	} else {
		console.error('Неизвестная ошибка', e)
	}
})

bot.start()
