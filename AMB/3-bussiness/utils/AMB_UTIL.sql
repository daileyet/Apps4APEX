/**
 * Applications Manager common utilities
 * @author:dailey.dai@oracle.com
 * @since: 1.0
 * @date: 2016/02/25
 */
create or replace package AMB_UTIL
as

/**
 * genarate guid by oracle guid function	
 */
function generate_guid return varchar2;


procedure print_clob(p_clob CLOB);

/**
 * when start a aemand process by requested by ajax, response header setting.
 */
procedure set_ajax_header(p_response_type varchar2 default 'text/json');

end AMB_UTIL;
