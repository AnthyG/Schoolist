"use strict";

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var port = process.env.PORT || 3000; // In Windows 'set PORT=3000&&node index.js'; In Linux 'PORT=3000 node index.js'
var fs = require('fs');

var url = require('url');
var qs = require('querystring');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
// var sha = require('simple-sha1');
var crypto = require('crypto');

app.use(session({
    store: new FileStore,
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));

server.listen(port, function() {
    console.log("\n" + Date().toString() + ":\n" + 'Server listening at port %d', port);
});

var dir = __dirname + '/';
var dirA = dir + '/admin/';
var dirP = dir + '/public/';

// function fetchHash(url) {
//     sha(url, function(result) {
//         console.log(result);
//     });
// }

function removeURLParameter(url, parameter) {
    //prefer to use l.search if you have a location/link object
    var urlparts = url.split('?');
    if (urlparts.length >= 2) {

        var prefix = encodeURIComponent(parameter) + '=';
        var pars = urlparts[1].split(/[&;]/g);

        //reverse iteration as may be destructive
        for (var i = pars.length; i-- > 0;) {
            //idiom for string.startsWith
            if (pars[i].lastIndexOf(prefix, 0) !== -1) {
                pars.splice(i, 1);
            }
        }

        url = urlparts[0] + (pars.length > 0 ? '?' + pars.join('&') : "");
        return url;
    } else {
        return url;
    }
}

function isLI(req) {
    var loggedin = false;
    if (req) {
        if (typeof req.session.loggedin !== 'undefined' && typeof req.session.loggedin !== 'null') {
            loggedin = true;
        }
    }
    return loggedin;
}

function isA(req) {
    var isadmin = false;
    if (typeof req.session.isadmin !== 'undefined' && typeof req.session.isadmin !== 'null' && req.session.isadmin === true) {
        isadmin = true;
    }
    return isadmin;
}

function HP(res) {
    console.log("HOMEPAGE");
    var sHTML = HTML_index;
    var class_options_HTML = '';
    var classes_arr = fs.readdirSync(dir + '/DB/Classes');
    classes_arr.forEach(function(C) {
        var C = C.slice(0, -5);
        class_options_HTML += '<option>' + C + '</option>';
    });
    res.send(HTML_HEADEr + sHTML
        .replace(/\{USER_CLASS_OPTIONS\}/gm, class_options_HTML) + HTML_FOOTEr);
    // res.sendFile(dirP + '/index.html');
}

function PP(req, res) {
    console.log("PANELPAGE");
    var sHTML = HTML_userpanel;
    if (isA(req)) {
        sHTML = HTML_adminpanel;
    }
    // var eventslist = '<li><a href="?eventg=Eventgroup 1">Event 1</a></li>';
    var eventgroupslist_HTML = '';
    var eventgroups = JSON.parse(fs.readFileSync((dir + '/DB/Classes/' + req.session.user_class + '.json'), 'utf8')).eventgroups;
    // for (var x = 0; x < eventgroups.length; x++) {
    //     var EG = eventgroups[x];
    // }
    eventgroups.forEach(function(EG) {
        eventgroupslist_HTML += '<li><a href="?eventg=' + EG + '">' + EG + '</a></li>';
    });

    res.send(HTML_HEADEr + sHTML
        .replace(/\{USER_CLASS\}/gm, req.session.user_class)
        .replace(/\{EVENTGROUPSLIST\}/gm, eventgroupslist_HTML)
        .replace(/\{USER_NAME\}/gm, req.session.name) + HTML_FOOTEr);
}

function EPs(req, res) {
    var psss = req.params[0].split('/');
    var fpathG = dir + '/DB/Eventgroups/' + psss[0] + '/group.json';
    var fpath = false;
    if (typeof req.params.event !== 'undefined' && typeof req.params.event !== 'null') {
        fpath = dir + '/DB/Eventgroups/' + psss[0] + '/' + req.params.event + '.json';
    }

    if (fs.existsSync(fpathG)) {
        var jsonFG = JSON.parse(fs.readFileSync(fpathG, 'utf8'));

        // CHECK IF CLASS EVEN HAS ACCESS TO EVENT,
        // OR IF ADMIN CHECK IF ADMIN IS ABLE TO EDIT EVENT .. and so on

        if (jsonFG.classes.indexOf(req.session.user_class) !== -1) {
            if (fpath === false) {
                console.log("EVENTGROUPPAGE");
                var sHTMLG = HTML_eventgroupview;

                var eventslist_HTML = '';
                var eventslist_arr = fs.readdirSync(dir + '/DB/Eventgroups/' + psss[0]);
                eventslist_arr.forEach(function(E) {
                    if (E !== 'group.json') {
                        var E = E.slice(0, -5);
                        eventslist_HTML += '<li><a href="/panel/' + psss[0] + '/' + E + '">' + E + '</a></li>';
                    }
                });

                res.send(HTML_HEADEr + sHTMLG
                    .replace(/\{EVENTGROUP_TITLE\}/gm, jsonFG.title)
                    .replace(/\{DESCRIPTION\}/gm, jsonFG.desc)
                    .replace(/\{EVENTSLIST\}/gm, eventslist_HTML)
                    .replace(/\{USER_NAME\}/gm, req.session.name) + HTML_FOOTEr);
            } else {
                console.log("EVENTPAGE");
                if (fs.existsSync(fpath)) {
                    var sHTML = HTML_eventview;
                    var jsonF = JSON.parse(fs.readFileSync(fpath, 'utf8'));
                    var entrieslist_HTML = '';
                    var jsonfchanged = false;
                    var entsleft = jsonF.maxents;

                    var alreadyentried = false;
                    if (jsonF.entries[req.session.user_class].indexOf(req.session.name) !== -1) {
                        alreadyentried = true;
                    }

                    if (req.query.jorl === 'true' && alreadyentried === false && isA(req) === false) {
                        // ADD USER TO ENTRIESLIST IF entsleft > 0
                        console.log('"' + req.session.name + '" from "' + req.session.user_class + '" joined "' + jsonF.title + '"');
                        jsonF.entries[req.session.user_class].push(req.session.name);
                        alreadyentried = true;
                        jsonfchanged = true;
                    } else if (req.query.jorl === 'false' && alreadyentried === true && isA(req) === false) {
                        console.log('"' + req.session.name + '" from "' + req.session.user_class + '" left "' + jsonF.title + '"');
                        delete jsonF.entries[req.session.user_class][jsonF.entries[req.session.user_class].indexOf(req.session.name)];
                        alreadyentried = false;
                        jsonfchanged = true;
                    } else {
                        // Dumb User :)
                    }
                    if (jsonfchanged) {
                        fs.writeFile(fpath, JSON.stringify(jsonF), 'utf8', function(err) {
                            if (err) throw err;
                            console.log('Saved ' + fpath);
                        });
                    }

                    for (var Cx in jsonF.entries) {
                        var Cy = jsonF.entries[Cx];
                        entrieslist_HTML += '<dt>' + Cx + '</dt><dd><ul>';
                        for (var Cyx in Cy) {
                            var Cyy = Cy[Cyx];
                            if (typeof Cyy !== 'undefined' && typeof Cyy !== 'null' && Cyy !== 'null' && Cyy !== '' && Cyy !== null) {
                                entrieslist_HTML += '<li>' + Cyy + '</li>';
                                entsleft--;
                            } else {
                                continue;
                            }
                        }
                        // Cy.forEach(function(entry) {
                        //     entrieslist_HTML += '<li>' + entry + '</li>';
                        // });
                        entrieslist_HTML += '</ul></dd>';
                    }

                    var entrybtn = '';
                    if (!isA(req)) {
                        entrybtn += '<a class="btn';
                        if (!alreadyentried) {
                            entrybtn += ' btn-primary" href="' + removeURLParameter(req.originalUrl, 'jorl') + '&jorl=true">Join this';
                        } else {
                            entrybtn += '" href="' + removeURLParameter(req.originalUrl, 'jorl') + '&jorl=false">Leave this'
                        }
                        entrybtn += '</a>';
                    }

                    res.send(HTML_HEADEr + sHTML
                        .replace(/\{EVENTGROUP_TITLE\}/gm, jsonFG.title)
                        .replace(/\{EVENT_TITLE\}/gm, jsonF.title)
                        .replace(/\{DESCRIPTION\}/gm, jsonF.desc)
                        .replace(/\{ENTSLEFT\}/gm, entsleft)
                        .replace(/\{ENTRYBTN\}/gm, entrybtn)
                        .replace(/\{ENTRIESLIST\}/gm, entrieslist_HTML)
                        .replace(/\{USER_NAME\}/gm, req.session.name) + HTML_FOOTEr);
                }
            }
        } else if (isLI(req)) {
            res.send(HTML_HEADEr + '<h4>You are not allowed to see this Event/Eventgroup!</h4>');
        } else {
            res.redirect('/');
        }
    }
}

function rPP(req, res) {
    var psss = req.params[0].split('/');
    var eg = '';
    if (typeof psss[0] !== 'undefined' && typeof psss[0] !== 'null') {
        eg += '/' + psss[0];
    }
    if (typeof psss[1] !== 'undefined' && typeof psss[1] !== 'null') {
        eg += '/' + psss[1];
    }
    res.send(HTML_HEADEr + '<div class="container">' + eg + '</div>');
    // res.redirect('/panel' + eg);
}

function doLogout(req, res) {
    console.log("LOGOUT");
    req.session.destroy(function(err) {
        // cannot access session here
        console.log("Session-Destroy: " + err);
    });
    res.redirect('/');
}

app.use(express.static(dir + '/assets/'));

// Check if logged in and do actions accordingly
app.get(/^(?:(?!\/panel(?:.*)?|\.js|\.css).)*$/, function(req, res) {
    console.log("GET *", url.parse(req.originalUrl));
    // fetchHash(req.protocol + '://' + req.get('host') + req.originalUrl);
    // console.log(req.query);
    if (req.query.logout) {
        doLogout(req, res);
    } else if (isLI(req)) {
        rPP(req, res);
    } else {
        HP(res);
    }
});

// Show Panelpage
app.get(/^(?:(?!\.js|\.css)\/panel(?:\/|(?:\/(.+)(?:\/(.+))?)?)?)$/, function(req, res) {
    console.log("PP", url.parse(req.originalUrl));
    var psss = req.params[0].split('/');
    if (req.query.logout) {
        doLogout(req, res);
    } else if (isLI(req) && typeof psss[0] !== 'undefined' && typeof psss[0] !== 'null') {
        EPs(req, res);
    } else if (isLI(req)) {
        PP(req, res);
    } else {
        res.redirect('/');
    }
});

// Login
// app.param(/^(?:(?!\.js|\.css).)*$/, function(req, res, next) {
//     console.log("POSTGET /", url.parse(req.originalUrl));
//     // req.session.startrequery = req;
//     next();
// });
app.post(/^(?:(?!\.js|\.css)(\/panel(?:\/|(?:\/(.+)(?:\/(.+))?)?)?)|.*)$/, function(req, res, next) {
    console.log("POST /", url.parse(req.originalUrl));
    // console.log('QUERY >>', url.parse(req.originalUrl));

    if (isLI(req)) {
        rPP(req, res);
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
            if (typeof post.user_class !== 'undefined' && typeof post.user_class !== 'null' &&
                typeof post.user_name !== 'undefined' && typeof post.user_name !== 'null' &&
                typeof post.user_pass !== 'undefined' && typeof post.user_pass !== 'null') {

                var unameL = post.user_name.toLowerCase();

                var dbfileN = dir + '/DB/Classes/' + post.user_class + '.json';
                var tryadmin = post.tryadmin || false;
                var jsonF_L;
                if (tryadmin === 'on') {
                    tryadmin = true;
                    jsonF_L = jsonF_La;
                } else {
                    tryadmin = false;
                    if (jsonF_Lu.hasOwnProperty(dbfileN)) {
                        jsonF_L = jsonF_Lu[dbfileN];
                        console.log(dbfileN + ' already read');
                    } else {
                        jsonF_L = JSON.parse(fs.readFileSync(dbfileN, 'utf8'));
                        jsonF_Lu[dbfileN] = jsonF_L;
                        console.log('read ' + dbfileN);
                    }
                }
                var hash2 = crypto.createHash('sha256').update(post.user_pass).digest('base64');
                if (jsonF_L.hasOwnProperty(unameL) && jsonF_L[unameL].pass === hash2) {
                    req.session.loggedin = true;
                    req.session.isadmin = tryadmin;
                    req.session.user_class = post.user_class;
                    req.session.user_name = post.user_name;
                    req.session.name = jsonF_L[unameL].name;

                    rPP(req, res);
                    // next();
                } else {
                    res.send(HTML_HEADEr + '<div class="container grid-960">Invalid Credentials: <pre>{' +
                        '\n&nbsp&nbsp&nbsp&nbspuser_class: ' + post.user_class +
                        '\n&nbsp&nbsp&nbsp&nbspuser_name: ' + post.user_name +
                        '\n&nbsp&nbsp&nbsp&nbsptryadmin: ' + tryadmin +
                        '\n}</pre><br><a class="btn btn-primary" href="/">Back</a></div>');
                }
            } else {
                res.send(HTML_HEADEr + '<div class="container grid-960">Invalid Credentials: <pre>{' +
                    '\n&nbsp&nbsp&nbsp&nbspuser_class: ' + post.user_class +
                    '\n&nbsp&nbsp&nbsp&nbspuser_name: ' + post.user_name +
                    '\n&nbsp&nbsp&nbsp&nbsptryadmin: ' + tryadmin +
                    '\n}</pre><br><a class="btn btn-primary" href="/">Back</a><div>');
            }
        });
    }
});
// app.all(/^(?:(?!\.js|\.css).)*$/, function(req, res) {
//     console.log("ALL /", req);
//     if (isLI(req)) {
//         rPP(req, res);
//     }
// });

