var namespace = 'UI';

window[namespace] = window[namespace] || {};

/* COLLAPSE */
;(function(global){
  'use strict';

  var collapse = (function(){
    var _options = {}
      , _callback = {};

    _options.selector = '[data-toggle=collapse]';
    _options.duration = 100;

    function handler(event){
      var $button = $(this)
        , $target = $('#' + $button.attr('aria-controls'))
        , _group = $button.data('group');

      _callback.before && _callback.before($button, $target);

      if (_group) {
        $(`[data-group="${ _group }"]`).each(function(){
          if ($button.attr('id') === $(this).attr('id')) {
            $button.attr('aria-expanded') === 'false' ? on($button, $target) : off($button, $target);
          }
          else {
            off($(this), $('#' + $(this).attr('aria-controls')), true);
          }
        });

        return;
      }

      $button.attr('aria-expanded') === 'false' ? on($button, $target) : off($button, $target);
    }

    function on($button, $target, clear){
      $target.stop().animate({ height: $target.prop('scrollHeight') }, { duration: _options.duration, complete: clear || after.bind(null, $button, $target) });
      $target.attr('aria-hidden', false);
      $button.attr('aria-expanded', true);
    }

    function off($button, $target, clear){
      $target.stop().animate({ height: 0 }, { duration: _options.duration, complete: clear || after.bind(null, $button, $target) });
      $target.attr('aria-hidden', true);
      $button.attr('aria-expanded', false);
    }

    function after($button, $target){
      _callback.after && _callback.after($button, $target);
    }

    function bind(selector){
      $(document).off('click', _options.selector, handler);
      _options.selector = selector || _options.selector;
      $(document).on('click', _options.selector, handler);
    }

    return {
      bind: bind,
      options: function(options){
        _options.selector = options.selector || _options.selector;
        _options.duration = options.duration || _options.duration;

        return this;
      },
      callback: function(event, callback){
        _callback[event] = callback;
      }
    }
  }());

  global.collapse = collapse;
}(window[namespace]));

/* TABS */
;(function(global){
  'use strict';

  var tab = (function(){
    var _options = {}
      , _callback = {};

    _options.selector = '[data-toggle=tab]';

    function handler(event){
      var $button = $(this)
        , $target = $('#' + $button.attr('aria-controls'))
        , _group = $button.data('group');

      _callback.before && _callback.before($button, $target);

      $(`[data-group="${ _group }"]`).each(function(){
        if ($button.attr('id') === $(this).attr('id')) {
          on($button, $target);
        }
        else {
          off($(this), $('#' + $(this).attr('aria-controls')), true);
        }
      });
    }

    function on($button, $target, clear){
      $button.attr('aria-selected', 'true');
      $target.show();
      after($button, $target);
    }

    function off($button, $target, clear){
      $button.attr('aria-selected', 'false');
      $target.hide();
    }

    function after($button, $target){
      _callback.after && _callback.after($button, $target);
    }

    function bind(selector){
      $(document).off('click', _options.selector, handler);
      _options.selector = selector || _options.selector;
      $(document).on('click', _options.selector, handler);
    }

    $(_options.selector).each(function(){
      $(this).attr('aria-selected') === 'true' && $('#' + $(this).attr('aria-controls')).show();
    });

    return {
      bind: bind,
      options: function(options){
        _options.selector = options.selector || _options.selector;

        return this;
      },
      callback: function(event, callback){
        _callback[event] = callback;
      }
    }
  }());

  global.tab = tab;
}(window[namespace]));

/* MODAL */
;(function(global){
  'use strict';

  var modal = (function(){
    var _options = {}
      , _callback = {};

    _options.selector = '[data-toggle=modal]';
    _options.contents = '.modal__content';
    _options.duration = 250;

    function handler(event){
      var $button = $(this)
        , $target = $($button.data('target'))
        , $content = $target.find(_options.contents)
        , _hidden = $target.attr('aria-hidden') === 'true';

      _callback.before && _callback.before($button, $target);

      _hidden ? on($button, $target, $content) : off($button, $target, $content);
    }

    function on($button, $target, $content, clear){
      var _animate = {};

      $target.attr('aria-hidden', false);
      $target.stop().animate({ backgroundColor: 'rgba(0, 0, 0, 0.5)' }, { duration: _options.duration });

      switch($target.data('placement')){
        case 'top': _animate = { top: 0 }; break;
        case 'right': _animate = { right: 0 }; break;
        case 'bottom': _animate = { bottom: 0 }; break;
        case 'left': _animate = { left: 0 }; break;
        default: _animate = { opacity: 1 }; break;
      }

      $content.animate(_animate, { duration: _options.duration, complete: after.bind(null, $button, $target) });
    }

    function off($button, $target, $content, clear){
      $target.attr('aria-hidden', true);
      $target.removeAttr('style');
      $content.removeAttr('style');
      after($button, $target);
    }

    function after($button, $target){
      _callback.after && _callback.after($button, $target);
    }

    function bind(selector){
      $(document).off('click', _options.selector, handler);
      _options.selector = selector || _options.selector;
      $(document).on('click', _options.selector, handler);

      $(document).on('click', function(event){
        if (!$(event.target).closest(_options.selector).length && !$(event.target).closest(_options.contents).length) {
          $(_options.selector).each(function(){
            $($(this).data('target')).attr('aria-hidden', true);
            $($(this).data('target')).removeAttr('style');
          });

          $(_options.contents).removeAttr('style');
        }
      });
    }

    return {
      bind: bind,
      options: function(options){
        _options.selector = options.selector || _options.selector;
        _options.contents = options.contents || _options.contents;
        _options.duration = options.duration || _options.duration;

        return this;
      },
      callback: function(event, callback){
        _callback[event] = callback;
      }
    }
  }());

  global.modal = modal;
}(window[namespace]));

