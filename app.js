const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/user");
var _ = require('lodash');
const multer  = require('multer')
const Blog = require("./models/Blog");

const app = express();
app.use(express.static("public"));
// ! connect to the mongodb database...
mongoose.connect(
  "mongodb://localhost/blog_tut",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  () => {
    console.log("Connection to mongodb database was successful!");
  }
);

// middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// routes
//app.use(require("./routes/index"))
//app.use(require("./routes/compose"))
//app.use(require("./routes/blog"))
//app.use(require("./routes/login"))
//app.use(require("./routes/signup"))


// server configurations are here....
app.listen(5000, () => console.log("Server started listening on port: 5000"));



// Passport Validaion

const passport			= require('passport');
const localStrategy		= require('passport-local').Strategy;

var flash = require('connect-flash');
app.use(flash())
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

app.use(passport.initialize());
app.use(passport.session());

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
            console.log('successful entry');
            return done(null,user);
        }
		else{
            console.log('incorrect password');
            return done(null, false, { message: 'Incorrect password' });
        } 
		
	});
}));


app.get('/login',(req,res) => { 
    if(req.isAuthenticated()){
        console.log(req.user);
        res.redirect('/');
    }
    else{
        res.render('login',{error_message : req.flash('error')});
    }
})

app.post('/login',async (req,res,next)=>{
    if(req.isAuthenticated()){
        res.redirect('/');
    }
    else{
        passport.authenticate("local",{
            successRedirect : "/",
            failureRedirect : "/login",
            failureFlash : true       
        })(req,res,next);
    }
})



app.get("/", async (req, res) => {
  console.log('hello')
  const allBlogs = await Blog.find();
  if(req.isAuthenticated()){
    res.render("index", { blogs: allBlogs,user : req.user, C:1});
  }
  else{
    res.render("index", { blogs: allBlogs ,user : undefined, C:0});
  }
});


const multerStorage1 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    fname = `uploads/admin-${file.fieldname}-${Date.now()}.${ext}`
    req.fname = fname;
    cb(null, fname);
  },
});

const multerFilter1 = (req, file, cb) => {
  if (file.mimetype.split("/")[1] === "pdf") {
    cb(null, true);
  } else {
    cb(new Error("Not a PDF File!!"), false);
  }
};

const upload1 = multer({
  storage: multerStorage1,
  fileFilter: multerFilter1
});


app
  .get("/blog/:id", async (req, res) => {
    const { id } = req.params;
    const getBlog = await Blog.findOne({ _id: id });

    if(req.isAuthenticated())
    {
      console.log("Authenticated");
      res.render("particularBlog", { blog: getBlog , index : 1});
    }
    else{
      console.log("Not Auhenticated");
      res.render("particularBlog", { blog: getBlog , index : 0});
    }

    
  })

  .get("/delete/:id", (req, res) => {
    const { id } = req.params;
    Blog.deleteOne({ _id: id })
      .then(() => {
        console.log("Deleted blog successfully!");
        res.redirect("/");
      })
      .catch((err) => console.log(err));
  })

  .get("/edit/:id", async (req, res) => {
    const { id } = req.params;

    const getData = await Blog.findOne({ _id: id });
    res.render("editBlog", { blog: getData });
  })

  .post("/edit/:id",upload1.single('report'),(req, res) => {
    const { id } = req.params;
    let title = req.body.title;
    const tags1 = req.body.tags1;
    const content = req.body.content;
    const UserName = req.user.username;
    let tags=tags1.split(",");
    let postedAt = new Date().toString();
    for(let i=0;i<tags.length;i++){
      tags[i]=tags[i].slice(1)
    }
  
    let stored_filename = req.file.filename;
    let report_filename = req.file.originalname;
    
    Blog.updateOne({_id : id},{ title,UserName,tags,postedAt,content,report_filename,stored_filename},(err,docs)=>{
      if(err){
        console.log(err);
        res.redirect('/');
      }
      else{
        console.log(docs);
        res.redirect('/');
      }
    });
    //res.redirect('/');
    //res.redirect('/');
  });




