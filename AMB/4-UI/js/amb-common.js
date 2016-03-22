$('document').ready(function(){
    setTimeout(function(){
      $('.lazy-display-block').removeClass('display-none').show();
      $('.lazy-visibility-visible').removeClass('visibility-hiden').show();
      $('.lazy-display-none.refresh-icon-container2').addClass('display-none').hide();
      $('.lazy-display-none.mask-overlay').addClass('display-none').hide();
    },300);
});