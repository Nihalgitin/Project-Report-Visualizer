const router = require("express").Router();


//const session=  require('express-session');


const passport			= require('passport');
const localStrategy		= require('passport-local').Strategy;

router.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

router.use(passport.initialize());
router.use(passport.session());

passport.serializeUser(function (user, done) {
	done(null, user.id);
});

passport.deserializeUser(function (id, done) {
	User.findById(id, function (err, user) {
		done(err, user);
	});
});

passport.use(new localStrategy({
  usernameField: 'username',
  passwordField: 'password',
  session: true
},function (email, password, done) {
	User.findOne({ "username": email }, function (err, user) {
		if (err) return done(err);
		if (!user){
            //console.log('no usernmae');
            return done(null, false, { message: 'No account with that username' });
        }
		if (user.password==password){
            //console.log('successful entry');
            return done(null,user);
        }
		else{
            //console.log('incorrect password');
            return done(null, false, { message: 'Incorrect password' });
        } 
		
	});
}));


router.get('/login',(req,res) => { 
    if(req.isAuthenticated()){
        console.log(req.user);
        res.redirect('/');
    }
    else{
        res.render('login');
    }
})

router.post('/login',async (req,res,next)=>{
    if(req.isAuthenticated()){
        res.redirect('/');
    }
    else{
        passport.authenticate("local",{
            successRedirect : "/",
            failureRedirect : "/login",
            failureFlash : false       
        })(req,res,next);
    }
})

module.exports = router;