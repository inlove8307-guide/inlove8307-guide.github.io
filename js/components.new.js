var namespace = 'UI';

window[namespace] = window[namespace] || {};

/* COMPONENT */
(function(global){
  'use strict';

  global.component = function(options){
    this.options = $.extend({ on: {} }, options);

    this.on = function(event, callback){
      if (this.is('object', event)) {
        $.each(event, function(key, value){
          this.prop('on')[key] = value;
        }.bind(this));

        this.bind && this.bind();
      }

      if (this.is('string', event) && callback) {
        this.prop('on')[event] = callback;

        switch(event){
          case 'init': this.bind && this.bind(); break;
          case 'change': this.change.observe(this); break;
          case 'scroll': this.scroll.observe(this); break;
        }
      }
    };

    this.is = function (type, target) {
      return $.type(target) === type;
    };

    this.prop = function (key, value) {
      if (value) {
        this.options[key] = value;
        this.bind && this.bind();
      }
      else return this.options[key];
    };

    this.class = function (string) {
      return `.${this.prop(string)}`;
    };

    this.style = function(target, string){
      var tagname = 'style'
        , attribute = 'data-selector';

      $(`${tagname}[${attribute}=${this.prop('selector')}]`).remove();
      $(target).append($(`<${tagname}>`, { text: string, attribute: this.prop('selector') }));
    };

    this.nearest = function($current, selector){
      var $result;

      do {
        $current = $current.children();
        $result = $current.filter(selector);
      }
      while (!$result.length)

      return $result;
    };

    this.change = {
      observe: function(context, options){
        if (!context.prop('on').change) return;

        var config = $.extend({
          attributes: true,
          childList: true,
          subtree: true,
          characterData: true,
          attributeOldValue: true,
          characterDataOldValue: true
        }, options);

        this.observer && this.disconnect();
        this.observer = new MutationObserver(context.prop('on').change);

        $.each($(context.class('selector')), function(index, target){
          this.observer.observe(target, config);
        }.bind(this));
      },
      disconnect: function(){
        this.observer && this.observer.disconnect();
      },
      takeRecords: function(){
        return this.observer && this.observer.takeRecords();
      }
    };

    this.scroll = {
      observe: function(context, options){
        if (!context.prop('on').scroll) return;

        var config = $.extend({
          root: document,
          rootMargin: '0px 0px 0px 0px',
          threshold: 0
        }, options);

        this.observer && this.disconnect();
        this.observer = new IntersectionObserver(context.prop('on').scroll, config);

        $.each($(context.class('selector')), function(index, target){
          this.observer.observe(target);
        }.bind(this));
      },
      disconnect: function(){
        this.observer && this.observer.disconnect();
      },
      takeRecords: function(){
        return this.observer && this.observer.takeRecords();
      },
      unobserve: function(){
        this.observer && this.observer.unobserve();
      }
    };
  };
}(window[namespace]));

