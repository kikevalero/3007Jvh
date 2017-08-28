#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
var session = require('express-session');
var fs      = require('fs');
var bodyParser = require('body-parser');
var connect = require('connect');
var jsonfile = require('jsonfile');
//var https = require('https');
//var http = require('http');

//key https
//var privateKey  = fs.readFileSync('/srtodero.com.key', 'utf8');
//var certificate = fs.readFileSync('/srtodero.com.csr', 'utf8');
//var credentials = {key: privateKey, cert: certificate};


// Controlador requires
// var UsuarioController = require(__dirname + "/controller/usuarioController.js");
// var BannersController = require(__dirname + "/controller/bannersController.js");
// var ServiciosActivosController = require(__dirname + "/controller/serviciosActivosController.js");
// var NewsController = require(__dirname + "/controller/newsController.js");
// var CityController = require(__dirname + "/controller/cityController.js");
// var MensajesController = require(__dirname + "/controller/mensajesController.js");
// var ServiciosTipoController = require(__dirname + "/controller/serviciosTipoController.js");
// var ToderosController = require(__dirname + "/controller/toderosController.js");
// var DiagnosticoController = require(__dirname + "/controller/diagnosticoController.js");
// var FerreteriaController = require(__dirname + "/controller/ferreteriasController.js");
// var ServiciosXserviciosController = require(__dirname + "/controller/serviciosXserviciosController.js");
// var FacturasController = require(__dirname + "/controller/facturasController.js");
/**
 *  Define the sample application.
 */
var SampleApp = function() {

    //  Scope.
    var self = this;


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP ? process.env.OPENSHIFT_NODEJS_IP : process.env.IP || "0.0.0.0";
        self.port      = process.env.OPENSHIFT_NODEJS_PORT ? process.env.OPENSHIFT_NODEJS_PORT || 8080 : process.env.PORT || 3000;
        //self.portssl   =  9443;

        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        };
    };


    /**
     *  Populate the cache.
     */
    self.populateCache = function() {
        if (typeof self.zcache === "undefined") {
            self.zcache = { 'index.html': '' };
        }

        //  Local cache for static content.
        self.zcache['index.html'] = fs.readFileSync('./index.html');
    };

 
    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function(key) { return self.zcache[key]; };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating sample app ...',
                       Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function() {
        self.routes = [];
        // self.routes = UsuarioController(self.routes);
        // self.routes = BannersController(self.routes);
        // self.routes = ServiciosTipoController(self.routes);
        // self.routes = ServiciosActivosController(self.routes);
        // self.routes = NewsController(self.routes);
        // self.routes = CityController(self.routes);
        // self.routes = MensajesController(self.routes);
        // self.routes = ToderosController(self.routes);
        // self.routes = DiagnosticoController(self.routes);
        // self.routes = FerreteriaController(self.routes);
        // self.routes = ServiciosXserviciosController(self.routes);
        // self.routes = FacturasController(self.routes);
    };


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.createRoutes();
        self.app = express.createServer();
        self.app.use(express.static(__dirname + '/public'));
        self.app.use(bodyParser.urlencoded({extended: false}));
        self.app.use(bodyParser.json());
        self.app.use(express.cookieParser());
        self.app.use(session({secret: '1234567890QWERTY'}));
        
        
        /**self.app.use(function (req, res, next) {
          res.status(404).send('');
        })**/
        
        for (var r in self.routes) {
            console.log("agregando rutas");
            
            
            if (self.routes[r].type == "GET") {
                console.log("tipo:"+self.routes[r].type);
                console.log("path:"+self.routes[r].path);
               self.app.get(self.routes[r].path, self.routes[r].func);
               //self.appssl.get(self.routes[r].path, self.routes[r].func);

            }
            
            if (self.routes[r].type == "POST") {
                self.app.post(self.routes[r].path, self.routes[r].func);
            }
            
            if (self.routes[r].type == "PUT") {
                if (self.routes[r].middleware) {
                    self.app.put(self.routes[r].path, self.routes[r].middleware, self.routes[r].func);
                } else {
                    self.app.put(self.routes[r].path, self.routes[r].func);
                }
            }
            
            if (self.routes[r].type == "DELETE") {
                self.app.delete(self.routes[r].path, self.routes[r].func);
            }
        }
    };

  
    
    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.populateCache();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };


    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), self.ipaddress, self.port);
        });
    };
    
   

};   /*  Sample Application.  */



/**
 *  main():  Main code.
 */
var zapp = new SampleApp();
zapp.initialize();
zapp.start();

