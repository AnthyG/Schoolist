"use strict";

var express = require('express');
var serveStatic = require('serve-static');
var app = express();
var compress = require('compression');
app.use(compress());
var fs = require('fs');



var qs = require('querystring');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
// var sha = require('simple-sha1');
var crypto = require('crypto');

app.use(session({
    store: new FileStore,
    secret: 'bebi kahtsze', // keyboard cat
    resave: false,
    saveUninitialized: false
}));



var HTTPV = process.env.HTTPV || 0;
if (HTTPV === "1") {
    var port = process.env.PORT || 3001; // In Windows 'set PORT=3000&&node index.js'; In Linux 'PORT=3000 node index.js'

    var server = require('http').createServer(app);

    server.listen(port, function() {
        console.log("\n" + Date().toString() + ":\n" + "\n" + Date().toString() + ":\n" + 'Server listening at port %d', port);
    });
} else {
    var privateKey = fs.readFileSync('/etc/letsencrypt/live/mcsanthy.de/privkey.pem', 'utf8');
    var certificate = fs.readFileSync('/etc/letsencrypt/live/mcsanthy.de/cert.pem', 'utf8');
    var chainLines = fs.readFileSync('/etc/letsencrypt/live/mcsanthy.de/chain.pem', 'utf8').split("\n");
    var cert = [];
    var ca = [];
    chainLines.forEach(function(line) {
        cert.push(line);
        if (line.match(/-END CERTIFICATE-/)) {
            ca.push(cert.join("\n"));
            cert = [];
        }
    });
    var credentials = {
        key: privateKey,
        cert: certificate,
        ca: ca
    };

    var sport = process.env.SPORT || 3441;

    app.use(function(req, res, next) {
        if (!req.secure) {
            var hostname = (req.headers.host.match(/:/g)) ? req.headers.host.slice(0, req.headers.host.indexOf(":")) : req.headers.host
            console.log("s-redirect -> " + 'https://' + hostname + ':' + sport + '' + req.url);
            return res.redirect('https://' + hostname + ':' + sport + '' + req.url);
        }
        next();
    });

    var sserver = require('http2').createServer(credentials, app);

    sserver.listen(sport, function() {
        console.log("\n" + Date().toString() + ":\n" + "\n" + Date().toString() + ":\n" + 'SServer listening at sport %d', sport);
    });
}

var dir = __dirname + '/';
var dirA = dir + 'pages_a/';
var dirP = dir + 'pages/';

// 2592000000 ms
// 2592000 s
app.use(serveStatic(dir + 'assets/', {
    maxAge: 30 * 86400000,
    setHeaders: assetsCacheControl
}));

// GEHT NICH
// app.use(express.static(dir + 'service-worker.js'));

function assetsCacheControl(res, path) {
    if (serveStatic.mime.lookup(path) === 'text/html') {
        // Custom Cache-Control for HTML files
        res.setHeader('Cache-Control', 'public, max-age=0')
    }
}

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

function extend(target) {
    var sources = [].slice.call(arguments, 1);
    sources.forEach(function(source) {
        for (var prop in source) {
            // if (target.hasOwnProperty(prop) === false) {
            target[prop] = source[prop];
            // }
        }
    });
    return target;
}

function mkdirSync(path) {
    try {
        fs.mkdirSync(path);
    } catch (e) {
        if (e.code != 'EEXIST') throw e;
    }
}

function mkdirpSync(dirpath) {
    var parts = dirpath.split(path.sep);
    for (var i = 1; i <= parts.length; i++) {
        mkdirSync(path.join.apply(null, parts.slice(0, i)));
    }
}

