const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const passport = require('passport');
const users = require('../controllers/users');
const { route } = require('./posts');

router.route('/register')
     .get(users.renderRegister)
     .post(catchAsync(users.register))

router.route('/login')
     .get(users.renderLogin)
     .post(passport.authenticate('local',{failureFlash : true,failureRedirect :'/login'}),users.login)

router.get('/logout',users.logout);

router.get('/forgot',users.renderForgot);
   
router.post('/forgot',users.forgot); 
   
router.get('/reset/:token',users.renderReset);

router.post('/reset/:token',users.reset);

module.exports = router;
