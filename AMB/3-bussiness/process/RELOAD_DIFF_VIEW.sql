declare
v_model varchar2(500):=apex_application.g_x01;
v_ids varchar2(500):=apex_application.g_x02;
v_code_change CLOB;
v_code_unchange CLOB;

v_object AMB_OBJECT%ROWTYPE;
v_change_id varchar2(100);
v_unchange_id varchar2(100);
v_output CLOB;
begin
	AMB_UTIL.set_ajax_header('text/xml');
	IF UPPER(v_model) = AMB_CONSTANT.LOAD_MODEL THEN
		v_unchange_id:=v_ids;
		v_code_unchange:=AMB_BIZ_OBJECT.get_object_ctx(v_unchange_id);
		v_object:=AMB_BIZ_OBJECT.get_object(v_unchange_id);
		
		FOR lv in (SELECT CONTENT FROM AMB_BEIL_LIST WHERE VERSION_ID=:CURRENT_VERSION AND NAME =v_object.NAME AND TYPE =v_object.TYPE )
		LOOP
			v_code_change:=lv.CONTENT;
		END LOOP;
		IF v_code_change IS NULL THEN
			v_code_change:= AMB_UTIL_CODE.get_ddl(v_object.TYPE,v_object.NAME);
			AMB_UTIL_CODE.make_pure_ddl(v_code_change);
		END IF;
	END IF;
	
	IF UPPER(v_model) = AMB_CONSTANT.IMPORT_MODEL THEN
		v_change_id:= SUBSTR(v_ids,1,INSTR(v_ids,'@')-1); -- impotrt list object id
		v_unchange_id:= SUBSTR(v_ids,INSTR(v_ids,'@')+1); -- alread exits object id
		select CONTENT INTO  v_code_change from AMB_BEIL_LIST WHERE ID = v_change_id;
		v_code_unchange:=AMB_BIZ_OBJECT.get_object_ctx(v_unchange_id);
	END IF;
	
	IF UPPER(v_model) = AMB_CONSTANT.BUILD_ALL_MODEL THEN
		v_change_id:= v_ids;
		select CONTENT INTO  v_code_change from AMB_BEIL_LIST WHERE ID = v_change_id;
		v_object:=AMB_BIZ_OBJECT.get_object(v_change_id);
		v_code_unchange:= AMB_UTIL_CODE.get_ddl(v_object.TYPE,v_object.NAME);
		AMB_UTIL_CODE.make_pure_ddl(v_code_unchange);
	END IF;
	
	
	select XMLSerialize(DOCUMENT XMLElement("codes"
	,XMLForest(v_code_change as "change", v_code_unchange as "unchange")
	) AS CLOB) INTO v_output from dual;
		
	AMB_UTIL.print_clob(v_output);
	EXCEPTION WHEN OTHERS THEN
		v_output:='<fail>'||SQLERRM||'</fail>';
		AMB_UTIL.print_clob(v_output);
	
end;