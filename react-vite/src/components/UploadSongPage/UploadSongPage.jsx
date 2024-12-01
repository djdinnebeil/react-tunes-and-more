import {useEffect, useRef, useState} from 'react';
import jsmediatags from 'jsmediatags';
import {useSelector} from "react-redux";

const UploadSongPage = () => {
  const [file, setFile] = useState(null);
  const sessionUser = useSelector((state) => state.session.user);
  const fileInputRef = useRef(null);
  const [songs, setSongs] = useState([]);
  const [editingSongId, setEditingSongId] = useState(null);

  useEffect(() => {
    fetchUploadedSongs();
  }, []);

  const [metadata, setMetadata] = useState({
    name: '',
    artist: '',
    album: '',
    genre: 'Unknown',
    duration: 0,
  });
  const [isMetadataVisible, setIsMetadataVisible] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({
    progress: 0,
    isUploading: false,
    successMessage: '',
    errorMessage: '',
  });

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setIsMetadataVisible(false);
    setUploadStatus({ ...uploadStatus, successMessage: '', errorMessage: '' });
  };

  const extractMetadata = () => {
    if (!file) {
      alert('Please select a file.');
      return;
    }

    jsmediatags.read(file, {
      onSuccess: (tag) => {
        const { tags } = tag;
        setMetadata((prev) => ({
          ...prev,
          name: tags.title || '',
          artist: tags.artist || '',
          album: tags.album || '',
          genre: tags.genre || 'Unknown',
        }));

        const audio = new Audio(URL.createObjectURL(file));
        audio.addEventListener('loadedmetadata', () => {
          setMetadata((prev) => ({ ...prev, duration: Math.round(audio.duration) }));
          setIsMetadataVisible(true);
        });
      },
      onError: (error) => {
        console.error('Error reading metadata:', error);
        alert('Could not extract metadata. Please fill the form manually.');
        setIsMetadataVisible(true);
      },
    });
  };

  const handleMetadataChange = (event) => {
    const { name, value } = event.target;
    setMetadata((prev) => ({ ...prev, [name]: value }));
  };

  const fetchUploadedSongs = async () => {
  try {
    const response = await fetch('/api/songs/upload/history');
    if (response.ok) {
      const data = await response.json();
      setSongs(data);
    } else {
      console.error('Failed to fetch uploaded songs.');
    }
  } catch (error) {
    console.error('Error fetching uploaded songs:', error);
  }
};

const handleEditSong = (song) => {
    console.log(`Editing song: ${song.id}`);
  setEditingSongId(song.id);
  setMetadata({
    name: song.name,
    artist: song.artist,
    album: song.album,
    genre: song.genre,
    duration: song.duration,
  });
};

