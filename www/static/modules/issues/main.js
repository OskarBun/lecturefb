/**
 * Created by OskarBunyan on 09/12/14.
 */
define([
    "knockout", moment
    ],
    function(ko, moment){
        function Panel(params){
            this.appl = params.appl;
            this.lecture = ko.observable(params.lecture);
            this.moment = moment
            this.status = ko.observable();
            this.comment = ko.observable();
            this.success = ko.observable();
            this.appl.componentsignal.showlecture.add(this.recieve.bind(this));
        }

        Panel.prototype.recieve = function(lecture, status) {
            this.lecture(lecture);
            this.status(status);
        };

        //Todo disable buttons on status

        Panel.prototype.issue = function(type){
            function when(date){
                now = this.moment().unix();
                then = this.moment(date, "YYYY-MM-DD HH:mm:ss").unix();
                return now-then;
            }
            this.appl.send("new_lecture_issue",
                {
                    "value": type=="slow"? -1 : 1,
                    "lecture_id": this.lecture().id,
                    "when": when(this.lecture.starts),
                    "issue_id": type=="repeat"? 1 : 2
                },
                function(response){
                    if(response.error){
                        this.appl.error(response.error);
                        return;
                    }
                    this.success(type + " sent")
                }.bind(this)
            );
        };

        Panel.prototype.slow = function(){

        };

        Panel.prototype.repeat = function(){

        };

        Panel.prototype.dispose = function(){
            this.appl.componentsignal.showlecture.remove(this.recieve)
        };

        return Panel;
    }
);