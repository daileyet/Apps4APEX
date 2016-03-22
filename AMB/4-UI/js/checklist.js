window.amb = window.amb || {};
window.amb.checklist = window.amb.checklist || {};

window.amb.checklist.V = window.amb.checklist.V || {

	names : {
		I_CHECK_ITEM : 'input.checklist-item',
		I_MODEL : 'P5_MODEL'
	}
};
var V = window.amb.checklist.V;
window.amb.checklist.M = window.amb.checklist.M || {

};
var M = window.amb.checklist.M;

window.amb.checklist.C = window.amb.checklist.C || {
	init : function() {
		$(V.names.I_CHECK_ITEM).unbind('change').change(C.itemChangeHander);
	},
	itemChangeHander : function() {
		var $checkItem = $(this);
		var bCheckValue = $checkItem.prop("checked");
		var sCheckValue = $checkItem.prop("checked") ? 'Y' : 'N';
		var sId = $checkItem.data('id');
		var sModel = $v(V.names.I_MODEL);
		apex.server.process('SAVE_OBJECTS_CHECK_LIST', {
			x01 : sId,
			x02 : sCheckValue,
			x03 : sModel
		},
		{
			dataType : 'json',
			success : function(data) {
				if(data.type=='SUCCESS'){
					//console.log('Success');
				}
				else{
					//
					$checkItem.unbind('change');
					$checkItem.prop("checked",!bCheckValue);
					$checkItem.bind('change',C.itemChangeHander);
				}
			}
		}

		);
	}
};
var C = window.amb.checklist.C;