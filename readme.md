#MEAN Session 9

We are continuing from last week's Rest API session.

```sh
$ mongo
> show dbs
> use puppies
> db.createCollection('toys')
> show collections
> db.toys.insert({name: 'yoyo', color: 'red'})
> db.toys.find()
```

Mongoose 
- ORM object relational mapping
- a library that helps us talk to the database 
- made by WordPress

Schema 
- not really necessary with Mongo
- Mongoose allows us to add a Schema
- `mongoose.connect('mongods://...` is like `use` 


===

Install the dependencies `npm i` and run the app `nodemon server.js`. Go to `http://localhost:3004/api/pirates` to see the current crop of pirates. If none use `/api/import`.

Test the current api's in Postman - 

- get `localhost:3004/api/pirates`
- get `localhost:3004/api/pirates/582280a9684c9c10232226ea`
- put `localhost:3004/api/pirates/582280a9684c9c10232226ea` with `{ "name": "Test Tester" }` and check at `localhost:3004/api/pirates`

Map these back to the controllers in pirates.js (all are mongo commands):

- find({})
- findOne({ '_id': id })
- update({ '_id': id })

These are mapped back to the HTTP verbs in routes.js:

####Add

We used create() to import multiple documents to our Pirates Mongo collection. Our POST handler uses the same method to add one new Pirate to the collection. Once added, the response is the full new Pirate's JSON object.

Add to `controllers/pirates.js`

```js
exports.add = function (req, res) {
    Pirate.create(req.body, function (err, pirate) {
        if (err) return console.log(err);
        return res.send(pirate);
    });
}
```

Restart the server. Use cURL to POST to the add endpoint with the full Pirate JSON as the request body (making sure to check the URL port and path).

```
$ curl -i -X POST -H 'Content-Type: application/json' -d '{"name": "Jean Lafitte", "vessel": "Barataria Bay", "weapon":"curses"}' http://localhost:3004/api/pirates
```

We will also create a new POST request in Postman.

