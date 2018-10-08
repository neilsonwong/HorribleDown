"use strict";

const horribleApi = require('./horribleApi');
const delugeApi = require('./delugeApi');
async function main(){
	//let shows = await horribleApi.getCurrentShows();
	//let magnets = await horribleApi.getFilteredMagnets(["One Piece"], "720p");
	let infos = await delugeApi.getCompletedTorrents();

	//console.log(JSON.stringify(shows));
	//console.log(JSON.stringify(magnets));
	console.log(JSON.stringify(infos));
	//console.log(infos);
}

main();
