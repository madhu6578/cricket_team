const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/players/", async (request, response) => {
  const getDetails = `
    SELECT 
    *
    FROM 
    cricket_team 
    ORDER BY 
    player_id
    `;
  const dbResponse = await db.all(getDetails);
  response.send(dbResponse);
});

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;

  const { playerName, jerseyNumber, role } = playerDetails;
  console.log(playerDetails);

  const addPlayer = `
     INSERT INTO 
     cricket_team (player_name,jersey_number,role)
     VALUES(
         ${playerName},
         ${jerseyNumber},
         ${role}
     );`;

  const dbResponse = await db.run(addPlayer);
  const playerId = dbResponse.lastID;
  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const getPlayer = `
    SELECT 
    *
    FROM 
    cricket_team
    WHERE 
    player_id = ${playerId};
    `;
  const dbResponse = await db.all(getPlayer);
  response.send(dbResponse);
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;

  const updateDetails = `
    UPDATE 
    cricket_team 
    SET 
    player_name = '${playerName}',
    jersey_number = ${jerseyNumber},
    role = '${role}'
    WHERE 
    player_id = ${playerId};`;

  await db.run(updateDetails);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;

  const deleteRow = `
    DELETE FROM 
    cricket_team 
    WHERE 
    player_id = ${playerId};`;
  await db.run(deleteRow);
  response.send("Player Removed");
});
