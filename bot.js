// ОБОЗНАЧЕНИЯ КОММЕНТАРИЕВ!!!
// !текст! - очень важная информация для текста
// ?код? - важная информация для кода
// TODO проверка TODO - различные проверки кода
// *код => объяснение к нему* - пояснения за код
// QWERTY - другое

//импортируем библиотеки dotenv и grammy

require('dotenv').config()
const { Bot, GrammyError, HttpError, Keyboard, Router } = require('grammy')

const fetch = require('node-fetch')

const bot = new Bot(process.env.BOT_API_KEY) //?подключаем API бота

const vkAccessToken = process.env.VK_ACCESS_TOKEN


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
		command: 'mod',
		description: 'Твоё настроение',
	},
	{
		command: 'vk_f',
		description: 'Проверка страницы на фейковость',
	},
])
// Получение информации о боте

bot.command('start', async ctx => {
	await ctx.reply(
		'Привет! Я бот. Тг канал: <a href="#">https://t.me/New_World_Xil</a>',
		{
			parse_mode: 'HTML',
		}
	)
})

bot.command('help', async ctx => {
	await ctx.reply(
		'Доступные команды:\n/start - Старт бота\n/help - Команды бота\n/mod - Клавиатура'
	)
})

bot.hears('creator_ximelay', async ctx => {
	if (ctx.from.id === 1837141803) {
		await ctx.reply(
			'Привет, Ximelay. Скоро этот раздел будет исключительно для тебя'
		)
	} else {
		await ctx.reply('Эта команда исключительно для админа(')
	}
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

bot.command('mod', async ctx => {
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
	await ctx.reply(`VK: `)
}) //TODO Доделать!!!



bot.catch(err => {
	// TODO проверка на различные ошибки
	const ctx = err.ctx
	console.log(`Error while handling update ${ctx.update.update_id}:`)
	const e = err.error

	if (e instanceof GrammyError) {
		console.error('Error in request:', e.description)
	} else if (e instanceof HttpError) {
		console.error('Could not contact Telegram:', e)
	} else {
		console.error('Unknown error', e)
	}
})

bot.start()
