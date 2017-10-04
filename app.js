//========= Requirings ==========
var express = require('express');
var cors = require('cors')
var app     = express();
var mongoose    = require('mongoose');
var bodyParser  = require('body-parser');
var jwt    = require('jsonwebtoken');
var bcrypt = require('bcrypt'); var salt = 10 ;
var moment = require('moment');
var _ = require('lodash');
var port = process.env.PORT || 5000 ;
const fileUpload = require('express-fileupload');

var Expo = require('expo-server-sdk');
let expo = new Expo();


//=========Configuartions=========
var passwordRegEx = new RegExp("(?=.{6,})")
var email = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

app.use(fileUpload())


var config = {'secret': 'thisismysecret',
   			 'database': 'mongodb://sarihadminqasim:123456@ds137540.mlab.com:37540/sarih' }
mongoose.connect(config.database , {  useMongoClient: true});
app.set('blackSwan', config.secret);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors())
var api = express.Router();
app.use('/api', api);
app.use("/css",  express.static(__dirname + '/css'));
app.use("/javascript", express.static(__dirname + '/javascript'));
app.use("/images",  express.static(__dirname + '/images'));
api.use("/css",  express.static(__dirname + '/css'));
api.use("/javascript", express.static(__dirname + '/javascript'));
api.use("/images",  express.static(__dirname + '/images'));

api.use(function(req, res, next) {

  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  if (token) {

    jwt.verify(token, app.get('blackSwan'), function(err, decoded) {
      if (err) {
        return res.status(403).redirect('/login');;
      } else {
        req.decoded = decoded;
        next();
      }
    });

  }

	else {


    return res.status(403).redirect('/login');

  }
});
//=========== DataBase Schemas =============
var Schema = mongoose.Schema;
var User = mongoose.model('Users', new Schema({
	name: String,
	email: String,
    password: String,
    birthday: Date,
    sex: String,
    college: String,
    stage: String,
    phone:String,
    isVerified: Boolean,
    expoToken : ''

}));


var Post = mongoose.model('Posts', new Schema({
	by: String ,
	date: String ,
	content : String ,
	college: String,
	stage : String,
  sex : String ,
	isGeneral : String ,
  likes : Number ,
  likedBy: [] ,
  byExpoToken : String ,
  comments: Number


}))

var Comment = mongoose.model('Comments', new Schema({
	by: String ,
  postID : String,
	date: String ,
	content : String ,
	college: String,
	stage : String,
  sex : String ,
  likes : Number ,
  likedBy: [] ,


}))

var Report = mongoose.model('Reports', new Schema({
	by: String ,
  postID : String,
	date: String
}))





//========== Routes ============

//========== 1- Pages Routes ============


app.get('/',function(req, res) {
	res.sendFile(__dirname + '/index.html');

});

app.get('/waiting',function(req, res) {
  res.sendFile(__dirname + '/waiting.html');

});

app.post('/photo',function(req,res){
	var email = req.body.email || req.query.email || req.headers['email'];

   if (!req.files)
    return res.status(400).send('No files were uploaded.');

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let userPhoto = req.files.userPhoto ;
  if (req.files.userPhoto2) {
  let userPhoto2 = req.files.userPhoto2 ;

  // Use the mv() method to place the file somewhere on your server
	userPhoto2.mv('uploads/' + email + '(2)' + '.jpg' , function(err) {
    if (err)
      return res.status(500).send(err);

  });
  }
  userPhoto.mv('uploads/' + email + '.jpg' , function(err) {
    if (err)
      return res.status(500).send(err);

    res.redirect('/waiting');
  });
});




app.get('/islogedin',function (req,res) {
	var token = req.body.token || req.query.token || req.headers['x-access-token'];
	var email = req.body.email || req.query.email || req.headers['email'];
  if (token) {

    jwt.verify(token, app.get('blackSwan'), function(err, decoded) {
      if (err) {
         res.json({success : false});;
      } else {
        req.decoded = decoded;
       res.json({success : true});
      }
    });

  } else {


      res.json({success : false});;

  }
})
app.get('/home',function (req,res) {

	res.sendFile(__dirname + '/home.html');


})
app.get('/login',function (req,res) {

	res.sendFile(__dirname + '/login.html');


})
app.get('/signup',function (req,res) {

	res.sendFile(__dirname + '/signup.html');


})

