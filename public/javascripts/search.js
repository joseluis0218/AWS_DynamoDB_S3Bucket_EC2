$(document).ready(function(){
  $("#myInput").on("keyup", function() {
    var value = $(this).val().toLowerCase();
    $(".filter").filter(function() {
        $(this).toggle($("h4", this).text().toLowerCase().indexOf(value) > -1);
    });
  });
});
