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

function getCurrentSeason(){
	return new Promise(res => {
		//aparently jquery gets fail silently now
		$.get('currentSeason', data => {
			res(data);
		});
	});
}

function getFollowing(){
	return new Promise(res => {
		//aparently jquery gets fail silently now
		$.get('following', data => {
			res(data);
		});
	});
}

function updateFollowing(){
	// return new Promise(res => {
	// 	//aparently jquery gets fail silently now
	// 	$.put('updateFollowing', data => {
	// 		res(data);
	// 	});
	// });
}