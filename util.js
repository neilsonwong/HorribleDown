"use strict";

const anitomy = require('anitomy-js');

const BATCH = 'BATCH';

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

// old deprecated
function parseFilename2(file) {
	const parsed = anitomy.parseSync(file);
	// we expect resolution to exclude the p, so we'll handle that manually
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

function parseFilename3(file) {
	const parsed = anitomy.parseSync(file);

	const series = parsed.anime_title;
	const episode = parseFloat(parsed.episode_number || '');
	const resolution = parseInt(parsed.video_resolution || '');
	const format = parsed.file_extension;

	if (isBatch(parsed.release_information)) {
		return {};
	}

	return {
		'series': parsed.anime_title,
		'episode': parsed.episode_number,
		'resolution': parsed.video_resolution,
		'format': parsed.file_extension
	}
}

function isBatch(releaseInfo) {
	if (typeof releaseInfo === 'string') {
		return releaseInfo.toUpperCase() === BATCH;
	}
	else if (Array.isArray(releaseInfo)) {
		const idx = releaseInfo.findIndex((val) => (val.toUpperCase() === BATCH));
		return idx > -1;
	}
	else {
		return false;
	}
}

module.exports = {
	'parseFilename': parseFilename3
};
