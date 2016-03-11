create or replace package AMB_BIZ_OBJECT
/**
 * Applications Manager object core lib
 * @author:dailey.dai@oracle.com
 * @since: 1.0
 * @date: 2016/03/03
 */
as

/**
 * create a new object entry
 */
procedure new_object(p_record in out AMB_OBJECT%ROWTYPE,p_error in out AMB_ERROR);

/**
 * save a object ctx, mostly just save object content
 */
procedure save_object_ctx(p_record AMB_OBJECT%ROWTYPE,p_error in out AMB_ERROR);

/**
 * get object code content and consider the reference field
 */
function get_object_ctx(f_object_id varchar2) return CLOB;

/**
 * get stored in AMB_OBJECT object record
 */
function get_object(f_object_id varchar2) RETURN AMB_OBJECT%ROWTYPE;

/**
 * compile a object
 */
procedure compile_object(p_record AMB_OBJECT%ROWTYPE,p_error in out AMB_ERROR);



end AMB_BIZ_OBJECT;