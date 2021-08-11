const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");

const postsRouter = require("./routes/postsRoutes");
const usersRouter = require("./routes/usersRoutes");


// create our app
const app = express();
// connect to mongoDB by mongoose
const uri = "mongodb+srv://JC1:" + process.env.MONGO_ATLAS_PW + "@clusterformean.7m2fv.mongodb.net/mean?retryWrites=true&w=majority";
mongoose.connect(uri, {useUnifiedTopology: true, useNewUrlParser: true})
  .then( () => {
    console.log('Connected to database!')
  })
  .catch(() => {
    console.log('Connection Attempt Failed!')
  });


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/images", express.static(path.join("images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
});
app.use("/api/posts", postsRouter);
app.use("/api/users", usersRouter);

module.exports = app;
