const express = require('express');
const route = express.Router();
const db = require('../config/dbConfig');
const cookieParser = require('cookie-parser');
const rand = Math.floor(Math.random() * 99999)

// Create A Database
route.get('/createDb', (req, res) => {
  let sql = 'CREATE DATABASE jvmc';

  db.query(sql, (err, result) => {
    if (err) {
      return res.send('Database Creation Error');
    }
    res.send('Database Created');
  
  }); 
});

// Create The Tables
route.get('/createTable', (req, res) => {
  const sqlUsers = `
    CREATE TABLE IF NOT EXISTS jvmc.jvmc_users (
      id INT PRIMARY KEY AUTO_INCREMENT UNIQUE,
      user_id VARCHAR(255) UNIQUE,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL CHECK (LENGTH(password) >= 6),
      department VARCHAR(255),
      username VARCHAR(255),
      user_role ENUM('management', 'staff', 'admin'),
      FOREIGN KEY (department) REFERENCES jvmc.jvmc_dept(name)
    );
  `;

  const sqlDept = `
    CREATE TABLE IF NOT EXISTS jvmc.jvmc_dept (
      id INT AUTO_INCREMENT PRIMARY KEY UNIQUE,
      name VARCHAR(255) UNIQUE,
      hod VARCHAR(255),
      objective VARCHAR(255),
      dept_total INT,
      dept_id VARCHAR(255)
    );
  `;

  const sqlProfile = `
    CREATE TABLE IF NOT EXISTS jvmc.jvmc_profile (
      id INT PRIMARY KEY AUTO_INCREMENT UNIQUE,
      staff_id VARCHAR(255) UNIQUE,
      surname VARCHAR(255),
      profilePix VARCHAR(255),
      credentials VARCHAR(255),
      otherNames VARCHAR(255),
      dob VARCHAR(255),
      state_origin VARCHAR(255),
      country VARCHAR(255),
      gender ENUM('male', 'female', 'other'),
      address VARCHAR(255),
      job_status VARCHAR(255),
      phone_number VARCHAR(255),
      about VARCHAR(255),
      whatsapp VARCHAR(255),
      office VARCHAR(255),
      resume_date DATE,
      resume_year VARCHAR(100),
      bank_name VARCHAR(255),
      bank_account VARCHAR(255),
      account_name VARCHAR(255),
      user_id VARCHAR(255) UNIQUE,
      department VARCHAR(255),
      salary VARCHAR(255),
      leave_total INT,
      status ENUM('active', 'passive', 'disengaged') DEFAULT 'active',
      FOREIGN KEY (user_id) REFERENCES jvmc.jvmc_users(user_id)
    );
  `;

  const sqlMessage = `
    CREATE TABLE IF NOT EXISTS jvmc.jvmc_message (
      id INT PRIMARY KEY AUTO_INCREMENT UNIQUE,
      title VARCHAR(255),
      content TEXT,
      sender VARCHAR(255),
      recipient VARCHAR(255),
      recipient_id VARCHAR(255),
      date VARCHAR(255),
      time VARCHAR(255),
      user_id VARCHAR(255),
      FOREIGN KEY (user_id) REFERENCES jvmc.jvmc_users(user_id)
    );
  `;

  const sqlReports = `
    CREATE TABLE IF NOT EXISTS jvmc.jvmc_report (
      id INT AUTO_INCREMENT PRIMARY KEY,
      report_id VARCHAR(255) UNIQUE,
      title VARCHAR(255) NOT NULL,
      progress ENUM('pending', 'finished') DEFAULT 'pending',
      name VARCHAR(255) NOT NULL,
      user_id VARCHAR(255),
      date VARCHAR(255),
      time VARCHAR(255)
    );
  `;

  const sqlReport = `
    CREATE TABLE IF NOT EXISTS jvmc.report_content (
      id INT PRIMARY KEY AUTO_INCREMENT,
      action TEXT,
      outcome TEXT,
      status ENUM('completed', 'in progress', 'not started', 'onhold'),
      progress ENUM('pending', 'finished') DEFAULT 'pending',
      report_id VARCHAR(255) NOT NULL,
      FOREIGN KEY (report_id) REFERENCES jvmc.jvmc_report(report_id)
    );
  `;

  const sqlLeave = `
    CREATE TABLE IF NOT EXISTS jvmc.jvmc_leave(
      id INT PRIMARY KEY AUTO_INCREMENT,
      leave_id VARCHAR(255) UNIQUE,
      name VARCHAR(255) NOT NULL,
      department VARCHAR(255) NOT NULL,
      reason VARCHAR(255) NOT NULL,
      duration INT,
      applic_date VARCHAR(255),
      note TEXT,
      start VARCHAR(255),
      hr_approval ENUM('approved', 'declined'),
      mgt_approval ENUM('approved', 'declined'),
      status ENUM('approved', 'declined', 'pending', 'ongoing'),
      FOREIGN KEY (leave_id) REFERENCES jvmc.jvmc_users(user_id)
    );
  `;

  const sqlLeaveHist = `
    CREATE TABLE IF NOT EXISTS jvmc.jvmc_leave_hist(
      id INT PRIMARY KEY AUTO_INCREMENT,
      leave_id VARCHAR(255),
      name VARCHAR(255) NOT NULL,
      reason VARCHAR(255) NOT NULL,
      duration INT,
      rem_leave INT,
      applic_date VARCHAR(255),
      start VARCHAR(255),
      approval ENUM('approved', 'declined', 'pending'),
      approved_by VARCHAR(255),
      FOREIGN KEY (leave_id) REFERENCES jvmc.jvmc_users(user_id)
    );
  `;

  const sqlNotification = `
    CREATE TABLE IF NOT EXISTS jvmc.jvmc_notification (
      id INT PRIMARY KEY AUTO_INCREMENT,
      title VARCHAR(70),
      time VARCHAR(70),
      date VARCHAR(70),
      link VARCHAR(115),
      message VARCHAR(255),
      user_id VARCHAR(255),
      FOREIGN KEY (user_id) REFERENCES jvmc.jvmc_users(user_id)
    );
  `;

  const sqlApplicant = `
    CREATE TABLE IF NOT EXISTS jvmc.jvmc_trainee(
      id INT PRIMARY KEY AUTO_INCREMENT,
      email VARCHAR(255) UNIQUE,
      name VARCHAR(255) NOT NULL,
      about TEXT,
      whatsapp VARCHAR(255),
      phone_number VARCHAR(255),
      address VARCHAR(255),
      unique_id VARCHAR(255)
    );
  `;
  
  const sqlSme = `
    CREATE TABLE IF NOT EXISTS jvmc.jvmc_sme(
      id INT PRIMARY KEY AUTO_INCREMENT,
      email VARCHAR(255) UNIQUE,
      name VARCHAR(255) NOT NULL,
      about TEXT,
      phone_number VARCHAR(255),
      phone_number1 VARCHAR(255),
      address VARCHAR(255),
      staff_strength INT,
      status VARCHAR(255),
      unique_id VARCHAR(255) UNIQUE
    );
  `;

  const sqlSmeRep = `
    CREATE TABLE IF NOT EXISTS jvmc.jvmc_task (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255),
      name VARCHAR(255),
      date VARCHAR(255) NOT NULL,
      time VARCHAR(255),
      progress ENUM('pending', 'finished') DEFAULT 'pending',
      task_id VARCHAR(255) NOT NULL UNIQUE,
      user_id VARCHAR(255)
    );
  `;

  const sqltaskContent = `
    CREATE TABLE IF NOT EXISTS jvmc.task_content (
      id INT AUTO_INCREMENT PRIMARY KEY,
      task VARCHAR(255) NOT NULL,
      objective TEXT,
      target TEXT,
      timeline VARCHAR(255),
      expectations TEXT,
      achievement TEXT,
      remark TEXT,
      status VARCHAR(100),
      task_id VARCHAR(255) NOT NULL,
      progress ENUM('pending', 'finished') DEFAULT 'pending',
      FOREIGN KEY (task_id) REFERENCES jvmc.jvmc_task(task_id)
    );
  `;

  const sqlTaskList = `
    CREATE TABLE IF NOT EXISTS jvmc.task_list (
      id INT AUTO_INCREMENT PRIMARY KEY,
      task VARCHAR(255) NOT NULL,
      objective TEXT,
      target TEXT,
      timeline VARCHAR(255),
      expectations TEXT,
      achievement TEXT,
      remark TEXT,
      task_id VARCHAR(255) NOT NULL,
      FOREIGN KEY (task_id) REFERENCES jvmc.jvmc_task(task_id)
    );
  `;

  const sqlMonths = `
    CREATE TABLE IF NOT EXISTS jvmc.jvmc_month (
      id INT AUTO_INCREMENT PRIMARY KEY,
      month_id VARCHAR(255) UNIQUE,
      prepared_by VARCHAR(255) NOT NULL,
      status ENUM('pending', 'finished') DEFAULT 'pending',
      month VARCHAR(255) NOT NULL,
      date VARCHAR(255),
      time VARCHAR(255)
    );
  `;

  const sqlPayroll = `
    CREATE TABLE IF NOT EXISTS jvmc.jvmc_payroll (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255),
      user_id VARCHAR(255),
      month_id VARCHAR(255),
      salary VARCHAR(255),
      ann_salary VARCHAR(255),
      taxable_inc VARCHAR(255),
      tax VARCHAR(255),
      con_relief VARCHAR(255),
      annual_net VARCHAR(255),
      take_home VARCHAR(255),
      bank_name VARCHAR(255),
      acct_name VARCHAR(255),
      account_number VARCHAR(255),
      deduction VARCHAR(255),
      balance VARCHAR(255),
      ded_analysis VARCHAR(255),
      FOREIGN KEY (user_id) REFERENCES jvmc.jvmc_users(user_id),
      FOREIGN KEY (month_id) REFERENCES jvmc.jvmc_month(month_id),
      UNIQUE (user_id, month_id)
    );
  `;

  const sqlBestStaff = `
    CREATE TABLE IF NOT EXISTS jvmc.best_staff (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255),
      department VARCHAR(255),
      staff_id VARCHAR(255),
      acct_name VARCHAR(255),
      FOREIGN KEY (staff_id) REFERENCES jvmc.jvmc_month(month_id)
    );
  `;

  const sqlPerformance = `
    CREATE TABLE IF NOT EXISTS jvmc.staff_perform(
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255),
      productivity INT,
      job_competence INT,
      training INT,
      target INT,
      competence INT,
      hr_remark TEXT,

  );
`;

  const sqlEachstaff = `
  CREATE TABLE IF NOT EXISTS jvmc.perform_appraisal (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task VARCHAR(255) NOT NULL,
    objective TEXT,
    target TEXT,
    timeline VARCHAR(255),
    expectations TEXT,
    achievement TEXT,
    remark TEXT,
    task_id VARCHAR(255) NOT NULL,
    FOREIGN KEY (task_id) REFERENCES jvmc.jvmc_task(task_id)
  );
`;






  db.query(sqlDept, (errBusinessTerms) => {
    if (errBusinessTerms) {
      console.log('Error creating dept table:', errBusinessTerms);
      return res.status(500).send('Internal Server Error');
    }
    console.log('Department Created Successfully');
  });

  db.query(sqlUsers, (errBusinessTerms) => {
    if (errBusinessTerms) {
      console.log('Error creating users table:', errBusinessTerms);
      return res.status(500).send('Internal Server Error');
    }
    console.log('User Created Successfully');
  });


  db.query(sqlProfile, (errBusinessTerms) => {
    if (errBusinessTerms) {
      console.log('Error creating profile table:', errBusinessTerms);
      return res.status(500).send('Internal Server Error');
    }
    console.log('Profile Created Successfully');
  });


  db.query(sqlReports, (errBusinessTerms) => {
    if (errBusinessTerms) {
      console.log('Error creating Reports table:', errBusinessTerms);
      return res.status(500).send('Internal Server Error');
    }
    console.log('Reports Created Successfully');
  });

  db.query(sqlReport, (errBusinessTerms) => {
    if (errBusinessTerms) {
      console.log('Error creating Report content table:', errBusinessTerms);
      return res.status(500).send('Internal Server Error');
    }
    console.log('Report content Created Successfully');
  });

  db.query(sqlLeave, (errBusinessTerms) => {
    if (errBusinessTerms) {
      console.log('Error creating Levae table:', errBusinessTerms);
      return res.status(500).send('Internal Server Error');
    }
    console.log('Leave Created Successfully');
  });
  db.query(sqlLeaveHist, (errBusinessTerms) => {
    if (errBusinessTerms) {
      console.log('Error creating Levae Hist table:', errBusinessTerms);
      return res.status(500).send('Internal Server Error');
    }
    console.log('Leave History Created Successfully');
  });

  db.query(sqlNotification, (errBusinessTerms) => {
    if (errBusinessTerms) {
      console.log('Error creating notification table:', errBusinessTerms);
      return res.status(500).send('Internal Notif Server Error');
    }
    console.log('Notification Created Successfully');
  });

  db.query(sqlSme, (errBusinessTerms) => {
    if (errBusinessTerms) {
      console.log('Error creating notification table:', errBusinessTerms);
      return res.status(500).send('SME Internal Server Error');
    }
    console.log('SME Created Successfully');
  });

  db.query(sqlApplicant, (errBusinessTerms) => {
    if (errBusinessTerms) {
      console.log('Error creating applicant table:', errBusinessTerms);
      return res.status(500).send('Internal Server Error');
    }
    console.log('Applicant Created Successfully');

  });

  db.query(sqlSmeRep, (errBusinessTerms) => {
    if (errBusinessTerms) {
      console.log('Error creating Task table:', errBusinessTerms);
      return res.status(500).send(' Task Internal Server Error');
    }
    console.log('Task Created Successfully');
  });

  db.query(sqlTaskList, (errBusinessTerms) => {
    if (errBusinessTerms) {
      console.log('Error creating Task Tracker table:', errBusinessTerms);
      return res.status(500).send('Internal Server Error');
    }
    console.log('Task Tracker Created Successfully');
    res.send('All Tables Created Successfully');
  });

  db.query(sqlMessage, (errBusinessTerms) => {
    if (errBusinessTerms) {
      console.log('Error creating message table:', errBusinessTerms);
      return res.status(500).send('Internal Server Error');
    }
    console.log('Message Created Successfully');
  });

  db.query(sqlMonths, (errBusinessTerms) => {
    if (errBusinessTerms) {
      console.log('Error creating Month table:', errBusinessTerms);
      return res.status(500).send('Internal Server Error');
    }
    console.log('Months Created Successfully');
    res.send('Month Table Created Successfully');
  });

  db.query(sqlPayroll, (errBusinessTerms) => {
    if (errBusinessTerms) {
      console.log('Error creating Payroll table:', errBusinessTerms);
      return res.status(500).send('Internal Server Error');
    }
    console.log('Payroll Created Successfully');
    res.send('Payroll Table Created Successfully');
  });




  db.query(sqltaskContent, (errBusinessTerms) => {
    if (errBusinessTerms) {
      console.log('Error creating Task Tracker table:', errBusinessTerms);
      return res.status(500).send('Internal Server Error');
    }
    console.log('Task Content Created Successfully');
  });



  // db.query(sqlBestStaff, (errBusinessTerms) => {
  //   if (errBusinessTerms) {
  //     console.log('Error creating Best Staff table:', errBusinessTerms);
  //     return res.status(500).send('Internal Server Error');
  //   }
  //   console.log('Best Staff Created Successfully');
  //   res.send('Best Staff Table Created Successfully');
  // });
});



