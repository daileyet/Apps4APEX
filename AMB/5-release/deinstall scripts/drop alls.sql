REM Drop packages procedures types
drop procedure AMB_DATA_INIT;
drop type AMB_ERROR;
drop package AMB_BIZ_OBJECT;
drop package AMB_BIZ_VERSION;
drop package AMB_BIZ_PROJECT;
drop package AMB_UTIL_OBJECT;
drop package AMB_UTIL_VERSION;
drop package AMB_UTIL_PROJECT;
drop package AMB_UTIL;
drop package AMB_UTIL_OPTIONS;
drop package AMB_UTIL_CODE;
drop package AMB_CONSTANT;
drop package AMB_TYPES;
drop package AMB_LOGGER;

REM Drop tables
drop table AMB_BEIL_LIST cascade constraints;
drop table AMB_OBJECT_INTERIM cascade constraints;
drop table AMB_OBJECT cascade constraints;
drop table AMB_VERSION cascade constraints;
drop table AMB_PROJECT cascade constraints;
drop table AMB_LOGS cascade constraints;
drop table AMB_OPS_OBJECT cascade constraints;
drop table AMB_OPS_VERSION cascade constraints;
drop table AMB_OPS_PROJECT cascade constraints;
drop table AMB_OPS_DEFINITION cascade constraints;
drop view AMB_OBJ_LIST_VW;
drop view AMB_PROJ_VERSION_VW;
drop view AMB_EXPORT_VW;
drop view AMB_IMPORT_VW;
drop view AMB_BUILD_VW;
drop view AMB_LOAD_VW;
drop view AMB_OBJECT_TYPE;