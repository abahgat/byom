
var Byom = function() {
	var api_base_url = 'http://api.usergrid.com/diderikvw/byom/';
	var jukebox_uuid = 'b29c4d6f-3bea-11e2-9141-02e81ae640dc';
	
	var playlist = [];
	var playingSong = null;	
	var swipes_poll;
	var latest_swipes_poll = 0;
	var jukebox_poll;
	var latest_jukebox_poll = 0;
			
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
		var nextSong = computeNextSong();
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
		$.getJSON('http://api.usergrid.com/diderikvw/byom/jukeboxes/', function(data) {
			console.log(data);
			if(data.entities[0].modified > latest_jukebox_poll) {
				$.each(data.entities[0].playlists, function(index, value) {				
					console.log('playlist ' + value);
					byom.addSpotifyPlaylist(value);
				});			
			}
			latest_jukebox_poll = data.entities[0].modified;
		})
	}

	this.startSwipesPoll = function() {
		swipes_poll = setInterval(getSwipes, 5000);
	}

	this.stopSwipesPoll = function() {
		clearInterval(swipes_poll);
	}

	this.startJukeboxPoll = function() {
		jukebox_poll = setInterval(this.getJukebox, 5000);
	}

	this.stopJukeboxPoll = function() {
		clearInterval(jukebox_poll);
	}

	this.getPlaylist = function() {
		//Ask apigee for the latest playlist
	}

	this.getCards = function() {
		$.getJSON(api_base_url + 'cards', function(data) {
			console.log(data);
		});
	}

	var getSwipes = function() {		
		console.log(latest_swipes_poll);
		$.getJSON(api_base_url + 'swipes/', function(data) {
			console.log(data);
			$.each(data.entities, function(index, value) {
				$.getJSON(api_base_url + "cards?filter=uid%3D'" + value.carduid + "'", function(card_data) {							
					if(typeof(card_data.entities) == 'object' && card_data.entities.length > 0 && card_data.entities[0].modified > latest_swipes_poll) {
						//byom.addSpotifyPlaylist(card_data.entities[0].playlist);
						byom.addPlayListToJukebox(card_data.entities[0].playlist);												
					}
					latest_poll = data.timestamp;
				});
			});			
		})
		//For each swipe, get the spotify playlist id for the card and delete the swipe

	}
	
	this.addPlayListToJukebox = function(playlistURI) {
		$.getJSON(api_base_url + '/jukeboxes/' + jukebox_uuid, function(data) {
			var playlists = data.entities[0].playlists;			
			var found = false;
			for(i in playlists) {
				if(playlists[i] == playlistURI) {
					found = true;
					break;
				}
			}
			if(!found) {
				playlists.push(playlistURI);
			}
			console.log(playlists);
			$.ajax({
				type: 'PUT',
				url: api_base_url + 'jukeboxes/' + jukebox_uuid,
				dataType: 'json',
				data: JSON.stringify({"playlists": playlists}),
				processData: false,
				contentType: 'application/json'				
			});
		});
	}

	this.addSpotifyPlaylist = function(playlistURI) {				
		models.Playlist.fromURI(playlistURI).load('name', 'tracks', 'owner').done(function(spotifyPlaylist) {			
			lastplaylist = spotifyPlaylist;
			models.User.fromURI(spotifyPlaylist.owner).load().done(function(user) {
				spotifyPlaylist.tracks.snapshot().done(function(tracks) {
					for(var i = 0; i < tracks.length; i++) {						
						var lasttrack = tracks.get(i);												
						if(playlist[lasttrack.uri] != undefined) {
							playlist[lasttrack.uri].owners.push[user];
						} else {
							lasttrack.owners = [user];
							playlist[lasttrack.uri] = lasttrack;
						}						
					}
					byom.updatePlaylist();
				});
			});			
		});		
	}

	var computeNextSong = function() {
		var candidate_next = null;
		for(i in playlist) {
			if(playlist.hasOwnProperty(i)) {
				if(candidate_next == null || candidate_next.owners.length < playlist[i].owners.length) {
					candidate_next = playlist[i];
				}
			}
		}
		return candidate_next;
	}

	var buildSongLi = function(song) {	
		console.log(song);
		//Probably ask spotify for the whole song data from the song id
		var ret =  '<li style="display: none"><span class="song-title">' + song.name + '</span>';
		if(typeof(song.artists) != undefined && song.artists.length <= 0) {
			return;
		} else {
			ret += '<span class="song-artist">' + song.artists[0].name + '<span><ul class="song-users">';
		}

		/*$.each(song.users, function(index, value) {						
			ret += '<li class="user">' + value + '</li>';
		});*/

		ret += '</ul></li>';

		return ret;
	}
}