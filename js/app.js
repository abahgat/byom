/**
*  dogs is a sample app  that is powered by Usergrid
*  This app shows how to use the Usergrid SDK to connect
*  to Usergrid, how to add entities, and how to page through
*  a result set of entities
*
*  Learn more at http://Usergrid.com/docs
*
*   Copyright 2012 Apigee Corporation
*
*  Licensed under the Apache License, Version 2.0 (the "License");
*  you may not use this file except in compliance with the License.
*  You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
*  Unless required by applicable law or agreed to in writing, software
*  distributed under the License is distributed on an "AS IS" BASIS,
*  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*  See the License for the specific language governing permissions and
*  limitations under the License.
*/

/**
*  @file app.js
*  @author Rod Simpson (rod@apigee.com)
*
*  This file contains the main program logic for Dogs.
*/
$(document).ready(function () {

   //Your org and app combination - change this!!
   var org = ''; //<== your organization
   var app = '';//<== your application

   //path to the api
   var apiUrl = "https://api.usergrid.com/"+org+"/"+app+"/";
   var accessToken = null;
   
   //bind the show buttons
   $('#show-get').bind('click', function() {
      $('#main').hide();
      $('#main-menu').show();
      $('#get-page').show();
   });

   $('#show-post').bind('click', function() {
      $('#main').hide();
      $('#main-menu').show();
      $('#post-page').show();
   });

   $('#show-put').bind('click', function() {
      $('#main').hide();
      $('#main-menu').show();
      $('#put-page').show();
   });

   $('#show-delete').bind('click', function() {
      $('#main').hide();
      $('#main-menu').show();
      $('#delete-page').show();
   });

   $('#show-login').bind('click', function() {
      $('#main').hide();
      $('#main-menu').show();
      $('#login-page').show();
   });

   $('#show-byom').bind('click', function() {
      $('#main').hide();
      $('#main-menu').show();
      $('#byom-page').show();
   });   
   
   $('#run-get').bind('click', function() {
      _get();
   });

   $('#run-post').bind('click', function() {
      _post();
   });

   $('#run-put').bind('click', function() {
      _put();
   });

   $('#run-delete').bind('click', function() {
      _delete();
   });

   $('#run-login').bind('click', function() {
      _login();
   });

   $('#run-byom').bind('click', function() {
      //_byom();
   });


   //bind the main-menu button
   $('#main-menu').bind('click', function() {
      $('#get-page').hide();
      $('#post-page').hide();
      $('#put-page').hide();
      $('#delete-page').hide();
      $('#login-page').hide();
      $('#byom-page').hide();
      $('#main').show();
      $('#main-menu').hide();
      $("#response").html('');
   });


   function _get() {
      var path = $("#get-path").val();
      apiRequest('GET', path, null,
         function(response) {
           var output = JSON.stringify(response, null, 2);
           $("#response").html('<pre>'+output+'</pre>');
         },
         function (response) {
           $("#response").html('<pre>ERROR: '+response+'</pre>');
         }
      );
   }

   function _post() {
      var path = $("#post-path").val();
      var data = $("#post-data").val();
      apiRequest('POST', path, data,
         function(response) {
           var output = JSON.stringify(response, null, 2);
           $("#response").html('<pre>'+output+'</pre>');
         },
         function (response) {
           $("#response").html('<pre>ERROR: '+response+'</pre>');
         }
      );
   }

   function _put() {
      var path = $("#put-path").val();
      var data = $("#put-data").val();
      apiRequest('PUT', path, data,
         function(response) {
           var output = JSON.stringify(response, null, 2);
           $("#response").html('<pre>'+output+'</pre>');
         },
         function (response) {
           $("#response").html('<pre>ERROR: '+response+'</pre>');
         }
      );
   }

   function _delete() {
      var path = $("#delete-path").val();
      apiRequest('DELETE', path, null,
         function(response) {
           var output = JSON.stringify(response, null, 2);
           $("#response").html('<pre>'+output+'</pre>');
         },
         function (response) {
           $("#response").html('<pre>ERROR: '+response+'</pre>');
         }
      );
   }
   
   function _login() {
      var username = $("#username").val();
      var password = $("#password").val();
      var path = 'token?username='+username+'&password='+password+'&grant_type=password';
      apiRequest('GET', path, null,
         function(response) {
           var output = JSON.stringify(response, null, 2);
           $("#response").html('<pre>'+output+'</pre>');
         },
         function (response) {
           $("#response").html('<pre>ERROR: '+response+'</pre>');
         }
      );
   }
      
   function _byom() {
      var carduid = $("#carduid").val();
      var shortcode = $("#shortcode").val();
      var playlist = $("#playlist").val();

      var path = '/cards/' + carduid;
      var data = '{ "shortcode": "' + shortcode + '", "playlist": "' + playlist + '" }';

      apiRequest('PUT', path, data,
         function(response) {
           var output = JSON.stringify(response, null, 2);
           $("#response").html('<pre>'+output+'</pre>');
         },
         function (response) {
           $("#response").html('<pre>ERROR: '+response+'</pre>');
         }
      );
   }   

   function apiRequest(method, path, data, success, error) {

    var ajaxOptions = {
      type: method.toUpperCase(),
      url: apiUrl + encodeURIComponent(path),
      success: success,
      error: error,
      data: data || {},
      contentType: "application/json; charset=utf-8",
      dataType: "json"
    }

    ajaxOptions.beforeSend = function(xhr) {
       if (accessToken) { xhr.setRequestHeader("Authorization", "Bearer " + session.accessToken) }
    }

    $.ajax(ajaxOptions);
  }

});