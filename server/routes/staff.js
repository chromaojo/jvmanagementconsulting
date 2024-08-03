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
const {announce, balance} = require('../models/announce');
const rand = Math.floor(Math.random() * 9999);
const rando = Math.floor(Math.random() * 999999);

const respond = '';

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
route.use(express.static(path.join(__dirname, 'statics')));
route.use(bodyParser.json());
route.use(bodyParser.urlencoded({ extended: true }));



// routee.use(AdminRoleBased);
// To View All Departments in the organization 
// To get register a new staff page
route.get('/dept', (req, res) => {

    const userCookie = req.cookies.user ? JSON.parse(req.cookies.user) : null;

    const userData = userCookie;

    if (!userCookie) {

        res.redirect('/login');
    } else {
        const userId = req.params.userId;
        const sql = `
          SELECT * FROM jvmc.jvmc_dept ORDER BY id DESC;
        `;

        
        db.query(sql, [userId], (err, results) => {
            if (err) {
                console.log('Error retrieving shipments:', err);
                return res.status(500).send('Internal Server Error');
            }
            res.clearCookie('userDept');
            req.app.set('userDept', results)
            const userDept = req.app.get('userDept');
            console.log("All Department detail is", userDept)
            // res.sendFile(path.join(__dirname, "../../statics", 'reg.html'),{userDept});
            res.render('alldept', { userDept, userData });
        });

    }
})



// To get register a new staff page
route.get('/new', (req, res) => {

    const userCookie = req.cookies.user ? JSON.parse(req.cookies.user) : null;

    const userData = userCookie;

    if (!userCookie) {

        res.redirect('/login');
    } else {
        const userId = req.params.userId;
        const sql = `
          SELECT * FROM jvmc.jvmc_dept;
        `;

        db.query(sql, [userId], (err, results) => {
            if (err) {
                console.log('Error retrieving shipments:', err);
                return res.status(500).send('Internal Server Error');
            }
            res.clearCookie('userDept');
            req.app.set('userDept', results)
            const userDept = req.app.get('userDept');
            console.log("All Department detail is", userDept)
            // res.sendFile(path.join(__dirname, "../../statics", 'reg.html'),{userDept});
            res.render('create-staff', { userDept, userData });
        });

    }
})


