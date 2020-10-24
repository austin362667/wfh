var FADE_TIME = 10; // ms
var TYPING_TIMER_LENGTH = 1000; // ms
var COLORS = [
'#e21400', '#91580f', '#f8a700', '#f78b00',
'#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
'#3b88eb', '#3824aa', '#a700ff', '#d300e7'
];
var message = "";

// Initialize variables
var $window = $(window);
// var $usernameInput = $('.usernameInput'); // Input for username
var $messages = $('.messages'); // Messages area
var $inputMessage = $('.ip-msg'); // Input message input box
var $inputMessageBtn = $('.inputMessageBtn'); 
// var $enterBtn = $('.enterBtn'); 

// var $loginPage = $('.login.page'); // The login page
var $chatPage = $('.chat.page'); // The chatroom page
var $joinGame = $('.joinGame'); 
var $leaveGame = $('.leaveGame'); 

// Prompt for setting a username
var connected = false;
var typing = false;
var lastTypingTime;




var socket = io();
var username;


function joinGame(){
  // var $title = $('#title').val;
console.log(ROOM_ID)
  socket.emit('joinGame2', ROOM_ID);
  
};

    // Sets the client's username
    function setUsername () {
      // username = cleanInput($usernameInput.val().trim());
  
      // If the username is valid
      if (username) {
        console.log(username)
        // $inputMessage.fadeOut();
        // $inputMessageBtn.fadeOut();
        // $loginPage.fadeOut();
        $chatPage.show();
        // $loginPage.off('click');
        $currentInput = $inputMessage.focus();
  
        // Tell the server your username
        socket.emit('add user', username);
        
      }
    }


    // var $currentInput = $usernameInput.focus();
  

  
    function addParticipantsMessage (data) {
      var message = '';
      if (data.numUsers === 1) {
        message += "請按下->進入 開始配對!";//"目前沒有人在線上，轉傳網址邀請好友上來玩！"
      } else {
        message += "剛剛有 " + data.numUsers + "0+  位用戶配對成功，按->進入 開始配對！";
      }
      // log(message);
    }
  

  
    // Sends a chat message
    function sendMessage () {
      message = $inputMessage.val();
      // Prevent markup from being injected into the message
      message = cleanInput(message);
      // if there is a non-empty message and a socket connection
      if (message) {
        console.log(message)
        $inputMessage.val('');
        addChatMessage({
          username: username,
          message: message
        });
        // tell server to execute 'new message' and send along one parameter
        socket.emit('new message2', message, ROOM_ID);
        Post.messages();
        $inputMessage.focus();
      }
    }
  
    // Log a message
    function log (message, options) {
      var $el = $('<li>').addClass('log').text(message);
      addMessageElement($el, options);
    }
  
  
  
  
  
  
  
  
    // Adds the visual chat message to the message list
    function addChatMessage (data, options) {
      // Don't fade the message in if there is an 'X was typing'
      var $typingMessages = getTypingMessages(data);
      options = options || {};
      if ($typingMessages.length !== 0) {
        options.fade = false;
        $typingMessages.remove();
      }
      
      let color = getUsernameColor(data.username);
      var $usernameDiv = $('<span class="username"/>')
      .text(data.username)
      .css('color', color);
      var $messageBodyDiv = $('<span class="messageBody">')
      .text(data.message);
      // $messageBodyDiv.css('background-color', color);
  
      var typingClass = data.typing ? 'typing' : '';
      var $messageDiv = $('<li class="message"/>')
      .data('username', data.username)
      .addClass(typingClass)
      .append($usernameDiv, $messageBodyDiv);
  
      addMessageElement($messageDiv, options);
    }
  
    // Adds the visual chat typing message
    function addChatTyping (data) {
      data.typing = true;
      data.message = 'is typing';
      addChatMessage(data);
    }
  
    // Removes the visual chat typing message
    function removeChatTyping (data) {
      getTypingMessages(data).fadeOut(function () {
        $(this).remove();
      });
    }
  
    // Adds a message element to the messages and scrolls to the bottom
    // el - The element to add as a message
    // options.fade - If the element should fade-in (default = true)
    // options.prepend - If the element should prepend
    //   all other messages (default = false)
    function addMessageElement (el, options) {
      var $el = $(el);
  
      // Setup default options
      if (!options) {
        options = {};
      }
      if (typeof options.fade === 'undefined') {
        options.fade = true;
      }
      if (typeof options.prepend === 'undefined') {
        options.prepend = false;
      }
  
      // Apply options
      if (options.fade) {
        $el.hide().fadeIn(FADE_TIME);
      }
      if (options.prepend) {
        $messages.prepend($el);
      } else {
        $messages.append($el);
      }
      $messages[0].scrollTop = $messages[0].scrollHeight;
    }
  
    // Prevents input from having injected markup
    function cleanInput (input) {
      return $('<div/>').text(input).text();
    }
  
    // Updates the typing event
    function updateTyping () {
      if (connected) {
        if (!typing) {
          typing = true;
          socket.emit('typing');
        }
        lastTypingTime = (new Date()).getTime();
  
        setTimeout(function () {
          var typingTimer = (new Date()).getTime();
          var timeDiff = typingTimer - lastTypingTime;
          if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
            socket.emit('stop typing');
            typing = false;
          }
        }, TYPING_TIMER_LENGTH);
      }
    }
  
    // Gets the 'X is typing' messages of a user
    function getTypingMessages (data) {
      return $('.typing.message').filter(function (i) {
        return $(this).data('username') === data.username;
      });
    }
  
    // Gets the color of a username through our hash function
    function getUsernameColor (username) {
      // Compute hash code
      var hash = 7;
      for (var i = 0; i < username.length; i++) {
       hash = username.charCodeAt(i) + (hash << 5) - hash;
     }
      // Calculate color
      var index = Math.abs(hash % COLORS.length);
      return COLORS[index];
    }
  
  //   $enterBtn.click(function () {

  //     if (username) {
  //       sendMessage();
  //       socket.emit('stop typing');
  //       typing = false;
  //     } else {
  //       setUsername();
  //     }
  // });
    // Keyboard events
  
    $window.keydown(function (event) {
      // Auto-focus the current input when a key is typed
      if (!(event.ctrlKey || event.metaKey || event.altKey)) {
        $currentInput.focus();
      }
      // When the client hits ENTER on their keyboard
      if (event.which === 13) {
        if (username) {
          console.log('inputMessageEnter.click')
          sendMessage();
          socket.emit('stop typing');
          typing = false;
        } else {
          setUsername();
        }
      }

    });
  
    $inputMessage.on('input', function() {
      updateTyping();
    });

    $inputMessageBtn.click(function () {
      if (username) {
        console.log('inputMessageBtn.click')
        sendMessage();
        socket.emit('stop typing');
        typing = false;
      } else {
        setUsername();
      }
    });
  
  
    // Click events
  
    // Focus input when clicking anywhere on login page
    // $loginPage.click(function () {
    //   $currentInput.focus();
    // });
  
    // Focus input when clicking on the message input's border
    $inputMessage.click(function () {
      $inputMessage.focus();
    });
  
  
    $joinGame.click(function () {
      leaveGame();
      joinGame();
  
    })
  
    $leaveGame.click(function () {
      // leaveGame();
  
    })
  
    // Socket events
  
    // Whenever the server emits 'login', log the login message
    socket.on('login', function (data) {
      connected = true;
      // Display the welcome message
      var message = "歡迎來到 'Chatting Booth' 尬聊小站";
      log(message, {
        prepend: true
      });
      log('您已進入1對1加密聊天室!');
      
      // addParticipantsMessage(data);
    });
  
    // Whenever the server emits 'new message', update the chat body
    socket.on('new message', function (data) {
      console.log(data);
      addChatMessage(data);
    });
  
  
  
    // Whenever the server emits 'user joined', log it in the chat body
    socket.on('user joined', function (data) {
      // log(data.username + ' 進入了大廳');
      // addParticipantsMessage(data);
    });
  
    // Whenever the server emits 'user left', log it in the chat body
    socket.on('user left', function (data) {
      // log(data.username + ' 離開了大廳');
      // addParticipantsMessage(data);
      removeChatTyping(data);
  
  
    });
  
    // Whenever the server emits 'typing', show the typing message
    socket.on('typing', function (data) {
      addChatTyping(data);
    });
  
  
    // Whenever the server emits 'stop typing', kill the typing message
    socket.on('stop typing', function (data) {
      removeChatTyping(data);
    });
  
  

    function alert_1() {
      log(' 我們也討厭等待，連線倒數25秒..');
    }


    function alert_20() {
      log(' 別離開!就快到了，連線倒數20秒..');
    }

    function alert_10() {
      log(' 系統努力配對中，連線倒數10秒..');
    }

    function alert_5() {
      log(' 哎呀!終於剩5秒..');
    }

    function alert_0() {
      log(' 您做的很好!可惜現在沒有人落單..');
      log(' 再等等看吧!')
    }
  
    var timeoutID_1;
    var timeoutID_2;
    var timeoutID_3;
    var timeoutID_4;
    var timeoutID_5;
    socket.on('gameCreated', function (data) {
      timeoutID_1 = setTimeout(alert_1, 1000);
      timeoutID_2 = setTimeout(alert_20, 7000);
      timeoutID_3 = setTimeout(alert_10, 12000);
      timeoutID_4 = setTimeout(alert_5, 22000);
      timeoutID_5 = setTimeout(alert_0, 27000);
      console.log("Game Created! ID is: " + data.gameId)

      if ( username == data.username){
        log(data.username + ' 發起了一場尬聊 ' + data.gameId);
        // log(' 系統努力配對中，我們也討厭等待..');
        $inputMessage.fadeIn();
        $inputMessageBtn.fadeIn();
      }

      //alert("Game Created! ID is: "+ JSON.stringify(data));
    });
    
    socket.on('disconnect', function () {
     log('抱歉..您已斷線，重開看看吧！');
     $inputMessage.fadeOut();
    //  $inputMessageBtn.fadeOut();

   });
    
    socket.on('reconnect', function () {
     log('恭喜！！您成功回來了~');
     if (username) {
       socket.emit('add user', username);
      //  $inputMessage.fadeOut();
      //  $inputMessageBtn.fadeOut();
     }
   });
    
    socket.on('reconnect_error', function () {
     log('太多人..系統不行了..');
   });
  
  
  //Join into an Existing Game

  
  socket.on('joinSuccess', function (data) {
    // log('歡迎用戶加入!');
    clearTimeout(timeoutID_1);
    clearTimeout(timeoutID_2);
    clearTimeout(timeoutID_3);
    clearTimeout(timeoutID_4);
    clearTimeout(timeoutID_5);
    $inputMessage.fadeIn();
    $inputMessageBtn.fadeIn();
  });
  
  
  //Response from Server on existing User found in a game
  socket.on('alreadyJoined', function (data) {
    // log('您已經在尬聊中了，重新配對先按->離開');
  });
  
  
  function leaveGame(){
    socket.emit('leaveGame');
    clearTimeout(timeoutID_1);
    clearTimeout(timeoutID_2);
    clearTimeout(timeoutID_3);
    clearTimeout(timeoutID_4);
    clearTimeout(timeoutID_5);
    log('太尷尬所以離開了')
    log('轉傳連結給更多好友吧! 搜尋關鍵字：匿名尬聊')
    // $inputMessage.fadeOut();
    // $inputMessageBtn.fadeOut();
    // $inputMessage.fadeOut();
  };
  
  socket.on('leftGame', function (data) {
    if(username === data.username){
      // log('太尷尬所以離開了尬聊 ' + data.gameId);
    }else{
      log('對方離開了尬聊 ' + data.gameId);
      log('會遇到的人會再相遇~')
    }
    // $inputMessage.fadeOut();
    // $inputMessageBtn.fadeOut();
  });
  
  socket.on('notInGame', function () {
    // log('您還沒開始新的尬聊，按->進入');
    
  });
  
  socket.on('gameDestroyed', function (data) { 
    log( data.gameOwner+ ' 結束了這場尬聊 ' + data.gameId);
    // $inputMessage.fadeOut();
  });
  



  function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  function generateName() {
    const adj = ['水藍', '寶藍', '多喝水', '緋紅', '黃色', '釉綠', '粉紅', '淡紫', '黑白', '黯綠', '褐色的', '金黃','美麗','漂亮','開開心心','怒','尷尬','時間管理','努力的','亭亭玉立','忿忿不平','嘻嘻哈哈','淺藍','閃亮','暗', '好奇', '帥氣', '討人喜愛的', '受人喜歡的', '天然呆的', '圓滾滾的', '懶洋洋的', '烏拉拉的']
    const n = ['寶寶','獨角獸','大師','打工仔','老司機','美少女','葛格','恐龍化石','小可愛','小姐姐','大學生','小強','小男孩', '大美女', '教授','帥哥','饒舌歌手','湯姆貓','米奇老鼠','小飛象','小公主','美人魚','花木蘭', '柴柴', '小水獺', '小企鵝', '小公雞', '小貓咪'] 
    return adj[getRandomInt(adj.length)] + n[getRandomInt(n.length)];
  }

  logMessages = async function () {
    // var title = document.getElementById("title").value;
  //   var form = new FormData();
  //   form.append("title", title)
  console.log(`/api/messages/${ROOM_ID}`)
    var res = await window.fetch(`/api/messages/${ROOM_ID}`, {
          method: 'get',
          headers : { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
          }
})
// console.log(res.json())
    let datas = await res.json()
    console.log(datas)
    for ( let c = 0; c < datas.length; c++ ){
      console.log(datas[c])
      addChatMessage(datas[c]);
    }
    // document.getElementById("msg").innerHTML = res.ok ? "開聊成功!" : "開聊失敗..請先登入!";
  };
  // name
window.onload = function() {
  // Post.show();
  logMessages();
  
    // username = generateName();//todo
    setUsername();
    joinGame();

  // Post.log();
}
