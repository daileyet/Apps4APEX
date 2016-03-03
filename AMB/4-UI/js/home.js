function get_amb_state(){
	var state = window.amb || {} 
	state.vid = $v('CURRENT_VERSION');
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
	window.amb = state_;
	if(window.amb_update_events){
		var events_update = window.amb_update_events;
		for(var i=0,j=events_update.length;i<j;i++){
			var event_update=events_update[i];
			event_update.call(this,state_);
		}
	}
}

function edit_object(s_oname,s_oid){
	apex.server.process(
	'OBJECT_SETTING',
	{x01 : s_oid},
	{
		dataType:'json',
		success:function(data){
			if(data.result=='success'){
				update_amb_state({
					vid:$v('CURRENT_VERSION'),
					oid:s_oid,
					oname:s_oname
				});
				//apex.event.trigger( "#main-section", "apexrefresh" );
			}
		}
	}
	);
}