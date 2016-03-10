window.amb = window.amb || {};
window.amb.V = window.amb.V || {};
var V = window.amb.V;

V.init=function(){// view initialize
	
	V.components.sections.top.init();
	V.components.sections.main.init();
	V.components.editors.init();
	V.components.dialogs.version_selector.init();
	V.components.overlays.code_loader.init();
};

V.names = {
		'I_version':'P1_VERSION',
		'I_action':'P1_OBJECT_ACTION',
		'I_compile_tag':'P1_OBJECT_COMPILED',
		'I_compile_msg':'P1_OBJECT_COMPILE_ERROR',
		'I_code':'P1_OBJECT_CODE',
		'I_id':'P1_OBJECT_ID',
		
		'RI_obj_name':'#object-identify',
		
		'S_top':'#top-section',
		'S_top_heading':'#top-section_heading',
		'S_top_header_panel':'#top-section-header-container',
		'S_main':'#main-section',
		'S_main_heading':'#main-section_heading',
		'S_main_header_panel':'#main-section-header-container',
		
		'B_fullscreen':'#btn-object-fullscreen',
		
		'N_cp_err':'#compile-error-notification',
		'N_cp_err_msg':'#compile-error-notification .htmldbUlErr',
		'N_cp_err_close':'#compile-error-notification .t-Button--closeAlert',
		
		'M_overlay':'#object-loading-mark',
		
		'D_version_selector':'#version-selector',
		
		'T_nav':'#t_Body_nav'
};
var Vn = V.names;
V.components = V.components || {};

V.components.overlays = V.components.overlays || {
	code_loader:{
		init:function(){
			$(Vn.M_overlay).hide();
		},
		show:function(){
			$(Vn.M_overlay).show();
		},
		hide:function(){
			$(Vn.M_overlay).hide();
		}
	}
};

V.components.dialogs = V.components.dialogs || {
	version_selector:{
		init:function(){
		},
		open:function(){
			$(Vn.T_nav).css('overflow','hidden');
		    openModal($(Vn.D_version_selector).attr('id'));
		},
		close:function(){
			closeModal();
			$(Vn.T_nav).css('overflow','auto');
		}
	}
};
V.components.editors = V.components.editors || {
	primary:{},
	init:function(){
		V.components.editors.primary =  CodeMirror($("#obj-container .obj-content")[0], {
			mode : 'text/x-plsql',
			lineNumbers : true,
			fixedGutter : true,
			autofocus : true,
			scrollbarStyle : "simple",
			extraKeys : {
				"Ctrl-Space" : "autocomplete",
				"F11" : function(cm) {
					apex.event.trigger(Vn.B_fullscreen, 'click');
				},
				"Esc" : function(cm) {
					apex.event.trigger(Vn.B_fullscreen, 'click');
				}
			}
		});
	}
};
V.components.sections = V.components.sections || {
	top:{
		init:function(){
			$(Vn.S_top_heading).html($(Vn.S_top_header_panel).html());
			$(Vn.S_top_header_panel).empty();
		}
	},
	main:{
		init:function(){
			$(Vn.S_main).append($(Vn.M_overlay));
			$(Vn.S_main_heading).html($(Vn.S_main_header_panel).html());
			$(Vn.S_main_header_panel).empty();
		}
	}
};