api.post('/phone',function (req,res) {
    var email = req.body.email || req.query.email || req.headers['email'];
    var phone = req.body.phone

    if (phone == "") {
      res.json('يرجى كتابة رقم الهاتف')
    }
    else {
      User.findOneAndUpdate({email : email} , {$set:{phone : phone}} , function (err,doc) {
    if (err) {
      throw err;
    }
      res.json('استلمنا رقم تلفونك , وحندزلك رسالة التفعيل باقرب وقت 😊 ')
  })
    }

})

api.get('/verification',function (req,res) {
	var email = req.body.email || req.query.email || req.headers['email'];
	var token = req.body.token || req.query.token || req.headers['x-access-token'];
	User.findOne({
    email:email
  }, function (err,user) {
  	if (err) throw err;
  	if (user.isVerified == false) {
  		res.sendFile(__dirname + '/verification.html');
  	} else {
  		res.redirect('/api/posts?token='+token+'&email='+email)
  	}
  })


})

api.get('/posts',function (req,res) {

	var email = req.body.email || req.query.email || req.headers['email'];
	var token = req.body.token || req.query.token || req.headers['x-access-token'];



		User.findOne({
    email:email
  }, function (err,user) {
  	if (err) throw err;
    if ( !user) {
    res.redirect('/home')

  } else if (user.isVerified == true) {
  		res.sendFile(__dirname + '/posts.html');
  	}  else {
  		res.redirect('/api/verification?token='+token+'&email='+email)
  	}
  })


});


app.post('/register' ,function(req,res) {

	var newUser = 	new User({

		name: req.body.name,
		email: req.body.email.toLowerCase(),
 	    password: req.body.password,
  	  	birthday: req.body.birthday,
   	 	sex: req.body.sex,
    	college: req.body.college,
   	    stage: req.body.stage,
        phone:"",
   	    isVerified: true,

	})
  if (!email.test(newUser.email)) {
    res.json({ success: false, message:'يرجى ادخال عنوان بريد الكتروني صالح'})
  }
  else if (!passwordRegEx.test(newUser.password)) {
    res.json({ success: false, message:'يرجى اختيار كلمة مرور اكثر من ٦ احرف'})
  }
  else if (req.body.name == "" || req.body.email == "" || req.body.password == "" || req.body.sex == "" || req.body.college == "" || req.body.stage == "" ) {
    res.json({ success: false, message:'يرجى ملئ المعلومات بصورة صحيحة'})
  } else {
    User.findOne({
      email:newUser.email
    }, function (err,user) {
    	if (err) throw err;

    if (user) {
      res.json({ success: false, message:'هذا البريد الالكتروني مسجل مسبقا'})
    }
    	if (!user) {
        var token = jwt.sign(newUser, app.get('blackSwan'), {
          expiresIn: 200000 // expires in 3 days
        });
    		bcrypt.hash(newUser.password , salt , function(err, hash) {
  		newUser.password = hash

     		 newUser.save(function (err) {
  		if (err) throw err

  			res.json({ success: true, message :'تم تسجيل الحساب ', token : token , isVerified : newUser.isVerified })
  	})
  	});
    	}

    })
  }

});


app.post('/login' ,function(req,res) {
	var result = res
	User.findOne({
    email : req.body.email.toLowerCase()
  }, function (err,user) {
  	if (err) throw err ;
  	if (!user) {
      res.json({ success: false, message: 'البريد الالكتروني او كلمة المرور غير صحيحة' });
    } else if (user) {
    	bcrypt.compare(req.body.password, user.password, function(err, res) {
    if (res === false) {
         result.json({ success: false, message: 'البريد الالكتروني او كلمة المرور غير صحيحة' });
      } else {
        var token = jwt.sign(user, app.get('blackSwan'), {
          expiresIn: 200000 // expires in 3 days
        });
         result.json({
          isVerified: user.isVerified,
          success: true,
          message: 'تم تسجيل الدخول بنجاح',
          token: token
        });
      }
	});
      }})})

