function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Hide all elements with class="containerTab", except for the one that matches the clickable grid column
function tap(val) {
  let msg = document.querySelector('#msg');
  msg.innerHTML = val;
  console.log(msg)
  
  }


  function addPostShow() {
    let addPost = document.querySelector('#post');
    let showBtn = document.querySelector('#addPostShowBtn');
    if(showBtn.innerHTML === '+'){
      addPost.style.display = 'block';
      showBtn.innerHTML = '-';
      // console.log('addPostShow');

    }else{
      addPost.style.display = 'none';
      showBtn.innerHTML = '+';
      // console.log('addPostUnShow');

      }
    }


async function createTask(){

  let subject = document.querySelector('#subject').value;
  let assigntoUsers = document.querySelector('#assignto').value;
  let detail = document.querySelector('#detail').value;
  let startat = document.querySelector('#startat').value;
  let endat = document.querySelector('#endat').value;
  let location = document.querySelector('#location').value;

  let host = "Austin";
  var myRe = /(@[A-Z][a-z]+)/g;
  var myArray = myRe.exec(assigntoUsers);
  console.log('assignto', myArray.input)
  var formData = new FormData();
  formData.append('host', host);
  formData.append('subject', subject);
  formData.append('assignto', myArray.input);
  formData.append('detail', detail);

  formData.append('startat', startat);
  formData.append('endat', endat);

  formData.append('location', location);

  var res = await window.fetch("/api/create_task", {
    body: formData,
    method: 'POST',
    redirect:"follow",
    });

  
    console.log('createTaskres', res.ok);

}

const getTasks = async function(){



  var usersRes = await window.fetch("/api/get_all_user_name", {
      method: 'POST'
      })
    
    console.log('getUserNameRes', usersRes.ok);
    const usersSrc = await usersRes.json();
if(usersSrc.data.length > 0){

  for (let i = 0; i < usersSrc.data.length; i++) {
    let name = usersSrc.data[i].data.name
  let msg = document.querySelector(`#${name.replace(' ', '-')}`);

  var formData = new FormData();
  formData.append('name', name);

  var res = await window.fetch("/api/get_task_by_name", {
    body: formData,
    method: 'POST'
    })
  
    console.log('getTaskRes', res.ok);
    const src = await res.json();

  var tasks = src.data;
  tasks.sort(function (a, b) {
    return !a.data.endat - !b.data.endat ||
    dateCompare(new Date(b.data.endat), new Date(a.data.endat))
});

function dateCompare(a, b){
  if (a > b) return -1;
  if (a < b) return 1;
  return 0;
}

console.table(tasks)
  if(tasks.length > 0){
    for(task of tasks){
      const card = document.createElement('div');
      const title = document.createElement('h5');
      const detail = document.createElement('a');
      const endat = document.createElement('a');
      const director = document.createElement('a');
      const location = document.createElement('a');
      card.appendChild(director);
      card.appendChild(title);
      card.appendChild(detail);
      card.appendChild(endat);
      card.appendChild(location);
      card.className = "card";
      card.id = task.id;
      if(task.data.subject){
        title.className = 'title'
        title.innerHTML = task.data.subject;
      }
      if(task.data.detail){
        detail.innerHTML = task.data.detail;
        detail.className = 'detail'
        console.log(task.data.detail)
      }
      if(task.data.director){
        director.innerHTML = task.data.director + ' :';
        director.className = 'director'
      }
      if(task.data.location){
        location.innerHTML = 'at ' + task.data.location;
        location.className = 'location'
      }
      if(task.data.endat){
        var todayDate = new Date();
        if(new Date(task.data.endat) <= todayDate){
          endat.style = 'color:red;'
        }
        endat.className = 'endat'
        endat.innerHTML = task.data.endat;
      }
      msg.appendChild(card);
  
    }
  }
}
}


}



const getUsersName = async function(){

  var res = await window.fetch("/api/get_all_user_name", {
    method: 'POST'
    })
  
    console.log('getUserNameRes', res.ok);
    const src = await res.json();

  if(src.data.length > 0){

  for (let i = 0; i < src.data.length; i++) {
    const userList = document.querySelector('.users');
    let userWrap = document.createElement('div');
    let user = document.createElement('div');
    let a = document.createElement('a');
    
    let userTime = document.createElement('div');
    user.className = 'user';
    // user.addEventListener('click',  function(){
    //   console.log('clicked ', src.data[i].data.name);
    //   getTaskByName(src.data[i].data.name);
    // });
    a.innerHTML = src.data[i].data.name;
    user.appendChild(a);
    userTime.id = `${src.data[i].data.name.replace(' ', '-')}`
    console.log(src.data[i].data)
    // user.appendChild(status)
    userTime.className = "";
    userWrap.className = 'userWrap'
    userWrap.appendChild(user);
    userWrap.appendChild(userTime);
    userList.appendChild(userWrap);



  }
}

}

