"use strict";

const anitomy = require('anitomy-js');

// old deprecated
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

function parseFilename2(file) {
	const parsed = anitomy.parseSync(file);
	// we expect resolution to exclude the p, so we'll handle that manually
	if (parsed.video_resolution.endsWith('p')) {
		parsed.video_resolution = parsed.video_resolution.slice(0, -1);
	}
	if (parsed.release_information && parsed.release_information.toUpperCase() === 'BATCH') {
		return {};
	}
	return {
		'series': parsed.anime_title,
		'episode': parsed.episode_number,
		'resolution': parsed.video_resolution,
		'format': parsed.file_extension
	}
}

module.exports = {
	'parseFilename': parseFilename2
};