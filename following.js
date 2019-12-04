"use strict";

const database = require('./database');
const torrentDatabase = require('./torrentDatabase');
const horribleApi = require('./horribleApi');

let db;

async function initFollowingTable(){
	let stmt = `CREATE TABLE IF NOT EXISTS following (series TEXT NOT NULL UNIQUE, following INTEGER)`;
	console.log(`running: ${stmt}`);
	return new Promise(res => {
		db.run(stmt, function(err) {
			if (err){
				console.log(err);
			}
			console.log('table following now exists');
			res(true);
		});
	});
}

async function load(){
	db = await database.connect();

	if (await initFollowingTable() === true){
		//do something
		console.log('initted following table');
	}
	return;
}

async function updateFollowing(series, following){
	let bFollow = following ? 1 : 0;
	console.log(`updating ${series} to following: ${bFollow}`);
	let stmt = `INSERT INTO following (series, following) 
				VALUES ($series, $following)
				ON CONFLICT(series)
				DO UPDATE SET following = $following`;

	return new Promise((res, rej) => {
		db.run(stmt, { $series: series, $following: bFollow }, err => {
			if (err){
				console.log(err);
			}
			res(true);
		});
	});
}

async function isFollowing(series){
	let query = `SELECT COUNT(*) AS isFollowing FROM following WHERE series = $series AND following = $bVal`;
	return new Promise((res, rej) => {
		db.get(query, {$series: series, $bVal: 1}, (err, row) => {
			if (err){
				console.log(err);
				return false;
			}
			return res(row.isFollowing === 1 ? true : false);
		});
	});
}

async function getFollowing(){
	let query = `SELECT series FROM following WHERE following = 1`;
	return new Promise((res, rej) => {
		db.all(query, (err, row) => {
			if (err){
				console.log(err);
				return false;
			}
			let unwrapped = row.map(a => (a.series));
			return res(unwrapped);
		});
	});
}

async function getCurrentSeasonWithFollowData(){
	let currentShows = await horribleApi.getCurrentShows();
	let cache = await getFollowing();
	let mySeason = currentShows.data.map(show => {
		return {
			title: show,
			following: cache.includes(show)
		};
	});
	return mySeason;
}

async function getArchivedWithFollowData() {
	let archived = await torrentDatabase.getArchivedSeries();
	let cache = await getFollowing();
	let shows = archived.map(show => {
		return {
			title: show.series,
			following: cache.includes(show.series)
		};
	});
	return shows;
}

module.exports = {
	'update': updateFollowing,
	'load': load,
	'isFollowing': isFollowing,
	'getCurrentSeasonWithFollowData': getCurrentSeasonWithFollowData,
	'getArchivedWithFollowData': getArchivedWithFollowData,
}