function escapeHtml(text, rNndR) {
    var rNndR = rNndR || false;
    var map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    text.replace(/[&<>"']/g, function(m) { return map[m]; });
    if (rNndR) {
        text = text.replace(/(?:\r?\n|\r)/gm, '\n');
    }

    return text
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

function ACs(req) {
    if (isA(req)) {
        if (jsonF_La[req.session.user_name.toLowerCase()].classes === "*") { // || jsonF_La[req.session.user_name.toLowerCase()].classes.indexOf(class)
            // var classeslist_HTML = '';
            // var classeslist_arr = fs.readdirSync(dir + 'DB/Classes/');
            // classeslist_arr.forEach(function(C) {
            //     var C = C.slice(0, -5);
            //     classeslist_HTML += '<li><a href="/' + psss[0] + '/' + E + '">' + E + '</a></li>';
            // });
            var classeslist_arr = fs.readdirSync(dir + 'DB/Classes/');
            for (var x = 0; x < classeslist_arr.length; x++) {
                var y = classeslist_arr[x];
                y = y.slice(0, -5);
                classeslist_arr[x] = y;
            }
            return classeslist_arr;
        }
    }
}



function HTMLcmbnr(shtml, req) {
    return HTML_HEADEr()
        .replace(/\{\{\{CNTNTS\}\}\}/gm, HTML_NAVBAr() + shtml + HTML_FOOTEr())
        .replace(/\{NAVBARLEFT_LINK\}/gm, shtml.match(/\{NAVBARLEFT_LINK\{((?:.|\n)*)\}\/NAVBARLEFT_LINK\}/)[1])
        .replace(/\{NAVBARLEFT_ICON\}/gm, shtml.match(/\{NAVBARLEFT_ICON\{((?:.|\n)*)\}\/NAVBARLEFT_ICON\}/)[1])
        .replace(/\{NAVBAR_LINKS\}/gm, shtml.match(/\{NAVBAR_LINKS\{((?:.|\n)*)\}\/NAVBAR_LINKS\}/)[1].replace(/(<li class="menu-item">|<\/li>)/gm, ''))
        .replace(/\{NAVBAR_LINKS_LI\}/gm, shtml.match(/\{NAVBAR_LINKS\{((?:.|\n)*)\}\/NAVBAR_LINKS\}/)[1].replace(/(?:\ |(\"))btn(?:\-link)?/gm, '$1'))
        .replace(/\{NAVBAR\{((?:.|\n)*)\}\/NAVBAR\}/gm, '')
        .replace(/\{USER_CLASS\}/gm, req.session.user_class)
        .replace(/\{USER_NAME\}/gm, req.session.user_name)
        .replace(/\{USER_FORENAME\}/gm, req.session.forename)
        .replace(/\{USER_SURNAME\}/gm, req.session.surname);
}



function LP(res) {
    console.log("\n" + Date().toString() + ":\n" + "LOGINPAGE");
    var sHTML = HTML_login();

    var class_options_HTML = '';
    var classes_arr = fs.readdirSync(dir + 'DB/Classes');
    classes_arr.forEach(function(C) {
        var C = C.slice(0, -5);
        class_options_HTML += '<option>' + C + '</option>';
    });

    res.send(HTML_HEADEr()
        .replace(/\{\{\{CNTNTS\}\}\}/gm, sHTML + HTML_FOOTEr())
        .replace(/\{USER_CLASS_OPTIONS\}/gm, class_options_HTML));
    // res.sendFile(dirP + '/index.html');
}

function RP(res) {
    console.log("\n" + Date().toString() + ":\n" + "REGISTERPAGE");
    var sHTML = HTML_register();

    var class_options_HTML = '';
    var classes_arr = fs.readdirSync(dir + 'DB/Classes');
    classes_arr.forEach(function(C) {
        var C = C.slice(0, -5);
        class_options_HTML += '<option>' + C + '</option>';
    });

    res.send(HTML_HEADEr()
        .replace(/\{\{\{CNTNTS\}\}\}/gm, sHTML + HTML_FOOTEr())
        .replace(/\{USER_CLASS_OPTIONS\}/gm, class_options_HTML));
    // res.sendFile(dirP + '/index.html');
}

function UP(req, res) {
    console.log("\n" + Date().toString() + ":\n" + "USERPANEL");
    var sHTML = HTML_userpanel();

    res.send(HTMLcmbnr(sHTML, req));
}

function ELP(req, res) {
    console.log("\n" + Date().toString() + ":\n" + "EVENTLISTPAGE");
    var sHTML = HTML_eventlist();

    if (isA(req)) {
        sHTML = sHTML
            .replace(/\{A_topcntnt\}/gm, HTML_A_topcntnt_1())
            .replace(/\{A_bottomcntnt\}/gm, HTML_A_bottomcntnt_1())
            .replace(/\{FROM_TEXT\}/gm, '{USER_CLASS} <i>(Admin)</i>');
    } else {
        sHTML = sHTML
            .replace(/\{A_topcntnt\}/gm, '')
            .replace(/\{A_bottomcntnt\}/gm, '')
            .replace(/\{FROM_TEXT\}/gm, '{USER_CLASS}');
    }
    // var eventslist = '<li><a href="?eventg=Eventgroup 1">Event 1</a></li>';
    var eventgroupslist_HTML = ''; // <ul>
    var eventgroups = JSON.parse(fs.readFileSync((dir + 'DB/Classes/' + req.session.user_class + '.json'), 'utf8')).eventgroups;
    // for (var x = 0; x < eventgroups.length; x++) {
    //     var EG = eventgroups[x];
    // }
    eventgroups.forEach(function(EG) {
        var fpathG = dir + 'DB/Eventgroups/' + EG + '/group.json';
        if (fs.existsSync(fpathG)) {
            var jsonF_G = JSON.parse(fs.readFileSync(fpathG, 'utf8'));

            if (jsonF_G.classes.indexOf(req.session.user_class) !== -1) {
                var tdate = jsonF_G.tdate;
                var isintime = false,
                    cdate = new Date();
                var egstate = '';
                if (cdate < new Date(jsonF_G.tdate)) {
                    isintime = true;
                } else {
                    egstate += '<span class="label label-danger">time over</span>';
                }

                eventgroupslist_HTML += HTML_eventgroup_grouped()
                    .replace(/\{DESCRIPTION\}/gm, jsonF_G.desc)
                    .replace(/\{EVENTGROUP_TITLE\}/gm, EG)
                    .replace(/\{TILL_DATE\}/gm, tdate)
                    .replace(/\{EGSTATE\}/gm, egstate)
                    .replace(/\{MAXEENTS\}/gm, jsonF_G.maxeents)
                    .replace(/\{SELECTED_CLASSES\}/gm, jsonF_G.classes.toString());
            }
        }

        // eventgroupslist_HTML += '<li><a href="/e/' + EG + '">' + EG + '</a></li>';
    });
    // eventgroupslist_HTML += '</ul>';

    res.send(HTMLcmbnr(sHTML, req)
        .replace(/\{EVENTGROUPSLIST\}/gm, eventgroupslist_HTML));
}

function EP(req, res) {
    console.log("\n" + Date().toString() + ":\n" + "EVENTPANELPAGE");

    var psss = [];
    psss[0] = undefined;
    if (typeof req.params[0] !== 'undefined') {
        psss = req.params[0].split('/');
    }
    psss.shift();
    console.log(JSON.stringify(psss));
    var fpath = dir + 'DB/Eventgroups/' + psss[0] + '/';
    var fpathG = fpath + 'group.json';
    var fpathE = false;
    if (typeof psss[1] !== 'undefined' && typeof psss[1] !== 'null' && psss[1] !== '') {
        fpathE = fpath + 'Events/' + psss[1] + '.json';
    }

    if (fs.existsSync(fpathG)) {
        var jsonF_G = JSON.parse(fs.readFileSync(fpathG, 'utf8'));

        if (jsonF_G.classes.indexOf(req.session.user_class) !== -1) {
            var jorl = psss[2];
            if (fpathE !== false && fs.existsSync(fpathE) === true &&
                typeof jorl !== 'undefined' && typeof jorl !== 'null' && jorl !== '' &&
                (jorl === 'true' || jorl === 'false')) {
                console.log("\n" + Date().toString() + ":\n" + "JORL-ACTION (" + jorl + ")");

                var fpathC = fpath + 'Entries/' + req.session.user_class + '.json';
                var jsonF_CE = {};
                if (fs.existsSync(fpathC)) {
                    jsonF_CE = JSON.parse(fs.readFileSync(fpathC, 'utf8'));
                }

                var alreadyentried = false;
                if (jsonF_CE.hasOwnProperty(req.session.user_name) !== false) {
                    if (jsonF_CE[req.session.user_name].indexOf(psss[1]) !== -1) {
                        alreadyentried = true;
                    }
                } else {
                    jsonF_CE[req.session.user_name] = [];
                    alreadyentried = false;
                }

                var actionstatus = 'jorlE=';

                var haseentsleft = jsonF_G.maxeents > jsonF_CE[req.session.user_name].length;
                if (haseentsleft || jorl === 'false') {
                    var isintime = false,
                        cdate = new Date();
                    if (cdate < new Date(jsonF_G.tdate)) {
                        isintime = true;
                    }
                    if (isintime) {
                        var jsonF_E = JSON.parse(fs.readFileSync(fpathE, 'utf8'));
                        var entsareleft = (jsonF_E.maxents - jsonF_E.ents) > 0;
                        if (entsareleft || jorl === 'false') {
                            var jsonfchanged = false;
                            if (jorl === 'true' && alreadyentried === false && isA(req) === false) {
                                // ADD USER TO ENTRIESLIST IF entsleft > 0 && IF cdate < tdate
                                console.log("\n" + Date().toString() + ":\n" + '"' + req.session.name + '" from "' + req.session.user_class + '" joined "' + psss[1] + '", in "' + psss[0] + '"');
                                jsonF_CE[req.session.user_name].push(psss[1]);
                                jsonF_E.ents++;

                                alreadyentried = true;
                                jsonfchanged = true;

                                actionstatus += "S_j";
                            } else if (jorl === 'false' && alreadyentried === true && isA(req) === false) {
                                console.log("\n" + Date().toString() + ":\n" + '"' + req.session.name + '" from "' + req.session.user_class + '" left "' + psss[1] + '", in "' + psss[0] + '"');
                                // delete jsonF_CE[req.session.user_name][jsonF_CE[req.session.user_name].indexOf(psss[1])];
                                jsonF_CE[req.session.user_name].splice(jsonF_CE[req.session.user_name].indexOf(psss[1]), 1);
                                jsonF_E.ents--;

                                alreadyentried = false;
                                jsonfchanged = true;

                                actionstatus += "S_l";
                            } else {
                                console.log("\n" + Date().toString() + ":\n" + '"' + req.session.name + '" from "' + req.session.user_class + '" couldn\'t join/leave "' + psss[1] + '", in "' + psss[0] + '" (' + jorl + ' :: ' + alreadyentried + ' :: ' + isA(req) + ')');

                                if (jorl === 'true') {
                                    actionstatus += 'F_j';
                                } else if (jorl === 'false') {
                                    actionstatus += 'F_l';
                                } else {
                                    actionstatus += "F_u";
                                }
                            }

                            if (jsonfchanged) {
                                fs.writeFile(fpathC, JSON.stringify(jsonF_CE), 'utf8', function(err) {
                                    if (err) console.log("\n" + Date().toString() + ":\n" + err);
                                    console.log("\n" + Date().toString() + ":\n" + 'Saved ' + fpathC);
                                });
                                fs.writeFile(fpathE, JSON.stringify(jsonF_E), 'utf8', function(err) {
                                    if (err) console.log("\n" + Date().toString() + ":\n" + err);
                                    console.log("\n" + Date().toString() + ":\n" + 'Saved ' + fpathE);
                                });
                            }
                        } else {
                            // There are no Entries left for this Event!
                            console.log("\n" + Date().toString() + ":\n" + '"' + req.session.name + '" from "' + req.session.user_class + '" couldn\'t join/leave "' + psss[1] + '", in "' + psss[0] + '" because entsareleft === ' + entsareleft + '(' + jorl + ')');

                            actionstatus += 'F_f';
                        }
                    } else {
                        // Entry-Time is over!
                        console.log("\n" + Date().toString() + ":\n" + '"' + req.session.name + '" from "' + req.session.user_class + '" couldn\'t join/leave "' + psss[1] + '", in "' + psss[0] + '" because isintime === ' + isintime);

                        actionstatus += 'F_o';
                    }
                } else {
                    // User is in too many Events!
                    console.log("\n" + Date().toString() + ":\n" + '"' + req.session.name + '" from "' + req.session.user_class + '" couldn\'t join/leave "' + psss[1] + '", in "' + psss[0] + '" because hasentsleft === ' + haseentsleft + ' (' + jsonF_G.maxeents + ' :: ' + jsonF_CE[req.session.user_name].length + ')');

                    actionstatus += 'F_m';
                }

                if (actionstatus === 'jorlE=') {
                    actionstatus = '';
                }
                res.redirect('/e/' + psss[0] + '?' + actionstatus);
                res.end();
                return false;
            } else {
                console.log("\n" + Date().toString() + ":\n" + "GROUPEDEVENTSVIEW");
                var sHTML = HTML_groupedeventsview();

                var eventslist_arr = fs.readdirSync(fpath + 'Events/');
                // CICLE THROUGH EVERY CLASS, AND CREATE ENTRIESLIST!
                var jsonF_CEs = {};
                var entrieslist_arr = {};
                var missing_arr = {};
                var classes_arr = {};
                for (var Cx in jsonF_G.classes) {
                    var Cy = jsonF_G.classes[Cx]; // klasse

                    var fpathC = fpath + 'Entries/' + Cy + '.json'; // Entries/Class (only already-entried users)
                    var fpathCR = dir + 'DB/Classes/' + Cy + '.json'; // Class (all users)
                    if (fs.existsSync(fpathCR)) {
                        classes_arr[Cy] = JSON.parse(fs.readFileSync(fpathCR, 'utf8'));
                        delete classes_arr[Cy]['eventgroups'];
                        for (var Ux in classes_arr[Cy]) {
                            delete classes_arr[Cy][Ux]["pass"];
                        }
                        if (isA(req)) {
                            if (!missing_arr.hasOwnProperty(Cy)) {
                                missing_arr[Cy] = JSON.parse(JSON.stringify(classes_arr[Cy]));

                                // THIS DOESN'T WORK, QUITE AS EXPECTED, BECAUSE IT ACTUALLY CREATES A 'NEW NAME' FOR THE ARRAY
                                // missing_arr[Cy] = classes_arr[Cy];
                            }
                        }
                    } else {
                        console.log("\n" + Date().toString() + ":\n" + 'couldn\'t read ' + fpathCR);
                    }
                    if (fs.existsSync(fpathC)) {
                        jsonF_CEs[Cy] = JSON.parse(fs.readFileSync(fpathC, 'utf8'));

                        for (var Ux in jsonF_CEs[Cy]) {
                            var Uy = jsonF_CEs[Cy][Ux]; // user
                            for (var Uyx in Uy) {
                                var Uyy = Uy[Uyx]; // event
                                if (eventslist_arr.indexOf(Uyy + '.json') !== -1) {
                                    if (!entrieslist_arr.hasOwnProperty(Uyy)) {
                                        entrieslist_arr[Uyy] = {};
                                    }
                                    if (!entrieslist_arr[Uyy].hasOwnProperty(Cy)) {
                                        entrieslist_arr[Uyy][Cy] = [];
                                    }
                                    entrieslist_arr[Uyy][Cy].push(Ux); // Event -> Klasse -> User
                                }
                            }
                            if (isA(req) && missing_arr[Cy].hasOwnProperty(Ux)) {
                                if (Uy.length >= jsonF_G.maxeents) {
                                    delete missing_arr[Cy][Ux];
                                } else if (Uy.length < jsonF_G.maxeents) {
                                    missing_arr[Cy][Ux]["missing"] = jsonF_G.maxeents - Uy.length;
                                }
                            }
                        }

                        if (isA(req)) {
                            if (Object.keys(missing_arr[Cy]).length === 0 && missing_arr[Cy].constructor === Object) {
                                delete missing_arr[Cy];
                            }
                        }
                    } else {
                        console.log("\n" + Date().toString() + ":\n" + 'couldn\'t read ' + fpathC);
                    }
                }

                var tdate = jsonF_G.tdate;
                var isintime = false,
                    cdate = new Date();
                var egstate = '';
                if (cdate < new Date(jsonF_G.tdate)) {
                    isintime = true;
                } else {
                    // egstate += '<h4><b>This Eventgroup is over!</b></h4>';
                    egstate += '<span class="label label-danger">time over</span>';
                }

                var eventslist_HTML = ''; // <ul class="list-unstyled">
                eventslist_arr.forEach(function(Ex, EX) {
                    var jsonF_E = JSON.parse(fs.readFileSync(fpath + 'Events/' + Ex, 'utf8'));
                    var Ex = Ex.slice(0, -5);
                    var Ey = entrieslist_arr[Ex];

                    var maxents = jsonF_E.maxents;
                    var entsleft = maxents - jsonF_E.ents;

                    var entrieslist_HTML = '<dl>';
                    var alreadyentried = false;
                    for (var Cx in Ey) {
                        var Cy = Ey[Cx];
                        entrieslist_HTML += '<dt>' + Cx + '</dt><dd><ul>';
                        for (var Ux in Cy) {
                            var Uy = Cy[Ux] || '';
                            if (Uy !== '') {
                                var Uy2 = classes_arr[Cx][Uy];
                                entrieslist_HTML += '<li>' + Uy2.surname + ', ' + Uy2.forename + '</li>';

                                if (!isA(req) && Cx === req.session.user_class && Uy === req.session.user_name) {
                                    alreadyentried = true;
                                }
                            } else {
                                continue;
                            }
                        }
                        entrieslist_HTML += '</ul></dd>';
                    }
                    entrieslist_HTML += '</dl>';

                    var egHTML = HTML_event_grouped();
                    var entrybtn = '';
                    if (!isA(req) && isintime) {
                        var entrybtnB = '';
                        if (!alreadyentried && (entsleft) > 0) {
                            entrybtnB += ' btn-primary" href="' + psss[0] + '/' + jsonF_E.title + '/true">Join this';
                        } else if (alreadyentried) {
                            entrybtnB += '" href="' + psss[0] + '/' + jsonF_E.title + '/false">Leave this';
                        }

                        if (entrybtnB !== '') {
                            entrybtn += '<a class="btn' + entrybtnB + '</a>';
                        }
                    } else if (isA(req)) {
                        entrybtn += HTML_A_bottomcntnt_3();
                    }

                    var entsstate = '';
                    if (!isA(req) && alreadyentried) {
                        entsstate += '<span class="label label-success">joined</span>';
                    }
                    if (entsleft < 1) {
                        entsstate += ' <span class="label label-danger">full</span>';
                    }
                    eventslist_HTML += egHTML // '<li>' + 
                        .replace(/\{ENTRYBTN\}/gm, entrybtn)
                        .replace(/\{EVENT_DESCRIPTION\}/gm, jsonF_E.desc)
                        .replace(/\{EVENT_TITLE\}/gm, jsonF_E.title)
                        .replace(/\{ENTSLEFT\}/gm, entsleft)
                        .replace(/\{MAXENTS\}/gm, maxents)
                        .replace(/\{ENTSSTATE\}/gm, entsstate)
                        .replace(/\{ENTRIESLIST\}/gm, entrieslist_HTML)
                        .replace(/\{EVENT_ID\}/gm, EX);
                    // + '</li>'
                });
                // eventslist_HTML += '</ul>';

                if (isA(req)) {
                    var missing_HTML = '<dl>';
                    for (var Cx in missing_arr) {
                        var Cy = missing_arr[Cx];
                        missing_HTML += '<dt>' + Cx + '</dt><dd><ul>';
                        for (var Ux in Cy) {
                            var Uy = Cy[Ux];
                            if (typeof Uy !== 'undefined' && typeof Uy !== 'null' && Uy !== 'null' && Uy !== '' && Uy !== null) {
                                var missing = Uy.missing || jsonF_G.maxeents;
                                missing_HTML += '<li><b>' + Uy.surname + ', ' + Uy.forename + '</b> ' + missing + '</li>';
                            } else {
                                continue;
                            }
                        }
                        missing_HTML += '</ul></dd>';
                    }
                    missing_HTML += '</dl>';

                    sHTML = sHTML
                        .replace(/\{A_topcntnt\}/gm, HTML_A_topcntnt_2_3())
                        .replace(/\{A_bottomcntnt\}/gm, HTML_A_bottomcntnt_2_3()
                            .replace(/\{MISSING_USERSLIST\}/gm, missing_HTML));
                } else {
                    sHTML = sHTML
                        .replace(/\{A_topcntnt\}/gm, '')
                        .replace(/\{A_bottomcntnt\}/gm, '');
                }

                res.send(HTMLcmbnr(sHTML, req)
                    .replace(/\{DESCRIPTION\}/gm, jsonF_G.desc)
                    .replace(/\{EVENTSLIST\}/gm, eventslist_HTML)
                    .replace(/\{EVENTGROUP_TITLE\}/gm, jsonF_G.title)
                    .replace(/\{TILL_DATE\}/gm, tdate)
                    .replace(/\{EGSTATE\}/gm, egstate)
                    .replace(/\{MAXEENTS\}/gm, jsonF_G.maxeents)
                    .replace(/\{SELECTED_CLASSES\}/gm, jsonF_G.classes.toString()));
            }
        } else if (isLI(req)) {
            res.send(HTML_HEADEr()
                .replace(/\{\{\{CNTNTS\}\}\}/gm, '<div class="container grid-960"><p>You don\'t have access to this Eventgroup!</p><br><a class="btn btn-primary" href="/">Back</a><div>'));
        } else {
            res.redirect('/');
        }
    } else {
        res.send(HTML_HEADEr()
            .replace(/\{\{\{CNTNTS\}\}\}/gm, '<div class="container grid-960"><p>This Eventgroup does not exist!</p><br><a class="btn btn-primary" href="/">Back</a><div>'));
    }
}

function rPP(req, res) {
    var psss = [];
    psss[0] = undefined;
    if (typeof req.params[0] !== 'undefined') {
        psss = req.params[0].split('/');
    }
    console.log("\n" + Date().toString() + ":\n" + "rPP");
    var eg = '/e/';
    if (typeof psss[0] !== 'undefined' && typeof psss[0] !== 'null') {
        eg += '' + psss[0];
        if (typeof psss[1] !== 'undefined' && typeof psss[1] !== 'null') {
            eg += '/' + psss[1];
        }
    }
    // res.send(HTML_HEADEr + '<div class="container">' + eg + '</div>');
    res.redirect(eg);
}

function MCP(req, res) {
    var prms = [];
    prms[0] = undefined;
    if (typeof req.params[0] !== 'undefined') {
        prms = req.params[0].split('/');
    }
    prms.shift();
    console.log("\n" + Date().toString() + ":\n" + "MCP");
    var sHTML = HTML_A_registered();

    var classes_arr = ACs(req);

    var class_options_HTML = '';
    classes_arr.forEach(function(C) {
        class_options_HTML += '<option>' + C + '</option>';
    });

    var fpath = dir + 'DB/Classes/' + prms[1] + '.json';
    if (fs.existsSync(fpath)) {
        var jsonF_L = JSON.parse(fs.readFileSync(fpath, 'utf8'));
        jsonF_Lu[fpath] = jsonF_L;
        console.log("\n" + Date().toString() + ":\n" + 'read ' + fpath);

        var userslistalready_HTML = '<ul>';
        for (var Ux in jsonF_L) {
            if (Ux !== 'eventgroups') {
                var Uy = jsonF_L[Ux];
                // userslistalready_HTML += '<div class="form-group"><label class="form-checkbox"><input type="checkbox" /><i class="form-icon"></i> ' + Uy.name + '</label></div>';
                userslistalready_HTML += '<li><b>' + Uy.surname + ', ' + Uy.forename + '</b> (' + Ux + ')</li>';
            }
        }
        userslistalready_HTML += '</ul>';

        var userslistwaiting_HTML = '';
        if (jsonF_R.hasOwnProperty(prms[1]) !== false) {
            var UX = 0;
            for (var Ux in jsonF_R[prms[1]]) {
                var Uy = jsonF_R[prms[1]][Ux];
                userslistwaiting_HTML += '<div class="form-group"><label class="form-checkbox"><input type="checkbox" name="users_w_' + UX + '" /><i class="form-icon"></i> <b>' + Uy.surname + ', ' + Uy.forename + '</b> (' + Ux + ')</label></div>';
                UX++;
            }
        }
        if (userslistalready_HTML === '<ul></ul>') {
            userslistalready_HTML = '<i>No Users in this class yet.</i>';
        }
        if (userslistwaiting_HTML === '') {
            userslistwaiting_HTML = '<i>No Users registered for this class.</i>';
        }

        res.send(HTMLcmbnr(sHTML, req)
            .replace(/\{CLASS_OPTIONS\}/gm, class_options_HTML)
            .replace(/\{CURRENT_CLASS\}/gm, prms[1])
            .replace(/\{USERS_LIST_ALREADY\}/gm, userslistalready_HTML)
            .replace(/\{USERS_LIST_WAITING\}/gm, userslistwaiting_HTML)
            .replace(/\{USER_NAME\}/gm, req.session.user_name));
    } else {
        res.send(HTMLcmbnr(sHTML, req)
            .replace(/\{CLASS_OPTIONS\}/gm, class_options_HTML)
            .replace(/\{CURRENT_CLASS\}/gm, 'null')
            .replace(/\{USERS_LIST_ALREADY\}/gm, userslistalready_HTML)
            .replace(/\{USERS_LIST_WAITING\}/gm, userslistwaiting_HTML)
            .replace(/\{USER_NAME\}/gm, req.session.user_name));
    }
}

function LstsP(req, res) {
    var prms = [];
    prms[0] = undefined;
    if (typeof req.params[0] !== 'undefined') {
        prms = req.params[0].split('/');
    }
    prms.shift();
    prms[2] = (prms[2] === "get" ? "get" : "");
    prms[3] = (prms[2] === "get" ? parseInt(prms[3]) : 0);
    var Q = req.query;
    var q_S = Q.search || "",
        q_C = (Q.countries ? Q.countries.split(',') : ""),
        q_L = (Q.languages ? Q.languages.split(',') : "");
    console.log("\n" + Date().toString() + ":\n" + "LstsP/" + prms[0] + '/' + prms[1] + '/' + prms[2] + '/' + prms[3] + '?s' + q_S + '&c' + q_C + '&l' + q_L); // "l"/ListName/Entry-Index

    var rangePs = prms[3],
        rangeP = 15;
    if (rangePs !== 0 && prms[2] === "get") {
        rangeP = rangePs + 5;
    } else if (prms[2] !== "get") {
        var sHTML = HTML_A_lists();

        var lstsA = ["AiA"]; //, "HF"];

        var list_options_HTML = '';
        lstsA.forEach(function(L) {
            list_options_HTML += '<option>' + L + '</option>';
        });
    }

    var listitemlist_JSON = {};
    var listitemlist_c = false;

    var fpath = dir + 'DB/Lists/' + prms[1] + '.json';
    if (fs.existsSync(fpath)) {
        var jsonF = JSON.parse(fs.readFileSync(fpath, 'utf8'));

        for (var i = rangePs; i < rangeP; i++) {
            var item = jsonF[i];
            if (item !== "") {
                var has_qC = ((q_C !== "" && q_C.indexOf(item.country) !== -1) || true);
                var has_qL = true;
                if (q_L !== "") {
                    has_qL = false;
                    for (var l in item.languages) {
                        if (q_L.indexOf(l) !== -1) {
                            has_qL = true;
                            break;
                        }
                    }
                }
                if (!has_qL || !has_qC) {
                    continue;
                }
                listitemlist_c = true;
                listitemlist_JSON[i] = item;
            }
        }
    }
    if (prms[3] === 0 && prms[2] !== "get") {
        if (lstsA.indexOf(prms[1]) === -1) {
            prms[0] = 'null';
        }
        res.send(HTMLcmbnr(sHTML, req)
            .replace(/\{LIST_OPTIONS\}/gm, list_options_HTML)
            .replace(/\{CURRENT_LIST\}/gm, prms[1])
            .replace(/\{LISTITEMVIEW_HTML\}/gm, HTML_A_listitemview()));
    } else {
        if (listitemlist_c > 0) {
            res.json(listitemlist_JSON);
        } else {
            res.send("No more items!");
        }
    }
}

function doLogout(req, res) {
    console.log("\n" + Date().toString() + ":\n" + "LOGOUT");
    req.session.destroy(function(err) {
        // cannot access session here
        console.log("\n" + Date().toString() + ":\n" + "Session-Destroy: " + err);
    });
    res.redirect('/');
}

// ADMIN-ACTIONS
app.post(/^(?:(?:\/e\/(.+))?|(?:(?!\/mc(?:.*)?|\/register(?:.*)?).)*)$/, function(req, res, next) { // ^\/e(?:(?:\/)?(.+))?$
    var psss = [];
    psss[0] = undefined;
    if (typeof req.params[0] !== 'undefined') {
        psss = req.params[0].split('/');
    }
    if (isLI(req) && isA(req)) {
        console.log("\n" + Date().toString() + ":\n" + "POST (hpflly /e) " + req.params[0]);
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

            var actionstatus = 'NA';
            if (typeof post["neg-FORM"] !== 'undefined' &&
                typeof post.neg_title !== 'undefined' && typeof post.neg_title !== 'null' && post.neg_title !== '' &&
                typeof post.neg_desc !== 'undefined' && typeof post.neg_desc !== 'null' && post.neg_desc !== '' &&
                typeof post.neg_selected !== 'undefined' && typeof post.neg_selected !== 'null' && post.neg_selected !== '' &&
                typeof post.neg_tdate !== 'undefined' && typeof post.neg_tdate !== 'null' && post.neg_tdate !== '' &&
                typeof post.neg_maxeents !== 'undefined' && typeof post.neg_maxeents !== 'null' && post.neg_maxeents !== '') {
                // Create new Eventgroup
                actionstatus = 'F_neg';
                // ALSO HAS TO CHECK IF ADMIN HAS PERMISSIONS FOR THAT CLASS!!!
                /*
                for (var neg_selectedX in neg_selected) {
                    var neg_selectedY = neg_selected[neg_selectedX];
                    if (ACs(req).indexOf(neg_selectedY) === -1) {
                        // Has no permissions for this class, and thus, will remove it from neg_selected
                        neg_selected
                    }
                }
                */

                var dpath = dir + 'DB/Eventgroups/' + post.neg_title;
                var fpath = dpath + '/group.json';
                if (fs.existsSync(fpath) === false) {
                    var p_selected_arr = post.neg_selected.split(',');
                    for (var x in p_selected_arr) {
                        var C = p_selected_arr[x].trim();

                        var dbfileN = dir + 'DB/Classes/' + C + '.json';
                        if (fs.existsSync(dbfileN)) {
                            var jsonF_L = JSON.parse(fs.readFileSync(dbfileN, 'utf8'));
                            jsonF_Lu[dbfileN] = jsonF_L;
                            console.log("\n" + Date().toString() + ":\n" + 'read ' + dbfileN);

                            jsonF_L.eventgroups.push(post.neg_title);

                            fs.writeFile(dbfileN, JSON.stringify(jsonF_L), 'utf8', function(err) {
                                if (err) console.log("\n" + Date().toString() + ":\n" + err);
                                console.log("\n" + Date().toString() + ":\n" + 'Saved ' + dbfileN);
                            });
                        } else {
                            console.log("\n" + Date().toString() + ":\n" + 'Class "' + C + '" doesn\'t exist!');
                        }
                    }

                    var jsonF = {
                        title: escapeHtml(post.neg_title, true),
                        desc: escapeHtml(post.neg_desc, true),
                        classes: p_selected_arr,
                        tdate: post.neg_tdate,
                        maxeents: post.neg_maxeents
                    };

                    mkdirSync(dpath);
                    mkdirSync(dpath + '/Events');
                    mkdirSync(dpath + '/Entries');

                    fs.writeFile(fpath, JSON.stringify(jsonF), 'utf8', function(err) {
                        if (err) console.log("\n" + Date().toString() + ":\n" + err);
                        console.log("\n" + Date().toString() + ":\n" + 'Saved ' + fpath);
                    });
                    actionstatus = 'S_neg';
                    psss[0] = post.neg_title;
                }

                // var sHTML = post.neg_title + ' :: ' + post.neg_desc + ' :: ' + post.neg_selected;
                // res.send(HTML_HEADEr + sHTML);
            } else if (typeof post["ne-FORM"] !== 'undefined' &&
                typeof post.ne_title !== 'undefined' && typeof post.ne_title !== 'null' && post.ne_title !== '' &&
                typeof post.ne_desc !== 'undefined' && typeof post.ne_desc !== 'null' && post.ne_desc !== '' &&
                typeof post.ne_maxents !== 'undefined' && typeof post.ne_maxents !== 'null' && post.ne_maxents !== '' &&
                typeof psss[0] !== 'undefined' && typeof psss[0] !== 'null' && psss[0] !== '') {
                // Create new Event
                actionstatus = 'F_ne';

                var dpath = dir + 'DB/Eventgroups/' + psss[0] + '/';
                var fpath = dpath + 'Events/' + post.ne_title + '.json';
                if (fs.existsSync(fpath) === false) {
                    var jsonF = {
                        title: escapeHtml(post.ne_title, true),
                        desc: escapeHtml(post.ne_desc, true),
                        maxents: post.ne_maxents,
                        ents: 0
                    };

                    fs.writeFile(fpath, JSON.stringify(jsonF), 'utf8', function(err) {
                        if (err) console.log("\n" + Date().toString() + ":\n" + err);
                        console.log("\n" + Date().toString() + ":\n" + 'Saved ' + fpath);
                    });
                    actionstatus = 'S_ne';
                }
            } else if (typeof post["eeg-FORM"] !== 'undefined' &&
                // typeof post.eeg_title !== 'undefined' && typeof post.eeg_title !== 'null' && post.eeg_title !== '' &&
                // typeof post.eeg_desc !== 'undefined' && typeof post.eeg_desc !== 'null' && post.eeg_desc !== '' &&
                // typeof post.eeg_selected !== 'undefined' && typeof post.eeg_selected !== 'null' && post.eeg_selected !== '' &&
                // typeof post.eeg_tdate !== 'undefined' && typeof post.eeg_tdate !== 'null' && post.eeg_tdate !== '' &&
                // typeof post.eeg_maxeents !== 'undefined' && typeof post.eeg_maxeents !== 'null' && post.eeg_maxeents !== '' &&
                typeof psss[0] !== 'undefined' && typeof psss[0] !== 'null' && psss[0] !== '') {
                // Edit Eventgroup
                actionstatus = 'F_eeg';

                /*
                EIG IS DAT JA UNSINNICH, SCHLIEßLICH KÖNNTE MAN JA AUCH NUR EINE SACHE EDITIERN ..WOLLEN.. (mit API halt)
                UND DANN MUSS MAN JA NICH FÜR ALLE TESTEN, ODER?!
            
                AUF JEDN FALL MUSS ICH AUCH NOCH NE MÖGLICHKEIT FINDN, WIE'ER DANN DAT MIT DEM RENAMEN MACHT x_x
                */

                var dpath = dir + 'DB/Eventgroups/' + psss[0];
                var fpath = dpath + '/group.json';
                if (fs.existsSync(fpath) === true) {
                    var p_selected_arr = post.eeg_selected.split(',');
                    for (var x in p_selected_arr) {
                        var C = p_selected_arr[x].trim();

                        var dbfileN = dir + 'DB/Classes/' + C + '.json';
                        if (fs.existsSync(dbfileN)) {
                            var jsonF_L = JSON.parse(fs.readFileSync(dbfileN, 'utf8'));
                            jsonF_Lu[dbfileN] = jsonF_L;
                            console.log("\n" + Date().toString() + ":\n" + 'read ' + dbfileN);

                            jsonF_L.eventgroups.push(post.neg_title);

                            fs.writeFile(dbfileN, JSON.stringify(jsonF_L), 'utf8', function(err) {
                                if (err) console.log("\n" + Date().toString() + ":\n" + err);
                                console.log("\n" + Date().toString() + ":\n" + 'Saved ' + dbfileN);
                            });
                        } else {
                            console.log("\n" + Date().toString() + ":\n" + 'Class "' + C + '" doesn\'t exist!');
                        }
                    }

                    var jsonF = JSON.parse(fs.readFileSync(fpath, 'utf8'));
                    var jsonFn = {
                        title: escapeHtml(post.eeg_title, true) || jsonF.title,
                        desc: escapeHtml(post.eeg_desc, true) || jsonF.desc,
                        classes: p_selected_arr || jsonF.classes,
                        tdate: post.eeg_tdate || jsonF.tdate,
                        maxeents: post.eeg_maxeents || jsonF.maxeents
                    };

                    fs.writeFile(fpath, JSON.stringify(jsonFn), 'utf8', function(err) {
                        if (err) console.log("\n" + Date().toString() + ":\n" + err);
                        console.log("\n" + Date().toString() + ":\n" + 'Saved ' + fpath);
                    });
                    actionstatus = 'S_eeg';
                }
            } else if (typeof post["ee-FORM"] !== 'undefined' &&
                // typeof post.ee_title !== 'undefined' && typeof post.ee_title !== 'null' && post.ee_title !== '' &&
                // typeof post.ee_desc !== 'undefined' && typeof post.ee_desc !== 'null' && post.ee_desc !== '' &&
                // typeof post.ee_maxents !== 'undefined' && typeof post.ee_maxents !== 'null' && post.ee_maxents !== '' &&
                typeof psss[0] !== 'undefined' && typeof psss[0] !== 'null' && psss[0] !== '' &&
                typeof psss[1] !== 'undefined' && typeof psss[1] !== 'null' && psss[1] !== '') {
                // Edit Event
                actionstatus = 'F_ee';

                var dpath = dir + 'DB/Eventgroups/' + psss[0] + '/';
                var fpath = dpath + 'Events/' + psss[1] + '.json';
                if (fs.existsSync(fpath) === true) {
                    var jsonF = JSON.parse(fs.readFileSync(fpath, 'utf8'));
                    jsonF.title = escapeHtml(post.ee_title, true) || jsonF.title,
                        jsonF.desc = escapeHtml(post.ee_desc, true) || jsonF.desc,
                        jsonF.maxents = post.ee_maxents || jsonF.maxents;

                    fs.writeFile(fpath, JSON.stringify(jsonF), 'utf8', function(err) {
                        if (err) console.log("\n" + Date().toString() + ":\n" + err);
                        console.log("\n" + Date().toString() + ":\n" + 'Saved ' + fpath);
                    });
                    actionstatus = 'S_ee';
                }
            } else {
                var blocked = true;
            }

            if (blocked !== true) {
                psss[0] = psss[0] || '';
                res.redirect('/e/' + psss[0] + '?AS=' + actionstatus);
            } else {
                res.send(HTML_HEADEr() + '<p>' + psss[0] + '<br>' + psss[1] + '</p>' + JSON.stringify(post));
            }
        });
    } else {
        next();
    }
});

// app.get(/(.*)(\.js|\.css|\.ico|\.png|\.svg|\.jpg|\.jpeg)$/, function(req, res, next) {
//     // Checks if the get is for an asset
//     console.log("\n" + Date().toString() + ":\n" + "ASSET " + req.url);
//     res.setHeader("Cache-Control", "public, max-age=2592000");
//     res.setHeader("Expires", new Date(Date.now() + 2592000).toUTCString());
//     next();
// });

app.get(/^(.*)$/, function(req, res, next) {
    console.log("\n" + Date().toString() + ":\n" + "GET *");
    // fetchHash(req.protocol + '://' + req.get('host') + req.originalUrl);
    // console.log("\n" + Date().toString() + ":\n" + req.query);
    var prms = [];
    prms[0] = undefined;
    if (typeof req.params[0] !== 'undefined') {
        prms = req.params[0].split('/');
    }
    prms.shift();

    if (req.query.logout) {
        console.log("\n" + Date().toString() + ":\n" + "Gf* logout");
        doLogout(req, res);
        // } else if (req.query.readtest) {
        //     var sHTML = xd();
        //     res.send(HTML_HEADEr() + sHTML
        //         .replace(/\{EVENTGROUPSLIST\}/gm, "TROLOLOLOLOOOOOLLLLL"));

        // } else if (req.query.formtest) {
        //     var sHTML = '<div class="container grid-960"><form id="FORM" method="GET" enctype="application/x-www-form-urlencoded"><div class="form-group"><input class="form-input" type="text" name="TEXT" /></div></form><input class="btn btn-primary" form="FORM" value="Senden" name="SUBMIT" type="submit" /></div>';
        //     res.send(HTML_HEADEr + sHTML);
    } else if (isLI(req)) {
        if (isA(req)) {
            if (prms[0] === 'mc') {
                console.log("\n" + Date().toString() + ":\n" + "G* MCP");
                MCP(req, res);
            } else if (prms[0] === 'l') {
                console.log("\n" + Date().toString() + ":\n" + "G* LstsP");
                LstsP(req, res);
            } else {
                next();
            }
        } else {
            next();
        }
    } else if (prms[0] === 'register') {
        RP(res);
    } else {
        LP(res);
    }
});

app.get(/^(?:\/e\/(.+)?)$/, function(req, res, next) {
    var psss = [];
    psss[0] = undefined;
    if (typeof req.params[0] !== 'undefined') {
        psss = req.params[0].split('/');
    }
    console.log("\n" + Date().toString() + ":\n" + "GET almost e", JSON.stringify(psss));

    if (typeof psss[0] !== 'undefined' && typeof psss[0] !== 'null' && psss[0] === "e") {
        if (typeof psss[1] !== 'undefined' && typeof psss[1] !== 'null' && psss[1] !== "") {
            console.log("\n" + Date().toString() + ":\n" + "Gf* EP");
            EP(req, res);
        } else {
            console.log("\n" + Date().toString() + ":\n" + "Gf* ELP");
            ELP(req, res);
        }
    } else {
        next();
    }
});

app.get(/^\/$/, function(req, res) {
    console.log("\n" + Date().toString() + ":\n" + "Gf* UP");
    UP(req, res);
});

// Check if logged in and do actions accordingly
// app.get(/^(?:(?:\/|\/e\/(.+))?|(?:(?!\.js|\.css|\.ico|\.png|\.svg|\.jpg|\.jpeg).)*)$/, function(req, res) {
//     var psss = [];
//     psss[0] = undefined;
//     console.log("\n" + Date().toString() + ":\n" + JSON.stringify(req.params));
//     if (typeof req.params[0] !== 'undefined') {
//         psss = req.params[0].split('/');
//     }
//     console.log("\n" + Date().toString() + ":\n" + "GET almost *", JSON.stringify(psss));
//     // fetchHash(req.protocol + '://' + req.get('host') + req.originalUrl);
//     // console.log("\n" + Date().toString() + ":\n" + req.query);
//     if (isLI(req)) {
//         if (typeof psss[0] !== 'undefined' && typeof psss[0] !== 'null' && psss[0] === "e") {
//             if (typeof psss[1] !== 'undefined' && typeof psss[1] !== 'null' && psss[1] !== "") {
//                 console.log("\n" + Date().toString() + ":\n" + "Gf* EP");
//                 EP(req, res);
//             } else {
//                 console.log("\n" + Date().toString() + ":\n" + "Gf* ELP");
//                 ELP(req, res);
//             }
//         } else {
//             console.log("\n" + Date().toString() + ":\n" + "Gf* UP");
//             UP(req, res);
//         }
//     } else {
//         console.log("\n" + Date().toString() + ":\n" + "Gf* LP");
//         LP(res);
//     }
// });

// Show Panelpage
// app.get(/^\/panel(?:\/|\/(.+))?$/, function(req, res) {
//     var psss = [];
//     psss[0] = undefined;
//     if (typeof req.params[0] !== 'undefined') {
//         psss = req.params[0].split('/');
//     }
//     // console.log("\n" + Date().toString() + ":\n" + req.params, psss);
//     if (req.query.logout) {
//         doLogout(req, res);
//     } else if (isLI(req) && typeof psss[0] !== 'undefined' && typeof psss[0] !== 'null') {
//         EP(req, res);
//     } else if (isLI(req)) {
//         PP(req, res);
//     } else {
//         // res.redirect('/');
//     }
// });

// Manage Class
app.post(/^\/mc\/(.+)$/, function(req, res) {
    var Class = req.params[0];
    console.log("\n" + Date().toString() + ":\n" + "POST-Manage Class /mc/" + Class);
    if (isLI(req) && isA(req)) {
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
            // Counts to 50 (I mean, what Class on Earth has 50 students, right!?!)
            var x2 = 0;
            var jsonfrchanged = false;
            var added = {};
            for (var x in jsonF_R[Class]) {
                if (post["users_w_" + x2] === 'on') {
                    var y = jsonF_R[Class][x];
                    if (typeof y !== 'undefined' && typeof y !== 'null') {
                        delete jsonF_R[Class][x];
                        added[x] = y;
                        jsonfrchanged = true;
                    }
                }
                x2++;
            }

            var jsonF_L,
                jsonF_LN;
            if (jsonfrchanged) {
                var dbfileN = dir + 'DB/Classes/' + Class + '.json';
                jsonF_L = JSON.parse(fs.readFileSync(dbfileN, 'utf8'));
                jsonF_LN = extend({}, jsonF_L, added);
                console.log("\n" + Date().toString() + ":\n" + jsonF_L, jsonF_LN);
                jsonF_Lu[dbfileN] = jsonF_LN;
                console.log("\n" + Date().toString() + ":\n" + 'read ' + dbfileN);

                fs.writeFile(dir + 'DB/Registerer.json', JSON.stringify(jsonF_R), 'utf8', function(err) {
                    if (err) console.log("\n" + Date().toString() + ":\n" + err);
                    console.log("\n" + Date().toString() + ":\n" + 'Saved ' + dir + 'DB/Registerer.json');
                });
                fs.writeFile(dbfileN, JSON.stringify(jsonF_LN), 'utf8', function(err) {
                    if (err) console.log("\n" + Date().toString() + ":\n" + err);
                    console.log("\n" + Date().toString() + ":\n" + 'Saved ' + dbfileN);
                });
            }

            // res.send('LOL >> Changed: ' + jsonfrchanged + '<br><br>' +
            //     JSON.stringify(post) + '<br><br>' +
            //     JSON.stringify(added) + '<br><br>' +
            //     JSON.stringify(jsonF_R) + '<br><br>' +
            //     JSON.stringify(jsonF_L) + '<br><br>' +
            //     JSON.stringify(jsonF_LN));
            res.redirect(req.originalUrl);
        });
    }
});

// Register
app.post('/register', function(req, res) {
    console.log("\n" + Date().toString() + ":\n" + "POST-Register /");
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

            // Verify Registration
            if (typeof post.user_class !== 'undefined' && typeof post.user_class !== 'null' && post.user_class !== '' &&
                // typeof post.user_name !== 'undefined' && typeof post.user_name !== 'null' && post.user_name !== '' && post.user_name.length >= 6 &&
                typeof post.user_pass !== 'undefined' && typeof post.user_pass !== 'null' && post.user_pass !== '' && post.user_pass.length >= 6 &&
                typeof post.forename !== 'undefined' && typeof post.forename !== 'null' && post.forename !== '' && post.forename.length >= 3 &&
                typeof post.surname !== 'undefined' && typeof post.surname !== 'null' && post.surname !== '' && post.surname.length >= 3) {

                // var unameL = post.user_name.toLowerCase();
                var u = post.surname + ', ' + post.forename;
                var able2 = u.match(/(?:(.*), ((.).*))/);
                var unameL = able2[3].toLowerCase() + able2[1].toLowerCase();

                var dbfileN = dir + 'DB/Classes/' + post.user_class + '.json';

                var jsonF_L;
                if (jsonF_Lu.hasOwnProperty(dbfileN) !== false) {
                    jsonF_L = jsonF_Lu[dbfileN];
                    console.log("\n" + Date().toString() + ":\n" + dbfileN + ' already read');
                } else {
                    jsonF_L = JSON.parse(fs.readFileSync(dbfileN, 'utf8'));
                    jsonF_Lu[dbfileN] = jsonF_L;
                    console.log("\n" + Date().toString() + ":\n" + 'read ' + dbfileN);
                }
                if (jsonF_L.hasOwnProperty(unameL) !== false) {
                    // User already exists in Class
                    res.send(HTML_HEADEr()
                        .replace(/\{\{\{CNTNTS\}\}\}/gm, '<div class="container grid-960"><p>Username "' + post.user_name + '" already exists.</p><br><a class="btn btn-primary" href="">Back</a></div>'));
                } else {
                    // User doesn't yet exist in Class
                    var rpath = dir + 'DB/Registerer.json';
                    fs.readFile(rpath, 'utf8', function(err, data) {
                        if (err) console.log("\n" + Date().toString() + ":\n" + err);
                        var jsonF_R = JSON.parse(data);
                        if (jsonF_R.hasOwnProperty(post.user_class) === false) {
                            jsonF_R[post.user_class] = {};
                        }
                        if (jsonF_R[post.user_class].hasOwnProperty(post.user_name) === false) {
                            jsonF_R[post.user_class][post.user_name] = {
                                "pass": crypto.createHash('sha256').update(post.user_pass).digest('base64'),
                                "forename": post.forename,
                                "surname": post.surname
                            };
                            console.log("\n" + Date().toString() + ":\n" + JSON.stringify(jsonF_R));
                            fs.writeFile(rpath, JSON.stringify(jsonF_R), 'utf8', function(err) {
                                if (err) console.log("\n" + Date().toString() + ":\n" + err);
                                console.log("\n" + Date().toString() + ":\n" + 'Saved ' + rpath);
                            });
                            res.send(HTML_HEADEr()
                                .replace(/\{\{\{CNTNTS\}\}\}/gm, '<div class="container grid-960"><p>Added "' + post.user_name + '" to Register-Queue.</p><br><a class="btn btn-primary" href="/">Login here</a></div>'));
                        } else {
                            res.send(HTML_HEADEr()
                                .replace(/\{\{\{CNTNTS\}\}\}/gm, '<div class="container grid-960"><p>"' + post.user_name + '" (Class "' + post.user_class + '") already in Register-Queue.</p><br><a class="btn btn-primary" href="/">Login here</a></div>'));
                        }
                    });
                }
            } else {
                res.send(HTML_HEADEr()
                    .replace(/\{\{\{CNTNTS\}\}\}/gm, '<div class="container grid-960">Invalid Credentials: <pre>{' +
                        '\n&nbsp&nbsp&nbsp&nbspuser_class: ' + post.user_class +
                        '\n&nbsp&nbsp&nbsp&nbspforename: ' + post.forename + ' (min. 3 char)' +
                        '\n&nbsp&nbsp&nbsp&nbspsurname: ' + post.surname + ' (min. 3 char)' +
                        '\n&nbsp&nbsp&nbsp&nbsppassword.length: ' + post.user_pass.length + ' (min. 6 chars)' +
                        '\n}</pre><br><a class="btn btn-primary" href="">Back</a><div>'));
            }
        });
    }
});

