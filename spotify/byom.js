var Byom = function() {
	var playlist = [];
	var playingSong = null;

	this.mock = function() {
		playlist.push({
			spotifyId: 'banananana',
			artist: 'John Doe',
			title: 'Singing bananas',
			usersCount: 2,
			users: ['Raibaz', 'Abahgat']
		});

		playlist.push({
			spotifyId: 'rananana',
			artist: 'Jesse James',
			title: 'Everybody',
			usersCount: 1,
			users: ['Raibaz']
		})
	}

	this.updatePlaylist = function() {
		var playlistUl = $('#playlist');
		playlistUl.empty();
		$.each(playlist, function(index, value) {
			playlistUl.add('<li class="playlist-track"><span class="song-title">' + value.title + '</span><span class="song-artist">' + value.artist + '</span>');
		});
	}

	this.songFinished = function() {
		var nextSong = playlist.splice(0, 1);
		if(nextSong.length > 0) {
			playingSong = nextSong[0];
			$('#playing-title').html(playingSong.title);
			$('#playing-artist').html(playingSong.artist);
		} else {
			$('#playing-song').html('End of playlist :(');
		}
		
	}


}