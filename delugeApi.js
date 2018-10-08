"use strict";

const exec = require('child_process').exec;

let COMMANDS = {
	'INFO': `deluge-console 'info'`,
	'ADD': `deluge-console "add '${magnetLink}'"`,
	'RM': `deluge-console "rm '${torrentId}'"`
};

async function getCompletedTorrents(){
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

module.exports = {
	getCompletedTorrents: getCompletedTorrents
};