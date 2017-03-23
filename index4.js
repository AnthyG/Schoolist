"use strict";

var express = require('express');
var serveStatic = require('serve-static');
var app = express();
var compress = require('compression');
app.use(compress());
// var server = require('http').createServer(app);
var port = process.env.PORT || 3001; // In Windows 'set PORT=3000&&node index.js'; In Linux 'PORT=3000 node index.js'
var fs = require('fs');

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

// server.listen(port, function() {
//     console.log("\n" + Date().toString() + ":\n" + "\n" + Date().toString() + ":\n" + 'Server listening at port %d', port);
// });
sserver.listen(sport, function() {
    console.log("\n" + Date().toString() + ":\n" + "\n" + Date().toString() + ":\n" + 'SServer listening at sport %d', sport);
});

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

function PP(req, res) {
    console.log("\n" + Date().toString() + ":\n" + "PANELPAGE");
    var sHTML = HTML_userpanel();

    if (isA(req)) {
        sHTML = sHTML
            .replace(/\{A_topcntnt\}/gm, HTML_A_topcntnt_1())
            .replace(/\{A_bottomcntnt\}/gm, HTML_A_bottomcntnt_1())
            .replace(/\{FROM_TEXT\}/gm, '(Admin)');
    } else {
        sHTML = sHTML
            .replace(/\{A_topcntnt\}/gm, '')
            .replace(/\{A_bottomcntnt\}/gm, '')
            .replace(/\{FROM_TEXT\}/gm, ' from {USER_CLASS}');
    }
    // var eventslist = '<li><a href="?eventg=Eventgroup 1">Event 1</a></li>';
    var eventgroupslist_HTML = '<h2>Eventsgroups:</h2><ul>';
    var eventgroups = JSON.parse(fs.readFileSync((dir + 'DB/Classes/' + req.session.user_class + '.json'), 'utf8')).eventgroups;
    // for (var x = 0; x < eventgroups.length; x++) {
    //     var EG = eventgroups[x];
    // }
    eventgroups.forEach(function(EG) {
        eventgroupslist_HTML += '<li><a href="/e/' + EG + '">' + EG + '</a></li>';
    });
    eventgroupslist_HTML += '</ul>';

    res.send(HTMLcmbnr(sHTML, req)
        .replace(/\{EVENTGROUPSLIST\}/gm, eventgroupslist_HTML));
    // res.send(HTML_HEADEr()
    //     .replace(/\{\{\{CNTNTS\}\}\}/gm, HTML_NAVBAr() + sHTML + HTML_FOOTEr())
    //     .replace(/\{NAVBARLEFT_LINK\}/gm, sHTML.match(/\{NAVBARLEFT_LINK\{((?:.|\n)*)\}\/NAVBARLEFT_LINK\}/)[1])
    //     .replace(/\{NAVBARLEFT_ICON\}/gm, sHTML.match(/\{NAVBARLEFT_ICON\{((?:.|\n)*)\}\/NAVBARLEFT_ICON\}/)[1])
    //     .replace(/\{NAVBAR_LINKS\}/gm, sHTML.match(/\{NAVBAR_LINKS\{((?:.|\n)*)\}\/NAVBAR_LINKS\}/)[1].replace(/(<li class="menu-item">|<\/li>)/gm, ''))
    //     .replace(/\{NAVBAR_LINKS_LI\}/gm, sHTML.match(/\{NAVBAR_LINKS\{((?:.|\n)*)\}\/NAVBAR_LINKS\}/)[1].replace(/(?:\ |(\"))btn(?:\-link)?/gm, '$1'))
    //     .replace(/\{NAVBAR\{((?:.|\n)*)\}\/NAVBAR\}/gm, '')
    //     .replace(/\{EVENTGROUPSLIST\}/gm, eventgroupslist_HTML)
    //     .replace(/\{USER_NAME\}/gm, req.session.user_name)
    //     .replace(/\{USER_FORENAME\}/gm, req.session.forename)
    //     .replace(/\{USER_SURNAME\}/gm, req.session.surname));
}