/* POPOVER */
;(function(global){
  'use strict';

  var popover = (function(){
    var _options = {}
      , _callback = {};

    _options.selector = '[data-toggle=popover]';

    function handler(event){
      var $button = $(this)
        , $target = $($button.data('target'))
        , $parent = $target.data('parent') && $($target.data('parent'))
        , _role = $button.data('role')
        , _hidden = $target.attr('aria-hidden') === 'true';

      _callback.before && _callback.before($button, $target);

      $(_options.selector).each(function(){
        $($(this).data('target')).attr('aria-hidden', true);
      });

      switch (_role) {
        case 'show': on($button, $target, $parent); break;
        case 'hide': off($button, $target); break;
        default: _hidden ? on($button, $target, $parent) : off($button, $target); break;
      }
    }

    function on($button, $target, $parent, clear){
      $parent && $parent.length
        ? $parent.css('position', 'relative').append($target)
        : $button.append($target);

      $target.attr('aria-hidden', false);
      $target.attr('data-popover', true);
      after($button, $target);
    }

    function off($button, $target, clear){
      $target.attr('aria-hidden', true);
      $target.attr('data-popover', false);
      after($button, $target);
    }

    function after($button, $target){
      _callback.after && _callback.after($button, $target);
    }

    function bind(selector){
      $(document).off('click', _options.selector, handler);
      _options.selector = selector || _options.selector;
      $(document).on('click', _options.selector, handler);

      $(document).on('click', function(event){
        if (!$(event.target).is('[data-toggle=popover]') && !$(event.target).data('popover')) {
          $('[data-popover=true]').attr('aria-hidden', true);
        }
      });

      $(window).on('scroll', function(event){
        $('[data-popover=true]').attr('aria-hidden', true);
      });
    }

    return {
      bind: bind,
      options: function(options){
        _options.selector = options.selector || _options.selector;

        return this;
      },
      callback: function(event, callback){
        _callback[event] = callback;
      }
    }
  }());

  global.popover = popover;
}(window[namespace]));

/* TOAST */
;(function(global){
  'use strict';

  var toast = (function(){
    var _options = {}
      , _callback = {};

    _options.selector = '[data-toggle=toast]';

    function handler(){}

    function on(){}

    function off(){}

    function after(){}

    function bind(){}

    return {
      bind: bind,
      options: function(){},
      callback: function(){}
    }
  }());

  global.toast = toast;
}(window[namespace]));

/* DROPDOWN */
;(function(global){
  'use strict';

  var dropdown = (function(){
    var _options = {}
      , _callback = {};

    _options.selector = '[data-toggle=dropdown]';

    function handler(event){
      var $button = $(this)
        , $target = $(`#${ $button.attr('aria-controls') }`)
        , _hidden = $target.attr('aria-hidden') === 'true';

      _callback.before && _callback.before($button, $target);

      _hidden ? on($button, $target) : off($button, $target);
    }

    function handlerItem(event){
      var $button = $(this)
      , $parent = $button.closest('[role=listbox]')
      , $target = $(`[aria-controls=${ $parent.attr('id') }]`);

      $parent.find('[role=option]').removeAttr('aria-selected');
      $button.attr('aria-selected', true);
      $target.text($button.text());
      $target.attr('aria-activedescendant', $button.attr('id'));

      off($target, $parent);
    }

    function on($button, $target){
      $button.attr('aria-expanded', true);
      $target.attr('aria-hidden', false);
      after($button, $target);
    }

    function off($button, $target){
      $button.attr('aria-expanded', false);
      $target.attr('aria-hidden', true);
      after($button, $target);
    }

    function after($button, $target){
      _callback.after && _callback.after($button, $target);
    }

    function bind(selector){
      $(document).off('click', _options.selector, handler);
      $(document).off('click', `${ _options.selector } + [role=listbox] [role=option]`, handlerItem);
      _options.selector = selector || _options.selector;
      $(document).on('click', _options.selector, handler);
      $(document).on('click', `${ _options.selector } + [role=listbox] [role=option]`, handlerItem);
    }

    return {
      bind: bind,
      options: function(options){
        _options.selector = options.selector || _options.selector;

        return this;
      },
      callback: function(event, callback){
        _callback[event] = callback;
      }
    }
  }());

  global.dropdown = dropdown;
}(window[namespace]));

$(function(){
  UI.collapse.bind();
  UI.tab.bind();
  UI.modal.bind();
  UI.popover.bind();
  UI.dropdown.bind();

  // TODO
  // UI.toast.bind();
});