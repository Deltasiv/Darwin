var express  = require('express');
var cors = require('cors');
var app      = express();                               // create our app w/ express                // mongoose for mongodb
var morgan = require('morgan');             // log requests to the console (express4)
var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
var port = 1234;
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database("bob_bacteria.db");
var postdb = new sqlite3.Database("posts.db")
var userdb = new sqlite3.Database("users.db")
var virusesdb = new sqlite3.Database("viruses.db")
var bacteriasdb = new sqlite3.Database("bacterias.db")
var ipdb = new sqlite3.Database("ips.db")
var url = require("url");
var nodemailer = require("nodemailer");
var email;
var password;

// var http = require('http');
// http.createServer(function (req, res) {
//     res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
//     res.end();
// }).listen(80);

var found;

app.use(express.static(__dirname + '/src'));                 // set the static files location /public/img will be /img for users
app.use(morgan('dev'));                                         // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());
app.use(cors());

console.log(`App is listening on port ${port}`)

var https = require('https');
var http = require('http');
var fs = require('fs');

// // This line is from the Node.js HTTPS documentation.
// var options = {
//   key: fs.readFileSync('keys/delta.key'),
//   cert: fs.readFileSync('keys/cert_chain.crt')
// };

// Create a service (the app object is just a callback).

// Create an HTTP service.
// Create an HTTPS service identical to the HTTP service.
var creds = [];
var lineReader = require('readline').createInterface({
  input: require('fs').createReadStream('keys/creds.txt')
});
lineReader.on('line', function (line) {
  creds.push(line)
})



// var server = https.createServer(options, app).listen(1234);
var server = app.listen(port)

var util = require('util');
var date = new Date();
datetime = `${date.getYear()}Y-${date.getMonth()}M-${date.getDay()}D--${date.getHours()}H-${date.getMinutes()}M_`
var log_file = fs.createWriteStream(__dirname + `/clogs/${datetime}debug.log`, {flags : 'w'});
var log_stdout = process.stdout;

console.log = function(d) { //
  log_file.write(util.format(d) + '\n');
  log_stdout.write(util.format(d) + '\n');
};

process.on('SIGINT', () => {
    console.log("Safely Closing API Server...")
    db.close();
    postdb.close();
    virusesdb.close();
    bacteriasdb.close();
    server.close();
    process.exit()
});

// get all users
app.get('/api/items', function(req, res) {
    o = new Object()
    var items = 'items';
    o[items] = []

    let sql = `SELECT * FROM bob
           ORDER BY name`;
    db.all(sql, [], (err, rows) => {
      if (err) {
        throw err;
      }
      rows.forEach((row) => {
        if(row.name != ""){
            o[items].push(row)
        }
      });
      var datetime = new Date();
      var ip = req.connection.remoteAddress.slice(7)
      
      let sqlip = `INSERT INTO main(ip, date) VALUES ("${ip}", "${datetime}")`;
      
      ipdb.run(sqlip, function(err){
          if(err){
              return console.log(err)
          }
      })
      var datetime = new Date();
      console.log(`/api/items -- ${datetime} --`)
      res.json(o[items])
      res.end()
      // res.json(o)
    });
});

app.get('/api/viruses', function(req, res) {
    o = new Object()
    var items = 'items';
    o[items] = []

    let sql = `SELECT * FROM main
           ORDER BY name`;
    virusesdb.all(sql, [], (err, rows) => {
      if (err) {
        throw err;
      }
      rows.forEach((row) => {
        if(row.name != ""){
            o[items].push(row)
        }
      });
      var datetime = new Date();
      console.log(`/api/viruses -- ${datetime} --`)
      res.json(o[items])
      res.end()
      // res.json(o)
    });
});

app.get('/api/bacterias', function(req, res) {
    o = new Object()
    var items = 'items';
    o[items] = []

    let sql = `SELECT * FROM main
           ORDER BY name`;
    bacteriasdb.all(sql, [], (err, rows) => {
      if (err) {
        throw err;
      }
      rows.forEach((row) => {
        if(row.name != ""){
            o[items].push(row)
        }
      });
      var datetime = new Date();
      console.log(`/api/bacterias -- ${datetime} --`)
      res.json(o[items])
      res.end()
      // res.json(o)
    });
});



