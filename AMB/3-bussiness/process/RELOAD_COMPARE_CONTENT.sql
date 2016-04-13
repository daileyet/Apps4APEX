declare
v_unchange_id varchar2(100):=apex_application.g_x01;
v_code_unchange CLOB;
v_output CLOB;
begin
	AMB_UTIL.set_ajax_header('text/xml');
	v_code_unchange:=AMB_BIZ_OBJECT.get_object_ctx(v_unchange_id);
	
	select XMLSerialize(DOCUMENT XMLElement("codes"
	,XMLForest(v_code_unchange as "unchange")
	) AS CLOB) INTO v_output from dual;
		
	AMB_UTIL.print_clob(v_output);
	EXCEPTION WHEN OTHERS THEN
		v_output:='<fail>'||SQLERRM||'</fail>';
		AMB_UTIL.print_clob(v_output);
	
end;