"use strict";

const config = require('./config');
const delugeApi = require('./delugeApi');
const torrentDatabase = require('./torrentDatabase');
const following = require('./following');
const ui = require('./server');

let loops = 0;

async function main(){
	await init();
	setInterval(mainLoop, config.MAIN_LOOP_INTERVAL);
	return;
}

async function init(){
	//load database
	await torrentDatabase.load();
	await following.load();
	console.log('db init complete');

	//start webserver
	ui.start();
	console.log('web ui started');
}

async function mainLoop(){
	console.log(`loop ${loops++}: ${process.memoryUsage().heapUsed}`);

	//clear old torrents
	let cleared = await delugeApi.clearCompleted();

	//pull new torrents from rss and archive them
	await torrentDatabase.updateMagnets();

	//download new torrents
	await torrentDatabase.downloadFreshTorrents();
}

main();
