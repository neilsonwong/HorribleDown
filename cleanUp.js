"use strict";

const fs = require('fs');
const mv = require('mv');
const path = require('path');
const config = require('./config');
const torrentDatabase = require('./torrentDatabase');
const util = require('./util');

function iterateDir(){
	return new Promise((res, rej) => {
		fs.readdir(config.TORRENT_FOLDER, async function(err, items) {
			if (err) {
				return rej(err);
			}

			//remove hidden files
			items = items.filter(item => !(/(^|\/)\.[^\/\.]/g.test(item)));

			//remove folders
			items = await Promise.all(items.map(async item => {
				let fullItemPath = path.join(config.TORRENT_FOLDER, item);
				let itemStats = await fsStatPromise(fullItemPath);
				if (itemStats.isDirectory()) {
					return null;
				}
				return item;
			}));

			items = items.filter(item => (item !== null && item !== {}));

			res(items);
		});
	});
}

async function bruteForceMove(title){
	let parsedItem = util.parseFilename(title);
	
	//check if parsed correctly
	if (parsedItem.series !== ""){
		console.log(`series is ${parsedItem.series}`);
		try {
			let newLocation = await moveFileToCatalogue(title, parsedItem.series);
			await torrentDatabase.updateTorrentCompletion(title, newLocation);
			console.log('we done with ' + newLocation);
		}
		catch(error){
			console.log('error while moving from torrent to catalogue')
			console.log(title);
			console.log(error);
		}
	}
}

async function waitForFileStability(filePath) {
	let oldStat = await fsStatPromise(filePath);

	//wait up to 300 seconds for file stability
	try {
		for (let i = 0; i < 300; ++i){
			await wait(1000);
			let curStat = await fsStatPromise(filePath);
			if (curStat.mtime.getTime() === oldStat.mtime.getTime()) {
				return true;
			}
			else {
				oldStat = curStat;
			}
		}
		return false;
	}
	catch (e) {
		return false;
	}
}

function wait(t){
	return new Promise(res => {
		setTimeout(res.bind(true), t);
	});
}

function fsStatPromise(filePath){
	return new Promise((res, rej) => {
		fs.stat(filePath, function (err, stat) {
			if (err) {
				return rej(err);
			}
			res(stat);
		});
	});
}

function fsMkdirpPromise(folder){
	return new Promise((res, rej) => {
		fs.mkdir(folder, { recursive: true }, (err) => {
			if (err) {
				return rej(err);
			}
			res(true);
		});
	});
}

function fsRenamePromise(src, dest){
	return new Promise((res, rej) => {
		mv(src, dest, (err) => {
			if (err) {
				return rej(err);
			}
			res(true);
		});
	});
}

async function moveFileToCatalogue(title, series){
	let src = path.join(config.TORRENT_FOLDER, title);

	//file is stable, we can move
	let isStable = await waitForFileStability(src);

	if (isStable === true){
		let seriesFolder = path.join(config.CATALOGUE_FOLDER, series);

		//make sure catalogue and series folder exists
		let folderMade = await fsMkdirpPromise(seriesFolder);
		if (folderMade) {
			let restingLocation = path.join(seriesFolder, title);

			//move the file
			let moveSuccessful = await fsRenamePromise(src, restingLocation);
			if (moveSuccessful) {
				return restingLocation;
			}
		}
	}
	return false;
}

async function load(){
	await torrentDatabase.load();
}

async function torrents(){
	let items = await iterateDir();
	for (let i = 0; i < items.length; ++i){
		await bruteForceMove(items[i]);
		//console.log(`moving ${items[i]}`)
	}
}

module.exports = {
	torrentsDirectory: torrents
}
