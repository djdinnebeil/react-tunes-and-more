import { useState, useEffect } from 'react';
import {useSelector} from "react-redux";

const MusicPlayer = () => {
  const [songs, setSongs] = useState([]);
  const sessionUser = useSelector((state) => state.session.user);
  const [currentSongIndex, setCurrentSongIndex] = useState(null);

useEffect(() => {
  // Fetch songs for the current user
  fetch('/api/songs')
    .then((response) => response.json())
    .then((data) => {
      if (Array.isArray(data)) {
        setSongs(data);
      } else {
        console.error('Unexpected data format:', data);
        setSongs([]);
      }
    })
    .catch((error) => {
      console.error('Error fetching songs:', error);
      setSongs([]);
    });
}, []);

  const loadSong = (songIndex) => {
    if (songIndex < 0 || songIndex >= songs.length) {
      console.error('Invalid song index');
      return;
    }

    setCurrentSongIndex(songIndex);
    const song = songs[songIndex];
    const audioPlayer = document.getElementById('audio-player');
    const audioSource = document.getElementById('audio-source');
    const songInfo = document.getElementById('song-info');

    audioSource.src = song.file_url;
    audioPlayer.load();

    audioPlayer
      .play()
      .then(() => console.log('Playback started'))
      .catch((error) => console.error('Playback failed:', error));

    songInfo.textContent = `Now Playing: ${song.name} by ${song.artist}`;

    fetch(`/api/songs/play/${song.id}`, { method: 'POST' })
      .then((response) => response.json())
      .then((data) => console.log(`Play count updated: ${data.play_count}`))
      .catch((error) => console.error('Error updating play count:', error));
  };

  const nextSong = () => {
    if (currentSongIndex === null || songs.length === 0) {
      loadSong(0);
      return;
    }
    const nextIndex = (currentSongIndex + 1) % songs.length;
    loadSong(nextIndex);
  };

  const previousSong = () => {
    if (currentSongIndex === null || songs.length === 0) {
      loadSong(songs.length - 1);
      return;
    }
    const prevIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    loadSong(prevIndex);
  };

  const removeSong = (songId) => {
  if (!window.confirm('Are you sure you want to remove this song?')) return;

  fetch(`/api/songs/remove/${songId}`, { method: 'GET' })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((err) => {
          throw new Error(err.error || 'Failed to remove song');
        });
      }
      return response.json();
    })
    .then((data) => {
      console.log(`Song removed successfully: ${data.song_id}`);
      setSongs((prevSongs) => prevSongs.filter((song) => song.id !== songId));

      // Clear the music player if the current song is deleted
      if (songs[currentSongIndex]?.id === songId) {
        const audioPlayer = document.getElementById('audio-player');
        const audioSource = document.getElementById('audio-source');
        const songInfo = document.getElementById('song-info');

        audioPlayer.pause();
        audioSource.src = '';
        audioPlayer.load();
        songInfo.textContent = 'Select a song to play';

        setCurrentSongIndex(null); // Reset the current song index
      }
    })
    .catch((error) => {
      console.error('Error removing song:', error);
      alert('Failed to remove the song. Please try again.');
    });
};

  if (!sessionUser) {
    return <p>You must login to play music</p>
  }

  return (
    <div className="music-player">
      <h1>Your Music Player</h1>

      <div className="player">
        <h2>Now Playing</h2>
        <p id="song-info">Select a song to play</p>
        <audio id="audio-player" controls onEnded={nextSong}>
          <source id="audio-source" src="" type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
        <div className="player-controls">
          <button onClick={previousSong}>Previous</button>
          <button onClick={nextSong}>Next</button>
        </div>
      </div>

      <div className="song-list">
        <h2>Your Songs</h2>
        <div className="songs-grid">
  {Array.isArray(songs) && songs.length === 0 ? (
            <p>No songs added.</p>
          ) : (
                Array.isArray(songs) &&
            songs.map((song, index) => (
              <div className="song-card-row" key={song.id}>
                <div className="song-card">
                  <button onClick={() => loadSong(index)} className="play-button">
                    <div className="song-details">
                      <span className="song-name">{song.name}</span>
                      <span className="song-artist">{song.artist}</span>
                    </div>
                  </button>
                </div>
                <button onClick={() => removeSong(song.id)} className="remove-button">
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
