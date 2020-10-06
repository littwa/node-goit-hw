const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const userRouter = require("./app/contacts/routers");

require("dotenv").config();

class ContactsServer {
  constructor() {
    this.server = null;
  }

  async startServer() {
    this.initServer();
    this.initMiddleware();
    this.initRoutes();
    await this.initDatabase();
    this.listenServer();
  }
  initServer() {
    this.server = express();
  }
  initMiddleware() {
    this.server.use(morgan("combined"));
    this.server.use(express.json());
    this.server.use(cors());
  }
  initRoutes() {
    this.server.use("/api", userRouter);
  }

  async initDatabase() {
    const option = { useUnifiedTopology: true, useNewUrlParser: true };
    try {
      await mongoose.connect(process.env.MONGO_URL, option);
      console.log("Database connection successful");
    } catch (err) {
      console.log(`Server was closed with connect to db`);
      process.exit(1);
    }
  }

  listenServer() {
    this.server.listen(process.env.PORT, () =>
      console.log("Success listen port:" + process.env.PORT),
    );
  }
}
new ContactsServer().startServer();