// Login
app.post(/^(?:(?:\/|\/e\/(.+))?|(?:(?!\/register|\.js|\.css|\.ico|\.png|\.svg|\.jpg|\.jpeg).)*)$/, function(req, res) {
    console.log("\n" + Date().toString() + ":\n" + "POST-Login /");
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

                var dbfileN = dir + 'DB/Classes/' + post.user_class + '.json';
                var tryadmin = post.tryadmin || false;
                var jsonF_L;
                if (tryadmin === 'on' || tryadmin === true) {
                    tryadmin = true;
                    jsonF_L = jsonF_La;
                } else {
                    tryadmin = false;
                    if (jsonF_Lu.hasOwnProperty(dbfileN) !== false) {
                        jsonF_L = jsonF_Lu[dbfileN];
                        console.log("\n" + Date().toString() + ":\n" + dbfileN + ' already read');
                    } else {
                        jsonF_L = JSON.parse(fs.readFileSync(dbfileN, 'utf8'));
                        jsonF_Lu[dbfileN] = jsonF_L;
                        console.log("\n" + Date().toString() + ":\n" + 'read ' + dbfileN);
                    }
                }
                if (typeof jsonF_L === 'undefined') {
                    jsonF_L = JSON.parse(fs.readFileSync(dbfileN, 'utf8'));
                    jsonF_Lu[dbfileN] = jsonF_L;
                    console.log("\n" + Date().toString() + ":\n" + 'read ' + dbfileN);
                }
                var hash2 = crypto.createHash('sha256').update(post.user_pass).digest('base64');
                if (jsonF_L.hasOwnProperty(unameL) !== false && jsonF_L[unameL].pass === hash2) {
                    req.session.loggedin = true;
                    req.session.isadmin = tryadmin;
                    req.session.user_class = post.user_class;
                    req.session.user_name = post.user_name;
                    req.session.name = jsonF_L[unameL].surname + ', ' + jsonF_L[unameL].forename;
                    req.session.forename = jsonF_L[unameL].forename;
                    req.session.surname = jsonF_L[unameL].surname;

                    rPP(req, res);
                } else {
                    res.send(HTML_HEADEr()
                        .replace(/\{\{\{CNTNTS\}\}\}/gm, '<div class="container grid-960">Invalid Credentials: <pre>{' +
                            '\n&nbsp&nbsp&nbsp&nbspuser_class: ' + post.user_class +
                            '\n&nbsp&nbsp&nbsp&nbspuser_name: ' + post.user_name +
                            '\n&nbsp&nbsp&nbsp&nbsptryadmin: ' + tryadmin +
                            '\n}</pre><br><a class="btn btn-primary" href="">Back</a><div>'));
                }
            } else {
                res.send(HTML_HEADEr()
                    .replace(/\{\{\{CNTNTS\}\}\}/gm, '<div class="container grid-960">Invalid Credentials: <pre>{' +
                        '\n&nbsp&nbsp&nbsp&nbspuser_class: ' + post.user_class +
                        '\n&nbsp&nbsp&nbsp&nbspuser_name: ' + post.user_name +
                        '\n&nbsp&nbsp&nbsp&nbsptryadmin: ' + tryadmin +
                        '\n}</pre><br><a class="btn btn-primary" href="">Back</a><div>'));
            }
        });
    }
});