function EPs(req, res) {
    var psss = [];
    psss[0] = undefined;
    if (typeof req.params[0] !== 'undefined') {
        psss = req.params[0].split('/');
    }
    var fpathG = dir + 'DB/Eventgroups/' + psss[0] + '/group.json';
    var fpath = false;
    if (typeof psss[1] !== 'undefined' && typeof psss[1] !== 'null' && psss[1] !== '') {
        fpath = dir + 'DB/Eventgroups/' + psss[0] + '/' + psss[1] + '.json';
    }

    if (fs.existsSync(fpathG)) {
        var jsonFG = JSON.parse(fs.readFileSync(fpathG, 'utf8'));

        // CHECK IF CLASS EVEN HAS ACCESS TO EVENT,
        // OR IF ADMIN, CHECK IF ADMIN IS ABLE TO EDIT EVENT .. and so on

        if (jsonFG.classes.indexOf(req.session.user_class) !== -1) { // || (isA(req) && ISALLOWEDTOEDITEVENTGROUP/EVENT)
            if (fpath === false || fs.existsSync(fpath) === false) {
                console.log("\n" + Date().toString() + ":\n" + "EVENTGROUPPAGE");
                var sHTMLG = HTML_eventgroupview();

                var eventslist_HTML = '<h4>Events:</h4><ul>';
                var eventslist_arr = fs.readdirSync(dir + 'DB/Eventgroups/' + psss[0]);
                var notmissing_arr = {};
                eventslist_arr.forEach(function(E) {
                    if (E !== 'group.json') {
                        var E = E.slice(0, -5);
                        eventslist_HTML += '<li><a href="/e/' + psss[0] + '/' + E + '">' + E + '</a></li>';

                        if (!isA(req)) {
                            return;
                        }
                        var jsonF_E = JSON.parse(fs.readFileSync(dir + 'DB/Eventgroups/' + psss[0] + '/' + E + '.json', 'utf8'));
                        for (var Cx in jsonF_E.entries) {
                            var Cy = jsonF_E.entries[Cx];
                            if (!notmissing_arr.hasOwnProperty(Cx)) {
                                notmissing_arr[Cx] = [];
                            }
                            for (var Cyx in Cy) {
                                var Cyy = Cy[Cyx];
                                if (typeof Cyy !== 'undefined' && typeof Cyy !== 'null' && Cyy !== 'null' && Cyy !== '' && Cyy !== null) {
                                    notmissing_arr[Cx].push(Cyy);
                                } else {
                                    continue;
                                }
                            }
                        }
                    }
                });
                eventslist_HTML += '</ul>';

                if (isA(req)) {
                    console.log(notmissing_arr);
                    sHTMLG = sHTMLG
                        .replace(/\{A_topcntnt\}/gm, HTML_A_topcntnt_2())
                        .replace(/\{A_bottomcntnt\}/gm, HTML_A_bottomcntnt_2());

                    eventslist_HTML += '<h4>Missing Entries:</h4><dl>';
                    for (var Cx in jsonFG.classes) {
                        var Cy = jsonFG.classes[Cx];
                        var dbfileN = dir + 'DB/Classes/' + Cy + '.json';

                        var jsonF_C = JSON.parse(fs.readFileSync(dbfileN, 'utf8'));
                        jsonF_Lu[dbfileN] = jsonF_C;
                        console.log("\n" + Date().toString() + ":\n" + 'read ' + dbfileN);

                        eventslist_HTML += '<dl><dt>' + Cy + '</dt><dd><ul>';
                        for (var Cyx in jsonF_C) {
                            if (Cyx !== 'eventgroups') {
                                var Cyy = jsonF_C[Cyx];
                                if (typeof Cyy !== 'undefined' && typeof Cyy !== 'null' && Cyy !== 'null' && Cyy !== '' && Cyy !== null &&
                                    notmissing_arr[Cx].indexOf(Cyy.surname + ', ' + Cyy.forename) === -1) {
                                    // DER .indexOf HIER GEHT NICH, WEIL typeof notmissing_arr[Cx] === 'undefined' IS.
                                    eventslist_HTML += '<li>' + Cyy.surname + ', ' + Cyy.forename + ' (' + Cyx + ')</li>';
                                } else {
                                    continue;
                                }
                            }
                        }
                        eventslist_HTML += '</ul></dd>';
                    }
                    eventslist_HTML += '</dl>';
                } else {
                    sHTMLG = sHTMLG
                        .replace(/\{A_topcntnt\}/gm, '')
                        .replace(/\{A_bottomcntnt\}/gm, '');
                }

                res.send(HTMLcmbnr(sHTMLG, req)
                    .replace(/\{EVENTGROUP_TITLE\}/gm, jsonFG.title)
                    .replace(/\{DESCRIPTION\}/gm, jsonFG.desc)
                    .replace(/\{EVENTSLIST\}/gm, eventslist_HTML)
                    .replace(/\{TILL_DATE\}/gm, jsonFG.tdate)
                    .replace(/\{SELECTED_CLASSES\}/gm, jsonFG.classes.toString()));
                // res.send(HTML_HEADEr()
                //     .replace(/\{\{\{CNTNTS\}\}\}/gm, HTML_NAVBAr() + sHTMLG + HTML_FOOTEr())
                //     .replace(/\{NAVBARLEFT_LINK\}/gm, sHTMLG.match(/\{NAVBARLEFT_LINK\{((?:.|\n)*)\}\/NAVBARLEFT_LINK\}/)[1])
                //     .replace(/\{NAVBARLEFT_ICON\}/gm, sHTMLG.match(/\{NAVBARLEFT_ICON\{((?:.|\n)*)\}\/NAVBARLEFT_ICON\}/)[1])
                //     .replace(/\{NAVBAR_LINKS\}/gm, sHTMLG.match(/\{NAVBAR_LINKS\{((?:.|\n)*)\}\/NAVBAR_LINKS\}/)[1].replace(/(<li class="menu-item">|<\/li>)/gm, ''))
                //     .replace(/\{NAVBAR_LINKS_LI\}/gm, sHTMLG.match(/\{NAVBAR_LINKS\{((?:.|\n)*)\}\/NAVBAR_LINKS\}/)[1].replace(/(?:\ |(\"))btn(?:\-link)?/gm, '$1'))
                //     .replace(/\{NAVBAR\{((?:.|\n)*)\}\/NAVBAR\}/gm, '')
                //     .replace(/\{EVENTGROUP_TITLE\}/gm, jsonFG.title)
                //     .replace(/\{DESCRIPTION\}/gm, jsonFG.desc)
                //     .replace(/\{EVENTSLIST\}/gm, eventslist_HTML)
                //     .replace(/\{USER_NAME\}/gm, req.session.user_name)
                //     .replace(/\{USER_FORENAME\}/gm, req.session.forename)
                //     .replace(/\{USER_SURNAME\}/gm, req.session.surname)
                //     .replace(/\{TILL_DATE\}/gm, jsonFG.tdate)
                //     .replace(/\{SELECTED_CLASSES\}/gm, jsonFG.classes.toString()));
            } else {
                console.log("\n" + Date().toString() + ":\n" + "EVENTPAGE");
                if (fs.existsSync(fpath)) {
                    var sHTML = HTML_eventview();
                    var jsonF = JSON.parse(fs.readFileSync(fpath, 'utf8'));
                    var entrieslist_HTML = '';
                    var jsonfchanged = false;
                    var entsleft = jsonF.maxents;

                    var alreadyentried = false;
                    if (jsonF.entries.hasOwnProperty(req.session.user_class) !== false && typeof jsonF.entries[req.session.user_class] !== 'undefined') {
                        if (jsonF.entries[req.session.user_class].indexOf(req.session.name) !== -1) {
                            alreadyentried = true;
                        }
                    }

                    var isintime = false,
                        cdate = new Date();
                    if (cdate < new Date(jsonFG.tdate)) {
                        isintime = true;
                    }

                    // HIER MUSS DANN AUCH NOCH GECHECKT WERDN, OB der user in weniger Events sich eingetragn hat,
                    // als in jsonFG.maxeents steht. Wenn nein, muss er zuerst ein Event leaven!
                    if (req.query.jorl === 'true' && alreadyentried === false && isA(req) === false && isintime) {
                        // ADD USER TO ENTRIESLIST IF entsleft > 0 && IF cdate < tdate
                        console.log("\n" + Date().toString() + ":\n" + '"' + req.session.name + '" from "' + req.session.user_class + '" joined "' + jsonF.title + '"');
                        if (jsonF.entries.hasOwnProperty(req.session.user_class) === false &&
                            jsonFG.classes.indexOf(req.session.user_class) !== -1) {
                            jsonF.entries[req.session.user_class] = [];
                        }
                        jsonF.entries[req.session.user_class].push(req.session.name);
                        alreadyentried = true;
                        jsonfchanged = true;
                    } else if (req.query.jorl === 'false' && alreadyentried === true && isA(req) === false && isintime) {
                        console.log("\n" + Date().toString() + ":\n" + '"' + req.session.name + '" from "' + req.session.user_class + '" left "' + jsonF.title + '"');
                        delete jsonF.entries[req.session.user_class][jsonF.entries[req.session.user_class].indexOf(req.session.name)];
                        alreadyentried = false;
                        jsonfchanged = true;
                    } else if ((req.query.jorl === 'true' || req.query.jorl === 'false') && !isintime) {
                        console.log("\n" + Date().toString() + ":\n" + '"' + req.session.name + '" from "' + req.session.user_class + '" couldn\'t join/leave "' + jsonF.title + '" because cdate > tdate');
                        res.redirect(removeURLParameter(req.originalUrl, 'jorl'));
                        res.end();
                        return false;
                    } else if (typeof req.query.jorl === 'undefined' || typeof req.query.jorl !== 'null' || req.query.jorl !== '') {} else {
                        console.log("\n" + Date().toString() + ":\n" + 'Something went horribly wrong when "' + req.session.name + '" from "' + req.session.user_class + '" performed an jorl-action on "' + jsonF.title + '"');
                    }

                    if (jsonfchanged) {
                        fs.writeFile(fpath, JSON.stringify(jsonF), 'utf8', function(err) {
                            if (err) console.log("\n" + Date().toString() + ":\n" + err);
                            console.log("\n" + Date().toString() + ":\n" + 'Saved ' + fpath);
                        });
                        res.redirect(removeURLParameter(req.originalUrl, 'jorl'));
                        res.end();
                        return false;
                    }

                    entrieslist_HTML += '<dl>';
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
                        entrieslist_HTML += '</ul></dd>';
                    }
                    entrieslist_HTML += '</dl>';

                    var entrybtn = '';
                    if (isA(req)) {
                        sHTML = sHTML
                            .replace(/\{A_topcntnt\}/gm, HTML_A_topcntnt_3())
                            .replace(/\{A_bottomcntnt\}/gm, HTML_A_bottomcntnt_3());
                    }
                    if (!isA(req) && isintime) {
                        entrybtn += '<a class="btn';
                        if (!alreadyentried) {
                            entrybtn += ' btn-primary" href="' + removeURLParameter(req.originalUrl, 'jorl') + '?jorl=true">Join this';
                        } else {
                            entrybtn += '" href="' + removeURLParameter(req.originalUrl, 'jorl') + '?jorl=false">Leave this';
                        }
                        entrybtn += '</a>';

                        sHTML = sHTML
                            .replace(/\{A_topcntnt\}/gm, '')
                            .replace(/\{A_bottomcntnt\}/gm, '');
                    } else if (!isintime) {
                        entrybtn += '<h4><b>This Event is over!</b></h4>';

                        sHTML = sHTML
                            .replace(/\{A_topcntnt\}/gm, '')
                            .replace(/\{A_bottomcntnt\}/gm, '');
                    }

                    res.send(HTMLcmbnr(sHTML, req)
                        .replace(/\{EVENTGROUP_TITLE\}/gm, jsonFG.title)
                        .replace(/\{EVENT_TITLE\}/gm, jsonF.title)
                        .replace(/\{DESCRIPTION\}/gm, jsonF.desc)
                        .replace(/\{MAXENTS\}/gm, jsonF.maxents)
                        .replace(/\{ENTSLEFT\}/gm, entsleft)
                        .replace(/\{ENTRYBTN\}/gm, entrybtn)
                        .replace(/\{ENTRIESLIST\}/gm, entrieslist_HTML)
                        .replace(/\{TILL_DATE\}/gm, jsonFG.tdate)
                        .replace(/\{SELECTED_CLASSES\}/gm, jsonFG.classes.toString()));
                    // res.send(HTML_HEADEr()
                    //     .replace(/\{\{\{CNTNTS\}\}\}/gm, HTML_NAVBAr() + sHTML + HTML_FOOTEr())
                    //     .replace(/\{NAVBARLEFT_LINK\}/gm, sHTML.match(/\{NAVBARLEFT_LINK\{((?:.|\n)*)\}\/NAVBARLEFT_LINK\}/)[1])
                    //     .replace(/\{NAVBARLEFT_ICON\}/gm, sHTML.match(/\{NAVBARLEFT_ICON\{((?:.|\n)*)\}\/NAVBARLEFT_ICON\}/)[1])
                    //     .replace(/\{NAVBAR_LINKS\}/gm, sHTML.match(/\{NAVBAR_LINKS\{((?:.|\n)*)\}\/NAVBAR_LINKS\}/)[1].replace(/(<li class="menu-item">|<\/li>)/gm, ''))
                    //     .replace(/\{NAVBAR_LINKS_LI\}/gm, sHTML.match(/\{NAVBAR_LINKS\{((?:.|\n)*)\}\/NAVBAR_LINKS\}/)[1].replace(/(?:\ |(\"))btn(?:\-link)?/gm, '$1'))
                    //     .replace(/\{NAVBAR\{((?:.|\n)*)\}\/NAVBAR\}/gm, '')
                    //     .replace(/\{EVENTGROUP_TITLE\}/gm, jsonFG.title)
                    //     .replace(/\{EVENT_TITLE\}/gm, jsonF.title)
                    //     .replace(/\{DESCRIPTION\}/gm, jsonF.desc)
                    //     .replace(/\{MAXENTS\}/gm, jsonF.maxents)
                    //     .replace(/\{ENTSLEFT\}/gm, entsleft)
                    //     .replace(/\{ENTRYBTN\}/gm, entrybtn)
                    //     .replace(/\{ENTRIESLIST\}/gm, entrieslist_HTML)
                    //     .replace(/\{USER_NAME\}/gm, req.session.user_name)
                    //     .replace(/\{USER_FORENAME\}/gm, req.session.forename)
                    //     .replace(/\{USER_SURNAME\}/gm, req.session.surname)
                    //     .replace(/\{TILL_DATE\}/gm, jsonFG.tdate)
                    //     .replace(/\{SELECTED_CLASSES\}/gm, jsonFG.classes.toString()));
                } else {
                    res.send(HTML_HEADEr()
                        .replace(/\{\{\{CNTNTS\}\}\}/gm, '<div class="container grid-960"><p>This Event does not exist!</p><br><a class="btn btn-primary" href="/e/' + jsonFG.title + '">Back</a><div>'));
                }
            }
        } else if (isLI(req)) {
            res.send(HTML_HEADEr()
                .replace(/\{\{\{CNTNTS\}\}\}/gm, '<div class="container grid-960"><p>You don\'t have access to this Event/Eventgroup!</p><br><a class="btn btn-primary" href="/">Back</a><div>'));
        } else {
            res.redirect('/');
        }
    } else {
        PP(req, res);
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

    var class_options_HTML = '';
    var classes_arr = ACs(req);
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
            if (Ux !== "eventgroups") {
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
        // res.send(HTML_HEADEr()
        //     .replace(/\{\{\{CNTNTS\}\}\}/gm, HTML_NAVBAr() + sHTML + HTML_FOOTEr())
        //     .replace(/\{NAVBARLEFT_LINK\}/gm, sHTML.match(/\{NAVBARLEFT_LINK\{((?:.|\n)*)\}\/NAVBARLEFT_LINK\}/)[1])
        //     .replace(/\{NAVBARLEFT_ICON\}/gm, sHTML.match(/\{NAVBARLEFT_ICON\{((?:.|\n)*)\}\/NAVBARLEFT_ICON\}/)[1])
        //     .replace(/\{NAVBAR_LINKS\}/gm, sHTML.match(/\{NAVBAR_LINKS\{((?:.|\n)*)\}\/NAVBAR_LINKS\}/)[1].replace(/(<li class="menu-item">|<\/li>)/gm, ''))
        //     .replace(/\{NAVBAR_LINKS_LI\}/gm, sHTML.match(/\{NAVBAR_LINKS\{((?:.|\n)*)\}\/NAVBAR_LINKS\}/)[1].replace(/(?:\ |(\"))btn(?:\-link)?/gm, '$1'))
        //     .replace(/\{NAVBAR\{((?:.|\n)*)\}\/NAVBAR\}/gm, '')
        //     .replace(/\{CLASS_OPTIONS\}/gm, class_options_HTML)
        //     .replace(/\{CURRENT_CLASS\}/gm, prms[1])
        //     .replace(/\{USERS_LIST_ALREADY\}/gm, userslistalready_HTML)
        //     .replace(/\{USERS_LIST_WAITING\}/gm, userslistwaiting_HTML)
        //     .replace(/\{USER_NAME\}/gm, req.session.user_name)
        //     .replace(/\{USER_FORENAME\}/gm, req.session.forename)
        //     .replace(/\{USER_SURNAME\}/gm, req.session.surname));
    } else {
        res.send(HTMLcmbnr(sHTML, req)
            .replace(/\{CLASS_OPTIONS\}/gm, class_options_HTML)
            .replace(/\{CURRENT_CLASS\}/gm, 'null')
            .replace(/\{USERS_LIST_ALREADY\}/gm, userslistalready_HTML)
            .replace(/\{USERS_LIST_WAITING\}/gm, userslistwaiting_HTML)
            .replace(/\{USER_NAME\}/gm, req.session.user_name));
        // res.send(HTML_HEADEr()
        //     .replace(/\{\{\{CNTNTS\}\}\}/gm, HTML_NAVBAr() + sHTML + HTML_FOOTEr())
        //     .replace(/\{NAVBARLEFT_LINK\}/gm, sHTML.match(/\{NAVBARLEFT_LINK\{((?:.|\n)*)\}\/NAVBARLEFT_LINK\}/)[1])
        //     .replace(/\{NAVBARLEFT_ICON\}/gm, sHTML.match(/\{NAVBARLEFT_ICON\{((?:.|\n)*)\}\/NAVBARLEFT_ICON\}/)[1])
        //     .replace(/\{NAVBAR_LINKS\}/gm, sHTML.match(/\{NAVBAR_LINKS\{((?:.|\n)*)\}\/NAVBAR_LINKS\}/)[1].replace(/(<li class="menu-item">|<\/li>)/gm, ''))
        //     .replace(/\{NAVBAR_LINKS_LI\}/gm, sHTML.match(/\{NAVBAR_LINKS\{((?:.|\n)*)\}\/NAVBAR_LINKS\}/)[1].replace(/(?:\ |(\"))btn(?:\-link)?/gm, '$1'))
        //     .replace(/\{NAVBAR\{((?:.|\n)*)\}\/NAVBAR\}/gm, '')
        //     .replace(/\{CLASS_OPTIONS\}/gm, class_options_HTML)
        //     .replace(/\{CURRENT_CLASS\}/gm, 'null')
        //     .replace(/\{USERS_LIST_ALREADY\}/gm, '<b>Please select a class</b>')
        //     .replace(/\{USERS_LIST_WAITING\}/gm, '<b>Please select a class</b>')
        //     .replace(/\{USER_NAME\}/gm, req.session.user_name)
        //     .replace(/\{USER_FORENAME\}/gm, req.session.forename)
        //     .replace(/\{USER_SURNAME\}/gm, req.session.surname));
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

app.post(/^(?:(?:\/|\/e\/(.+))?|(?:(?!\/mc(?:.*)?|\/register(?:.*)?).)*)$/, function(req, res, next) { // ^\/e(?:(?:\/)?(.+))?$
    var psss = [];
    psss[0] = undefined;
    if (typeof req.params[0] !== 'undefined') {
        psss = req.params[0].split('/');
    }
    console.log("\n" + Date().toString() + ":\n" + "POST (hpflly /e) " + req.params[0]);
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

            if (typeof post["neg-FORM"] !== 'undefined' &&
                typeof post.neg_title !== 'undefined' && typeof post.neg_title !== 'null' && post.neg_title !== '' &&
                typeof post.neg_desc !== 'undefined' && typeof post.neg_desc !== 'null' && post.neg_desc !== '' &&
                typeof post.neg_selected !== 'undefined' && typeof post.neg_selected !== 'null' && post.neg_selected !== '' &&
                typeof post.neg_tdate !== 'undefined' && typeof post.neg_tdate !== 'null' && post.neg_tdate !== '' &&
                typeof post.neg_maxeents !== 'undefined' && typeof post.neg_maxeents !== 'null' && post.neg_maxeents !== '') {
                // Create new Eventgroup
                // ALSO HAS TO CHECK IF ADMIN HAS PERMISSIONS FOR THAT CLASS!!!

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
                        title: post.neg_title,
                        desc: post.neg_desc,
                        classes: p_selected_arr,
                        tdate: post.neg_tdate,
                        maxeents: post.neg_maxeents
                    };

                    fs.mkdirSync(dpath);
                    fs.writeFile(fpath, JSON.stringify(jsonF), 'utf8', function(err) {
                        if (err) console.log("\n" + Date().toString() + ":\n" + err);
                        console.log("\n" + Date().toString() + ":\n" + 'Saved ' + fpath);
                    });
                }

                // var sHTML = post.neg_title + ' :: ' + post.neg_desc + ' :: ' + post.neg_selected;
                // res.send(HTML_HEADEr + sHTML);
            } else if (typeof post["ne-FORM"] !== 'undefined' &&
                typeof post.ne_title !== 'undefined' && typeof post.ne_title !== 'null' && post.ne_title !== '' && post.ne_title !== 'group' &&
                typeof post.ne_desc !== 'undefined' && typeof post.ne_desc !== 'null' && post.ne_desc !== '' &&
                typeof post.ne_maxents !== 'undefined' && typeof post.ne_maxents !== 'null' && post.ne_maxents !== '' &&
                typeof psss[0] !== 'undefined' && typeof psss[0] !== 'null' && psss[0] !== '') {
                // Create new Event

                var dpath = dir + 'DB/Eventgroups/' + psss[0];
                var fpath = dpath + '/' + post.ne_title + '.json';
                if (fs.existsSync(fpath) === false) {
                    var jsonF = {
                        title: post.ne_title,
                        desc: post.ne_desc,
                        maxents: post.ne_maxents,
                        entries: {}
                    };

                    fs.writeFile(fpath, JSON.stringify(jsonF), 'utf8', function(err) {
                        if (err) console.log("\n" + Date().toString() + ":\n" + err);
                        console.log("\n" + Date().toString() + ":\n" + 'Saved ' + fpath);
                    });
                }
            } else if (typeof post["eeg-FORM"] !== 'undefined' &&
                typeof post.eeg_title !== 'undefined' && typeof post.eeg_title !== 'null' && post.eeg_title !== '' &&
                typeof post.eeg_desc !== 'undefined' && typeof post.eeg_desc !== 'null' && post.eeg_desc !== '' &&
                typeof post.eeg_selected !== 'undefined' && typeof post.eeg_selected !== 'null' && post.eeg_selected !== '' &&
                typeof post.eeg_tdate !== 'undefined' && typeof post.eeg_tdate !== 'null' && post.eeg_tdate !== '' &&
                typeof post.eeg_maxeents !== 'undefined' && typeof post.eeg_maxeents !== 'null' && post.eeg_maxeents !== '') {
                // Edit Eventgroup

                var dpath = dir + 'DB/Eventgroups/' + post.eeg_title;
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

                    var jsonF = {
                        title: post.eeg_title,
                        desc: post.eeg_desc,
                        classes: p_selected_arr,
                        tdate: post.eeg_tdate,
                        maxeents: post.eeg_maxeents
                    };

                    fs.writeFile(fpath, JSON.stringify(jsonF), 'utf8', function(err) {
                        if (err) console.log("\n" + Date().toString() + ":\n" + err);
                        console.log("\n" + Date().toString() + ":\n" + 'Saved ' + fpath);
                    });
                }
            } else if (typeof post["ee-FORM"] !== 'undefined' &&
                typeof post.ee_title !== 'undefined' && typeof post.ee_title !== 'null' && post.ee_title !== '' && post.ee_title !== 'group' &&
                typeof post.ee_desc !== 'undefined' && typeof post.ee_desc !== 'null' && post.ee_desc !== '' &&
                typeof post.ee_maxents !== 'undefined' && typeof post.ee_maxents !== 'null' && post.ee_maxents !== '' &&
                typeof psss[0] !== 'undefined' && typeof psss[0] !== 'null' && psss[0] !== '') {
                // Edit Event

                /*
                EIG IS DAT JA UNSINNICH, SCHLIEßLICH KÖNNTE MAN JA AUCH NUR EINE SACHE EDITIERN ..WOLLEN.. (mit API halt)
                UND DANN MUSS MAN JA NICH FÜR ALLE TESTEN, ODER?!
                
                AUF JEDN FALL MUSS ICH AUCH NOCH NE MÖGLICHKEIT FINDN, WIE'ER DANN DAT MIT DEM RENAMEN MACHT x_x
                */
                // Create new Event

                var dpath = dir + 'DB/Eventgroups/' + psss[0];
                var fpath = dpath + '/' + post.ee_title + '.json';
                if (fs.existsSync(fpath) === false) {
                    var jsonF = {
                        title: post.ee_title,
                        desc: post.ee_desc,
                        maxents: post.ee_maxents,
                        entries: {}
                    };

                    fs.writeFile(fpath, JSON.stringify(jsonF), 'utf8', function(err) {
                        if (err) console.log("\n" + Date().toString() + ":\n" + err);
                        console.log("\n" + Date().toString() + ":\n" + 'Saved ' + fpath);
                    });
                }
            } else {
                res.send(HTML_HEADEr() + JSON.stringify(post));
                var blocked = true;
            }

            if (blocked !== true) {
                res.redirect(req.originalUrl);
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
        if (isA(req) && prms[0] === 'mc') {
            console.log("\n" + Date().toString() + ":\n" + "G* MCP");
            MCP(req, res);
        } else {
            next();
        }
    } else if (prms[0] === 'register') {
        RP(res);
    } else {
        LP(res);
    }
});

