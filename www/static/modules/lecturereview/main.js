/**
 * Created by OskarBunyan on 09/12/14.
 */
define([
    "knockout", "moment"
    ],
    function(ko, moment) {
        function Panel(params) {
            this.appl = params.appl;
            this.moment = moment;
            this.lecture = ko.observable();
            this.appl.componentsignal.showlecture.add(this.lecture);
        }

        Panel.prototype.dispose = function(){
            this.appl.componentsignal.showlecture.remove(this.lecture);
        };

        return Panel;
    }
);