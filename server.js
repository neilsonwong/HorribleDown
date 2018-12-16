"use strict";

//server to serve simple web page for rss feed download configuration
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const following = require('./following');
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
	let shows = await following.getCurrentSeasonWithFollowData();
	res.json(shows);
});

app.put('/updateFollowing', async (req, res) => {
	console.log(req.body);
	await following.update(req.body.series, req.body.following);
});

function start(){
	app.listen(config.UI_PORT, () => {
		console.log(`server started on ${config.UI_PORT}`);
	});
}

module.exports = {
	start: start
};