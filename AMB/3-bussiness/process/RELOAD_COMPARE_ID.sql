declare
v_normal_object VARCHAR2(100):=apex_application.g_x01;
v_compare_version VARCHAR2(100):=apex_application.g_x02;
v_ret varchar2(100);
v_object AMB_OBJECT%ROWTYPE;
v_output CLOB;
begin
	
AMB_UTIL.set_ajax_header('text/xml');
IF v_compare_version IS NULL THEN
  v_ret:='';
END IF;

IF v_normal_object IS NOT NULL THEN
    v_object:=AMB_BIZ_OBJECT.get_object(v_normal_object);
    FOR co in (select * from AMB_OBJECT WHERE VERSION_ID=v_compare_version AND NAME=v_object.NAME AND TYPE=v_object.TYPE )
    LOOP
        v_ret:=co.ID;
    END LOOP;
END IF;

	select XMLSerialize(DOCUMENT XMLElement("codes"
	,XMLForest(v_ret as "unchange")
	) AS CLOB) INTO v_output from dual;

	AMB_UTIL.print_clob(v_output);
	EXCEPTION WHEN OTHERS THEN
		v_output:='<fail>'||SQLERRM||'</fail>';
		AMB_UTIL.print_clob(v_output);
end;