if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}

const express = require("express");
const app = express();
const port = 8080;
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");    // Express Router
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const { log } = require('console');


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.use(express.urlencoded({extended : true}));
app.use(express.json());
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"public")));

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
//const dbUrl = process.env.ATLASDB_URL;

main()
    .then(() => {
        console.log("Connected to DB");
        
    })
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect(MONGO_URL);
    //await mongoose.connect(dbUrl);
}

// const store = MongoStore.create({
//     mongoUrl: MONGO_URL,
//     crypto: {
//         secret: "mysupersecretcode",
//     },
//     touchAfter: 24 * 3600  // Time have to pass in seconds
// });

// store.on("error", () => {
//     console.log("Error in MONGO SESSION STORE", err);
    
// });

const sessionOptions = {
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized : true,
    cookie : {
        expires : Date.now() + 7 * 24 * 60 * 60 * 1000 ,
        maxAge : 7 * 24 * 60 * 60 * 1000 ,
        httpOnly : true,    // To prevent cross scripting attacks (Security Purpose)
    }
};


app.use(session(sessionOptions));
app.use(flash());       // We have to use flash before session routes


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); 

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// app.get("/" , (req,res) => {
//     res.send("This is Root page");
// });

app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;     // To track the session of User for Log out and log in button's purpose
    next();
});

// app.get("/demouser", async (req,res) => {
//     let fakeUser = new User({
//         email : "student@gmail.com",
//         username : "soumyajeet"
//     });
//     let registeredUser =  await User.register(fakeUser,"helloworld");
//     res.send(registeredUser);
// });

app.use("/listings",listingRouter);  // Express Router
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

/*app.get("/testlisting", async (req,res) => {
    let sampleListing = new Listing({
        title : "My New Villa",
        description : "By the beach",
        price : 1200,
        location : "Calangute, Goa",
        country : "India", 
    });

    await sampleListing.save();
    console.log("sample was saved");
    res.send("Successfull testing");
});*/

// Handling error if URL doesnot match or page not matched
app.all("*",(req,res,next) => {
    next(new ExpressError(404, "Page Not Found"));
});

// Handling error -----
app.use((err,req,res,next) => {
    let {statusCode = 500 , message = "Something Went Wrong!" } = err;
    // res.status(statusCode).send(message);
    res.status(statusCode).render("error.ejs", {message});
});

app.listen(port, () => {
    console.log(`Server is listening on port : ${port}`);
    
});