const renderSong = (song) => {
  const songItemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    borderBottom: '1px solid #ddd',
  };

  const buttonGroupStyle = {
    display: 'flex',
    gap: '10px',
  };

  const buttonStyle = {
    padding: '5px 10px',
    fontSize: '14px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
  };

  const editButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#007bff',
    color: 'white',
  };

  const removeButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#dc3545',
    color: 'white',
  };

  if (editingSongId === song.id) {
    return (
      <form
        onSubmit={(e) => handleUpdateSong(e, song.id)}
        style={songItemStyle}
      >
        <input
          type="text"
          name="name"
          value={metadata.name}
          onChange={handleMetadataChange}
          required
          style={{ flex: 1, marginRight: '10px' }}
        />
        <input
          type="text"
          name="artist"
          value={metadata.artist}
          onChange={handleMetadataChange}
          required
          style={{ flex: 1, marginRight: '10px' }}
        />
        <div style={buttonGroupStyle}>
          <button type="submit" style={editButtonStyle}>
            Save
          </button>
          <button
            type="button"
            style={removeButtonStyle}
            onClick={() => setEditingSongId(null)}
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div style={songItemStyle}>
      <span>
        <strong>{song.name}</strong> by {song.artist}
      </span>
      <div style={buttonGroupStyle}>
        <button
          style={editButtonStyle}
          onClick={() => handleEditSong(song)}
        >
          Edit
        </button>
        <button
          style={removeButtonStyle}
          onClick={() => handleRemoveSong(song.id)}
        >
          Remove
        </button>
      </div>
    </div>
  );
};


  const handleUpdateSong = async (event, songId) => {
    event.preventDefault();

  try {
    const response = await fetch(`/api/songs/update/${songId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    });

    if (response.ok) {
      const updatedSong = await response.json();
      setSongs((prevSongs) =>
        prevSongs.map((song) =>
          song.id === songId ? updatedSong : song
        )
      );
      setEditingSongId(null);
      setMetadata({
        name: '',
        artist: '',
        album: '',
        genre: 'Unknown',
        duration: 0,
      });
    } else {
      console.error('Error updating song');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!file) {
      setUploadStatus({ ...uploadStatus, errorMessage: 'Please select a file to upload.' });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    Object.entries(metadata).forEach(([key, value]) => formData.append(key, value));

    setUploadStatus({ ...uploadStatus, isUploading: true, progress: 0, errorMessage: '' });

    try {
      const response = await fetch('/api/songs/upload/save', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setUploadStatus({
          progress: 100,
          isUploading: false,
          successMessage: `${metadata.name} uploaded successfully!`,
          errorMessage: '',
        });
        setMetadata({
          name: '',
          artist: '',
          album: '',
          genre: 'Unknown',
          duration: 0,
        });
        setIsMetadataVisible(false);
        await fetchUploadedSongs();

      } else {
        const errorData = await response.json();
        setUploadStatus({
          ...uploadStatus,
          isUploading: false,
          errorMessage: errorData.errors || 'Upload failed. Please try again.',
          successMessage: '',
        });
      }
    } catch (error) {
      setUploadStatus({
        ...uploadStatus,
        isUploading: false,
        errorMessage: `An unexpected error occurred: ${error.message}`,
      });
    }
  };

  const handleRemoveSong = async (songId) => {
      if (!window.confirm('Are you sure you want to remove this song?')) return;

  try {
    const response = await fetch(`/api/songs/remove/${songId}`, {
      method: 'GET',
    });

    if (response.ok) {
      setSongs((prevSongs) => prevSongs.filter((song) => song.id !== songId));
    } else {
      const errorData = await response.json();
      console.error('Error removing song:', errorData.error || 'Unknown error');
      alert(errorData.error || 'Failed to remove the song. Please try again.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An unexpected error occurred. Please try again.');
  }
};


    if (!sessionUser) {
    return <p>You must login to upload music.</p>
  }
  return (
    <div className="upload-song">
      <h1>Upload a Song</h1>
      <form>
        <label htmlFor="file">MP3 File:</label>
        <input
          type="file"
          id="file"
          accept=".mp3"
          ref={fileInputRef}
          onChange={handleFileChange}
          required
        />
        <button type="button" onClick={extractMetadata}>
          Extract Metadata
        </button>
      </form>

      {isMetadataVisible && (
        <div>
          <br/><br/>
          <h2>Edit Song Details</h2>
          <form onSubmit={handleUpload}>
            <label htmlFor="name">Song Name:</label>
            <input
              type="text"
              name="name"
              id="name"
              value={metadata.name}
              onChange={handleMetadataChange}
              required
            />
            <label htmlFor="artist">Artist:</label>
            <input
              type="text"
              name="artist"
              id="artist"
              value={metadata.artist}
              onChange={handleMetadataChange}
              required
            />
            <label htmlFor="album">Album:</label>
            <input
              type="text"
              name="album"
              id="album"
              value={metadata.album}
              onChange={handleMetadataChange}
            />
            <label htmlFor="genre">Genre:</label>
            <input
              type="text"
              name="genre"
              id="genre"
              value={metadata.genre}
              onChange={handleMetadataChange}
            />
            <label htmlFor="duration">Duration (seconds):</label>
            <input
              type="number"
              name="duration"
              id="duration"
              value={metadata.duration}
              onChange={handleMetadataChange}
              readOnly={true}
              style={{backgroundColor: '#e9ecef', color: '#343a40'}}
              required
            />
            <button type="submit">
              Upload
            </button>

          </form>
          {uploadStatus.isUploading && <p>Uploading</p>}
        </div>
      )}

      {uploadStatus.successMessage && (
        <div style={{color: 'green', textAlign: 'center'}}>{uploadStatus.successMessage}</div>
      )}

      {uploadStatus.errorMessage && (
        <div style={{color: 'red', textAlign: 'center'}}>{uploadStatus.errorMessage}</div>
      )}
      <div>
        <br/><br/>
        <h2>Your Songs</h2>
        <div
          style={{
            border: '1px solid #ddd',
            borderRadius: '5px',
            padding: '10px',
            maxWidth: '600px',
            margin: '0 auto',
            backgroundColor: '#f9f9f9',
          }}
        >
          {songs.length === 0 ? (
            <p style={{textAlign: 'center', color: '#666'}}>No songs uploaded yet.</p>
          ) : (
            <ul style={{listStyle: 'none', padding: '0', margin: '0'}}>
              {songs.map((song) => (
                <li key={song.id}>{renderSong(song)}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

    </div>
  );

};

export default UploadSongPage;
