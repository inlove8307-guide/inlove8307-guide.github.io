;(function(){
  'use strict';

  var COLLAPSE = '[data-toggle="collapse"]'
    , COLLAPSE_ACTIVE = 'collapse-default__button--active'
    , COLLAPSE_SPEED = 100;

  $(COLLAPSE).each(function(index){
    var $target = $($(this).data('target'));

    if ($target.length) {
      if ($target.is(':hidden')) {
        $(this).attr('aria-expanded', false);
        $(this).removeClass(COLLAPSE_ACTIVE);
      }
      else {
        $(this).attr('aria-expanded', true);
        $(this).addClass(COLLAPSE_ACTIVE);
      }

      $(this).attr('aria-controls', $(this).data('target'));
      $target.attr('aria-labelledby', $(this).attr('id'));
    }
  });

  $(COLLAPSE).on('click', function(event){
    var $target = $($(this).data('target'));

    if ($target.data('parent')) {
      $($target.data('parent')).find('[data-parent]').each(function(){
        if ($target.data('parent') == $(this).data('parent')) {
          $(this).slideUp(COLLAPSE_SPEED);
          $('#' + $(this).attr('aria-labelledby')).removeClass(COLLAPSE_ACTIVE);
        }
      });
    }

    if ($target.is(':hidden')) {
      $target.slideDown(COLLAPSE_SPEED);
      $(this).attr('aria-expanded', true);
      $(this).addClass(COLLAPSE_ACTIVE);
    }
    else {
      $target.slideUp(COLLAPSE_SPEED);
      $(this).attr('aria-expanded', false);
      $(this).removeClass(COLLAPSE_ACTIVE);
    }
  });
}());

;(function(){
  'use strict';

  var MODAL = '[data-toggle="modal"]'
    , MODAL_CONTENT = '.modal__content'
    , MODAL_SPEED = 100;

  $(MODAL).on('click', function(event){
    var $target = $($(this).data('target'))
      , $content = $target.find(MODAL_CONTENT);

    if ($target.is(':hidden')) {
      gsap.fromTo($target, { display: 'block', backgroundColor: 'rgba(0, 0, 0, 0)' }, { backgroundColor: 'rgba(0, 0, 0, 0.5)', duration: MODAL_SPEED * 0.001 });

      switch($target.data('align')){
        case 'top': gsap.fromTo($content, { transform: 'translateY(-100%)' }, { transform: 'translateY(0)', duration: MODAL_SPEED * 0.001 }); break;
        case 'bottom': gsap.fromTo($content, { transform: 'translateY(100%)' }, { transform: 'translateY(0)', duration: MODAL_SPEED * 0.001 }); break;
        default: gsap.fromTo($content, { opacity: 0 }, { opacity: 1, duration:  MODAL_SPEED * 0.001 }); break;
      }
    }
    else {
      $target.hide();
    }
  });
}());

;(function(){
  'use strict';

  var TAB = '[data-toggle="tab"]';

  $(TAB).each(function(index){
    var $target = $($(this).attr('href'));

    if ($(this).attr('aria-selected') == 'true') {
      if ($target.length) {
        $target.show();
      }
    }
  });

  $(TAB).on('click', function(event){
    var $target = $($(this).attr('href'));

    if ($target.length) {
      $(this).attr('aria-selected', 'true').siblings().attr('aria-selected', 'false');
      $target.show().siblings().hide();
      event.preventDefault();
    }
  });
}());