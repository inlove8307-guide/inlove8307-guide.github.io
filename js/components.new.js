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
      active: '_collapse-active',
      group: '_collapse-group',
      duration: '250ms',
      easing: 'cubic-bezier(.65,.05,.36,1)'
    });

    function init(){
      $(this.prop('container')).append(style.call(this));
      this.prop('on').init && this.prop('on').init($(this.class('selector')));
      this.change.observe(this);
      this.scroll.observe(this);
    }

    function style(){
      var result
        , tagname = 'style'
        , attribute = 'data-selector';

      $(`${tagname}[${attribute}=${this.prop('selector')}]`).remove();

      result = $(`<${tagname}>`, { text:
        `${this.class('selector')} {
          overflow: hidden;
          border-radius: 5px;
          border: 1px solid rgb(0, 0, 0);
          background-color: rgb(255, 255, 255);
        }
        ${this.class('selector')} ${this.class('item')} + ${this.class('item')} {
          border-top: 1px solid rgb(0, 0, 0);
        }
        ${this.class('selector')} ${this.class('button')} {
          padding: 10px;
          width: 100%;
          background-color: rgb(255, 255, 255);
          text-align: left;
          color: rgb(136, 136, 136);
          transition: all ${this.prop('duration')} ${this.prop('easing')};
        }
        ${this.class('selector')}  ${this.class('target')} {
          overflow: hidden;
          height: 0;
          box-shadow: inset 0 1px 0 rgba(0, 0, 0, 0);
          transition: all ${this.prop('duration')} ${this.prop('easing')};
        }
        ${this.class('selector')} ${this.class('target')} > * {
          padding: 10px;
        }
        ${this.class('selector')} ${this.class('button')}${this.class('active')} {
          background-color: rgb(238, 238, 238);
          color: rgb(0, 0, 0);
        }
        ${this.class('selector')} ${this.class('target')}${this.class('active')} {
          box-shadow: inset 0 1px 0 rgba(0, 0, 0, 1);
          height: auto;
        }`
      });

      result.attr(attribute, this.prop('selector'));

      return result;
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
      buttons: '_tabs-buttons',
      button: '_tabs-button',
      targets: '_tabs-targets',
      target: '_tabs-target',
      active: '_tabs-active',
      duration: '250ms',
      easing: 'cubic-bezier(.65,.05,.36,1)'
    });

    function init(){
      $(this.prop('container')).append(style.call(this));

      this.prop('on').init && this.prop('on').init($(this.class('selector')));
      this.change.observe(this);
      this.scroll.observe(this);
    }

    function style(){
      var result
        , tagname = 'style'
        , attribute = 'data-selector';

      $(`${tagname}[${attribute}=${this.prop('selector')}]`).remove();

      result = $(`<${tagname}>`, { text:
        `${this.class('selector')} {
          overflow: hidden;
          border-radius: 5px;
          border: 1px solid rgb(0, 0, 0);
          background-color: rgb(255, 255, 255);
        }
        ${this.class('selector')} ${this.class('buttons')} {
          display: flex;
        }
        ${this.class('selector')} ${this.class('button')} {
          flex-grow: 1;
          flex-shrink: 0;
          flex-basis: 0;
          position: relative;
          padding: 10px;
          background-color: rgb(238, 238, 238);
          color: rgb(136, 136, 136);
          transition: all ${this.prop('duration')} ${this.prop('easing')};
        }
        ${this.class('selector')} ${this.class('button')}::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0;
          height: 2px;
          background-color: rgb(0, 0, 0);
          transform: translateX(-50%);
          transition: width ${this.prop('duration')} ${this.prop('easing')};
        }
        ${this.class('selector')} ${this.class('targets')} {
          position: relative;
          box-shadow: inset 0 1px 0 rgb(0, 0, 0);
        }
        ${this.class('selector')} ${this.class('target')} {
          visibility: hidden;
          position: absolute;
          z-index: -1;
          top: 0;
          left: 0;
          width: 100%;
          opacity: 0.5;
          transition: opacity ${this.prop('duration')} ${this.prop('easing')};
        }
        ${this.class('selector')} ${this.class('target')} > * {
          padding: 10px;
        }
        ${this.class('selector')} ${this.class('button')}${this.class('active')} {
          color: rgb(0, 0, 0);
        }
        ${this.class('selector')} ${this.class('button')}${this.class('active')}::after {
          width: 100%;
        }
        ${this.class('selector')} ${this.class('target')}${this.class('active')} {
          visibility: visible;
          position: relative;
          z-index: 0;
          opacity: 1;
        }`
      });

      result.attr(attribute, this.prop('selector'));

      return result;
    }

    function handlerClick(event){
      var $button = $(event.target).closest(this.class('button'))
        , $selector = $button.closest(this.class('selector'))
        , $buttons = this.nearest($selector, this.class('button'))
        , $targets = this.nearest($selector, this.class('target'))
        , $target = $targets.eq($button.index());

      $buttons.removeClass(this.prop('active'));
      $targets.removeClass(this.prop('active'));

      $button.addClass(this.prop('active'));
      $target.addClass(this.prop('active'));

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
      content: '_alert-content',
      message: '_alert-message',
      active: '_alert-active',
      close: '_alert-close',
      duration: '250ms',
      easing: 'cubic-bezier(.86, 0, .07, 1)'
    });

    function init(){
      $(this.prop('container')).append(style.call(this));
      this.prop('on').init && this.prop('on').init($(this.class('selector')));
    }

    function style(){
      var result
        , tagname = 'style'
        , attribute = 'data-selector';

      $(`${tagname}[${attribute}=${this.prop('selector')}]`).remove();

      result = $(`<${tagname}>`, { text:
        `${this.class('selector')} {
          display: flex;
          justify-content: center;
          align-items: center;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          opacity: 0;
          pointer-events: none;
          transition: all ${this.prop('duration')} ${this.prop('easing')};
        }
        ${this.class('selector')} ${this.class('content')} {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 16px;
          width: calc(100% - 48px);
          min-height: 200px;
          border-radius: 10px;
          background-color: rgb(255, 255, 255);
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.25);
        }
        ${this.class('selector')} ${this.class('message')} {
          flex-grow: 1;
          flex-shrink: 0;
          flex-basis: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
        }
        ${this.class('selector')} ${this.class('close')} {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 16px;
          width: 100%;
          height: 48px;
          border-radius: 10px;
          background-color: rgb(0, 0, 0);
          color: rgb(255, 255, 255);
        }
        ${this.class('selector')}${this.class('active')} {
          pointer-events: initial;
          opacity: 1;
        }`
      });

      result.attr(attribute, this.prop('selector'));

      return result;
    }

    function html(options){
      var result =
        `<div class="${this.prop('selector')}">
          <div class="${this.prop('content')}">
            <div class="${this.prop('message')}">${options.message}</div>
            <button type="button" class="${this.prop('close')}">
              ${options.button}
            </button>
          </div>
        </div>`;

      return result;
    }

    function handlerEnd(event){
      if ($(event.target).hasClass(this.prop('active'))) {
        this.prop('on').show && this.prop('on').show($(event.target));
      }
      else {
        this.prop('on').hide && this.prop('on').hide($(event.target));
        $(event.target).remove();
      }
    }

    component.show = function(options){
      var options = $.extend({ message: 'message', button: 'confirm' }, options)
        , timeout;

      function active(){
        $(this.prop('container')).find(this.class('selector')).addClass(this.prop('active'));
        clearTimeout(timeout);
      }

      $(this.prop('container')).find(this.class('selector')).remove();
      $(this.prop('container')).append(html.call(this, options));

      timeout = setTimeout(active.bind(this), 1);

      this.change.observe(this);
    };

    component.hide = function(options){
      $(this.prop('container')).find(this.class('selector')).removeClass(this.prop('active'));
    };

    component.bind = function(options){
      $(this.prop('container')).off('TransitionEnd webkitTransitionEnd', this.class('selector'));
      $(this.prop('container')).off('click', `${this.class('selector')} ${this.class('close')}`);

      $.extend(this.options, options);

      $(this.prop('container')).on('TransitionEnd webkitTransitionEnd', this.class('selector'), handlerEnd.bind(this));
      $(this.prop('container')).on('click', `${this.class('selector')} ${this.class('close')}`, this.hide.bind(this));

      init.call(this);
    };

    return component;
  }();
}(window[namespace]));

/* INITIAL */
$(function(global){
  global.init = function(){
    this.collapse.bind({
      on: {
        init: function(){
          console.log('collapse init', arguments);
        },
        change: function(){
          console.log('collapse change', arguments);
        },
        scroll: function(){
          console.log('collapse scroll', arguments);
        },
        show: function(){
          console.log('collapse show', arguments);
        },
      }
    });
    this.tabs.bind({
      on: {
        init: function(){
          console.log('tabs init', arguments);
        },
        change: function(){
          console.log('tabs change', arguments);
        },
        scroll: function(){
          console.log('tabs scroll', arguments);
        },
        show: function(){
          console.log('tabs show', arguments);
        },
      }
    });
    this.alert.bind({
      on: {
        init: function(){
          console.log('alert init', arguments);
        },
        change: function(){
          console.log('alert change', arguments);
        },
        show: function(){
          console.log('alert show', arguments);
        },
        hide: function(){
          console.log('alert hide', arguments);
        },
      }
    });
  };

  global.init();
}(window[namespace]));