create or replace package AMB_BIZ_VERSION
/**
 * Applications Manager version core lib
 * @author:dailey.dai@oracle.com
 * @since: 1.0
 * @date: 2016/03/14
 */
as
/**
 * initialize new version objects from base version
 */
procedure init_version(p_new_version varchar2,p_base_version varchar2,p_mode varchar2,p_error in out AMB_ERROR);

/**
 * get stored in AMB_VERSION version record
 */
function get_version(f_version_id varchar2) RETURN AMB_VERSION%ROWTYPE;

/**
 * initial object build & export list(AMB_BUILD_EXPORT_LIST) records
 */
procedure initial_object_list(p_version_id varchar2,p_error in out AMB_ERROR);

function get_export_content(f_version_id varchar2,f_style varchar2 default AMB_CONSTANT.EXPORT_XML_STYLE) return CLOB;

end;