const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    fname = `uploads/admin-${file.fieldname}-${Date.now()}.${ext}`
    req.user.fname = fname;
    cb(null, fname);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.split("/")[1] === "pdf") {
    cb(null, true);
  } else {
    cb(new Error("Not a PDF File!!"), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});


app
  .get("/compose", (req, res) => {
    if(req.isAuthenticated()){
      res.render("composeBlog",{user : req.user});
    }
    else{
      res.render("composeBlog",{user : undefined});
    }
  })

  .post("/compose",upload.single('report'),(req, res) => {
    // const { title,tags1, content } = req.body;
    const title = req.body.title;
    const tags1 = req.body.tags1;
    const content = req.body.content;
    const UserName = req.user.username;
    // console.log(req.file);
    // * check for the missing fields!
    // if(req.isAuthenticated()){
    //   console.log(req.user.username);
    // }
    if (!title || !content)
      return res.send("Please enter all the required credentials!");

    let tags=tags1.split(",")
    for(let i=0;i<tags.length;i++){
      tags[i]=tags[i].slice(1)
    }
    // console.log(tags);
    let report_filename = req.file.originalname;
    let stored_filename = req.user.fname;
    const newBlog = new Blog({ title,UserName,tags, content,report_filename,stored_filename});
    // save the blog to the database
    newBlog
      .save()
      .then(() => {
        console.log("Blog Saved Successfully!");
        res.redirect("/");
      })
      .catch((err) => console.log(err));
  });


app.get('/signup', (req,res) => {
    res.render('signup',{status : 'None'});
})
app.post('/signup',async (req,res)=>{
    //let new_user = new user(req.body);
    //new_user.save();
    User.findOne({ username : _.toLower(req.body.username)}, function (err, docs) {
        if (err){
            res.render('signup',{status : 'Server Error'});
        }
        else{
            console.log(docs);
            if(!docs){
                const username = _.toLower(req.body.username);
                const email = req.body.email;
                const password = req.body.password;
                // let new_user = new User(req.body);
                let new_user = new User({username,email,password});
                new_user.save();
                res.redirect('/login');
            }
            else{
                res.render('signup',{status : "User Already Exists!"})
            }
        }
    }); 
    //res.redirect('/login');
})

app.get('/tempuser',async (req,res)=>{
  const UserBlogs = await Blog.find({UserName : req.user.username});
  if(req.isAuthenticated()){
    res.render("User", { blogs: UserBlogs,user : req.user });
  }
})

app.get('/stats', async (req,res) => {

  if(req.isAuthenticated()){
    res.render("stats",{C : 1});
  }
  else{
    res.render("stats",{C : 0});
  }
})

// Logout

app.get('/logout',async (req,res)=>{
  req.logOut();
  res.redirect('/');
})

app.get('/fullstats',(req,res)=>{
    let all_tags = [];
    Blog.find({},(err,docs)=>{
      if(err)
        res.redirect('/');
      else{
        //console.log(docs);
        /* docs.forEach((item)=>{
          all_tags.push(...item.tags);
        })
        console.log(all_tags);
        const occurrences = all_tags.reduce(function (acc, curr) {
          return acc[curr] ? ++acc[curr] : acc[curr] = 1, acc
        }, {});
        console.log(occurrences)
        res.json(occurrences); */
        let tags_users = {}
        docs.forEach((item)=>{
          item.tags.forEach((item_tmp)=>{
              if(item_tmp in tags_users)
                tags_users[item_tmp].add(item.UserName);
              else{
                tags_users[item_tmp] = new Set();
                tags_users[item_tmp].add(item.UserName);
              }
          })
        })
        console.log(tags_users)
        let final ={};
        Object.keys(tags_users).forEach((item)=>{
          final[item] = tags_users[item].size;
        })
        res.json(final);
      }
    })
})


app.post('/likes',(req,res)=>{
  console.log(req.body);  
  res.json({
    msg : 'Seic'
  });
})