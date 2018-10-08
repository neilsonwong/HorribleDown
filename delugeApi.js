"use strict";

const exec = require('child_process').exec;

let COMMANDS = {
	'INFO': `deluge-console 'info'`,
	'ADD': (magnetLink) => (`deluge-console "add '${magnetLink}'"`),
	'RM': (torrentId) => (`deluge-console "rm '${torrentId}'"`)
};

async function delugeInfo(){
	return new Promise((res, rej) => {
		exec(COMMANDS.INFO, (error, stdout, stderr) => {
			if (error) {
				rej(error);
			}
			if (stdout){
				res(stdout);
			}
		});
	});
};

async function getCompletedTorrents(){
	try {
		let infos = await delugeInfo();
		let torrents = parseDelugeInfo(infos);
		return torrents.filter(torrent => torrent.isCompleted);
	}
	catch (e){
		console.log(e);
		return [];
	}
};

async function removeCompletedTorrents(){
	let done = await getCompletedTorrents();
	for (let i = 0; i < done.length; ++i){
		try {
			await exec(COMMANDS.RM(done[i].id));
			console.log(`removed ${done[i].name}`);
		}
		catch (e){
			console.log(e);
		}
	}
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
			lines[i+4].startsWith('Size: ')){	//size is completion

			let name = lines[i].substring(6),
				id = lines[i+1].substring(4),
				state = lines[i+2].substring(7),
				completion = lines[i+4].substring(6);

			torrents.push(new TorrentState(name, id, state, completion));

			//increment by 5 to skip the things we used
			i += 5;
		}
		else {
			++i;
		}
	}

	return torrents;
}

function TorrentState(name, id, state, completion) {
	this.name = name;
	this.id = id;
	this.state = state;

	//get size and completeness
	let temp = completion.split('/');
	this.size = temp[0];
	this.isCompleted = temp[1].startsWith(this.size);
}

module.exports = {
	getCompletedTorrents: getCompletedTorrents,
	removeCompletedTorrents: removeCompletedTorrents
};
