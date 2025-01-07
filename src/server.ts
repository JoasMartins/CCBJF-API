import express from "express"
import cors from "cors"
import options from "../credentials"
const { Server } = require("socket.io");
const http = require("http");
import { connectToDatabase } from "./configs/DatabaseConfig"
import { router } from "./routes"

const app = express()
const server = http.createServer(app);

const corsOptions = { origin: "*", optionsSuccessStatus: 200 }
const io = new Server(server, { cors: { origin: "*" } }); // Permitir CORS

app.use(cors(corsOptions))
app.use(express.json())
app.use(router)
app.use(express.static("src/database"))

io.on("connection", (socket) => {
  console.log("WEBSOCKET: Novo cliente conectado!");

  socket.on("disconnect", () => {
    console.log("WEBSOCKET: Cliente desconectado");
  });
});

console.log(options)

const PORT = process.env.PORT || 4000;
server.listen(PORT, async () => {
  console.log(`🟩 Servidor rodando na porta ${PORT}`);
});