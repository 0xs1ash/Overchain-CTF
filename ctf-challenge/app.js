const express = require('express')
const app =  express()
const app2 =  express()
const app3 =  express()
const path = require('path')
const cors = require('cors')
const bodyParser =require('body-parser')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const dotenv = require('dotenv');
const session = require('express-session')
const MongoStore = require('connect-mongo')
dotenv.config({path:'./config/.env'});

//==============================================MONGOOSE-CONNECTION==============================================
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('[+] Connected to MongoDB!!'))
  .catch((err) => console.error('[-] Error connecting to MongoDB:', err));

const sessionStore = MongoStore.create({
  mongoUrl:process.env.MONGO_URL,
  collectionName:'sessions'
})

const sessionOptions = {
  name: 'cookie',
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    maxAge: 60 * 1000 * 60,
    httpOnly: false, 
  },
};

//==============================================ROUTING-APP-1==============================================
const authRoute=require('./routes/authRoute')
const indexRoute=require('./routes/indexRoute')

//==============================================ROUTING-APP-2==============================================
const panelRoute=require('./mailSandbox/routes/panelRoute')

//==============================================ROUTING-APP-3==============================================
const adminRoute=require('./adminPanel/routes/adminRoute')


//==============================================SETTINGS-APP1==============================================
app.use(cookieParser())
app.use(session(sessionOptions));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.json());
app.use('/',authRoute)
app.use('/',indexRoute)


app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
      console.error('[-] CSRF ERROR: Invalid CSRF token');

      return res.status(403).json({
          type: 'danger',
          message: 'Invalid CSRF token. Please refresh the page and try again.',
          redirectUrl: '/logout'
      });
  }

  console.error('[-] ERROR:', err.message);
  return res.status(500).json({
      type: 'danger',
      message: 'Internal Server Error. Please try again later.'
  });
});



//==============================================SETTINGS-APP2==============================================

app2.use(express.static(path.join(__dirname, './mailSandbox/public')));
app2.use(cookieParser())

app2.use(session(sessionOptions));

app2.use(bodyParser.urlencoded({ extended: true }));
app2.set('view engine', 'ejs');
app2.use(bodyParser.json());
app2.set('views', path.join(__dirname, './mailSandbox/views'));
app2.use('/',panelRoute)

app2.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
      console.error('[-] CSRF ERROR: Invalid CSRF token');

      return res.status(403).json({
          type: 'danger',
          message: 'Invalid CSRF token. Please refresh the page and try again.',
          redirectUrl: '/logout'
      });
  }

  console.error('[-] ERROR:', err.message);
  return res.status(500).json({
      type: 'danger',
      message: 'Internal Server Error. Please try again later.'
  });
});

//==============================================SETTINGS-APP3==============================================
const corsOptions = {
  origin: 'http://localhost:3000',
  methods: 'POST',
  credentials: true,
};
app3.use(cors(corsOptions))
app3.use(express.static(path.join(__dirname, 'public')));
app3.use(cookieParser())
app3.use(session(sessionOptions));
app3.use(bodyParser.urlencoded({ extended: true }));
app3.set('view engine', 'ejs');
app3.use(bodyParser.json());
app3.set('views', path.join(__dirname, './adminPanel/views'));
app3.use('/',adminRoute)

app3.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
      console.error('[-] CSRF ERROR: Invalid CSRF token');

      return res.status(403).json({
          type: 'danger',
          message: 'Invalid CSRF token. Please refresh the page and try again.',
          redirectUrl: '/logout'
      });
  }

  console.error('[-] ERROR:', err.message);
  return res.status(500).json({
      type: 'danger',
      message: 'Internal Server Error. Please try again later.'
  });
});



//==============================================APP-START==============================================
app.listen(3000,'0.0.0.0',()=>{
    console.log(`[=] APP-1 WORKING HERE: http://localhost:3000`)
})

app2.listen(4000,'0.0.0.0',()=>{
    console.log(`[=] APP-2 WORKING HERE: http://localhost:4000`)
})

app3.listen(5000,'0.0.0.0',()=>{
  console.log(`[=] APP-3 WORKING HERE: http://localhost:5000`)
})