![Image of chart](https://github.com/mean-fall-2016/session-8/blob/master/assets/img/postman2.png)

Refresh `http://localhost:3001/pirates` to see the new entry at the end.


####Delete

Our final REST endpoint, delete, reuses what we've done above. Add this to controllers/pirates.js.

```js
exports.delete = function (req, res) {
    var id = req.params.id;
    Pirate.remove({ '_id': id }, function (result) {
        return res.send(result);
    });
};
```

Restart, and check it out with:

```
$ curl -i -X DELETE http://localhost:3004/pirates/5820d3584dc4674967d091e6
```

Create and test a delete Pirate action in Postman.

##Building a Front End for Our API

Add a layouts directory and copy and paste the following into it as `index.html`:

```html
<!DOCTYPE html>
<html ng-app='pirateApp'>

<head>
	<title>AngularJS Pirates</title>
	<script src="https://code.angularjs.org/1.5.8/angular.js"></script>
	<script src="https://code.angularjs.org/1.5.8/angular-route.js"></script>
	<script src="https://code.angularjs.org/1.5.8/angular-animate.js"></script>
	<script src="js/app.module.js"></script>
</head>

<body>
	<h1>test</h1>
</body>
</html>
```

Go to `localhost:3004/layouts`

This page is unavaiable (even if it is in the root directory).

Add this route to server.js:

```
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/layouts/index.html');
});
```

(Need to use an absolute path with res.sendFile. See this [post](http://stackoverflow.com/questions/25463423/res-sendfile-absolute-path)).

Now we can access the page at localhost://300X however the we need to configure a static assets directory.

Add a static directory (using middleware) for our assets to server.js

`app.use(express.static('assets'))`

Populate the js folder with app.module.js:

```js
angular.module('pirateApp', []);
```

Add js/app.module.js to index.html (if its not there already).

Let's run a simple test by pulling in data from another API.

app.module.js:

```js
angular.module('pirateApp', [])
.controller('PirateAppController', function ($scope, $http) {
    $http.get('http://rest-service.guides.spring.io/greeting').
        then(function (response) {
            $scope.greeting = response.data;
        });
});
```

Add to index.html:

```html
<body ng-controller="PirateAppController">
    <h1>Testing</h1>
    <p>The ID is {{greeting.id}}</p>
    <p>The content is {{greeting.content}}</p>
</body>
```

Now let's use our own:

```js
angular.module('pirateApp', [])
    .controller('PirateAppController', function ($scope, $http) {
        $http.get('/api/pirates').
            then(function (response) {
                $scope.pirates = response.data;
                console.log($scope.pirates);
            });
    });
```


```html
<body ng-controller="PirateAppController">
	<h1>Pirates</h1>
	<ul>
		<li ng-repeat="pirate in pirates">
			{{ pirate.name }}
			<span>X</span>
		</li>
	</ul>
</body>
```

Add link to `css/styles.css`

###Deleting a Pirate

As a starting point reuse the array script. Recall the script from a previous lesson:

In app.module.js:

```js
$scope.deletePirate = function(index) {
	$scope.pirates.splice(index, 1);
}
```

Wire up the deletePirate function:

```
<ul>
	<li ng-repeat="pirate in pirates">
		{{ pirate.name }} | {{ pirate._id }}
		<span ng-click="deletePirate(pirate._id)">X</span>
	</li>
</ul>
```

```js
$scope.deletePirate = function(pid) {
	$http.delete('/api/pirates/' + pid);
    // $scope.pirates.splice(index, 1);
}
```

But this has no effect on $scope

```js
$scope.deletePirate = function (index, pid) {
    console.log(pid);
    $http.delete('/api/pirates/' + pid)
    .success(function(){
        $scope.pirates.splice(index, 1);
    })
}
```

```
<ul>
	<li ng-repeat="pirate in pirates">
		{{ pirate.name }} {{ pirate._id }}
		<span ng-click="deletePirate($index, pirate._id)">X</span>
	</li>
</ul>
```

===

####Add Pirate


In app.module.js:

```js
$scope.addPirate = function (data) {
    $http.post('/api/pirates/', data)
    .success(function(){
        $scope.pirates.push(data);
    })
}
```

```
<form ng-submit="addPirate(pirate)">
	<input type="text" ng-model="pirate.name" />
	<input type="text" ng-model="pirate.vessel" />
	<input type="text" ng-model="pirate.weapon" />
	<input type="submit" value="Add Pirate">
</form>
```

Adjust css 

```css
input[type="submit"],
button {}
```

And test.

Note we can add the same pirate twice leading to an error.

Clear the form - pirate-view.component.js

```js
$scope.addPirate = function (data) {
    $http.post('/api/pirates/', data)
        .success(function (pirate) {
            console.log('This is ' + pirate.name)
            $scope.pirates.push(pirate);
            $scope.pirate = {};
        })
};
```

###Create a Component for the Pirates View

We are creating a module for the pirates view called `piratesView`.

Start by editing app.module.js to contain just the module declaration

Inject our new module into `app.module.js`:

```js
angular.module('pirateApp', ['piratesView']);
```

Paste the rest into a new file called `pirates-view.component.js` and edit it to create a component called piratesView:

```js
angular.module('piratesView', []).component('piratesView', {
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

Copy the HTML into `assets/templates/pirates-view.html` and edit the html to create a link to the detail. Use the api Uri for now:

```
<li ng-repeat="pirate in pirates">
    <a href="/api/pirates/{{ pirate._id }}">{{ pirate.name }}</a>
    <span ng-click="deletePirate($index, pirate._id)">X</span>
</li>
```

Edit the body in `index.html` to reference the new component:

```
<body>
	<div>
		<h1>Pirates</h1>
		<pirates-view></pirates-view>
	</div>
</body>
```

And link `js/pirates-view.component.js` to the main index page:

```
<!DOCTYPE html>
<html ng-app="pirateApp">

<head>
	<title>AngularJS Pirates</title>
	<link rel="stylesheet" href="css/styles.css">
	<script src="https://code.angularjs.org/1.5.8/angular.js"></script>
	<script src="https://code.angularjs.org/1.5.8/angular-route.js"></script>
	<script src="https://code.angularjs.org/1.5.8/angular-animate.js"></script>
	<script src="js/app.module.js"></script>
	<script src="js/pirates-view.component.js"></script>
</head>

<body>
	<div>
		<h1>Pirates</h1>
		<pirates-view></pirates-view>
	</div>
</body>

</html>
```

And test.

Remember using $ctrl - `ng-click="$ctrl.deletePirate($index, pirate._id)`- is preferable but we need to declare the variable `var self = this` and refer to it in the controller: `self.deletePirate = function (index, pid) {`

<!--- create `pirates-view.module.js` as `angular.module('piratesView', []);` in js folder and link to it in index.html-->

####Pirate Detail

We will be using a module to create a pirate detail page.

In order to accomodate multiple views we need to use `ng-view` in index.html:

```
<body>
	<div>
		<h1>Pirates</h1>
		<div ng-view></div>
	</div>
</body>
```

and `ng-view` implies using `ng-route`


####Routing for Views

Add routing and component for pirate details.

- check that routing is loaded in index.html via the `<script src="https://code.angularjs.org/1.5.8/angular-route.js"></script>` tag
- inject ng-route: `angular.module('pirateApp', ['ngRoute', 'piratesView']);` in `app.module.js`
- add `app.config.js` to static js folder
- add `<script src="js/app.config.js"></script>` to index.html
- add `<script src="js/pirates-view.module.js"></script>` to index.html

app.config:

```js
angular.module('pirateApp').
    config(['$locationProvider', '$routeProvider',
        function config($locationProvider, $routeProvider) {
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

- app.module.js `angular.module('pirateApp', ['ngRoute', 'piratesView', 'pirateDetail']);`
- create `pirate-detail.component.js`
- add to `pirate-detail.component.js` requiring ngRoute : `angular.module('pirateDetail', ['ngRoute']);`
- create `pirate-detail.html` in templates
- add to index `<script src="js/pirate-detail.component.js"></script>`

pirate-detail.component.js

In order to work with routing and extract route parameters

```js
angular.module('pirateDetail', ['ngRoute']).component('pirateDetail', {
    templateUrl: '/templates/pirate-detail.html',

    controller: ['$http', '$routeParams',
        function PirateDetailController($http, $routeParams) {
            var self = this;
        }
    ]
}); 
```

In pirates-view.html we are currently going to an api endpoint `/api/pirates/{{ pirate._id }}` :

- change that to `#/pirates/{{ pirate._id }}` - note the pound
- Add the $http.get to `pirate-detail.component.js`:

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

Test.

- create the full template 

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

accomodate the back button in `pirate-detail.component.js`:

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

Set an absolute path. Note that we need to inject $location into the controller in both the array and the function:

```js
angular.module('pirateDetail').component('pirateDetail', {
    templateUrl: '/templates/pirate-detail.html',

    controller: ['$http', '$routeParams', '$location',
        function PirateDetailController($http, $routeParams, $location) {
            var self = this;
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