/* COLLAPSE */
(function(global){
  'use strict';

  global.collapse = function(){
    var component = new global.component({
      container: 'body',
      selector: '_collapse',
      item: '_collapse-item',
      button: '_collapse-button',
      target: '_collapse-target',
      active: '_active',
      group: '_group',
      duration: '250ms',
      easing: 'cubic-bezier(.65,.05,.36,1)'
    });

    function init(){
      this.style(this.prop('container'), style.call(this));
      this.prop('on').init && this.prop('on').init($(this.class('selector')));
      this.change.observe(this);
      this.scroll.observe(this);
    }

    function style(){
      return `
        ${this.class('selector')} ${this.class('button')} {
          transition: all ${this.prop('duration')} ${this.prop('easing')};
        }
        ${this.class('selector')}  ${this.class('target')} {
          transition: all ${this.prop('duration')} ${this.prop('easing')};
        }`;
    }

    function handlerClick(event){
      var context = this
        , $button = $(event.target).closest(this.class('button'))
        , $selector = $button.closest(this.class('selector'))
        , $item = $button.closest(this.class('item'))
        , $target = this.nearest($item, this.class('target'));

      $button.hasClass(this.prop('active'))
        ? hide.call(this, $button, $target)
        : show.call(this, $button, $target);

      if (!$selector.hasClass(this.prop('group'))) return;

      $item.siblings(this.class('item')).each(function(){
        var $button = context.nearest($(this), context.class('button'))
          , $target = context.nearest($(this), context.class('target'));

        hide.call(context, $button, $target);
      });
    }

    function handlerEnd(event){
      $(event.target).removeAttr('style');
    }

    function show($button, $target){
      $target.height(0);
      $target.height($target.prop('scrollHeight'));
      $button.addClass(this.prop('active'));
      $target.addClass(this.prop('active'));

      this.prop('on').show && this.prop('on').show($button, $target);
    }

    function hide($button, $target){
      $target.height($target.height());
      $target.height(0);
      $button.removeClass(this.prop('active'));
      $target.removeClass(this.prop('active'));
    }

    component.bind = function(options){
      $(this.prop('container')).off('TransitionEnd webkitTransitionEnd', `${this.class('selector')} ${this.class('target')}`);
      $(this.prop('container')).off('click', `${this.class('selector')} ${this.class('button')}`);

      $.extend(this.options, options);

      $(this.prop('container')).on('TransitionEnd webkitTransitionEnd', `${this.class('selector')} ${this.class('target')}`, handlerEnd.bind(this));
      $(this.prop('container')).on('click', `${this.class('selector')} ${this.class('button')}`, handlerClick.bind(this));

      init.call(this);
    };

    return component;
  }();
}(window[namespace]));

/* TABS */
(function(global){
  'use strict';

  global.tabs = function(){
    var component = new global.component({
      container: 'body',
      selector: '_tabs',
      button: '_tabs-button',
      target: '_tabs-target',
      scroll: '_tabs-scroll',
      active: '_active',
      duration: '250ms',
      easing: 'cubic-bezier(.65,.05,.36,1)'
    });

    function init(){
      this.style(this.prop('container'), style.call(this));
      this.prop('on').init && this.prop('on').init($(this.class('selector')));
      this.change.observe(this);
      this.scroll.observe(this);
    }

    function style(){
      return `
        ${this.class('selector')} ${this.class('button')} {
          transition: color ${this.prop('duration')} ${this.prop('easing')};
        }
        ${this.class('selector')} ${this.class('button')}::after {
          transition: width ${this.prop('duration')} ${this.prop('easing')};
        }
        ${this.class('selector')} ${this.class('target')} {
          transition: opacity ${this.prop('duration')} ${this.prop('easing')};
        }`;
    }

    function handlerClick(event){
      var $button = $(event.target).closest(this.class('button'))
        , $scroll = $button.closest(this.class('scroll'))
        , $selector = $button.closest(this.class('selector'))
        , $buttons = this.nearest($selector, this.class('button'))
        , $targets = this.nearest($selector, this.class('target'))
        , $target = $targets.eq($button.index());

      $buttons.removeClass(this.prop('active'));
      $targets.removeClass(this.prop('active'));

      $button.addClass(this.prop('active'));
      $target.addClass(this.prop('active'));

      $scroll.length && $scroll.stop().animate({ scrollLeft: $scroll.scrollLeft() + $button.position().left - $button.prev().outerWidth() }, { duration: parseInt(this.prop('duration')), ease: this.prop('easing') });

      this.prop('on').show && this.prop('on').show($button, $target);
    }

    function handlerEnd(event){
      $(event.target).removeAttr('style');
    }

    component.bind = function(options){
      $(this.prop('container')).off('TransitionEnd webkitTransitionEnd', `${this.class('selector')} ${this.class('target')}`);
      $(this.prop('container')).off('click', `${this.class('selector')} ${this.class('button')}`);

      $.extend(this.options, options);

      $(this.prop('container')).on('TransitionEnd webkitTransitionEnd', `${this.class('selector')} ${this.class('target')}`, handlerEnd.bind(this));
      $(this.prop('container')).on('click', `${this.class('selector')} ${this.class('button')}`, handlerClick.bind(this));

      init.call(this);
    };

    return component;
  }();
}(window[namespace]));

