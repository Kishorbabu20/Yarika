const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'kishorsukanth@gmail.com', // your Gmail
    pass: 'nwyvtinjgpzaxgrl' // your app password
  }
});

const mailOptions = {
  from: 'kishorsukanth@gmail.com',
  to: 'kishorsukanth@gmail.com',
  subject: 'Test Email from Yarika',
  text: 'If you receive this, your Gmail app password is working!'
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log('Error:', error);
  } else {
    console.log('Email sent:', info.response);
  }
});