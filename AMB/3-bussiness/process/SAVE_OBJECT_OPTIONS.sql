declare
v_output CLOB;
v_record AMB_OPS_OBJECT%ROWTYPE;
v_error AMB_ERROR:=AMB_ERROR.EMPTY_ERROR;
v_ops_code varchar2(100):=apex_application.g_x01;
v_ops_value varchar2(100):=apex_application.g_x02;
v_column_name varchar2(100):=apex_application.g_x03;
begin

AMB_UTIL.set_ajax_header();
v_record.OBJECT_ID:=:CURRENT_OBJECT;
v_record.OPS_CODE:=v_ops_code;
v_record.OPS_VALUE:=v_ops_value;
v_record.OPS_STYLE:=AMB_CONSTANT.OPS_STYLE_SHARED;
AMB_UTIL_OPTIONS.save_object_option(v_record,v_error);

htp.prn('{"type":"SUCCESS"}');
IF NOT v_error.IS_EMPTY THEN
	htp.prn('{"type":"ERROR"}');
END IF;
EXCEPTION WHEN OTHERS THEN
    htp.prn('{"type":"ERROR"}');
end;