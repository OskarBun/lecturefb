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
            this.message_stat = ko.observable();
            this.data_stat = ko.observable();
            this.success = ko.observable();
            this.appl.componentsignal.datalen.add(this.data_stat);
            this.appl.componentsignal.messageslen.add(this.message_stat);
            this.appl.componentsignal.showlecture.add(this.recieve, this);
        }

        Panel.prototype.recieve = function(lecture, status) {
            if(status=="upcoming"){
                this.data_stat(0);
            }
            this.status(status);
            this.lecture(lecture);
        };

        Panel.prototype.delete_lecture = function(){
            this.appl.send("remove_lecture",
                {
                    "lecture_id": this.lecture().id
                },
                function (response) {
                    if (response.error) {
                        this.appl.error(response.error);
                        return;
                    }
                    this.success("Lecture delete");
                }.bind(this)
            );
        };

        Panel.prototype.dispose = function(){
            this.appl.componentsignal.messageslen.remove(this.message_stat);
            this.appl.componentsignal.showlecture.remove(this.lecture);
        };

        return Panel;
    }
);