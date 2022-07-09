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
      title: '_calendar-title',
      controller: '_calendar-controller',
      table: '_calendar-table',
      body: '_calendar-body',
      week: '_calendar-week',
      date: '_calendar-date',
      button: '_calendar-button',
      weeks: ['일', '월', '화', '수', '목', '금', '토']
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
          height: 100%;
        }
        ${this.class('caption')} {
          overflow: initial;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 0 16px;
          width: 100%;
          height: 40px;
        }
        ${this.class('title')} {
          margin: 0 16px;
        }
        ${this.class('controller')} {
          overflow: hidden;
          font-size: 0;
          line-height: 0;
          color: translate;
        }
        ${this.class('table')} th:first-child,
        ${this.class('table')} td:first-child button {
          color: rgb(255, 150, 0);
        }
        ${this.class('table')} th:last-child,
        ${this.class('table')} td:last-child button {
          color: rgb(0, 150, 255);
        }
        ${this.class('body')} {}
        ${this.class('week')} {
          height: 40px;
        }
        ${this.class('date')} {}
        ${this.class('button')} {
          width: 100%;
          height: 40px;
          text-align: center;
        }`;
    }

    function getData(context){
      var array = []
        , date;

      do {
        date = moment([context.year, context.month, array.length+1]);
        array.push({
          year: context.year,
          month: context.month,
          date: date.date(),
          week: date.day()
        });
      }
      while(context.month == date.month());

      array.pop();

      while(array[0].week != 0){
        array.unshift({
          year: context.year,
          month: context.month,
          date: null,
          week: array[0].week-1
        });
      }

      while(array[array.length-1].week != 6){
        array.push({
          year: context.year,
          month: context.month,
          date: null,
          week: array[array.length-1].week+1
        });
      }

      return array;
    };

    function getCaption(context){
      var $caption = $('<div>', { class: this.prop('caption') })
        , $title = $('<span>', { class: this.prop('title'), text: moment([context.year, context.month]).format('YYYY.MM') });

      $caption.append($title);

      $caption.prepend($('<button>', { class: `${this.prop('controller')} icon-015`, text: 'PrevMonth', data: { string: 'month', number: -1 }}));
      $caption.prepend($('<button>', { class: `${this.prop('controller')} icon-017`, text: 'PrevYear', data: { string: 'year', number: -1 }}));
      $caption.append($('<button>', { class: `${this.prop('controller')} icon-016`, text: 'NextMonth', data: { string: 'month', number: +1 }}));
      $caption.append($('<button>', { class: `${this.prop('controller')} icon-018`, text: 'NextYear', data: { string: 'year', number: +1 }}));

      $(this.class('controller'), $caption).on('click', update.bind(this, context));

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

    function update(context, event){
      var dataset = $(event.target).data();

      context[dataset.string] += dataset.number;

      if (context.month >= 12) {
        context.year++;
        context.month = 0;
      }

      if (context.month <= -1) {
        context.year--;
        context.month = 11;
      }

      context.data = getData.call(this, context);

      $(this.class('title'), context.table).text(moment([context.year, context.month]).format('YYYY.MM'));
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
      try {
        if (!moment) return;

        var options = $.extend({
          year: moment().year(),
          month: moment().month(),
          on: {}
        }, options);

        return new creator(this, options);
      }
      catch(error){
        console.error(`${namespace} ERROR: ${namespace}.calendar is required moment.`);
      }
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

      if (options.on) {
        this.on('confirm', options.on.confirm);
        this.on('cancel', options.on.cancel);
      }

      this.prop('on').show && this.prop('on').show();
      this.change.observe(this);
    };

    component.hide = function(callback){
      var $selector = this.prop('target') || $(this.class('selector'));

      $selector.removeClass(this.prop('active'));
      callback && callback($selector);
      this.prop('on').hide && this.prop('on').hide();
      delete this.prop('on').confirm;
      delete this.prop('on').cancel;
    };

    component.bind = function(options){
      $(this.prop('container')).off('TransitionEnd webkitTransitionEnd', this.class('selector'));
      $(this.prop('container')).off('touchstart', this.class('selector'));
      $(this.prop('container')).off('click', this.class('selector'));
      $(this.prop('container')).off('click', `${this.class('selector')} ${this.class('close')}`);
      $(this.prop('container')).off('click', `${this.class('selector')} ${this.class('cancel')}`);
      $(this.prop('container')).off('click', `${this.class('selector')} ${this.class('confirm')}`);

      $.extend(this.options, options);

      $(this.prop('container')).on('TransitionEnd webkitTransitionEnd', this.class('selector'), handlerEnd.bind(this));
      $(this.prop('container')).on('touchstart', this.class('selector'), handlerSelector.bind(this));
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

      timeout = setTimeout(function(){
        global.modal.show(options);
        clearTimeout(timeout);
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

      timeout = setTimeout(function(){
        global.modal.show(options);
        clearTimeout(timeout);
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
  };

  global.init();
}(window[namespace]));