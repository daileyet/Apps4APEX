declare
v_pattern varchar2(100):=:P12_PATTERN;
v_code CLOB;
v_object_name varchar2(100):=:P12_OBJECT_NAME;
v_object_type varchar2(100):=:P12_OBJECT_TYPE;
v_object_id varchar2(100);
begin
	
	IF v_pattern = 'LOAD_VIEWER' THEN
		v_code:= AMB_UTIL_CODE.get_ddl(replace(v_object_type,' BODY',''),v_object_name);
	
	ELSE
		SELECT ID INTO v_object_id from AMB_OBJECT WHERE VERSION_ID=:CURRENT_VERSION AND NAME = v_object_name AND TYPE= v_object_type;
		v_code:=AMB_BIZ_OBJECT.get_object_ctx(v_object_id);
	END IF;
	
	RETURN v_code;

end;