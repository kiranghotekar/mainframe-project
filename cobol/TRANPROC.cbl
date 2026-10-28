       IDENTIFICATION DIVISION.
       PROGRAM-ID. TRANPROC.

       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.

           SELECT TRANSACTION-FILE
               ASSIGN TO "data/transactions.dat"
               ORGANIZATION IS LINE SEQUENTIAL.

           SELECT ACCOUNT-FILE
               ASSIGN TO "data/accounts.dat"
               ORGANIZATION IS LINE SEQUENTIAL.

           SELECT ACCOUNT-OUTPUT-FILE
               ASSIGN TO "data/accounts.tmp"
               ORGANIZATION IS LINE SEQUENTIAL.

           SELECT PROCESSED-FILE
               ASSIGN TO "data/processed.dat"
               ORGANIZATION IS LINE SEQUENTIAL.

           SELECT EXCEPTION-FILE
               ASSIGN TO "data/exceptions.dat"
               ORGANIZATION IS LINE SEQUENTIAL.

       DATA DIVISION.
       FILE SECTION.

       FD  TRANSACTION-FILE.
       01  TRANSACTION-RECORD
           PIC X(100).

       FD  ACCOUNT-FILE.
       01  ACCOUNT-RECORD
           PIC X(100).

       FD  ACCOUNT-OUTPUT-FILE.
       01  ACCOUNT-OUTPUT-RECORD
           PIC X(120).

       FD  PROCESSED-FILE.
       01  PROCESSED-RECORD
           PIC X(80).

       FD  EXCEPTION-FILE.
       01  EXCEPTION-RECORD
           PIC X(80).

       WORKING-STORAGE SECTION.

       01  WS-END-TRANSACTIONS
           PIC X VALUE "N".

           88 END-OF-TRANSACTIONS
              VALUE "Y".

       01  WS-END-ACCOUNTS
           PIC X VALUE "N".

           88 END-OF-ACCOUNTS
              VALUE "Y".

       01  WS-TXN-ID
           PIC X(10).

       01  WS-TXN-ACCOUNT-ID
           PIC X(10).

       01  WS-TXN-TYPE
           PIC X(10).

       01  WS-AMOUNT
           PIC 9(10)V99.

       01  WS-DESCRIPTION
           PIC X(30).

       01  WS-ACCOUNT-BALANCE-TEXT
           PIC X(30).

       01  WS-PROCESS-STATUS
           PIC X(30).

       01  WS-TRANSACTION-COUNT
           PIC 9(5) VALUE 0.

       01  WS-SUCCESS-COUNT
           PIC 9(5) VALUE 0.

       01  WS-ERROR-COUNT
           PIC 9(5) VALUE 0.

       01  WS-TOTAL-CREDIT
           PIC 9(12)V99 VALUE 0.

       01  WS-TOTAL-DEBIT
           PIC 9(12)V99 VALUE 0.

       01  WS-OUTPUT-LINE
           PIC X(80).

       01  WS-BALANCE-DISPLAY
           PIC Z(9)9.99.

       01  WS-ACCOUNT-INDEX
           PIC 9(2) VALUE 0.

       01  WS-ACCOUNT-FOUND
           PIC X VALUE "N".

           88 ACCOUNT-FOUND
              VALUE "Y".

       01  WS-FOUND-INDEX
           PIC 9(2) VALUE 0.

       01  WS-ACCOUNT-COUNT
           PIC 9(3) VALUE 0.

       *> Temporary fields used while loading the account master.
       01  WS-INPUT-ACCOUNT-ID
           PIC X(10).

       01  WS-INPUT-ACCOUNT-NAME
           PIC X(30).

       01  WS-INPUT-ACCOUNT-TYPE
           PIC X(15).

       01  WS-INPUT-ACCOUNT-BALANCE
           PIC X(30).

       01  WS-INPUT-ACCOUNT-STATUS
           PIC X(10).

       01  WS-INPUT-BALANCE-NUMERIC
           PIC 9(10)V99.

       01  ACCOUNT-TABLE.

           05 ACCOUNT-ENTRY OCCURS 100 TIMES.

               10 TABLE-ACCOUNT-ID
                   PIC X(10).

               10 TABLE-ACCOUNT-NAME
                   PIC X(30).

               10 TABLE-ACCOUNT-TYPE
                   PIC X(15).

               10 TABLE-BALANCE
                   PIC 9(10)V99.

               10 TABLE-ACCOUNT-STATUS
                   PIC X(10).

       PROCEDURE DIVISION.

       MAIN-PROCESS.

           DISPLAY "=============================================="
           DISPLAY "   HIGH-VOLUME BATCH TRANSACTION PROCESSOR"
           DISPLAY "=============================================="
           DISPLAY " ".

           PERFORM LOAD-ACCOUNT-MASTER.

           OPEN INPUT TRANSACTION-FILE
                OUTPUT PROCESSED-FILE
                       EXCEPTION-FILE.

           PERFORM PROCESS-ALL-TRANSACTIONS.

           CLOSE TRANSACTION-FILE
                 PROCESSED-FILE
                 EXCEPTION-FILE.

           PERFORM WRITE-UPDATED-ACCOUNT-MASTER.

           DISPLAY " ".
           DISPLAY "=============================================="
           DISPLAY "             BATCH PROCESSING COMPLETE"
           DISPLAY "=============================================="
           DISPLAY "TOTAL TRANSACTIONS : "
                   WS-TRANSACTION-COUNT
           DISPLAY "SUCCESSFUL         : "
                   WS-SUCCESS-COUNT
           DISPLAY "ERRORS             : "
                   WS-ERROR-COUNT
           DISPLAY "TOTAL CREDIT       : "
                   WS-TOTAL-CREDIT
           DISPLAY "TOTAL DEBIT        : "
                   WS-TOTAL-DEBIT
           DISPLAY "=============================================="

           STOP RUN.

       LOAD-ACCOUNT-MASTER.

           MOVE 0
               TO WS-ACCOUNT-COUNT.

           OPEN INPUT ACCOUNT-FILE.

           MOVE "N"
               TO WS-END-ACCOUNTS.

           PERFORM UNTIL END-OF-ACCOUNTS

               READ ACCOUNT-FILE

                   AT END
                       MOVE "Y"
                           TO WS-END-ACCOUNTS

                   NOT AT END

                       ADD 1
                           TO WS-ACCOUNT-COUNT

                       MOVE SPACES
                           TO WS-INPUT-ACCOUNT-ID
                              WS-INPUT-ACCOUNT-NAME
                              WS-INPUT-ACCOUNT-TYPE
                              WS-INPUT-ACCOUNT-BALANCE
                              WS-INPUT-ACCOUNT-STATUS

                       UNSTRING ACCOUNT-RECORD
                           DELIMITED BY "|"
                           INTO WS-INPUT-ACCOUNT-ID
                                WS-INPUT-ACCOUNT-NAME
                                WS-INPUT-ACCOUNT-TYPE
                                WS-INPUT-ACCOUNT-BALANCE
                                WS-INPUT-ACCOUNT-STATUS
                       END-UNSTRING

                       MOVE WS-INPUT-ACCOUNT-ID
                           TO TABLE-ACCOUNT-ID
                              (WS-ACCOUNT-COUNT)

                       MOVE WS-INPUT-ACCOUNT-NAME
                           TO TABLE-ACCOUNT-NAME
                              (WS-ACCOUNT-COUNT)

                       MOVE WS-INPUT-ACCOUNT-TYPE
                           TO TABLE-ACCOUNT-TYPE
                              (WS-ACCOUNT-COUNT)

                       COMPUTE WS-INPUT-BALANCE-NUMERIC
                           =
                           FUNCTION NUMVAL
                           (WS-INPUT-ACCOUNT-BALANCE)

                       MOVE WS-INPUT-BALANCE-NUMERIC
                           TO TABLE-BALANCE
                              (WS-ACCOUNT-COUNT)

                       MOVE WS-INPUT-ACCOUNT-STATUS
                           TO TABLE-ACCOUNT-STATUS
                              (WS-ACCOUNT-COUNT)

               END-READ

           END-PERFORM.

           CLOSE ACCOUNT-FILE.

           DISPLAY "ACCOUNT MASTER LOADED: "
                   WS-ACCOUNT-COUNT
                   " ACCOUNTS".

       PROCESS-ALL-TRANSACTIONS.

           MOVE "N"
               TO WS-END-TRANSACTIONS.

           PERFORM UNTIL END-OF-TRANSACTIONS

               READ TRANSACTION-FILE

                   AT END
                       MOVE "Y"
                           TO WS-END-TRANSACTIONS

                   NOT AT END

                       ADD 1
                           TO WS-TRANSACTION-COUNT

                       PERFORM PROCESS-TRANSACTION

               END-READ

           END-PERFORM.

       PROCESS-TRANSACTION.

           UNSTRING TRANSACTION-RECORD
               DELIMITED BY "|"
               INTO WS-TXN-ID
                    WS-TXN-ACCOUNT-ID
                    WS-TXN-TYPE
                    WS-AMOUNT
                    WS-DESCRIPTION
           END-UNSTRING.

           DISPLAY "Processing: "
                   WS-TXN-ID
                   " Account: "
                   WS-TXN-ACCOUNT-ID
                   " Type: "
                   WS-TXN-TYPE
                   " Amount: "
                   WS-AMOUNT.

           IF WS-AMOUNT = 0

               MOVE "INVALID AMOUNT"
                   TO WS-PROCESS-STATUS

               PERFORM WRITE-EXCEPTION

           ELSE

               IF WS-TXN-TYPE = "CREDIT"

                   ADD WS-AMOUNT
                       TO WS-TOTAL-CREDIT

                   PERFORM UPDATE-ACCOUNT

               ELSE

                   IF WS-TXN-TYPE = "DEBIT"

                       ADD WS-AMOUNT
                           TO WS-TOTAL-DEBIT

                       PERFORM UPDATE-ACCOUNT

                   ELSE

                       MOVE "INVALID TYPE"
                           TO WS-PROCESS-STATUS

                       PERFORM WRITE-EXCEPTION

                   END-IF

               END-IF

           END-IF.

       UPDATE-ACCOUNT.

           MOVE "N"
               TO WS-ACCOUNT-FOUND.

           MOVE 0
               TO WS-FOUND-INDEX.

           PERFORM VARYING WS-ACCOUNT-INDEX
               FROM 1 BY 1
               UNTIL WS-ACCOUNT-INDEX >
                     WS-ACCOUNT-COUNT
                  OR ACCOUNT-FOUND

               IF TABLE-ACCOUNT-ID
                  (WS-ACCOUNT-INDEX)
                  = WS-TXN-ACCOUNT-ID

                   MOVE "Y"
                       TO WS-ACCOUNT-FOUND

                   MOVE WS-ACCOUNT-INDEX
                       TO WS-FOUND-INDEX

               END-IF

           END-PERFORM.

           IF ACCOUNT-FOUND

               MOVE WS-FOUND-INDEX
                   TO WS-ACCOUNT-INDEX

               DISPLAY "ACCOUNT FOUND: "
                       WS-TXN-ACCOUNT-ID
                       " INDEX: "
                       WS-ACCOUNT-INDEX
                       " BALANCE BEFORE: "
                       TABLE-BALANCE
                       (WS-ACCOUNT-INDEX)

               IF WS-TXN-TYPE = "CREDIT"

                   ADD WS-AMOUNT
                       TO TABLE-BALANCE
                       (WS-ACCOUNT-INDEX)

                   DISPLAY "BALANCE AFTER CREDIT: "
                           TABLE-BALANCE
                           (WS-ACCOUNT-INDEX)

                   MOVE "SUCCESS"
                       TO WS-PROCESS-STATUS

                   ADD 1
                       TO WS-SUCCESS-COUNT

                   PERFORM WRITE-PROCESSED

               ELSE

                   IF TABLE-BALANCE
                      (WS-ACCOUNT-INDEX)
                      >= WS-AMOUNT

                       SUBTRACT WS-AMOUNT
                           FROM TABLE-BALANCE
                           (WS-ACCOUNT-INDEX)

                       DISPLAY "BALANCE AFTER DEBIT: "
                               TABLE-BALANCE
                               (WS-ACCOUNT-INDEX)

                       MOVE "SUCCESS"
                           TO WS-PROCESS-STATUS

                       ADD 1
                           TO WS-SUCCESS-COUNT

                       PERFORM WRITE-PROCESSED

                   ELSE

                       MOVE "INSUFFICIENT BALANCE"
                           TO WS-PROCESS-STATUS

                       PERFORM WRITE-EXCEPTION

                   END-IF

               END-IF

           ELSE

               MOVE "ACCOUNT NOT FOUND"
                   TO WS-PROCESS-STATUS

               PERFORM WRITE-EXCEPTION

           END-IF.

       WRITE-PROCESSED.

           MOVE SPACES
               TO WS-OUTPUT-LINE.

           STRING
               WS-TXN-ID
                   DELIMITED BY SIZE
               "|"
                   DELIMITED BY SIZE
               WS-TXN-ACCOUNT-ID
                   DELIMITED BY SIZE
               "|"
                   DELIMITED BY SIZE
               WS-TXN-TYPE
                   DELIMITED BY SIZE
               "|"
                   DELIMITED BY SIZE
               WS-AMOUNT
                   DELIMITED BY SIZE
               "|"
                   DELIMITED BY SIZE
               "SUCCESS"
                   DELIMITED BY SIZE
               INTO WS-OUTPUT-LINE
           END-STRING.

           WRITE PROCESSED-RECORD
               FROM WS-OUTPUT-LINE.

       WRITE-EXCEPTION.

           ADD 1
               TO WS-ERROR-COUNT.

           MOVE SPACES
               TO WS-OUTPUT-LINE.

           STRING
               WS-TXN-ID
                   DELIMITED BY SIZE
               "|"
                   DELIMITED BY SIZE
               WS-TXN-ACCOUNT-ID
                   DELIMITED BY SIZE
               "|"
                   DELIMITED BY SIZE
               WS-TXN-TYPE
                   DELIMITED BY SIZE
               "|"
                   DELIMITED BY SIZE
               WS-AMOUNT
                   DELIMITED BY SIZE
               "|"
                   DELIMITED BY SIZE
               WS-PROCESS-STATUS
                   DELIMITED BY SIZE
               INTO WS-OUTPUT-LINE
           END-STRING.

           WRITE EXCEPTION-RECORD
               FROM WS-OUTPUT-LINE.

       WRITE-UPDATED-ACCOUNT-MASTER.

           OPEN OUTPUT ACCOUNT-OUTPUT-FILE.

           MOVE 1
               TO WS-ACCOUNT-INDEX.

           PERFORM UNTIL WS-ACCOUNT-INDEX >
                         WS-ACCOUNT-COUNT

               MOVE SPACES
                   TO ACCOUNT-OUTPUT-RECORD

               MOVE TABLE-BALANCE
                   (WS-ACCOUNT-INDEX)
                   TO WS-BALANCE-DISPLAY

               STRING
                   TABLE-ACCOUNT-ID
                       (WS-ACCOUNT-INDEX)
                       DELIMITED BY SIZE
                   "|"
                       DELIMITED BY SIZE
                   TABLE-ACCOUNT-NAME
                       (WS-ACCOUNT-INDEX)
                       DELIMITED BY SIZE
                   "|"
                       DELIMITED BY SIZE
                   TABLE-ACCOUNT-TYPE
                       (WS-ACCOUNT-INDEX)
                       DELIMITED BY SIZE
                   "|"
                       DELIMITED BY SIZE
                   WS-BALANCE-DISPLAY
                       DELIMITED BY SIZE
                   "|"
                       DELIMITED BY SIZE
                   TABLE-ACCOUNT-STATUS
                       (WS-ACCOUNT-INDEX)
                       DELIMITED BY SIZE
                   INTO ACCOUNT-OUTPUT-RECORD
               END-STRING

               WRITE ACCOUNT-OUTPUT-RECORD

               ADD 1
                   TO WS-ACCOUNT-INDEX

           END-PERFORM.

           CLOSE ACCOUNT-OUTPUT-FILE.

           CALL "SYSTEM"
               USING "mv data/accounts.tmp data/accounts.dat".

           DISPLAY "ACCOUNT MASTER UPDATED SUCCESSFULLY".
