declare
v_unchange_id varchar2(100):=apex_application.g_x01;
v_compare_version varchar2(100):=apex_application.g_x02;

v_unchange_name_type varchar2(500):=apex_application.g_x01;
v_code_unchange CLOB;

v_object AMB_OBJECT%ROWTYPE;
v_output CLOB;
begin
	AMB_UTIL.set_ajax_header('text/xml');
	IF v_compare_version = AMB_CONSTANT.BUILD_IN_VERSION THEN
		v_object.NAME := SUBSTR(v_unchange_name_type,1,INSTR(v_unchange_name_type,'@')-1);
		v_object.TYPE := SUBSTR(v_unchange_name_type,INSTR(v_unchange_name_type,'@')+1);
		v_code_unchange:= AMB_UTIL_CODE.get_ddl(v_object.TYPE,v_object.NAME);
		AMB_UTIL_CODE.make_pure_ddl(v_code_unchange);
	ELSE
		v_code_unchange:=AMB_BIZ_OBJECT.get_object_ctx(v_unchange_id);
	END IF;
	
	select XMLSerialize(DOCUMENT XMLElement("codes"
	,XMLForest(v_code_unchange as "unchange")
	) AS CLOB) INTO v_output from dual;
		
	AMB_UTIL.print_clob(v_output);
	EXCEPTION WHEN OTHERS THEN
		v_output:='<fail>'||SQLERRM||'</fail>';
		AMB_UTIL.print_clob(v_output);
	
end;