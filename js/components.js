;(function(){
  'use strict';

  var COLLAPSE = '[data-toggle="collapse"]'
    , COLLAPSE_SPEED = 100;

  $(COLLAPSE).on('click', function(event){
    var $target = $('#' + $(this).attr('aria-controls'));
    var group = $target.data('group');

    if (group) {
      $(group).find('[data-group="' + group + '"]').each(function(){
        if ($target.attr('id') != $(this).attr('id')) {
          $(this).animate({ height: 0 }, { duration: COLLAPSE_SPEED, complete: callback });
          $(this).attr('aria-hidden', true);
          $('#' + $(this).attr('aria-labelledby')).attr('aria-expanded', false);
        }
      });
    }

    if ($(this).attr('aria-expanded') == 'true') {
      $target.animate({ height: 0 }, { duration: COLLAPSE_SPEED, complete: callback });
      $target.attr('aria-hidden', true);
      $(this).attr('aria-expanded', false);
    }
    else {
      $target.animate({ height: $target.prop('scrollHeight') }, { duration: COLLAPSE_SPEED, complete: callback });
      $target.attr('aria-hidden', false);
      $(this).attr('aria-expanded', true);
    }

    function callback(){
      $(this).removeAttr('style');
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