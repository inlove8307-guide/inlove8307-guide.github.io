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
        , attribute = 'data-selector'
        , object = {};

      $(`${tagname}[${attribute}=${this.prop('selector')}]`).remove();

      object['text'] = string;
      object[attribute] = this.prop('selector');

      $(target).append($(`<${tagname}>`, object));
    };

    this.nearest = function($current, selector){
      var $result;

      do {
        $current = $current.children();
        $result = $current.filter(selector);
      }
      while (!$result.length && $current.length)

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
        ${this.class('selector')} ${this.class('target')} {
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
      $target.css('max-height', 0);
      setTimeout(function(){
        $target.css('max-height', $target.prop('scrollHeight'));
      }, 10);

      $button.addClass(this.prop('active'));
      $target.addClass(this.prop('active'));

      this.prop('on').show && this.prop('on').show($button, $target);
    }

    function hide($button, $target){
      $target.css('max-height', $target.height());
      setTimeout(function(){
        $target.css('max-height', 0);
      }, 10);

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

      if ($selector.length) {
        $selector.remove();
        this.hide();
      }

      $(this.prop('container')).append(html.call(this, options));
      $selector = $(this.class('selector'));
      !options.cancel && $selector.find(this.class('cancel')).remove();
      timeout = setTimeout(function($selector){
        $selector.addClass(this.prop('active'));
        clearTimeout(timeout);
      }.bind(this, $selector), 10);

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

/* MODAL */
(function(global){
  'use strict';

  global.modal = function(){
    var component = new global.component({
      container: 'body',
      selector: '_modal',
      content: '_modal-content',
      close: '_modal-close',
      cancel: '_modal-cancel',
      confirm: '_modal-confirm',
      top: '_top',
      right: '_right',
      bottom: '_bottom',
      left: '_left',
      center: '_center',
      full: '_full',
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
          transition: opacity ${this.prop('duration')} ${this.prop('easing')};
        }
        ${this.class('selector')} ${this.class('content')} {
          transition: all ${this.prop('duration')} ${this.prop('easing')};
        }`;
    }

    function handlerEnd(event){}

    function handlerClick(event){
      var $target = $(event.target);

      $target.hasClass(this.prop('cancel')) && this.prop('on').cancel && this.prop('on').cancel();
      $target.hasClass(this.prop('confirm')) && this.prop('on').confirm && this.prop('on').confirm();

      this.hide();
    }

    component.show = function(options){
      var options = $.extend({ target: null }, options);

      if ($(options.target).length) this.prop('target', $(options.target));
      if (!this.prop('target')) this.prop('target', $(this.class('selector')).eq(0));
      if (!this.prop('target')) return;

      $(this.class('selector')).removeClass(this.prop('active'));
      this.prop('target').addClass(this.prop('active'));

      if (options.on) {
        this.on('confirm', options.on.confirm);
        this.on('cancel', options.on.cancel);
      }

      this.prop('on').show && this.prop('on').show();
      this.change.observe(this);
    };

    component.hide = function(){
      var $selector = this.prop('target') || $(this.class('selector'));

      $selector.removeClass(this.prop('active'));
      this.prop('on').hide && this.prop('on').hide();
      delete this.prop('on').confirm;
      delete this.prop('on').cancel;
    };

    component.bind = function(options){
      $(this.prop('container')).off('TransitionEnd webkitTransitionEnd', this.class('selector'));
      $(this.prop('container')).off('click', `${this.class('selector')} ${this.class('close')}`);
      $(this.prop('container')).off('click', `${this.class('selector')} ${this.class('cancel')}`);
      $(this.prop('container')).off('click', `${this.class('selector')} ${this.class('confirm')}`);

      $.extend(this.options, options);

      $(this.prop('container')).on('TransitionEnd webkitTransitionEnd', this.class('selector'), handlerEnd.bind(this));
      $(this.prop('container')).on('click', `${this.class('selector')} ${this.class('close')}`, handlerClick.bind(this));
      $(this.prop('container')).on('click', `${this.class('selector')} ${this.class('cancel')}`, handlerClick.bind(this));
      $(this.prop('container')).on('click', `${this.class('selector')} ${this.class('confirm')}`, handlerClick.bind(this));

      init.call(this);
    };

    return component;
  }();
}(window[namespace]));

/* POPOVER */
(function(global){
  'use strict';

  global.popover = function(){
    var component = new global.component({
      container: 'body',
      selector: '_popover',
      content: '_popover-content',
      message: '_popover-message',
      ground:  '_popover-ground',
      top: '_top',
      right: '_right',
      bottom: '_bottom',
      left: '_left',
      active: '_active',
      styled: '_styled',
      duration: '250ms',
      easing: 'cubic-bezier(.86, 0, .07, 1)'
    });

    function init(){
      this.style(this.prop('container'), style.call(this));
      this.prop('on').init && this.prop('on').init($(this.class('selector')));
    }

    function style(){
      return `
        ${this.class('selector')} ${this.class('content')} {
          transition: opacity ${this.prop('duration')} ${this.prop('easing')};
        }
        ${this.class('selector')} ${this.class('content')}::before {
          transition: opacity ${this.prop('duration')} ${this.prop('easing')};
        }`;
    }

    function css($selector){
      var $content = this.nearest($selector, this.class('content'))
        , $message = this.nearest($selector, this.class('message'))
        , $ground = $selector.closest(this.class('ground'))
        , direction = function(){
          if ($content.hasClass(this.prop('top'))) return this.prop('top');
          if ($content.hasClass(this.prop('bottom'))) return this.prop('bottom');
          if ($content.hasClass(this.prop('left'))) return this.prop('left');
          if ($content.hasClass(this.prop('right'))) return this.prop('right');
        }.call(this);

      if ($selector.hasClass(this.prop('styled'))) return;

      $message.css('width', function(){
        switch(direction){
          case this.prop('top'):
          case this.prop('bottom'): return $ground.width();
          case this.prop('left'): return $ground.width() - ($ground.width() - $message.offset().left) - $ground.offset().left;
          case this.prop('right'): return $ground.width() - $message.offset().left + $ground.offset().left;
        }
      }.call(this));

      $message.css('left', function(){
        switch(direction){
          case this.prop('top'):
          case this.prop('bottom'):
          case this.prop('left'): return - $message.offset().left + $ground.offset().left;
          case this.prop('right'): return 0;
        }
      }.call(this));

      $selector.addClass(this.prop('styled'));
    }

    function handlerEnd(event){}

    function handlerButton(event){
      var $selector = $(event.target).closest(this.class('selector'))
        , $content = this.nearest($selector, this.class('content'));

      css.call(this, $selector);

      if ($content.hasClass(this.prop('active'))) {
        $content.removeClass(this.prop('active'));
        this.prop('on').hide && this.prop('on').hide();
      }
      else {
        $content.addClass(this.prop('active'));
        this.prop('on').show && this.prop('on').show();
      }
    }

    component.bind = function(options){
      $(this.prop('container')).off('TransitionEnd webkitTransitionEnd', `${this.class('selector')} ${this.class('content')}`);
      $(this.prop('container')).off('click', `${this.class('selector')}`);

      $.extend(this.options, options);

      $(this.prop('container')).on('TransitionEnd webkitTransitionEnd', `${this.class('selector')} ${this.class('content')}`, handlerEnd.bind(this));
      $(this.prop('container')).on('click', `${this.class('selector')}`, handlerButton.bind(this));

      init.call(this);
    };

    return component;
  }();
}(window[namespace]));

/* DROPDOWN */
(function(global){
  'use strict';

  global.dropdown = function(){
    var component = new global.component({
      container: 'body',
      selector: '_dropdown',
      button: '_dropdown-button',
      option: '_dropdown-option',
      items: '_dropdown-items',
      active: '_active',
      revert: '_revert',
      duration: '250ms',
      easing: 'cubic-bezier(.86, 0, .07, 1)'
    });

    function init(){
      this.style(this.prop('container'), style.call(this));
      this.prop('on').init && this.prop('on').init($(this.class('selector')));
      this.change.observe(this);
      this.scroll.observe(this);
    }

    function style(){
      return `
        ${this.class('selector')} ${this.class('items')} {
          transition: height ${this.prop('duration')} ${this.prop('easing')};
        }`;
    }

    function handlerEnd(event){
        $(event.target).removeAttr('style');
    }

    function handlerButton(event){
      var $selector = $(event.target).closest(this.class('selector'))
        , $items = this.nearest($selector, this.class('items'));

      $items.hasClass(this.prop('active'))
        ? hide.call(this, $items)
        : show.call(this, $items);
    }

    function handlerOption(event){
      var $option = $(event.target)
        , $selector = $option.closest(this.class('selector'))
        , $options = this.nearest($selector, this.class('option'))
        , $button = this.nearest($selector, this.class('button'))
        , $items = this.nearest($selector, this.class('items'));

      $button.text($option.text());
      $options.removeClass(this.prop('active'));
      $option.addClass(this.prop('active'));
      hide.call(this, $items);
    }

    function show($items){
      $items.height(0);
      $items.height($items.prop('scrollHeight'));
      $items.addClass(this.prop('active'));
      this.prop('on').show && this.prop('on').show();
    }

    function hide($items){
      $items.removeClass(this.prop('active'));
      this.prop('on').hide && this.prop('on').hide();
    }

    component.bind = function(options){
      $(this.prop('container')).off('TransitionEnd webkitTransitionEnd', `${this.class('selector')} ${this.class('items')}`);
      $(this.prop('container')).off('click', `${this.class('selector')} ${this.class('button')}`);
      $(this.prop('container')).off('click', `${this.class('selector')} ${this.class('option')}`);

      $.extend(this.options, options);

      $(this.prop('container')).on('TransitionEnd webkitTransitionEnd', `${this.class('selector')} ${this.class('items')}`, handlerEnd.bind(this));
      $(this.prop('container')).on('click', `${this.class('selector')} ${this.class('button')}`, handlerButton.bind(this));
      $(this.prop('container')).on('click', `${this.class('selector')} ${this.class('option')}`, handlerOption.bind(this));

      init.call(this);
    };

    return component;
  }();
}(window[namespace]));

/* INPUT */
(function(global){
  'use strict';

  global.input = function(){
    var component = new global.component({
      container: 'body',
      selector: '_input',
      clear: '_input-clear',
      active: '_active',
      duration: '250ms',
      easing: 'cubic-bezier(.65,.05,.36,1)'
    });

    function init(){
      this.prop('on').init && this.prop('on').init($(this.class('selector')));
      this.change.observe(this);
      this.scroll.observe(this);
    }

    function handlerClear(event){
      var $clear = $(event.target).closest(this.class('clear'))
        , $input = $clear.siblings(this.class('selector')).find('input');

      $input.val('');
      $clear.removeClass(this.prop('active'));
    }

    function handlerChange(event){
      var $clear = $(event.target).closest(this.class('selector')).siblings(this.class('clear'));

      $(event.target).val().length
        ? $clear.addClass(this.prop('active'))
        : $clear.removeClass(this.prop('active'));
    }

    component.bind = function(options){
      $(this.prop('container')).off('click', `${this.class('selector')} ~ ${this.class('clear')}`);
      $(this.prop('container')).off('keyup', `${this.class('selector')} input`);
      $(this.prop('container')).off('keydown', `${this.class('selector')} input`);
      $(this.prop('container')).off('change', `${this.class('selector')} input`);

      $.extend(this.options, options);

      $(this.prop('container')).on('click', `${this.class('selector')} ~ ${this.class('clear')}`, handlerClear.bind(this));
      $(this.prop('container')).on('keyup', `${this.class('selector')} input`, handlerChange.bind(this));
      $(this.prop('container')).on('keydown', `${this.class('selector')} input`, handlerChange.bind(this));
      $(this.prop('container')).on('change', `${this.class('selector')} input`, handlerChange.bind(this));

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
    this.modal.bind();
    this.popover.bind();
    this.dropdown.bind();
    this.input.bind();
  };

  global.init();
}(window[namespace]));
