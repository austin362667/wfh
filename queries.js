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







module.exports = {
    createObject,
    retrieveObject,
    getUserIdByName,
    getUserByEmailAndPassword,
    getUsers,
    assocAdd,
    assocGet,
    assocTimeRange
}