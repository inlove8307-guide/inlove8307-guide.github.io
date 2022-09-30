var namespace = 'UI';

window[namespace] = window[namespace] || {};

/* USER AGENT */
(function(global){
  'use strict';

  global.ua = function(){
    try {
      if (UAParser) return new UAParser();
    }
    catch(error){
      console.error(`${namespace} ERROR: ${namespace}.ua is required UAParser.`);
    }
  }();

  if (global.ua) {
    global.isMobile = global.ua.getDevice().type === 'mobile';
    global.isTablet = global.ua.getDevice().type === 'tablet';
    global.isIOS = global.ua.getOS().name === 'iOS';
    global.isAOS = global.ua.getOS().name === 'Android';
  }

  // console.log('getBrowser', global.ua.getBrowser());
  // console.log('getCPU', global.ua.getCPU());
  // console.log('getDevice', global.ua.getDevice());
  // console.log('getEngine', global.ua.getEngine());
  // console.log('getOS', global.ua.getOS());
  // console.log('getResult', global.ua.getResult());
  // console.log('getUA', global.ua.getUA());
  // console.log('setUA', global.ua.setUA());
}(window[namespace]));

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

    this.pad = function(value, char, length, after){
      var result = String(value);

      while (result.length < length) {
        result = after
          ? result + String(char)
          : String(char) + result;
      }

      return result;
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

/* CALENDAR */
(function(global){
  'use strict';

  global.calendar = function(){
    var component = new global.component({
      container: 'body',
      selector: '_calendar',
      caption: '_calendar-caption',
      year: '_calendar-year',
      month: '_calendar-month',
      today: '_calendar-today',
      prev: '_calendar-prev',
      next: '_calendar-next',
      layer: '_calendar-layer',
      table: '_calendar-table',
      body: '_calendar-body',
      week: '_calendar-week',
      date: '_calendar-date',
      button: '_calendar-button',
      weeks: ['일', '월', '화', '수', '목', '금', '토']
    });

    function init(){
      this.prop('on').init && this.prop('on').init($(this.class('selector')));
      this.change.observe(this);
      this.scroll.observe(this);
    }

    function getData(context){
      var array = []
        , date = moment([context.year, context.month, 1])
        , prev = moment([context.year, context.month, 1]).add(-1, 'month').endOf('month')
        , next = moment([context.year, context.month, 1]).add(1, 'month');

      do {
        array.push({
          year: date.year(),
          month: date.month(),
          date: date.date(),
          week: date.day()
        });

        date = date.add(1, 'days');
      }
      while(context.month == date.month());

      do {
        array.unshift({
          year: prev.year(),
          month: prev.month(),
          date: prev.date(),
          week: prev.day()
        });

        prev.add(-1, 'days');
      }
      while(array[0].week != 0);

      do {
        array.push({
          year: next.year(),
          month: next.month(),
          date: next.date(),
          week: next.day()
        });

        next.add(1, 'days');
      }
      while(array[array.length-1].week != 6 || array.length < 7 * 6);

      return array;
    }

    function getLayer(context, string){
      var $layer = $('<div>', { class: this.prop('layer') })
        , isYear = string === this.prop('year');

      var object = {};

      object[this.prop('year')] = {
        number: context.number || moment().year(),
        maximum: 26,
        text: '년'
      };

      object[this.prop('month')] = {
        number: 12,
        maximum: 12,
        text: '월'
      };

      while($layer.children().length < object[string].maximum){
        $layer.prepend($('<button>', {
          class: string,
          text: object[string].number + object[string].text,
          data: {
            value: object[string].number
          }
        }));

        object[string].number--;
      }

      if (isYear) {
        $layer.prepend($('<button>', { class: this.prop('prev') }));
        $layer.append($('<button>', { class: this.prop('next') }));
      }

      $('button', $layer).on('click', function(event){
        var value = $(event.target).data('value');

        if (value) {
          if ($(event.target).hasClass(this.prop('year'))) {
            context.year = value;
          }

          if ($(event.target).hasClass(this.prop('month'))) {
            context.month = value - 1;
          }

          update.call(this, context);
          $layer.remove();
          context.number = null;
        }

        if ($(event.target).hasClass(this.prop('prev'))) {
          context.number = object[string].number;
          $layer.replaceWith(getLayer.call(this, context, this.prop('year')));
        }

        if ($(event.target).hasClass(this.prop('next'))) {
          context.number = object[string].number + object[string].maximum * 2;
          $layer.replaceWith(getLayer.call(this, context, this.prop('year')));
        }
      }.bind(this));

      return $layer;
    }

    function getCaption(context){
      var $caption = $('<div>', { class: this.prop('caption') });

      $caption.append($('<button>', { class: this.prop('prev'), text: `이전달` }));
      $caption.append($('<button>', { class: this.prop('year'), text: `${context.year}년` }));
      $caption.append($('<button>', { class: this.prop('month'), text: `${context.month + 1}월` }));
      $caption.append($('<button>', { class: this.prop('today'), text: `이번달` }));
      $caption.append($('<button>', { class: this.prop('next'), text: `다음달` }));

      $('button', $caption).on('click', function(event){
        var $layer = $(this.class('layer'), context.table)
          , prev = moment([context.year, context.month, 1]).add(-1, 'month')
          , next = moment([context.year, context.month, 1]).add(1, 'month');

        $layer.remove();

        if ($(event.target).hasClass(this.prop('prev'))) {
          context.year = prev.year();
          context.month = prev.month();
          context.number = null;
          return update.call(this, context);
        }

        if ($(event.target).hasClass(this.prop('next'))) {
          context.year = next.year();
          context.month = next.month();
          context.number = null;
          return update.call(this, context);
        }

        if ($(event.target).hasClass(this.prop('today'))) {
          context.year = moment().year();
          context.month = moment().month();
          context.number = null;
          return update.call(this, context);
        }

        $layer.remove();

        if ($(event.target).hasClass(this.prop('year'))) {
          $caption.append(getLayer.call(this, context, this.prop('year')));
        }

        if ($(event.target).hasClass(this.prop('month'))) {
          $caption.append(getLayer.call(this, context, this.prop('month')));
        }
      }.bind(this));

      return $caption;
    }

    function getHead(context){
      var $thead = $('<thead>')
        , $row = $('<tr>')
        , $col
        , weeks = this.prop('weeks').slice();

      while(weeks.length){
        $col = $('<th>', { class: this.prop('week'), scope: 'col', text: weeks[0] });
        $row.append($col);
        weeks.shift();
      }

      return $thead.append($row);
    }

    function getBody(context){
      var $tbody = $('<tbody>', { class: this.prop('body') })
        , $row, $col, $button
        , data = context.data.slice();

      while(data.length){
        if (data[0].week == 0) {
          $row = $('<tr>');
          $tbody.append($row);
        }

        $col = $('<td>', { class: this.prop('date') });
        $row.append($col);

        if (data[0].date) {
          $button = $('<button>', { type: 'button', class: this.prop('button'), text: data[0].date });
          $button.data({ date: moment([data[0].year, data[0].month, data[0].date]).format('YYYY.MM.DD'), week: data[0].week });
          data[0].month !== context.month && $button.attr('disabled', true);
          context.on.select && $button.on('click', context.on.select.bind(this, context));
          $col.append($button);
        }

        data.shift();
      }

      return $tbody;
    }

    function getTable(context){
      var $calendar = $('<div>', { class: this.prop('selector') })
        , $table = $('<table>', { class: this.prop('table') });

      $table.append(getHead.call(this, context));
      $table.append(getBody.call(this, context));

      $calendar.append(getCaption.call(this, context));
      $calendar.append($table);

      return $calendar;
    }

    function update(context){
      context.data = getData.call(this, context);

      $(this.class('year'), context.table).text(`${context.year}년`);
      $(this.class('month'), context.table).text(`${context.month + 1}월`);
      $(this.class('body'), context.table).replaceWith(getBody.call(this, context));

      context.on.update && context.on.update.call(this, context);
    }

    function creator(context, options){
      this.year = options.year;
      this.month = options.month;
      this.on = options.on;
      this.data = getData.call(context, this);
      this.table = getTable.call(context, this);
    }

    component.create = function(options){
      var options = $.extend({
        year: moment().year(),
        month: moment().month(),
        on: {}
      }, options);

      return new creator(this, options);
    };

    component.bind = function(options){
      $.extend(this.options, options);

      init.call(this);
    };

    return component;
  }();
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

    function handlerSelector(event){
      if (!$(event.target).closest(this.class('content')).length) {
        this.hide();
      }
    }

    component.show = function(options){
      var options = $.extend({ target: null }, options);

      if ($(options.target).length) this.prop('target', $(options.target));
      if (!this.prop('target')) this.prop('target', $(this.class('selector')).eq(0));
      if (!this.prop('target')) return;

      $(this.class('selector')).removeClass(this.prop('active'));
      this.prop('target').addClass(this.prop('active'));

      global.lock.lockup();

      if (options.on) {
        this.on('confirm', options.on.confirm);
        this.on('cancel', options.on.cancel);
      }

      this.prop('on').show && this.prop('on').show();
      this.change.observe(this);
    };

    component.hide = function(callback){
      var $selector = this.prop('target') || $(this.class('selector'));

      global.lock.unlock();

      $selector.removeClass(this.prop('active'));
      callback && callback($selector);
      this.prop('on').hide && this.prop('on').hide();
      delete this.prop('on').confirm;
      delete this.prop('on').cancel;
    };

    component.bind = function(options){
      $(this.prop('container')).off('TransitionEnd webkitTransitionEnd', this.class('selector'));
      // $(this.prop('container')).off('touchstart', this.class('selector'));
      $(this.prop('container')).off('click', this.class('selector'));
      $(this.prop('container')).off('click', `${this.class('selector')} ${this.class('close')}`);
      $(this.prop('container')).off('click', `${this.class('selector')} ${this.class('cancel')}`);
      $(this.prop('container')).off('click', `${this.class('selector')} ${this.class('confirm')}`);

      $.extend(this.options, options);

      $(this.prop('container')).on('TransitionEnd webkitTransitionEnd', this.class('selector'), handlerEnd.bind(this));
      // $(this.prop('container')).on('touchstart', this.class('selector'), handlerSelector.bind(this));
      $(this.prop('container')).on('click', this.class('selector'), handlerSelector.bind(this));
      $(this.prop('container')).on('click', `${this.class('selector')} ${this.class('close')}`, handlerClick.bind(this));
      $(this.prop('container')).on('click', `${this.class('selector')} ${this.class('cancel')}`, handlerClick.bind(this));
      $(this.prop('container')).on('click', `${this.class('selector')} ${this.class('confirm')}`, handlerClick.bind(this));

      init.call(this);
    };

    return component;
  }();
}(window[namespace]));

