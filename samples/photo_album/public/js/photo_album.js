$(document).ready(() => {
  $('.toggle_info').click(() => {
    $(this).closest('.photo').toggleClass('show_more_info');
    return false;
  });
});
