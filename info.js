const WikiTextParser = require("parse-wikitext");

const wikiTextParser = new WikiTextParser("minecraft.gamepedia.com");

const date = "2020-05-11T00:00:00Z";

const keys = [
	"durability",
	"renewable",
	"rarity",
	"stackable",
	"light",
	"transparent",
	"flammable",
	"tool",
	"lavasusceptible",
	"heals",
	"drops",
	"damage",
	"behaviour",
	"health",
	"size",
	"primaryitems",
	"secondaryitems",
];

const filterValues = (values) => {
	let result = {};
	for (const key in values)
		if (keys.includes(key))
			result = {
				...result,
				[key]: values[key]
					.replace(/{{.*bedrock.*}}/g, "")
					.replace(/\<br\>/g, " ")
					.replace(/[{}}']/g, "")
					.replace(/[/|]/g, "\\-")
					.replace(/<br>/g, ", ")
					.replace(/(EffectLink|ItemSprite)-?/g, " ")
					.replace(/-link=[a-z]*/gi, " ")
					.replace(/\* /g, " \n(>>)")
					.replace(/hp\\-(\d{0,5})/g, "$1♥ "),
			};
	return result;
};

const formatValues = (object) => {
	let str = "";
	for(const key in object){
		if(!object[key].trim()) continue;
		str += `${key.toUpperCase()}: ${object[key]} \n`
	}
	return str;
}

const getInfoJSON = (name) =>
	new Promise((resolve) => {
		wikiTextParser.getFixedArticle(name, date, function (err, data) {
			if (err) return resolve(null);
			const sectionObject = wikiTextParser.pageToSectionObject(data);
			const infoBox = wikiTextParser.parseInfoBox(sectionObject["content"]);
			const values = infoBox["values"];
			const filteredValues = filterValues(values);
			const formattedValues = formatValues(filteredValues);
			return resolve(formattedValues);
		});
	});

module.exports = {
	getInfoJSON,
};