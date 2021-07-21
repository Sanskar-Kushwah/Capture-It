const User = require('../models/user');
const asynco = require('async');
const nodemailer = require('nodemailer');
const crypto = require('crypto');


module.exports.renderRegister = (req,res)=>{
    res.render('users/register');
}

module.exports.register = async(req,res,next)=>{
    try{
    const {username,email,password} = req.body;
    
    //  const existed = User.findOne({username});
    //  if(existed){
    //     req.flash('error','Username or email already exists try another one');
    //    return res.redirect('/register'); 
    //  }
    const user = new User({username,email});
    const registeredUser = await User.register(user,password);
    req.login(registeredUser, err=>{
        if(err) next(err);
        req.flash('success','Welcome To Capture IT');
        res.redirect('/posts');
    })
    }
    catch(e)
    {
        req.flash('error',e.message);
    }
}

module.exports.renderLogin = (req,res)=>{
    res.render('users/login');
  }

module.exports.login = (req,res)=>{
    req.flash('success','Welcome Back!!')
    const redirectUrl = req.session.returnTo || '/posts';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
  }

module.exports.logout = (req,res)=>{
    req.logout();
    req.flash('success','Goobye,please visit again')
    res.redirect('/posts');
}  

module.exports.renderForgot = (req,res)=>{
    res.render('users/forgot');
}

module.exports.forgot = (req, res, next) => {
    asynco.waterfall([
      (done) => {
        crypto.randomBytes(20, (err, buf)=> {
          const token = buf.toString('hex');
          done(err, token);
        });
      },
      (token, done) =>{
        User.findOne({ email: req.body.email }, (err, user)=> {
          if (!user) {
            req.flash('error', 'No account with that email address exists.');
            return res.redirect('/forgot');
          }
  
          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  
          user.save((err)=> {
            done(err, token, user);
          });
        });
      },
      (token, user, done)=> {
        const smtpTransport = nodemailer.createTransport({
          service: 'Gmail', 
          auth: {
            user: 'sanskar.kushwah.0734@gmail.com',
            pass: process.env.GMAILPW
          }
        });
        const mailOptions = {
          to: user.email,
          from: 'sanskar.kushwah.0734@gmail.com',
          subject: 'Node.js Password Reset',
          text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://' + req.headers.host + '/reset/' + token + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          console.log('mail sent');
          req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
          done(err, 'done');
        });
      }
    ], (err) =>{
      if (err) return next(err);
      res.redirect('/forgot');
    });
  };

  module.exports.renderReset = (req, res)=> {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, user)=> {
      if (!user) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('/forgot');
      }
      res.render('users/reset', {token: req.params.token});
    });
  } 

  module.exports.reset = (req, res)=> {
    asynco.waterfall([
      (done) =>{
        User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
          if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('back');
          }
          if(req.body.newpassword === req.body.confirmpassword) {
            user.setPassword(req.body.newpassword, function(err) {
              user.resetPasswordToken = undefined;
              user.resetPasswordExpires = undefined;
  
              user.save((err)=> {
                req.logIn(user, function(err) {
                  done(err, user);
                });
              });
            })
          } else {
              req.flash("error", "Passwords do not match.");
              return res.redirect(`http://${req.headers.host}/reset/${req.params.token}`);
          }
        });
      },
      (user, done)=> {
        const smtpTransport = nodemailer.createTransport({
          service: 'Gmail', 
          auth: {
            user: 'sanskar.kushwah.0734@gmail.com',
            pass: process.env.GMAILPW
          }
        });
        const mailOptions = {
          to: user.email,
          from: 'sanskar.kushwah.0734@gmail.com',
          subject: 'Your password has been changed',
          text: 'Hello,\n\n' +
            'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
        };
        smtpTransport.sendMail(mailOptions, (err)=> {
          req.flash('success', 'Success! Your password has been changed.');
          done(err);
        });
      }
    ], (err)=> {
      res.redirect('/posts');
    });
  };