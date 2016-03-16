declare
v_object_id varchar2(100):=apex_application.g_x01;
v_object_code CLOB:=apex_application.g_x02;
v_record AMB_OBJECT%ROWTYPE;
v_rst AMB_ERROR:=AMB_ERROR.EMPTY_ERROR;
v_action_status varchar2(100);
v_output CLOB;
begin

IF NOT AMB_UTIL_OBJECT.is_validate(v_object_id,:CURRENT_VERSION) THEN
     raise_application_error( -20001, 'NOT VALID OBJECT ID.' );
END IF;

AMB_UTIL.set_ajax_header('text/xml');

:CURRENT_OBJECT:=v_object_id;

v_record.ID:=v_object_id;
v_record.UPDATE_BY:=:APP_USER;
v_record.CONTENT:=v_object_code;

AMB_BIZ_OBJECT.save_object_ctx(v_record,v_rst);


v_action_status:='SAVE_END_SUCCESS';
IF NOT v_rst.IS_EMPTY THEN
 v_action_status:='SAVE_END_FAILED';
END IF;




select XMLSerialize(DOCUMENT XMLElement("object"
,XMLForest(v_object_id as "id", v_action_status as "action_status")
) AS CLOB) INTO v_output from dual;


AMB_UTIL.print_clob(v_output);
end;