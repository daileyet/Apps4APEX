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

end;