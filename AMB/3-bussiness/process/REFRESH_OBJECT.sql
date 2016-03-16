declare
v_object_id varchar2(100):=apex_application.g_x01;
v_refresh_object AMB_OBJECT%ROWTYPE;
v_output CLOB;
--v_object_info_url varchar2(4000):='';
begin

IF NOT AMB_UTIL_OBJECT.is_validate(v_object_id,:CURRENT_VERSION) THEN
     raise_application_error( -20001, 'NOT VALID OBJECT ID.' );
END IF;

AMB_UTIL.set_ajax_header('text/xml');

:CURRENT_OBJECT:=v_object_id;
v_refresh_object:=AMB_BIZ_OBJECT.get_object(v_object_id);
IF v_refresh_object.CONTENT IS NULL THEN
v_refresh_object.CONTENT:=AMB_BIZ_OBJECT.get_object_ctx(v_object_id);
END IF;

--v_object_info_url:=APEX_UTIL.PREPARE_URL ('f?p='||:APP_ID || ':2::' || :APP_SESSION || '::::P2_ID:'||:CURRENT_OBJECT );

select XMLSerialize(DOCUMENT XMLElement("object"
,XMLForest(
v_object_id as "id", 
v_refresh_object.NAME as "name",
v_refresh_object.CONTENT as "code", 
v_refresh_object.COMPILED as "compile_tag", 
'REFRESH_END_SUCCESS' as "action_status"
--,v_object_info_url as "url_info"
)
) AS CLOB) INTO v_output from dual;


AMB_UTIL.print_clob(v_output);
end;