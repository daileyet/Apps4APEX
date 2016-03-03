create or replace package body AMB_UTIL_PROJECT
as

/**
 * genarate project guid as key	
 */
function generate_guid return varchar2
as

begin
	return AMB_CONSTANT.PREFIX_PROJECT||AMB_UTIL.generate_guid;
end;

end AMB_UTIL_PROJECT;