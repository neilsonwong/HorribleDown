"use strict";

//server to serve simple web page for rss feed download configuration
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const horribleApi = require('./horribleApi');

const config = require('./config');

//setup app
const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//no static exposed
const publicRoot = path.join(__dirname, 'ui');

app.get('/', (req, res) => {
	res.sendFile('index.html', { root: publicRoot });
});
app.get('/script.js', (req, res) => {
	res.sendFile('script.js', { root: publicRoot });
});
app.get('/styles.css', (req, res) => {
	res.sendFile('styles.css', { root: publicRoot });
});

//add api calls
app.get('/currentSeason', async (req, res) => {
	let shows = await horribleApi.getCurrentSeason();
	res.json(shows);
});

app.put('/updateFollowing', async (req, res) => {
	console.log(req.body);
	await horribleApi.updateFollowing(req.body);
});

function start(){
	app.listen(config.UI_PORT, () => {
		console.log(`server started on ${config.UI_PORT}`);
	});
}

module.exports = {
	start: start
};