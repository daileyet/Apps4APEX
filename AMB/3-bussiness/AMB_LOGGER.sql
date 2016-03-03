create or replace PACKAGE  "AMB_LOGGER" AS  
--@author: dailey.dai@oracle.com  
--@desc:   self service app logger  
--@since:   2014/12/4  
     
   L_DEBUG constant integer  := 1;  
   L_INFO constant integer  := 2;  
   L_WARN constant integer  := 3;  
   L_ERROR constant integer  := 4;  
   L_FATAL constant integer  := 5;  
     
   log_level integer := L_DEBUG;--set to info now  
     
   /*  
    log targets, indicator char index in log_targets  
   */  
     
   T_DBMS_OUTPUT constant integer := 1;  
   T_HTP_P constant integer :=2;  
   T_TABLE_ROW constant integer := 3;  
     
   /*  
   default output to dbms_output.putline and db table  
   */  
   log_targets varchar2(3) := 'YNY';  
     
   procedure log(p_log_type in varchar2, p_log_desc in varchar2,p_log_point in varchar2 DEFAULT NULL);  
     
   procedure trace(p_log_type in varchar2, msg in varchar2);  
   procedure debug(msg in varchar2);  
   procedure info(msg in varchar2);  
   procedure warn(msg in varchar2);  
   procedure error(msg in varchar2);  
   procedure fatal(msg in varchar2);  
END AMB_LOGGER;  