app.post('/assigntoken' ,function(req,res) {
    var expoToken = req.body.expoToken

  	User.update({ email : req.body.email.toLowerCase() }, {expoToken : expoToken} ,{strict : false} , function (err,response) {
    	if (err) throw err ;
    })

  })









//================ Admin API =================

app.get('/myadminusers', function (req,res) {
	User.find({} , function (err,result) {
		res.json(result)
	})
})

app.get('/myadminposts', function (req,res) {
  Post.find({} , function (err,result) {
    res.json(result)
  })
})










//=============== /Admin Api =================



//=============== Posts =================

api.get('/collegeposts', function (req,res) {
  var email = req.body.email || req.query.email || req.headers['email'];
  User.findOne({
    email:email.toLowerCase()
  }, function (err,user) {
    Post.find({college : user.college , isGeneral : 'true' } , function (err,result) {
    var posts = []
    for (var i = 0; i < result.length; i++) {
      var isLiked = ""
      var color = ""
      if (result[i].likedBy.includes(user.name)) {
        isLiked = "like_btn_clicked"
        color = "#e67375"
      } else {
        isLiked = ""
        color = "gray"
      }
      posts.push({"id" : result[i]._id ,'content' : result[i].content , "sex" : result[i].sex , "date" : result[i].date , "likes" : result[i].likes , "isLiked" : isLiked , "color" : color , "comments" : result[i].comments  })

    }
    res.json(posts.reverse())
  })

	})

})
api.get('/stageposts'	, function (req,res) {
  var email = req.body.email || req.query.email || req.headers['email'];
  User.findOne({
    email:email.toLowerCase()
  }, function (err,user) {
    Post.find({college : user.college , stage : user.stage, isGeneral : 'false' } , function (err,result) {
    var posts = []
    for (var i = 0; i < result.length; i++) {
      var isLiked = ""
      var color = ""
      if (result[i].likedBy.includes(user.name)) {
        isLiked = "like_btn_clicked"
        color = "#e67375"
      } else {
        isLiked = ""
        color = "gray"
      }
      posts.push({"id" : result[i]._id ,'content' : result[i].content , "sex" : result[i].sex , "date" : result[i].date , "likes" : result[i].likes , "isLiked" : isLiked , "color" : color , "comments" : result[i].comments  })

    }
    res.json(posts.reverse())
  })

  })
})


api.get('/comments', function (req,res) {
  var email = req.body.email || req.query.email || req.headers['email'];
  User.findOne({
    email:email.toLowerCase()
  }, function (err,user) {
  var postID = req.body.postID || req.query.postID || req.headers['post'];
    Comment.find({postID : postID} , function (err,result) {
    var comments = []
    for (var i = 0; i < result.length; i++) {
      var isLiked = ""
      var color = ""
      if (result[i].likedBy.includes(user.name)) {
        isLiked = "like_btn_clicked"
        color = "#e67375"
      } else {
        isLiked = ""
        color = "gray"
      }
      comments.push({"id" : result[i]._id,'content' : result[i].content , "sex" : result[i].sex , "date" : result[i].date , "likes" : result[i].likes , "isLiked" : isLiked , "color" : color})
  }
      comments = _.sortBy(comments, function(o) { return new moment(o.date).format('YYYYMMDDHHmm'); })

  res.json(comments)

  })



})
})