var HTMLSSs = {
    "HEADEr": dir + 'Cntnts/Header',
    "FOOTEr": dir + 'Cntnts/Footer',
    "NAVBAr": dir + 'Cntnts/Navbar',
    "login": dirP + 'login',
    "register": dirP + 'register',
    "A_registered": dirA + 'registered',
    "A_lists": dirA + 'lists',
    "A_listitemview": dirA + 'listitemview',
    "A_topcntnt_1": dirA + 'A_topcntnt_1',
    "A_bottomcntnt_1": dirA + 'A_bottomcntnt_1',
    "A_topcntnt_2_3": dirA + 'A_topcntnt_2_3',
    "A_bottomcntnt_2_3": dirA + 'A_bottomcntnt_2_3',
    "A_bottomcntnt_3": dirA + 'A_bottomcntnt_3',
    "userpanel": dirP + 'userpanel',
    "eventlist": dirP + 'eventlist',
    "eventgroup_grouped": dirP + 'eventgroup_grouped',
    "groupedeventsview": dirP + 'groupedeventsview',
    "event_grouped": dirP + 'event_grouped'
};
var HTML_HEADEr,
    HTML_FOOTEr,
    HTML_NAVBAr,
    HTML_login,
    HTML_register,
    HTML_A_registered,
    HTML_A_lists,
    HTML_A_listitemview,
    HTML_A_topcntnt_1,
    HTML_A_topcntnt_2_3,
    HTML_A_bottomcntnt_1,
    HTML_A_bottomcntnt_2_3,
    HTML_A_bottomcntnt_3,
    HTML_userpanel,
    HTML_eventlist,
    HTML_eventgroup_grouped,
    HTML_groupedeventsview,
    HTML_event_grouped;

