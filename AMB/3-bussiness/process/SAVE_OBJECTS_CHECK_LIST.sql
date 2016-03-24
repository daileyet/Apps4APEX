declare
v_object_id varchar2(100):=apex_application.g_x01;
v_need_include varchar2(100):=apex_application.g_x02;
v_model varchar2(100):=apex_application.g_x03;
begin

AMB_UTIL.set_ajax_header();
IF v_model = AMB_CONSTANT.BUILD_ALL_MODEL THEN
	UPDATE AMB_BEI_LIST
	SET NEED_BUILD = v_need_include
	WHERE ID = v_object_id;
ELSIF v_model = AMB_CONSTANT.EXPORT_MODEL THEN
	UPDATE AMB_BEI_LIST
	SET NEED_EXPORT = v_need_include
	WHERE ID = v_object_id;
ELSIF v_model = AMB_CONSTANT.IMPORT_MODEL THEN
	UPDATE AMB_BEI_LIST
	SET NEED_IMPORT = v_need_include
	WHERE ID = v_object_id;
ELSE
	NULL;
END IF;
htp.prn('{"type":"SUCCESS"}');
EXCEPTION WHEN OTHERS THEN
    htp.prn('{"type":"ERROR"}');
end;