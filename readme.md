#MEAN Session 9

We are continuing from last week's Rest API session.

Add pirate -

```
$scope.addPirate = function (data) {
    $http.post('/api/pirates/', data)
    .success(function(){
        $scope.pirates.push(data);
    })
```

```
<form ng-submit="addPirate(pirate)">
	<input type="text" ng-model="pirate.name" />
	<input type="text" ng-model="pirate.vessel" />
	<input type="text" ng-model="pirate.weapon" />
	<input type="submit" value="Add Pirate">
</form>
```

Create a component 

Start by editing app.js to contain just the module declaration

Save the rest into a new file called app.component.js

Edit the html to create a link to the detail:

```
<li ng-repeat="pirate in pirates">
    <a href="/api/pirates/{{ pirate._id }}">{{ pirate.name }}</a>
    <span ng-click="deletePirate($index, pirate._id)">X</span>
</li>
```
This links to the api page for now:

`<a href="/api/pirates/{{ pirate._id }}">{{ pirate.name }}</a>`

This means we are creating a component:

```
<body>
	<div>
		<h1>Pirates</h1>
		<pirates-view></pirates-view>
	</div>
</body>
```

Create the component 

```js
angular.module('pirateApp', []).component('piratesView', {
	templateUrl: '/templates/pirates-view.html',
	controller: function PirateAppController($scope, $http) {
		var self = this;
		$http.get('/api/pirates').
			then(function (response) {
				$scope.pirates = response.data;
				console.log($scope.pirates);
			});

		$scope.deletePirate = function (index, pid) {
			$http.delete('/api/pirates/' + pid)
				.success(function () {
					$scope.pirates.splice(index, 1);
				})
		};

		$scope.addPirate = function (data) {
			$http.post('/api/pirates/', data)
				.success(function () {
					$scope.pirates.push(data);
				})
		};

	}
});
```

and the html

```
<ul>
	<li ng-repeat="pirate in pirates">
		<a href="/api/pirates/{{ pirate._id }}">{{ pirate.name }}</a>
		<span ng-click="deletePirate($index, pirate._id)">X</span>
	</li>
</ul>

<form ng-submit="addPirate(pirate)">
	<input type="text" ng-model="pirate.name" />
	<input type="text" ng-model="pirate.vessel" />
	<input type="text" ng-model="pirate.weapon" />
	<input type="submit" value="Add Pirate">
</form>
```

Link it to the main index page:

```
<!DOCTYPE html>
<html ng-app="pirateApp">

<head>
	<title>AngularJS Pirates</title>
	<link rel="stylesheet" href="css/styles.css">
	<script src="https://code.angularjs.org/1.5.8/angular.js"></script>
	<script src="https://code.angularjs.org/1.5.8/angular-route.js"></script>
	<script src="https://code.angularjs.org/1.5.8/angular-animate.js"></script>
	<script src="js/app.js"></script>
	<script src="js/app.component.js"></script>
</head>

<body>
	<div>
		<h1>Pirates</h1>
		<pirates-view></pirates-view>
	</div>
</body>

</html>
```

And test

Next - 

```
<body>
	<div>
		<h1>Pirates</h1>
		<div ng-view></div>
	</div>
</body>
```

Note - changed app.component.js to pirate-view.component.js

This means ngRoute (ng-view)

###Routing in Angular

Add routing and component for piratesView.

This can be tricky. Make sure to run through this again.

- check that routing is loaded in index.html
- in app.js inject the routing: `angular.module('pirateApp', ['ngRoute']);`
- inject pirates-view `angular.module('pirateApp', ['ngRoute', 'piratesView']);`
- create `pirates-view.component.js` as `angular.module('piratesView', []);` in js folder
- add `app.config` to static js folder
- add `<script src="js/app.config.js"></script>` to index.html

app.config:

```js
angular.module('pirateApp').
    config(['$locationProvider', '$routeProvider',
        function config($locationProvider, $routeProvider) {
            // $locationProvider.hashPrefix('!');
            $routeProvider.
                when('/', {
                    template: '<pirates-view></pirates-view>'
                }).
                when('/pirates/:pirateId', {
                    template: '<pirate-detail></pirate-detail>'
                }).
                otherwise('/');
        }
    ]);
```

###Pirate detail

- app.js `angular.module('pirateApp', ['ngRoute', 'piratesView', 'pirateDetail']);`
- create `pirate-detail.module.js`
- add to `pirate-detail.module.js` requiring ngRoute : `angular.module('pirateDetail', ['ngRoute']);`
- add to index `<script src="js/pirate-detail.module.js"></script>`
- create `pirate-detail.component.js` in js 
- create `pirate-detail.html` in templates
- add to index `<script src="js/pirate-detail.component.js"></script>`

pirate-detail.component.js

In order to work with routing and extract route parameters

```js
angular.module('pirateDetail').component('pirateDetail', {
    templateUrl: '/templates/pirate-detail.html',

    controller: ['$http', '$routeParams',
        function PirateDetailController($http, $routeParams) {
            this.pirateId = $routeParams.pirateId;
        }
    ]
}); 
```

In pirates-view.html we are currently going to an api endpoint `/api/pirates/{{ pirate._id }}` :

```
<li ng-repeat="pirate in pirates">
	<a href="/api/pirates/{{ pirate._id }}">{{ pirate.name }}</a>
	<span ng-click="$ctrl.deletePirate($index, pirate._id)">X</span>
</li>
```

- change that to `/pirates/{{ pirate._id }}`
- pirate-detail.component.js

```js
angular.module('pirateDetail').component('pirateDetail', {
    templateUrl: '/templates/pirate-detail.html',

    controller: ['$http', '$routeParams',
        function PirateDetailController($http, $routeParams) {
            var self = this;

            $http.get('/api/pirates/' + $routeParams.pirateId)
                .then(function (response) {
                    self.pirate = response.data;
                });
        }
    ]
});
```

- template 

```html
<dl>
    <dt>Name</dt>
    <dd>{{ $ctrl.pirate.name }}</dd>
    <dt>Vessel</dt>
    <dd>{{ $ctrl.pirate.vessel }}</dd>
    <dt>Weapon</dt>
    <dd>{{ $ctrl.pirate.weapon }}</dd>
</dl>

<button type="submit" ng-click="$ctrl.back()">Back</button>
```

accomodate the back button:

```js
angular.module('pirateDetail').component('pirateDetail', {
    templateUrl: '/templates/pirate-detail.html',

    controller: ['$http', '$routeParams',
        function PirateDetailController($http, $routeParams) {
            var self = this;

            console.log($routeParams.pirateId);
            $http.get('/api/pirates/' + $routeParams.pirateId)
                .then(function (response) {
                    self.pirate = response.data;
                });

            self.back = function () {
                window.history.back();
            }
        }
    ]
});
```

Set an absolute path:

```js
angular.module('pirateDetail').component('pirateDetail', {
    templateUrl: '/templates/pirate-detail.html',

    controller: ['$http', '$routeParams', '$location',
        function PirateDetailController($http, $routeParams, $location) {
            var self = this;

            console.log($routeParams.pirateId);
            $http.get('/api/pirates/' + $routeParams.pirateId)
                .then(function (response) {
                    self.pirate = response.data;
                });

            self.back = function () {
                $location.path('/');
            }
        }
    ]
});
```









