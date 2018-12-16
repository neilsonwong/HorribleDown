/* define vue components */
new Vue({
	el: '#root',
	data: {
		currentSeason: []
	},
	components: {

	},
	async created() {
		this.currentSeason = await getCurrentSeason();
	}
});

Vue.component('topbar', {
	props: [],
	template: `
	<div class="topbar">
		<h1 class="woah-the-colours">A Pretty Horrible Downloader</h1>
		<div>
			<a class="right-button" href="#" v-on:click="changePort(8112)">Deluge</a>
			<a class="right-button" href="https://neilson.pw/Torrents">Windrunner</a>
		</div>
	</div>`,
	methods: {
		changePort: function(port){
			window.location.port = port;
		}
	}
});

Vue.component('seasonlisting', {
	props: ['data'],
	data: function() {
		let today = new Date();
		let month = today.getMonth();
		let season;
		if (month < 3) {
			season = 'Winter';
		}
		else if (month < 6) {
			season = 'Spring';
		}
		else if (month < 9) {
			season = 'Summer';
		}
		else {
			season = 'Fall';
		}

		return {
			season: season,
			year: today.getFullYear()
		};
	},
	template: `
	<div class="season-listing">
		<h2 class="season-name">{{ season }} {{ year }}</h2>
		<ul>
			<li v-for="series in data">
				<show v-bind:key="series.title" v-bind:data="series" ></show>
			</li>
		</ul>
	</div>`
});

Vue.component('show', {
	props: ['data'],
	computed: {
		classObj() {
			return {
				following: this.data.following,
				'notFollowing': !this.data.following
			};
		},
		buttonText(){ return this.data.following ? 'remove_circle': 'add_circle'; },
		buttonClass() { return this.data.following ? 'remove': 'add'; }
	},
	template: `
	<div class="show" v-bind:class="classObj">
		<span>{{ data.title }}</span>
		<span v-if="data.following" class="badge">watching</span>
		<button class="actionable" v-bind:class="buttonClass" v-on:click="updateCurrentSeason(buttonClass, data.title)">
			<i class="material-icons">{{ buttonText }}</i>
		</button>
	</div>`,
	methods: {
		updateCurrentSeason: function(change, value){
			if (change === 'add') {
				this.data.following = true;
				updateFollowing({
					series: value, 
					following: true
				});
			}
			else if (change === 'remove'){
				this.data.following = false;
				updateFollowing({
					series: value, 
					following: false
				});
			}
		}
	}
});


function getCurrentSeason(){
	//fetch already a promise
	return fetch('currentSeason')
		.then(response => response.json())
		.then(shows => shows.sort((a, b) => {
			if (a.following === true && b.following === false){
				return -1;
			}
			else if (b.following === true && a.following === false){
				return 1;
			}
			else {
				return a.title > b.title ? 1 : -1;
			}
		}));
}

function updateFollowing(updatedChanges){
	//fire and forget for now? tehe?
	console.log(updatedChanges)
	return fetch('updateFollowing', {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(updatedChanges)
	});
}