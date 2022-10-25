const router = require("express").Router();
const Blog = require("../models/Blog");
const multer  = require('multer')

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `uploads/admin-${file.fieldname}-${Date.now()}.${ext}`);
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


router
  .get("/compose", (req, res) => {
    if(req.isAuthenticated()){
      res.render("composeBlog",{user : req.user});
    }
    else{
      res.render("composeBlog",{user : undefined});
    }
  })

  .post("/compose",upload.single('report'),(req, res) => {
    const { title,tags1, content } = req.body;
    console.log(req.file);
    // * check for the missing fields!
    if (!title || !content)
      return res.send("Please enter all the required credentials!");

    let tags=tags1.split(",")
    for(let i=0;i<tags.length;i++){
      tags[i]=tags[i].slice(1)
    }
    console.log(tags);
    let report_filename = req.file.originalname;
    const newBlog = new Blog({ title,tags, content,report_filename});
    // save the blog to the database
    newBlog
      .save()
      .then(() => {
        console.log("Blog Saved Successfully!");
        res.redirect("/");
      })
      .catch((err) => console.log(err));
  });

module.exports = router;
