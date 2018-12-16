"use strict";

const sqlite3 = require('sqlite3').verbose();

const config = require('./config');
const DB_PATH = require('./config').DB_PATH;

let db = null;

async function connect(){
	console.log(`loading db from ${DB_PATH}`);
	if (db !== null && db !== undefined) {
		return Promise.resolve(db);
	}
	else {
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
}

module.exports = {
	connect: connect
};