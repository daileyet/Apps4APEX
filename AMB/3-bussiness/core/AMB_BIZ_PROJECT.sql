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


end;