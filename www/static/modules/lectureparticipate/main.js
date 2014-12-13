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
            this.status = ko.observable();
            this.message = ko.observable();
            this.comment = ko.observable();
            this.success = ko.observable();
            this.type_hold = null;
            this.appl.componentsignal.showlecture.add(this.recieve.bind(this));
        }

        Panel.prototype.recieve = function(lecture, status) {
            this.lecture(lecture);
            this.status(status);
        };

        Panel.prototype.new_transcript = function(type){
            if(this.status()=="upcoming"&& type=="informal"){
                return;
            }
            this.appl.send("new_lecture_transcript",
                {
                    "lecture_id": this.lecture().id,
                    "comment": type=="formal"? this.comment : this.message,
                    "type": type
                },
                function(response){
                    if(response.error){
                        this.appl.error(response.error);
                        return;
                    }
                    if(this.type_hold == 'informal'){
                        this.message('');
                    } else {
                        this.comment('');
                    }
                }.bind(this)
            );
            this.type_hold = type;
        };

        Panel.prototype.dispose = function(){
            this.appl.componentsignal.showlecture.remove(this.recieve);
        };

        return Panel;
    }
);