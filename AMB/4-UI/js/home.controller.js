window.amb = window.amb || {};
window.amb.C = window.amb.C || {};
var C = window.amb.C;
var V = window.amb.V;
var Vn = V.names;
var M = window.amb.M;

C.init = function() {
	M.state.addUpdateListener("NAME", function(valObj) {
		M.items['object_name'].text(valObj.new_val);
	});
	M.state.addUpdateListener("ID", function(valObj) {
		M.items['object_id'].setVal(valObj.new_val);
		M.buttons.info_obj.refresh(valObj.new_val);
		M.buttons.obj_option.refresh(valObj.new_val);
		M.buttons.compare.refresh(valObj.new_val);
		if (!M.items['object_id'].isEmpty()){
			M.buttons.compare.show();
			M.buttons.refresh.show();
			M.buttons.save.show();
			M.buttons.compile.show();
			M.buttons.obj_option.show();
		}
		else{
			M.buttons.compare.hide();
			M.buttons.refresh.hide();
			M.buttons.save.hide();
			M.buttons.compile.hide();
			M.buttons.obj_option.hide();
		}
	});
	M.state.addUpdateListener("CODE", function(valObj) {
		// update editor content
		V.components.editors.primary.setVal(valObj.new_val);
	});
	M.state.addUpdateListener("COMPILED", function(valObj) {
		if (valObj.new_val == 'FAILED') {
			V.components.sections.alert.showTag();
			V.components.sections.alert.bindTagClick(function() {
				V.components.sections.alert
						.showAlertMsg(M.state.obj_compile_error);
			});
		} else {
			V.components.sections.alert.hideTag();
			V.components.sections.alert.hideAlertMsg();
		}
	});
	M.state.addUpdateListener("COMPILE_ERROR", function(valObj) {
		V.components.sections.alert.setAlertMsg(valObj.new_val);
	});

	M.buttons.refresh.bindClick(C.refresh);
	M.buttons.fullscreen.bindClick(C.fullscreen);
	M.buttons.create.bindClick(C.create);
	M.buttons.save.bindClick(C.save);
	M.buttons.compile.bindClick(C.compile);
	M.buttons.init.bindClick(C.initVersion);
	M.buttons.info_obj_proxy.bindClick(C.openObjectInfo);
	M.items.version.isEmpty() ? V.components.dialogs.version_selector.open()
			: V.components.dialogs.version_selector.close();

	if (!M.items['object_id'].isEmpty()) {
		M.buttons.compare.show();
		M.buttons.refresh.show();
		M.buttons.save.show();
		M.buttons.compile.show();
		M.buttons.obj_option.show();
		C.refresh();
	} else {
		M.buttons.compare.hide();
		M.buttons.refresh.hide();
		M.buttons.save.hide();
		M.buttons.compile.hide();
		M.buttons.obj_option.hide();
		M.state.update({
			obj_name : '',
			obj_code : '',
			obj_status : '',
			obj_compiled : '',
		});
	}
	$(window).resize(C.editorResizeHander);
	
	C.editorChangeHander();
};


// main event handers of page and element
C.pageLoad = function() {
	V.init();
	M.init();
	C.init();
}

C.initVersion = function() {
	V.components.dialogs.init_version.open();
}

