/**
 * Applications Manager common utilities
 * @author:dailey.dai@oracle.com
 * @since: 1.0
 * @date: 2015/02/25
 */
create or replace package AMB_UTIL
as

/**
 * genarate guid by oracle guid function	
 */
function generate_guid return varchar2;

end AMB_UTIL;