api.post('/addpost' ,function(req,res) {

  var email = req.body.email || req.query.email || req.headers['email'];
  User.findOne({
    email:email.toLowerCase()
  }, function (err,user) {

    var newPost =   new Post({

    by: user.name ,
    byExpoToken : user.expoToken ,
    date: moment().utcOffset(+3).format('MMMM Do, h:mm a') ,
    content : req.body.content ,
    college: user.college ,
    stage : user.stage,
    sex: user.sex,
    isGeneral : req.body.isGeneral ,
    likes : 0 ,
    comments : 0 ,
    likedBy : [] ,

  })

   if (newPost.content === "") {
    res.json({success : false , message:'يرجى ادخال نص المصارحة'})
   }
   else if (newPost.content.length < 10) {
     res.json({success : false , message:'يرجى كتابة مصارحة اكثر من ١٠ احرف '})
   }
  else if (newPost.isGeneral === "") {
    res.json({success : false , message:'يرجى اختيار مكان اضافة المصارحة'})
  }
    else {
       newPost.save(function (err) {
         if (err) throw err
         res.json({success : true , message:'تم اضافة المصارحة'})
        })

                 if (newPost.isGeneral === 'true') {
                   User.find({ college : user.college}, function (err,users) {

                           let usersExpoTokens = []
                           let messages = []
                           for (var i = 0; i < users.length; i++) {
                             var pushToken = users[i].expoToken
                             if (!Expo.isExpoPushToken(pushToken)) {
                            //  console.error(`Push token ${pushToken} is not a valid Expo push token`);
                               continue;
                             }

                               messages.push({
                                 to: pushToken,
                                 priority: 'high',
                                 sound: 'default',
                                 body: 'مصارحة جديدة في مصارحات الكلية',
                                 data: { withSome: 'data' },
                               })
                           }


                           let chunks = expo.chunkPushNotifications(messages);

                         (async () => {

                           for (let chunk of chunks) {
                             try {
                               let receipts = await expo.sendPushNotificationsAsync(chunk);
                               console.log(receipts);
                             } catch (error) {
                               console.error(error);
                             }
                           }
                         })();
                      })
                 } else {
                   User.find({ college : user.college , stage : user.stage }, function (err,users) {

                           let usersExpoTokens = []
                           let messages = []
                           for (var i = 0; i < users.length; i++) {
                             var pushToken = users[i].expoToken
                             if (!Expo.isExpoPushToken(pushToken)) {
                            //  console.error(`Push token ${pushToken} is not a valid Expo push token`);
                               continue;
                             }

                               messages.push({
                                 to: pushToken,
                                 priority: 'high',
                                 sound: 'default',
                                 body: 'مصارحة جديدة في مصارحات المرحلة',
                                 data: { withSome: 'data' },
                               })
                           }


                           let chunks = expo.chunkPushNotifications(messages);

                         (async () => {

                           for (let chunk of chunks) {
                             try {
                               let receipts = await expo.sendPushNotificationsAsync(chunk);
                               console.log(receipts);
                             } catch (error) {
                               console.error(error);
                             }
                           }
                         })();
                      })
                 }
    }


  })

   })

   api.post('/addComment' ,function(req,res) {

     var email = req.body.email || req.query.email || req.headers['email'];
     var postID = req.body.postID
     User.findOne({
       email:email.toLowerCase()
     }, function (err,user) {

       var newComment =   new Comment({

       by: user.name ,
       postID : postID,
       date: moment().utcOffset(+3).format('MMMM Do, h:mm a') ,
       content : req.body.content ,
       college: user.college ,
       stage : user.stage,
       sex: user.sex,
       likes : 0 ,
       likedBy : [] ,

     })

      if (newComment.content === "") {
       res.json({success : false , message:'يرجى ادخال نص التعليق'})
      }
      else if (newComment.content.length < 5) {
        res.json({success : false , message:'يرجى كتابة تعليق اكثر من ٥ احرف '})
      } else {
          newComment.save(function (err) {
            res.json({success : true , message:'تم اضافة التعليق'})
       if (err) throw err
   })
   Post.findById( postID , function (err,post) {
        if(err){
             throw err
         }

         else {

              post.comments = post.comments + 1

          post.save(function (err, post) {
                 if (err) {
                     throw err
                 }
             });
             let messages = []
               var pushToken = post.byExpoToken
               if (!Expo.isExpoPushToken(pushToken)) {
               console.error(`Push token ${pushToken} is not a valid Expo push token`);
             } else {
               messages.push({
                 to: pushToken,
                 priority: 'high',
                 sound: 'default',
                 body: 'تعليق جديد على مصارحتك',
                 data: { withSome: 'data' },
               })



           let chunks = expo.chunkPushNotifications(messages);

         (async () => {

           for (let chunk of chunks) {
             try {
               let receipts = await expo.sendPushNotificationsAsync(chunk);
               console.log(receipts);
             } catch (error) {
               console.error(error);
             }
           }
         })()
             }



        }
})


       }


     })

      })



