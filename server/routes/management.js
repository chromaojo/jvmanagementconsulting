const express = require('express');
const route = express.Router();
const path = require("path");
const bodyParser = require('body-parser');
const mail = require('../config/mail');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const { UserLoggin, AvoidIndex, ManRole } = require('../auth/userAuth');
const db = require('../config/dbConfig');
const cookieParser = require('cookie-parser');
const rand = Math.floor(Math.random() * 9999999)
const rando = Math.floor(Math.random() * 9999)




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


// To Register a sample Department N Mgt 
route.post('/regAdmin1', ManRole, async (req, res) => {
    // const { email, password, password1, user_id, surname, otherName, whatsapp, job_status, phone_number, staff_id, state_origin, country, office, address, gender, dob, bank_name, bank_account, account_name } = req.body;

    const email = 'admined@gmail.com';
    const password = 'admin1234';
    const phone_number = 8081552334;
    const department = 'I. T';
    const user_id = 'mgt' + rand;
    const user_role = 'management';
    const dept_id = rando
    const surname = 'Jane';
    const otherNames = 'Doe Diva';
    const name = department
    const status = "passive"
    const objective = "To ensure every human processes is actualized."


    const sql = `INSERT INTO jvmc.jvmc_dept SET ?`;
    const values = { name, objective, dept_id };
    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error storing dept data:', err);
            return res.status(500).send('Internal Profile Error');
        }
        console.log('Department Successfully Created');
    });

    // Check if passwords match
    // if (password !== password1) {
    //     return res.redirect('/signUp');
    // }

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
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into database
        db.query('INSERT INTO jvmc.jvmc_users SET ?', { email, password: hashedPassword, user_id, user_role, department }, (error, result) => {
            if (error) {
                console.log('A Registration Error Occurred ', error);
                return res.status(500).json({ message: 'Internal Server Error' });
            }

            // const messages = {
            //     from: {
            //         name: 'JV Management Consulting',
            //         address: 'felixtemidayoojo@gmail.com',
            //     },
            //     to: email,
            //     subject: "Welcome To JV Management Consulting",
            //     text: `Dear ${surname} , We're thrilled to have you join our community of forward-thinkers and achievers. Whether you're seeking innovative solutions to elevate your business or looking to embark on a transformative journey of growth, you're in the right place.

            //     At JV Management Consulting, we're committed to partnering with you to unlock your full potential and navigate the ever-evolving landscape of business challenges. Our team of experts is here to provide tailored strategies, insightful guidance, and unwavering support every step of the way.

            //     Your submitted details are as follows :
            //     Full Name : ${surname} ${firstName}
            //     Email Address : ${email}
            //     Registered phone number : ${phone_number}
            //     Passwored : ${password}
            //     Your Staff Id is : ${staff_id}

            //     Once again, welcome aboard! We're excited to embark on this journey with you.

            //     Best regards,
            //     Jennifer Seidu,
            //     JV Management Consulting Team`

            // };

            // // Send email
            // mail.sendIt(messages);



            // To Fill the profile Data 
            db.query('SELECT * FROM jvmc.jvmc_users WHERE email = ?', [email], async (error, result) => {
                if (error) {
                    console.log("Account creation Error ", error);
                    return res.status(500).json({ message: 'Account Server Error' });
                }
                const user_id = result[0].user_id
                const staff_id = rand + 'mgt'
                // Insert account data
                const sql = `INSERT INTO jvmc.jvmc_profile SET ?`;
                const values = { user_id, status, surname, otherNames, phone_number, staff_id };
                db.query(sql, values, (err, result) => {
                    if (err) {
                        console.error('Error storing account data:', err);
                        return res.status(500).send('Internal Server Error');
                    }
                    res.status(200).redirect('/login');
                });
            })
            // To initiate the table for Department
        });
    });
});

// To Register new Maanagement 


// Registering Management
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
            res.render('create-mgt', { userDept, userData });
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
                const leave_total = 20;
                const status = 'active';
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
                    const message = 'Management Account Created Successfully'
                    res.render('message', { userData, message })
                });

            })
            // To initiate the table for Department
        });
    });
});

// Get Links Page 
route.get('/links', UserLoggin, (req, res) => {

    const userData = req.app.get('userData');

    res.render('links', { userData });
})

// To create DEPARTMENT 




// Get Create Department 

