/**
 * Applications Manager project utilities
 * @author:dailey.dai@oracle.com
 * @since: 1.0
 * @date: 2015/02/25
 */
create or replace package AMB_PROJECT_UTIL
as

/**
 * genarate project guid as key	
 */
function generate_guid return varchar2;

end AMB_PROJECT_UTIL;