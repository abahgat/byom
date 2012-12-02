<?php

   $cardfound = FALSE;
   $message = "";   
   // Get the playlist with the ID in the URL
   
   $cardid = $_GET["id"];
   if (!empty($cardid)) {
      $url = 'http://api.usergrid.com/diderikvw/byom/cards/' . $cardid;
      //echo $url;
      $ch = curl_init();
      curl_setopt($ch, CURLOPT_URL, $url);
      $encoded = '';
      //curl_setopt($ch, CURLOPT_POSTFIELDS,  $encoded);
      //curl_setopt($ch, CURLOPT_HEADER, 0);
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
      //curl_setopt($ch, CURLOPT_POST, 1);
      $output = curl_exec($ch); 
      curl_close($ch);
      //echo $output;
      
      // 
      $carddata = (array) json_decode($output);
      if (array_key_exists('error', $carddata)) {
         // Something went wrong, card not found
         //echo 'BLAA';
      }
      else {
         $cardfound = TRUE;
      }
      //echo $carddata['error'];
      //var_dump($carddata);
      //var_dump($carddata['entities'][0]->playlist);
      $playlist = $carddata['entities'][0]->playlist;
   }

   // If a post, then update the playlist on Apigee. Playlist field in Cards collection
   //var_dump($_POST['playlist']);
   if (array_key_exists('playlist', $_POST)) {
      //echo 'HEEELOO';
      if ($cardfound) {
         
         $data = array( "playlist"  => $_POST["playlist"] );
         $data_string = json_encode($data);
         //echo $data;
         $ch = curl_init('api.usergrid.com/diderikvw/byom/cards/' . $cardid);
         //curl_setopt($ch, CURLOPT_URL, $url);
         curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
         curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
         curl_setopt($ch, CURLOPT_POSTFIELDS, $data_string);
         curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            'Content-Length: ' . strlen($data_string))
         );
         //curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
         //curl_setopt($ch, CURLOPT_HTTPHEADER, array("Content-Type: application/json; charset=utf-8","Accept:application/json, text/javascript, */*; q=0.01"));
         //curl_setopt($ch, CURLOPT_PUT, true);
         //curl_setopt($ch, CURLOPT_POSTFIELDS,$data);
   
         $response = curl_exec($ch);
         curl_close($ch);
         //if(!$response) {
         //    return false;
         //}
         
         //echo $response;
         
         $playlist = $_POST["playlist"];
         $message = "Success: new playlist is on your card.";
      }
      else {
         $message = "Something went wrong updating your card. Please contact us.";
      }
   }
   else {
      // nothing...
   }
      

?><!DOCTYPE html>
<html>
   <head>
      <title></title>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <link rel="stylesheet" href="css/bootstrap-combined.min.css" />
      <link rel="stylesheet" href="css/styles.css" />
      <script src="js/jquery.min.js" type="text/javascript"></script>
      <script src="js/json2.js" type="text/javascript"></script>
      <script src="js/app.js" type="text/javascript"></script>
   </head>
   <body>
      <div class="header">
         <img src="./images/header-logo01.jpg">
      </div>

      <div id="byom-page" class="form-block">
         <h2>Put new playlist on card</h2>
         <form name="byom-form" id="byom-form" method="post">
            <div id="name-control" class="control-group">
               <label class="control-label" for="shortcode">Spotify Playlist URI</label>
               <div class="controls">
                  <input type="text" name="playlist" id="playlist" class="span4" value="<? echo $playlist; ?>"/>
               </div>
            </div>
            <button type="submit" class="btn btn-primary" id="run-byom" style="width: 210px;">Update card with new playlist</button>
         </form>
         To get the URI of your playlist: open the Spotify desktop app, go to a playlist, right mouse click, select
         "Copy Spotify URI" and paste here.
         <br/>
         <br/>
         (don't use the "HTTP Link", that does not work... yet...)
         <p>
            
            <br/><br/>
            
         </p>
      </div>  
  
      <div class="response-box">
         <?php
            if (!$cardfound) {
               echo "Your card was not found. Please contact us.";   
            }
            echo $message;
         ?>
      <div id="response"></div>
      </div>
    </body>
</html>