// Registering New Staff Step 
route.post('/register/new', async (req, res) => {
    const userData = req.cookies.user ? JSON.parse(req.cookies.user) : null;

    const { email, phone_number, surname, address, resume_date,
        gender, country, state_origin, whatsapp, office, job_status, bank_name,
        account_name, bank_account, salary,
        otherNames, department } = req.body;

    const status = 'active';

    // Check if email already exists
    db.query('SELECT email FROM jvmc.jvmc_users WHERE email = ?', [email], async (error, result) => {
        if (error) {
            console.log("Customized Error ", error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (result.length > 0) {
            return res.status(401).json({ message: 'Email Already Taken' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(phone_number, 10);
        // Insert user into database
        const user_id = rando + 'jvmc'
        db.query('INSERT INTO jvmc.jvmc_users SET ?', { email, password: hashedPassword, user_id, user_role: 'staff', department }, (error, result) => {
            if (error) {
                console.log('A Registration Error Occurred ', error);
                return res.status(500).json({ message: 'Internal Server Error' });
            }

            const messages = {
                from: {
                    name: 'JV Management Consulting',
                    address: 'felixtemidayoojo@gmail.com',
                },
                to: email,
                subject: "Welcome To JV Management Consulting",
                text: `Dear ${surname} ${otherNames}, We are delighted to welcome you to JV Management Consulting! Congratulations on successfully registering on our company website. We are thrilled to have you as part of our team and look forward to your contributions.
                As a new member of our staff, you will play a crucial role in helping us deliver exceptional consulting services to our clients. Your expertise and skills are highly valued, and we are confident that you will find your experience with us both rewarding and fulfilling.
                Here are a few next steps to get you started:

                Complete Your Registeration & Profile:
                Please log in to your account and ensure that your profile information is complete and up to date. This helps us to better understand your background and areas of expertise.
                Your Phone Number is your First Password          
                Access Your Onboarding Materials:

                We have prepared a set of onboarding materials that will introduce you to our company’s mission, values, and procedures. You can access these materials in the 'Resources' section of your account.
                Schedule Your Orientation:

                We conduct regular orientation sessions to help new staff integrate smoothly into our company culture. Please use the scheduling tool in your account to book a time that suits you.
                Connect with Your Team:
                Important Information:
                Your Email : ${email} 
                Your First Password : ${phone_number} 
                Support Email: hr@jvmanagementconsulting.com
                Office Hours: 9:00am To 5:30pm .
                If you have any questions or need further assistance, please do not hesitate to reach out to our HR department at hr@jvmanagementconsulting.com or call us at [HR Phone Number]. We are here to support you every step of the way.

                Once again, welcome to JV Management Consulting. We are excited to see you thrive and contribute to our success.

                Best regards,
                Lead Consultant,
                Jennifer Seidu,
                JV Management Consulting Team.`
            };

            // Send email
            mail.sendIt(messages);



            // To Fill the profile Data 
            db.query('SELECT * FROM jvmc.jvmc_users WHERE email = ?', [email], async (error, result) => {
                if (error) {
                    console.log("Account creation Error ", error);
                    return res.status(500).json({ message: 'Account Server Error' });
                }
                const user_id = result[0].user_id
                const staffer = resume_date.split('-');
                const staff_id = 'jvmc/' + rando + '/' + staffer[1] + '/' + staffer[0];
                const leave_total = 14
                // Insert account data 
                const sql = `INSERT INTO jvmc.jvmc_profile SET ?`;
                const values = {
                    address, resume_date, phone_number, leave_total,
                    gender, country, state_origin, whatsapp, office, job_status, bank_name,
                    account_name, bank_account, salary, surname,
                    otherNames, user_id, staff_id, department, status
                };
                db.query(sql, values, (err, result) => {
                    if (err) {
                        console.error('Error storing account data:', err);
                        return res.status(500).send('Internal Server Error');
                    }
                    const message = 'Staff Created Successfully'
                    res.render('message', { userData, message })
                });

            })
            // To initiate the table for Department
        });
    });
});


// To upload Profile Picture 
route.post('/upload-pix', upload.single('profileImage'), (req, res) => {

    const imageP = '/' + req.file.path.replace(/\\/g, '/');
    const imagePath = imageP.replace('/public', '');
    const userData = req.cookies.user ? JSON.parse(req.cookies.user) : null;

    const user_id = userData.mee.user_id

    const sql = `UPDATE jvmc.jvmc_profile SET profilePix = ? WHERE user_id = ?;
    `;
    const values = [imagePath, user_id];
    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error storing account data:', err);
            return res.status(500).send('Internal Profile Error');
        }
        console.log(`Image Path: ${imagePath}`);

        res.redirect('/logout');
    });


});


// Admin profile Dashboard 
route.get('/profile', UserLoggin, (req, res) => {
    const userData = req.app.get('userData');
    const userCookie = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    console.log('Here is my Profile Data', userCookie);
    if (!userCookie) {
        res.redirect('/login');
    } else {
        const user = db.query('SELECT * FROM jvmc.jvmc_users WHERE email = ?', [userData.mee.email], async (error, result) => {

            if (error) {
                console.log(" Login Error :", error);
                return res.redirect('/logout');
            }
            if (result) {
                res.render('profile', { userData, });
            }

        })
    }
});
// To Edit the profile 
// 1. Change password 


// To Get the password page 
route.get('/passW', (req, res) => {

    const userCookie = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    const userData = userCookie
    const message = ''
    if (userCookie) {
        res.render('pass-edit', { userData, message });
    } else {
        res.redirect('/login');
    }
})


// To Update The Password Data 
route.post('/profile/updatePass', UserLoggin, async (req, res) => {

    try {
        const { oldPassword, newPassword } = req.body;
        const userData = req.app.get('userData');

        // Retrieve the current hashed password from the database
        const selectQuery = 'SELECT password FROM jvmc.jvmc_users WHERE email = ?';
        let selectValues = [userData.mee.email];

        db.query(selectQuery, selectValues, async (selectError, selectResults) => {
            if (selectError) {
                console.error('Database select error:', selectError);
                res.status(500).send('Error selecting password from the database');
                return;
            }

            if (selectResults.length === 0) {
                res.status(404).send('User not found');
                return;
            }

            const hashedPassword = selectResults[0].password;

            // Compare the provided old password with the hashed password
            const passwordMatch = await bcrypt.compare(oldPassword, hashedPassword);

            if (passwordMatch) {
                // Hash the new password
                const hashedNewPassword = await bcrypt.hash(newPassword, 10);

                // Update the password in the database
                const updateQuery = 'UPDATE jvmc.jvmc_users SET password = ? WHERE email = ?';
                const updateValues = [hashedNewPassword, userData.mee.email];

                db.query(updateQuery, updateValues, updateError => {
                    if (updateError) {
                        console.error('Database update error:', updateError);
                        res.status(500).send('Error updating password in the database');
                        return;
                    }
                    const sqlGetUserWithAccount = `
                    SELECT 
                      u.user_id,
                      u.id,
                      u.email,
                      u.user_role,
                      u.password,
                      u.department,
                      a.staff_id,
                      a.surname,
                      a.otherNames,
                      a.id,
                      a.user_id,
                      a.job_status,
                      a.whatsapp,
                      a.phone_number,
                      a.dob,
                      a.about,
                      a.office,
                      a.gender,
                      a.resume_date
                    FROM jvmc.jvmc_users u
                    LEFT JOIN jvmc.jvmc_profile a ON u.user_id = a.user_id
                    WHERE u.email = ?;
                  `;
                    db.query(sqlGetUserWithAccount, [userData.mee.email], async (error, result) => {
                        if (error) {

                            return res.status(500).json({
                                message: 'Internal Server Error'
                            });
                        }

                        if (result.length === 0) {
                            return res.status(401).json({
                                message: 'Invalid Email or Password'
                            });
                        }
                        console.log('This is the Login Result :', result);
                        // Compare the provided password with the hashed password in the database

                        req.app.set('userData', result[0])


                        const userWithAccount = result[0];
                        res.clearCookie('user');
                        res.cookie('user', JSON.stringify(userWithAccount));
                        res.redirect('/dashboard');

                    });
                });
            } else {
                let message = "Incorrect Old Password"
                res.render('pass-edit', { message, userData });
            }
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).send('Unexpected error');
    }
});


// To Get the edit profile page 
route.get('/edtProf', (req, res) => {

    const userCookie = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    const userData = userCookie
    const message = ''
    if (userCookie) {
        res.render('pass-profile', { userData, message });
    } else {
        res.redirect('/login');
    }
})


// To Edit all profile 
route.use('/', require('./editProfile'));

// To Get All the tasks on a page
route.get('/dashboard/profile', UserLoggin, (req, res) => {
    const userData = req.app.get('userData');
    const userCookie = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    console.log('Here is my Dashboard Data', userCookie);
    if (!userCookie) {
        res.redirect('/login');
    } else {
        const user = db.query('SELECT * FROM jvmc.jvmc_users WHERE email = ?', [userData.email], async (error, result) => {

            console.log('This is the Admin dashboard Details : ', userData);
            if (error) {
                console.log(" Login Error :", error);
                return res.redirect('/logout');
            }
            if (result) {
                res.render('home', { userData, });
            }

        })
    }
});

// Leave Section


// The get create leave section page 

route.get('/leave/request', (req, res) => {

    const userCookie = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    const userData = userCookie
    const message = ''
    if (userCookie) {
        res.render('create-leave', { userData, message });
    } else {
        res.redirect('/login');
    }
})

// To Apply for leave or post leave 
route.post('/new/leave', async (req, res) => {

    const userData = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    const leave_id = userData.mee.user_id;
    db.query('SELECT leave_id FROM jvmc.jvmc_leave WHERE leave_id = ?', [leave_id], async (error, result) => {
        if (error) {

            const message = 'Internal Server Error'
            res.render('create-leave', { userData, message });
        }

        if (result.length > 0) {
            const message = 'Leave Already Created (Processing...) '
            return res.render('create-leave', { userData, message });
        }

        const { name, department, reason, duration, start } = req.body;
        const currentDate = new Date();
        // Extract date part
        const applic_date = currentDate.toISOString().split('T')[0]
        const time = new Date().toLocaleTimeString();
        const status = 'pending';

        // To Fill the task Data 
        const sql = `INSERT INTO jvmc.jvmc_leave (name, department, reason, duration, start, leave_id, applic_date, status) VALUES (?,?,?,?,?,?,?,?)`;
        const values = [name, department, reason, duration, start, leave_id, applic_date, status];
        db.query(sql, values, (err, result) => {
            if (err) {
                console.error('Error storing account data:', err);
                return res.status(500).send('Internal Profile Error');
            }
            res.redirect('/staff/leave/request')
        });
    });
});

// To get all pending leave requests 
route.get('/leave', (req, res) => {

    const userCookie = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    const userData = userCookie
    if (userCookie) {
        const sqlQuery = 'SELECT * FROM jvmc.jvmc_leave ORDER BY id DESC';

        // Execute the query
        db.query(sqlQuery, (err, results) => {
            if (err) {
                console.error('Error executing MySQL query: ' + err.stack);
                res.status(500).send('Error retrieving jvmc_leave records');
                return;
            }
            const userRept = results
            // Send the results as JSON response

            res.render('leaveAll', { userData, userRept });
        });

    } else {
        res.redirect('/login');
    }
})

// To get one leave 
// To get all pending leave requests 
route.get('/myleave', UserLoggin, (req, res) => {

    const userCookie = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    const userData = userCookie
    const leave_id = userCookie.mee.user_id
    if (userCookie) {
        const sqlQuery = 'SELECT * FROM jvmc.jvmc_leave WHERE leave_id = ?';

        // Execute the query
        db.query(sqlQuery, [leave_id], (err, results) => {
            if (err) {
                console.error('Error executing MySQL query: ' + err.stack);
                res.status(500).send('Error retrieving jvmc_leave records');
                return;
            }
            const userRept = results[0]
            // Send the results as JSON response
            res.render('one-leave', { userData, userRept });
        });
    } else {
        res.redirect('/login');
    }
})


// This is where I would have my first break and prepare for my exams
// TASK SECTION 

// task route To get all tasks from all users

route.get('/task', UserLoggin, (req, res) => {

    const userCookie = req.cookies.user ? JSON.parse(req.cookies.user) : null;

    if (userCookie) {
        const progress = 'finished'
        const sqlw = `
          SELECT * FROM jvmc.jvmc_task WHERE progress = ? ORDER BY id DESC;
        `;

        db.query(sqlw, [progress], (err, results) => {
            if (err) {
                return res.status(500).send('Internal Server Error');
            }
            res.clearCookie('userRept');
            req.app.set('userRept', results)
            const userData = userCookie
            const userRept = req.app.get('userRept');
            console.log("All task detail is", userRept)
            res.render('task', { userRept, userData, announce });

        });

    } else {

        res.redirect('/login');
    }


})

// To Get All the task of One user only
route.get('/task/:user_id', UserLoggin, (req, res) => {
    // const userData = req.app.get('userData');
    const userCookie = req.cookies.user ? JSON.parse(req.cookies.user) : null;
 
    if (userCookie) {
        const user_id = userCookie.mee.user_id
        const progress = 'pending'
        const sql = `
          SELECT * FROM jvmc.jvmc_task WHERE user_id = ? AND progress = ? ORDER BY id DESC ;
        `;

        db.query(sql, [user_id, progress], (err, results) => {
            if (err) {
                return res.status(500).send('Internal Server Error');
            }
            res.clearCookie('userRept');
            req.app.set('userRept', results)
            const userData = userCookie
            const userRept = req.app.get('userRept');
            console.log('This is the Task',results)
            res.render('task', { userRept, userData, announce });
        });


    } else {

        res.redirect('/login');
    }

})


// To Read only One Specific task
route.get('/taske/:id', UserLoggin, async (req, res) => {
    try {
        const id = req.params.id;
        const userCookie = req.cookies.user ? JSON.parse(req.cookies.user) : null;

        if (!userCookie) {
            return res.redirect('/login');
        }
        // Fetch task data 
        const [task] = await new Promise((resolve, reject) => {
            const sql = `SELECT * FROM jvmc.jvmc_task WHERE id = ?;`;
            db.query(sql, [id], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        if (!task) {
            return res.status(404).send('task not found');
        }
        const task_id = task.task_id
        // Fetch task content data
        const taskContent = await new Promise((resolve, reject) => {
            const sqls = `SELECT * FROM jvmc.task_list WHERE task_id = ?;`;
            db.query(sqls, [task_id], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        // Clear the 'oneRept' cookie
        res.clearCookie('oneRept');

        // Set application level data
        req.app.set('oneRept', taskContent);

        const userData = userCookie;
        // Render the 'one-task' view
        res.render('one-task', { oneRept: taskContent, userData, task });

    } catch (err) {
        console.error('Error handling /dash/:id route:', err);
        res.status(500).send('Internal Server Error');
    }
});

// To get the create task page 
route.get('/create/task', UserLoggin, (req, res) => {

    const userCookie = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    const userData = userCookie
    if (!userCookie) {
        res.redirect('/login');
    } else {

        res.render('create-task', { userData })
    }
})

// To Create task  
route.post('/new/Task', async (req, res) => {

    const userData = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    const { name, title } = req.body;
    const user_id = userData.mee.user_id
    const task_id = rand + 'JvMc' + rando
    const currentDate = new Date();
    // Extract date part  
    const date = currentDate.toISOString().split('T')[0]
    const time = new Date().toLocaleTimeString();

    // To Fill the task Data 

    try {
        const sql = `INSERT INTO jvmc.jvmc_task (name, title, task_id, date , time, user_id) VALUES (?,?,?,?,?,?)`;
    const values = [name, title, task_id, date, time, user_id];
    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error storing Task Data:', err);
            return res.status(500).send('Internal Profile Error');
        }
        res.clearCookie('oneTask');
        res.cookie('task', JSON.stringify({ ...result }));
        req.app.set('oneTask', result)
        res.redirect('/staff/track/Task/'+ task_id)
    });
    } catch (error) {
        const message = 'Error storing Task Data:'
        return res.render('message', { message, layout: false })
    }

});

// To get the Task page 
route.get('/track/Task/:id', UserLoggin, (req, res) => {

    const userCookie = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    if (userCookie) {
        const id = req.params.id;
        const sql = `
          SELECT * FROM jvmc.jvmc_task WHERE task_id = ?;
        `;
        db.query(sql, [id], (err, result) => {
            if (err) {
                return res.status(500).send('Internal Server Error');
            }
            const title = result[0].title

            const sqls = `SELECT * FROM jvmc.task_list WHERE task_id = ?; `;
            db.query(sqls, [id], (err, results) => {
                if (err) {
                    return res.status(500).send('Internal Server Error');
                }
                res.clearCookie('oneRept');
                req.app.set('oneRept', results)
                const userData = userCookie
                const oneRept = results
                const taskId =id
                res.render('create-task2', { oneRept, userData, id, title, taskId });
            });
        });

    } else {
        res.redirect('/login');
    }
})



// To Add Content to a Task  
route.post('/task/tracking/', UserLoggin, async (req, res) => {
    const userData = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    const { task_id, task, objective, target, remark, timeline, expectations, achievement } = req.body;
    // Validate input data
    if (!task || !objective || !timeline || !expectations || !achievement) {
        return res.status(400).send('All fields are required');
    }

    // Check if task_id exists in jvmc_task table
    const checkSql = 'SELECT * FROM jvmc.jvmc_task WHERE task_id = ?';
    db.query(checkSql, [task_id], (checkErr, checkResult) => {
        if (checkErr) {
            console.error('Error checking task_id:', checkErr);
            return res.status(500).send('Internal Server Error');
        }

        if (checkResult.length === 0) {
            return res.status(404).send('task_id not found');
        }

        const id = checkResult[0].id

        // Proceed with inserting into task_list
        const insertSql = `INSERT INTO jvmc.task_list (task, objective, target, remark, timeline, expectations , achievement, task_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [task, objective, target, remark, timeline, expectations, achievement, task_id];

        db.query(insertSql, values, (insertErr, insertResult) => {
            if (insertErr) {
                console.error('Error inserting Task content:', insertErr);
                return res.status(500).send('Internal Server Error');
            }
            res.redirect('/staff/track/Task/' + task_id)
        });
    }); 
});


// To Delete A Task And Task Content 


// To delete a task content
route.get('/del/tracker/:id', UserLoggin, async (req, res) => {
    try {
        const id = req.params.id;

        // Check if the user is logged in
        const userCookie = req.cookies.user ? JSON.parse(req.cookies.user) : null;
        if (!userCookie) {
            return res.status(401).send('Unauthorized');
        }

        const sqls = `SELECT * FROM jvmc.task_list WHERE id = ?;`;
        db.query(sqls, [id], (err, results) => {
            if (err) {
                console.error('Error deleting task content:', err);
                return res.status(500).send('Internal Server Error');
            }
            const task_id = results[0].task_id
            // Perform the deletion
            const sql = `DELETE FROM jvmc.task_list WHERE id = ?;`;
            db.query(sql, [id], (err, result) => {
                if (err) {
                    console.error('Error deleting task content:', err);
                    return res.status(500).send('Internal Server Error');
                }
                // Check if any rows were affected
                if (result.affectedRows === 0) {
                    return res.status(404).send('task content not found');
                }
                res.redirect('/staff/track/Task/' + task_id);
            });
        });
    } catch (err) {
        console.error('Error handling /delete-task-content/:id route:', err);
        res.status(500).send('Internal Server Error');
    }
});



// To delete a complete task 
route.get('/del/task/:id', UserLoggin, (req, res) => {
    try {
        const task_id = req.params.id;

        // Check if the user is logged in
        const userCookie = req.cookies.user ? JSON.parse(req.cookies.user) : null;
        if (!userCookie) {
            return res.status(401).send('Unauthorized');
        }

        // Perform the deletion
        const sql = `DELETE FROM jvmc.task_list WHERE task_id = ?;`;
        db.query(sql, [task_id], (err, result) => {
            if (err) {
                console.error('Error deleting task content:', err);
                return res.status(500).send('Internal Server Error');
            }

        });

        // To Delete the parent 
        const sqls = `DELETE FROM jvmc.jvmc_task WHERE task_id = ?;`;
        db.query(sqls, [task_id], (err, result) => {
            if (err) {
                console.error('Error deleting task content:', err);
                return res.status(500).send('Internal Server Error');
            }
            // Check if any rows were affected
            if (result.affectedRows === 0) {
                return res.status(404).send('task content not found');
            } // task content successfully deleted

            const userId = userCookie.mee.user_id
            res.redirect('/staff/task/'+userId);
        });


    } catch (err) {
        console.error('Error handling /delete-task-content/:id route:', err);
        res.status(500).send('Internal Server Error');
    }
});
// HomePage Banner & Editing
// To Get Banner Page 
route.get('/banner', UserLoggin, (req, res) => {

    const userData = req.cookies.user ? JSON.parse(req.cookies.user) : null;
  

    res.render('banner', { userData, balance, respond });
})

// To Change First Banner Slide 
route.post('/first/banner', (req, res) => {
    const { title, message,url } = req.body;

    // Update the announce object
    if (title) balance.title = title;
    if (message) balance.message = message;
    if (url) balance.url = url;

    const respond = 'Banner Details Updated successfully'
    const userData = req.cookies.user ? JSON.parse(req.cookies.user) : null;

    res.render('banner', { userData, balance, respond });
});

// To Change First Slide 
route.post('/next/banner', (req, res) => {
    const { title1, message1, url1 } = req.body;

    // Update the announce object
    if (title1) balance.title = title1;
    if (url1) balance.title = url1; 
    if (message1) balance.message = message1;

    const respond = 'Balance updated successfully'
    const userData = req.cookies.user ? JSON.parse(req.cookies.user) : null;

    res.render('banner', { userData, balance, respond });
});

// Secttings Page 
route.get('/settings', UserLoggin, (req, res) => {

    const userData = req.cookies.user ? JSON.parse(req.cookies.user) : null;

    res.render('set', { userData, announce, respond });
})


// Announcement & Editing

// To Get Announcement Page 
route.get('/announce', UserLoggin, (req, res) => {

    const userData = req.cookies.user ? JSON.parse(req.cookies.user) : null;

    res.render('announce', { userData, announce, respond });
})

// To Change First Slide 
route.post('/first/announce', (req, res) => {
    const { title, message } = req.body;

    // Update the announce object
    if (title) announce.title = title;
    if (message) announce.message = message;

    const respond = 'Announcement updated successfully'
    const userData = req.cookies.user ? JSON.parse(req.cookies.user) : null;

    res.render('announce', { userData, announce, respond });
});

// To Change First Slide 
route.post('/next/announce', (req, res) => {
    const { title2, message2 } = req.body;

    // Update the announce object
    if (title2) announce.title = title2;
    if (message2) announce.message = message2;

    const respond = 'Announcement updated successfully'
    const userData = req.cookies.user ? JSON.parse(req.cookies.user) : null;

    res.render('announce', { userData, announce, respond });
});


// Payroll Section 

// To get the Payrol & Appraisal for the month 
route.get('/generator', UserLoggin, (req, res) => {

    const userCookie = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    const userData = userCookie
    if (userCookie) {

        res.render('generator', { userData });

    } else {
        res.redirect('/login');
    }
})

// To fill the payroll 
route.post('/neIw/gEn', UserLoggin, (req, res) => {
    const { prepared_by, month_id } = req.body;
    const sep = month_id.split('-')
    const month = sep[0];

    db.query('SELECT month_id FROM jvmc.jvmc_month WHERE month_id = ?', [month_id], async (error, result) => {
        if (error) {
            console.log("Customized Error ", error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (result.length > 0) {
            res.redirect('/staff/track/Task/' + task_id)
        }
        const sql = `INSERT INTO jvmc.jvmc_month SET ?`;
        const values = { month, prepared_by, month_id };
        db.query(sql, values, (err, result) => {
            if (err) {
                console.error('Error storing dept data:', err);
                return res.status(500).send('Internal Profile Error');
            }

            res.redirect('/staff/payroll/' + month_id);
        });
    });






});

// Payrol Filling Table table 
route.get('/payroll/:month_id', UserLoggin, (req, res) => {

    const userCookie = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    const userData = userCookie;
    const month_id = req.params.month_id;
    if (userCookie) {
        const sqlQuery = 'SELECT * FROM jvmc.jvmc_profile ORDER BY id DESC';

        // Execute the query
        db.query(sqlQuery, (err, results) => {
            if (err) {
                console.error('Error executing MySQL query: ' + err.stack);
                res.status(500).send('Error retrieving jvmc_leave records');
                return;
            }
            const userRept = results
            // Send the results as JSON response
            const sqlQuerys = 'SELECT * FROM jvmc.jvmc_payroll WHERE month_id = ? ORDER BY id DESC';

            // Execute the query
            db.query(sqlQuerys,[month_id], (err, results) => {
                if (err) {
                    console.error('Error executing MySQL query: ' + err.stack);
                    res.status(500).send('Error retrieving jvmc_leave records');
                    return;
                }
                const userPay = results
                // Send the results as JSON response

                res.render('payroll', { userData, userRept, month_id,userPay });
            });

        });

    } else {
        res.redirect('/login');
    }
})

// To fill the payroll 
route.post('/fIll/payRoLl', UserLoggin, (req, res) => {
    const { name, salary, user_id, month_id, ann_salary, taxable_inc, tax, con_relief, annual_net, take_home, deduction, ded_analysis } = req.body;

    const balance = ( parseFloat(take_home) - parseFloat(deduction) );

    const sql = `INSERT INTO jvmc.jvmc_payroll SET ?`;
    const values = { name, salary, balance, user_id, month_id, ann_salary, taxable_inc, tax, con_relief, annual_net, take_home, deduction, ded_analysis };
    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error storing dept data:', err);
            return res.status(500).send('Internal Profile Error');
        }
        console.log('Payroll Successfully filled');
        res.redirect('/staff/payroll/' + month_id);
    });

});


// To Get All the payroll of One user only
route.get('/myPay/:user_id', UserLoggin, (req, res) => {
    // const userData = req.app.get('userData');
    const userCookie = req.cookies.user ? JSON.parse(req.cookies.user) : null;

    if (userCookie) {
        const user_id = userCookie.mee.user_id
        const sql = `
          SELECT * FROM jvmc.jvmc_payroll WHERE user_id = ?  ORDER BY id DESC ;
        `;

        db.query(sql, [user_id], (err, results) => {
            if (err) {
                return res.status(500).send('Internal Server Error');
            }
            res.clearCookie('userPay');
            req.app.set('userPay', results)
            const userData = userCookie
            const userPay = req.app.get('userPay')
            console.log('The User payrol is :'+userPay);
            res.render('my-paysheet', { userPay, userData });
        });


    } else {

        res.redirect('/login');
    }

})

// To Get All the payroll of the month only
route.get('/monthly', UserLoggin, (req, res) => {
    // const userData = req.app.get('userData');
    const userCookie = req.cookies.user ? JSON.parse(req.cookies.user) : null;

    if (userCookie) {
        const month_id = req.params.month_id;
        const sql = `
          SELECT * FROM jvmc.jvmc_month  ORDER BY id DESC ;
        `;

        db.query(sql, [month_id], (err, results) => {
            if (err) {
                return res.status(500).send('Internal Server Error');
            }
            res.clearCookie('userPay');
            req.app.set('userPay', results)
            const userData = userCookie
            const userPay = req.app.get('userPay')
            console.log('The User payrol is :'+userPay);
            res.render('paysheet-month', { userPay, userData });
        });


    } else {

        res.redirect('/login');
    }

})


// To Read only One Specific payroll
route.get('/payslip/:id', UserLoggin, async (req, res) => {
    try {
        const id = req.params.id;
        const userCookie = req.cookies.user ? JSON.parse(req.cookies.user) : null;

        if (!userCookie) {
            return res.redirect('/login');
        }

        // Fetch payroll data
        const [payroll] = await new Promise((resolve, reject) => {
            const sql = `SELECT * FROM jvmc.jvmc_payroll WHERE id = ?;`;
            db.query(sql, [id], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        if (!payroll) {
            return res.status(404).send('payroll not found');
        }

        // Clear the 'oneRept' cookie
        res.clearCookie('oneRept');

        // Set application level data
        req.app.set('oneRept', payroll);

        const userData = userCookie;
        // Render the 'one-payroll' view
        res.render('my-payslip', { userData, payroll });

    } catch (err) {
        console.error('Error handling payroll:', err);
        res.status(500).send('Internal Server Error');
    }
});

// To Delete payroll row 
// To delete a report content
route.get('/del/payroLl/:id', UserLoggin, async (req, res) => {
    try {
        const id = req.params.id;

        // Check if the user is logged in
        const userCookie = req.cookies.user ? JSON.parse(req.cookies.user) : null;
        if (!userCookie) {
            return res.status(401).send('Unauthorized');
        }

        const sqls = `SELECT * FROM jvmc.jvmc_payroll WHERE id = ?;`;
        db.query(sqls, [id], (err, results) => {
            if (err) {
                console.error('Error deleting report content:', err);
                return res.status(500).send('Internal Server Error');
            }
            const month_id = results[0].month_id
            // Perform the deletion
            const sql = `DELETE FROM jvmc.jvmc_payroll WHERE id = ?;`;
            db.query(sql, [id], (err, result) => {
                if (err) {
                    console.error('Error deleting report content:', err);
                    return res.status(500).send('Internal Server Error');
                }
                // Check if any rows were affected
                if (result.affectedRows === 0) {
                    return res.status(404).send('Report content not found');
                }
                // Report content successfully deleted

                res.redirect('/staff/payroll/' + month_id);
            });
        });
    } catch (err) {
        console.error('Error handling /delete-report-content/:id route:', err);
        res.status(500).send('Internal Server Error');
    }
});


// Performance Appraisal 



module.exports = route