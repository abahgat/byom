
var Byom = function() {
	var api_base_url = 'http://api.usergrid.com/diderikvw/byom/';
	var jukebox_uuid = 'b29c4d6f-3bea-11e2-9141-02e81ae640dc';
	
	var playlist = {};
	var playingSong = null;	
	var swipes_poll;
	var latest_swipes_poll = 0;
	var jukebox_poll;
	var latest_jukebox_poll = 0;
	var playlist_limit = 40;
			
	this.updatePlaylist = function() {
		console.log(playlist);
		$('#playlist-container').show();
		var playlistUl = $('#playlist');
		playlistUl.empty();
		$.each(playlist, function(index, value) {			
			playlistUl.append(buildSongLi(value));
		});
		var listitems = playlistUl.children('li').get();

		listitems.sort(function(a, b) {
   			return $(a).data('owners') < $(b).data('owners');
		});
		$.each(listitems, function(idx, itm) { 					
			playlistUl.append(itm);		
			//$(itm).hide().show('slow');
		});
		playlistUl.find('li').each(function(index, value) {
			$(this).show('slow');
		});		
	}

	this.songFinished = function() {

		if(playingSong != null) {
			delete playlist[playingSong.uri];
		}
		console.log('Current song is finished!');
		var nextSong = computeNextSong();
		if(nextSong != null) {
			playingSong = nextSong;		
			playSong(playingSong);
			$('#playing-cover').attr('src', playingSong.image);
			$('#playing-title').html(playingSong.name);
			$('#playing-artist').html(playingSong.artists[0].name);
			window.byom.scrollUpPlaylist(playingSong.uri);
		} else {
			$('#playing-song').html('End of playlist :(');
		}
		// yeah!! :S
		
	}

	this.moveUpLi = function(uri) {		

		var li = $('#playlist li[data-uri="' + uri + '"]');
		li.hide('slide', {direction: 'left'}, 1500).remove();					
		$(buildSongLi(playlist[uri])).insertBefore($('#playlist li[data-owners="' + (li.data('owners')) + '"]:first'));
		//newli = $('#playlist li[data-owners="' + (li.data('owners')) + '"]:first').insertBefore(buildSongLi(playlist[uri]));		
		$('#playlist li:first').show('slide', {direction: 'right'}, 1500, function() {
			$(this).effect('highlight', {color: '#FFFFFF'}, 2500);
		});
		$('.ui-effects-wrapper').hide();
	}

	this.scrollUpPlaylist = function(uri) {
		$('#playlist li[data-uri="' + uri + '"]').hide('slow').remove();
	}


	this.getJukebox = function() {
		$.getJSON(api_base_url + 'jukeboxes/' + jukebox_uuid, function(data) {
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
		swipes_poll = setInterval(getSwipes, 2500);
	}

	this.stopSwipesPoll = function() {
		clearInterval(swipes_poll);
	}

	this.startJukeboxPoll = function() {
		jukebox_poll = setInterval(this.getJukebox, 2500);
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
		console.log('getting swipes');
		console.log(latest_swipes_poll);
		$.getJSON(api_base_url + 'swipes/', function(data) {
			console.log(data);
			$.each(data.entities, function(index, value) {
				$.getJSON(api_base_url + "cards?filter=uid%3D'" + value.carduid + "'", function(card_data) {					
					if(typeof(card_data.entities) == 'object' && card_data.entities.length > 0 && data.entities[index].modified > latest_swipes_poll) {
						//byom.addSpotifyPlaylist(card_data.entities[0].playlist);
						byom.addPlayListToJukebox(card_data.entities[0].playlist);												
					} else {
						$.ajax({
							type:'DELETE',
							url: api_base_url + 'swipes/' + data.entities[index].uuid
						});
					}
					latest_swipes_poll = data.entities[index].modified;
				});
			});			
		})
		//For each swipe, get the spotify playlist id for the card and delete the swipe

	}
	
	this.addPlayListToJukebox = function(playlistURI) {
		console.log('Adding playlist ' + playlistURI + ' to jukebox');
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
			models.User.fromURI(spotifyPlaylist.owner).load('name', 'image').done(function(user) {
				spotifyPlaylist.tracks.snapshot().done(function(tracks) {
					//console.log("PLAYLIST OWNER " + JSON.stringify(user));
					for(var i = 0; (i < tracks.length && i < playlist_limit); i++) {						
						var lasttrack = tracks.get(i);												
						if(playlist[lasttrack.uri] != undefined && playlist[lasttrack.uri].owners.indexOf(user) == -1) {							
							playlist[lasttrack.uri].owners.push(user);
							byom.moveUpLi(lasttrack.uri);
						} else {
							lasttrack.owners = [user];
							playlist[lasttrack.uri] = lasttrack;
							$('#splash-screen').hide('slow');
							if($('#playlist li[data-uri="'+lasttrack.uri+'"]').length == 0) {
								$('#playlist').append(buildSongLi(lasttrack)).children('li').show('slow');
								$('#playlist li[data-uri="' + lasttrack.uri + '"]').effect('highlight', {color: '#FFFFFF'}, 2500);
							}
						}						
					}
					if (!models.player.playing) {
						// :S
						window.byom.songFinished();
					}	
					//byom.updatePlaylist();
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

		if (candidate_next != null) console.log('And the next song is... ' + candidate_next.name);
		
		return candidate_next;
	}

	var buildSongLi = function(song) {			
		var ret =  '<li style="display: none" class="playlist-item" data-uri="' + song.uri + '" data-owners="' + song.owners.length + '">';
		
		ret += '<img class="cover" src="sp://byom/track.png" data-album="' + song.album.uri + '" />';

		//console.log(song.artists);
		if(!song.artists || typeof(song.artists) == 'undefined' || song.artists.length <= 0) {
			return;
		} else {
			ret += '<span class="song-artist">' + song.artists[0].name + '</span><span> - </span>';
		}

		ret += '<span class="song-title">' + song.name + '</span>';

		ret += '<ul class="song-users">';
		$.each(song.owners, function(index, value) {						
			ret += '<li class="song-user"><img class="user-thumbnail" src="' + value.image + '" title="' + value.name + '"/></li>';
		});

		ret += '</ul></li>';

		song.album.load('image').done(function(album) {
			console.log('setting image for album ' + album.uri + ' to ' + album.image);
			playlist[song.uri].image = album.image;
			var f = function() {
				$('img[data-album="' + album.uri + '"]').attr('src', album.image);	
			}
			setTimeout(f, 500);
		});		

		return ret;
	}

	var playSong = function(song) {
		console.log('About to play ' + song.name);
		$('#playing-song').show('slow');
		models.player.playTrack(models.Track.fromURI(song.uri));
	}

	this.initCallback = function(callback) {
		console.log('setting callback');
		// Update the DOM when the song changes
	    models.player.addEventListener('change', updateCurrentTrack);

	    function updateCurrentTrack() {
	    	console.log('Update track');
	    	// song is finished
	        if (!models.player.playing && models.player.position == 0) {
	            console.log('What\'s next?');
	            callback();
	        } else {
	        	console.log('More?');
	        }
	    }
	}

	this.initCallback(this.songFinished);
}