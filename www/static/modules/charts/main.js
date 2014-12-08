define([
    "chartjs", "knockout"
    ],
    function(Chart){
        function Panel(params){
            this.appl = params.appl;
            this.graph = null;
            this.sub = this.appl.broadcast.subscribe(function(obj){
                if(obj["opinion"] !== undefined){
                    this.graph.addData([obj.opinion], 0);
		        }
            }, this);
        }

        Panel.prototype.init = function(){
            var data = {
                labels:[0],
                datasets: {
                    label: "Opinion",
                    fillColor: "rgba(220,220,220,0)",
                    strokeColor: "rgba(220,220,220,1)",
                    pointColor: "rgba(220,220,220,1)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(220,220,220,1)",
                    data: [0]
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
          this.sub.dispose();
        };

        return Panel
    }
);