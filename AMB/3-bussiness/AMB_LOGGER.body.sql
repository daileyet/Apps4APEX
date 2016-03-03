create or replace PACKAGE BODY  "AMB_LOGGER" AS  
   --private, use bits to store state of log target  
   function is_target_open(p_le in integer) return boolean  
   as  
       bit_op varchar2(1) := '';  
   begin  
     
       select substr(log_targets,p_le,1 ) into bit_op FROM DUAL;  
       bit_op := upper(bit_op);  
       if bit_op = 'Y' or bit_op='1' then  
           return true;  
       end if;  
       return false;  
   end;  
  
   procedure log(p_log_type in varchar2, p_log_desc in varchar2,p_log_point in varchar2 DEFAULT NULL)  
   as  
     
   begin  
        insert into SS_LOGS(LOG_TYPE,LOG_TIME,LOG_DESC,LOG_POINT)   
        values(  
        p_log_type,  
        CURRENT_TIMESTAMP,  
        p_log_desc,  
        p_log_point  
        );  
   end log;  
     
   procedure trace(p_log_type in varchar2, msg in varchar2)  
   as  
       v_p clob;  
       v_length PLS_INTEGER := length(msg);  
       v_length_per_line PLS_INTEGER := 4000;  
       v_lines PLS_INTEGER := v_length / v_length_per_line;  
         
       v_start PLS_INTEGER := 1;  
   begin  
       if is_target_open(T_DBMS_OUTPUT)  then  
           dbms_output.put_line(to_char(sysdate, 'YYYY-MM-DD HH24:MI:SS ')||'['||p_log_type||'] - '||msg);  
       end if;  
  
       if is_target_open(T_HTP_P)  then  
           htp.p(to_char(sysdate, 'YYYY-MM-DD HH24:MI:SS ')||'['||p_log_type||'] - '||msg);  
       end if;  
  
       if is_target_open(T_TABLE_ROW)  then  
           insert into SS_LOGS(LOG_TYPE,LOG_TIME,LOG_DESC,LOG_POINT)   
            values(  
            p_log_type,  
            CURRENT_TIMESTAMP,  
            msg,  
            null  
            );  
       end if;  
   end;  
     
   procedure debug(msg in varchar2)   
   as  
   begin  
       if log_level > L_DEBUG then  
           return ;  
       end if;  
       trace('DEBUG', msg);  
   end;  
     
   procedure info(msg in varchar2)   
   as  
   begin  
       if log_level > L_INFO then  
           return ;  
       end if;  
         
       trace('INFO', msg);  
   end;  
     
     
   procedure warn(msg in varchar2)   
   as  
   begin  
       if log_level > L_WARN then  
           return ;  
       end if;  
         
       trace('WARN', msg);  
   end;  
     
   procedure error(msg in varchar2)   
   as  
   begin  
       if log_level > L_ERROR then  
           return ;  
       end if;  
         
       trace('ERROR', msg);  
   end;  
     
   procedure fatal(msg in varchar2)   
   as  
   begin  
       if log_level > L_FATAL then  
           return ;  
       end if;  
         
       trace('FATAL', msg);  
   end;  
     
END AMB_LOGGER;  
