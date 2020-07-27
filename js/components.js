;(function(){
  'use strict';

  var COLLAPSE = '[data-toggle="collapse"]'
    , COLLAPSE_ACTIVE = 'collapse-default__button--active'
    , COLLAPSE_SPEED = 100;

  $(COLLAPSE).each(function(index){
    var $target = $($(this).data('target'));

    if ($target.length) {
      $target.is(':hidden')
        ? $(this).attr('aria-expanded', false)
        : $(this).attr('aria-expanded', true);

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