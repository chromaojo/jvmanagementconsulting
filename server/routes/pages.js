const express = require('express');
const route = express.Router();
const path = require("path");
const bodyParser = require('body-parser');
const mail = require('../config/mail');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const { UserLoggin, AvoidIndex, ManRole,  StaffRole } = require('../auth/userAuth');
const db = require('../config/dbConfig');
const cookieParser = require('cookie-parser');
const upload = require('../config/multerConfig');
const rand = Math.floor(Math.random() * 999999)
const rando = Math.floor(Math.random() * 99999)
const { announce, balance } = require('../models/announce');




// Middleware
route.use(
    session({
        secret: `Hidden_Key`,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: true }
    })
);
route.use(cookieParser());
route.use(express.static(path.join(__dirname, 'public')));
route.use(bodyParser.json());
route.use(bodyParser.urlencoded({ extended: true }));



// To use tables at server\models\tables.js 
route.use('', require('../models/tables'));


// To get index page 
route.get('/', AvoidIndex, (req, res) => {

    res.render('index', { balance, layout: false });
    // res.sendFile(path.join(__dirname, "../../statics", 'index.html'));
})


// To get the Team page
route.get('/services', AvoidIndex, (req, res) => {

    const userCookie = req.cookies.user ? JSON.parse(req.cookies.user) : null;

    if (!userCookie) {

        res.sendFile(path.join(__dirname, "../../statics", 'services.html'));
    } else {
        res.redirect('/login');
    }
})


// To  get the terms 

route.get('/terms', AvoidIndex, (req, res) => {

    const userCookie = req.cookies.user ? JSON.parse(req.cookies.user) : null;

    if (!userCookie) {

        res.sendFile(path.join(__dirname, "../../statics", 'terms.html'));
    } else {
        res.redirect('/login');
    }
})

route.get('/privacy', AvoidIndex, (req, res) => {

    const userCookie = req.cookies.user ? JSON.parse(req.cookies.user) : null;

    if (!userCookie) {

        res.sendFile(path.join(__dirname, "../../statics", 'privacy.html'));
    } else {
        res.redirect('/login');
    }
})

// To see all vacancies available 

route.get('/vacancy', AvoidIndex, (req, res) => {

    try {
        const sqlw = `
    SELECT * FROM jvmc.jvmc_vacancy ORDER BY id DESC;
  `;

        db.query(sqlw, (err, results) => {
            if (err) {
                const message = 'Internal Server Error'
                return res.status(401).render('message', { message, layout: false })
            }
            const vacancy = results
            console.log('Vacancy is ', vacancy)

            res.render('vacancy', { balance, vacancy, layout: false });
        });
    } catch (error) {
        const message = 'Internal Network Error'
        return res.status(401).render('message', { message, layout: false })
    }
})



// To see all vacancies available on the dashboard

route.get('/vacancies', UserLoggin, (req, res) => {
    const userData = req.cookies.user ? JSON.parse(req.cookies.user) : null;

    try {
        const sqlw = `SELECT * FROM jvmc.jvmc_vacancy ORDER BY id DESC;`;

        db.query(sqlw, (err, results) => {
            if (err) {
                const message = 'Error Uploading Vacancies'
                return res.status(401).render('message', { message, layout: false })
            }
            const vacancy = results;
            res.render('vacancies', { balance, vacancy, userData });
        });
    } catch (error) {
        const message = 'Internal Network Error'
        return res.status(401).render('message', { message, layout: false })
    }
})

// To see only one vacancy 

