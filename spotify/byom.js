
var Byom = function() {
	var playlist = [];
	var playingSong = null;
	var poll;
			
	this.updatePlaylist = function() {
		console.log(playlist);
		var playlistUl = $('#playlist');
		playlistUl.empty();
		$.each(playlist, function(index, value) {			
			playlistUl.append(buildSongLi(value));			
		});
		playlistUl.find('li').each(function(index, value) {
			$(this).show('slow');
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
		this.scrollUpPlaylist();
	}

	this.scrollUpPlaylist = function() {
		$('#playlist li:first').hide('slow');
	}


	this.getJukebox = function() {
		$.getJSON('http://api.usergrid.com/diderikvw/byom/jukeboxes/fd3447c9-3bd9-11e2-9141-02e81ae640dc', function(data) {
			console.log(data);
			$.each(data.entities[0].playlists, function(index, value) {				
				console.log('playlist ' + value);
				models.Playlist.fromURI(value).load('name', 'tracks').done(function(spotifyPlaylist) {
					console.log('Playlist ' + JSON.stringify(spotifyPlaylist));
					lastplaylist = spotifyPlaylist;
					spotifyPlaylist.tracks.snapshot().done(function(tracks) {
						for(var i = 0; i < tracks.length; i++) {
							console.log('Track ' + JSON.stringify(tracks.get(i)));
							lasttrack = tracks.get(i);
							playlist.push(tracks.get(i));
						}
					});
				  	
				  	
				});

			});
			byom.updatePlaylist();
		})
	}

	this.startSwipesPoll = function() {
		poll = setInterval(getSwipes, 5000);
	}

	this.stopSwipesPoll = function() {
		clearInterval(poll);
	}

	this.getPlaylist = function() {
		//Ask apigee for the latest playlist
	}

	this.getCards = function() {
		$.getJSON('http://api.usergrid.com/diderikvw/byom/cards', function(data) {
			console.log(data);
		});
	}

	var getSwipes = function() {
		
		$.getJSON('http://api.usergrid.com/diderikvw/byom/swipes/', function(data) {
			$.each(data.entities, function(index, value) {

			});
		})
		//For each swipe, get the spotify playlist id for the card and delete the swipe

	}

	var getSpotifyPlaylist = function() {
		//Get a spotify playlist from apigee
		//For each track in the playlist, add it to the playlist var
	}

	var buildSongLi = function(song) {
		//Probably ask spotify for the whole song data from the song id
		var ret = '<li style="display: none"><span class="song-title">' + song.name + '</span><span class="song-artist">' + song.artists[0].name + '<span><ul class="song-users">';

		/*$.each(song.users, function(index, value) {						
			ret += '<li class="user">' + value + '</li>';
		});*/

		ret += '</ul></li>';

		return ret;
	}
}