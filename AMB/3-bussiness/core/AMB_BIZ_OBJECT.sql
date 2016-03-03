/**
 * Applications Manager object core lib
 * @author:dailey.dai@oracle.com
 * @since: 1.0
 * @date: 2016/03/03
 */
create or replace package AMB_BIZ_OBJECT
as

/**
 * create a new object entry
 */
procedure new_object(p_record AMB_OBJECT%ROWTYPE,p_result in out boolean);

/**
 * save a object ctx, mostly just save object content
 */
procedure save_object_ctx(p_record AMB_OBJECT%ROWTYPE,p_result in out boolean);

function get_object_ctx(f_object_id varchar2) return CLOB;

end AMB_BIZ_OBJECT;