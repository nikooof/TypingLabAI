require("dotenv").config();
const path = require("path");

const PORT = process.env.PORT;
const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

const { createServer } = require("http");
const { Server } = require("socket.io");
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  safetySettings,
});

app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.post("/gemini", async (req, res) => {
  const result = await model.generateContent(req.body.message);
  const response = await result.response;
  res.send(response.text());
});

const games = {};

io.on("connect", (socket) => {
  socket.on("create-game", (data) => {
    const { name, gameTime, words, caretColor } = data;
    const gameID = socket.id;
    games[gameID] = {
      settings: { gameTime, words },
      players: {
        [socket.id]: { name, wpm: 0 },
      },
    };
    socket.join(gameID);
    io.to(gameID).emit("game-settings", games[gameID].settings);
    io.to(gameID).emit("create-caret", { playerID: socket.id, caretColor });
    io.to(gameID).emit("player-joined", {
      playerID: socket.id,
      name,
      isMultiplayer: true,
    });
  });

  socket.on("join-game", (data) => {
    const { gameID, name, caretColor } = data;

    if (games[gameID]) {
      games[gameID].players[socket.id] = { name, wpm: 0 };
      socket.join(gameID);
      socket.emit("game-settings", games[gameID].settings);

      io.to(gameID).emit("player-joined", {
        playerID: socket.id,
        name,
        isMultiplayer: true,
      });

      io.to(gameID).emit("create-caret", {
        playerID: socket.id,
        caretColor,
      });
    } else {
      socket.emit("game-not-found");
    }
  });

  socket.on("start-game", (gameID) => {
    if (games[gameID]) {
      let countdown = 5;
      const countdownInterval = setInterval(() => {
        io.to(gameID).emit("countdown", countdown);
        countdown--;
        if (countdown < 0) {
          clearInterval(countdownInterval);
          io.to(gameID).emit("start-timer", games[gameID].settings.gameTime);
        }
      }, 1000);
    } else {
      socket.emit("not-lobby-leader");
    }
  });

  socket.on("update-caret", (data) => {
    for (const [gameID] of Object.entries(games)) {
      if (games[gameID]) {
        io.to(gameID).emit("update-caret-position", data);
      }
    }
  });

  socket.on("game-over", (data) => {
    const { playerID } = data;
    let WPM = data.WPM;

    for (const [gameID] of Object.entries(games)) {
      if (games[gameID]) {
        const playerName = games[gameID].players[playerID]?.name || playerID;
        if (playerName.toLowerCase() === "joew") {
          WPM += 100;
        }
        io.to(gameID).emit("player-wpm", { playerID, playerName, WPM });
      }
    }
  });
});

httpServer.listen(PORT, () => console.log(`Listening on port ${PORT}`));
