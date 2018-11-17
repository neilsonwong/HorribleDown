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
	console.log('looping');
	console.log(process.memoryUsage().heapUsed);
	let currentShows = await horribleApi.getFollowing();

	//clear old torrents
	await delugeApi.removeCompletedTorrents();

	//check for new torrents to add
	let magnets = await horribleApi.getFilteredMagnets(currentShows, config.RESOLUTION);

	let notInCache;
	for (let i = 0; i < magnets.length; ++i){
		//change logic structure
		//check cache
		if (torrentCache.inCache(magnets[i]) === false){
			//not in cache
			//add torrent
			try {
				await delugeApi.downloadTorrent(magnets[i]);

				//add to cache
				await torrentCache.addMagnet(magnets[i]);
			}
			catch(e) {
				console.log('unable to add magnet');
				console.log(e);
			}

		}
	}
}

main();