// Check if logged in and do actions accordingly
app.get(/^(?:(?:\/|\/e\/(.+))?|(?:(?!\.js|\.css|\.ico|\.png|\.svg|\.jpg|\.jpeg).)*)$/, function(req, res) {
    var psss = [];
    psss[0] = undefined;
    if (typeof req.params[0] !== 'undefined') {
        psss = req.params[0].split('/');
    }
    console.log("\n" + Date().toString() + ":\n" + "GET almost *");
    // fetchHash(req.protocol + '://' + req.get('host') + req.originalUrl);
    // console.log("\n" + Date().toString() + ":\n" + req.query);
    if (isLI(req)) {
        if (typeof psss[0] !== 'undefined' && typeof psss[0] !== 'null') {
            console.log("\n" + Date().toString() + ":\n" + "Gf* EPs");
            EPs(req, res);
        } else {
            console.log("\n" + Date().toString() + ":\n" + "Gf* PP");
            PP(req, res);
        }
    } else {
        console.log("\n" + Date().toString() + ":\n" + "Gf* LP");
        LP(res);
    }
});

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
//         EPs(req, res);
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
    "A_topcntnt_1": dirA + 'A_topcntnt_1',
    "A_bottomcntnt_1": dirA + 'A_bottomcntnt_1',
    "A_topcntnt_2": dirA + 'A_topcntnt_2',
    "A_bottomcntnt_2": dirA + 'A_bottomcntnt_2',
    "A_topcntnt_3": dirA + 'A_topcntnt_3',
    "A_bottomcntnt_3": dirA + 'A_bottomcntnt_3',
    "userpanel": dirP + 'userpanel',
    "eventgroupview": dirP + 'eventgroupview',
    "eventview": dirP + 'eventview'
};
var HTML_HEADEr,
    HTML_FOOTEr,
    HTML_NAVBAr,
    HTML_login,
    HTML_register,
    HTML_A_registered,
    HTML_A_topcntnt_1,
    HTML_A_topcntnt_2,
    HTML_A_topcntnt_3,
    HTML_A_bottomcntnt_1,
    HTML_A_bottomcntnt_2,
    HTML_A_bottomcntnt_3,
    HTML_userpanel,
    HTML_eventgroupview,
    HTML_eventview;

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