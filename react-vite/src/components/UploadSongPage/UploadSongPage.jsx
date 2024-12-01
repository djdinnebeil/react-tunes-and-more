import {useRef, useState} from 'react';
import jsmediatags from 'jsmediatags';
import {useSelector} from "react-redux";

const UploadSongPage = () => {
  const [file, setFile] = useState(null);
  const sessionUser = useSelector((state) => state.session.user);
  const fileInputRef = useRef(null);


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

  const resetFileInput = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset the file input value
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
        // resetFileInput();
        setMetadata({
          name: '',
          artist: '',
          album: '',
          genre: 'Unknown',
          duration: 0,
        });
        setIsMetadataVisible(false);
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
              style={{backgroundColor: '#e9ecef', color:'#343a40'}}
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
        <div style={{ color: 'green', textAlign: 'center'}}>{uploadStatus.successMessage}</div>
      )}

      {uploadStatus.errorMessage && (
        <div style={{ color: 'red', textAlign: 'center' }}>{uploadStatus.errorMessage}</div>
      )}
    </div>
  );
};

export default UploadSongPage;
