
	$('.progression-playlist').mediaelementplayer({
		audioWidth: 400, // width of audio player
		audioHeight:40, // height of audio player
		startVolume: 0.5, // initial volume when the player starts
		features: ['playlistfeature', 'prevtrack', 'playpause', 'nexttrack','current', 'progress', 'duration', 'volume', 'playlist'],
		playlist: true, //Playlist Show
		playlistposition: 'bottom' //Playlist Location
		});
