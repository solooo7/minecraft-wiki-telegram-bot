const telegraf = require("telegraf");

const { BOT_TOKEN } = require("./config");
const {
	search,
	downloadPage,
	getThumbnail,
	getDescription,
	escape,
	getAdditionalInfo,
	formatMessage,
} = require("./utils");

const bot = new telegraf(BOT_TOKEN);

bot.on(
	"inline_query",
	async ({ inlineQuery: { query, id }, answerInlineQuery }) => {
		const result = await search(query);
		const response = await Promise.all(
			result.map(async ([itemName, itemPageLink], index) => {
				const dom = await downloadPage(itemPageLink);
				const description = getDescription(dom);
				const imageURL = getThumbnail(dom);
				const additionalInfo = getAdditionalInfo(dom);
				const formattedMessage = formatMessage(
					itemName,
					imageURL,
					description,
					itemPageLink,
					additionalInfo
				);
				return {
					inline_query_id: id,
					id: index,
					type: "article",
					thumb_url: imageURL,
					caption: escape(itemName),
					title: escape(itemName),
					parse_mode: "MarkdownV2",
					message_text: formattedMessage,
				};
			})
		);
		return answerInlineQuery(response);
	}
);

bot.launch();
