/**
 * Created by starov on 05.09.14.
 */
fruitStory.directive("feed", function() {
    return {
        restrict: "A",
        templateUrl: 'partials/feed.html',
        scope: {
            mtd:'=',
            feed:'=feedSource',
            rating:'=feedRating',
            ratingMode:'=feedRatingMode',
            persona:'='
        },
        controller: function ($scope) {

            $scope.mtd.addToFeed = function (saying) {
                var said;
                if (saying) {

                    said = angular.copy(saying);
                    saying.text='';
                    saying.title='';
                    saying.letters='';
                    saying.image='';
                    said.letters=convertLetters(said.letters);
                    said.author=$scope.mtd.persona;
                    said.time=Date.now();
                    $scope.feed.push(said);
                    // may be a container for NEW sayings
                    //  $scope.new[$scope.feedTitle]=$scope.new[$scope.feedTitle] || [];
                    //  $scope.new[$scope.feedTitle].push(said);
                }

                $scope.updateTree();
            };

            $scope.updateTree=function () {
                $scope.tree=convertStory($scope.feed);
                $scope.JSON=JSON.stringify($scope.feed, '',4);
                $scope.source=$scope.tree;
            };

            $scope.$watch('feed', function () {
                $scope.updateTree();
            });

            $scope.reset = function () {
                localStorage.clear();
                $scope.rating={};
                $scope.ratingMode={news:true,plus:true,zero:true,minus:false};
            };

            $scope.rate={};
            $scope.rate.rating = $scope.rating;
            $scope.rate.plus=function (letters) {
                if (angular.isObject(letters)) {letters=letters.letters;}
                $scope.rating[letters] = $scope.rating[letters] || {pluses:0,zeros:0,minuses:0};
                $scope.rating[letters].pluses++;
            };
            $scope.rate.minus=function (letters) {
                if (angular.isObject(letters)) {letters=letters.letters;}
                $scope.rating[letters] = $scope.rating[letters] || {pluses:0,zeros:0,minuses:0};
                $scope.rating[letters].minuses++;
            };
            $scope.rate.zero=function (letters) {
                if (angular.isObject(letters)) {letters=letters.letters;}
                $scope.rating[letters] = $scope.rating[letters] || {pluses:0,zeros:0,minuses:0};
                $scope.rating[letters].zeros++;
            };
            $scope.rate.getPluses=function (letters) {
                if ($scope.rating[letters] && $scope.rating[letters].pluses>$scope.rating[letters].minuses) {
                    return $scope.rating[letters].pluses - $scope.rating[letters].minuses;
                } else return '';
            };
            $scope.rate.getMinuses=function (letters) {
                if ($scope.rating[letters] && $scope.rating[letters].pluses<$scope.rating[letters].minuses) {
                    return $scope.rating[letters].minuses - $scope.rating[letters].pluses
                }
                else return '';
            };
            $scope.rate.getZeros=function (letters) {
                if ($scope.rating[letters]) {return $scope.rating[letters].zeros+$scope.rating[letters].pluses+$scope.rating[letters].minuses}
                else return '';
            };
            $scope.rate.getRating = function (letters) {
                if($scope.rating[letters]) {return $scope.rating[letters].pluses-$scope.rating[letters].minuses}
                return 0;
            };
            $scope.rate.ratingSort = function (phrase) {
                if($scope.rating[phrase.letters]) {
                    return (-$scope.rating[phrase.letters].pluses+$scope.rating[phrase.letters].minuses);
                };
                return 0;
            };
            $scope.rate.seenSort = function (phrase) {
                if($scope.rating[phrase.letters]) {
                    return ($scope.rating[phrase.letters].zeros);
                };
                return 0;
            };

            $scope.rate.totalRated = function (rate) {
                var total=0;
                for (var a in $scope.rating) {
                    if (rate>0 && $scope.rating[a].pluses > $scope.rating[a].minuses) {total++}
                    if (rate===0 && $scope.rating[a].pluses== $scope.rating[a].minuses) {total++}
                    if (rate<0 && $scope.rating[a].pluses < $scope.rating[a].minuses) {total++}
                }
                return total;
            };
            $scope.rate.countNew = function () {
                var total=0;
                for (var i in $scope.source) {
                    if (!$scope.rating[$scope.source[i].letters]) {total++}
                }
                return total;
            };
            $scope.rate.toggleRF = function (rate) {
                if (rate == 'news') {$scope.ratingMode.news=!$scope.ratingMode.news
                } else if (rate>0) {
                    $scope.ratingMode.plus=!$scope.ratingMode.plus
                } else if (rate<0) {
                    $scope.ratingMode.minus=!$scope.ratingMode.minus
                } else {
                    $scope.ratingMode.zero=!$scope.ratingMode.zero
                }
            };
            $scope.rate.ratingFilter = function (phrase) {
                var result=true;
                result=result && phrase.letters;
                if (result && !$scope.rating[phrase.letters] && $scope.ratingMode.news) {return true}
                return result && $scope.rating[phrase.letters] &&
                    (
                        (($scope.rating[phrase.letters].pluses > $scope.rating[phrase.letters].minuses) && $scope.ratingMode.plus) ||
                        (($scope.rating[phrase.letters].minuses > $scope.rating[phrase.letters].pluses) && $scope.ratingMode.minus) ||
                        (($scope.rating[phrase.letters].pluses == $scope.rating[phrase.letters].minuses) && $scope.ratingMode.zero)
                        );
            };

        }
    };
});