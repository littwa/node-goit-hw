const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const userRouter = require("./app/routers");

app.use(express.json());
app.use(cors());
app.use(morgan("combined"));
app.use("/api", userRouter);

app.listen(3000, () => console.log("Started Port", 3000));
