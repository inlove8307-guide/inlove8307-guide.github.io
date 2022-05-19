/* COMPONENT */
(function(global){
  'use strict';

  global.component = function(options){
    this.options = $.extend({}, options);
    this.callback = {};

    this.init = function(callback){
      $.each(this.prop('on'), function(key, value){
        this.callback[key] = value;
      }.bind(this));

      callback && callback.call(this);
    };

    this.prop = function(key, value){
      if (value) {
        this.options[key] = value;
        this.bind && this.bind();
      }
      else return this.options[key];
    };

    this.on = function(event, callback){
      if (this.is('object', event)) {
        $.each(event, function(key, value){
          this.callback[key] = value;
        }.bind(this));
      }

      if (this.is('string', event) && callback) {
        this.callback[event] = callback;
      }

      this.bind && this.bind();
    };

    this.is = function(type, target){
      return $.type(target) === type;
    };

    this.replace = function(string){
      return string.replace(/[.#]/g, '');
    };

    this.change = {
      observe: function(context, options){
        if (!context.callback.change) return;

        var config = $.extend({
          attributes: true,
          childList: true,
          subtree: true,
          characterData: true,
          attributeOldValue: true,
          characterDataOldValue: true
        }, options);

        this.observer = new MutationObserver(context.callback.change);

        $.each($(context.options.selector), function(index, target){
          this.observer.observe(target, config);
        }.bind(this));
      },
      disconnect: function(){
        this.observer && this.observer.disconnect();
      },
      takeRecords: function(){
        this.observer && this.observer.takeRecords();
      }
    };

    this.scroll = {
      observe: function(context, options){
        if (!context.callback.scroll) return;

        var config = $.extend({
          root: document,
          rootMargin: '0px 0px 0px 0px',
          threshold: 0
        }, options);

        this.observer = new IntersectionObserver(context.callback.scroll, config);

        $.each($(context.options.selector), function(index, target){
          this.observer.observe(target);
        }.bind(this));
      },
      disconnect: function(){
        this.observer && this.observer.disconnect();
      },
      takeRecords: function(){
        this.observer && this.observer.takeRecords();
      },
      unobserve: function(){
        this.observer && this.observer.unobserve();
      }
    };
  };
}(window[namespace]));

/* COLLAPSE */
(function(global){
  global.collapse = function(){
    var component = new global.component({
      container: 'body',
      selector: '.data-collapse',
      item: '.data-item',
      button: '.data-button',
      target: '.data-target',
      active: '.data-active',
      group: '.data-group',
      duration: '250ms',
      easing: 'cubic-bezier(.65,.05,.36,1)'
    });

    function init(){
      $(this.prop('container')).append(style.call(this));
      this.callback.init && this.callback.init();
      this.change.observe(this);
    }

    function style(){
      var result
        , tagname = 'style'
        , attribute = 'data-selector';

      $(`${tagname}[${attribute}=${this.replace(this.prop('selector'))}]`).remove();

      result = $(`<${tagname}>`, { text:
        `${this.prop('selector')} {
          border-radius: 5px;
          box-shadow: inset 0 0 0 1px rgb(0, 0, 0);
        }
        ${this.prop('selector')} > ${this.prop('item')} + ${this.prop('item')} {
          box-shadow: inset 0 1px 0 rgb(0, 0, 0);
        }
        ${this.prop('selector')} > ${this.prop('item')} > ${this.prop('button')} {
          padding: 10px;
          width: 100%;
          text-align: left;
        }
        ${this.prop('selector')} > ${this.prop('item')} > ${this.prop('target')} {
          overflow: hidden;
          height: 0;
          box-shadow: inset 0 1px 0 rgba(0, 0, 0, 0);
          transition: all ${this.prop('duration')} ${this.prop('easing')};
        }
        ${this.prop('selector')} > ${this.prop('item')} > ${this.prop('target')} > * {
          padding: 10px;
        }
        ${this.prop('selector')} > ${this.prop('item')}${this.prop('active')} > ${this.prop('button')} {
          font-weight: bold;
        }
        ${this.prop('selector')} > ${this.prop('item')}${this.prop('active')} > ${this.prop('target')} {
          box-shadow: inset 0 1px 0 rgba(0, 0, 0, 1);
          height: auto;
        }`
      });

      result.attr(attribute, this.replace(this.prop('selector')));

      return result;
    }

    function handlerClick(event){
      var context = this
        , $button = $(event.target).closest(this.prop('button'))
        , $item = $button.closest(this.prop('item'));

      if (!$button.length) return;

      $item.hasClass(this.replace(this.prop('active')))
        ? hide.call(this, $item)
        : show.call(this, $item);

      if (!$item.closest(this.prop('selector')).hasClass(this.replace(this.prop('group')))) return;

      $item.siblings().each(function(){
        hide.call(context, $(this));
      });
    }

    function handlerTransitionEnd(event){
      $(event.target).removeAttr('style');
    }

    function show($item){
      var $target = $item.find(this.prop('target'));

      $target.height(0);
      $target.height($target.prop('scrollHeight'));
      $item.addClass(this.replace(this.prop('active')));

      this.callback.show && this.callback.show($item);
    }

    function hide($item){
      var $target = $item.find(this.prop('target'));

      $target.height($target.height());
      $target.height(0);
      $item.removeClass(this.replace(this.prop('active')));
    }

    component.bind = function(options){
      $(this.prop('container')).off('TransitionEnd webkitTransitionEnd', `${this.prop('selector')} > > ${this.prop('target')}`);
      $(this.prop('container')).off('click', `${this.prop('selector')} > > ${this.prop('button')}`);

      $.extend(this.options, options);

      $(this.prop('container')).on('TransitionEnd webkitTransitionEnd', `${this.prop('selector')} > > ${this.prop('target')}`, handlerTransitionEnd.bind(this));
      $(this.prop('container')).on('click', `${this.prop('selector')} > > ${this.prop('button')}`, handlerClick.bind(this));

      this.init(init);
    };

    return component;
  }();
}(window[namespace]));

/* TABS */
(function(global){
  global.tabs = function(){
    var component = new global.component({
      container: 'body',
      selector: '.data-tabs',
      buttons: '.data-buttons',
      button: '.data-button',
      contents: '.data-targets',
      target: '.data-target',
      active: '.data-active',
      duration: '250ms',
      easing: 'cubic-bezier(.65,.05,.36,1)'
    });

    function init(){
      $(this.prop('container')).append(style.call(this));

      this.callback.init && this.callback.init();
      this.change.observe(this);
    }

    function style(){
      var result
        , tagname = 'style'
        , attribute = 'data-selector';

      $(`${tagname}[${attribute}=${this.replace(this.prop('selector'))}]`).remove();

      result = $(`<${tagname}>`, { text:
        `${this.prop('selector')} {
          border-radius: 5px;
          box-shadow: inset 0 0 0 1px rgb(0, 0, 0);
        }
        ${this.prop('selector')} > ${this.prop('buttons')} {
          display: flex;
        }
        ${this.prop('selector')} > ${this.prop('buttons')} > ${this.prop('button')} {
          flex-grow: 1;
          flex-shrink: 0;
          flex-basis: 0;
          position: relative;
          padding: 10px;
        }
        ${this.prop('selector')} > ${this.prop('buttons')} > ${this.prop('button')}::after {
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
        ${this.prop('selector')} > ${this.prop('contents')} {
          position: relative;
          box-shadow: inset 0 1px 0 rgb(0, 0, 0);
        }
        ${this.prop('selector')} > ${this.prop('contents')} > ${this.prop('target')} {
          overflow: hidden;
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 0;
          transition: height ${this.prop('duration')} ${this.prop('easing')};
        }
        ${this.prop('selector')} > ${this.prop('contents')} > ${this.prop('target')} > * {
          padding: 10px;
        }
        ${this.prop('selector')} > ${this.prop('buttons')} > ${this.prop('button')}${this.prop('active')} {
          font-weight: bold;
        }
        ${this.prop('selector')} > ${this.prop('buttons')} > ${this.prop('button')}${this.prop('active')}::after {
          width: 100%;
        }
        ${this.prop('selector')} > ${this.prop('contents')} > ${this.prop('target')}${this.prop('active')} {
          position: relative;
          height: auto;
        }`
      });

      result.attr(attribute, this.replace(this.prop('selector')));

      return result;
    }

    function handlerClick(event){
      var $button = $(event.target).closest(this.prop('button'))
        , $buttons = $button.closest(this.prop('buttons'))
        , $contents = $buttons.next(this.prop('contents'))
        , $target = $contents.children(this.prop('target')).eq($button.index());

      if (!$button.length) return;

      $buttons.children(this.prop('button')).removeClass(this.replace(this.prop('active')));
      $contents.children(this.prop('target')).removeClass(this.replace(this.prop('active')));

      $target.height($target.prop('scrollHeight'));
      $button.addClass(this.replace(this.prop('active')));
      $target.addClass(this.replace(this.prop('active')));

      this.callback.show && this.callback.show($.merge($button, $target));
    }

    function handlerTransitionEnd(event){
      $(event.target).removeAttr('style');
    }

    component.bind = function(options){
      $(this.prop('container')).off('TransitionEnd webkitTransitionEnd', `${this.prop('selector')} > > ${this.prop('target')}`);
      $(this.prop('container')).off('click', `${this.prop('selector')} > > ${this.prop('button')}`);

      $.extend(this.options, options);

      $(this.prop('container')).on('TransitionEnd webkitTransitionEnd', `${this.prop('selector')} > > ${this.prop('target')}`, handlerTransitionEnd.bind(this));
      $(this.prop('container')).on('click', `${this.prop('selector')} > > ${this.prop('button')}`, handlerClick.bind(this));

      this.init(init);
    };

    return component;
  }();
}(window[namespace]));

/* ALERT */
(function(global){
  global.alert = function(){
    var component = new global.component({
      container: 'body',
      selector: '.data-alert',
      active: '.data-active',
      close: '.data-close',
      duration: '250ms',
      easing: 'cubic-bezier(.86, 0, .07, 1)'
    });

    function init(){
      $(this.prop('container')).append(style.call(this));
      this.callback.init && this.callback.init();
    }

    function style(){
      var result
        , tagname = 'style'
        , attribute = 'data-selector';

      $(`${tagname}[${attribute}=${this.replace(this.prop('selector'))}]`).remove();

      result = $(`<${tagname}>`, { text:
        `${this.prop('selector')} {
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
        ${this.prop('selector')} > * {
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
        ${this.prop('selector')} > * > :not(${this.prop('close')}) {
          flex-grow: 1;
          flex-shrink: 0;
          flex-basis: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
        }
        ${this.prop('selector')} ${this.prop('close')} {
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
        ${this.prop('selector')}${this.prop('active')} {
          pointer-events: initial;
          opacity: 1;
        }`
      });

      result.attr(attribute, this.replace(this.prop('selector')));

      return result;
    }

    function html(options){
      var result =
        `<div class="${this.replace(this.prop('selector'))}">
          <div>
            <p>${options.message}</p>
            <button type="button" class="${this.replace(this.prop('close'))}">
              ${options.button}
            </button>
          </div>
        </div>`;

      return result;
    }

    function handler(event){
      if ($(event.target).hasClass(this.replace(this.prop('active')))) {
        this.callback.show && this.callback.show($(event.target));
      }
      else {
        this.callback.hide && this.callback.hide($(event.target));
        this.change.disconnect();
        $(event.target).remove();
      }
    }

    component.show = function(options){
      var options = $.extend({ message: 'message', button: 'confirm' }, options)
        , timeout;

      function active(){
        $(this.prop('container')).find(this.prop('selector')).addClass(this.replace(this.prop('active')));
        clearTimeout(timeout);
      }

      $(this.prop('container')).find(this.prop('selector')).remove();
      $(this.prop('container')).append(html.call(this, options));

      timeout = setTimeout(active.bind(this), 1);

      this.change.observe(this);
    };

    component.hide = function(options){
      $(this.prop('container')).find(this.prop('selector')).removeClass(this.replace(this.prop('active')));
    };

    component.bind = function(options){
      $(this.prop('container')).off('TransitionEnd webkitTransitionEnd', this.prop('selector'));
      $(this.prop('container')).off('click', `${this.prop('selector')} ${this.prop('close')}`);

      $.extend(this.options, options);

      $(this.prop('container')).on('TransitionEnd webkitTransitionEnd', this.prop('selector'), handler.bind(this));
      $(this.prop('container')).on('click', `${this.prop('selector')} ${this.prop('close')}`, this.hide.bind(this));

      this.init(init);
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

    // this.collapse.bind({
    //   on: {
    //     change: function(){
    //       console.log('collapse change');
    //     }
    //   }
    // });
    // this.tabs.bind({
    //   on: {
    //     change: function(){
    //       console.log('tabs change');
    //     }
    //   }
    // });
    // this.alert.bind({
    //   on: {
    //     change: function(){
    //       console.log('alert change');
    //     }
    //   }
    // });
  };

  global.init();

  // UI.collapse.on({
  //   show: function(){
  //     console.log('collapse show');
  //   }
  // });
  // UI.tabs.on({
  //   show: function(){
  //     console.log('tabs show');
  //   }
  // });
  // UI.alert.on({
  //   show: function(){
  //     console.log('alert show');
  //   },
  //   hide: function(){
  //     console.log('alert hide');
  //   }
  // });

  // UI.collapse.on('show', function(){
  //   console.log('collapse show');
  // });
  // UI.tabs.on('show', function(){
  //   console.log('tabs show');
  // });
  // UI.alert.on('show', function(){
  //   console.log('alert show');
  // });
  // UI.alert.on('hide', function(){
  //   console.log('alert hide');
  // });
}(window[namespace]));
