var namespace = 'UI';

window[namespace] = window[namespace] || {};

;(function(global){
  'use strict';

  var string = {};

  string.trim = function(value, type){
    var regexp = type
      ? { before: /^\s+/g, after: /\s+$/g, all: /\s/g }
      : /^\s+|\s+$/g;

    return value.replace(type ? regexp[type] : regexp, '');
  };

  string.pad = function(value, char, length, after){
    var result = String(value);

    while (result.length < length) {
      result = after
        ? result + String(char)
        : String(char) + result;
    }

    return result;
  };

  string.price = function(value){
    var result = String(value).split('.')
      , regexp = /\B(?=(\d{3})+(?!\d))/g;

    result[0] = result[0].replace(regexp, ',');

    return result.join('.');
  };

  global.string = string;
}(window[namespace]));

;(function(global){
  'use strict';

  var location = (function(location){
    var parameters;

    parameters = (function(search){
      var array = !!search ? search.substr(1).split('&') : []
        , object = {};

      while (array.length) {
        array[0] = array[0].split('=');
        object[array[0][0]] = array[0][1];
        array.shift();
      }

      return object;
    }(location.search));

    return {
      parameters: parameters
    }
  }(window.location));

  global.location = location;
}(window[namespace]));

(function(global){
  'use strict';

  var json = (function(json){
    return {
      set: json.stringify,
      get: json.parse
    }
  }(window.JSON));

  global.json = json;
}(window[namespace]));

;(function(global){
  'use strict';

  var observer = (function(){
    var object = {}
      , config = {
        attributes: true,
        childList: true,
        subtree: true
      };

    return {
      set: function(name, callback){
        object[name] = new MutationObserver(callback.bind(this));
      },
      get: function(name){
        return object[name]
      },
      add: function(name, target, option){
        var target = Array.isArray(target) ? target : [target]
          , key;

        while (target.length) {
          if (option) {
            for (key in config) {
              option[key] = option[key]
                ? option[key]
                : config[key];
            }
          }

          object[name].observe(target[0], option);
          target.shift();
        }
      },
      del: function(name){
        object[name].disconnect();
      },
    }
  }());

  global.observer = observer;
}(window[namespace]));

;(function(global){
  'use strict';

  var console = (function(console){
    var $wrap = $('<section>', { class: 'debug' })
      , $inner = $('<article>', { class: 'debug-inner' })
      , $title = $('<h2>', { class: 'debug-title', text: 'DEBUG' })
      , $text = $('<div>', { class: 'debug-text' })
      , $button = $('<button>', { class: 'debug-button', text: 'D' })
      , $clear = $('<button>', { class: 'debug-clear', text: 'CLEAR' })
      , $style = $('<style>', {
        text: '\
          .debug{position:fixed;bottom:0;left:0;z-index:9999;width:100%;height:0vh;}\
          .debug-inner{display:flex;flex-flow:column;position:relative;width:100%;height:100%;border-top:1px solid rgba(0, 0, 0, 1);background-color:rgba(255, 255, 255, 0.95);}\
          .debug-title{margin:0;padding:10px;border-bottom:1px solid rgba(0, 0, 0, 1);font-family:\'Noto Sans KR\';font-size:14px;color:rgba(0, 0, 0, 1);}\
          .debug-text{overflow-x:hidden;overflow-y:auto;flex:1;margin:0;padding:10px;background-color:rgb(75, 75, 75);}\
          .debug-text p{margin:0 0 10px;padding:0;}\
          .debug-text span{font-family:\'Noto Sans KR\';font-size:14px;color:rgba(255, 255, 255, 1);}\
          .debug-text i{margin-left:10px;font-family:\'Noto Sans KR\';font-size:14px;font-style:normal;color:rgba(255, 255, 255, 1);}\
          .debug-clear{position:absolute;top:10px;right:10px;border:0;background-color:transparent;font-family:\'Noto Sans KR\';font-size:14px;color:rgba(0, 0, 0, 1);}\
          .debug-button{position:fixed;bottom:10px;right:10px;z-index:9999;margin:0;padding:0;width:40px;height:40px;border:1px solid rgba(255, 255, 255, 1);border-radius:100%;background-color:rgba(0, 0, 0, 1);font-weight:700;font-family:\'Noto Sans KR\';font-size:14px;color:rgba(255, 255, 255, 1);}\
        '
      });

    return {
      log: function(text){
        var $prev = $text.find('p').eq(0)
          , count = 0;

        if ($prev.find('span').text() == text) {
          count = parseInt($prev.find('i').text()) + 1;
          $prev.find('i').css('visibility', 'visible').text(count);
        }
        else {
          $text.prepend($('<p>').append($('<span>', { text: text }), $('<i>', { css: { visibility: 'hidden' }, text: count })));
        }
      },
      add: function(){
        $('body').append($wrap, $button, $style);
        $wrap.append($inner.append($title, $text), $clear);

        $button.on('click', function(event){
          $wrap.height()
            ? $wrap.height(0)
            : $wrap.height('50vh');
        });

        $clear.on('click', function(event){
          $text.empty();
        });
      }
    }
  }(window.console));

  global.console = console;
}(window[namespace]));