/* MODAL - ALERT */
(function(global){
  'use strict';

  global.alert = function(){
    var component = new global.component({
      container: 'body',
      selector: '_alert',
      confirm: '_alert-confirm',
      cancel: '_alert-cancel'
    });

    function init(){
      this.prop('on').init && this.prop('on').init($(this.class('selector')));
    }

    function html(options){
      return `
        <div class="modal _modal ${this.prop('selector')}">
          <div class="modal-content _modal-content _center">
            <div class="modal-main inset inset-sm center middle">${options.message}</div>
            <div class="modal-footer">
              <div class="button-group">
                <button type="button" class="button grow ${this.prop('cancel')}">${options.cancel}</button>
                <button type="button" class="button grow dark ${this.prop('confirm')}">${options.confirm}</button>
              </div>
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

    component.show = function(options){
      var options = $.extend({ target: this.class('selector'), message: 'message', confirm: 'confirm', cancel: null }, options)
        , timeout;

      $(this.class('selector')).remove();
      $(this.prop('container')).append(html.call(this, options));

      if (!options.cancel) $(this.class('cancel'), this.class('selector')).remove();

      clearTimeout(timeout);

      timeout = setTimeout(function(){
        global.modal.show(options);
      }, 10);

      if (options.on) {
        this.on('confirm', options.on.confirm);
        this.on('cancel', options.on.cancel);
      }

      this.prop('on').show && this.prop('on').show();
      this.change.observe(this);
    };

    component.hide = function(){
      global.modal.hide(function($selector){
        $selector.remove();
      });

      this.prop('on').hide && this.prop('on').hide();
      delete this.prop('on').confirm;
      delete this.prop('on').cancel;
    };

    component.bind = function(options){
      $(this.prop('container')).off('click', `${this.class('selector')} ${this.class('cancel')}`);
      $(this.prop('container')).off('click', `${this.class('selector')} ${this.class('confirm')}`);

      $.extend(this.options, options);

      $(this.prop('container')).on('click', `${this.class('selector')} ${this.class('cancel')}`, handlerClick.bind(this));
      $(this.prop('container')).on('click', `${this.class('selector')} ${this.class('confirm')}`, handlerClick.bind(this));

      init.call(this);
    };

    return component;
  }();
}(window[namespace]));

/* MODAL - DATEPICKER */
(function(global){
  'use strict';

  global.datepicker = function(){
    var component = new global.component({
      container: 'body',
      selector: '_datepicker',
      content: '_datepicker-content',
      calendar: '_datepicker-calendar',
      close: '_datepicker-close',
      cancel: '_datepicker-cancel',
      confirm: '_datepicker-confirm'
    });

    function init(){
      this.style(this.prop('container'), style.call(this));
      this.prop('on').init && this.prop('on').init($(this.class('selector')));
    }

    function style(){
      return `
        ${this.class('selector')} ${this.class('content')} {
          min-height: initial;
          max-height: initial;
        }
        ${this.class('calendar')} {
          min-height: 320px;
        }`;
    }

    function html(options){
      return `
        <div class="modal _modal ${this.prop('selector')}">
          <div class="modal-content _modal-content _bottom ${this.prop('content')}">
            <div class="modal-header">
              <p class="modal-title left">${options.title}</p>
              <div class="modal-button right">
                <button type="button" class="button icon w24 ${this.prop('close')}">
                  <span class="button-icon icon-014"></span>
                </button>
              </div>
            </div>
            <div class="modal-main">
              <div class="${this.prop('calendar')}"></div>
            </div>
            <div class="modal-footer">
              <div class="button-group">
                <button type="button" class="button grow ${this.prop('cancel')}">${options.cancel}</button>
                <button type="button" class="button grow dark ${this.prop('confirm')}">${options.confirm}</button>
              </div>
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

    component.show = function(options){
      var options = $.extend({ target: this.class('selector'), title: 'Date Picker', field: null, confirm: null, cancel: null, on: {} }, options)
        , timeout;

      options.calendar = global.calendar.create({
        on: {
          select: function(calendar, event){
            var $target = $(event.target)
              , $field = $(options.field);

            $field.val($target.data('date'));
            options.on.select && options.on.select.call(calendar, $field);
            this.hide();
          }.bind(this),
          update: function(calendar){
            options.on.update && options.on.update.call(calendar);
          }
        }
      });

      $(this.class('selector')).remove();
      $(this.prop('container')).append(html.call(this, options));
      $(this.class('calendar'), this.class('selector')).html(options.calendar && options.calendar.table);

      !options.cancel && $(this.class('cancel'), this.class('selector')).remove();
      !options.confirm && $(this.class('confirm'), this.class('selector')).remove();

      clearTimeout(timeout);

      timeout = setTimeout(function(){
        global.modal.show(options);
      }, 10);

      if (options.on) {
        this.on('confirm', options.on.confirm);
        this.on('cancel', options.on.cancel);
      }

      this.prop('on').show && this.prop('on').show();
      this.change.observe(this);
    };

    component.hide = function(){
      global.modal.hide(function($selector){
        $selector.remove();
      });

      this.prop('on').hide && this.prop('on').hide();
      delete this.prop('on').confirm;
      delete this.prop('on').cancel;
    };

    component.bind = function(options){
      $(this.prop('container')).off('click', `${this.class('selector')} ${this.class('close')}`);
      $(this.prop('container')).off('click', `${this.class('selector')} ${this.class('cancel')}`);
      $(this.prop('container')).off('click', `${this.class('selector')} ${this.class('confirm')}`);

      $.extend(this.options, options);

      $(this.prop('container')).on('click', `${this.class('selector')} ${this.class('close')}`, handlerClick.bind(this));
      $(this.prop('container')).on('click', `${this.class('selector')} ${this.class('cancel')}`, handlerClick.bind(this));
      $(this.prop('container')).on('click', `${this.class('selector')} ${this.class('confirm')}`, handlerClick.bind(this));

      init.call(this);
    };

    return component;
  }();
}(window[namespace]));

/* MODAL - SELECT */
(function(global){
  'use strict';

  global.select = function(){
    var component = new global.component({
      container: 'body',
      selector: '_select',
      scroll: '_select-scroll',
      option: '_select-option',
      label: '_select-label',
      cancel: '_select-cancel',
      confirm: '_select-confirm',
      active: '_active',
      duration: '250ms',
      easing: 'cubic-bezier(.86, 0, .07, 1)'
    });

    function init(){
      this.prop('on').init && this.prop('on').init($(this.class('selector')));
    }

    function handlerClick(event){
      var $target = $(event.target)
        , $selector = $target.closest(this.class('selector'))
        , $options = $(this.class('option'), $selector);

      if ($target.closest(this.class('option')).length) {
        $options.removeClass(this.prop('active'));
        $target.closest(this.class('option')).addClass(this.prop('active'));

        if (this.prop('field')) {
          $(this.class('label'), this.prop('field')).text($(this.class('label'), $target).text());
        }

        this.prop('on').select && this.prop('on').select($target);
      }

      $target.closest(this.class('cancel')).length && this.prop('on').cancel && this.prop('on').cancel();
      $target.closest(this.class('confirm')).length && this.prop('on').confirm && this.prop('on').confirm();

      this.hide();
    }

    component.show = function(options){
      var options = $.extend({ target: null, field: null , on: {}}, options)
        , $scroll = $(this.class('scroll'), this.class('selector'))
        , $active = $(this.class('option'), this.class('selector')).filter(this.class('active'));

      global.modal.show(options);

      if ($active.length) {
        $scroll.scrollTop($active.position().top + $scroll.scrollTop() - $scroll.position().top);
      }

      options.field && this.prop('field', options.field);
      options.on.select && this.on('select', options.on.select);
      options.on.cancel && this.on('cancel', options.on.cancel);
      options.on.confirm && this.on('confirm', options.on.confirm);

      this.prop('on').show && this.prop('on').show();
      this.change.observe(this);
    };

    component.hide = function(){
      global.modal.hide();

      this.prop('on').hide && this.prop('on').hide();
      delete this.prop('on').select;
      delete this.prop('on').cancel;
      delete this.prop('on').confirm;
    };

    component.bind = function(options){
      $(this.prop('container')).off('click', `${this.class('selector')} ${this.class('option')}`);
      $(this.prop('container')).off('click', `${this.class('selector')} ${this.class('cancel')}`);
      $(this.prop('container')).off('click', `${this.class('selector')} ${this.class('confirm')}`);

      $.extend(this.options, options);

      $(this.prop('container')).on('click', `${this.class('selector')} ${this.class('option')}`, handlerClick.bind(this));
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
      top: '_top',
      right: '_right',
      bottom: '_bottom',
      left: '_left',
      active: '_active',
      duration: '250ms',
      easing: 'cubic-bezier(.86, 0, .07, 1)',
      direction: 'top',
      space: 8,
      padding: 32
    });

    function init(){
      this.style(this.prop('container'), style.call(this));
      this.prop('on').init && this.prop('on').init($(this.class('selector')));
    }

    function style(){
      return `
        ${this.class('selector')} ${this.class('content')} {
          transition: opacity ${this.prop('duration')} ${this.prop('easing')};
        }`;
    }

    function html(options){
      var html = `
        <span class="popover-content _popover-content ${this.prop(options.direction)}">
          <span class="popover-message _popover-message">${options.message}</span>
        </span>`;

      return css.call(this, options, html);
    }

    function css(options, markup){
      var $html = $(markup)
        , $target = $(options.selector)
        , width = function(){
          var deviceWidth = $(window).width();

          switch(options.direction){
            case 'top':
            case 'bottom': return deviceWidth - options.padding * 2;
            case 'left': return deviceWidth - options.padding - options.space - (deviceWidth - $target.offset().left);
            case 'right': return deviceWidth - options.padding - options.space - $target.offset().left - $target.outerWidth();
          }
        }()
        , left = function(){
          switch(options.direction){
            case 'top':
            case 'bottom': return - ($target.offset().left + $target.outerWidth() / 2) + (width / 2) + options.padding;
            case 'left':
            case 'right': return 0;
          }
        }()
        , translate = function(){
          switch(options.direction){
            case 'top': return `translateY(calc(-100% - ${this.prop('space')}px))`;
            case 'bottom': return `translateY(calc(100% + ${this.prop('space')}px))`;
            case 'left': return `translateX(calc(-100% - ${this.prop('space')}px))`;
            case 'right': return `translateX(calc(100% + ${this.prop('space')}px))`;
          }
        }.call(this);

      $html.css({ transform: translate });
      $(this.class('message'), $html).css({ width: width, left: left });

      return $html;
    }

    function handlerEnd(event){
      if (!$(event.target).hasClass(this.prop('active'))) {
        $(event.target).closest(this.class('selector')).removeClass(this.prop('selector'));
        $(event.target).remove();

        this.prop('on').hide && this.prop('on').hide();
      }
    }

    component.show = function(options){
      var options = $.extend({
          selector: null,
          message: 'message',
          direction: this.prop('direction'),
          padding: this.prop('padding'),
          space: this.prop('space')
        }, options)
        , timeout;

      if (!options.selector) return;

      if ($(this.class('content'), options.selector).length) return this.hide();

      $(this.class('selector')).removeClass(this.prop('selector'));
      $(this.class('content')).remove();

      $(options.selector).addClass(this.prop('selector'));
      $(options.selector).append(html.call(this, options));

      clearTimeout(timeout);

      timeout = setTimeout(function(){
        $(this.class('content')).addClass(this.prop('active'));
      }.bind(this), 10);

      this.prop('on').show && this.prop('on').show();
    };

    component.hide = function(){
      $(this.class('content')).removeClass(this.prop('active'));
    };

    component.bind = function(options){
      $(this.prop('container')).off('TransitionEnd webkitTransitionEnd', `${this.class('selector')} ${this.class('content')}`);

      $.extend(this.options, options);

      $(this.prop('container')).on('TransitionEnd webkitTransitionEnd', `${this.class('selector')} ${this.class('content')}`, handlerEnd.bind(this));

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
      items: '_dropdown-items',
      item: '_dropdown-item',
      option: '_dropdown-option',
      label: '_dropdown-label',
      replace: '_dropdown-replace',
      active: '_active',
      revert: '_revert',
      hidden: '_hidden',
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
      var $option = $(event.target).closest(this.class('option'))
        , $selector = $option.closest(this.class('selector'))
        , $options = this.nearest($selector, this.class('option'))
        , $button = this.nearest($selector, this.class('button'))
        , $items = this.nearest($selector, this.class('items'))
        , $item = $option.closest(this.class('item'))
        , select = $selector.siblings('select');

      $options.removeClass(this.prop('active'));
      $option.addClass(this.prop('active'));

      $(this.class('label'), $button).text($(this.class('label'), $option).text());
      select.length && $('option', select).eq($item.index()).prop('selected', true);

      hide.call(this, $items);
    }

    function handlerReplace(event){
      var $target = $('select', event.target)
        , $button
        , html = ''
        , item = '';

      if ($target.hasClass(this.prop('hidden'))) return;

      $('option', $target).each(function(index, option){
        item += `
          <li class="dropdown-item ${this.prop('item')}">
            <button type="button" class="dropdown-option ${this.prop('option')}">
              <span class="dropdown-label ${this.prop('label')}">${$(option).text()}</span>
            </button>
          </li>`;
      }.bind(this));

      html = `
        <div class="dropdown ${this.prop('selector')}">
          <button type="button" class="dropdown-button ${this.prop('button')}">
            <span class="dropdown-label ${this.prop('label')}">select</span>
          </button>
          <ul class="dropdown-items ${this.prop('items')}">
            ${item}
          </ul>
        </div>`;

      $target.addClass(this.prop('hidden'));
      $target.after(html);

      $button = $(this.class('button'), $target.next());
      $(this.class('label'), $button).text($('option:selected', $target).text());
      $button.trigger('click');
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
      $(this.prop('container')).off('click', this.class('replace'));

      $.extend(this.options, options);

      $(this.prop('container')).on('TransitionEnd webkitTransitionEnd', `${this.class('selector')} ${this.class('items')}`, handlerEnd.bind(this));
      $(this.prop('container')).on('click', `${this.class('selector')} ${this.class('button')}`, handlerButton.bind(this));
      $(this.prop('container')).on('click', `${this.class('selector')} ${this.class('option')}`, handlerOption.bind(this));
      $(this.prop('container')).on('click', this.class('replace'), handlerReplace.bind(this));

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
      active: '_active'
    });

    function init(){
      this.prop('on').init && this.prop('on').init($(this.class('selector')));
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

/* FORMATTER */
(function(global){
  'use strict';

  global.formatter = function(){
    var component = new global.component({
      container: 'body',
      selector: '_format',
      number: '_number',
      price: '_price',
      date: '_date',
      time: '_time',
      phone: '_phone',
    });

    function init(){
      this.prop('on').init && this.prop('on').init($(this.class('selector')));
      this.change.observe(this);
      this.scroll.observe(this);
    }

    function format (target){
      if ($(target).data('format')) return;

      if ($(target).hasClass(this.prop('number'))) {
        new Cleave(target, {
          numeral: true,
          numeralThousandsGroupStyle: 'none',
          onValueChanged: function(event){}
        });
      }

      if ($(target).hasClass(this.prop('price'))) {
        new Cleave(target, {
          numeral: true,
          numeralThousandsGroupStyle: 'thousand',
          prefix: '₩',
          // tailPrefix: true,
          noImmediatePrefix: true,
          onValueChanged: function(event){}
        });
      }

      if ($(target).hasClass(this.prop('date'))) {
        new Cleave(target, {
          date: true,
          delimiter: '.',
          // dateMin: '2000-01-01',
          // dateMax: '2099-12-31',
          datePattern: ['Y', 'm', 'd'],
          onValueChanged: function(event){}
        });
      }

      if ($(target).hasClass(this.prop('time'))) {
        new Cleave(target, {
          time: true,
          // timeFormat: '12',
          timePattern: ['h', 'm', 's'],
          onValueChanged: function(event){}
        });
      }

      if ($(target).hasClass(this.prop('phone'))) {
        new Cleave(target, {
          numericOnly: true,
          delimiter: '-',
          blocks: [3, 4, 4],
          prefix: '010',
          noImmediatePrefix: true,
          onValueChanged: function(event){}
        });
      }

      $(target).data('format', true);
    }

    function handler(event){
      try{
        if (!Cleave) return;

        format.call(this, event.target);
      }
      catch(error){
        console.error(`${namespace} ERROR: ${namespace}.formatter is required Cleave.`);
      }
    }

    component.bind = function(options){
      $(this.prop('container')).off('focusin', this.class('selector'));

      $.extend(this.options, options);

      $(this.prop('container')).on('focusin', this.class('selector'), handler.bind(this));

      init.call(this);
    };

    return component;
  }();
}(window[namespace]));

/* CHECKBOX */
(function(global){
  'use strict';

  global.checkbox = function(){
    var component = new global.component({
      container: 'body',
      selector: '_checkbox'
    });

    function init(){
      this.style(this.prop('container'), style.call(this));
      this.prop('on').init && this.prop('on').init($(this.class('selector')));
    }

    function style(){
      return ``;
    }

    component.bind = function(options){

      $.extend(this.options, options);

      init.call(this);
    };

    return component;
  }();
}(window[namespace]));

/* SCROLLBAR */
(function(global){
  'use strict';

  global.scrollbar = function(){
    var component = new global.component({
      container: 'body',
      selector: '_scrollbar'
    });

    function init(){
      create.call(this);
      this.style(this.prop('container'), style.call(this));
      this.prop('on').init && this.prop('on').init($(this.class('selector')));
    }

    function style(){
      return `
        ${this.class('selector')} {
          position: relative;
        }`;
    }

    function create(options){
      if (!PerfectScrollbar) return;

      var options = $.extend({}, options);

      $(this.class('selector')).each(function(index, target){
        // $(target).data();
        new PerfectScrollbar(target, options);
      });
    }

    component.bind = function(options){

      $.extend(this.options, options);

      init.call(this);
    };

    return component;
  }();
}(window[namespace]));

/* LOCK */
(function(global){
  'use strict';

  global.lock = function(){
    var component = new global.component({
      html: 'html',
      body: 'body',
      fixed: 'guide-container',
      active: '_lockup'
    });

    component.lockup = function(){
      this.prop('scroll', $(this.prop('html')).scrollTop());
      $(this.prop('html')).addClass(this.prop('active'));
      $(this.class('fixed')).css('margin-top', `-${this.prop('scroll')}px`);

      this.prop('on').lockup && this.prop('on').lockup();
    };

    component.unlock = function(){
      $(this.prop('html')).removeClass(this.prop('active'));
      $(this.prop('html')).scrollTop(this.prop('scroll'));

      this.prop('on').unlock && this.prop('on').unlock();
    };

    component.bind = function(options){
      $.extend(this.options, options);
    };

    return component;
  }();
}(window[namespace]));

/* GRAPH */
(function(global){
  'use strict';

  global.graph = function(){
    var component = new global.component({
      container: 'body',
      selector: '_graph',
      base: '_graph-base',
      value: '_graph-value',
      line: '_graph-line',
      active: '_active',
      duration: '1000ms',
      easing: 'cubic-bezier(.65,.05,.36,1)',
      angle: 315,
      size: 200,
      stroke: 30,
      delay: 250
    });

    function init(){
      this.style(this.prop('container'), style.call(this));
      this.prop('on').init && this.prop('on').init($(this.class('selector')));
      this.change.observe(this);
      this.scroll.observe(this);
    }

    function style(){
      return `
        ${this.class('selector')} {
          display: none;
        }
        ${this.class('selector')}${this.class('active')} {
          display: initial;
        }
        ${this.class('selector')} circle {
          stroke-linecap: round;
          fill: transparent;
          transform-origin: 50% 50%;
        }
        ${this.class('selector')} ${this.class('value')} {
          transition: stroke-dashoffset ${this.prop('duration')} ${this.prop('easing')};
        }
        ${this.class('selector')} ${this.class('line')} {
          stroke-linecap: butt;
          opacity: 0.75;
        }`;
    }

    function handlerEnd(event){
      // console.log(event.target)
    };

    function angle(angle){
      return angle - 180 ? 180 - ((angle - 180) / 2) : 180;
    }

    component.draw = function(options){
      var options = $.extend({
        selector: null,
        value: null,
        angle: this.prop('angle'),
        size: this.prop('size'),
        stroke: this.prop('stroke'),
        delay: this.prop('delay')
      }, options);

      if (!options.selector) return console.error(`${namespace}.graph.draw({ selector: [required], value: [required] })`);

      var $selector = $(options.selector).addClass(this.prop('active'))
        , $clone = $selector.children().clone()
        , value = options.value !== null ? options.value : parseInt($selector.data('value'))
        , dasharray, timeout;

      if (isNaN(value)) return console.error(`${namespace}.graph.draw({ selector: [required], value: [required] })`);

      $selector.empty();

      $selector.attr({ width: options.size, height: options.size, viewBox: `0 0 ${options.size} ${options.size}` });
      $clone.filter(this.class('base')).attr({ r: options.size / 2 - options.stroke / 2, cx: options.size / 2, cy: options.size / 2 });
      $clone.filter(this.class('value')).attr({ r: options.size / 2 - options.stroke / 2, cx: options.size / 2, cy: options.size / 2 });
      $clone.filter(this.class('line')).attr({ r: options.size / 2 - options.stroke / 8, cx: options.size / 2, cy: options.size / 2 });

      dasharray = $clone.filter(this.class('base')).prop('r').baseVal.value * 2 * Math.PI;
      value = (value / 100 * options.angle).toFixed(0);

      $clone.filter(this.class('base')).css({
        strokeWidth: `${options.stroke}px`,
        strokeDasharray: `${dasharray} ${dasharray}`,
        strokeDashoffset: `${dasharray - options.angle / 360 * dasharray }`,
        transform: `rotate(${angle(options.angle)}deg)`
      });

      $clone.filter(this.class('value')).css({
        strokeWidth: `${options.stroke}px`,
        strokeDasharray: `${dasharray} ${dasharray}`,
        strokeDashoffset: `${dasharray}`,
        transform: `rotate(${angle(options.angle)}deg)`
      });

      $clone.filter(this.class('line')).css({
        strokeWidth: `${options.stroke / 4}px`,
        strokeDasharray: `0.5 ${dasharray / options.size * 5.5}`,
        transform: `rotate(${angle(options.angle)}deg)`
      });

      $selector.append($clone);

      clearTimeout(timeout);

      timeout = setTimeout(function(){
        $clone.filter(this.class('value')).css('strokeDashoffset', `${dasharray - value / 360 * dasharray}`);
      }.bind(this), options.delay);
    };

    component.bind = function(options){
      $(this.prop('container')).off('TransitionEnd webkitTransitionEnd', `${this.class('selector')} ${this.class('value')}`);

      $.extend(this.options, options);

      $(this.prop('container')).on('TransitionEnd webkitTransitionEnd', `${this.class('selector')} ${this.class('value')}`, handlerEnd.bind(this));

      init.call(this);
    };

    return component;
  }();
}(window[namespace]));

/* PROGRESS */
(function(global){
  'use strict';

  global.progress = function(){
    var component = new global.component({
      container: 'body',
      selector: '_progress',
      base: '_progress-base',
      value: '_progress-value',
      text: '_progress-text',
      active: '_active',
      revert: '_revert',
      duration: '1000ms',
      easing: 'cubic-bezier(.65,.05,.36,1)',
      stroke: 30,
      delay: 250
    });

    function init(){
      this.style(this.prop('container'), style.call(this));
      this.prop('on').init && this.prop('on').init($(this.class('selector')));
      this.change.observe(this);
      this.scroll.observe(this);
    }

    function style(){
      return `
        ${this.class('selector')} {
          position: relative;
        }
        ${this.class('selector')} ${this.class('base')} {
          overflow: hidden;
          position: relative;
          width: 100%;
          height: ${this.prop('stroke')}px;
          border-radius: ${this.prop('stroke') / 2}px;
          background-color: rgb(240, 240, 240);
        }
        ${this.class('selector')} ${this.class('value')} {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: ${this.prop('stroke')}px;
          border-radius: ${this.prop('stroke') / 2}px;
          background: linear-gradient(90deg, rgb(238, 205, 163), rgb(239, 98, 159));
          transition: left ${this.prop('duration')} ${this.prop('easing')};
        }
        ${this.class('selector')} ${this.class('text')} {
          position: absolute;
          top: 0;
          left: 0;
          padding: 5px;
          border-radius: 4px 4px 4px 0px;
          background-color: rgb(239, 98, 159);
          color: rgb(255, 255, 255);
          transform: translate(0, calc(-100% - 10px));
          transition: left ${this.prop('duration')} ${this.prop('easing')};
        }
        ${this.class('selector')} ${this.class('text')}::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 0;
          border-top: 5px solid rgb(239, 98, 159);
          border-left: 0px solid transparent;
          border-right: 5px solid transparent;
          transform: translate(0, 100%);
        }
        ${this.class('selector')} ${this.class('text')}${this.class('revert')} {
          border-radius: 4px 4px 0px 4px;
          transform: translate(-100%, calc(-100% - 10px));
        }
        ${this.class('selector')} ${this.class('text')}${this.class('revert')}::after {
          left: initial;
          right: 0;
          border-left-width: 5px;
          border-right-width: 0px;
        }`;
    }

    function handlerStart($selector){
      clearInterval(this.interval);
      this.interval = setInterval(handlerUpdate.bind(this, $selector), 10);
    };

    function handlerUpdate($selector){
      var $text = $(this.class('text'), $selector);

      if (!$text.hasClass(this.prop('revert')) && $selector.offset().left + $text.width() < $text.offset().left) {
        $text.addClass(this.prop('revert'));
      }

      if ($text.hasClass(this.prop('revert')) && $selector.offset().left > $text.offset().left) {
        $text.removeClass(this.prop('revert'));
      }
    };

    function handlerEnd(event){
      clearInterval(this.interval);
    };

    component.update = function(options){
      var options = $.extend({
        selector: null,
        value: null,
        delay: this.prop('delay')
      }, options);

      if (!options.selector) return console.error(`${namespace}.progress.update({ selector: [required], value: [required] })`);

      var $selector = $(options.selector)
        , value = options.value !== null ? options.value : parseInt($selector.data('value'))
        , timeout;

      if (isNaN(value)) return console.error(`${namespace}.progress.update({ selector: [required], value: [required] })`);

      clearTimeout(timeout);

      timeout = setTimeout(function(){
        $(this.class('value'), $selector).css('left', `-${100 - value}%`);
        $(this.class('text'), $selector).css('left', `${value}%`);
        $(this.class('text'), $selector).text(options.text);
        handlerStart.call(this, $selector);
      }.bind(this), options.delay);
    };

    component.bind = function(options){
      $(this.prop('container')).off('TransitionEnd webkitTransitionEnd', `${this.class('selector')} ${this.class('value')}`);

      $.extend(this.options, options);

      $(this.prop('container')).on('TransitionEnd webkitTransitionEnd', `${this.class('selector')} ${this.class('value')}`, handlerEnd.bind(this));

      init.call(this);
    };

    return component;
  }();
}(window[namespace]));

/* INITIAL */
$(function(global){
  global.init = function(){
    this.calendar.bind();
    this.collapse.bind();
    this.tabs.bind();
    this.modal.bind();
    this.alert.bind();
    this.datepicker.bind();
    this.select.bind();
    this.popover.bind();
    this.dropdown.bind();
    this.input.bind();
    this.formatter.bind();
    this.checkbox.bind();
    this.scrollbar.bind();
    this.lock.bind();
    this.graph.bind();
    this.progress.bind();
  };

  global.init();
}(window[namespace]));