var HTML_HEADEr = fs.readFileSync(dir + 'Cntnts/Header.html').toString();
var HTML_FOOTEr = fs.readFileSync(dir + 'Cntnts/Footer.html').toString();

var HTML_index = fs.readFileSync(dirP + 'index.html').toString();

var jsonF_Lu = {};
var jsonF_La = JSON.parse(fs.readFileSync(dir + '/DB/Admins.json', 'utf8'));

var HTML_adminpanel = fs.readFileSync(dirA + 'adminpanel.html').toString();
var HTML_userpanel = fs.readFileSync(dirP + 'userpanel.html').toString();
var HTML_eventgroupview = fs.readFileSync(dir + 'eventgroupview.html').toString();
var HTML_eventview = fs.readFileSync(dir + 'eventview.html').toString();

/*
// Vlt könnte man auch alle HTML's in ein Object tun, und dat dann halt einfach durch gehn!
// Wäre auf jedn Fall viel einfacher... und Code-Minimierend
HTMLs = {
    "HTML_HEADEr": dir + 'Cntnts/Header.html'
};
/**/

setInterval(function() {
    // TURN THESE INTO ASYNC readFile's.
    fs.readFile(dir + 'Cntnts/Header.html', function(err, data) {
        if (err) throw err;
        HTML_HEADEr = data.toString();
    });
    fs.readFile(dir + 'Cntnts/Footer.html', function(err, data) {
        if (err) throw err;
        HTML_FOOTEr = data.toString();
    });
    fs.readFile(dirP + 'index.html', function(err, data) {
        if (err) throw err;
        HTML_index = data.toString();
    });

    fs.readFile(dir + '/DB/Admins.json', function(err, data) {
        if (err) throw err;
        jsonF_La = JSON.parse(data);
    });

    fs.readFile(dirA + 'adminpanel.html', function(err, data) {
        if (err) throw err;
        HTML_adminpanel = data.toString();
    });
    fs.readFile(dirP + 'userpanel.html', function(err, data) {
        if (err) throw err;
        HTML_userpanel = data.toString();
    });
    fs.readFile(dir + 'eventgroupview.html', function(err, data) {
        if (err) throw err;
        HTML_eventgroupview = data.toString();
    });
    fs.readFile(dir + 'eventview.html', function(err, data) {
        if (err) throw err;
        HTML_eventview = data.toString();
    });
}, 5000);