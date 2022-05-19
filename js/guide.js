var namespace = 'GUIDE';

window[namespace] = window[namespace] || {};

;(function(guide){
  'use strict';

  var include = {};

  include.header = function(){
    $('.guide-container').prepend(
      '<header class="guide-header">\
        <button class="guide-header__toggle"><i class="icon-009"></i></button>\
        <h1 class="guide-header__title">UI GUIDE</h1>\
        <nav class="guide-header__menu">\
          <a class="menu__link" href="#"></a>\
        </nav>\
      </header>'
    );
  };

  include.menu = function(code){
    $('.guide-main').prepend(
      '<nav class="guide-main__menu">\
        <div class="guide-main__menu-group">\
          <button class="guide-main__menu-button">Rules<i class="icon-001"></i></button>\
          <div class="guide-main__menu-links">\
            <a class="guide-main__menu-link" data-code="C0101" href="../rules/rules_01.html">기본정책</a>\
            <a class="guide-main__menu-link" data-code="C0102" href="../rules/rules_02.html">표준규칙</a>\
            <a class="guide-main__menu-link" data-code="C0103" href="../rules/rules_03.html">코드규칙</a>\
            <a class="guide-main__menu-link" data-code="C0104" href="../rules/rules_04.html">네임규칙</a>\
            <a class="guide-main__menu-link" data-code="C0105" href="../rules/rules_05.html">설계패턴</a>\
          </div>\
        </div>\
        <div class="guide-main__menu-group">\
          <button class="guide-main__menu-button">Accessibility<i class="icon-001"></i></button>\
          <div class="guide-main__menu-links">\
            <a class="guide-main__menu-link" data-code="C0201" href="../accessibility/accessibility_01.html">웹 접근성 개요</a>\
            <a class="guide-main__menu-link" data-code="C0202" href="../accessibility/accessibility_02.html">WAI-ARIA 가이드라인</a>\
            <a class="guide-main__menu-link" data-code="C0203" href="../accessibility/accessibility_03.html">역할별 체크리스트</a>\
            <a class="guide-main__menu-link" data-code="C0204" href="../accessibility/accessibility_04.html">개선작업 프로세스</a>\
          </div>\
        </div>\
        <div class="guide-main__menu-group">\
          <button class="guide-main__menu-button">Components<i class="icon-001"></i></button>\
          <div class="guide-main__menu-links">\
            <a class="guide-main__menu-link" data-code="C0301" href="../components/button.html">Button</a>\
            <a class="guide-main__menu-link" data-code="C0302" href="../components/collapse.html">Collapse</a>\
            <a class="guide-main__menu-link" data-code="C0303" href="../components/table.html">Table</a>\
            <a class="guide-main__menu-link" data-code="C0304" href="../components/list.html">List</a>\
            <a class="guide-main__menu-link" data-code="C0305" href="../components/form.html">Form</a>\
            <a class="guide-main__menu-link" data-code="C0308" href="../components/tabs.html">Tabs</a>\
            <a class="guide-main__menu-link" data-code="C0309" href="../components/popover.html">Popover</a>\
            <a class="guide-main__menu-link" data-code="C0310" href="../components/modal.html">Modal</a>\
            <a class="guide-main__menu-link" data-code="C0399" href="../components/icon.html">Icon</a>\
          </div>\
        </div>\
        <div class="guide-main__menu-group">\
          <button class="guide-main__menu-button">Example<i class="icon-001"></i></button>\
          <div class="guide-main__menu-links">\
            <a class="guide-main__menu-link" data-code="C0401" href="../example/map.html">Map</a>\
            <a class="guide-main__menu-link" data-code="C0402" href="../example/navigation.html">Navigation</a>\
            <a class="guide-main__menu-link" data-code="C0403" href="../example/datepicker.html">DatePicker</a>\
            <a class="guide-main__menu-link" data-code="C0404" href="../example/graph.html">Graph</a>\
            <a class="guide-main__menu-link" data-code="C0499" href="../worklist/worklist.html" target="_blank">WorkList <i class="icon-010"></i></a>\
          </div>\
        </div>\
      </nav>'
    );

    //
    $('.guide-header__toggle').on('click', function(event){
      var $target = $('.guide-main__menu')
        , offset = parseInt($target.css('left'));

      if (offset < 0) {
        $(this).css('transform', 'rotate(-90deg)');
        $target.css('left', '0');
      }
      else {
        $(this).css('transform', 'rotate(0)');
        $target.css('left', '-22rem');
      }
    });

    //
    $('.guide-main__menu-link').filter(function(){
      if (code == $(this).data('code')) return this;
    }).addClass('guide-main__menu-link--active').parent().show().prev().addClass('guide-main__menu-button--active');

    //
    $('.guide-main__menu-button').on('click', function(event){
      var $target = $(this).next();

      if ($target.is(':hidden')) {
        $($target).slideDown(100);
        $(this).addClass('guide-main__menu-button--active');
      }
      else {
        $($target).slideUp(100);
        $(this).removeClass('guide-main__menu-button--active');
      }
    });
  }

  // 코드 탭 버튼 클릭 이벤트
  if ($('.guide-viewer__tab').length) {
    $('.guide-viewer__tab .guide-tab__button').on('click', function(event){
      var _this = this;
      var $parent = $(this).closest('.guide-viewer__tab');
      var $target = $parent.siblings('.guide-viewer__syntax').find('pre').filter(function(){
        if ($(_this).data('lang') === $(this).data('lang')) return this;
      });

      if ($(this).hasClass('guide-tab__button--active')) {
        $(this).removeClass('guide-tab__button--active');
        $target.hide();
      }
      else {
        $(this).addClass('guide-tab__button--active');
        $(this).siblings().removeClass('guide-tab__button--active');
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

  if ($('.language-js').length) {
    $('.language-js').each(function(){
      $(this).html($(this).html().replace(/</g,"&lt;").replace(/>/g,"&gt;"));
    });
  }

  guide.include = include;
}(window[namespace]));