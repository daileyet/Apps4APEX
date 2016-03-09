var s_action = $v('P1_OBJECT_ACTION');
var o_state = get_amb_state();
switch(s_action){
        
    case 'REFRESH_END_SUCCESS':
        window.amb.update_primary_editor($v('P1_OBJECT_CODE'));
        window.amb.handers[s_action].call(this,o_state);
        break;
    case 'SAVE_END_SUCCESS':
        
        break;
    case 'SAVE_END_FAILED':
        alert('Save error');
        break;
    case 'COMPILE_END_SUCCESS':
    	window.amb.handers[s_action].call(this,{
        	state: o_state
        	,addInPlace:'#main-section_heading'
        });
        break;
    case 'COMPILE_END_FAILED':
        window.amb.handers[s_action].call(this,{
        	state: o_state
        	,addInPlace:'#main-section_heading'
        });
        break;
        
	default:
		$('#object-loading-mark').hide();
}
if(s_action.indexOf('BEGIN')!=-1){
	$('#object-loading-mark').show();
}
if(s_action.indexOf('END')!=-1){
	$('#object-loading-mark').hide();
        
}
