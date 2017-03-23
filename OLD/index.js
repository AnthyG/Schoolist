"use strict";

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var port = process.env.PORT || 3000;
var fs = require('fs');

var qs = require('querystring');
var session = require('express-session');
var FileStore = require('session-file-store')(session);

app.use(session({
    store: new FileStore,
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}));

server.listen(port, function() {
    console.log("\n" + Date().toString() + ":\n" + 'Server listening at port %d', port);
});

var dir = __dirname;
var dirA = dir + '/admin/';
var dirP = dir + '/public/';

app.use(express.static(dirP));

app.get('/admin', function(req, res) {
    if (req.session.loggedin !== true) {
        res.sendFile(dirA + '/index.html');
    } else {
        res.send(HTML_adminpanel.replace(/\{USER_CLASS\}/gm, req.session.user.user_class).replace(/\{USER_NAME\}/gm, req.session.user.name));
    }
});
app.get(/^(?:(?!\/admin|\/logout|\/event|\.js|\.css).)*$/, function(req, res) {
    if (req.session.loggedin !== true) {
        res.sendFile(dirP + '/index.html');
    } else {
        res.send(HTML_userpanel.replace(/\{USER_CLASS\}/gm, req.session.user.user_class).replace(/\{USER_NAME\}/gm, req.session.user.name));
    }
});

app.post('/admin', function(req, res) {
    if (req.session.loggedin !== true) {
        var body = '';

        req.on('data', function(data) {
            body += data;

            // Too much POST data, kill the connection!
            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
            if (body.length > 1e6) {
                req.connection.destroy();
            }
        });
        req.on('end', function() {
            var post = qs.parse(body);

            // Verify Login
            var jsonF = JSON.parse(fs.readFileSync(dir + '/DB/Admins.json', 'utf8'));
            if (jsonF.hasOwnProperty(post.user_name) && jsonF[post.user_name].pass === post.user_pass) {
                req.session.loggedin = true;
                req.session.user = {
                    "user_class": post.user_class,
                    "user_name": post.user_name,
                    "name": jsonF[post.user_name].name
                };
                res.send(HTML_adminpanel.replace(/\{USER_CLASS\}/gm, post.user_class).replace(/\{USER_NAME\}/gm, jsonF[post.user_name].name));
            } else {
                res.send('Invalid Credentials <a href="/">Back</a>');
            }
        });
    } else {
        res.sendFile(dirA + '/index.html');
    }
});
app.post(/^(?:(?!\/admin|\/logout|\/event|\.js|\.css).)*$/, function(req, res) {
    if (req.session.loggedin !== true) {
        var body = '';

        req.on('data', function(data) {
            body += data;

            // Too much POST data, kill the connection!
            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
            if (body.length > 1e6) {
                req.connection.destroy();
            }
        });
        req.on('end', function() {
            var post = qs.parse(body);

            // Read class-table AFTER verification of class (does it even exist :?)
            var fpath = dir + '/DB/Classes/' + post.user_class + '.json';
            if (fs.existsSync(fpath)) {
                var jsonF = JSON.parse(fs.readFileSync(fpath, 'utf8'));
                // Verify Login
                if (jsonF.hasOwnProperty(post.user_name) && jsonF[post.user_name].pass === post.user_pass) {
                    req.session.loggedin = true;
                    req.session.user = {
                        "user_class": post.user_class,
                        "user_name": post.user_name,
                        "name": jsonF[post.user_name].name
                    };
                    res.send(HTML_userpanel.replace(/\{USER_CLASS\}/gm, post.user_class).replace(/\{USER_NAME\}/gm, jsonF[post.user_name].name));
                } else {
                    res.send('Invalid Credentials <a href="/">Back</a>');
                }
            } else {
                res.send('Class doesn\'t exist <a href="/">Back</a>');
            }
        });
    } else if (typeof req.session.user !== 'undefined' && typeof req.session.user !== 'null') {
        var fpath = dir + '/DB/Classes/' + req.session.user.user_class + '.json';
        if (fs.existsSync(fpath)) {
            var jsonF = JSON.parse(fs.readFileSync(fpath, 'utf8'));
            // Verify Login
            if (jsonF.hasOwnProperty(req.session.user.user_name)) {
                res.send(HTML_userpanel.replace(/\{USER_CLASS\}/gm, req.session.user.user_class).replace(/\{USER_NAME\}/gm, req.session.user.name));
            } else {
                res.send('Invalid Credentials <a href="/">Back</a>');
            }
        } else {
            res.send('Class doesn\'t exist <a href="/">Back</a>');
        }
    } else {
        res.sendFile(dirP + '/index.html');
    }
});

app.get('^/event/:event', function(req, res) {
    // Test if user is logged in
    if (req.session.loggedin === true) {
        res.send(req.params.event);
    } else {
        res.sendFile(dirP + '/index.html');
    }
});

function logout(req, res) {
    req.session.loggedin = false;
    req.session.destroy();
    // res.location('/');
    res.redirect(301, '/');
    // res.sendFile(dirP + '/index.html');
    // res.send("LOGGED OUT");
}

app.get('/logout', function(req, res) {
    logout(req, res);
});
app.post('/logout', function(req, res) {
    logout(req, res);
});

var HTML_adminpanel = fs.readFileSync(dirA + '/adminpanel.html').toString();
var HTML_userpanel = fs.readFileSync(dirP + '/userpanel.html').toString();
setInterval(function() {
    HTML_adminpanel = fs.readFileSync(dirA + '/adminpanel.html').toString();
    HTML_userpanel = fs.readFileSync(dirP + '/userpanel.html').toString();
}, 5000);