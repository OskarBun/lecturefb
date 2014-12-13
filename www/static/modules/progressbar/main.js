/**
 * Created by OskarBunyan on 10/12/14.
 */
define([
    "knockout", "moment"
    ],
    function(ko, moment) {
        function Panel(params) {
            this.appl = params.appl;
            this.lecture = ko.observable(params.lecture);
            this.starts = ko.computed(function(){
                return moment(this.lecture().starts, "YYYY-MM-DD HH:mm:ss");
            }, this, {deferEvaluation : true });
            this.ends = ko.computed(function(){
                return moment(this.lecture().ends, "YYYY-MM-DD HH:mm:ss");
            }, this, {deferEvaluation : true });
            this.timer = null;
            this.now = ko.observable(moment());
            this.progresswidth = ko.computed(function (){
                var date = this.now();
                var minutesin = date.unix() - this.starts().unix();
                var duration =  this.ends().unix() - this.starts().unix();
                return (minutesin/duration)*100 + "%"
            }, this, {deferEvaluation : true });
            this.appl.componentsignal.showlecture.add(this.lecture);
        }

        Panel.prototype.isPending = function(){
            return this.starts().isAfter(this.now())
        };

        Panel.prototype.isActive = function(){
            return  this.now().isAfter(this.starts()) && this.ends().isAfter(this.now());
        };

        Panel.prototype.isEnded = function(){
            return this.now().isAfter(this.ends())
        };

        Panel.prototype.init = function(){
                this.start();
        };

        Panel.prototype.start = function(){
            if(this.isActive()) {
                this.timer = setInterval(this.increment.bind(this), 1000);
            }
        };

        Panel.prototype.increment = function(){
            this.now(moment());
            if(this.isEnded()){
                this.stop();
            }
        };

        Panel.prototype.stop = function(){
            if(this.timer){
                clearTimeout(this.timer);
                this.timer = null;
            }
        };

        Panel.prototype.dispose = function(){
            this.stop();
            this.appl.componentsignal.showlecture.remove(this.lecture)
        };

        return Panel;
    }
);