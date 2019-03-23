"use strict";

const fs = require('fs');
const path = require('path');
const config = require('./config');
const database = require('./database');
const Torrent = require('./torrent');
const horribleApi = require('./horribleApi');
const delugeApi = require('./delugeApi');

const cache = new Set();

let db;

async function load(){
	//should only be called on startup
	//load db from file
	db = await database.connect();

	//create table if it doesn't exist (new install)
	if (await initTorrentTable() === true){
		//rip magnet links out of table
		//await loadMagnetsFromDb();
	}
	else {
		console.log('unable to load cache from db');
	}
}

async function connect(){
	return new Promise((res, rej) => {
		let theDb = new sqlite3.Database(DB_PATH, (err) => {
			if (err) {
				console.error(err.message);
				rej(err);
			}
			console.log('Connected to the database file.');
			res(theDb);
		});
	});
}

async function initTorrentTable(){
	let stmt = `CREATE TABLE IF NOT EXISTS torrents (
		title TEXT NOT NULL UNIQUE,
		magnet TEXT NOT NULL UNIQUE,
		pubDate TEXT NOT NULL,
		series TEXT NOT NULL,
		episode INTEGER,
		resolution INTEGER NOT NULL,
		status INTEGER NOT NULL,
		localLocation TEXT
		)`;
	console.log(`running: ${stmt}`);
	return new Promise(res => {
		db.run(stmt, function(err) {
			if (err){
				console.log(err);
			}
			console.log('table torrents now exists');
			res(true);
		});
	});
}

async function updateMagnets(){
	let magnets = await horribleApi.getAllMagnets();
	magnets.forEach(async (m) => {
		await addTorrent(m);
	});
	return;
}

function addTorrent(torrent){
	let stmt = `INSERT INTO torrents (title, magnet, pubDate, series, episode, resolution, status, localLocation)
		VALUES($title, $magnet, $pubDate, $series, $episode, $resolution, $status, $localLocation)`;
	return new Promise((res, rej) => {
		db.run(stmt, torrent.prepare(), err => {
			if (err){
				//console.log(err);
				res(false);
			}
			res(true);
		});
	});
}

async function downloadFreshTorrents(){
	let tbd = await getUndownloadedTorrents();
	tbd.forEach(async (torrent) => {
		await downloadTorrent(torrent);
	});
	return;
}

async function downloadTorrent(torrent){
	let alreadyDownloaded = await checkIfAlreadyDownloaded(torrent);
	if (alreadyDownloaded) {
		return;
	}

	//change state
	await updateTorrentStatus(torrent, 1);

	//download
	console.log("downloading " + torrent.title);
	await delugeApi.download(torrent.magnet);
}

async function checkIfAlreadyDownloaded(torrent){
	//check inside db
	let dbEntry = await findInDb(torrent.magnet);
	if (dbEntry !== undefined && dbEntry.localLocation !== null){
		console.log(`file is downloaded at ${dbEntry.localLocation}`);
		return true;
	}
	else if (dbEntry.status > 0){
		console.log('status is > 0');
		return true;
	}

	//check in fs
	let finalDestinationPath = path.join(config.TORRENT_FOLDER, torrent.title);
	let exists = await fileExists(finalDestinationPath);
	if (exists) {
		//old logic
		await updateTorrentCompletion(torrent.title, finalDestinationPath);
	}

	return exists;
}

function findInDb(magnet){
	let query = `SELECT * FROM torrents WHERE magnet = "${magnet}"`;
	return new Promise((res, rej) => {
		db.get(query, (err, row) => {
			if (err){
				console.log(err);
			}
			res(row);
		});
	});
}

function updateTorrentStatus(torrent, status){
	let stmt = `UPDATE torrents SET status = ? WHERE magnet = ?`;
	return new Promise((res, rej) => {
		db.run(stmt, [status , torrent.magnet], err => {
			if (err){
				console.log(err);
			}
			res(true);
		});
	});
}

function updateTorrentCompletion(title, newPath) {
	let stmt = `UPDATE torrents SET status = 2, localLocation = ? WHERE title = ?`;
	return new Promise((res, rej) => {
		db.run(stmt, [newPath, title], err => {
			if (err){
				console.log(err);
			}
			res(true);
		});
	});
}

async function fileExists(newPath){
	let exists = await new Promise((res, rej) => {
		fs.access(newPath, fs.constants.F_OK, (err) => {
			res(err ? false : true);
		});
	});
	return exists;
}

function getUndownloadedTorrents(){
	let resolution = config.RESOLUTION;
	let query = `SELECT * from torrents 
		INNER JOIN following 
		ON torrents.series = following.series
		WHERE following.following = 1
		AND torrents.status = 0
		AND torrents.localLocation is null
		AND torrents.resolution = ${resolution}`;

	return new Promise((res, rej) => {
		db.all(query, (err, row) => {
			if (err){
				console.log(err);
			}
			res(row);
		});
	});
}

module.exports = {
	load: load,
	updateMagnets: updateMagnets,
	downloadFreshTorrents: downloadFreshTorrents,
	updateTorrentCompletion: updateTorrentCompletion,
	// getUndownloadedTorrents: getUndownloadedTorrents,
};
