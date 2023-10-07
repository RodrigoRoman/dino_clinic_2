if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();

}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const Refill = require("./models/refillPoint");
const MoneyBox = require("./models/money_parts");

const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const userRoutes = require('./routes/users');
const serviceRoutes = require('./routes/services');
const patientRoutes = require('./routes/patients');
const exitRoutes = require('./routes/exits');

const MongoDBStore = require("connect-mongo");


const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/clinicaSanR';

// const dbUrl = 'mongodb://localhost:27017/clinicaSanR';



mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

function getMexicoCityTime() {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      hour12: false,
      timeZone: "America/Mexico_City",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });
    const timeStr = formatter.format(now);
    const [hour, minute, second] = timeStr.split(":");
    const mexicoCityTime = new Date();
    mexicoCityTime.setUTCHours(hour);
    mexicoCityTime.setUTCMinutes(minute);
    mexicoCityTime.setUTCSeconds(second);
    return mexicoCityTime;
  }
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

// app.use(session({
//     secret: 'foo',
//     store: MongoDBStore.create(sessionConfig)
//   }));
  
app.use(express.json({ limit: '50mb' })); // for parsing application/json
app.use(express.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));

// app.use(bodyParser.json({ limit: '50mb' }));
// app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));


app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize({
    replaceWith: '_'
}))
const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store = new MongoDBStore({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 8 * 60 * 60
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * (1.2),
        maxAge: 1000 * 60 * 60 * 24
    }
}

app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());


const scriptSrcUrls = [
    "https://ajax.googleapis.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdnjs.cloudflare.com",
    "http://www.shieldui.com/",
    "https://rawgit.com/",
    'http://192.168.1.114/',
    "https://warm-forest-49475.herokuapp.com",
    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome",
    "https://pure-brushlands-42473.herokuapp.com",
    "https://unpkg.com/",
    "https://clinicaabasolo2-production.up.railway.app",
    "https://cdnjs.cloudflare.com/ajax/libs/bootstrap-multiselect/0.9.15/js/bootstrap-multiselect.min.js"


];
const styleSrcUrls = [
    "https://maxcdn.bootstrapcdn.com/",
    "http://www.shieldui.com/",
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/",
    "https://use.fontawesome.com/",
    "https://unpkg.com/",
    "https://unpkg.com/escpos-bluetooth",
    'https://cdn.rawgit.com/davidshimjs/qrcodejs/gh-pages/qrcode.min.js',
    'https://cdn.jsdelivr.net/gh/davidshimjs/qrcodejs@master/qrcode.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js',
    "https://cdnjs.cloudflare.com/ajax/libs/bootstrap-multiselect/0.9.15/css/bootstrap-multiselect.css"

];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
      connectSrc: ["'self'", "http://192.168.1.114:9100/print-ticket"],
            scriptSrc: ["'unsafe-eval'","'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dhfz9ryy4/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
                "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/"
            ],
            fontSrc: [ ...styleSrcUrls],
        },
    })
);

//Seed date point from which start to count supplies to be resupplied
(async () => {
    const refillCount = await Refill.countDocuments();
    if (refillCount === 0) {
        const nDate = getMexicoCityTime()
        let point = new Refill({
            name:"datePoint",
            setPoint:nDate,
        });
        point.save(function (err,saved) {
            if (err) return handleError(err);
        });
    }
    const moneyBoxCount = await MoneyBox.countDocuments();
    if (moneyBoxCount === 0) {
            // No money box found, create a new one
            let moneyBox = new MoneyBox({
                name: 'Caja Principal',
            });
    
            moneyBox.save(function (err, saved) {
                if (err) {
                    console.error("Failed to create default MoneyBox:", err);
                    return;
                }
    
                console.log("Default MoneyBox created");
    
                // After creation of MoneyBox, set it as the default value for all Users
                User.updateMany({}, { $set: { moneyBox: saved._id } }, (err, res) => {
                    if (err) {
                        console.error("Failed to set default MoneyBox for all users:", err);
                        return;
                    }
                    
                    console.log("Default MoneyBox set for all users");
                });
            });
        } else {
            console.log("Default MoneyBox already exists");
        }
});








app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    global.currentUser = req.user;
    next();
})


app.use('/', userRoutes);
app.use('/services', serviceRoutes);
app.use('/patients', patientRoutes);
//hospital entries and exits
app.use('/exits', exitRoutes)



app.get('/', (req, res) => {
    
    res.render('home')
});


app.all('*', (req, res, next) => {
    next(new ExpressError('Pagina no encontrada', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Algo ha salido mal!'
    res.status(statusCode).render('error', { err })
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`)
})



