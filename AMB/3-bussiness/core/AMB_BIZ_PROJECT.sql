create or replace package AMB_BIZ_PROJECT
/**
 * Applications Manager project core lib
 * @author:dailey.dai@oracle.com
 * @since: 1.0
 * @date: 2016/04/13
 */
as

--get active version count under given project
function count_active_version(f_project_id varchar2) return number;

function list_compare_version_query(f_project_id varchar2,f_model varchar2 default AMB_CONSTANT.NORMAL_MODEL,f_target_object varchar2 default NULL,f_exclude_version varchar2 default NULL) return VARCHAR2;
end;