function scroll() {
  let html = document.querySelector('html');
  let leftScroll = document.querySelector('#leftScroll');
  leftScroll.addEventListener('click',  function(e){
    html.scrollLeft = 100;
  })
  let rightScroll = document.querySelector('#rightScroll');
  rightScroll.addEventListener('click',  function(e){
    html.scrollRight = 100;
  })
}
//   $("#myButton").click(function() {
//     $('html, body').animate({
//         scrollTop: $("#foo4").offset().top
//     }, 2000);
//   }
// }


window.onload = getUsersName();
window.onload = getTasks();
window.onload = function(){
  const createTaskBtn = document.querySelector("#createTask");
  createTaskBtn.addEventListener('click',  async function(e){
    e.preventDefault();
      createTask();
      console.log("createTask")
      await sleep(2000);
      location.href = location.href;
    });}
// window.onload = scroll();

let chk = false;
var n =  0;
document.getElementById("assignto").addEventListener("keyup", function(e) {
  if(e.key === '@'){
    console.log('on')
    chk = true;

  }
  }, false);


$("#assignto").autocomplete({
  minLength: 0,
  source: function (request, response) {
      $.ajax({
          url: '/api/autocomplete/' + request.term.split('@')[request.term.split('@').length - 1], //
          type: "Get",
          dataType: "json",
          // data: {
          //     key: request.term    //Name欄位輸入的資訊傳給後端
          // },
          //成功取得資料後用Map來整理回傳的資料
          success: function (data) { 
              response($.map(data, function (item) {
                  console.log(item); //練習時印出來方便觀看資料的長相
                  return {
                      // label和value是基本參數
                      label: item,  //列表所顯示的文字
                      value: item, 	//列表選項的值
                      // phone: item.phone,	//自訂義要多帶的值
                      // email: item.email	//自訂義要多帶的值
                  };
              }));
          }
      });
  },
//focus參數事件介紹 : 在下拉選單匹配時如果滑鼠有焦點到會觸發事件
//下方是指當使用者只是焦點到某個選項就將名子帶#name輸入框中
  focus: function (event, ui) {
    if(chk){
      let str = $("#assignto").val()
      // var regexp = new RegExp('#([^\\s]*)','g');
      // let tags = str.replace(regexp, 'REPLACED');
      var pos = str.lastIndexOf('@');
      const sstr = str.slice(0, pos);
      let estr = str.slice(pos, str.length - 1);
      console.log('1', sstr);
      console.log('2', estr);

      estr = '@' + ui.item.label;
      $("#assignto").val(sstr+estr);
      chl = false;
    }
      return false;
  },
//select參數事件介紹 : 使用者選擇下拉式某項目後觸發事件
//當使用者選擇某項目後自動將所有的值帶進輸入框中
  select: function (event, ui) {
    if(chk){
      let str = $("#assignto").val()
      // var regexp = new RegExp('#([^\\s]*)','g');
      // let tags = str.replace(regexp, 'REPLACED');
      var pos = str.lastIndexOf('@');
      const sstr = str.slice(0, pos);
      let estr = str.slice(pos, str.length - 1);
      console.log('1', sstr);
      console.log('2', estr);

      estr = '@' + ui.item.label;
      $("#assignto").val(sstr+estr);
      chl = false;
    }
      // $("#contactPhone").val(ui.item.phone);
      // $("#contactEMail").val(ui.item.email);
      return false;
  }
});


//websocket
const socket = io()
socket.on('connection'), async () => {

  // console.log(USER_ID)

  // socket.emit('join-lobby', USER_ID)
  
  // socket.on('join-lobby'), async (user_id) => {
  //   console.log('join-lobby', user_id)
  // const status = document.querySelector(`#status-`+user_id)
  // status.style = 'color:green;'
  }

// }
// socket.on('user-connected', async (user_id) => {
  
//   console.log("user-connected ", USER_ID);


// });