create or replace package body AMB_BIZ_PROJECT
as

--get active version count under given project
function count_active_version(f_project_id varchar2) return number
AS
v_count number:=0;
begin
	SELECT COUNT(*) INTO v_count FROM AMB_VERSION WHERE PROJECT_ID = f_project_id AND ACTIVE=AMB_CONSTANT.IS_ACTIVE_VERSION;
	RETURN v_count;
end;

function list_compare_version_query(f_project_id varchar2,f_model varchar2 default AMB_CONSTANT.NORMAL_MODEL,f_target_object varchar2 default NULL,f_exclude_version varchar2 default NULL) return VARCHAR2
as
	v_query VARCHAR2(4000);
	v_object AMB_OBJECT%ROWTYPE;
begin
	v_query:='select AMB_VERSION.ENVIRONMENT ||'' ''||AMB_VERSION.EDITION as dis,AMB_VERSION.ID as ret from AMB_VERSION AMB_VERSION '
	||' where AMB_VERSION.PROJECT_ID ='''||f_project_id||'''  AND　AMB_VERSION.ACTIVE= '''||AMB_CONSTANT.IS_ACTIVE_VERSION||''' ';
	
	IF f_exclude_version IS NOT NULL THEN
		v_query:=v_query|| ' AND AMB_VERSION.ID <> '''||f_exclude_version||''' ';
	END IF;
	
	IF f_model = AMB_CONSTANT.NORMAL_MODEL AND f_target_object IS NOT NULL THEN
		v_object:=AMB_BIZ_OBJECT.get_object(f_target_object);
		v_query:=v_query||' AND EXISTS (SELECT * FROM AMB_OBJECT WHERE AMB_VERSION.ID=AMB_OBJECT.VERSION_ID AND NAME='''||v_object.NAME||''' AND TYPE= '''||v_object.TYPE||''' )';
		
		v_query:=v_query|| ' UNION SELECT ''Build in Schema'','''||AMB_CONSTANT.BUILD_IN_VERSION ||''' FROM DUAL '
		|| ' WHERE EXISTS (  select * from user_objects uo WHERE uo.OBJECT_NAME = '''||v_object.NAME||''' AND uo.OBJECT_TYPE = '''||v_object.TYPE||''' )' ;
	END IF;
	
	RETURN v_query;
end;

end;