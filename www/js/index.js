/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
'use strict;'

var sourceOptions = {
  cordova: [
    { key: 'destination', list: [ 'File URI', 'Data URL', 'Local URI' ] },
    { key: 'encoding', list: [ 'JPEG', 'PNG' ] },
    { key: 'direction', list: [ 'Back', 'Front' ] }
  ]
}

var photos = [];
var app = {
  // Application Constructor
  initialize: function() {
    this.bindEvents();
  },
  // Bind Event Listeners
  //
  // Bind any events that are required on startup. Common events are:
  // 'load', 'deviceready', 'offline', and 'online'.
  bindEvents: function() {
    var doc = $(document);
    doc.ready(this.onDocumentReady);
    doc.on('deviceready', this.onDeviceReady);
    doc.on('click', '.capture-scanner', this.captureScanner);
    doc.on('click', '.capture-image', this.captureImage);
    doc.on('click', '.dropdown-menu .select', this.selectMenuItem);
    doc.on('click', '.select-photo', this.selectPhoto);
    doc.on('click', '.delete-photo', this.deletePhoto);
  },
  onDocumentReady: function() {
    app.log('Received event', 'ready');

    var json = localStorage.getItem('photos');
    if(json) {
      photos = JSON.parse(json);
      for(var index = 0; index < photos.length; index++) {
        app.addPhoto(photos[index], { silent: true, index: index });
      }
    }
  },
  onDeviceReady: function() {
    app.log('Received event', 'deviceready');
  },
  captureScanner: function(ev) {
    try {
      app.log('Cordova', cordova.plugins);
      var scanner = cordova.require("cordova/plugin/BarcodeScanner");
      app.log('Created scanner', scanner);

      scanner.scan(
        function (result) {
          app.log('Scanner success', JSON.stringify(result));
        },
        function (error) {
          app.log('Scanner error', error);
        }
      );
    }
    catch (error) {
      app.log('Scanner Exception', error.message || error);
    }
  },
  captureImage: function(ev) {
    var type = app.getCaptureType();
    if(type === 'inputElement') {
      app.captureInput(ev);
    }
    else if(type === 'cordova') {
      app.captureCordova(ev);
    }
    else if(type === 'getUserMedia') {
      app.captureGetUserMedia(ev);
    }

    return false;
  },
  captureInput: function(ev) {
    var target = $(ev.target).closest('.navbar-header');
    target.find('input[type=file]').remove();
    var input = $('<input class="hidden" type="file" accept="image/*;capture=camera">');
    input
      .appendTo(target)
      .on('change', function(ev) {
        var file = ev.target.files[0];
        if(file) {
          var reader = new FileReader;
          reader.onload = function() {
            app.addPhoto(reader.result);
          }
          reader.readAsDataURL(file);
        }
      })
      .click();
  },
  captureCordova: function(ev) {
    try {
      var options = {}

      var destination = app.getOption('.cordova-destination');
      options.destinationType = Camera.DestinationType[destination];

      var encoding = app.getOption('.cordova-encoding');
      options.encodingType = Camera.EncodingType[encoding];

      var direction = app.getOption('.cordova-direction');
      options.cameraDirection = Camera.Direction[direction];

      app.log('Cordova Options', JSON.stringify(options));
      navigator.camera.getPicture(app.cordovaSuccess, app.cordovaError, options);
    }
    catch (error) {
      app.log('Cordova Exception', error.message);
    }
  },
  cordovaSuccess: function(data) {
    var message;
    if(!data.match(/^file:\/\//)) {
      data = 'data:image/jpeg;base64,' + data;
      message = data.substring(0, 100);
    }
    else {
      message = data;
    }

    app.log('Cordova Success', message);
    app.addPhoto(data);
  },
  cordovaError: function(message) {
    app.log('Cordova Error', message);
  },
  captureGetUserMedia: function(ev) {
    console.warn('capture getusermedia')
  },
  selectMenuItem: function(ev) {
    var target = $(ev.target);
    target.closest('.dropdown').find('span.current').text(target.text());

    if(target.hasClass('select-type')) {
      app.updateSourceOptions();
    }
  },
  getCaptureType: function() {
    var type = $('.capture-type span.current').text().replace(/ /g, '');
    return type[0].toLowerCase() + type.substring(1);
  },
  getOption: function(selector) {
    return $(selector).text().toUpperCase().replace(/ /g, '_');
  },
  updateSourceOptions: function() {
    var type = app.getCaptureType();

    var menu = $('.navbar-collapse .navbar-nav');
    menu.empty();

    var options = sourceOptions[type];
    if(options) {
      var template = '<li class="dropdown">' +
        '<a href="#" class="<%= name %>" dropdown-toggle" data-toggle="dropdown">' +
        '<span class="current"><%= current %></span>' +
        '<span class="caret"></span></a>' +
        '<ul class="dropdown-menu">' +
        '<% _.forEach(list, function(val) { %><li><a class="select" href="#"><%= val %></a></li><% }); %>'
        '</ul>';

      for(var index = 0; index < options.length; index++) {
        var item = options[index];

        var t = _.template(template, {
          name: type + '-' + item.key,
          current: item.list[0],
          list: item.list
        });
        menu.append(t);
      }
    }
  },
  addPhoto: function(data, options) {
    try {
      var photo;
      if(_.isString(data)) {
        photo = { data: data };

        var match = data.match(/data:([^;]*);base64,(.*)/);
        if(match) {
          photo.contentType = match[1];
          photo.fileSize = (match[2].length / 4) * 3;
          photo.label = match[2].substring(0, 25) + '...'

          app.log('Data Photo', 'Size: ' + photo.fileSize + ' Type: ' + photo.contentType);
        }
        else {
          photo.contentType = 'image/' + data.match(/.(\w+)$/)[1];
          photo.fileSize = '?';
        }
        photos.push(photo);
        localStorage.setItem('photos', JSON.stringify(photos));
      }
      else {
        photo = data;
      }

      var table = $('.results.panel table');
      table.find('tr').removeClass('success');

      var index = photos.length - 1;
      if(options && (options.index !== undefined)) {
        index = options.index;
      }
      var row = $('<tr>')
        .data('photo', index)
        .append($('<td>')
          .append(
            $('<a href="" class="select-photo"><i class="glyphicon glyphicon-bookmark"/> </a>')
              .append(photo.label || photo.data)
          )
        )
        .append($('<td>').text(photo.fileSize))
        .append($('<td>').text(photo.contentType))
        .append($('<td><a href="" class="delete-photo"><i class="glyphicon glyphicon-trash"/></a></td>'))
        .appendTo(table);

      if(!options || !options.silent) {
        row.addClass('success');
        $('.results.panel img').attr('src', photo.data);
      }
    }
    catch (error) {
      app.log('Caught Exception', error.message);
    }
  },
  selectPhoto: function(ev) {
    var row = $(ev.target).closest('tr');
    if(!row.hasClass('success')) {
      var offset = row.data('photo');
      $('.results.panel img').attr('src', photos[offset].data);

      var table = $('.results.panel table');
      table.find('tr').removeClass('success');

      row.addClass('success');
    }

    return false;
  },
  deletePhoto: function(ev) {
    var row = $(ev.target).closest('tr');
    var offset = row.data('photo');
    photos.splice(offset, 1);
    localStorage.removeItem('photos');
    localStorage.setItem('photos', JSON.stringify(photos));

    if(row.hasClass('success')) {
        $('.results.panel img').attr('src', '');
    }
    row.remove();

    return false;
  },
  log: function(key, message) {
    $('<li class="list-group-item">')
      .text(key + ': ' + message )
      .prependTo($('.log.panel .list-group'));
  }
};

