create or replace package body AMB_BIZ_OBJECT
as

procedure new_object(p_record AMB_OBJECT%ROWTYPE,p_error in out AMB_ERROR)
as
v_obj_id varchar2(500);
begin
	v_obj_id:=AMB_UTIL_OBJECT.generate_guid;
	INSERT INTO AMB_OBJECT(ID,VERSION_ID,NAME,TYPE,CREATE_DATE,CREATE_BY,DESCRIPTION)
	VALUES(v_obj_id,p_record.VERSION_ID,p_record.NAME,p_record.TYPE,CURRENT_TIMESTAMP,p_record.CREATE_BY,p_record.DESCRIPTION);
	
	EXCEPTION WHEN OTHERS THEN
		p_error.error_message := 'New Object Error:' || SQLERRM;
		AMB_LOGGER.ERROR(p_error.error_message);
end;


procedure save_object_ctx(p_record AMB_OBJECT%ROWTYPE,p_error in out AMB_ERROR)
as

begin
	UPDATE AMB_OBJECT
	SET
	CONTENT= p_record.CONTENT,
	UPDATE_DATE = CURRENT_TIMESTAMP,
	UPDATE_BY = p_record.UPDATE_BY
	
	WHERE ID=p_record.ID;
	
	EXCEPTION WHEN OTHERS THEN
		p_error.error_message := 'Save Object Content Error:' || SQLERRM;
		AMB_LOGGER.ERROR(p_error.error_message);
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

function get_object(f_object_id varchar2) RETURN AMB_OBJECT%ROWTYPE
as
v_object AMB_OBJECT%ROWTYPE;
begin
	IF f_object_id IS NOT NULL THEN
		select * into v_object from AMB_OBJECT WHERE ID = f_object_id;
	END IF;
	return v_object;
end;

procedure compile_object(p_record AMB_OBJECT%ROWTYPE,p_error in out AMB_ERROR)
as
	v_object_ctx CLOB:=p_record.CONTENT;
	v_obj_errors AMB_TYPES.OBJECT_ERRORS;
begin
	
	BEGIN
		IF v_object_ctx IS NULL THEN
			v_object_ctx:=get_object_ctx(p_record.ID);
		END IF;
		AMB_UTIL_CODE.execute_ddl(v_object_ctx);
		UPDATE AMB_OBJECT
				SET COMPILED = AMB_CONSTANT.COMPILE_WITHOUT_ERROR
				WHERE ID = p_record.ID;
		EXCEPTION 
			WHEN OTHERS THEN
				p_error.error_message := 'Compile Object Error:' || SQLERRM;
				UPDATE AMB_OBJECT
				SET COMPILED = AMB_CONSTANT.COMPILE_WITH_ERROR
				WHERE ID = p_record.ID;
				AMB_LOGGER.ERROR(p_error.error_message);
				v_obj_errors:=AMB_UTIL_OBJECT.get_compile_error(p_record.ID);
				p_error.error_message := AMB_UTIL_OBJECT.format_compile_error(v_obj_errors);
	END;
	
end;

end;