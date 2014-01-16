(function () {
    var app = angular.module("Genius", []);
    app.directive("gnModel", function () {
        return {
            scope: {
                gnModel: "="
            },
            link: function (scope, elem, attrs) {
                elem.val(scope.gnModel());
                elem.bind("keyup", function () {
                    scope.gnModel(elem.val());
                    scope.$apply();
                });
            }
        };
    });
}());