/**
 * Applications Manager project version utilities
 * @author:dailey.dai@oracle.com
 * @since: 1.0
 * @date: 2016/02/25
 */
create or replace package AMB_VERSION_UTIL
as

/**
 * genarate project version guid as key	
 */
function generate_guid return varchar2;

/**
 * generate the LOV query sql for project version environment
 */
function list_enviroment_query return varchar2;




end AMB_VERSION_UTIL;