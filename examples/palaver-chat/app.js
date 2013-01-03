var express = require('express'),
    routes = require('./routes'),
    http = require('http'),
    connect = require('express/node_modules/connect'),
    app = express(),
    sessionSecret = "palaver-chat is the best",
    sessionKey = "palaver-chat.sid",
    cookieParser = express.cookieParser(sessionSecret),
    MongoStore = require('connect-mongo')(express),
    sessionStore = new MongoStore({
        db: 'palaver'
    }),
    server = http.createServer(app),
    io = require('socket.io').listen(server),
    passport = require('passport'),
    flash = require('connect-flash'),
    db = require('mongojs')('palaver'),
    utils = require('./utils')
    Palaver = require('../../'),


// Configuration
app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.logger());
    app.use(cookieParser);
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.session({ store: sessionStore, key: sessionKey }));
    app.use(flash());
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
    app.use(express.errorHandler());
});

app.get('/', utils.ensureAuthenticated, routes.index);

app.get('/logout', utils.ensureAuthenticated, function(req, res){
    req.logout();
    res.redirect('/');
});
app.get('/login', routes.login );

app.post('/login', passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login', failureFlash: true  }));

Palaver(io, passport, db, {
    sessionStore: sessionStore,
        sessionKey: sessionKey,
    sessionSecret: sessionSecret
});

server.listen(process.env.PORT || 3000)

console.log("Express server listening on port %d in %s mode", server.address().port, app.settings.env)