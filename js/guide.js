var namespace = 'GUIDE';

window[namespace] = window[namespace] || {};

;(function(guide){
  'use strict';

  var include = {};

  include.header = function(){
    $('.guide-container').prepend(
      '<header class="guide-header">\
        <h1 class="guide-header__title">UI GUIDE</h1>\
        <nav class="guide-header__menu">\
          <a class="menu__link" href="#">Guide</a>\
          <a class="menu__link" href="#">Compnent</a>\
        </nav>\
      </header>'
    );
  };

  include.menu = function(code){
    $('.guide-main').prepend(
      '<nav class="guide-main__menu">\
        <p class="menu__text">Rules</p>\
        <a class="menu__link" data-code="C0101" href="../rules/rules_01.html">기본정책</a>\
        <a class="menu__link" data-code="C0102" href="../rules/rules_02.html">표준규칙</a>\
        <a class="menu__link" data-code="C0103" href="../rules/rules_03.html">코드규칙</a>\
        <a class="menu__link" data-code="C0104" href="../rules/rules_04.html">네임규칙</a>\
        <a class="menu__link" data-code="C0105" href="../rules/rules_05.html">설계패턴</a>\
        <p class="menu__text">Accessibility</p>\
        <a class="menu__link" data-code="C0201" href="../accessibility/accessibility_01.html">웹 접근성 개요</a>\
        <a class="menu__link" data-code="C0202" href="../accessibility/accessibility_02.html">웹접근성 WAI-ARIA</a>\
        <a class="menu__link" data-code="C0203" href="../accessibility/accessibility_03.html">역할별 체크리스트</a>\
        <a class="menu__link" data-code="C0204" href="../accessibility/accessibility_04.html">개선작업 프로세스</a>\
        <p class="menu__text">Components</p>\
        <a class="menu__link" data-code="C0301" href="../components/collapse.html">Collapse</a>\
      </nav>'
    );

    $('.menu__link').filter(function(){
      if (code == $(this).data('code')) return this;
    }).addClass('menu__link--active').append('<i class="fas fa-chevron-right fa-xs"></i>');
  }

  // 코드 탭 버튼 클릭 이벤트
  if ($('.guide-viewer__tab').length) {
    $('.guide-viewer__tab .tab__button').on('click', function(event){
      var _this = this;
      var $parent = $(this).closest('.guide-viewer__tab');
      var $target = $parent.siblings('.guide-viewer__code').find('pre').filter(function(){
        if ($(_this).data('lang') === $(this).data('lang')) return this;
      });

      if ($(this).hasClass('tab__button--active')) {
        $(this).removeClass('tab__button--active');
        $target.hide();
      }
      else {
        $(this).addClass('tab__button--active');
        $(this).siblings().removeClass('tab__button--active');
        $target.show().siblings().hide();
      }
    });
  }

  // highlight.js html 태그 변환
  if ($('.language-html').length) {
    $('.language-html').each(function(){
      $(this).html($(this).html().replace(/</g,"&lt;").replace(/>/g,"&gt;"));
    });
  }

  guide.include = include;
}(window[namespace]));