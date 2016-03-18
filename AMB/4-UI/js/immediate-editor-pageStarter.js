$('a.immediate-trigger').immediateEdit({
	elements : [ {// status column
		'jquerySelector' :  function(){
            return $(".ops-type:contains('number')").parents('td[headers="OPS_VALUE"]');
		},
		'oldValSelector' : 'b.ops-value',
		'controller' : 'number',
		'processName' : 'SAVE_OPTIONS',
		'beforeProcessCallback':showLoading,
		'processCallback' : {
			'success' : function(callObj) {
				console.log('success');
				hideLoading();
			},
			'fail' : function(callObj) {
				console.log('failed');
				hideLoading();
			}
		},
		'db_column' : 'OPS_VALUE'
	},
	{// status column
		'jquerySelector' : function(){
			return $(".ops-type:contains('boolean')").parents('td[headers="OPS_VALUE"]');
		},
		'oldValSelector' : 'b.ops-value',
		'controller' : 'select',
		'processName' : 'SAVE_OPTIONS',
		'beforeProcessCallback':showLoading,
		'processCallback' : {
			'success' : function(callObj) {
				console.log('success');
				hideLoading();
			},
			'fail' : function(callObj) {
				console.log('failed');
				hideLoading();
			}
		},
		'data':[{'display':'','value':'true'},{'display':'','value':'false'}],
		'db_column' : 'OPS_VALUE'
	}  ]
// end of elements array
});

var showLoading = function(callObj){
	$('.refresh-icon-container2').removeClass('display-none');
}
var hideLoading = function(){
	$('.refresh-icon-container2').addClass('display-none');
}