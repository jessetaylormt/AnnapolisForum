var express = require('express');
var session = require('express-session');
var bodyParser  = require('body-parser');
var app = express();
var user = {
    username: null,
    password: null,
    email: null,
    set(username: string, password: string, email: string) {
        this.username = username;
        this.password = password;
        this.email = email;
    },
    clear() {
        this.username = null;
        this.password = null;
        this.email = null;
    }
};

var port: number = 80;
app.listen(port, function () {
    console.log('Annapolis-forum app listening on port ' + port + '!');
});

const path = require('path');
//app.use(express.static(path.join(__dirname, 'public'))); //<-- can be used if see OS dependent issues
app.use(express.static('./public/'));
app.use(bodyParser());

const dbErrorMessage = "Server is experiencing database connectivity issues. Please try again later.";
//Remember sending responses from different sources may need res.append('Access-Control-Allow-Origin', '*');



app.get('/api/recent-threads', function (req, res) {
    var queryString = `
    SELECT DISTINCT threads.thread_name AS name, threads.thread_id AS id, threads.author AS author, 
        posts.post_text AS firstPost, MIN(posts.datetime) AS timestamp, COUNT(posts.post_id) AS size 
        FROM annapolis_forum.threads
    INNER JOIN annapolis_forum.posts 
    ON annapolis_forum.threads.thread_id=annapolis_forum.posts.thread_id
    GROUP BY threads.thread_name
    ORDER BY timestamp
    `;
    queryDB(queryString, function(err, result){
        if(err) res.status(500).json({"error" : dbErrorMessage});
        else res.status(200).json({"data" : result, "error" : false});
    });
});

app.get('/api/search', function (req, res) {
    var params = req.query.params;
    try {var queryWords: string[] = parseQuery(params);}
    catch(err) {
        res.status(400).json({"error" : err.message});
        return;
    }

    //start on second word to avoid leading 'AND'
    var queryWordsSQL = "threads.thread_name LIKE '%" + queryWords[0] + "%'";
    for(var i = 1; i < queryWords.length; i++) {
        queryWordsSQL = queryWordsSQL + " AND threads.thread_name LIKE '%" + queryWords[i] + "%'";
    }
    var queryString = `
    SELECT DISTINCT threads.thread_name AS name, threads.thread_id AS id, threads.author AS author, 
        posts.post_text AS firstPost, MIN(posts.datetime) AS timestamp, COUNT(posts.post_id) AS size 
        FROM annapolis_forum.threads
    INNER JOIN annapolis_forum.posts 
    ON annapolis_forum.threads.thread_id=annapolis_forum.posts.thread_id
    WHERE ` + queryWordsSQL + ` 
    GROUP BY threads.thread_name
    ORDER BY timestamp
    `;
    queryDB(queryString, function(err, result){
        if(err) res.status(500).json({"error" : dbErrorMessage});
        else res.status(200).json({"data" : result, "error" : false});
    });
});

app.get('/api/thread/:id', function (req, res) {
    var threadId = req.params.id;
    var queryString = `SELECT thread_name AS name, author, thread_id AS id 
        FROM annapolis_forum.threads WHERE thread_id=` + threadId;
    queryDB(queryString, function(err, result){
        if(err) res.status(500).json({"error" : dbErrorMessage});
        else res.status(200).json({"data" : result, "error" : false});
    });
});

app.get('/api/thread-posts/:id', function (req, res) {
    var threadId = req.params.id;
    var queryString = `SELECT post_text AS text, author, datetime AS timestamp 
    FROM annapolis_forum.posts WHERE thread_id=` + threadId;
    queryDB(queryString, function(err, result){
        if(err) res.status(500).json({"error" : dbErrorMessage});
        else if(result.length == 0) res.status(404).json({"error" : "Could not find thread requested."});
        else res.status(200).json({"data" : result, "error" : false});
    });
});

//optional to help with 404 redirects -- 
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

//app.post('/api/thread/:id', checkAuthorized, function(req, res) {  <-- this can be used for auth
app.post('/api/thread/:id', checkAuthorized, function(req, res) {
    var newPost = req.body;
    //this try catch block is likely unnecessary - need to investigate SQL Injection Attacks more thoroughly
    try {newPost = cleanSQLObject(newPost);}
    catch(err) {
        res.status(500).json({"error" : err.message});
        return;
    }

    var queryString = `
        INSERT INTO annapolis_forum.posts (thread_id, author, post_text) 
        VALUES ('`+ newPost.threadId + `','` + newPost.author + `','` + newPost.text + `')`;
    
    queryDB(queryString, function(err, result){
        if(err) res.status(500).json({"error" : dbErrorMessage});
        else res.status(201).json({"data" : result, "error" : false});
    });
});

