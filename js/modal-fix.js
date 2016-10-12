$( document ).ready(function() {


$('.button-modal').click(function(event) {

    var modal_id = $(this).attr("data-target");

    console.log(modal_id);
    //var leaves = plant.dataset.leaves; 
    event.preventDefault();
    initialize_game(modal_id == "#chapter-three");
    return true;
  });


 $(".modal").on('hidden.bs.modal', function () {
    //$(this).data('bs.modal', null);

     /*var modal_id = $('bs.modal').attr("data-target");

     console.log(modal_id);*/

       $("video").each(function ()
        {
            this.pause();
            this.currentTime = 0;
            this.load();
           // this.src = "";
        });


       $(this).removeData('bs.modal');
    

    });


});