api.post('/addlike' ,function(req,res) {

    var email = req.body.email || req.query.email || req.headers['email'];
  User.findOne({
    email:email.toLowerCase()
  }, function (err,user) {
    if (err) throw err;

      Post.findById( req.body.id , function (err,post) {
   if(err){
        throw err
    }

    else {

        post.likedBy.push(user.name)
         post.likes = post.likes + 1

     post.save(function (err, post) {
            if (err) {
                throw err
            }
           res.json({sucess : true})
        });

  }
  })

  })


})



api.post('/removelike' ,function(req,res) {
    var email = req.body.email || req.query.email || req.headers['email'];
    User.findOne({
    email:email.toLowerCase()
  }, function (err,user) {
    if (err) throw err;

     Post.findById( req.body.id , function (err,post) {
   if(err){
        throw err
    }

    else {
      var index = post.likedBy.indexOf(user.name)
            if (index === 0) {
              post.likedBy.shift()
            } else {
          post.likedBy = post.likedBy.splice(index , 1)

            }

         post.likes = post.likes - 1

     post.save(function (err, post) {
            if (err) {
                throw err
            }
           res.json({sucess : true})
        });

  }
  })
  })


})

api.post('/addcommentlike' ,function(req,res) {

    var email = req.body.email || req.query.email || req.headers['email'];
  User.findOne({
    email:email.toLowerCase()
  }, function (err,user) {
    if (err) throw err;

      Comment.findById( req.body.id , function (err,post) {
   if(err){
        throw err
    }

    else {

        post.likedBy.push(user.name)
         post.likes = post.likes + 1

     post.save(function (err, post) {
            if (err) {
                throw err
            }
           res.json({sucess : true})
        });

  }
  })

  })


})

api.post('/removecommentlike' ,function(req,res) {
    var email = req.body.email || req.query.email || req.headers['email'];
    User.findOne({
    email:email.toLowerCase()
  }, function (err,user) {
    if (err) throw err;

     Comment.findById( req.body.id , function (err,post) {
   if(err){
        throw err
    }

    else {
      var index = post.likedBy.indexOf(user.name)
            if (index === 0) {
              post.likedBy.shift()
            } else {
          post.likedBy = post.likedBy.splice(index , 1)

            }

         post.likes = post.likes - 1

     post.save(function (err, post) {
            if (err) {
                throw err
            }
           res.json({sucess : true})
        });

  }
  })
  })


})

app.get('/send' , function (req,res) {


  let somePushTokens = ["ExponentPushToken[ELIwtWDkx-s7u64Gc9e8V4]" , "ExponentPushToken[q5tkNDOJEW41cf82fwBaAv]"]
  let messages = []
  for (let pushToken of somePushTokens) {
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      continue;
    }

      messages.push({
        to: pushToken,
        sound: 'default',
        body: 'مصارحة جديدة في مصارحات الكلية',
        data: { withSome: 'data' },
      })
    }
  let chunks = expo.chunkPushNotifications(messages);

(async () => {
  // Send the chunks to the Expo push notification service. There are
  // different strategies you could use. A simple one is to send one chunk at a
  // time, which nicely spreads the load out over time:
  for (let chunk of chunks) {
    try {
      let receipts = await expo.sendPushNotificationsAsync(chunk);
      console.log(receipts);
      res.send("sucess")
    } catch (error) {
      console.error(error);
    }
  }
})();

})

