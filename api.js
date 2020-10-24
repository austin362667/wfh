const { request, response } = require('express')
const fs = require('fs')
const db = require("./queries.js")

// const createUser = async (request, response) => {
//     let formData = request.body;
//     console.log('form data', formData);
//     console.log(request.file.path)
//     // console.log(formData.photo)
//     let email = formData.email
//     let nickname = formData.nickname
//     let password = formData.password
//     let info = formData.info
//       /** When using the "single"
//         data come in "req.file" regardless of the attribute "name". **/
//         var tmp_path = request.file.path;
  
//         /** The original name of the uploaded file
//             stored in the variable "originalname". **/
//         var target_path = 'public/' + request.file.path+'.jpg';
      
//         /** A better way to copy the uploaded file. **/
//         var src = fs.createReadStream(tmp_path);
//         var dest = fs.createWriteStream(target_path);
//         src.pipe(dest);
  
//     // const { nickname, email, password, info } = request.body
//     // console.log(nickname, email, password, info)
  
//     const preResult = await getUserByEmail(email)
//     if (preResult === 0){
//       const result =  await pool.query('INSERT INTO users (email, password, nickname, info, photo) VALUES ($1, $2, $3, $4, $5)', [email, password, nickname, info, request.file.path ])
//       request.session.user = { nickname, email, password, info }
//         // response.status(201).send(`User added with ID: ${result.insertId}`)
//         await emailService.send(email, '"尬聊小站 | Chatting Booth" 歡迎您的加入❤️❤️', `Hi ${nickname},\n給就要認識新朋友的妳/你，\n匿名、配對、聊天！\n快開始您的冒險吧！\n https://lattemall.company`);
        
//           // 'austin362667@gmail.com',
//           // '感謝您的註冊!',
//           // "<p>一起來尬聊小站聊天交朋友~</p> <h4>https://lattemall.company</h4>",
//           // response.redirect(301, '/avenue');
//           response.status(200).json({msg: 'success!'})
//       }else{
//      console.log('email already used!')
//      response.status(500).json({msg: 'success!'})
//     }
  
//   }


const deleteTask = async (request, response) => {
    let formData = request.body
    const id = formData.id
    console.log('delete task id', id)
    await db.deleteObject(id)
    await db.deleteAssocs(id, 'ASSIGN_TO')
}
  
const createUser = async (request, response) => {
    let formData = request.body
    var tmp_path = request.file.path;

    /** The original name of the uploaded file
        stored in the variable "originalname". **/
    var target_path = 'public/' + request.file.path+'.jpg';
  
    /** A better way to copy the uploaded file. **/
    var src = fs.createReadStream(tmp_path);
    var dest = fs.createWriteStream(target_path);
    src.pipe(dest);
    console.log('user data', {...formData, 'photo': request.file.path})

    db.createObject('USER', {...formData, 'photo': request.file.path})
}

const loginUser = async (request, response) => {
    var {email, password} = request.body;

    console.log('json login data', email, password)
    const user = await db.getUserByEmailAndPassword(email, password);

    console.log('dbUser: ', user);
    if ( user.length === 1) {
        request.session.user = user;
        response.status(200).json({msg: 'success!'})
            // res.redirect(301, '/avenue')
        }else{
            response.status(500).json({msg: 'failed..'})
        }
}

const createTask = async (request, response) => {
    let formData = request.body
    var host = formData.host//formData.host
    const subject = formData.subject
    var assignto = formData.assignto
    const detail = formData.detail
    const type = formData.type
    const startat = formData.startat
    const endat = formData.endat
    const important = formData.important
    // const urgent = formData.urgent

    const location = formData.location
    console.log(startat, endat)
    const sessionUser = request.session.user
    hostId = sessionUser[0].id
    const taskRes = await db.createObject('TASK', JSON.stringify({"subject" : subject, "detail" : detail, "startat": startat, "endat": endat, "director": sessionUser[0].data.name, "location":location, "type": type, "important": important}))
    // const hostRes = await db.getUserIdByName(host)
    db.assocAdd(taskRes[0].id, "AUTHORED_BY", hostId)
    console.log('Task ', subject, ' was authored by ', host, ' .')
    assignto = assignto.split('@').slice(1, )//.replace(/ /g, '')
    console.log(assignto)
    for(i of assignto){
        let name = i
        console.log(name)
        const assigntoRes = await db.getUserIdByName(name)
        db.assocAdd(taskRes[0].id, "ASSIGN_TO", assigntoRes[0].id)
        console.log('Task ', subject, ' was assigned to ', name, ' .')
    }


}

const getTaskByName = async (request, response) => {
    let formData = request.body
    const name = formData.name

    const r = await db.getUserIdByName(name)
    const assocRes = await db.assocTimeRange(r[0].id, 'ASSIGN_TO')
    console.log('Check what assign to ', name, ' .')

    let tasks = []
    for(let i = 0; i< assocRes.length; i++){
        const taskRes = await db.retrieveObject(assocRes[i].id1)
        tasks.push(taskRes[0])
    }   

    response.status(200).json({data: tasks})

}

const getUsersName = async (request, response) => {

    const r = await db.getUsers()
    console.log('Check all users name .')

    let users = []
    for(let i = 0; i< r.length; i++){

        users.push(r[i])
    }

    response.status(200).json({data: users})

}

const autocompleteFind  = async (request, response) => {

    var b = request.params.search;

    const r = await db.getUsers()

    let users = []
    for(let i = 0; i< r.length; i++){
        name = r[i].data.name
        console.log('===')
        if(name.match(RegExp(b,'i'))){
            console.log(r[i])
            users.push(name)
        }
    }
    response.status(200).json(users)

}

const createChat = async (request, response) => {
    // console.log(request.body)
    const userA = request.params.userA
    const userB = request.params.userB

    const cid = await db.createChat(userA, userB)
      // preResults = await getChatByUsersIds( userA, userB )
      // var results = preResults
      console.log(cid)
      response.redirect(`/chat/${cid}`);
  
  
  }


  const getMessagesByPostId = async (request, response) => {
    const id = request.params.id;
    const results = await db.getMessagesByPostId(id)
    console.log(results)
    response.status(200).json(results)

  }

  const createMessages = async (request, response) => {

    const { pid, user, content } = request.body
    db.createMessages(pid, user, content)

}

module.exports = {
    createUser,
    createTask,
    getTaskByName,
    getUsersName,
    autocompleteFind,
    loginUser,
    deleteTask,
    createChat,
    createMessages,
    getMessagesByPostId
}