route.get('/dept', UserLoggin, (req, res) => {

    const query = `SELECT * FROM jvmc.jvmc_profile `;


    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching staff:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        const staffs = results
        const userData = req.app.get('userData');

        res.render('create-dept', { userData, staffs });
    })

})



// To Post Creating Department
route.post('/create/dept', (req, res) => {
    const { name, objective, hod } = req.body;
    const userData = req.app.get('userData');
    db.query('SELECT name FROM jvmc.jvmc_dept WHERE name = ?', [name], async (error, result) => {

        if (error) {
            return res.status(500).send('Internal Profile Error');
        }

        if (result.length > 0) {

            const message = 'Department Already Registered';
            res.render('create-dept', { userData, message });
        } else {
            const dept_id = rand
            const sql = `INSERT INTO jvmc.jvmc_dept SET ?`;
            const values = { name, objective, hod, dept_id };
            db.query(sql, values, (err, result) => {
                if (err) {
                    console.error('Error storing dept data:', err);
                    return res.status(500).send('Internal Profile Error');
                }
                res.redirect('/staff/dept')
            });
        }
    });


})

// Delete Department.
route.get('/del/:dept_id', UserLoggin, async (req, res) => {

    const dept_id = req.params.dept_id;
    try {


        console.log('Dept_id is ' + dept_id)
        // Check if the user is logged in
        const userCookie = req.cookies.user ? JSON.parse(req.cookies.user) : null;
        if (!userCookie) {
            return res.status(401).send('Unauthorized');
        }

        const sql = `DELETE FROM jvmc.jvmc_dept WHERE dept_id = ?;`;
        db.query(sql, [dept_id], (err, result) => {
            if (err) {
                console.error('Error deleting Department :', err);
                return res.status(500).send('Internal Server Error');
            }
            // Check if any rows were affected
            if (result.affectedRows === 0) {
                return res.status(404).send('Department not found');
            }
            // task content successfully deleted

            res.redirect('/staff/dept/');
        });
    } catch (err) {
        console.error('Error handling /delete-task-content/:id route:', err);
        res.status(500).send('Internal Server Error');
    }
});


// Create SME 

// 1. Post the SME Registeration Page 

// To Create SME 
route.post('/new/sme', async (req, res) => {
    const { name, email, about, staff_strength, phone_number, phone_number1, country, state, local } = req.body;

    const address = local + ' ,' + state + " State, " + country
    const unique_id = 'SME' + rand

    db.query('SELECT email FROM jvmc.jvmc_sme WHERE email = ?', [email], async (error, result) => {

        if (error) {
            return res.status(500).send('Internal Profile Error');
        }

        if (result.length > 0) {

            const message = 'Email Already Registered';
            res.sendFile(path.join(__dirname, "../../statics", 'ewarning.html'));
        } else {

            // To Fill the task Data 
            const sql = `INSERT INTO jvmc.jvmc_sme SET ?`;
            const values = { name, email, about, staff_strength, phone_number, phone_number1, address, unique_id };
            db.query(sql, values, (err, result) => {
                if (err) {
                    console.error('Error storing account data:', err);
                    return res.status(500).send('Internal Profile Error');
                }
                res.sendFile(path.join(__dirname, "../../statics", 'sucess.html'));
                
            });
        }



    })
});

// To see all registered SME 

route.get('/jvmc_sme', UserLoggin, (req, res) => {
    const userData = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    // Query to select all rows from the table ordered by id in descending order (most recent first)
    const sql = 'SELECT * FROM jvmc.jvmc_sme ORDER BY id DESC';

    // Execute the query
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error executing MySQL query: ' + err.stack);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }

        const userSME = results
        // Send the results as JSON response
        console.log('Sme Info :' + userSME)

        res.render('sme_all', { userData, userSME });
    });
});

// To view each SME details 
route.get('/jvmc_sme/:id', UserLoggin, (req, res) => {
    const user_id = req.params.id;
    const userData = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    // Query to select all rows from the table ordered by id in descending order (most recent first)
    const sql = 'SELECT * FROM jvmc.jvmc_sme WHERE id = ?';


    // Execute the query
    db.query(sql, [user_id], (err, results) => {
        if (err) {
            console.error('Error executing MySQL query: ' + err.stack);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }

        const userSME = results[0]
        // Send the results as JSON response
        console.log('Single user Details', userSME)

        res.render('sme_one', { userData, userSME });
    });
});


