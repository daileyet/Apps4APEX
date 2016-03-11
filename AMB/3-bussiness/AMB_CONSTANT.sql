create or replace package AMB_CONSTANT
/**
 * Applications Manager constant defintions
 * @author:dailey.dai@oracle.com
 * @since: 1.0
 * @date: 2016/02/25
 */
as
/**
 * project, version , object key prefix
 */
PREFIX_PROJECT constant varchar(3):='P-';
PREFIX_VERSION constant varchar(3):='V-';
PREFIX_OBJECT constant varchar(3):='O-';

COMPILE_WITHOUT_ERROR constant varchar2(10):='SUCCESS';
COMPILE_WITH_ERROR constant varchar2(10):='FAILED';

IS_BASE_VERSION constant varchar2(3):='Y';
NOT_BASE_VERSION constant varchar2(3):='N';

end AMB_CONSTANT;