C.editorResizeHander = function(){
	V.components.editors.primary.resize();
}
C.editorChangeListener=function(){
	if(!M.items['object_id'].isEmpty()){M.state.obj_status = "CODE_CHANGED";}
	if(!M.items['object_id'].isEmpty() && M.state.obj_auto_save){
		if(C.autoSaveTimeout)clearTimeout(C.autoSaveTimeout);
		C.autoSaveTimeout =	setTimeout(function(){
				if(M.state.obj_status == "CODE_CHANGED"){C.save();}
			},  M.state.obj_auto_save_interval);
	}
}
C.editorChangeHander=function(){
	C.refreshOptions();
	V.components.editors.primary.registerChangeListener(C.editorChangeListener);
}
C.create = function() {
	V.components.dialogs.new_object.open();
}
C.treeNodeClick = function(id) {
	V.components.overlays.code_loader.show();// show loading mask
	// change object id & name
	M.state.update({
		obj_id : id
	});
	// Ajax load object code & status
	apex.server.process('REFRESH_OBJECT', {
		x01 : id
	}, {
		dataType : 'xml',
		success : function(data) {
			V.components.editors.primary.removeChangeListener(C.editorChangeListener);
			M.state.update({
				obj_name : $('name', data).text(),
				obj_status : $('action_status', data).text(),
				obj_code : $('code', data).text(),
				obj_compiled : $('compile_tag', data).text(),
				obj_info_url : $('url_info', data).text()
			});
			C.editorResizeHander();
			V.components.overlays.code_loader.hide();
			V.components.editors.primary.registerChangeListener(C.editorChangeListener);
		},
		complete:function(){
			V.components.overlays.code_loader.hide();
		}
	});
}
C.fullscreen = function() {
	V.components.editors.primary.exec_command('fullScreen');
	if (V.components.editors.primary.isFullScreen()) {
		$(window).unbind("resize",C.editorResizeHander);
		$(Vn.S_header).slideUp('fast');
		M.buttons.fullscreen.title('Exit Full Screen');
		$(Vn.B_fullscreen_icon).removeClass('fa-expand')
				.addClass('fa-compress');
		$(Vn.S_main_btn_grp).children().appendTo($(Vn.S_fix_panel));
		$(Vn.M_overlay).addClass('CodeMirror-fullscreen');
	} else {
		$(Vn.S_header).show();
		M.buttons.fullscreen.title('Full Screen');
		$(Vn.B_fullscreen_icon).removeClass('fa-compress')
				.addClass('fa-expand');
		$(Vn.S_fix_panel).children().appendTo($(Vn.S_main_btn_grp))
		$(Vn.M_overlay).removeClass('CodeMirror-fullscreen');
		$(window).bind("resize",C.editorResizeHander);
	}
}
C.refresh = function() {
	C.treeNodeClick(M.state.obj_id);
}
C.save = function() {
	V.components.overlays.code_loader.show();// show loading mask
	M.state.obj_code = V.components.editors.primary.getVal();
	// Ajax save object code
	apex.server.process('SAVE_OBJECT_CTX', {
		x01 : M.state.obj_id,
		x02 : M.state.obj_code
	}, {
		dataType : 'xml',
		success : function(data) {
			M.state.update({
				obj_status : $('action_status', data).text()
			});
			V.components.overlays.code_loader.hide();
		},
		complete:function(){
			V.components.overlays.code_loader.hide();
		}
	});
}
C.compile = function() {
	V.components.overlays.code_loader.show();// show loading mask
	M.state.obj_code = V.components.editors.primary.getVal();
	// Ajax save object code
	apex.server.process('COMPILE_OBJECT_CTX', {
		x01 : M.state.obj_id,
		x02 : M.state.obj_code
	}, {
		dataType : 'xml',
		success : function(data) {
			M.state.update({
				obj_status : $('action_status', data).text(),
				obj_compiled : $('compile_tag', data).text(),
				obj_compile_error : $('compile_error', data).text()
			});
			V.components.overlays.code_loader.hide();
		},
		complete:function(){
			V.components.overlays.code_loader.hide();
		}
	});
}
C.refreshOptions=function(){
	// Ajax load auto save & interval
	apex.server.process('GET_VERSION_OPTIONS', {
		x01 : M.items.version.getVal()
	}, {
		dataType : 'xml',
		success : function(data) {
			M.state.update({
				obj_auto_save : $('AUTO_SAVE', data).text()=="true"?true:false,
				obj_auto_save_interval : Number($('AUTO_SAVE_INTERVAL', data).text())*1000
			});
		}
	});
}

C.openObjectInfo = function() {
	if(M.state.obj_id!=''){
		M.buttons.info_obj.click();
	}
}
C.afterCloseObjectInfo=function(sAction){
	console.log(sAction);
	V.components.sections.alert_dynamic.init();
	if(sAction && sAction=="DELETE"){
		apex.submit('REFRESH');
	}else if(sAction && sAction=="UPDATE"){
		
	}
}