// var xd = function() {
//     return fs.readFileSync(dirA + "adminpanel.min.html").toString();
// }

function HTMLgen(htmlSxP, htmlSyP) {
    eval('HTML_' + htmlSxP + ' = function() { return fs.readFileSync(htmlSyP + ".min.html").toString(); }');
    // eval('console.log("\n" + Date().toString() + ":\n" + HTML_' + htmlSxP + '());');
}

for (var htmlSx in HTMLSSs) {
    var htmlSy = HTMLSSs[htmlSx];
    // console.log("\n" + Date().toString() + ":\n" + "\n", htmlSx, htmlSy);
    HTMLgen(htmlSx, htmlSy);

    // eval('HTML_' + htmlSx + ' = \`' + fs.readFileSync(htmlSy + '.min.html').toString() + '\`;');
};

var jsonF_Lu = {};
var jsonF_La = JSON.parse(fs.readFileSync(dir + 'DB/Admins.json', 'utf8'));
var jsonF_R = JSON.parse(fs.readFileSync(dir + 'DB/Registerer.json', 'utf8'));

setInterval(function() {
    // TURN THESE INTO ASYNC readFile's. ......
    // This actually doesn't seem to work anymore with the new approach, as data then would be undefined whatsoever.
    for (var htmlSx in HTMLSSs) {
        var htmlSy = HTMLSSs[htmlSx];
        // console.log("\n" + Date().toString() + ":\n" + "\n", htmlSx, htmlSy);
        HTMLgen(htmlSx, htmlSy);

        // eval('HTML_' + htmlSx + ' = \`' + fs.readFileSync(htmlSy + '.min.html').toString() + '\`;');

        // eval('HTML_' + htmlSx + ' = \`' + fs.readFileSync(htmlSy + '.html').toString() + '\`;');

        // fs.readFile(htmlSy, 'utf8', function(err, data) {
        //     eval('HTML_' + htmlSx + ' = \`' + data.toString() + '\`;');
        // });
        // continue;
    };

    fs.readFile(dir + 'DB/Admins.json', 'utf8', function(err, data) {
        if (err) console.log("\n" + Date().toString() + ":\n" + err);
        jsonF_La = JSON.parse(data);
    });
    fs.readFile(dir + 'DB/Registerer.json', 'utf8', function(err, data) {
        if (err) console.log("\n" + Date().toString() + ":\n" + err);
        jsonF_R = JSON.parse(data);
    });
    for (var x in jsonF_Lu) {
        fs.readFile(x, 'utf8', function(err, data) {
            if (err) console.log("\n" + Date().toString() + ":\n" + err);
            jsonF_Lu[x] = JSON.parse(data);
            // console.log("\n" + Date().toString() + ":\n" + 'read ' + x);
        });
    }
}, 5000);