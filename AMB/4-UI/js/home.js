window.amb = window.amb ||{};
window.amb.state = window.amb.state || {} 
window.amb.events = window.amb.events || {};
window.amb.events.updates = [];
/**
 * update primary editor content by given parameter
 * @param s_code
 */
window.amb.update_primary_editor = function (s_code){
	if(window.amb.editors && window.amb.editors.primary){
		window.amb.editors.primary.doc.setValue(s_code);
	}
}
window.amb.exec_primary_editor_command = function (s_cmd,cmd_ops){
	if(window.amb.editors && window.amb.editors.primary){}else{return;};
	var cm = window.amb.editors.primary;
	
	if(cmd_ops == undefined)
		cm.setOption(s_cmd, !cm.getOption(s_cmd));
	else
		cm.setOption(s_cmd, cmd_ops);
}

window.amb.get_primary_editor_option=function(s_ops_name){
	if(window.amb.editors && window.amb.editors.primary){}else{return '';};
	return window.amb.editors.primary.getOption(s_ops_name);
}



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
	update_amb_state({
		vid:$v('P1_VERSION'),
		oid:s_oid,
		oname:s_oname
	});
}
	