api.post('/addpost' ,function(req,res) {

  var email = req.body.email || req.query.email || req.headers['email'];
  User.findOne({
    email:email.toLowerCase()
  }, function (err,user) {

    var newPost =   new Post({

    by: user.name ,
    byExpoToken : user.expoToken ,
    date: moment().utcOffset(+3).format('MMMM Do, h:mm a') ,
    content : req.body.content ,
    college: user.college ,
    stage : user.stage,
    sex: user.sex,
    isGeneral : req.body.isGeneral ,
    likes : 0 ,
    comments : 0 ,
    likedBy : [] ,

  })

   if (newPost.content === "") {
    res.json({success : false , message:'يرجى ادخال نص المصارحة'})
   }
   else if (newPost.content.length < 10) {
     res.json({success : false , message:'يرجى كتابة مصارحة اكثر من ١٠ احرف '})
   }
  else if (newPost.isGeneral === "") {
    res.json({success : false , message:'يرجى اختيار مكان اضافة المصارحة'})
  }
    else {
       newPost.save(function (err) {
         if (err) throw err
         res.json({success : true , message:'تم اضافة المصارحة'})
        })

                 if (newPost.isGeneral === 'true') {
                   User.find({ college : user.college}, function (err,users) {

                           let usersExpoTokens = []
                           let messages = []
                           for (var i = 0; i < users.length; i++) {
                             var pushToken = users[i].expoToken
                             if (!Expo.isExpoPushToken(pushToken)) {
                            //  console.error(`Push token ${pushToken} is not a valid Expo push token`);
                               continue;
                             }

                               messages.push({
                                 to: pushToken,
                                 priority: 'high',
                                 sound: 'default',
                                 body: 'مصارحة جديدة في مصارحات الكلية',
                                 data: { withSome: 'data' },
                               })
                           }


                           let chunks = expo.chunkPushNotifications(messages);

                         (async () => {

                           for (let chunk of chunks) {
                             try {
                               let receipts = await expo.sendPushNotificationsAsync(chunk);
                               console.log(receipts);
                             } catch (error) {
                               console.error(error);
                             }
                           }
                         })();
                      })
                 } else {
                   User.find({ college : user.college , stage : user.stage }, function (err,users) {

                           let usersExpoTokens = []
                           let messages = []
                           for (var i = 0; i < users.length; i++) {
                             var pushToken = users[i].expoToken
                             if (!Expo.isExpoPushToken(pushToken)) {
                            //  console.error(`Push token ${pushToken} is not a valid Expo push token`);
                               continue;
                             }

                               messages.push({
                                 to: pushToken,
                                 priority: 'high',
                                 sound: 'default',
                                 body: 'مصارحة جديدة في مصارحات المرحلة',
                                 data: { withSome: 'data' },
                               })
                           }


                           let chunks = expo.chunkPushNotifications(messages);

                         (async () => {

                           for (let chunk of chunks) {
                             try {
                               let receipts = await expo.sendPushNotificationsAsync(chunk);
                               console.log(receipts);
                             } catch (error) {
                               console.error(error);
                             }
                           }
                         })();
                      })
                 }
    }


  })

   })

   api.post('/addReport' ,function(req,res) {

     var email = req.body.email || req.query.email || req.headers['email'];
     var postID = req.body.id

     var newReport =   new Report({

     by: email ,
     postID : postID,
     date: moment().utcOffset(+3).format('MMMM Do, h:mm a')


   })

   newReport.save(function (err) {
     if (err) throw err
     res.json({success : true , message:'شكرا لك , سنقوم بمراجعة التبليغ لاتخاذ اللازم'})
    })

      })


app.get('/updatelikes' , function (req,res) {
  // Post.update( {}, {comments : 0 }, {multi:true , strict : false}, function(err ,response ){
      res.send("sucess")
      //  });
})

// app.get('/delete' , function (req,res) {
//    Post.find({college : 'كلية'}).remove(()=>{res.send("sucess")} )
//
// })
//=============== /Posts =================

app.get('*',function (req,res) {

	res.sendFile(__dirname + '/error404.html');


})
app.listen(port, ()=>{
	console.log('server is listening on port 5000')
}) ;
