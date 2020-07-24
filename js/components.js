;(function(){
  'use strict';

  var COLLAPSE = '[data-toggle="collapse"]';
  var ACTIVE = 'collapse-default__button--active';
  var SPEED = 100;

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
          $(this).slideUp(SPEED);
          $('#' + $(this).attr('aria-labelledby')).removeClass(ACTIVE);
        }
      });
    }

    if ($target.is(':hidden')) {
      $target.slideDown(SPEED);
      $(this).attr('aria-expanded', true);
      $(this).addClass(ACTIVE);
    }
    else {
      $target.slideUp(SPEED);
      $(this).attr('aria-expanded', false);
      $(this).removeClass(ACTIVE);
    }
  });
}());