/* Copyright 2014 NFLabs
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

/**
 * @ngdoc function
 * @name zeppelinWebApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the zeppelinWebApp
 * 
 * @author anthonycorbacho
 */
angular.module('zeppelinWebApp')
        .controller('MainCtrl', function($scope, WebSocket, $rootScope, $window) {
  
  $scope.WebSocketWaitingList = [];
  $scope.connected = false;
  $scope.looknfeel = 'default';

  var init = function() {
    $scope.asIframe = (($window.location.href.indexOf('asIframe') > -1) ? true : false);
  };
  init();

  /**
   * Web socket
   */
  WebSocket.onopen(function() {
    console.log('Websocket created');
    $scope.connected = true;
    if ($scope.WebSocketWaitingList.length > 0) {
      for (var o in $scope.WebSocketWaitingList) {
        WebSocket.send(JSON.stringify($scope.WebSocketWaitingList[o]));
      }
    }
  });

  WebSocket.onmessage(function(event) {
    var payload;
    if (event.data) {
      payload = angular.fromJson(event.data);
    }
    console.log('Receive << %o, %o', payload.op, payload);
    var op = payload.op;
    var data = payload.data;
    if (op === 'NOTE') {
      $rootScope.$emit('setNoteContent', data.note);
    } else if (op === 'NOTES_INFO') {
      $rootScope.$emit('setNoteMenu', data.notes);
    } else if (op === 'PARAGRAPH') {
      $rootScope.$emit('updateParagraph', data);
    } else if (op === 'PROGRESS') {
      $rootScope.$emit('updateProgress', data);
    } else if (op === 'COMPLETION_LIST') {
      $rootScope.$emit('completionList', data);
    }
  });

  WebSocket.onerror(function(event) {
    console.log('error message: ', event);
    $scope.connected = false;
  });

  WebSocket.onclose(function(event) {
    console.log('close message: ', event);
    $scope.connected = false;
  });

  /** Send info to the websocket server */
  var send = function(data) {
    if (WebSocket.currentState() !== 'OPEN') {
      $scope.WebSocketWaitingList.push(data);
    } else {
      console.log('Send >> %o, %o', data.op, data);
      WebSocket.send(JSON.stringify(data));
    }
  };

  /** Get a list of note */
  var getAllNotes = function() {
    send({op: 'LIST_NOTES'});
  };
  
  /** get the childs event and sebd to the websocket server */
  $rootScope.$on('sendNewEvent', function(event, data) {
    if (!event.defaultPrevented) {
      send(data);
      event.preventDefault();
    }
  });
  
  $rootScope.$on('setIframe', function(event, data) {
    if (!event.defaultPrevented) {
      $scope.asIframe = data;
      event.preventDefault();
    }
  });

  $rootScope.$on('setLookAndFeel', function(event, data) {
    if (!event.defaultPrevented) {
      $scope.looknfeel = data;
      event.preventDefault();
    }
  });

});
