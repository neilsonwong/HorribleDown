"use strict";

const config = require('./config');
const horribleApi = require('./horribleApi');
const delugeApi = require('./delugeApi');
const torrentCache = require('./torrentCache');
const ui = require('./server');

async function main(){
	//start webserver
	ui.start();

	await torrentCache.load();
	setInterval(mainLoop, config.MAIN_LOOP_INTERVAL);
}

async function mainLoop(){
	let currentShows = await horribleApi.getCurrentShows();

	//clear old torrents
	await delugeApi.removeCompletedTorrents();

	//check for new torrents to add
	let magnets = await horribleApi.getFilteredMagnets(currentShows.data, config.RESOLUTION);

	let notInCache;
	for (let i = 0; i < magnets.length; ++i){
		notInCache = await torrentCache.addMagnet(magnets[i]);
		if (notInCache === true) {
			//we need to download this
			delugeApi.downloadTorrent(magnets[i]);
		}
	}
}

main();
