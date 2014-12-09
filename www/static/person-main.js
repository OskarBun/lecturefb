/**
 * Created by OskarBunyan on 09/12/14.
 */
require.config({
    urlArgs: "v=" + (new Date()).getTime(),
    baseUrl: "static",
    paths: {
        "jquery":   "bower_components/jquery/dist/jquery",
        "bootstrap": "bower_components/bootstrap/dist/js/bootstrap",
        "chartjs":  "lib/Chart.js/Chart",
        "knockout": "bower_components/knockout/dist/knockout.debug",
        "text":     "bower_components/requirejs-text/text",
        "datetimepicker": "bower_components/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min",
        "kojqueryui":   "lib/ko-jqueryui",
        "moment":       "bower_components/moment/moment",
        "jssignals":    "bower_components/js-signals/dist/signals"
    }
});

require([
    "jquery",
    "knockout",
    "./appl",
    "bootstrap"
    ],
    function($, ko, Appl){

        ko.components.register("issues", {
            viewModel: { require: "modules/issues/main" },
            template: { require: "text!modules/issues/main-tmpl.html"}
        });

        var appl = window.appl = new Appl();

        $(function(){
            appl.toggle_connection();
            ko.applyBindings(appl);
        });
    }
);