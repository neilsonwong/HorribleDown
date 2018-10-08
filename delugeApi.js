"use strict";

const exec = require('child_process').exec;

let COMMANDS = {
	'INFO': `deluge-console 'info -i'`,
	//'ADD': `deluge-console "add '${magnetLink}'"`,
	//'RM': `deluge-console "rm '${torrentId}'"`
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
		let torrents = parseDelugeInfo();
		return torrents;

	}
	catch (e){
		console.log(e);
		return [];
	}
};

function parseDelugeInfo(infoString){
}	
function TorrentState(name, id, state, size) {
}


module.exports = {
	getCompletedTorrents: getCompletedTorrents
};
