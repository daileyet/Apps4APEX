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

end AMB_UTIL;
