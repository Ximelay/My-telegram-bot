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

const dayjs = require('dayjs')

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
	// {
	// 	command: 'clear',
	// 	description: 'Очистка чата',
	// },
	{
		command: 'social',
		description: 'Социальные сети:',
	},
	{
		command: 'many',
		description: 'Курсы валют',
	},
	// {
	// 	command: 'file',
	// 	description: 'Сохранение ваших файлов:',
	// },
	// {
	// 	command: 'vk_f',
	// 	description: 'Проверка страницы на фейковость',
	// },
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
		'Доступные команды:\n/start - Старт бота\n/help - Команды бота\n/many - Курс валют\n/social - Социальные сети\n'
	)
})

// Добавляем команду в список команд бота
bot.command('many', async ctx => {
	try {
		// Получаем курсы криптовалют с CoinGecko
		const cryptoResponse = await fetch(
			'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd'
		)
		const cryptoRates = await cryptoResponse.json()

		// Получаем курсы фиатных валют с Open Exchange Rates
		const fiatResponse = await fetch(
			'https://openexchangerates.org/api/latest.json?app_id=31edd0acea4d45019d62ba0fc63a22c5'
		)
		const fiatRates = await fiatResponse.json()
		const usdToRubRate = fiatRates.rates.RUB // Курс доллара к рублю
		// ₿ ᚧ
		// Формируем сообщение с курсами валют
		let message = '<b>Курсы валют:</b>\n'
		message += `💰 <b>Bitcoin (BTC):</b> ${cryptoRates.bitcoin.usd} USD (${(
			cryptoRates.bitcoin.usd * usdToRubRate
		).toFixed(2)} RUB)\n`
		message += `💎 <b>Ethereum (ETH):</b> ${cryptoRates.ethereum.usd} USD (${(
			cryptoRates.ethereum.usd * usdToRubRate
		).toFixed(2)} RUB)\n`

		// Отправляем сообщение пользователю с включением HTML форматирования
		await ctx.reply(message, { parse_mode: 'HTML' })

		// Отправляем сообщение пользователю - отладка
		// await ctx.reply(message)
	} catch (error) {
		console.error('Ошибка при получении курсов валют:', error)
		await ctx.reply(
			'Произошла ошибка при получении курсов валют. Пожалуйста, попробуйте позже.'
		)
	}
})
// bot.hears('creator_ximelay', async ctx => {
// 	if (ctx.from.id === tgId) {
// 		await ctx.reply(
// 			'Привет, Ximelay. Скоро этот раздел будет исключительно для тебя'
// 		)
// 	} else {
// 		await ctx.reply('Эта команда исключительно для админа(')
// 	}
// })

// Обработчик команды для очистки чата
// bot.command('clear', async ctx => {
// 	// Проверяем, имеет ли пользователь права на удаление сообщений (например, администратор или создатель чата)
// 	if (ctx.from.id == tgId) {
// 		try {
// 			// Получаем идентификатор чата
// 			const chatId = ctx.chat.id
// 			// Получаем список всех сообщений в чате
// 			const messages = await getChatHistory(chatId)
// 			// Проходимся по каждому сообщению и удаляем его
// 			for (const message of messages) {
// 				await deleteMessage(chatId, message.message_id)
// 			}
// 			await ctx.reply('Chat cleared successfully')
// 		} catch (error) {
// 			console.error('Error while clearing chat:', error)
// 			await ctx.reply('Error while clearing chat')
// 		}
// 	} else {
// 		await ctx.reply('You do not have permission to clear the chat.')
// 	}
// })

// // Функция для получения истории чата
// async function getChatHistory(chatId) {
// 	return new Promise((resolve, reject) => {
// 		const options = {
// 			hostname: 'api.telegram.org',
// 			path: `/bot${bot}/getChatHistory?chat_id=${chatId}&limit=1000`,
// 			method: 'GET',
// 		}

// 		const req = https.request(options, res => {
// 			let data = ''
// 			res.on('data', chunk => {
// 				data += chunk
// 			})
// 			res.on('end', () => {
// 				const result = JSON.parse(data)
// 				if (result.ok) {
// 					resolve(result.result.messages)
// 				} else {
// 					reject(result)
// 				}
// 			})
// 		})

// 		req.on('error', error => {
// 			reject(error)
// 		})

// 		req.end()
// 	})
// }

// // Функция для удаления сообщения в чате
// async function deleteMessage(chatId, messageId) {
// 	return new Promise((resolve, reject) => {
// 		const options = {
// 			hostname: 'api.telegram.org',
// 			path: `/bot${bot.token}/deleteMessage`,
// 			method: 'POST',
// 			headers: {
// 				'Content-Type': 'application/json',
// 			},
// 		}

// 		const req = https.request(options, res => {
// 			res.on('data', () => {
// 				// Успешно удалено
// 				resolve()
// 			})
// 		})

// 		req.on('error', error => {
// 			reject(error)
// 		})

// 		const postData = JSON.stringify({
// 			chat_id: chatId,
// 			message_id: messageId,
// 		})

// 		req.write(postData)
// 		req.end()
// 	})
// }

// // Функция для расчета количества дней между двумя датами
// function getDaysSince(date) {
// 	const today = dayjs() // Текущая дата
// 	const registrationDate = dayjs(date) // Дата регистрации страницы
// 	return today.diff(registrationDate, 'day') // Разница в днях
// }

