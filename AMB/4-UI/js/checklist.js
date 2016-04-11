window.amb = window.amb || {};
window.amb.checklist = window.amb.checklist || {};

window.amb.checklist.V = window.amb.checklist.V || {

	names : {
		I_CHECK_ITEM : 'input.checklist-item',
		I_MODEL : 'P5_MODEL',
		B_SELECT_ALL:'#btn-select-all',
		B_UNSELECT_ALL:'#btn-unselect-all',
		B_DIFF_HOLDER:'#btn-diff-holder',
		L_DIFF_INVOKER:'.df-pointer'
	}
};
var V = window.amb.checklist.V;
window.amb.checklist.M = window.amb.checklist.M || {

};
var M = window.amb.checklist.M;

window.amb.checklist.C = window.amb.checklist.C || {
	init : function() {
		$(V.names.I_CHECK_ITEM).unbind('change').change(C.itemChangeHander);
		C.registerDiff();
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
	},
	selectAll:function(){
		var sIds = '',sCheckValue = 'Y',sModel = $v(V.names.I_MODEL);
		$(V.names.I_CHECK_ITEM).each(function(){
			if(!$(this).prop("checked")){
				sIds=sIds+$(this).data('id')+',';
			}
		});
		if(sIds.length>0){
			showLoading();
			sIds=sIds.substr(0,sIds.length-1);
			apex.server.process('SAVE_OBJECTS_CHECK_LIST_BATCH', {
				x01 : sIds,
				x02 : sCheckValue,
				x03 : sModel
			},
			{
				dataType : 'json',
				success : function(data) {
					hideLoading();
					if(data.type=='SUCCESS'){
						$(V.names.I_CHECK_ITEM).prop("checked",true);
					}
					else{
						//

					}
				},
				complete:function(){
					hideLoading();
				}
			}
			);
		}
	},
	unselectAll:function(){
		var sIds = '',sCheckValue = 'N',sModel = $v(V.names.I_MODEL);
		$(V.names.I_CHECK_ITEM+':checked').each(function(){
			if($(this).prop("checked")){
				sIds=sIds+$(this).data('id')+',';
			}
		});
		if(sIds.length>0){
			showLoading();
			sIds=sIds.substr(0,sIds.length-1);
			apex.server.process('SAVE_OBJECTS_CHECK_LIST_BATCH', {
				x01 : sIds,
				x02 : sCheckValue,
				x03 : sModel
			},
			{
				dataType : 'json',
				success : function(data) {
					hideLoading();
					if(data.type=='SUCCESS'){
						$(V.names.I_CHECK_ITEM).prop("checked",false);
					}
					else{
						//
					}
				},
				complete:function(){
					hideLoading();
				}
			}
			);
		}
	},
	registerDiff:function(){
		$(V.names.L_DIFF_INVOKER).unbind('click').click(function(){
			var clickSource = $(V.names.B_DIFF_HOLDER).attr('onclick');
			clickSource = clickSource.replace(/P14_MODEL,P14_IDS:(.*)(\\u0026|&)/g, 'P14_MODEL,P14_IDS:'+$v(V.names.I_MODEL)+','+$(this).data('id')+'&');
			$(V.names.B_DIFF_HOLDER).attr('onclick',clickSource);
			$(V.names.B_DIFF_HOLDER).trigger('click');
		});
	}
};
var C = window.amb.checklist.C;