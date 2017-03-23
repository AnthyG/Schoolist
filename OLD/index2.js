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
    resave: false,
    saveUninitialized: false
}));

server.listen(port, function() {
    console.log("\n" + Date().toString() + ":\n" + 'Server listening at port %d', port);
});

var dir = __dirname;
var dirA = dir + '/admin/';
var dirP = dir + '/public/';

app.use(express.static(dirP));

function showpage(req, res, isA) {
    var isA = isA || false;

    res.location('/');
    if (isA === true) {
        res.send(HTML_adminpanel
            .replace(/\{USER_CLASS\}/gm, req.session.user_class + ' (Admin)')
            .replace(/\{USER_NAME\}/gm, req.session.name));
    } else {
        res.send(HTML_userpanel
            .replace(/\{USER_CLASS\}/gm, req.session.user_class)
            .replace(/\{USER_NAME\}/gm, req.session.name));
    }
}

app.post('/login', function(req, res) {
    if (req.session.loggedin === true) {
        // Already logged in
        // Send Panel
        showpage(req, res, req.session.isadmin);
    } else {
        // Not logged in
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
            if (typeof post.user_class !== 'undefined' && typeof post.user_class !== 'null') {
                var dbfile = dir + '/DB/Classes/' + post.user_class + '.json';
                var tryadmin = post.tryadmin || false;
                if (tryadmin === 'on') {
                    tryadmin = true;
                    dbfile = dir + '/DB/Admins.json';
                } else {
                    tryadmin = false;
                }
                var jsonF = JSON.parse(fs.readFileSync(dbfile, 'utf8'));
                if (jsonF.hasOwnProperty(post.user_name) && jsonF[post.user_name].pass === post.user_pass) {
                    req.session.loggedin = true;
                    // req.session.user = {
                    //     "user_class": post.user_class,
                    //     "user_name": post.user_name,
                    //     "name": jsonF[post.user_name].name,
                    //     "event": null,
                    //     "isadmin": tryadmin
                    // };
                    req.session.user_class = post.user_class;
                    req.session.user_name = post.user_name;
                    req.session.name = jsonF[post.user_name].name;
                    req.session.event = null;
                    req.session.isadmin = tryadmin;
                    req.session.save(function(err) {
                        // session saved
                        console.log(err);
                    });
                    showpage(req, res, tryadmin);
                } else {
                    res.send('Invalid Credentials {' +
                        '<br>user_class: ' + post.user_class +
                        '<br>user_name: ' + post.user_name +
                        '<br>tryadmin: ' + tryadmin +
                        '}<br><a href="/">Back</a>');
                }
            } else {
                res.send('Invalid Credentials {' +
                    '<br>user_class: ' + post.user_class +
                    '<br>user_name: ' + post.user_name +
                    '<br>tryadmin: ' + tryadmin +
                    '}<br><a href="/">Back</a>');
            }
        });
    }
});

app.get('/logout', function(req, res) {
    req.session.loggedin = false;
    req.session.save(function(err) {
        // session saved
        console.log(err);
    });
    // req.session.destroy(function(err) {
    //     // cannot access session here
    //     console.log("Session-Destroy failed: " + err);
    // });
    // req.store.destroy(req.session.id, function(err) {
    //     console.log("Session-Store-Destroy failed: " + err);
    // });
    // console.log("Logged out " + req);
    res.send("Logged out " + req);
    // res.redirect(301, '/');
});

app.get(/^\/event\/(\w+)$/, function(req, res) {
    if (req.session.loggedin === true) {
        req.session.event = req.params[0];
        req.session.save(function(err) {
            // session saved
            console.log(err);
        });
        res.send(req.params.event);
    } else {
        res.redirect(301, '/');
    }
});
app.get(/^\/IN\/(\w+)\/(\w+)$/, function(req, res) {
    req.session.name = req.params[0];
    req.session.pass = req.params[1];
    res.send(req.session.name + ' :: ' + req.session.pass);
});
app.get('/OUT', function(req, res) {
    var oname = req.session.name;
    req.session.name = null;
    req.session.pass = null;
    res.send('Deleted ' + oname);
});
app.get('/OUT2', function(req, res) {
    var oname = req.session.name;
    req.session.destroy(function(err) {
        // cannot access session here
        console.log("Session-Destroy failed: " + err);
    });
    res.send('Completely Deleted ' + oname);
});

// app.get(/^(?:(?!\/login|\/logout|\/event|\.js|\.css).)*$/, function(req, res) {
//     if (req.session.loggedin === true) {
//         // Already logged in
//         // Send Panel
//         showpage(req, res, req.session.isadmin);
//     } else {
//         res.redirect(301, '/');
//     }
//     // var isA = false;
//     // if (typeof req.session.user !== 'undefined' && req.session.isadmin === true) {
//     //     isA = true;
//     // }
//     // showpage(req, res, isA);
// });

var HTML_adminpanel = fs.readFileSync(dirA + '/adminpanel.html').toString();
var HTML_userpanel = fs.readFileSync(dirP + '/userpanel.html').toString();
setInterval(function() {
    HTML_adminpanel = fs.readFileSync(dirA + '/adminpanel.html').toString();
    HTML_userpanel = fs.readFileSync(dirP + '/userpanel.html').toString();
}, 5000);