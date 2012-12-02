#Apigee App Services (Usergrid) Standard jQuery Example

##Overview
This project is a quick example to show how to make App Services (Usergrid) calls with standard [jQuery](http://jquery.com/) ajax calls. Please note that if you are looking for a more comprehensive Javascript SDK that is not platform dependent, please consider our [HTML5 Javascript SDK](https://github.com/apigee/usergrid-javascript-sdk).  

Repo source:

<https://github.com/apigee/Usergrid-jQuery-Example>

To see a live demo of this project:

<http://apigee.github.com/Usergrid-jQuery-Example/>


To find out more about Apigee App Services, see:

<http://apigee.com/about/developers>

To view the Apigee App Services documentation, see:

<http://apigee.com/docs/usergrid/>

##Getting Started
This is a simple project to show how you can use the built-in ajax() method to make calls against the App Services API.  The main file:

js/app.js


The js/app.js file is where all the javascript code resides and where all calls to the API are made. On line 32 of this file, find this code:

	//Your org and app combination - change this!!
	var org = 'apigee'; //<== your organizaiton
	var app = 'sandbox';//<== your application

And put in your account information, so that when you run the code it will connect to the correct account.

The main functions are **_get**, **_post**, **_put**, and **_delete**.  All of these functions pull their input from the form, and then call the **apiRequest** method.  The **apiRequest** method is what actually makes a call to the server.

**Note:** this example uses the "Sandbox" application that comes with your new account.  The Sandbox app does not require authentication tokens and this jQuery example doesn't use them.  However, it could be easily extended to do so because the code to add the token to the header is in the apiRequest method.   

##The App
The app supports all 4 call types (GET, POST, PUT, and DELETE, a Login example).  Select the method you want to run by pressing one of the 4 buttons.

###GET
To test this method, enter the path of the endpoint you wish to retrieve.  For example, to get all users, enter:

	/users
	
To get a specific user, enter:

	/users/username
	
Often, you may want to append query parameters to the end of the URL for things like searching.  Simply append those to the "path" variable like so:

	/users?ql=select * where username = 'fred*'
	
Which, after you press the run query button, will be translated into a url encoded string prior to being sent to the API, and will look like this:

	/users%3Fql%3Dselect%20*%20where%20username%20%3D%20'fred*'

This happens in the **apiRequest** method, when the ajax request is being prepared:

	url: apiUrl + encodeURIComponent(path),	
	
###POST
The POST method takes both a path and a request body (in Json).  For example, to create a new user, enter the path:

	/users
	
and a request body that contains at least a username:

	{"username":"fred"}

The above combination will create a new user with a username of fred.

###PUT
The PUT screen works the same as POST - enter a path and request body. For example, to update the user "fred", enter a path like this:

	/users/fred
	
and a request body like:

	{"othervalue":"12345"}
	
This will update / add a key called "othervalue" with a value of "12345" to the entity.


###DELETE
Surprisingly, DELETE is most like a GET in that it only takes a path, and no request body.  Simply specify the path to the entity you want to delete:

	/users/fred
	
This will delete the user entity with the username of "fred".


###Log In
This example uses the "Sandbox" app, which does not require authentication, so logging in is not required to make calls against the API.  However, even in the "Sandbox", it is still possible to get an OAuth token.  We have included a sample to illustrate how to accomplish this.

To make a call to get an OAuth token, simply make a GET request against the /token endpoint.  

 	/token?username={username here}&password={password here}&grant_type=password"
  
This will return an app level token from the API.  Store it, and use to for future calls agains the API.  

##Under the hood
The code in this example is all standard Javascript and jQuery. The most interesting part will likely be the section of code that actually makes the calls to the API.

As mentioned above, all calls are eventually routed to a function called **apiRequest**.  This method does 3 things.  First, it prepares the ajax options:

	var ajaxOptions = {
      type: method.toUpperCase(),
      url: apiUrl + encodeURIComponent(path),
      success: success,
      error: error,
      data: data || {},
      contentType: "application/json; charset=utf-8",
      dataType: "json"
    }

Second, it appends an oauth token if one is available.  These lines are not currently used as this example never uses a token.  But, we have included them here to show you how you would add the token if your app uses one:

   	ajaxOptions.beforeSend = function(xhr) {
		if (accessToken) { xhr.setRequestHeader("Authorization", "Bearer " + session.accessToken) }
	}

Finally, the third thing it does is actually make the ajax call via jQuery:

    $.ajax(ajaxOptions);

##Known issues
This code (the jQuery ajax function) will not fully work with Internet Explorer < version 10.  In version 10, Microsoft finally implemented XMLHttpRequest which makes all the magic possible. 

##Sample apps
The SDK project includes a simple app called Dogs, that creates a list of dogs.  The app uses App Services to retrieve a collection of dog entities. The app illustrates how to page through the results, and how to create a new entity.

For a more complex sample app, check out the Messagee app:

<https://github.com/apigee/usergrid-sample-html5-messagee>

##More information
For more information on Apigee App Services, visit <http://apigee.com/about/developers>.


## Contributing
We welcome your enhancements!

Like [Usergrid](https://github.com/apigee/usergrid-stack), the Usergrid Javascript SDK is open source and licensed under the Apache License, Version 2.0.

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Added some feature'`)
4. Push your changes to the upstream branch (`git push origin my-new-feature`)
5. Create new Pull Request (make sure you describe what you did and why your mod is needed)


## Copyright
Copyright 2012 Apigee Corporation

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

<http://www.apache.org/licenses/LICENSE-2.0>

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
