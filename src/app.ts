import express from "express"
import { router } from "./routes"
import cors from "cors"
const { Server } = require("socket.io");
const http = require("http");

const app = express()
const server = http.createServer(app);

const corsOptions = { origin: "*", optionsSuccessStatus: 200 }
const io = new Server(server, { cors: { origin: "*" } }); // Permitir CORS

app.use(cors(corsOptions))
app.use(express.json())
app.use(router)
app.use(express.static("src/database"))

io.on("connection", (socket) => {
  console.log("Novo cliente conectado!");

  socket.on("disconnect", () => {
    console.log("Cliente desconectado");
  });
});

server.listen(3001, () => console.log("Servidor Socket.IO rodando na porta 3001"))

export { app, io }