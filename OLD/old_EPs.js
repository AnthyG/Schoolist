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