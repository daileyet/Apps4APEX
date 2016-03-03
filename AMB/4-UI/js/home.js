function get_amb_state(){
	window.amb = window.amb || {};
	var state = window.amb.state || {} 
	state.vid = $v('P1_VERSION');
	if(state.oid==undefined){
		state.oid='';
	}
	if(state.oname==undefined){
		state.oname='';
	}
	return state;
}

function update_amb_state(state){
	var state_ = get_amb_state();
	if(state && state.oid){
		state_.oid=state.oid;
	}
	if(state && state.oname){
		state_.oname=state.oname;
	}
	window.amb.state = state_;
	if(window.amb.events && window.amb.events.updates){
		var events_update = window.amb.events.updates;
		for(var i=0,j=events_update.length;i<j;i++){
			var event_update=events_update[i];
			event_update.call(this,state_);
		}
	}
}

function edit_object(s_oname,s_oid){
	/*
	apex.server.process(
		'OBJECT_SETTING',
		{x01 : s_oid},
		{
			dataType:'json',
			success:function(data){
				if(data.result=='success'){
					update_amb_state({
						vid:$v('P1_VERSION'),
						oid:s_oid,
						oname:s_oname
					});
				}
			}
		}
	);*/
	update_amb_state({
		vid:$v('P1_VERSION'),
		oid:s_oid,
		oname:s_oname
	});
}
/*
 var primaryCodeMirror = CodeMirror.fromTextArea(
 //$("#obj-container .obj-panel-primary .obj-content .obj-code")[0]
 $("#P1_OBJECT_CODE")[0]
 ,{
 lineNumbers:true
 ,fixedGutter:true
 }
 );
 window.amb.editors = window.amb.editors || {};
 window.amb.editors.primary = primaryCodeMirror;
*/