const express = require('express');
const sqlite3 = require('sqlite3');
const bodyParser = require('body-parser');

const app = express();
const db = new sqlite3.Database('cricketTeam.db');

app.use(bodyParser.json());

// API 1: Get all players
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

// API 2: Create a new player
app.post("/players/", (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;

  if (!playerName || !jerseyNumber || !role) {
    response.status(400).json({ error: 'Incomplete data. Please provide all fields.' });
    return;
  }

  db.run(
    'INSERT INTO cricket_team (player_name, jersey_number, role) VALUES (?, ?, ?)',
    [playerName, jerseyNumber, role],
    function (err) {
      if (err) {
        console.error(err.message);
        response.status(500).json({ error: 'Internal Server Error' });
        return;
      }
      response.json({ message: 'Player Added to Team' });
    }
  );
});

// API 3: Get a player by ID
app.get("/players/:playerId/", (request, response) => {
  const playerId = request.params.playerId;

  db.get('SELECT * FROM cricket_team WHERE player_id = ?', [playerId], (err, row) => {
    if (err) {
      console.error(err.message);
      response.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    if (!row) {
      response.status(404).json({ error: 'Player not found' });
      return;
    }
    response.json(row);
  });
});

// API 4: Update player details by ID
app.put("/players/:playerId/", (request, response) => {
  const playerId = request.params.playerId;
  const { playerName, jerseyNumber, role } = request.body;

  if (!playerName || !jerseyNumber || !role) {
    response.status(400).json({ error: 'Incomplete data. Please provide all fields.' });
    return;
  }

  db.run(
    'UPDATE cricket_team SET player_name = ?, jersey_number = ?, role = ? WHERE player_id = ?',
    [playerName, jerseyNumber, role, playerId],
    function (err) {
      if (err) {
        console.error(err.message);
        response.status(500).json({ error: 'Internal Server Error' });
        return;
      }
      response.json({ message: 'Player Details Updated' });
    }
  );
});

// API 5: Delete a player by ID
app.delete("/players/:playerId/", (request, response) => {
  const playerId = request.params.playerId;

  db.run('DELETE FROM cricket_team WHERE player_id = ?', [playerId], function (err) {
    if (err) {
      console.error(err.message);
      response.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    if (this.changes === 0) {
      response.status(404).json({ error: 'Player not found' });
      return;
    }
    response.json({ message: 'Player Removed' });
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
