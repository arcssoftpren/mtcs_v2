require("dotenv").config();
const express = require("express");
const http = require("http");
const path = require("path");
const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const app = express();

const IP = process.env.SERVER_IP || "127.0.0.1";
const PORT = process.env.SERVER_PORT || 3000;
const tool = require("./router/tools");

app.use(cors({ origin: "*", methods: ["POST", "GET"] }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(
  fileUpload({
    createParentPath: true,
  })
);

const cron = require("node-cron");

cron.schedule("10 14 * * *", () => {
  tool.genBatch();
});

// tool.genBatch_leader();

const router = require("./router");
app.use("/", router);

app.get("/", (req, res) => res.send("Hello World!"));

// app.use(express.static(path.join(__dirname, "dist")));
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "dist", "index.html"));
// });

const server = http.createServer(app);

server.listen(PORT, IP, () => {
  console.log(`Server running at http://${IP}:${PORT}`);
});