route.get('/vacancy/:id', (req, res) => {
    const userData = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    if (userData) {
        const id = req.params.id
        const sqlw = `
     SELECT * FROM jvmc.jvmc_vacancy where id = ? ORDER BY id DESC;
   `;

        db.query(sqlw, [id], (err, results) => {
            if (err) {
                const message = 'Internal Server Error'
                return res.status(401).render('message', { message, layout: false })
            }
            const vacancy = results[0]
            console.log('One Vacancy is ', vacancy)
            res.render('vacancy-ones', { balance, vacancy, userData });
        });
    } else {
        try {
            const id = req.params.id
            const sqlw = `
         SELECT * FROM jvmc.jvmc_vacancy where id = ? ORDER BY id DESC;
       `;

            db.query(sqlw, [id], (err, results) => {
                if (err) {
                    const message = 'Internal Server Error'
                    return res.status(401).render('message', { message, layout: false })
                }
                const vacancy = results[0]
                console.log('One Vacancy is ', vacancy)
                res.render('vacancy-one', { balance, vacancy, layout: false });
            });
        } catch (error) {
            const message = 'Internal Network Error'
            return res.status(401).render('message', { message, layout: false })
        }
    }
})


// To get create vancancy page 

route.get('/create-vacancy', (req, res) => {
    const userData = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    try {


        res.render('create-vacancy', { announce, userData });
    } catch (error) {
        const message = 'Internal Network Error'
        return res.status(401).render('message', { message, layout: false })
    }
})

// To submit a vacancy
route.post('/post/vacancy', upload.single('pix'), (req, res) => {

    const imageP = '/' + req.file.path.replace(/\\/g, '/');
    const imagePath = imageP.replace('/public', '');

    const currentDate = new Date();
    const day = currentDate.getDate()
    const year = currentDate.getFullYear()
    const timer = new Date().toLocaleTimeString();
    const month = currentDate.toLocaleString('en-US', { month: 'long' })
    const time = timer + " || " + day + '-' + month + '-' + year;
    const pix = imagePath;
    const { title, detail, category, av_space } = req.body;
    const userData = req.cookies.user ? JSON.parse(req.cookies.user) : null;


    console.log('Image Path ' + imagePath)
    const sql = `INSERT INTO jvmc.jvmc_vacancy SET ?`;
    const values = { title, pix, detail, category, av_space, time };
    db.query(sql, values, (err, result) => {
        if (err) {

            const message = 'Error storing dept data';
            return res.status(500).render('message', { message, layout: false })
        }
        res.redirect('/vacancies')
    });

})

// To Delete Vacncy 
route.get('/del/vacancy/:id', UserLoggin, async (req, res) => {
    try {
        const report_id = req.params.id;
 
        // Check if the user is logged in
        const userCookie = req.cookies.user ? JSON.parse(req.cookies.user) : null;
        if (!userCookie) {
            return res.status(401).send('Unauthorized');
        }

        // Perform the deletion
        const sql = `DELETE FROM jvmc.jvmc_vacancy WHERE id = ?;`;
        db.query(sql, [report_id], (err, result) => {
            if (err) {
                const message = 'Error deleting vacancy'
                return res.status(500).render('message', { message, layout: false });

            }

        });
        res.redirect('/messge/' + user_id);


    } catch (err) {
        console.error('Error handling /delete-report-content/:id route:', err);
        res.status(500).send('Internal Server Error');
    }
});





// SME REGISTRATION PAGE 
// To get the SME page
route.get('/sme', (req, res) => {

    const userCookie = req.cookies.user ? JSON.parse(req.cookies.user) : null;

    if (!userCookie) {

        res.sendFile(path.join(__dirname, "../../statics", 'sme.html'));
    } else {
        res.redirect('/login');
    }
})
// To get the Team page
route.get('/sme/reg', (req, res) => {

    const userCookie = req.cookies.user ? JSON.parse(req.cookies.user) : null;

    if (!userCookie) {

        res.sendFile(path.join(__dirname, "../../statics", 'services.html'));
    } else {
        res.redirect('/login');
    }
})


// To Login into the dashboard

route.get('/login', AvoidIndex, (req, res) => {

    res.sendFile(path.join(__dirname, "../../statics", 'login.html'));
    // const userCookie = req.cookies.user ? JSON.parse(req.cookies.user) : null;

    // if (!userCookie) {
    //     res.sendFile(path.join(__dirname, "../../statics", 'login.html'));

    // } res.redirect('/dashboard');

});


