create or replace package body AMB_UTIL
as

function generate_guid return varchar2
as

begin
	return SYS_GUID();
end generate_guid;

end AMB_UTIL;