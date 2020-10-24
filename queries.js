const fs = require('fs');
const Pool = require('pg').Pool
const pool = new Pool({
//   user: "Austin",
  user: "postgres",
  password: "latte-a1",
  database: "db",
  hostname: "localhost",
  port: 5432,
})

//object
const createObject = async (otype, data) => {

    const results =  await pool.query("INSERT INTO objects (otype, data) VALUES ($1, $2) RETURNING id", [otype, data]);

    return results.rows

}

const deleteObject = async (id) => {

    const results =  await pool.query("DELETE FROM objects WHERE id = $1", [id])

    return results.rows

}

// const updateObject = async (id) => {

//     const results =  await pool.query("UPDATE objects SET column1 = value1, WHERE id = $1", [id])

//     return results.rows

// }

const retrieveObject = async (id) => {

    const results = await pool.query('SELECT * FROM objects WHERE id = $1', [id])

    return results.rows

}

const getUserIdByName = async (name) => {

    const results = await pool.query("SELECT * FROM objects WHERE otype = 'USER' AND data ->> 'name' = $1", [name])

    return results.rows

}

const getUserByEmailAndPassword = async (email, password) => {

    const results = await pool.query("SELECT * FROM objects WHERE otype = 'USER' AND ( data ->> 'email' = $1 AND data ->> 'password' = $2 )", [email, password])

    return results.rows

}

const getUsers = async () => {

    const results = await pool.query("SELECT * FROM objects WHERE otype = 'USER'")

    return results.rows

}

//chat
const getChatByUsersIds = async ( userA, userB ) => {

    const results = await pool.query('SELECT * FROM chats WHERE (user_a = $1 AND user_b = $2) OR (user_a = $2 AND user_b = $1)', [userA, userB])
   
       return results
   }

const createChat = async (userA, userB) => {

    let info = ''
    // const { info, userA, userB } = request.body
    console.log(info, userA, userB)
    var preResults = await getChatByUsersIds( userA, userB )
    console.log('CNT: ', preResults.rowCount)
    // var user = await getUserById(userA);
    
    if( preResults.rowCount === 0){
        preResults = await pool.query('INSERT INTO chats (info, user_a, user_b) VALUES ($1, $2, $3) RETURNING cid', [info, userA, userB] )
    }
      // preResults = await getChatByUsersIds( userA, userB )
      // var results = preResults
      return preResults.rows[0].cid
 
  }

//Messages
const getMessagesByPostId = async (id) => {
    // const id = request.params.id;
  // console.log('log', id)
  const results = await pool.query('SELECT * FROM messages WHERE pid = $1 ORDER BY created_at ASC', [id])

      console.log(results.rowCount)
      return results.rows
  }
  
  const createMessages = async (pid, user, content) => {
    // console.log(request.body)
  // console.log(pid, user, content)
    const result = await pool.query('INSERT INTO messages (pid, username, message) VALUES ($1, $2, $3)', [pid, user, content], (error, results) => {
      if (error) {
        throw error
      }
      // response.status(201).send(`Post added with ID: ${result.insertId}`)
    })
  }

//association
const assocAdd = async (id1, atype, id2) => {

    const results =  await pool.query("INSERT INTO assocs (atype, id1, id2) VALUES ($1, $2, $3)", [atype, id1, id2]);

    return results.rows

}

const assocGet = async (id1, atype, id2) => {

    const results = await pool.query('SELECT * FROM assocs WHERE (id1 = $1 AND id2 = $2) AND atype = $3', [id1, id2, atype])

    return results.rows

}

const assocTimeRange = async (id1, atype, high, low) => {

    const results = await pool.query('SELECT * FROM assocs WHERE (id2 = $1 AND atype = $2)', [id1, atype])

    return results.rows

}




const deleteAssocs = async (id, atype) => {

    const results =  await pool.query("DELETE FROM assocs WHERE (id1 = $1 AND atype = $2)", [id, atype])

    return results.rows

}




module.exports = {
    createObject,
    retrieveObject,
    getUserIdByName,
    getUserByEmailAndPassword,
    getUsers,
    assocAdd,
    assocGet,
    assocTimeRange,
    deleteObject,
    getMessagesByPostId,
    createChat,
    createMessages,
    deleteAssocs
}