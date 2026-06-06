import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import {createServer} from "node:http";
import {Server} from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
const app = express();
import {connectToSocket} from "./controllers/socketManager.js";
import userRouter from "./routes/users.routes.js"


const server = createServer(app);
const io = connectToSocket(server);



app.set("port", process.env.PORT || 8000);
app.use(cors());

app.use(express.json({limit: "40kb"}));
app.use(express.urlencoded({limit: "40kb", extended: true}));

app.use("/api/v1/users", userRouter);

app.get("/home",(req,res)=>{
  return res.json({"hello":"world"});
})

const start = async ()=>{
  app.set("mongo_user")
  const connectionDB = await mongoose.connect(process.env.MONGO_URL);
  console.log("MONGO CONNECTED");
  server.listen(app.get("port"), ()=>{
    console.log("listening to PORT 8000");
  })
}

start();