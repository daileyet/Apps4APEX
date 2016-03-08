create or replace TYPE BODY AMB_ERROR
AS
  CONSTRUCTOR FUNCTION AMB_ERROR(f_msg varchar2) RETURN SELF AS RESULT
  AS
  BEGIN
    SELF.error_message:=f_msg;
    RETURN;
  END;
  
  STATIC FUNCTION EMPTY_ERROR return AMB_ERROR
  AS
    v_amb_error AMB_ERROR;
  BEGIN
    v_amb_error := NEW AMB_ERROR(f_msg=>NULL);
    RETURN v_amb_error;
  END;
  
  MEMBER FUNCTION IS_EMPTY return BOOLEAN
  AS
  BEGIN
    IF SELF.error_message IS NULL THEN
      RETURN TRUE;
    END IF;
    RETURN FALSE;
  END;
  
  MEMBER FUNCTION GET_MESSAGE return varchar2
  AS  
  BEGIN
    RETURN SELF.error_message;
  END;
  

  
END;