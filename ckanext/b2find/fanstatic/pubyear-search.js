/* Module for handling the publication year querying
 */
this.ckan.module('pubyear-search', function ($) {
     return {
      initialize: function () {
        console.log("init start pubyear search");
        var form = $(".search-form");

        // Add necessary fields to the search form if not already created
        $(['ext_startdate', 'ext_enddate']).each(function(index, item){
          if ($("#" + item).length === 0) {
            $('<input type="hidden" />').attr({'id': item, 'name': item}).appendTo(form);
          }
        });

        $('#ext_startdate').val("2000");
        $('#ext_enddate').val("2010");

        console.log("init end pubyear search");
      },

    }
  });
