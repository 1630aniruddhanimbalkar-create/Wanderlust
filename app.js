if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
const methoOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStratagy = require("passport-local");
const { MongoMemoryServer } = require("mongodb-memory-server");
const User = require("./models/user.js");
const Listing = require("./models/listing.js");
const initData = require("./init/data.js");

const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

let mongoServer;
const dbUrl = process.env.ATLASDB_URL || process.env.MONGO_URI;
if (!process.env.SECRET) {
  process.env.SECRET = "wanderlust-dev-secret";
}

async function createMemoryMongo() {
  mongoServer = await MongoMemoryServer.create({
    instance: {
      dbName: "wanderlust",
    },
  });
  return mongoServer.getUri();
}

async function main() {
  const uri = dbUrl || (await createMemoryMongo());
  await mongoose.connect(uri);
  console.log("Connected to MongoDB successfully!");

  try {
    const count = await Listing.countDocuments();
    if (count === 0) {
      let demoUser = await User.findOne({ username: "wanderlust_demo" });
      if (!demoUser) {
        demoUser = new User({
          email: "demo@wanderlust.com",
          username: "wanderlust_demo",
        });
        demoUser = await User.register(demoUser, "password123");
      }
      const seedListings = initData.data.map((obj) => ({
        ...obj,
        owner: demoUser._id,
      }));
      await Listing.insertMany(seedListings);
      console.log("Sample listings loaded successfully!");
    }
  } catch (seedErr) {
    console.log("Seed data note:", seedErr.message);
  }

  return mongoose.connection.getClient();
}

const clientPromise = main().catch((err) => {
  console.error("Database connection error:", err);
});

process.on("SIGINT", async () => {
  if (mongoServer) {
    await mongoServer.stop();
  }
  process.exit(0);
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methoOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));

const store = MongoStore.create({
  clientPromise,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.get("/", (req, res) => {
  res.redirect("/listings");
});

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStratagy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something ent wrong!" } = err;
  res.status(statusCode).render("error.ejs", { message });
  // res.status(statusCode).send(message);
});

app.listen(8080, () => {
  console.log("server is running");
});
