


; Helper: C:D -= A
SUB16_CD_A():
    PUSH_A
    MOV_BA
    MOV_AC
    SUB         ; A = C - B
    MOV_CA
    POP_A
    RET
