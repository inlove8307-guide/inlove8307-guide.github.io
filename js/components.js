;(function(){
  'use strict';

  $('.collapse-default__button').on('click', function(event){
    var $target = $(this).siblings('.collapse-default__content');

    if ($target.is(':hidden')) {
      $target.slideDown(100).parent().siblings().find('.collapse-default__content').slideUp(100);
    }
    else {
      $target.slideUp(100);
    }
  });
}());