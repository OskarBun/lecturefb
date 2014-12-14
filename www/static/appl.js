define([
        "knockout", "./connection", "crossroads", "hasher"
    ],
    function (ko, Connect, crossroads, hasher) {

        function Appl() {
            this.title = ko.observable("Lecture Feedback");
            this.connection = new Connect();
            this.user = ko.observable();
            this.error = ko.observable();
            this.template = ko.observable();
            this.broadcast = this.connection.broadcast;
            this.broadcast.subscribe(function (obj) {
                if (obj["user"] !== undefined) {
                    this.user(obj.user);
                }
            }, this);
        }

        Appl.prototype.send = function (action, args, callback) {
            this.connection.send(action, args, callback);
        };


        Appl.prototype.start = function () {
            function parseHash(newHash, oldHash) {
                crossroads.parse(newHash);
            }

            hasher.initialized.add(parseHash); //parse initial hash
            hasher.changed.add(parseHash); //parse hash changes
            hasher.init(); //start listening for history change
        };

        Appl.prototype.addRoute = function(path, func){
            crossroads.addRoute(path, func);
        };

        Appl.prototype.goToRoute = function(path){
            hasher.setHash(path);
        };

        Appl.prototype.toggle_connection = function () {
            this.connection.toggle_connection();
        };

        return Appl;
    });

