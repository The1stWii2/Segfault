import chalk from "chalk";
import fs from "fs";

import * as seg from "../constants.js";

//Levels
export const TEXT_LEVEL = {
	INFO: chalk.white,
	WARN: chalk.yellowBright,
	ERROR: chalk.redBright,
	FATAL: chalk.bgRedBright,
	SUCCESS: chalk.greenBright,
	DEBUG: chalk.dim
};

export function print(message, level = TEXT_LEVEL.INFO,
	writeToErr = false, logEvent = seg.LOG_ALL) {
	if (String(message).trim() == "") {
		process.stdout.write(message);
		return;
	}

	const levelText = getKeyByValue(TEXT_LEVEL, level);
	const eventTime = new Date();
	const eventTimeStamp = "[" +
	String(eventTime.getHours()).padStart(2, "0") + ":" +
	String(eventTime.getMinutes()).padStart(2, "0") + ":" +
	String(eventTime.getSeconds()).padStart(2, "0") + ":" +
	String(eventTime.getMilliseconds()).padStart(3, "0") + "]";

	if (level != TEXT_LEVEL.DEBUG || (level == TEXT_LEVEL.DEBUG && seg.SHOW_DEBUG == true)) {
		if (writeToErr) {
			if (seg.SHOW_TIMESTAMP_IN_CONSOLE)
				process.stderr.write(eventTimeStamp + " - ");
			process.stderr.write(level("[" + levelText + "] " + String(message)) + "\n");
		} else {
			if (seg.SHOW_TIMESTAMP_IN_CONSOLE)
				process.stdout.write(eventTimeStamp + " - ");
			process.stdout.write(level("[" + levelText + "] " + String(message)) + "\n");
		}
	}

	if (logEvent) {
		try {
			fs.writeFileSync("./log.txt",
				eventTimeStamp + " - [" + levelText + "] " + message + "\n",
				{ flag: "a+" });
		} catch (e) {
			print("Failed to write to log!", TEXT_LEVEL.ERROR, true, false);
			throw e;
		}
	}
}

function getKeyByValue(object, value) {
	return Object.keys(object).find(key => object[key] === value);
}