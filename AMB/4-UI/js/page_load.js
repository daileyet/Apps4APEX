var primaryCodeMirror = CodeMirror(
$("#obj-container .obj-content")[0]
,{
    mode:'text/x-plsql'
    ,lineNumbers:true
    ,fixedGutter:true
    ,autofocus: true
    ,scrollbarStyle: "simple"
    ,extraKeys: {
       "Ctrl-Shift-Space": "autocomplete"
        ,"F11": function(cm) {
          apex.event.trigger('#btn-object-fullscreen','click');
        },
        "Esc": function(cm) {
          apex.event.trigger('#btn-object-fullscreen','click');
        }
     }
}
);
primaryCodeMirror.doc.setValue($v('P1_OBJECT_CODE'));
window.amb.editors = window.amb.editors || {};
window.amb.editors.primary = primaryCodeMirror;

window.amb.events.updates[0] = function(state){
  $('#object-identify').text(state.oname);
  $s('P1_OBJECT_ID',state.oid);
  apex.event.trigger('#btn-refersh-object','click')
}
