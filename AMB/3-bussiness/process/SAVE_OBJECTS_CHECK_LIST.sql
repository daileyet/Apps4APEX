declare
v_object_id varchar2(100):=apex_application.g_x01;
v_need_include varchar2(100):=apex_application.g_x02;
v_model varchar2(100):=apex_application.g_x03;

v_object_name_type varchar2(500):=apex_application.g_x01;
v_object_name varchar2(250);
v_object_type varchar2(250);
begin

AMB_UTIL.set_ajax_header();
IF v_model = AMB_CONSTANT.BUILD_ALL_MODEL THEN
	UPDATE AMB_BEIL_LIST
	SET NEED_BUILD = v_need_include
	WHERE ID = v_object_id;
ELSIF v_model = AMB_CONSTANT.EXPORT_MODEL THEN
	UPDATE AMB_BEIL_LIST
	SET NEED_EXPORT = v_need_include
	WHERE ID = v_object_id;
ELSIF v_model = AMB_CONSTANT.IMPORT_MODEL THEN
	UPDATE AMB_BEIL_LIST
	SET NEED_IMPORT = v_need_include
	WHERE ID = v_object_id;
ELSIF v_model = AMB_CONSTANT.LOAD_MODEL THEN
	v_object_name:=REGEXP_REPLACE(v_object_name_type,'@.*','');
	v_object_type:=REGEXP_REPLACE(v_object_name_type,'.*@','');
	IF v_need_include = AMB_CONSTANT.NO_FALSE THEN
		DELETE FROM AMB_BEIL_LIST
		WHERE VERSION_ID = :CURRENT_VERSION
		AND NAME = v_object_name AND TYPE=v_object_type;
	END IF;
	IF v_need_include = AMB_CONSTANT.YES_TRUE AND v_object_name IS NOT NULL THEN
		UPDATE AMB_BEIL_LIST
		SET NEED_LOAD = v_need_include
		WHERE VERSION_ID = :CURRENT_VERSION AND NAME = v_object_name AND TYPE=v_object_type;
		
		INSERT INTO AMB_BEIL_LIST(ID,VERSION_ID,NAME,TYPE,CREATE_DATE,CREATE_BY,NEED_LOAD)
		SELECT
			AMB_UTIL_OBJECT.generate_guid,
			:CURRENT_VERSION,
			v_object_name,
			v_object_type,
			CURRENT_TIMESTAMP,
			:APP_USER,
			v_need_include
		FROM DUAL
		WHERE NOT EXISTS(select * FROM AMB_BEIL_LIST WHERE VERSION_ID = :CURRENT_VERSION AND NAME = v_object_name AND TYPE=v_object_type);
		
	END IF;
ELSE
	NULL;
END IF;
htp.prn('{"type":"SUCCESS"}');
EXCEPTION WHEN OTHERS THEN
    htp.prn('{"type":"ERROR"}');
end;