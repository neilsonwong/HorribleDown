"use strict";

//api to horrible subs
const fs = require('fs');
const cheerio = require('cheerio');
const request = require('request-promise-native');
const parseString = require('xml2js').parseString;

const config = require('./config');

async function getCurrentShows(){
	try {
		let response = config.DEV_MODE ? 
			fs.readFileSync("current.html") : 
			await request.get(config.CURRENT_SHOWS_URL);

		//parse the response
		let currentShows = await ripCurrentFromPage(response);
		return currentShows;
	}
	catch(e){
		console.log(e);
	}
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
		console.log(e);
	}
}

async function getRssFeed(){
	try {
		let response = /*config.DEV_MODE ? 
			fs.readFileSync("rss.xml") : */
			await request.get(config.RSS_FEED_URL);
		return response;
	}
	catch(e){
		console.log(e);
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
		console.log(e);
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
	"getCurrentShows": getCurrentShows,
	"getRssFeed": getRssFeed,
	"getFilteredMagnets": getFilteredMagnets
};