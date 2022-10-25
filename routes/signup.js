const router = require("express").Router();
const user = require("../models/user");


router.get('/signup', (req,res) => {
    res.render('signup',{status : 'None'});
})
router.post('/signup',async (req,res)=>{
    //let new_user = new user(req.body);
    //new_user.save();
    User.findOne({ username : req.body.username}, function (err, docs) {
        if (err){
            res.render('signup',{status : 'Server Error'});
        }
        else{
            console.log(docs);
            if(!docs){
                let new_user = new user(req.body);
                new_user.save();
                res.redirect('/login');
            }
            else{
                res.render('signup',{status : "Already User Exists !"})
            }
        }
    }); 
    //res.redirect('/login');
})

module.exports = router;