// To view Registered SME and their tasks 
route.get('/View_sme', (req, res) => {

    const userData = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    const sql = `
      SELECT jvmc_sme.*, sme_rep.*
      FROM jvmc_sme
      LEFT JOIN sme_rep ON jvmc_sme.unique_id = sme_rep.user_id
    `;
    db.query(sql, (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            const userSME = results
            // Send the results as JSON response

            res.render('sme_one', { userData, userSME });
        }
    });
});


// Create Task and Task contents 

// To get the add content page 

// To Add Content to a Task  
route.post('/add/rep', UserLoggin, async (req, res) => {
    const { action, outcome, status, task_id } = req.body;

    // Validate input data
    if (!action || !outcome || !status || !task_id) {
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
        // Proceed with inserting into task_list
        const insertSql = `INSERT INTO jvmc.task_list (action, outcome, status, task_id) VALUES (?, ?, ?, ?)`;
        const values = [action, outcome, status, task_id];

        db.query(insertSql, values, (insertErr, insertResult) => {
            if (insertErr) {
                console.error('Error inserting Task content:', insertErr);
                return res.status(500).send('Internal Server Error');
            }
            res.redirect('/add/task/' + task_id)
        });
    });
});

// To delete a task content
route.get('/del/content/:id', UserLoggin, async (req, res) => {
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
                // task content successfully deleted

                res.redirect('/dash/' + task_id);
            });
        });
    } catch (err) {
        console.error('Error handling /delete-task-content/:id route:', err);
        res.status(500).send('Internal Server Error');
    }
});
// To delete a reprt 
route.get('/del/task/:id', UserLoggin, async (req, res) => {
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
            const userC = req.cookies.user ? JSON.parse(req.cookies.user) : null;
            const user_id = userC.user_id
            res.redirect('/task/' + user_id);
        });


    } catch (err) {
        console.error('Error handling /delete-task-content/:id route:', err);
        res.status(500).send('Internal Server Error');
    }
});



// All Active Staffs 
route.get('/all-current', (req, res) => {

    const status = "active"
    const userCookie = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    const userData = userCookie
    if (userCookie) {
        const sqlQuery = 'SELECT * FROM jvmc.jvmc_profile WHERE status = ? ORDER BY id DESC';

        // Execute the query
        db.query(sqlQuery, [status], (err, results) => {
            if (err) {
                console.error('Error executing MySQL query: ' + err.stack);
                res.status(500).send('Error retrieving jvmc_leave records');
                return;
            }
            const userRept = results
            // Send the results as JSON response

            res.render('all-staff', { userData, userRept });
        });

    } else {
        res.redirect('/login');
    }
})

// All Staffs 
route.get('/all-resigned', (req, res) => {

    const status = "disengaged"
    const userCookie = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    const userData = userCookie
    if (userCookie) {
        const sqlQuery = 'SELECT * FROM jvmc.jvmc_profile WHERE status = ? ORDER BY id DESC';

        // Execute the query
        db.query(sqlQuery, [status], (err, results) => {
            if (err) {
                console.error('Error executing MySQL query: ' + err.stack);
                res.status(500).send('Error retrieving jvmc_leave records');
                return;
            }
            const userRept = results
            // Send the results as JSON response

            res.render('all-staff', { userData, userRept });
        });

    } else {
        res.redirect('/login');
    }
})

// All Staffs 
route.get('/all-sacked', (req, res) => {

    const status = "terminated"
    const userCookie = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    const userData = userCookie
    if (userCookie) {
        const sqlQuery = 'SELECT * FROM jvmc.jvmc_profile WHERE status = ? ORDER BY id DESC';

        // Execute the query
        db.query(sqlQuery, [status], (err, results) => {
            if (err) {
                console.error('Error executing MySQL query: ' + err.stack);
                res.status(500).send('Error retrieving jvmc_leave records');
                return;
            }
          const userRept = results
            // Send the results as JSON response

            res.render('all-staff', { userData, userRept });
        });

    } else {
        res.redirect('/login');
    }
})



// To view my performance 
route.get('/perform', async(req, res) => {

    const userCookie = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    const userData = userCookie
    if (userCookie) {
        

        // Execute the query
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
        


        // Performance Percent = Number of completed project / total number of reports * 100

        res.render('perform', { userData, percent });
    } else {
        res.redirect('/login');
    }
})

// To Fill Appraisal Form 

// To Approve Appraisal 









module.exports = route;