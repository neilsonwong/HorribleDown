"use strict";

const exec = require('child_process').exec;
const config = require('./config.json');

const USER = config.DELUGE_USER;
const PW = config.DELUGE_PW;

const credentials = (USER && PW) ?	`-U ${USER} -P ${PW}` : '';

let COMMANDS = {
	'INFO': `deluge-console ${credentials} 'info --verbose'`,
	'ADD': (magnetLink) => (`deluge-console ${credentials} "add '${magnetLink}'"`),
	'RM': (torrentId) => (`deluge-console ${credentials} "rm -c '${torrentId}'"`)
};

async function delugeInfo(){
	return new Promise((res, rej) => {
		exec(COMMANDS.INFO, (error, stdout, stderr) => {
			if (error) {
				rej(error);
			}
			if (stdout !== null && stdout !== undefined){
				res(stdout);
			}
		});
	});
};

async function getCompletedTorrents(){
	try {
		let infos = await delugeInfo();
		if (infos.length === 0){
			console.log('no torrents in deluge info');
			return [];
		}
		let torrents = parseDelugeInfo(infos);
		return torrents.filter(torrent => torrent.isCompleted);
	}
	catch (e) {
		console.log(e);
		return [];
	}
};

async function removeCompletedTorrents(){
	let removed = [];
	try {
		let done = await getCompletedTorrents();
		for (let i = 0; i < done.length; ++i){
			try {
				await exec(COMMANDS.RM(done[i].id));
				console.log(done[i].id);
				console.log(`removed ${done[i].name}`);
				removed.push(done[i].name);
			}
			catch (e) {
				console.log(e);
			}
		}
	}
	catch (e) {
		console.log(e);
	}
	return removed;
}

async function downloadTorrent(magnetLink){
	return new Promise((res, rej) => {
		//run add command, wait for it to show up in downloading
		exec(COMMANDS.ADD(magnetLink), (error, stdout, stderr) => {
			if (error) {
				rej(error);
			}
			if (stdout){
				res(stdout);
			}
		});
	});
}

function parseDelugeInfo(infoString){
	let lines = infoString.split('\n');
	let torrents = [];
	let i = 0;

	while (i < lines.length){
		//check all the if's to make sure it only adds if all reqs are satisfied
		if (lines[i].startsWith('Name: ') && 
			lines[i+1].startsWith('ID: ') &&
			lines[i+2].startsWith('State: ') &&
			lines[i+3].startsWith('Seeds: ') &&
			lines[i+4].startsWith('Size: ') &&
			lines[i+5].startsWith('ETA: ')) {
//			lines[i+4].startsWith('Size: ') && 
//			lines[i+5].startsWith('Seed time: ')){	//size is completion

			let name = lines[i].substring(6),
				id = lines[i+1].substring(4),
				state = lines[i+2].substring(7),
				completion = lines[i+4].substring(6),
				seedTime = lines[i+5];

			torrents.push(new TorrentState(name, id, state, completion, seedTime));

			//increment by 6 to skip the things we used
			i += 6;
		}
		else {
			++i;
		}
	}

	return torrents;
}

function TorrentState(name, id, state, completion, seedTime) {
	this.name = name;
	this.id = id;
	this.state = state;
	this.seedTimeInfo = seedTime;

	//get seedTime
	let seedTimeStart = seedTime.indexOf('Seeding');
	let seedTimeEnd = seedTime.indexOf('Active');
	let seededFor = seedTime.substring(seedTimeStart + 9, seedTimeEnd);
	let seededMoreThanOneMinute = seededFor.indexOf('m') > -1 || seededFor.indexOf('h') > -1 || seededFor.indexOf('d') > -1;

	//get size and completeness
	let dlIndex = completion.indexOf('Downloaded: ');
	let ulIndex = completion.indexOf('Uploaded: ');
	let downloaded = completion.substring(dlIndex + 12, ulIndex).trim();
	this.size = completion.substring(0, dlIndex).trim();
	this.isCompleted = (downloaded >= this.size) && seededMoreThanOneMinute;
}

module.exports = {
	clearCompleted: removeCompletedTorrents,
	download: downloadTorrent
};
