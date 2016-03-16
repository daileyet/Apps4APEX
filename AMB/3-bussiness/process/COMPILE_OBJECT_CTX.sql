declare
v_object_id varchar2(100):=apex_application.g_x01;
v_object_code CLOB:=apex_application.g_x02;
v_record AMB_OBJECT%ROWTYPE;
v_rst AMB_ERROR:=AMB_ERROR.EMPTY_ERROR;
v_action_status varchar2(100);
v_compile_error varchar2(4000);
v_compile_tag varchar2(4000);
v_output CLOB;
begin
IF NOT AMB_UTIL_OBJECT.is_validate(v_object_id,:CURRENT_VERSION) THEN
     raise_application_error( -20001, 'NOT VALID OBJECT ID.' );
END IF;

AMB_UTIL.set_ajax_header('text/xml');

:CURRENT_OBJECT:=v_object_id;

v_record.ID:=v_object_id;
v_record.CONTENT:=v_object_code;

AMB_BIZ_OBJECT.compile_object(v_record,v_rst);


v_action_status:='COMPILE_END_SUCCESS';
v_compile_tag:=AMB_CONSTANT.COMPILE_WITHOUT_ERROR;
IF NOT v_rst.IS_EMPTY THEN
 v_compile_error:=v_rst.GET_MESSAGE;
 v_action_status:='COMPILE_END_FAILED';
 v_compile_tag:=AMB_CONSTANT.COMPILE_WITH_ERROR;
END IF;
select XMLSerialize(DOCUMENT XMLElement("object"
,XMLForest(v_object_id as "id", v_compile_tag as "compile_tag",v_compile_error as "compile_error", v_action_status as "action_status")
) AS CLOB) INTO v_output from dual;


AMB_UTIL.print_clob(v_output);

end;