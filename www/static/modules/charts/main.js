define([
    "knockout", "chartjs"
    ],
    function(ko, Chart){
        function Panel(params){
            this.appl = params.appl;
            this.graph = null;
            this.lecture = ko.observable(params.lecture);
            this.when = [];
            this.data = [];
            this.broadcast_sub = this.appl.broadcast.subscribe(function(message){
                if(message.signal=="lecture_issued"){
                    if(message.message.lecture_id==this.lecture().id && this.graph){
                        this.graph.addData([message.message.value], message.message.when)
                    }
                }
            }, this);
            this.appl.componentsignal.showlecture.add(this.lecture);
            this.lecture.subscribe(function(){
                this.load_data();
                this.graph.update();
            }, this);
        }

        Panel.prototype.init = function(){
            this.load_data();
            this.make_graph();
        };

        Panel.prototype.load_data = function(){
            this.appl.send("lecture_timeseries",
                {
                    "lecture_id": this.lecture().id
                },
                function(response){
                    if(response.error){
                        this.appl.error(response.error);
                        return;
                    }
                    this.when = response.result.map(function(timeseries){
                        return timeseries.when
                    });
                    this.data = response.result.map(function(timeseries){
                        return timeseries.value
                    })
                }.bind(this)
            );
        };

        Panel.prototype.make_graph = function(){
            var data = {
                labels:this.when,
                datasets: {
                    label: "Opinion",
                    fillColor: "rgba(220,220,220,0)",
                    strokeColor: "rgba(220,220,220,1)",
                    pointColor: "rgba(220,220,220,1)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(220,220,220,1)",
                    data: this.data
                }
            };
            var options = {


                showScale : true,
                pointDot : true,
                datasetFill : false
            };
            var ctx = document.getElementById("opGraph").getContext("2d");
            this.graph = new Chart(ctx).Line(data, options);
        };

        Panel.prototype.dispose = function(){
            this.appl.broadcast.dispose(this.broadcast_sub);
            this.appl.componentsignal.showlecture.remove(this.lecture)
        };

        return Panel
    }
);