$(document).ready(function(){
  $('.toggle_info').click(function () {
    $(this).closest('.photo').toggleClass('show_more_info');
    return false;
  });
});
