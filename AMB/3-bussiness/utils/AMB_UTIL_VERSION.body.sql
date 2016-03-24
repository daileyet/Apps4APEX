create or replace package body AMB_UTIL_VERSION
as

/**
 * genarate project version guid as key	
 */
function generate_guid return varchar2
as

begin
	return AMB_CONSTANT.PREFIX_VERSION||AMB_UTIL.generate_guid;
end;

function list_enviroment_query return varchar2
as

begin
	return '' ||
	'select ''Dev'' as d ,	''DEV'' as r from dual '||
	' union '||
	'select ''Prod'' as d ,	''PROD'' as r from dual '
	||
	' union '||
	'select ''Test'' as d ,	''TEST'' as r from dual '
	;
end;

function is_base(f_version_id varchar2) return boolean
as
	v_cnt NUMBER:=0;
begin
	SELECT COUNT(*) INTO v_cnt from AMB_VERSION 
	WHERE ID=f_version_id AND IS_BASE = AMB_CONSTANT.IS_BASE_VERSION
	;
	RETURN v_cnt>0;
end;

function list_initialize_mode_query return varchar2
as
begin
	return 'select ''Quick Reference'' as dis, '''||AMB_CONSTANT.QUICK_REF_INIT_MODE ||''' as val from dual '
	||' union '
	|| 'select ''Full Copy'' as dis, '''||AMB_CONSTANT.FULL_CP_INIT_MODE||''' as val from dual '
	
	;
end;

function list_base_version_query(f_project_id varchar2) return varchar2
as
begin
   return 'SELECT ENVIRONMENT ||'' ''||EDITION as dis,ID as val from AMB_VERSION where PROJECT_ID='''||f_project_id||''' AND IS_BASE='''||AMB_CONSTANT.IS_BASE_VERSION||''' AND ACTIVE ='''||AMB_CONSTANT.IS_ACTIVE_VERSION ||''' ';
end;

end AMB_UTIL_VERSION;