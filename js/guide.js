var namespace = 'GUIDE';

window[namespace] = window[namespace] || {};

;(function(guide){
  'use strict';

  var include = {};

  include.header = function(){
    $('.container').prepend(
      '<header class="header">\
        <h1 class="header__title">UI GUIDE</h1>\
        <nav class="header__menu">\
          <a class="menu__link" href="#">Guide</a>\
          <a class="menu__link" href="#">Compnent</a>\
        </nav>\
      </header>'
    );
  };

  include.menu = function(code){
    var html = {
      C01:
        '<nav class="main__menu">\
          <p class="menu__text">Components</p>\
          <a class="menu__link menu__link--active" href="#">Collapse</a>\
        </nav>',
      C02: '',
      C03: ''
    };

    $('.main').prepend(html[code]);
  }

  // 코드 탭 버튼 클릭 이벤트
  $('.guide__tab .tab__button').on('click', function(event){
    var _this = this;

    $(this).addClass('tab__button--active').siblings().removeClass('tab__button--active');

    $(this).parent().siblings('.guide__code').find('.highlight').filter(function(){
      if ($(_this).data('lang') === $(this).data('lang')) return this;
    }).show().siblings().hide();
  });

  // highlight.js html 태그 변환
  $('.language-html').html($('.language-html').html().replace(/</g,"&lt;").replace(/>/g,"&gt;"));

  guide.include = include;
}(window[namespace]));