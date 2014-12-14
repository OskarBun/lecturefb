define([
    "knockout", "moment", "c3", "d3"
    ],
    function(ko, moment, c3){
        function Panel(params){
            this.appl = params.appl;
            this.chart = null;
            this.lecture = ko.observable(params.lecture);
            this.when = ["x", 0];
            this.data = ["speed", 0];
            this._duration = 50*60; //This is an internal variable used to create the x axis
            this.broadcast_sub = this.appl.broadcast.subscribe(function(message){
                if(message.signal=="lecture_issued"){
                    if(message.message.lecture_id==this.lecture().id){
                        this.when.push(message.message.issue[0]/60);
                        this.data.push(Number(message.message.issue[1].toFixed(2)));
                        this.chart.load({
                            columns: [
                                this.when,
                                this.data
                            ]
                        });
                    }
                }
            }, this);
            this.appl.componentsignal.showlecture.add(this.lecture);
            this.lecture.subscribe(function(){
                this.load_data();
            }, this);

        }

        Panel.prototype.init = function(){
            this.load_data();
            this.make_graph();
        };

        Panel.prototype.load_data = function(){
            function offset(){
                var date = moment();
                var starts = moment(this.lecture().starts, "YYYY-MM-DD HH:mm:ss");
                var ends =   moment(this.lecture().ends, "YYYY-MM-DD HH:mm:ss");
                var secondsin = date.unix() - starts.unix();
                var duration = this._duration = ends.unix() - starts.unix();
                if(secondsin>duration){
                    return duration
                } else {
                    return secondsin
                }
            }
            this.appl.send("lecture_timeseries",
                {
                    "lecture_id": this.lecture().id,
                    "when": offset.bind(this)()
                },
                function(response){
                    if(response.error){
                        this.appl.error(response.error);
                        return;
                    }
                    function clear(t, t1){
                        t.splice(2, t.length-2);
                        t1.forEach(function(time){
                            t.push(time);
                        });
                        return t;
                    }
                    clear(this.when, response.result.map(function(tuple){
                        return tuple[0]/60;
                    }));
                    clear(this.data, response.result.map(function(tuple){
                        return Number(tuple[1].toFixed(2));
                    }));
                    this.chart.load({
                        columns: [
                            this.when,
                            this.data
                        ]
                    });
                    this.appl.componentsignal.datalen.dispatch(response.result.length);
                }.bind(this)
            );
        };

        Panel.prototype.make_graph = function(){
            var x_axis_values = [], i = parseInt(this._duration/60, 10);
            while(i>0){
                x_axis_values.push(i);
                i -= 5;
            }
            var y_axis_values = [], j = 100;
            while(j>-100){
                y_axis_values.push(j);
                j -=1;
            }
            x_axis_values.push(0);
            console.log(x_axis_values);
            this.chart = c3.generate({
                data: {
                    x: 'x',
                    columns: [
                        this.when,
                        this.data
                    ]
                },
                axis: {
                    x: {
                        tick: {
                            values: x_axis_values
                        }
                    },
                    y: {
                        tick: {
                            values: y_axis_values
                        }
                    }
                }
            });
        };

        Panel.prototype.dispose = function(){
            this.broadcast_sub.dispose();
            this.appl.componentsignal.showlecture.remove(this.lecture)
        };

        return Panel
    }
);