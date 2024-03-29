import React from "react";
import Button from "devextreme-react/button";
import ApiRequest from "../../utils/ApiRequest";
import axios from "axios";

const button = {
    borderRadius: '5px',
    width: 'auto',
    marginTop: '20px',
    marginRight: '15px'
}

const ProjectExpenseSubmit = (props) => {

    const handleSubmit = async() => {
        try{
            const confirmResult = window.confirm("등록하시겠습니까?");
            if (confirmResult) {
                if(props.value[0]?.prjctCtAplySn != null){
                    // const param =[
                    //     { tbNm: "PRJCT_ATRZ_HIST", snColumn: "PRJCT_ATRZ_HIST_SN",
                    //         snSearch: {
                    //             prjctId : props.value[0].prjctId,
                    //             empId : props.value[0].empId,
                    //             aplyYm : props.value[0].aplyYm,
                    //             aplyOdr : props.value[0].aplyOdr
                    //         }
                    //     }, {
                    //         prjctId : props.value[0].prjctId,
                    //         empId : props.value[0].empId,
                    //         aplyYm : props.value[0].aplyYm,
                    //         aplyOdr : props.value[0].aplyOdr
                    //     }
                    // ]
                    // const result = await ApiRequest('/boot/common/commonUpdate', param);
                    // result.then(() => {
                    //     updateValue(props.value[0]);
                    // });
                }else{
                    let params = [];
                    props.value.forEach((data) => {
                        let prjctId = null;
                        if(typeof data.prjctId === "string"){
                            prjctId = data.prjctId;
                        } else if (typeof data.prjctId === "object"){
                            prjctId = data.prjctId[0].prjctId;
                        }
                        params.push({
                            "prjctId": prjctId,
                            "empId": data.empId,
                            "aplyYm": data.aplyYm,
                            "aplyOdr": data.aplyOdr
                        })
                    });
                    const result = searchMM(params);
                    result.then((value)=>{
                        if(value?.length == 0){
                            insertValue();
                        } else {
                            const resultMM = insertMM(value);
                            resultMM.then(()=>{
                                insertValue();
                            });
                        }
                    });
                }
            }
        } catch (e) {
            window.alert("오류가 발생했습니다. 사용내역을 선택했는지 확인해 주세요.")
        }
    };

    const searchMM = async(params) => {
        const response = await ApiRequest("/boot/indvdlClm/prjctExpns/selectPrjctMM", params);
        return response;
    }

    const insertMM = async (params) => {
        const response = await axios.post("/boot/indvdlClm/prjctExpns/insertPrjctMM", params);
        return response;
    }

    const insertValue = async () => {
        const params = [{ tbNm: props.tbNm, snColumn: props.snColumn }];
        props.value.forEach(value => {
            if (typeof value.prjctId === "object"){
                value.prjctId = value.prjctId[0].prjctId;
            }
            if(typeof value.utztnAmt === "string"){
                value.utztnAmt = value.utztnAmt.replace(",","");
            }
            params.push(value);
        })
        try {
            const response = await ApiRequest("/boot/common/commonInsert", params);
            if (response === 1) {
                window.location.reload();
                window.alert("등록되었습니다.")
            }
        } catch (error) {
            console.error("API 요청 에러:", error);
            throw error;
        }
    }

    // const updateValue = async (data) => {
    //     const param = [
    //         { tbNm: "PRJCT_CT_APLY" },
    //         {
    //             prjctId: data.prjctId,
    //             expensCd: data.expensCd,
    //             ctPrpos: data.ctPrpos,
    //             ATDRN: data.ATDRN,
    //         },
    //         {
    //             prjctId : data.prjctId,
    //             empId : data.empId,
    //             aplyYm : data.aplyYm,
    //             aplyOdr : data.aplyOdr
    //         }
    //     ];
    //     try {
    //         const response = await ApiRequest("/boot/common/commonUpdate", param);
    //         if(response > 0) {
    //             window.location.reload();
    //             window.alert("수정되었습니다.")
    //         }
    //     }catch (error) {
    //         console.error(error);
    //     }
    // }

    return(
        <Button style={button} type={props.type} text={props.text} onClick={handleSubmit}></Button>
    );
};

export default ProjectExpenseSubmit;