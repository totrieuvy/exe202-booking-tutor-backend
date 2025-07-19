var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");
require("dotenv").config();
const { swaggerUi, specs } = require("./config/swagger");

const db = require("./models/index");
db.connectDb().catch(console.error);

const authenticationRoute = require("./routes/authenticationRoute");
const certificationRoute = require("./routes/certificationRoute");
const courseRoute = require("./routes/courseRoute");
const feedbackRoute = require("./routes/feedbackRoute");
const orderRoute = require("./routes/orderRoute");
const profileRoute = require("./routes/profileRoute");
const dashboardRoute = require("./routes/dashboardRoute");
const tutorRoute = require("./routes/tutorRoute");
const chapterContentRoute = require("./routes/chapterContentRoute");
const forumRoute = require("./routes/forumRoute");
const accountRoutes = require("./routes/accountRoutes");

var app = express();
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(cors());

//swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/auth", authenticationRoute);
app.use("/api/certifications", certificationRoute);
app.use("/api/courses", courseRoute);
app.use("/api/feedback", feedbackRoute);
app.use("/api/orders", orderRoute);
app.use("/api/account", profileRoute);
app.use("/api/dashboard", dashboardRoute);
app.use("/api/tutor", tutorRoute);
app.use("/api/chapters", chapterContentRoute);
app.use("/api/contents", chapterContentRoute);
app.use("/api/forum", forumRoute);
app.use("/api/accounts", accountRoutes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

const HOST_NAME = process.env.HOST_NAME || "0.0.0.0";
const PORT = process.env.PORT || 3000;

app.listen(PORT, HOST_NAME, () => {
  console.log(`Server is running on http://${HOST_NAME}:${PORT}`);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
