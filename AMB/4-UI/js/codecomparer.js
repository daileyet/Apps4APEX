window.amb = window.amb || {};
window.amb.codecomparer = window.amb.codecomparer || {};
// ///////////////////////////////////
window.amb.codecomparer.V = window.amb.codecomparer.V || {
	names : {
		R_COMPARE_VIEW : '#compare-view',
		R_COMPARE_VIEW_CONTAINER : '#compare-view .CodeMirror-merge',
		R_COMPARE_VIEW_CM : '#compare-view .CodeMirror',
		R_COMPARE_VIEW_FOOTER:'#compare-view-footer',
		I_CODE_CHANGE : 'P14_CODE_CHANGE',
		I_CODE_UNCHANGE : 'P14_CODE_UNCHANGE',
		I_MODEL : 'P14_MODEL',
		I_IDS : 'P14_IDS',
		B_SAVE:'#btn-diff-save',
		B_CANCEL:'#btn-diff-cancel'
	}
};
var V = window.amb.codecomparer.V;
V.init = function() {
	V.compareView.init();
};
V.configs = V.configs
		|| {
			common : {
				mode : 'text/x-plsql',
				lineNumbers : true,
				lineWrapping : true,
				foldGutter : {
					rangeFinder : new CodeMirror.fold.combine(
							CodeMirror.fold.plsql_begin,
							CodeMirror.fold.plsql_if,
							CodeMirror.fold.plsql_loop, CodeMirror.fold.comment)
				},
				gutters : [ "CodeMirror-linenumbers", "CodeMirror-foldgutter" ],
				scrollbarStyle : "simple",
				extraKeys : {
					"Ctrl-Space" : "autocomplete",
					"Ctrl-Q" : function(cm) {
						cm.foldCode(cm.getCursor());
					},
					"F11" : function(cm) {
						apex.event.trigger(Vn.B_fullscreen, 'click');
					},
					"Esc" : function(cm) {
						apex.event.trigger(Vn.B_fullscreen, 'click');
					}
				},
				value : $v(V.names.I_CODE_CHANGE),
				origLeft : null,
				orig : $v(V.names.I_CODE_UNCHANGE),
				highlightDifferences : true,
				//connect : "align",
				collapseIdentical : false
			}
		}
V.compareView = {
	cv : {},
	init : function() {
		V.compareView.cv = CodeMirror.MergeView($(V.names.R_COMPARE_VIEW)[0],  V.configs.common);
	},
	update : function(ctxs) {
		if (ctxs && ctxs.change) {
			V.compareView.cv.edit.setValue(ctxs.change);
		}

		if (ctxs && ctxs.unchange) {
			V.compareView.cv.rightOriginal().setValue(ctxs.unchange);
		}
	},
	resize : function() {
		var padding =1, dvMinHeight = 350;
		var dvPos = $(V.names.R_COMPARE_VIEW_CONTAINER).offset();
		var footerPos =$(V.names.R_COMPARE_VIEW_FOOTER).offset();
		var dvSmartHeight = footerPos.top - dvPos.top - padding;
		if(dvSmartHeight > dvMinHeight){
			 $(V.names.R_COMPARE_VIEW_CONTAINER).css("height",dvSmartHeight+"px");
			 $(V.names.R_COMPARE_VIEW_CM).css("height",dvSmartHeight+"px");
		}
	},
	getChangeValue:function(){
		return V.compareView.cv.edit.getValue();
	}
}
// ///////////////////////////////////
window.amb.codecomparer.M = window.amb.codecomparer.M || {

};
var M = window.amb.codecomparer.M;
// ///////////////////////////////////
window.amb.codecomparer.C = window.amb.codecomparer.C || {
	pageLoad : function() {
		V.init();
		C.reload();
		$(window).resize(function(){
			V.compareView.resize();
		});
		$(V.names.B_SAVE).unbind('click').click(C.saveDiff);
		V.compareView.resize();
	}
};
var C = window.amb.codecomparer.C;
C.reload = function() {
	var sIds = $v(V.names.I_IDS), sModel = $v(V.names.I_MODEL);
	showLoading();
	apex.server.process('RELOAD_DIFF_VIEW', {
		x01 : sModel,
		x02 : sIds
	}, {
		dataType : 'xml',
		success : function(data) {
			hideLoading();
			V.compareView.update({
				change : $('change', data).text(),
				unchange : $('unchange', data).text()
			});
		},
		complete : function() {
			hideLoading();
		}
	});
}
C.saveDiff=function(){
	var sIds = $v(V.names.I_IDS), sModel = $v(V.names.I_MODEL),sChangeCode = V.compareView.getChangeValue();
	showLoading();
	apex.server.process('SAVE_DIFF_VIEW', {
		x01 : sModel,
		x02 : sIds,
		x03 : sChangeCode
	}, {
		dataType : 'json',
		success : function(data) {
			hideLoading();
			if(data.type=='SUCCESS'){
				$(V.names.B_CANCEL).trigger('click');
			}else{
				alert("Failed to save changes.");
			}
		},
		complete : function() {
			hideLoading();
		}
	});
}