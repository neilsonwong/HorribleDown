"use strict";

const config = require('./config');
const horribleApi = require('./horribleApi');
const delugeApi = require('./delugeApi');
const torrentCache = require('./torrentCache');

let currentShows = ['One Piece', 'Tensei Shitara Slime Datta Ken'];

async function main(){
	// let shows = await horribleApi.getCurrentShows();
	// console.log(JSON.stringify(shows));

	await torrentCache.load();
	let theOnePiece = await torrentCache.addMagnet('magnet:?xt=urn:btih:RHAOTULHL4MF3HY7NGF6V47PDYFEOUR3&tr=http://nyaa.tracker.wf:7777/announce&tr=udp://tracker.coppersurfer.tk:6969/announce&tr=udp://tracker.internetwarriors.net:1337/announce&tr=udp://tracker.leechersparadise.org:6969/announce&tr=udp://tracker.opentrackr.org:1337/announce&tr=udp://open.stealth.si:80/announce&tr=udp://p4p.arenabg.com:1337/announce&tr=udp://mgtracker.org:6969/announce&tr=udp://tracker.tiny-vps.com:6969/announce&tr=udp://peerfect.org:6969/announce&tr=http://share.camoe.cn:8080/announce&tr=http://t.nyaatracker.com:80/announce&tr=https://open.kickasstracker.com:443/announce');
	// torrentCache.

	// setInterval(mainLoop, config.MAIN_LOOP_INTERVAL);
	setTimeout(mainLoop, 3000);
}

async function mainLoop(){
	//clear old torrents
	// await delugeApi.removeCompletedTorrents();

	//check for new torrents to add
	let magnets = await horribleApi.getFilteredMagnets(currentShows, "720p");

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
