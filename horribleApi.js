"use strict";

//api to horrible subs
const fs = require('fs');
const cheerio = require('cheerio');
const axios = require('axios');
const parseString = require('xml2js').parseString;

const config = require('./config');
const cache = {};	//lazy use a non persistent in memory cache
const Torrent = require('./torrent');

async function getCurrentShows(){
	try {
		//try cache first
		if (cache.currentShows !== undefined && 
			cache.currentShows.retrievalDate &&
			(Date.now() - cache.currentShows.retrievalDate) < 86400000){	//within 1 day
			console.log('YES used DA cache for getCurrentShows');
			return cache.currentShows;
		}
		else {
			let response = config.DEV_MODE ? 
				fs.readFileSync("current.html") : 
				await axios.get(config.CURRENT_SHOWS_API_URL);

			//parse the response
			let currentShows = await ripCurrentFromScheduleApi(response.data);

			//update cache
			cache.currentShows = {
				retrievalDate: Date.now(),
				data: currentShows
			};
			return cache.currentShows;
		}
	}
	catch(e){
		console.error(e);
	}
}

// new version to support subsplease schedule api
async function ripCurrentFromScheduleApi(data){
	const currentShows = [];
	if (data && data.schedule) {
		// concat all the days into one array
		for (const weekday in data.schedule) {
			const airsOnWeekday = data.schedule[weekday].map(showObj => {
				return showObj.title;
			});
			currentShows.push(...airsOnWeekday);
		}
	}
	else {
		console.error('schedule does not exist in returned data');
		console.log(data);
	}
	const sortedShows = currentShows.sort();
	return sortedShows;
}

// new version to support subsplease
async function ripCurrentFromPage2(page){
	let $ = cheerio.load(page);
	let indShowDivs = $(".all-shows-link").toArray();
	return indShowDivs.map((div) => {
		if (div.children[0]){
			if (div.children[0].attribs){
				return div.children[0].attribs.title;
			}
			else {
				console.log('weird case');
				console.log(JSON.stringify(div.children[0].attribs));
			}
		}
		else {
			console.log("no a href child in ind-show");
		}
	});
}

//returns an array of strings as current show
async function ripCurrentFromPage(page){
	try {
		let $ = cheerio.load(page);
		let indShowDivs = $(".ind-show").toArray();
		return indShowDivs.map((div) => {
			//always linkful now yay!
			if (div.children[0]){
				if (div.children[0].attribs){
					return div.children[0].attribs.title;
				}
				else {
					console.log('weird case');
					console.log(JSON.stringify(div.children[0].attribs));
				}
			}
			else {
				console.log("no a href child in ind-show");
			}

			//old page style code, leave in case horriblesubs reverts in the future
			/* if (div.attribs.class.indexOf("linkful") > 0){
				//this is linkful, rip from title
				return div.children[0].attribs.title;
			}
			else if (div.attribs.class.indexOf("linkless") > 0){
				//linkless, directly get from text
				return div.children[0].data;
			}
			else {
				console.log("unhandled div in rip current");
			}*/
		});
	}
	catch(e){
		console.error(e);
	}
}

async function getRssFeed(){
	try {
		let response = /*config.DEV_MODE ? 
			fs.readFileSync("rss.xml") : */
			await axios.get(config.RSS_FEED_URL);
		return response.data;
	}
	catch(e){
		console.error(e);
	}
}

async function getAllMagnets(){
	try {
		let rssFeed = await getRssFeed();
		let everything = await parseXml(rssFeed);
		let items = everything.rss.channel[0].item;

		return items.map(m => (new Torrent(m.title[0], m.link[0], m.pubDate[0])));
	}
	catch(e){
		console.error(e);
	}
}

async function getFilteredMagnets(shows, resolution){
	try {
		let rssFeed = await getRssFeed();
		let everything = await parseXml(rssFeed);
		let items = everything.rss.channel[0].item;
		return items.filter(item => {
			//all info in title
			//do resolution first
			if (item.title &&item.title.length > 0){
				let fileName = item.title[0];
				if (fileName.includes(resolution)){
					//do title now
					for (let i = 0; i < shows.length; ++i){
						if (fileName.includes(shows[i])){
							return true;
						}
					}
				}
			}
			return false;
		}).map(item => (item.link[0]));
	}
	catch(e){
		console.error(e);
	}
}

function parseXml(xml){
	return new Promise((res, rej) => {
		parseString(xml, function (err, result) {
			if (err) {
				return rej(err);
			}
			else {
				return res(result);
			}
		});
	});
}


module.exports = {
	'getCurrentShows': getCurrentShows,
	'getRssFeed': getRssFeed,
	'getFilteredMagnets': getFilteredMagnets,
	'getAllMagnets': getAllMagnets
};