// bot.command('vk_f', async ctx => {
// 	ctx.reply(
// 		'Привет! Отправь мне ссылку на страницу ВКонтакте, и я проверю её на "фейковость".'
// 	)
// })

// bot.on('::url', async ctx => {
// 	const text = ctx.message.text
// 	const vkUrlRegex = /^https:\/\/vk\.com\/([^\s]+)/i // Регулярное выражение для проверки ссылок на страницы ВКонтакте
// 	if (vkUrlRegex.test(text)) {
// 		// Проверяем, является ли текст сообщения ссылкой на страницу ВКонтакте
// 		const userId = text.match(vkUrlRegex)[1] // Извлекаем id пользователя из ссылки
// 		const vkResponse = await fetch(
// 			`https://api.vk.com/method/users.get?user_ids=${userId}&fields=bdate,counters&access_token=${vkAccessToken}&v=5.131`
// 		)
// 		const userData = await vkResponse.json()
// 		if (userData.response && userData.response[0]) {
// 			const user = userData.response[0]
// 			if (user.is_closed === 1) {
// 				ctx.reply('Страница закрыта, возможно, это фейк.')
// 			} else {
// 				const registrationDate = user.bdate // Дата регистрации аккаунта ВКонтакте
// 				const daysSinceRegistration = registrationDate
// 					? getDaysSince(registrationDate)
// 					: null // Количество дней с момента регистрации
// 				let message = '' // Переменная для сообщения о результатах проверки
// 				if (daysSinceRegistration !== null) {
// 					if (daysSinceRegistration < 100) {
// 						message =
// 							'Страница существует менее 100 дней, скорее всего, это фейковая страница.'
// 					} else if (daysSinceRegistration < 730) {
// 						message =
// 							'Страница существует менее 2 лет, возможно, это фейковая страница.'
// 					} else {
// 						message =
// 							'Страница существует более 2 лет, вероятно, это настоящий аккаунт.'
// 					}
// 				} else {
// 					message =
// 						'Дата регистрации не указана, невозможно определить фейковость страницы.'
// 				}
// 				ctx.reply(message)
// 			}
// 		} else {
// 			ctx.reply('Не удалось получить информацию о странице.')
// 		}
// 	} else {
// 		ctx.reply('Отправьте ссылку на страницу ВКонтакте.')
// 	}
// })
// !Доделать
bot.command('social', async ctx => {
	const moodKeyboard = new Keyboard()
		.text('/Telegram')
		.row()
		// .text('VK')
		// .row()
		// .text('GitHub')
		.resized()
		.oneTime() //* создаст клавиатуру, где с каждой новой строки будет выведено новое слово с размерами по содержимому
	await ctx.reply('Введиет необходимую команду:', {
		reply_markup: moodKeyboard,
	})
})

bot.hears('/Telegram', async ctx => {
	await ctx.reply(`Ваш id в Telegram: ${ctx.from.id}`)
})

// bot.hears('VK', async ctx => {
// 	await ctx.reply(`VK: https://m.vk.com`)
// })

// bot.hears('GitHub', async ctx => {
// 	await ctx.reply('GitHub: https://github.com')
// })

// Инициализация пустого объекта для хранения ссылок на файлы пользователей
// const userFiles = {}

// Команда для сохранения файла
// bot.command('file', ctx => {
// 	// Инициализация сессии пользователя
// 	ctx.session = { expectingFiles: true }
// 	return ctx.reply('Привет! Отправь мне файл и я его сохраню.')
// })

// Обработчик сообщений
// bot.on('message', async ctx => {
// 	if (ctx.session && ctx.session.expectingFiles && ctx.message.document) {
// 		// Получаем информацию о файле
// 		const file = await ctx.telegram.getFile(ctx.message.document.file_id)
// 		// Загружаем файл и сохраняем его на сервере
// 		const fileLink = `https://api.telegram.org/file/bot${bot}/${file.file_path}`
// 		// Получаем ID пользователя
// 		const userId = ctx.from.id
// 		// Проверяем, есть ли у пользователя уже сохраненные файлы
// 		if (!userFiles[userId]) {
// 			userFiles[userId] = [] // Если нет, инициализируем пустой массив
// 		}
// 		// Добавляем ссылку на файл в массив пользователя
// 		userFiles[userId].push(fileLink)
// 		// Удаляем флаг ожидания файлов
// 		delete ctx.session.expectingFiles
// 		ctx.reply('Файл сохранен! Можешь его скачать по этой ссылке: ' + fileLink)
// 	} else if (ctx.session && ctx.session.expectingFiles) {
// 		ctx.reply('Извините, ожидался только файл. Пожалуйста, отправьте файл.')
// 	}
// })

// // Команда для просмотра файлов пользователя
// bot.command('my_files', ctx => {
// 	// Получаем ID пользователя
// 	const userId = ctx.from.id
// 	// Проверяем, есть ли у пользователя сохраненные файлы
// 	if (userFiles[userId] && userFiles[userId].length > 0) {
// 		// Формируем сообщение со ссылками на файлы пользователя
// 		const message = userFiles[userId]
// 			.map((fileLink, index) => `${index + 1}. ${fileLink}`)
// 			.join('\n')
// 		ctx.reply(`Ваши файлы:\n${message}`)
// 	} else {
// 		ctx.reply('У вас пока нет сохраненных файлов.')
// 	}
// })

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