/* ALERT */
(function(global){
  'use strict';

  global.alert = function(){
    var component = new global.component({
      container: 'body',
      selector: '_alert',
      confirm: '_alert-confirm',
      cancel: '_alert-cancel',
      active: '_active',
      duration: '250ms',
      easing: 'cubic-bezier(.86, 0, .07, 1)'
    });

    function init(){
      this.style(this.prop('container'), style.call(this));
      this.prop('on').init && this.prop('on').init($(this.class('selector')));
    }

    function style(){
      return `
        ${this.class('selector')} {
          transition: all ${this.prop('duration')} ${this.prop('easing')};
        }`;
    }

    function html(options){
      return `
        <div class="alert ${this.prop('selector')}" tabindex="0">
          <div class="alert-content">
            <div class="alert-message">${options.message}</div>
            <div class="button-group">
              <button type="button" class="button grow ${this.prop('cancel')}">${options.cancel}</button>
              <button type="button" class="button grow dark ${this.prop('confirm')}">${options.confirm}</button>
            </div>
          </div>
        </div>`;
    }

    function handlerClick(event){
      var $target = $(event.target);

      $target.hasClass(this.prop('cancel')) && this.prop('on').cancel && this.prop('on').cancel();
      $target.hasClass(this.prop('confirm')) && this.prop('on').confirm && this.prop('on').confirm();

      this.hide();
    }

    function handlerEnd(event){
      var $selector = $(event.target).hasClass(this.prop('selector')) ? $(event.target) : null;

      if ($selector) {
        $selector.hasClass(this.prop('active'))
          ? $selector.focusin()
          : $selector.remove();
      }
    }

    component.show = function(options){
      var $selector = $(this.class('selector'))
        , options = $.extend({ message: 'message', confirm: 'confirm', cancel: null }, options)
        , timeout;

      function active($selector){
        $selector.addClass(this.prop('active'));
        clearTimeout(timeout);
      }

      if ($selector.length) {
        $selector.remove();
        this.hide();
      }

      $(this.prop('container')).append(html.call(this, options));
      $selector = $(this.class('selector'));
      !options.cancel && $selector.find(this.class('cancel')).remove();
      timeout = setTimeout(active.bind(this, $selector), 1);

      if (options.on) {
        this.on('confirm', options.on.confirm);
        this.on('cancel', options.on.cancel);
      }

      this.prop('on').show && this.prop('on').show();
      this.change.observe(this);
    };

    component.hide = function(){
      $(this.class('selector')).removeClass(this.prop('active'));
      this.prop('on').hide && this.prop('on').hide();
      delete this.prop('on').confirm;
      delete this.prop('on').cancel;
    };

    component.bind = function(options){
      $(this.prop('container')).off('TransitionEnd webkitTransitionEnd', this.class('selector'));
      $(this.prop('container')).off('click', `${this.class('selector')} ${this.class('cancel')}`);
      $(this.prop('container')).off('click', `${this.class('selector')} ${this.class('confirm')}`);

      $.extend(this.options, options);

      $(this.prop('container')).on('TransitionEnd webkitTransitionEnd', this.class('selector'), handlerEnd.bind(this));
      $(this.prop('container')).on('click', `${this.class('selector')} ${this.class('cancel')}`, handlerClick.bind(this));
      $(this.prop('container')).on('click', `${this.class('selector')} ${this.class('confirm')}`, handlerClick.bind(this));

      init.call(this);
    };

    return component;
  }();
}(window[namespace]));

/* INITIAL */
$(function(global){
  global.init = function(){
    this.collapse.bind();
    this.tabs.bind();
    this.alert.bind();
  };

  global.init();
}(window[namespace]));
