create or replace procedure AMB_DATA_INIT
/**
 * Applications Manager build-in data initialize
 * @author:dailey.dai@oracle.com
 * @since: 1.0
 * @date: 2016/04/18
 */
as
begin
	INSERT INTO AMB_OPS_DEFINITION(OPS_CODE,OPS_NAME,OPS_TYPE,OPS_TRAGET,OPS_DEFAULT,OPS_DESC)
	SELECT 'AUTO_SAVE','Auto Save','boolean','V:P','true','Code editor will auto save changes in the given time.'
	FROM DUAL
	WHERE NOT exists (SELECT * FROM AMB_OPS_DEFINITION WHERE OPS_NAME='AUTO_SAVE');
	
	INSERT INTO AMB_OPS_DEFINITION(OPS_CODE,OPS_NAME,OPS_TYPE,OPS_TRAGET,OPS_DEFAULT,OPS_DESC)
	SELECT 'AUTO_SAVE_INTERVAL','Auto Save Interval','number','V:P','30','After the given time,Code editor will auto save any changes.'
	FROM DUAL
	WHERE NOT exists (SELECT * FROM AMB_OPS_DEFINITION WHERE OPS_NAME='AUTO_SAVE_INTERVAL');
	
	INSERT INTO AMB_OPS_DEFINITION(OPS_CODE,OPS_NAME,OPS_TYPE,OPS_TRAGET,OPS_DEFAULT,OPS_DESC)
	SELECT 'BUILD_WITHOUT_COMMENTS','Build without comments','boolean','O:P:V','true','Remove all the comments when compile to database.'
	FROM DUAL
	WHERE NOT exists (SELECT * FROM AMB_OPS_DEFINITION WHERE OPS_NAME='BUILD_WITHOUT_COMMENTS');
	
	INSERT INTO AMB_OPS_DEFINITION(OPS_CODE,OPS_NAME,OPS_TYPE,OPS_TRAGET,OPS_DEFAULT,OPS_DESC)
	SELECT 'IN_EXPORT_LIST','Include in export list','boolean','O:P:V','true','Include in or out to export list when do export.'
	FROM DUAL
	WHERE NOT exists (SELECT * FROM AMB_OPS_DEFINITION WHERE OPS_NAME='IN_EXPORT_LIST');
	
	INSERT INTO AMB_OPS_DEFINITION(OPS_CODE,OPS_NAME,OPS_TYPE,OPS_TRAGET,OPS_DEFAULT,OPS_DESC)
	SELECT 'IN_BUILD_ALL_LIST','Include in build all list','boolean','O:P:V','true','Include in or out to build all list when do compile all objects.'
	FROM DUAL
	WHERE NOT exists (SELECT * FROM AMB_OPS_DEFINITION WHERE OPS_NAME='IN_BUILD_ALL_LIST');
	
	
end;