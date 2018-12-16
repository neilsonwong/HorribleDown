"use strict";

function parseFilename(file) {
	try {
		let horribleFileFormatRegex = /^\s*\[HorribleSubs] (.+) - (\d+)\s*\[(1080|720|480)p\]\.(mkv|avi|mp4)\s*$/;
		let match = horribleFileFormatRegex.exec(file);
		return {
			'series': match[1],
			'episode': match[2],
			'resolution': match[3],
			'format': match[4]
		};
	}
	catch(e) {
		return {};
	}
}

module.exports = {
	'parseFilename': parseFilename
};