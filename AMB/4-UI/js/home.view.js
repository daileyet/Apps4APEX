window.amb = window.amb || {};
window.amb.V = window.amb.V || {};
var V = window.amb.V;

V.init=function(){// view initialize
	V.components.sections.top.init();
	V.components.sections.main.init();
	V.components.sections.alert.init();
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
		'S_main_btn_grp':'#main-section .t-Region-headerItems--buttons',
		
		'S_header':'header.t-Header',
		'S_fix_panel':'#fs-fixed-panel',
		
		'B_create':'#btn-object-create',
		'B_fullscreen':'#btn-object-fullscreen',
		'B_fullscreen_icon':'#btn-object-fullscreen span.t-Icon',
		'B_refresh':'#btn-object-refersh',
		'B_save':'#btn-object-save',
		'B_compile':'#btn-object-compile',
		'B_obj_option':'#btn-object-option',
		
		'B_init':'#btn-version-init',
		'B_build_all':'#btn-version-buildall',
		'B_export':'#btn-version-export',
		'B_obj_info':'#btn-object-info',
		
		'N_cp_err':'#compile-error-notification',
		'N_cp_err_msg':'#compile-error-notification .htmldbUlErr',
		'N_cp_err_close':'#compile-error-notification .t-Button--closeAlert',
		
		'M_overlay':'#object-loading-mark',
		
		'D_version_selector':'#dialog-version-selector',
		'D_new_object':'#dialog-new-object',
		'D_init_objects':'#dialog-init-objects',
		
		
		'T_nav':'#t_Body_nav',
		'T_nav_leaf_label':'#t_Body_nav .a-TreeView-node--leaf .a-TreeView-label',
		
		'L_obj_info':'#object-info'
		
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

V.components.nav_tree = V.components.nav_tree || {
	init:function(){},
	removeNode:function(itemName){
		var $removed_labels = $(Vn.T_nav_leaf_label).filter(function(){
			return $(this).text() == itemName;
		});
		
		var $removed_leafs = $removed_labels.parents('.a-TreeView-node--leaf');
		var $remove_leafs_group = $removed_leafs.parent();
		var $remove_node_topLevel = $removed_labels.parents('.a-TreeView-node--topLevel');
		
		$removed_leafs.remove();
		if($remove_leafs_group.length!=0 && $remove_leafs_group.children().length==0){
			$remove_node_topLevel.remove();
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
	},
	new_object:{
		open:function(){
		    openModal($(Vn.D_new_object).attr('id'));
		},
		close:function(){
			closeModal();
		}
	},
	init_version:{
		open:function(){
		    openModal($(Vn.D_init_objects).attr('id'));
		},
		close:function(){
			closeModal();
		}
	}
};
V.components.editors = V.components.editors || {
	primary:{
		cm : {},
		exec_command:function(s_cmd, cmd_ops){
			var cm = V.components.editors.primary.cm ;
			if (cmd_ops == undefined)
				cm.setOption(s_cmd, !cm.getOption(s_cmd));
			else
				cm.setOption(s_cmd, cmd_ops);
		},
		setVal:function(sVal){
			var cm = V.components.editors.primary.cm ;
			cm.doc.setValue(sVal) ;
		},
		getVal:function(){
			var cm = V.components.editors.primary.cm ;
			return cm.doc.getValue();
		},
		isFullScreen:function(){
			var cm = V.components.editors.primary.cm ;
			return cm.getOption('fullScreen');
		}
	},
	init:function(){
		V.components.editors.primary.cm =  CodeMirror($("#obj-container .obj-content")[0], {
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
	},
	alert:{
		init:function(){
			
		},
		setAlertMsg:function(sVal){
			$(Vn.N_cp_err_msg).html(sVal);
		},
		showAlertMsg:function(sVal){
			var parent$ = $(Vn.N_cp_err);
			var closeAlert$ = $(Vn.N_cp_err_close);
			parent$.addClass("is-fading");
			parent$.removeClass("is-hidden").addClass("is-visible");
			closeAlert$.removeClass("is-disabled").attr("disabled", !1);
			$(Vn.N_cp_err_msg).html(sVal);
		},
		hideAlertMsg:function(sVal){
			if(sVal!=undefined){
				$(Vn.N_cp_err_msg).html(sVal);
			}
			$(Vn.N_cp_err_close).trigger('click');
		},
		showTag:function(){
			var error_html = '<i class="fa fa-exclamation-triangle compile-error"></i>';
			$(Vn.S_main_heading + ' .compile-error').remove();
			$(Vn.S_main_heading).append(error_html);
		},
		bindTagClick:function(fnClick){
			$(Vn.S_main_heading + ' .compile-error').click(fnClick);
		},
		hideTag:function(){
			$(Vn.S_main_heading + ' .compile-error').remove();
		}
	},
	alert_dynamic:{
		init:function(){
			var message = '<div class="t-Body-alert">' +
			'<div id="t_Alert_Success" class="t-Alert t-Alert--defaultIcons t-Alert--success t-Alert--horizontal t-Alert--page t-Alert--colorBG is-visible" role="alert">'+
			'<div class="t-Alert-wrap">' + 
			'<div class="t-Alert-icon">' +
			'<span class="t-Icon"></span>' +
			'</div>' +
			'<div class="t-Alert-content">' +
			'<div class="t-Alert-header">' +
			'<h2 class="t-Alert-title">' +
			'Action Processed.' +
			'</h2>' +
			'</div>' +
			'</div>' +
			'<div class="t-Alert-buttons">' +
			'<button class="t-Button t-Button--noUI t-Button--icon t-Button--closeAlert" title="Close Notification" type="button" style="touch-action: pan-y;">' +
			'<span class="t-Icon icon-close"></span>' +
			'</button>' +
			'</div>' +
			'</div>' +
			'</div>' +
			'</div>';
			$(message).appendTo("body"); 
			$(function() {
				  $('.t-Button--closeAlert').bind('click',function(){
				    $(".t-Body-alert").remove();
				  });
				});
		}
	}
};




