"use strict";

const horribleApi = require('./horribleApi');
const delugeApi = require('./delugeApi');


async function main(){
	// let shows = await horribleApi.getCurrentShows();
	// let magnets = await horribleApi.getFilteredMagnets(["One Piece"], "720p");

	// console.log(JSON.stringify(shows));
	// console.log(JSON.stringify(magnets));

	let infoString = 
`Name: [HorribleSubs] Sword Art Online - Alicization - 01 [720p].mkv
ID: c6e1336d7f24ee440c5273b7c8e2e2c00b2b990a
State: Queued
Seeds: 0 (1875) Peers: 0 (100) Availability: 0.00
Size: 945.8 MiB/945.8 MiB Ratio: 0.000
Seed time: 0 days 00:01:09 Active: 0 days 00:11:31
Tracker status: tracker.wf: Announce OK
Name: [HorribleSubs] One Piece - 856 [720p].mkv
ID: 89c0e9d1675f185d9f1f698beaf3ef1e0a47523b
State: Seeding Up Speed: 474.0 KiB/s
Seeds: 0 (916) Peers: 4 (43) Availability: 0.00
Size: 485.3 MiB/485.3 MiB Ratio: 0.025
Seed time: 0 days 00:06:11 Active: 0 days 00:08:59
Tracker status: tracker.wf: Announce OK
Name: [HorribleSubs] Sword Art Online - Alicization - 01 [720p].mkv
ID: c6e1336d7f24ee440c5273b7c8e2e2c00b2b990a
State: Downloading Down Speed: 3.1 MiB/s Up Speed: 1.2 KiB/s ETA: 10s
Seeds: 192 (1899) Peers: 3 (101) Availability: 191.99
Size: 913.7 MiB/945.8 MiB Ratio: 0.000
Seed time: 0 days 00:00:00 Active: 0 days 00:05:00
Tracker status: tracker.wf: Announce OK
Progress: 96.61% [#########################################################~~]`;
	let infos = await delugeApi.parse(infoString);
	console.log(JSON.stringify(infos, 0, 2));
}

main();
