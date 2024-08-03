const express = require('express');
const route = express.Router();
const path = require("path");
const bodyParser = require('body-parser');
const mail = require('../config/mail');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const { UserLoggin, AvoidIndex, AdminRoleBased } = require('../auth/userAuth');
const db = require('../config/dbConfig');
const cookieParser = require('cookie-parser');

// 2. Get the edit profile page 
route.put('/edit/surname', UserLoggin, async (req, res) => {

    const surname = req.body.surname
    const userData = req.cookies.user ? JSON.parse(req.cookies.user) : null;

    const updateQuery = 'UPDATE jvmc.jvmc_profile SET surname = ? WHERE email = ?';
    const updateValues = [surname, userData.email];

    db.query(updateQuery, updateValues, updateError => {
        if (updateError) {
            console.error('Database update error:', updateError);
            res.status(500).send('Error updating surname in the database');
            return;
        }
    })
})

route.put('/edit/', UserLoggin, async (req, res) => {

    const surname = req.body.surname
    const userData = req.cookies.user ? JSON.parse(req.cookies.user) : null;

    const updateQuery = 'UPDATE jvmc.jvmc_profile SET otherNames = ? WHERE email = ?';
    const updateValues = [surname, userData.email];

    db.query(updateQuery, updateValues, updateError => {
        if (updateError) {
            console.error('Database update error:', updateError);
            res.status(500).send('Error updating password in the database');
            return;
        }
    })
})


module.exports = route