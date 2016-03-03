create or replace package body AMB_BIZ_OBJECT
as

procedure new_object(p_record AMB_OBJECT%ROWTYPE,p_result in out boolean)
as
v_obj_id varchar2(500);
begin
	v_obj_id:=AMB_UTIL_OBJECT.generate_guid;
	INSERT INTO AMB_OBJECT(ID,VERSION_ID,NAME,TYPE,CREATE_DATE,CREATE_BY,DESCRIPTION)
	VALUES(v_obj_id,p_record.VERSION_ID,p_record.NAME,p_record.TYPE,CURRENT_TIMESTAMP,p_record.CREATE_BY,p_record.DESCRIPTION);
	
	EXCEPTION WHEN OTHERS THEN
		p_result:=FALSE;
		AMB_LOGGER.ERROR('New Object Error.');
end;


procedure save_object_ctx(p_record AMB_OBJECT%ROWTYPE,p_result in out boolean)
as

begin
	UPDATE AMB_OBJECT
	SET
	CONTENT= p_record.CONTENT,
	UPDATE_DATE = CURRENT_TIMESTAMP,
	UPDATE_BY = p_record.UPDATE_BY
	
	WHERE ID=p_record.ID;
	
	EXCEPTION WHEN OTHERS THEN
		p_result:=FALSE;
		AMB_LOGGER.ERROR('Save Object Content Error.');
end;

function get_object_ctx(f_object_id varchar2) return CLOB
AS
	v_ctx CLOB:=NULL;
	v_refer_id varchar2(100):=NULL;
BEGIN
	IF f_object_id IS NULL OR NOT AMB_UTIL_OBJECT.is_validate(f_object_id) THEN
		return v_ctx;
	END IF;
	SELECT CONTENT,REFERENCE INTO v_ctx,v_refer_id FROM AMB_OBJECT WHERE ID=f_object_id;
	
	IF v_ctx IS NULL AND v_refer_id IS NOT NULL THEN
		v_ctx:= get_object_ctx(v_refer_id);
	END IF;
	
	return v_ctx;
END;

end;