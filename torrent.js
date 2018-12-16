"use strict";

const util = require('./util');

class Torrent {
	constructor(title, magnet, pubDate, localLocation){
		this.title = title;
		this.magnet = magnet;
		this.pubDate = pubDate;

		this.status = 0;
		this.localLocation = localLocation;

		let parsedData = util.parseFilename(title);

		this.series = parsedData.series;
		this.episode = parsedData.episode;
		this.resolution = parsedData.resolution;
		this.format = parsedData.format;
	}

	prepare(){
		return {
			$title: this.title, 
			$magnet: this.magnet,
			$pubDate: this.pubDate,
			$series: this.series,
			$episode: this.episode, 
			$resolution: this.resolution,
			$status: this.status,
			$localLocation: this.localLocation
		};
	}
}

module.exports = Torrent;