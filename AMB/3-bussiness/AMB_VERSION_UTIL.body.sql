create or replace package body AMB_VERSION_UTIL
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
	;
end;

end AMB_VERSION_UTIL;