"use strict";

const sqlite3 = require('sqlite3').verbose();

const config = require('./config');
const DB_PATH = require("./config").DB_PATH;

const cache = new Set();

let db;

async function load(){
	//should only be called on startup
	//load db from file
	db = await connect();

	//create table if it doesn't exist (new install)
	if (await initDb() === true){
		//rip magnet links out of table
		await loadMagnetsFromDb();
	}
	else {
		console.log('unable to load cache from db');
	}
}

async function connect(){
	console.log(DB_PATH);
	return new Promise((res, rej) => {
		let theDb = new sqlite3.Database(DB_PATH, (err) => {
			if (err) {
				console.error(err.message);
				rej(err);
			}
			console.log('Connected to the database.');
			res(theDb);
		});
	});
}

async function initDb(){
	let stmt = `CREATE TABLE IF NOT EXISTS torrents (magnet TEXT NOT NULL UNIQUE)`;
	return new Promise(res => {
		db.run(stmt, function(err) {
			if (err){
				console.log(err);
			}
			res(true);
		});
	});
}

async function loadMagnetsFromDb(){
	let query = `SELECT * FROM torrents`;
	return new Promise(res => {
		db.all(query, [], (err, rows) => {
			if (err) {
				console.log(err);
			}

			for (let i = 0; i < rows.length; i++) {
				console.log(`adding to cache ${rows[i].magnet}`);
				cache.add(rows[i].magnet);
			};

			res(true);
		});
	});
}

async function addMagnet(magnet){
	//find magnet in cache
	if (cache.has(magnet)){
		return false;
	}

	//add if not exists return true
	cache.add(magnet);
	await insertIntoDb(magnet);
	return true;
}

function inCache(magnet){
	return cache.has(magnet);
}

function insertIntoDb(magnet){
	let stmt = `INSERT INTO torrents (magnet) VALUES (?)`;
	return new Promise((res, rej) => {
		db.run(stmt, [magnet], err => {
			if (err){
				console.log(err);
			}
			res(true);
		});
	});
}

/*
function findInDb(magnet){
	let query = `SELECT COUNT(magnet) FROM torrents WHERE magnet = "${magnet}"`;
	return new Promise((res, rej) => {
		db.get(query, err => {


		});
	});
}
*/

module.exports = {
	load: load,
	inCache: inCache,
	addMagnet: addMagnet
};