#!/bin/bash

echo "============================================================"
echo " HIGH-VOLUME BATCH TRANSACTION PROCESSING SYSTEM"
echo "============================================================"
echo
echo "[JOB] BATCHJOB"
echo "[STEP01] EXEC PGM=TRANPROC"
echo
echo "Starting COBOL transaction processor..."
echo "------------------------------------------------------------"

./TRANPROC

RC=$?

echo "------------------------------------------------------------"
echo "COBOL RETURN CODE: $RC"

if [ $RC -eq 0 ]; then
    echo
    echo "[JOB STATUS] COMPLETED SUCCESSFULLY"
else
    echo
    echo "[JOB STATUS] FAILED"
fi

echo
echo "============================================================"
echo " BATCH JOB COMPLETE"
echo "============================================================"

exit $RC
