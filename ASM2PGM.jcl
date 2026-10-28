//ASM2PGM  JOB 1,NOTIFY=&SYSUID                                                 
//ASM2PGM  EXEC ASMACL,MBR=ASM2PGM                                              
//C.SYSIN  DD *                                                                 
ASM2PGM  TITLE 'contest program'                                                
ASM2PGM  CSECT                                                                  
*--------------------------------------------------------------------*          
*        register equates                                            *          
*--------------------------------------------------------------------*          
R0       EQU   0                       register 0                               
BASEREG  EQU   12                      base register                            
SAVEREG  EQU   13                      save area register                       
RETREG   EQU   14                      caller's return address                  
ENTRYREG EQU   15                      entry address                            
RETCODE  EQU   15                      return code                              
         EJECT                                                                  
*--------------------------------------------------------------------*          
*        standard entry setup, save area chaining, establish         *          
*        base register and addressibility                            *          
*--------------------------------------------------------------------*          
         USING ASM2PGM,ENTRYREG        establish addressibility                 
         B     SETUP                   branch around eyecatcher                 
         DC    CL8'ASM2PGM'            program name                             
         DC    CL8'&SYSDATE'           program assembled date                   
SETUP    STM   RETREG,BASEREG,12(SAVEREG)  save caller's registers              
         BALR  BASEREG,R0              establish base register                  
         DROP  ENTRYREG                drop initial base register               
         USING *,BASEREG               establish addressibilty                  
         LA    ENTRYREG,SAVEAREA       point to this program save area          
         ST    SAVEREG,4(,ENTRYREG)    save address of caller                   
         ST    ENTRYREG,8(,SAVEREG)    save address of this program             
         LR    SAVEREG,ENTRYREG        point to this program savearea           
         EJECT                                                                  
*--------------------------------------------------------------------*          
*        program body                                                *          
*--------------------------------------------------------------------*          
         L     6,=C'Begin'                                                      
         LA    6,=C'Begin'                                                      
LOOPINIT DS    0H                                                               
         SR    6,6                                                              
         L     6,=F'10'                                                         
         SR    7,7                                                              
LOOP     DS    0H                                                               
         A     7,=F'5'                                                          
         BCT   6,LOOP                                                           
STOP1    LH    7,HALFCON                                                        
STOP2    A     7,FULLCON                                                        
STOP3    ST    7,HEXCON                                                         
         EJECT                                                                  
*--------------------------------------------------------------------*          
*        standard exit -  restore caller's registers and             *          
*        return to caller                                            *          
*--------------------------------------------------------------------*          
EXIT     DS    0H                      halfword boundary alignment              
         L     SAVEREG,4(,SAVEREG)     restore caller's save area addr          
         L     RETREG,12(,SAVEREG)     restore return address register          
         LM    R0,BASEREG,20(SAVEREG)  restore all regs. except reg15           
         WTO   'Giving control back to system'                                  
         BR    RETREG                  return to caller                         
         EJECT                                                                  
*--------------------------------------------------------------------*          
*        storage and constant definitions.                           *          
*        print output definition.                                    *          
*--------------------------------------------------------------------*          
SAVEAREA DC    18F'-1'                 register save area                       
FULLCON  DC    F'-1'                                                            
HEXCON   DC    XL4'9ABC'                                                        
HALFCON  DC    H'32'                                                            
         END   ASM2PGM                                                          
//GO      EXEC PGM=ASM2PGM                                                      
//STEPLIB  DD DSN=&SYSUID..LOAD,DISP=SHR                                        
//PRINT    DD SYSOUT=*                                                          