//this end point makes 2 DB calls - the first creates the thread, the second logs the first post into that thread
app.post('/api/new-thread', checkAuthorized, function(req, res) {
    var newThread = req.body;
    try {newThread = cleanSQLObject(newThread);}
    catch(err) {
        res.status(400).json({"error" : err.message});
        return;
    }
    var queryString = `
        INSERT INTO annapolis_forum.threads (thread_name, author) 
        VALUES ('`+ newThread.name + `','` + newThread.author + `')`;

    //splice new threadId between these once available
    var postQueryString1 = `INSERT INTO annapolis_forum.posts (thread_id, post_text, author) VALUES ('`;
    var postQueryString2 = `', '` + newThread.firstPost + `','` + newThread.author + `')`;

    queryDB(queryString, function(err, result) {
            if(err) res.status(500).json({"error" : dbErrorMessage});
            else {
                //successful thread creation. Create first post.
                var newThreadId = result.insertId;
                queryDB(postQueryString1 + newThreadId + postQueryString2, 
                    (err2, result) => { 
                        if(err2) {
                            //in the unlikely event that the thread is created but not the first post, client can simply request a new thread
                            //db admin will need to clean out this dead thread later, since db is having issues right now
                            res.status(500).json({"error" : "thread instatiated but first post lost"});
                            console.log("Failed first post on thead creation for threadId=" + newThreadId);
                        }
                        else res.status(201).json({"newThreadId": newThreadId});
                    });
            }
        }
    )
});

app.post('/api/login', function(req, res) {
    user.set(req.body.username, req.body.password, null);
    if (!checkAcceptedChars(req.body.username) || !checkAcceptedChars(req.body.password)) {
        res.status(401).json({"error" : "Invalid characters in username or password"});
    }
    else {
        var queryString = "SELECT password FROM annapolis_forum.users WHERE username='" + user.username + "'";
        queryDB(queryString, function(err, result){
            if(err || result.length == 0) res.status(401).json({"error" : "Username not found"});
            else if(result[0].password != user.password) res.status(401).json({"error" : "Password mismatch"});
            else {
                doLogin(user);
                res.status(200).json({"data" : result, "error" : false});
            }
        });
    }
});

app.post('/api/logout', function(req, res) {
    if (req.body.username != user.username) {
        console.log(req.body.username + " attempted to logout but was already logged out...");
    }
    doLogout();
    res.status(200).json({"data" : {"username": user}, "error" : false});
    user.set(null, null, null);
});


app.post('/api/signup', function(req, res) {
    //check if username is already in use
    if (!checkAcceptedChars(req.body.username) || !checkAcceptedChars(req.body.password)) {
        res.status(401).json({"error" : "Invalid characters in username or password"});
    }
    else if (req.body.email != null && (req.body.email.indexOf('\\') != -1 || req.body.email.indexOf("'") != -1) ) {
        res.status(401).json({"error" : "Invalid characters in email"});
    }
    else {
        var testUserExistsQuery = "SELECT 1 FROM annapolis_forum.users WHERE username='" + req.body.username + "'";
        queryDB(testUserExistsQuery, function(err, result){
            if(err) res.status(400).json({"error" : "Unexpected server error"});
            else if (result.length != 0) res.status(401).json({"error" : "That username already exists"});
            //Username does not already exist - create new user in db
            else {
                user.set(req.body.username, req.body.password, req.body.email);
                var queryString = `INSERT INTO annapolis_forum.users (username, password, email) 
                    VALUES ('` + user.username + `', '` + user.password + `', '` + user.email + `')`;
                
                queryDB(queryString, function(err, result){
                    if(err) res.status(400).json({"error" : "Unexpected server error"});
                    else {
                        doLogin(user);
                        res.status(201).json({"data" : result, "error" : false});
                    }
                });
            }
        });
    }
});




function queryDB(queryString: string, callback: Function) {
    //should use pool to make this more dynamic & usable
    var dbConfig = require('./db-credentials');
    var mysql      = require('mysql');
    var connection = mysql.createConnection(dbConfig);
    connection.connect(function(err) {
        if (err) {
            console.error('error connecting: ' + err.stack);
            return;
        }
    });
    connection.query(queryString, function(err, result, fields) {
        connection.end();
        callback(err, result);
    });
}

function checkAuthorized(req, res, next) {
    if(session.user == null) {
        console.log("User attempting to post content without being logged in... Possible client-server misalignment");
        res.status(400).json({"error" : "Your login on the server has expired. Please refresh the page and log in again."});
    }
    else
        return next();
}

function doLogin(user) {
    session.user = user;
}

function doLogout() {
    session.user = null;
}


//This seems like duplicate code - could be consolidated with the functions below
//

//Escape all escape characters and single quotes to avoid DB malfunction
function parseQuery(params) {
    var newWord = '';
    var result = [];
    for (var i = 0; i < params.length; i++) {
        if(params[i] == ',' || params[i] == '\\') {
            result.push(newWord);
            newWord = '';
        }
        else if(params[i] == "'") newWord = newWord + '\\' + params[i];
        else newWord = newWord + params[i];
    }
    result.push(newWord);
    return result;
}

//Escape all escape characters and single quotes to avoid DB malfunction
function cleanSQLObject(object) {
    for (var key in object) {
        if (typeof object[key] === 'string') {
            object[key] = cleanSQLString(object[key]);
        }
    }
    return object;
}

function cleanSQLString(text) {
    var resultString = '';
    for(var i = 0; i < text.length; i++) {
        if(text[i] == "'" || text[i] == '\\') resultString = resultString + '\\' + text[i];
        else resultString = resultString + text[i];
    }
    return resultString;
}

function checkAcceptedChars(text) {
        for(var i = 0; i < text.length; i++) {
            if( /[^a-zA-Z0-9@.&\$\-]/.test( text[i]) ) return false;
        }
        return true;
}