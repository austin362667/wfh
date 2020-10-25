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

  app.get('/dashboard', (req, res) => {
    res.sendFile(__dirname + '/public/d3.html');
  })

app.post('/api/login_user', jsonParser,  api.loginUser)
app.post('/api/create_user', file, api.createUser);
app.post('/api/create_task', file, api.createTask);
app.post('/api/delete_task', file, api.deleteTask);
app.post('/api/get_task_by_name', file, api.getTaskByName);
app.post('/api/get_all_user_name', file, api.getUsersName);
app.get('/api/autocomplete/:search', api.autocompleteFind);

app.get('/connect/:userA/:userB' , api.createChat)
  // console.log('room id: ',req.params.room);
app.get('/chat/:room' , (req, res) => {
  if (req.session.user && req.cookies.user_sid) {
    let user = req.session.user
    console.log('sessionUser: ', user[0]);
    console.log(user[0].data.name)
  // console.log('room id: ',req.params.room);
  res.render('chat', { roomId: req.params.room, username: user[0].data.name })
}})

// app.get('/api/chats', jsonParser, api.getChats)
app.get('/api/messages/:id', api.getMessagesByPostId)
app.post('/api/messages', jsonParser, api.createMessages)


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

    socket.on('joinGame2', function (ROOM_ID){
      console.log(ROOM_ID)
          socket.join(ROOM_ID);// join room
          // dict.push({
          //   key:   socket.id,
          //   value: ROOM_ID
          // });
          io.sockets.in(ROOM_ID).emit('joinSuccess', {
            ROOM_ID});
          
        })

})


io.on('connection', function (socket) {
  var addedUser = false;
  // when the client emits 'new message', this listens and executes
  socket.on('new message2', function (data, name, ROOM_ID ) {
    
    // console.log("dict", dict);
    // let room = ROOM_ID;
    // for(el of dict){
    // // console.log(socket.username, el);

    //   if(socket.id === el['key']){
    //     room = el['value'];
    //   }
    // }
    console.log(ROOM_ID,'-',name,': ',data);

    // we tell the client to execute 'new message'
    socket.in(ROOM_ID).broadcast.emit('new message', {
      username: name,
      message: data
    });
  });

})

