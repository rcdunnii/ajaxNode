$(function(){
	 $('#search').on('keyup', function(e){
	   if (e.keyCode === 13) {
            var parameters = { "target": $(this).val() };
             $.ajax({
                type: "get",
                url: '/search/',
                data: parameters
                success: function(id) {
                    doStuff(id);
                },
                error: function(jqXHR, textstatus, errorThrown) {
                    alert('text status ' + textstatus + ', err ' + errorThrown);
                };
             });
       }
    });
});    