app.get('/api/posts', function(req, res) {

    // use mongoose to get all users in the database
    Post.find(function(err, posts) {

        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err){
          var datetime = new Date();
          console.log(`ERROR: ${err} /api/posts -- ${datetime} --`)
        }

        res.json(posts); // return all users in JSON format
    });
});
app.get('/api/messages/', function(req, res) {
    o = new Object()
    var items = 'items';
    o[items] = []
    let sql = `SELECT * FROM main
           ORDER BY name`;
    postdb.all(sql, [], (err, rows) => {
      if (err) {
        console.log(err);
      }
      rows.forEach((row) => {
        if(row.subject != "undefined"){
            o[items].push(row)
        }
      });
      var datetime = new Date();
      console.log(`/api/message/(GET) -- ${datetime} --`)
      res.json(o[items])
    })
});

app.post('/api/message/', function(req, res) {
    console.log("BODY")
    console.log(req.body)
    var postpost = true
    let postdata = [req.body.id, req.body.name, req.body.image, req.body.message, req.body.date, req.body.subject]
    let checksql = `SELECT * FROM main
           ORDER BY name`;
    let sql = `INSERT INTO main(id, name, image, message, date, subject) VALUES ("${postdata[0]}", "${postdata[1]}", "${postdata[2]}", "${postdata[3]}", "${postdata[4]}", "${postdata[5]}")`;
    postdb.all(checksql, [], (err, rows) => {
      if (err) {
        console.log(err);
      }
      rows.forEach((row) => {
        if(row.id == req.body.id){
            postpost = true
            return res.end();
        }
      });
    if(postpost){
    postdb.run(sql, function(err){
        if(err){
            return console.log(err)
        }
    })
    }
    var datetime = new Date();
    console.log(`/api/message/(POST) -- ${datetime} --`)
    res.end()
});
});

app.post('/api/user/', function(req, res) {
    console.log("USER LOGIN")
    var datetime = new Date();
    console.log(req.body.email)
    let exists = false
    let sql = `SELECT * FROM users
           ORDER BY name`;
    userdb.all(sql, [], (err, rows) => {
      if (err) {
        console.log(err);
      }
      rows.forEach((row) => {
        if(row.email == req.body.email){
            var datetime = new Date();
            exists = true
            console.log(`USER EXISTS -- ${datetime} --`)
            return res.end();
        }
      });
      if(!exists){
      var datetime = new Date();
      console.log(`NEW USER ${req.body.email} -- ${datetime} --`)
      let postdata = [req.body.email, req.body.image, req.body.name, req.body.token, req.body.id, req.body.idToken, datetime]
      sql = `INSERT INTO users(email, image, name, token, id, idtoken, date) VALUES ("${postdata[0]}", "${postdata[1]}", "${postdata[2]}", "${postdata[3]}", "${postdata[4]}", "${postdata[5]}", "${datetime}")`;
      
      userdb.run(sql, function(err){
          if(err){
              return console.log(err)
          }
      })
      var datetime = new Date();
      console.log(`/api/user/(POST) -- ${datetime} --`)
      res.end()
    }
    })
});

app.post('/api/search/', function(req, res) {
    k = new Object()
    var items = 'items';
    k[items] = []

    message = req.body.message.toLowerCase();
    let sql = `SELECT * FROM bob
           ORDER BY name`;
    db.all(sql, [], (err, rows) => {
      if (err) {
        throw err;
      }
      rows.forEach((row) => {
        let name = row.name.toLowerCase();
        if(name.includes(message)){
            k[items].push(row)
        }
      });
      found = k[items]
    });
      var datetime = new Date();
      console.log(`/api/search/(POST) -- ${datetime} --`)
});

app.get('/api/search/', function(req, res){
    res.json(found)
    var datetime = new Date();
    console.log(`/api/items/(GET) -- ${datetime} --`)
})

app.get('/api/message/:id', function(req, res) {
    k = new Object()
    var items = 'items';
    k[items] = []

    let sql = `SELECT * FROM main
           ORDER BY name`;
    postdb.all(sql, [], (err, rows) => {
      if (err) {
        console.error(err);
      }
      rows.forEach((row) => {
        if(row.id == req.params.id && row.subject == "undefined"){
            k[items].push(row)
        }
      });
      if(k[items].length != 0){
      res.json(k[items])        
      res.end();
      }
      var datetime = new Date();
      console.log(`/api/message/${req.params.id} -- ${datetime} --`)
      // res.json(o)
    });
});

