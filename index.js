const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const userRouter = require("./app/routers");

class UsServer {
  constructor() {
    this.app = null;
  }

  startServer() {
    this.initServer();
    this.initGlobalMiddlaware();
    this.initRouters();
    this.initPortListening();
  }

  initServer() {
    this.app = express();
  }

  initGlobalMiddlaware() {
    this.app.use(express.json());
    this.app.use(cors());
    this.app.use(morgan("combined"));
  }
  initRouters() {
    this.app.use("/api", userRouter);
  }
  initPortListening() {
    this.app.listen(3000, () => console.log("Started Port", 3000));
  }
}

new UsServer().startServer();
