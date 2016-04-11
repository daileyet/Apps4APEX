window.amb = window.amb || {};
window.amb.codecomparer = window.amb.codecomparer || {};
// ///////////////////////////////////
window.amb.codecomparer.V = window.amb.codecomparer.V || {
	names : {
		R_COMPARE_VIEW : '#compare-view',
		I_CODE_CHANGE : 'P14_CODE_CHANGE',
		I_CODE_UNCHANGE : 'P14_CODE_UNCHANGE',
		I_MODEL : 'P14_MODEL',
		I_IDS : 'P14_IDS'
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
				}
			}
		}
V.compareView = {
	cv : {},
	init : function() {
		V.compareView.cv = CodeMirror.MergeView($(V.names.R_COMPARE_VIEW)[0], {
			value : $v(V.names.I_CODE_CHANGE),
			origLeft : null,
			orig : $v(V.names.I_CODE_UNCHANGE),
			lineNumbers : true,
			mode : 'text/x-plsql',
			highlightDifferences : true,
			connect : "align",
			collapseIdentical : false
		});
	},
	update : function(ctxs) {
		if (ctx && ctx.change) {
			V.compareView.cv.edit.setValue(ctx.change);
		}

		if (ctx && ctx.unchange) {
			V.compareView.cv.rightOriginal().setValue(ctx.unchange);
		}
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