app.get('/api/posts/:id', function(req, res) {

    // use mongoose to get all users in the database
    Post.findById(req.params.id, function(err, post) {

        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err)
            res.send(err)

        res.json(post); // return all users in JSON format
    });
});

app.get('/api/items/:id', function(req, res) {
    o = new Object()
    var items = 'items';
    o[items] = []

    var datetime = new Date();
    console.log(`/api/items/${req.params.id} -- ${datetime} --`)

    let sql = `SELECT * FROM bob
           ORDER BY name`;
    let postsql = `SELECT * FROM main
       ORDER BY name`;
    db.all(sql, [], (err, rows) => {
      if (err) {
        console.error(err);
      }
      rows.forEach((row) => {
        if(row.id == req.params.id){
            o[items].push(row)
        }
      });
      if(o[items].length != 0){
        console.log("Bob Bacteria")
        res.json(o[items])
        res.end();
      }else{
        virusesdb.all(postsql, [], (err, rows) => {
          if (err) {
            throw err;
          }
          rows.forEach((row) => {
            if(row.id == req.params.id){
                o[items].push(row)
            }
          });
          if(o[items].length != 0){
            console.log("Viruses")
            res.json(o[items])
            res.end();
          }else{

            // BACTERIA DB
        bacteriasdb.all(postsql, [], (err, rows) => {
          if (err) {
            throw err;
          }
          rows.forEach((row) => {
            if(row.id == req.params.id){
                o[items].push(row)
            }
          });
          if(o[items].length != 0){
            console.log("Bacteria")
            res.json(o[items])
            res.end();
          }else{

      postdb.all(postsql, [], (err, rows) => {
        if (err) {
          throw err;
        }
        rows.forEach((row) => {
          if(row.id == req.params.id){
              o[items].push(row)
          }
        });
        if(o[items].length != 0){
          console.log("Posts")
          res.json(o[items])
          res.end();
        }
          });
        }
          
        });

        }
        
      });
      }
    });
});

app.post("/api/contact/", (req, res) =>{
  name = req.body.name
  email = req.body.email
  message = req.body.description
  title = req.body.title
  date = req.body.date

  try{
    let transporter = nodemailer.createTransport({
      service: "gmail",
      secure: false,
      port: 25,
      auth: {
        user: creds[0],
        pass: creds[1]
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    let HelperOptions = {
      from: '"Deltasiv" < legendaryemailbot@gmail.com',
      to: 'deltasiv@protonmail.com',
      subject: `Customer ${name} contacted you`,
      text: `User ${name} contacted you with the email ${email}\nTitle: ${title}\nMessage: ${message}\nDate: ${date}`
    };
    transporter.sendMail(HelperOptions, (error, info) => {
      if(error){
        return console.log("this is the error" + error)
      }
    });
  }catch(err){
    res.send("Error happened while sending the email...")
  }


  console.log(`Email sent from ${email}`);
});

app.get('/api/*', function(req, res){
  res.send('This page doesnt exist : (', 404);
});

// // create user and send back all users after creation
// app.post('/api/users', function(req, res) {

//     // create a user, information comes from AJAX request from Angular
//     // Text means story/description
//     user = new Object()
//     var items = "items"
//     user[items] = []
//     user["name"].push(req.body.name)
//     user["email"].push(req.body.email)
//     user["image"].push(req.body.image)
//     user["token"].push(req.body.token)

// });

// // delete a user
// app.delete('/api/users/:user_id', function(req, res) {
//     User.remove({
//         _id : req.params.user_id
//     }, function(err, todo) {
//         if (err)
//             res.send(err);

//         // get and return all the users after you create another
//         User.find(function(err, users) {
//             if (err)
//                 res.send(err)
//             res.json(users);
//         });
//     });
// });


/*var bodyParser = require("mongodb");
var express = require('express');
var mongodb = require("mongodb");
var app = express();
var logger = require("morgan")*/

/*var MongoClient = mongodb.MongoClient;
var url = "mongodb://localhost:27017/datinxy"

MongoClient.connect(url, function(err, db){
  if(err){
    console.log("Unable to connect to database")
  } else{
    console.log("Connection Established")
    var users = db.db("datinxy")
    var data = users.collection("users")
    
    data.find({}).toArray(function(err, result){
      if(err){
        console.log(err)
      }else if (result.length){
        console.log(result)
      }else{
        console.log("No results found")
      }
    })
  }
})*/
