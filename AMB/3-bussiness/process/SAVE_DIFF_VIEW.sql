declare
v_model varchar2(500):=apex_application.g_x01;
v_ids varchar2(500):=apex_application.g_x02;
v_code_change CLOB:=apex_application.g_x03;

v_object AMB_OBJECT%ROWTYPE;
v_change_id varchar2(100);
v_unchange_id varchar2(100);
v_output CLOB;
begin
	AMB_UTIL.set_ajax_header('text/json');
	IF UPPER(v_model) = AMB_CONSTANT.LOAD_MODEL THEN
		v_unchange_id:=v_ids;
		v_object:=AMB_BIZ_OBJECT.get_object(v_unchange_id);
		UPDATE AMB_BEIL_LIST
		SET CONTENT = v_code_change
		WHERE VERSION_ID = :CURRENT_VERSION
		AND NAME = v_object.NAME AND TYPE=v_object.TYPE;
		
		INSERT INTO AMB_BEIL_LIST(ID,VERSION_ID,NAME,TYPE,CONTENT,CREATE_DATE,CREATE_BY)
		SELECT
			AMB_UTIL_OBJECT.generate_guid,
			:CURRENT_VERSION,
			v_object.NAME,
			v_object.TYPE,
			v_code_change,
			CURRENT_TIMESTAMP,
			:APP_USER
		FROM DUAL
		WHERE NOT EXISTS(select * FROM AMB_BEIL_LIST WHERE VERSION_ID = :CURRENT_VERSION AND NAME = v_object.NAME AND TYPE=v_object.TYPE);
	END IF;
	
	IF UPPER(v_model) = AMB_CONSTANT.IMPORT_MODEL THEN
		v_change_id:= SUBSTR(v_ids,1,INSTR(v_ids,'@')-1); -- impotrt list object id
		UPDATE AMB_BEIL_LIST
		SET CONTENT = v_code_change
		WHERE ID =v_change_id;
		
	END IF;
	
	IF UPPER(v_model) = AMB_CONSTANT.BUILD_ALL_MODEL THEN
		v_change_id:= v_ids;
		UPDATE AMB_BEIL_LIST
		SET CONTENT = v_code_change
		WHERE ID =v_change_id;
	END IF;
	
	htp.prn('{"type":"SUCCESS"}');
	EXCEPTION WHEN OTHERS THEN
		htp.prn('{"type":"ERROR"}');
		AMB_LOGGER.ERROR('SAVE_DIFF_VIEW Error:' || SQLERRM);
	
end;