const express = require('express')
const app = require('express')()
const fs = require('fs')
const { v4: uuidV4 } = require('uuid')
const session = require('express-session')
const  cookieParser = require('cookie-parser')
const http = require('http')

var options = {
  key: fs.readFileSync('/etc/letsencrypt/live/lattemall.company/privkey.pem'),
  ca: [fs.readFileSync('/etc/letsencrypt/live/lattemall.company/fullchain.pem')],
  cert: fs.readFileSync('/etc/letsencrypt/live/lattemall.company/fullchain.pem')
};
var https = require('https')
const server = https.createServer(options,app).listen(443, () => {
  console.log('listening on *:443');
});;

// const server = http.createServer(app).listen(443, () => {
//     console.log('listening on *:443')
//   });
const api = require("./api.js")

app.set('view engine', 'ejs')
app.engine('html', require('ejs').renderFile)
app.use(express.static('public'))
app.use(cookieParser())


var io = require('socket.io').listen(server)
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()

var multer  = require('multer')
var upload = multer({ dest: 'upload/'});
var file = upload.single('photo');

app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

// initialize express-session to allow us track the logged-in user across sessions.
app.use(session({
    key: 'user_sid',
    secret: 'somerandonstuffs',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 6000000
    }
}));

// This middleware will check if user's cookie is still saved in browser and user is not set, then automatically log the user out.
// This usually happens when you stop your express server after login, your cookie still remains saved in the browser.
app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) {
        res.clearCookie('user_sid');        
    }
    next();
});

// middleware function to check for logged-in users
var sessionChecker = (req, res, next) => {
  if (req.session.user && req.cookies.user_sid) {
    res.redirect('/index');  
  } else {
    next();
  }    
};

app.get('/', (req, res) => {
  if (req.session.user && req.cookies.user_sid) {
    res.render('index', { userId: req.session.user[0].id })
  }else{
    res.redirect('/login');
  }
});

app.get('/index', (req, res) => {
  if (req.session.user && req.cookies.user_sid) {
    res.render('index', { userId: req.session.user[0].id })
  }else{
    res.redirect('/login');
  }
  });

app.get('/meeting/:room', (req, res) => {
    res.render('meeting', { roomId: req.params.room })
});


app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
  })

app.post('/api/login_user', jsonParser,  api.loginUser)
app.post('/api/create_user', file, api.createUser);
app.post('/api/create_task', file, api.createTask);
app.post('/api/get_task_by_name', file, api.getTaskByName);
app.post('/api/get_all_user_name', file, api.getUsersName);
app.get('/api/autocomplete/:search', api.autocompleteFind);


/* websocket */
//video conference
io.on('connection', socket => {

  socket.on('join-room', (roomId, userId) => {
      console.log(roomId, userId)
      socket.join(roomId)
      socket.to(roomId).broadcast.emit('user-connected', userId)

      socket.on('disconnect', () => {
        socket.to(roomId).broadcast.emit('user-disconnected', userId)
      })

    })

})

