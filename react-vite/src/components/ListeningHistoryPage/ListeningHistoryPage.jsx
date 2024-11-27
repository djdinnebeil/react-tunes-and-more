import {useState, useEffect} from 'react';
import {useSelector} from "react-redux";

const ListeningHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const sessionUser = useSelector((store) => store.session.user);

  useEffect(() => {
    fetch('/api/songs/history')
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setHistory(data);
        } else {
          console.error('Unexpected data format:', data);
          setHistory([]);
        }
      })
      .catch((error) => {
        console.error('Error fetching history:', error);
        setHistory([]);
      });
  }, []);


  // Reset play count for a specific song
  const resetPlayCount = (historyId) => {
    if (!window.confirm('Are you sure you want to reset the play count for this song?')) {
      return;
    }

    fetch(`/api/songs/history/reset/${historyId}`, {method: 'POST'})
      .then((response) => {
        if (!response.ok) {
          return response.json().then((err) => {
            throw new Error(err.error || 'Failed to reset play count');
          });
        }
        return response.json();
      })
      .then(() => {
        setHistory((prevHistory) =>
          prevHistory.map((entry) =>
            entry.id === historyId ? {...entry, play_count: 0} : entry
          )
        );
      })
      .catch((error) => {
        console.error('Error resetting play count:', error);
        alert('Failed to reset play count. Please try again.');
      });
  };

  // Remove a song from the history
  const removeFromHistory = (historyId) => {
    if (!window.confirm('Are you sure you want to remove this song from your history?')) {
      return;
    }

    fetch(`/api/songs/history/remove/${historyId}`, {method: 'DELETE'})
      .then((response) => {
        if (!response.ok) {
          return response.json().then((err) => {
            throw new Error(err.error || 'Failed to remove song from history');
          });
        }
        return response.json();
      })
      .then(() => {
        setHistory((prevHistory) =>
          prevHistory.filter((entry) => entry.id !== historyId)
        );
      })
      .catch((error) => {
        console.error('Error removing song from history:', error);
        alert('Failed to remove song. Please try again.');
      });
  };

  if (!sessionUser) {
    return <p>You must be logged in to view your history.</p>
  }
  return (
    <div className="listening-history">
      <h1>Your Listening History</h1>

      {history.length === 0 ? (
        <p>You have no listening history yet. Start playing some music!</p>
      ) : (
        <div className="centered-table">
          <table className="history-table">
            <thead>
            <tr>
              <th className="text-left-align">Song</th>
              <th>Artist</th>
              <th>Play Count</th>
              <th>Last Played</th>
              <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            {Array.isArray(history) &&
              history.map((entry) => (
                <tr key={entry.id} data-history-id={entry.id}>
                  <td className="text-left-align">{entry.song.name}</td>
                  <td>{entry.song.artist}</td>
                  <td className="play-count">{entry.play_count}</td>
                  <td>{entry.last_played}</td>
                  <td>
                    <button
                      onClick={() => resetPlayCount(entry.id)}
                      className="reset-button"
                    >
                      Reset Play Count
                    </button>
                    <button
                      onClick={() => removeFromHistory(entry.id)}
                      className="remove-button"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ListeningHistoryPage;
