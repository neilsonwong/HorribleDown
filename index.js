"use strict";

const horribleApi = require('./horribleApi');

async function main(){
	let shows = await horribleApi.getCurrentShows();
	let magnets = await horribleApi.getFilteredMagnets(["One Piece"], "720p");

	console.log(JSON.stringify(shows));
	console.log(JSON.stringify(magnets));
}

main();
