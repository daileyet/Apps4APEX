declare
v_version varchar2(100):=apex_application.g_x01;
v_output CLOB;
begin

AMB_UTIL.set_ajax_header('text/xml');
v_output:='<?xml version="1.0"?><OPTIONS>';
for ops in (select * from table(AMB_UTIL_OPTIONS.get_version_options(v_version)))
loop
	v_output:=v_output||'<'||ops.OPS_CODE||'>';
	v_output:=v_output||ops.OPS_VALUE;
	v_output:=v_output||'</'||ops.OPS_CODE||'>';
end loop;
v_output:=v_output||'</OPTIONS>';

AMB_UTIL.print_clob(v_output);

end;