// To Delete the tables 
route.get('/deleteTables', (req, res) => {
  const tables = [
    'jvmc_users', 'jvmc_dept', 'jvmc_profile', 'jvmc_message', 'jvmc_report', 
    'report_content', 'jvmc_leave', 'jvmc_leave_hist', 'jvmc_notification', 
    'jvmc_trainee', 'jvmc_sme', 'jvmc_task', 'task_content', 'task_list', 
    'jvmc_month', 'jvmc_payroll', 'best_staff', 'staff_perform', 'perform_appraisal'
  ];

  tables.forEach((table, index) => {
    const sql = `DROP TABLE IF EXISTS jvmc.${table}`;
    db.query(sql, (err) => {
      if (err) {
        console.log(`Error deleting table ${table}:`, err);
        return res.status(500).send('Internal Server Error');
      }
      console.log(`Table ${table} deleted successfully`);
      if (index === tables.length - 1) {
        res.send('All Tables Deleted Successfully');
      }
    });
  });
}); 


route.get('/createVac', (req, res) => {
  const sqlVac = `
  CREATE TABLE IF NOT EXISTS jvmc.jvmc_vacancy (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(105),
    pix VARCHAR(255),
    category VARCHAR(255),
    detail TEXT,
    time VARCHAR(105),
    av_space VARCHAR(105)
  );
`;
const sqlNot = `
    CREATE TABLE IF NOT EXISTS jvmc.jvmc_notification (
      id INT PRIMARY KEY AUTO_INCREMENT,
      title VARCHAR(70),
      time VARCHAR(70),
      date VARCHAR(70),
      link VARCHAR(115),
      message VARCHAR(255),
      user_id VARCHAR(255),
      FOREIGN KEY (user_id) REFERENCES jvmc.jvmc_users(user_id)
    );
  `;
// const sql = `DROP TABLE IF EXISTS jvmc.jvmc_notification`;

db.query(sqlVac, (errBusinessTerms) => {
  if (errBusinessTerms) {
    console.log('Error creating users table:', errBusinessTerms);
    return res.status(500).send('Internal Server Error');
  }
  res.send('Created Vacancy table')
  console.log('Vacancy created successfully');
});
});



module.exports = route;