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
	</div>`
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
	data: function(){
		return {
			classObj: {
				following: this.data.following,
				'notFollowing': !this.data.following
			},
			buttonText: this.data.following ? '▼': '▲',
			buttonClass: this.data.following ? 'remove': 'add'
		}
	},
	template: `
	<div class="show" v-bind:class="classObj">
		<span>{{ data.title }}</span>
		<span v-if="data.following" class="badge">watching</span>
		<button class="actionable" v-bind:class="buttonClass">{{ buttonText }}</button>
	</div>`
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
				return a.title > b.title;
			}
		}));
}

function updateFollowing(updatedList){
	//fire and forget for now? tehe?
	return fetch('updateFollowing', {
		method: 'PUT',
		body: updatedList
	});
}

/*
$(async function(){
	//main entry point when page starts
	let currentSeason;
	let selected;

	currentSeason = await getCurrentSeason();
	console.log(currentSeason)
	following = await getFollowing();
	console.log(following)

	$('#root').append(currentSeason).append(following);
});


function updateFollowing(){
	// return new Promise(res => {
	// 	//aparently jquery gets fail silently now
	// 	$.put('updateFollowing', data => {
	// 		res(data);
	// 	});
	// });
}
*/