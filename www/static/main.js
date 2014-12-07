require.config({
    urlArgs: "v=" + (new Date()).getTime(),
    baseUrl: "static",
    paths: {
        "jquery":   "bower_components/jquery/dist/jquery",
        "bootstrap": "bower_components/bootstrap/dist/js/bootstrap",
        "chartjs":  "lib/Chart.js/Chart",
        "knockout": "bower_components/knockout/dist/knockout.debug",
        "text":     "bower_components/requirejs-text/text"
    }
});

require([
    "jquery",
    "knockout",
    "./ws",
    "bootstrap"
    ],
    function($, ko, Appl){

        ko.components.register("charts", {
            viewModel: { require: "modules/charts/main" },
            template: { require: "text!modules/charts/main-tmpl.html" }
        });

        var appl = window.appl = new Appl();

        $(function(){
            appl.toggle_connection();
            ko.applyBindings(appl);
        });
    }
);