// Login route
route.post('/login/account', async (req, res) => {
    const { email, password } = req.body;


    const sqlGetUserWithAccount = `
       SELECT 
         u.user_id,
         u.password,
         u.email,
         u.user_role,
         u.username,
         u.department,
         a.staff_id,
         a.surname,
         a.otherNames,
         a.user_id,
         a.profilePix,
         a.job_status,
         a.whatsapp,
         a.phone_number,
         a.dob,
         a.about,
         a.address,
         a.bank_name,
         a.bank_account,
         a.account_name,
         a.office,
         a.gender,
         a.resume_date
       FROM jvmc.jvmc_users u
       LEFT JOIN jvmc.jvmc_profile a ON u.user_id = a.user_id
       WHERE u.email = ?;
     `;
    // Check if the user and account details with the provided email exists

    db.query(sqlGetUserWithAccount, [email], async (error, result) => {
        if (error) {
            message = 'Network Server Error';
            return res.status(500).render('message', { message, layout: false })
        }
        if (result.length === 0) {

            message = 'Invalid Email or Password';
            return res.status(401).render('message', { message, layout: false })

        }
        const stat = result[0].user_id
        console.log("The user role is ", result[0])
        // Compare the provided password with the hashed password in the database
        const isPasswordValid = await bcrypt.compare(password, result[0].password);
        if (!isPasswordValid) {
            message = 'Invalid Email or Password';
            return res.status(401).render('message', { message, layout: false })
        }
        const notice = await new Promise((resolve, reject) => {
            const sqls = `SELECT * FROM jvmc.jvmc_notification WHERE user_id = ? ORDER BY id DESC;`;
            db.query(sqls, [stat], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        req.app.set('userData', result[0]+ notice)
        const userWithAccount = {mee : result[0], notice};
        res.cookie('user', JSON.stringify({ ...userWithAccount }));
        req.session.userId = result[0].id
        console.log('User data is'+ userWithAccount)
        res.redirect('/dashboard');

    });
});




// Dashboard route To get all submitted reports from all users

route.get('/dashboard', UserLoggin, async (req, res) => {

    const userCookie = req.cookies.user ? JSON.parse(req.cookies.user) : null;

    if (userCookie) {

        const userData = userCookie

        if (userData.mee.user_role === 'management') {
            console.log("The user role is ", userData.mee)
            const userRept = await new Promise((resolve, reject) => {
                const stat = 'finished';
                const sqls = `SELECT * FROM jvmc.jvmc_report WHERE progress = ? ORDER BY id DESC;`;
                db.query(sqls, [stat], (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                });
            });

            const unFinished = await new Promise((resolve, reject) => {
                const stat = 'pending';
                const sqls = `SELECT * FROM jvmc.jvmc_report WHERE progress = ? ORDER BY id DESC;`;
                db.query(sqls, [stat], (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                });
            });

            res.render('home', { userRept, userData, announce, unFinished });
        } else {
            // Execute the query 

            const userNot = await new Promise((resolve, reject) => {
                const user_Id = userData.mee.user_id;
                const sqls = `SELECT * FROM jvmc.jvmc_notification WHERE user_id = ? ORDER BY id DESC; `;
                db.query(sqls, [user_Id], (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                });
            });
            const repTotal = await new Promise((resolve, reject) => {
                const sqls = `SELECT * FROM jvmc.report_content ORDER BY id DESC`;
                db.query(sqls, (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                });
            });

            const repComplete = await new Promise((resolve, reject) => {
                const stat = 'completed'
                const sqls = ` SELECT * FROM jvmc.report_content WHERE status = ? `;
                db.query(sqls, [stat], (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                });
            });


            const totalRep = repTotal.length
            const completedRep = repComplete.length
            const percent = (completedRep / totalRep) * 100;

            res.render('notification', { userData, userNot, percent, announce });
        }
    } else {

        res.redirect('/login');
    }


})



// To Get All the unsubmitted report of One user only
route.get('/dashboard/:user_id', UserLoggin, (req, res) => {
    // const userData = req.app.get('userData');
    const userCookie = req.cookies.user ? JSON.parse(req.cookies.user) : null;

    if (userCookie) {
        const user_id = userCookie.mee.user_id
        const progress = 'pending'
        const sql = `
          SELECT * FROM jvmc.jvmc_report WHERE user_id = ? AND progress = ?  ORDER BY id DESC ;
        `;

        db.query(sql, [user_id, progress], (err, results) => {
            if (err) {
                const message = 'Internal Server Error'
                return res.status(500).render('message', { message, layout: false })

            }
            res.clearCookie('userRept');
            req.app.set('userRept', results)
            const userData = userCookie
            const userRept = req.app.get('userRept');
            res.render('home1', { userRept, userData, announce });
        });


    } else {

        res.redirect('/login');
    }

})


// To Read only One Specific report
route.get('/dash/:id', UserLoggin, async (req, res) => {
    try {
        const id = req.params.id;
        const userCookie = req.cookies.user ? JSON.parse(req.cookies.user) : null;

        if (!userCookie) {
            return res.redirect('/login');
        }

        // Fetch report data
        const [report] = await new Promise((resolve, reject) => {
            const sql = `SELECT * FROM jvmc.jvmc_report WHERE report_id = ?;`;
            db.query(sql, [id], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        if (!report) {
            return res.status(404).send('Report not found');
        }

        // Fetch report content data
        const reportContent = await new Promise((resolve, reject) => {
            const sqls = `SELECT * FROM jvmc.report_content WHERE report_id = ?;`;
            db.query(sqls, [id], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        // Clear the 'oneRept' cookie
        res.clearCookie('oneRept');

        // Set application level data
        req.app.set('oneRept', reportContent);

        const userData = userCookie;
        // Render the 'one-report' view
        res.render('one-report', { oneRept: reportContent, userData, report });

    } catch (err) {
        console.error('Error handling /dash/:id route:', err);
        res.status(500).send('Internal Server Error');
    }
});

// To get the create report page 
route.get('/create/report', UserLoggin, (req, res) => {

    const userCookie = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    const userData = userCookie
    if (!userCookie) {
        res.redirect('/login');
    } else {

        res.render('create-report', { userData })
    }
})


// To Create Report  
route.post('/new/report', async (req, res) => {

    const userData = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    const { name, title } = req.body;
    const user_id = userData.mee.user_id
    const report_id = rand + 'JvMc' + rando
    const currentDate = new Date();
    // Extract date part  
    // const date = currentDate.toISOString().split('T')[0]
    const day = currentDate.getDate()
    const year = currentDate.getFullYear()
    const time = new Date().toLocaleTimeString();
    const month = currentDate.toLocaleString('en-US', { month: 'long' })

    const date = day + "/" + month + "/" + year
    // To Fill the Report Data 

    const sql = `INSERT INTO jvmc.jvmc_report (name, title, report_id, date , time, user_id) VALUES (?,?,?,?,?,?)`;
    const values = [name, title, report_id, date, time, user_id];
    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error storing report data:', err);
            return res.status(500).send('Internal Profile Error');
        }
        const titl = title.split(' ');

        const link = '/add/report/' + report_id
        const sqls = `INSERT INTO jvmc.jvmc_notification (title, message, user_id, link, time) VALUES (?,?,?,?,?)`;
        const message = 'Report ' + title + ' Created @ ' + time
        const values = [title, message, user_id, link, time];
        db.query(sqls, values, (err, result) => {
            if (err) {
                console.error('Error storing report data:', err);
                const message = 'Error storing report data:';
                return res.status(500).render('message', { message, layout: false });
            }
        });
        res.clearCookie('oneReport');
        res.cookie('report', JSON.stringify({ ...result }));
        req.app.set('oneReport', result)
        res.redirect('/add/report/' + report_id)
    });
});


// To get the add content page 

// To get the report content adding page 
route.get('/add/report/:id', UserLoggin, (req, res) => {

    const userCookie = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    if (userCookie) {
        const id = req.params.id;
        const sql = `
          SELECT * FROM jvmc.jvmc_report WHERE report_id = ?;
        `;
        db.query(sql, [id], (err, result) => {
            if (err) {
                const message = 'Internal Server Error'
                return res.status(500).render('message', { message, layout: false })
            }
            const title = result[0].title

            const sqls = `SELECT * FROM jvmc.report_content WHERE report_id = ?; `;
            db.query(sqls, [id], (err, results) => {
                if (err) {
                    const message = 'Internal Server Error'
                    return res.status(500).render('message', { message, layout: false })
                }
                res.clearCookie('oneRept');
                req.app.set('oneRept', results)
                const userData = userCookie
                const oneRept = results
                res.render('create-report2', { oneRept, userData, id, title });
            });
        });

    } else {
        res.redirect('/login');
    }
})


// To Add Content to a report  
route.post('/add/rep', UserLoggin, async (req, res) => {
    const { action, outcome, status, report_id } = req.body;

    // Validate input data
    if (!action || !outcome || !status || !report_id) {
        const message = 'All fields are required'
        return res.status(400).render('message', { message, layout: false })
    }
    // Check if report_id exists in jvmc_report table
    const checkSql = 'SELECT * FROM jvmc.jvmc_report WHERE report_id = ?';
    db.query(checkSql, [report_id], (checkErr, checkResult) => {
        if (checkErr) {
            console.error('Error checking report_id:', checkErr);
            const message = 'Internal Server Error'
            return res.status(500).render('message', { message, layout: false })
        }

        if (checkResult.length === 0) {
            const message = 'report_id not found'
            return res.status(400).render('message', { message, layout: false })
        }
        // Proceed with inserting into report_content
        const insertSql = `INSERT INTO jvmc.report_content (action, outcome, status, report_id) VALUES (?, ?, ?, ?)`;
        const values = [action, outcome, status, report_id];

        db.query(insertSql, values, (insertErr, insertResult) => {
            if (insertErr) {
                console.error('Error inserting report content:', insertErr);
                return res.status(500).send('Internal Server Error');
            }
            res.redirect('/add/report/' + report_id)
        });
    });
});

// To delete a report content
route.get('/del/content/:id', UserLoggin, async (req, res) => {
    try {
        const id = req.params.id;

        // Check if the user is logged in
        const userCookie = req.cookies.user ? JSON.parse(req.cookies.user) : null;
        if (!userCookie) {
            const message = 'Unauthorized Activity'
            return res.status(401).render('message', { message, layout: false })
        }

        const sqls = `SELECT * FROM jvmc.report_content WHERE id = ?;`;
        db.query(sqls, [id], (err, results) => {
            if (err) {
                console.error('Error deleting report content:', err);
                const message = 'Internal Server Error'
                return res.status(500).render('message', { message, layout: false })
            }
            const report_id = results[0].report_id
            // Perform the deletion
            const sql = `DELETE FROM jvmc.report_content WHERE id = ?;`;
            db.query(sql, [id], (err, result) => {
                if (err) {
                    console.error('Error deleting report content:', err);
                    const message = 'Internal Server Error'
                    return res.status(500).render('message', { message, layout: false })
                }
                // Check if any rows were affected
                if (result.affectedRows === 0) {
                    const message = 'Report content not found'
                    return res.status(404).render('message', { message, layout: false })
                }
                // Report content successfully deleted

                res.redirect('/dash/' + report_id);
            });
        });
    } catch (err) {
        const message = 'Internal Network Server Error'
        res.status(500).render('message', { message, layout: false })

    }
});


// To submit a report 
route.post('/submitR/:id', UserLoggin, async (req, res) => {

    const id = req.params.id;
    const progress = 'finished';
    const userData = req.cookies.user ? JSON.parse(req.cookies.user) : null;

    const updateQuery = 'UPDATE jvmc.jvmc_report SET progress = ? WHERE id = ?';
    const updateValues = [progress, id];

    // db.query(updateQuery, updateValues, updateError => {
    db.query(updateQuery, updateValues, (err, results) => {
        if (err) {
            const message = 'Internal Network Error'
            return res.status(500).render('message', { message, layout: false });

        }

        res.redirect('/dashboard/' + userData.mee.user_id)

    })

})


// To submit a Task Tracker 
route.post('/submitT/:id', UserLoggin, async (req, res) => {

    const id = req.params.id;
    const progress = 'finished';
    const userData = req.cookies.user ? JSON.parse(req.cookies.user) : null;

    const updateQuery = 'UPDATE jvmc.jvmc_task SET progress = ? WHERE id = ?';
    const updateValues = [progress, id];

    // db.query(updateQuery, updateValues, updateError => {
    db.query(updateQuery, updateValues, (err, results) => {
        if (err) {
            const message = 'Internal Network Error'
            return res.status(500).render('message', { message, layout: false });

        }

        res.redirect('/staff/task/' + userData.mee.user_id)

    })

})


// To delete a reprt 
route.get('/del/report/:id', UserLoggin, async (req, res) => {
    try {
        const report_id = req.params.id;

        // Check if the user is logged in
        const userCookie = req.cookies.user ? JSON.parse(req.cookies.user) : null;
        if (!userCookie) {

            const message = 'Unauthorized';
            return res.status(401).render('message', { message, layout: false })

        }

        // Perform the deletion
        const sql = `DELETE FROM jvmc.report_content WHERE report_id = ?;`;
        db.query(sql, [report_id], (err, result) => {
            if (err) {
                const message = 'Internal Server Error';
                return res.status(500).render('message', { message, layout: false })

            }

        });

        // To Delete the parent 
        const sqls = `DELETE FROM jvmc.jvmc_report WHERE report_id = ?;`;
        db.query(sqls, [report_id], (err, result) => {
            if (err) {

                const message = 'Error deleting report content:'
                return res.status(500).render('message', { message, layout: false })

            }
            // Check if any rows were affected
            if (result.affectedRows === 0) {
                const message = 'Report content not found'
                return res.status(404).render('message', { message, layout: false })

            } // Report content successfully deleted
            const userC = req.cookies.user ? JSON.parse(req.cookies.user) : null;
            const user_id = userC.user_id
            res.redirect('/dashboard/' + user_id);
        });


    } catch (err) {

        const message = 'Error handling deport delete process';
        res.status(500).render('message', { message, layout: false })
    }
});

// To get the Team page
route.get('/team', (req, res) => {
    const userCookie = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    if (!userCookie) {
        res.sendFile(path.join(__dirname, "../../statics", 'team.html'));
    } else {
        res.redirect('/login');
    }
})

// To get the forgot password page 

route.get('/forgot/password', (req, res) => {

    const userCookie = req.cookies.user ? JSON.parse(req.cookies.user) : null;

    if (!userCookie) {
        res.sendFile(path.join(__dirname, "../../statics", 'pass-reset.html'));

    } else {

        res.redirect('/login');
    }
})





// User edit Page 
route.get('/user/edit', UserLoggin, (req, res) => {

    const userData = req.app.get('userData');

    res.render('userEdit', { userData });
})


// To Update The Password Data 
route.post('/profile/updatePass', UserLoggin, async (req, res) => {

    try {
        const { oldPassword, newPassword } = req.body;
        const userData = req.app.get('userData');

        // Retrieve the current hashed password from the database
        const selectQuery = 'SELECT password FROM users WHERE email = ?';
        let selectValues = [userData.email];

        db.query(selectQuery, selectValues, async (selectError, selectResults) => {
            if (selectError) {
                console.error('Database select error:', selectError);
                res.status(500).send('Error selecting password from the database');
                return;
            }

            if (selectResults.length === 0) {

                const message = 'User not found'
                return res.status(404).render('message', { message, layout: false });
            }

            const hashedPassword = selectResults[0].password;

            // Compare the provided old password with the hashed password
            const passwordMatch = await bcrypt.compare(oldPassword, hashedPassword);

            if (passwordMatch) {
                // Hash the new password
                const hashedNewPassword = await bcrypt.hash(newPassword, 10);

                // Update the password in the database
                const updateQuery = 'UPDATE users SET password = ? WHERE email = ?';
                const updateValues = [hashedNewPassword, userData.email];

                db.query(updateQuery, updateValues, updateError => {
                    if (updateError) {
                        console.error('Database update error:', updateError);
                        const message = 'Error updating password in the database'
                        return res.status(500).render('message', { message, layout: false });

                    }
                    const sqlGetUserWithAccount = `
                    SELECT 
                      u.user_id,
                      u.phone_number,
                      u.password,
                      u.email,
                      u.role,
                      a.account_id,
                      a.account_balance,
                      a.votes,
                      a.phone_number1,
                      a.about,
                      a.email as account_email
                    FROM jvmc.jvmc_users u
                    LEFT JOIN jvmc.jvmc_accounts a ON u.user_id = a.user_id
                    WHERE u.email = ?;
                  `;
                    db.query(sqlGetUserWithAccount, [userData.email], async (error, result) => {
                        if (error) {

                            const message = 'Internal Server Error'
                            return res.render('message', { message, layout: false });
                        }

                        if (result.length === 0) {
                            const message = 'Invalid Email or Password'
                            return res.status(401).render('message', { message, layout: false })

                        }

                        // Compare the provided password with the hashed password in the database

                        req.app.set('userData', result[0])


                        const userWithAccount = result[0];
                        res.clearCookie('user');
                        res.cookie('user', JSON.stringify(userWithAccount));
                        res.redirect('/dashboard');

                    });
                });
            } else {
                const message = 'Incorrect old password'
                res.status(401).render('message', { message, layout: false });

            }
        });
    } catch (error) {

        const message = 'Unexpected error'
        res.status(500).render('message', { message, layout: false });

    }
});



// Sending Private Messages
// Get All The outbox message Page
route.get('/messge/:user_id', UserLoggin, (req, res) => {

    const userCookie = req.cookies.user ? JSON.parse(req.cookies.user) : null;

    if (userCookie) {
        const userId = req.params.user_id;
        const sqlw = `
        SELECT * FROM jvmc.jvmc_message WHERE user_id = ? ORDER BY id DESC;
        `;

        db.query(sqlw, [userId], (err, results) => {
            if (err) {
                const message = 'Internal Network Error'
                return res.status(500).render('message', { message, layout: false });

            }
            res.clearCookie('userMess');
            req.app.set('userMess', results)
            const userData = userCookie
            const userMess = req.app.get('userMess');
            console.log("All messages detail is", userMess)
            const myMessage = ''
            res.render('messg', { userMess, userData, myMessage, announce });

        });

    } else {

        res.redirect('/login');
    }


})

// Get All The inbox message Page
route.get('/inbox/:user_id', UserLoggin, (req, res) => {

    const userCookie = req.cookies.user ? JSON.parse(req.cookies.user) : null;

    if (userCookie) {
        const userId = req.params.user_id;
        const sqlw = `
        SELECT * FROM jvmc.jvmc_message WHERE recipient_id = ? ORDER BY id DESC;
        `;

        db.query(sqlw, [userId], (err, results) => {
            if (err) {
                const message = 'Internal Server Error'
                return res.status(500).render('message', { message, layout: false });
            }
            res.clearCookie('userMess');
            req.app.set('userMess', results)
            const userData = userCookie
            const userMess = req.app.get('userMess');
            console.log("All messages detail is", userMess)
            const myMessage = ''
            res.render('messg-inbox', { userMess, userData, myMessage, announce });

        });

    } else {

        res.redirect('/login');
    }


})



// To get all and read a Sent message 
route.get('/messge/:user_id/:id', UserLoggin, async (req, res) => {

    const userCookie = req.cookies.user ? JSON.parse(req.cookies.user) : null;

    if (userCookie) {
        const user_id = req.params.user_id;
        const id = req.params.id


        const userMess = await new Promise((resolve, reject) => {
            const sqls = ` SELECT * FROM jvmc.jvmc_message WHERE user_id = ? ORDER BY id DESC;`;
            db.query(sqls, [user_id], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        const myMess = await new Promise((resolve, reject) => {
            const sqls = `SELECT * FROM jvmc.jvmc_message WHERE id = ?;`;
            db.query(sqls, [id], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        res.clearCookie('userMess');
        const myMessage = myMess[0]
        const userData = userCookie
        console.log("All messages detail is", userMess)
        res.render('messg', { userMess, myMessage, userData, announce });

    } else {

        res.redirect('/login');
    }


})


// To get all and read a Inbox message 
route.get('/messg/:user_id/:id', UserLoggin, async (req, res) => {

    const userCookie = req.cookies.user ? JSON.parse(req.cookies.user) : null;

    if (userCookie) {
        const user_id = req.params.user_id;
        const id = req.params.id


        const userMess = await new Promise((resolve, reject) => {
            const sqls = ` SELECT * FROM jvmc.jvmc_message WHERE recipient_id = ? ORDER BY id DESC;`;
            db.query(sqls, [user_id], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        const myMess = await new Promise((resolve, reject) => {
            const sqls = `SELECT * FROM jvmc.jvmc_message WHERE id = ?;`;
            db.query(sqls, [id], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        res.clearCookie('userMess');
        const myMessage = myMess[0]
        const userData = userCookie
        console.log("All messages detail is", userMess)
        res.render('messg-inbox', { userMess, myMessage, userData, announce });

    } else {

        res.redirect('/login');
    }


})

// To get the page for creating messages 

route.get('/new/messge', UserLoggin, async (req, res) => {

    const userData = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    const allUser = await new Promise((resolve, reject) => {
        const sqls = ` SELECT * FROM jvmc.jvmc_profile ORDER BY id DESC;`;
        db.query(sqls, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });

    res.render('create-messg', { userData, allUser });
})

// Send The Messgae 
// To Post Messages 
route.post('/send/messg', async (req, res) => {

    const userData = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    const { sender, reciever, title, content } = req.body;
    const user_id = userData.mee.user_id;
    const currentDate = new Date();
    const recipient_id = reciever.toString().split('/')[0]
    const recipient = reciever.toString().split('/')[1]
    // Extract date part  
    const date = currentDate.toISOString().split('T')[0]
    const time = new Date().toLocaleTimeString();

    // To Fill the Report Data 

    console.log('Hello Recepent ', recipient)
    const sql = `INSERT INTO jvmc.jvmc_message (sender, content, recipient, recipient_id, title, date, time, user_id) VALUES (?,?,?,?,?,?,?,?)`;
    const values = [sender, content, recipient, recipient_id, title, date, time, user_id];
    db.query(sql, values, (err, result) => {
        if (err) {
            const message = 'Error storing report data:';
            return res.status(500).render('message', { message, layout: false });

        }
        res.clearCookie('oneReport');
        res.cookie('report', JSON.stringify({ ...result }));
        req.app.set('oneReport', result)
        res.redirect('/messge/' + user_id)
    });
});

// To Delete Messages

// To delete a Inbox message 
route.get('/del/msg/:id', UserLoggin, async (req, res) => {
    try {
        const report_id = req.params.id;

        // Check if the user is logged in
        const userCookie = req.cookies.user ? JSON.parse(req.cookies.user) : null;
        if (!userCookie) {
            return res.status(401).send('Unauthorized');
        }

        // Perform the deletion
        const sql = `DELETE FROM jvmc.jvmc_message WHERE report_id = ?;`;
        db.query(sql, [report_id], (err, result) => {
            if (err) {
                const message = 'Error deleting report content'
                return res.status(500).render('message', { message, layout: false });

            }

        });
        res.redirect('/messge/' + user_id);


    } catch (err) {
        console.error('Error handling /delete-report-content/:id route:', err);
        res.status(500).send('Internal Server Error');
    }
});

// View my messages 


// Logout route
route.get('/logout', (req, res) => {

    req.session.destroy((err) => {
        delete userData
        res.clearCookie('user');
        if (err) {
            console.error(err);
            res.status(500).send('Error logging out');
        } else {

            res.redirect('/login');
        }
    });
});



module.exports = route;