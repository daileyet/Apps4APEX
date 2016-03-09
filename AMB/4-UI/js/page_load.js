var primaryCodeMirror = CodeMirror($("#obj-container .obj-content")[0], {
	mode : 'text/x-plsql',
	lineNumbers : true,
	fixedGutter : true,
	autofocus : true,
	scrollbarStyle : "simple",
	extraKeys : {
		"Ctrl-Space" : "autocomplete",
		"F11" : function(cm) {
			apex.event.trigger('#btn-object-fullscreen', 'click');
		},
		"Esc" : function(cm) {
			apex.event.trigger('#btn-object-fullscreen', 'click');
		}
	}
});
primaryCodeMirror.doc.setValue($v('P1_OBJECT_CODE'));
window.amb.editors = window.amb.editors || {};
window.amb.editors.primary = primaryCodeMirror;

window.amb.events.updates[0] = function(state) {
	//update object id and name and refresh
	$('#object-identify').text(state.oname);
	$s('P1_OBJECT_ID', state.oid);
	apex.event.trigger('#btn-refersh-object', 'click')
}

window.amb.events.refreshs[0] = function(ops) {
	//show or hide the compile error icon which after object name
	var compileHandKey = 'COMPILE_END_'
			+ (apex.item("P1_OBJECT_COMPILED").isEmpty() ? 'SUCCESS'
					: $v('P1_OBJECT_COMPILED'))
	window.amb.handers[compileHandKey] == undefined
			|| window.amb.handers[compileHandKey].call(this, {
				state : get_amb_state(),
				addInPlace : '#main-section_heading'
			});
}



//hide or show project version selector panel
if($v('P1_VERSION')=='')
{
    $('#t_Body_nav').css('overflow','hidden');
    openModal('version-selector');
    return;
}
$('#t_Body_nav').css('overflow','auto');