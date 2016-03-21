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

SHORT_PROJECT constant varchar(3):='P';
SHORT_VERSION constant varchar(3):='V';
SHORT_OBJECT constant varchar(3):='O';

COMPILE_WITHOUT_ERROR constant varchar2(10):='SUCCESS';
COMPILE_WITH_ERROR constant varchar2(10):='FAILED';

YES_TRUE constant varchar2(3):='Y';
NO_FALSE constant varchar2(3):='N';

IS_BASE_VERSION constant varchar2(3):=YES_TRUE;
NOT_BASE_VERSION constant varchar2(3):=NO_FALSE;

IS_ACTIVE_VERSION constant varchar2(3):=YES_TRUE;
NOT_ACTIVE_VERSION constant varchar2(3):=NO_FALSE;

FULL_CP_INIT_MODE constant varchar2(10):='FULL_COPY';
QUICK_REF_INIT_MODE constant varchar2(10):='QUICK_REF';

OPS_STYLE_SHARED constant varchar2(10):='SHARED';
OPS_STYLE_PRIVATE constant varchar2(10):='PRIVATE';

OPS_CODE_IN_BUILD_ALL constant varchar2(50):='IN_BUILD_ALL_LIST';
OPS_CODE_IN_EXPORT constant varchar2(50):='IN_EXPORT_LIST';

BUILD_ALL_MODEL constant varchar2(10):='BUILD';
EXPORT_MODEL constant varchar2(10):='EXPORT';

end AMB_CONSTANT;