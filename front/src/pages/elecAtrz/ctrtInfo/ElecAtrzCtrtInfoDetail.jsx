import React, { useEffect, useState, useCallback, useRef } from "react";
import { Popup } from "devextreme-react/popup";
import { Button } from "devextreme-react";

import CustomTable from "../../../components/unit/CustomTable";
import ElecAtrzMatrlCtJson from "./ElecAtrzMatrlCtJson.json";
import ElecAtrzOutordCompanyJson from "./ElecAtrzOutordCompanyJson.json";
import PymntPlanPopup from "./PymntPlanPopup"

import ApiRequest from "utils/ApiRequest";

/**
 *  "VTW04909" : 외주업체
 *  "VTW04910" : 재료비
 */
const ElecAtrzCtrtInfoDetail = ({data, prjctId, onSendData, sttsCd, ctrtTyCd}) => {
    
    const [popupVisible, setPopupVisible] = useState(false);
    const [tableData, setTableData] = useState([]);                 //그리드 전체 데이터
    const [selectedData, setSelectedData] = useState({});           //선택된 행의 데이터

    let jsonData = {};
    if((ctrtTyCd ? ctrtTyCd : data.elctrnAtrzTySeCd) === "VTW04910"){
        jsonData = ElecAtrzMatrlCtJson
    }else if ((ctrtTyCd? ctrtTyCd : data.elctrnAtrzTySeCd) === "VTW04909"){
        jsonData = ElecAtrzOutordCompanyJson
    }

    const {keyColumn, summaryColumn, insertButton} = jsonData;
    let tableColumns = jsonData.tableColumns;

    /*
    *상태코드에 따른 버튼 변경
    */
    if(["VTW03702","VTW03703","VTW03704","VTW03705","VTW03706","VTW03707","VTW03405"].includes(sttsCd)
        || data.elctrnAtrzTySeCd === "VTW04914"){
        tableColumns = tableColumns.filter(item => item.value !== '삭제');

        tableColumns = tableColumns.map((item) => {
                        if(item.value === "수정"){
                            return {
                                ...item,
                                button:{
                                    ...item.button,
                                    text: "상세"
                                }
                            };
                        }
                        return item;
                    });
    }


    /**
     * 임시저장 조회
     */
    useEffect(() => {
        /* 임시저장 조회 */
        if(sttsCd === "VTW03701") {
            getTempData();
        /* 전자결재 목록 조회 */
        }else if(["VTW03702","VTW03703","VTW03704","VTW03705"].includes(sttsCd)) {
            getTempData();
        }else if(["VTW03405"].includes(sttsCd)){   //지급
            getTempData();
        }
    }, [data.ctrtElctrnAtrzId])


    /**
     * 임시저장된 데이터
     */
    const getTempData = async () => {

        const dtlParam = 
            { queryId: "elecAtrzMapper.retrieveEntrpsCtrtDtl",
              elctrnAtrzId: data.ctrtElctrnAtrzId ? data.ctrtElctrnAtrzId : data.elctrnAtrzId,
              elctrnAtrzTySeCd: ctrtTyCd ? ctrtTyCd : data.elctrnAtrzTySeCd}    
        const dtlResponse = await ApiRequest("/boot/common/queryIdSearch", dtlParam);

        const ctrtDataDtl = dtlResponse[0];

        const dtlCndParam = {
            queryId: "elecAtrzMapper.retrieveEntrpsCtrtDtlCnd",
            elctrnAtrzId: data.ctrtElctrnAtrzId ? data.ctrtElctrnAtrzId : data.elctrnAtrzId }

        const dtlCndResponse = await ApiRequest("/boot/common/queryIdSearch", dtlCndParam);

        dtlCndResponse.map((item) => {
            item.ctrtYmd = new Date(item.ctrtYmd);
        });

        const pay = dtlCndResponse;

        let advPayYm = "";
        let advPayAmt = 0;
        let surplusYm = "";
        let surplusAmt = 0;
        let prtPayYm = "";
        let prtPayAmt = 0;

        for(let i = 0; i < pay.length; i++) {

            let month
            if(pay[i].ctrtYmd.getMonth() + 1 < 10) {
                month = "0" + (pay[i].ctrtYmd.getMonth() + 1)
            }

            //선금
            if(["VTW03201","VTW03202","VTW03203","VTW03204"].includes(pay[i].giveOdrCd)){
                if(pay[i].giveOdrCd === "VTW03201"){
                    advPayYm = pay[i].ctrtYmd.getFullYear() + "" + month;
                }
                advPayAmt += pay[i].ctrtAmt;
               
            //잔금
            } else if(pay[i].giveOdrCd === "VTW03212") {    
                surplusYm = pay[i].ctrtYmd.getFullYear () + "" + month;
                surplusAmt = pay[i].ctrtAmt;

            //중도금
            } else  {
                if(pay[i].giveOdrCd === "VTW03205") {  
                    prtPayYm = pay[i].ctrtYmd.getFullYear() + "" + month;
                }
                prtPayAmt += pay[i].ctrtAmt;
            }
        }
        
        const result = {
            ...ctrtDataDtl,
            pay,
            "advPayYm": advPayYm,
            "advPayYm": advPayYm,
            "advPayAmt": advPayAmt,
            "surplusYm": surplusYm,
            "surplusAmt": surplusAmt,
            "prtPayYm": prtPayYm,
            "prtPayAmt": prtPayAmt,
            "totAmt": advPayAmt + surplusAmt + prtPayAmt
        }
        handlePopupData(result);
    }

    /**
     *  날짜데이터 포멧팅
     */
    function formatDateToYYYYMM(date) {
        let year = date.getFullYear().toString();
        let month = (date.getMonth() + 1).toString().padStart(2, '0'); 
        return year + month;
    }

    /**
     *  부모창으로 데이터 전송
     */
    useEffect(() => {

        //pay 배열에 tbNm 추가
        const updatedTableData = tableData.map(item => ({
            ...item,
            pay: [{ tbNm: 'ENTRPS_CTRT_DTL_CND' }, ...item.pay.map(payItem => ({ ...payItem }))]
        }));
        
        //테이블 배열에 tbNm 추가
        let newData;
        newData = [{ tbNm: 'ENTRPS_CTRT_DTL' }, ...updatedTableData];

        //pay데이터의 날짜 데이터 포멧팅
        newData.forEach(item => {
            if (!item.pay || item.pay.length === 0) return;
            item.pay.forEach(element => {
                if (!element.ctrtYmd) return;
                element.ctrtYmd = formatDateToYYYYMM(element.ctrtYmd);
            });
        });

        if(!!onSendData){
            onSendData(newData);
        }
    }, [tableData]);


    /**
     *  Table 버튼 handling
     */
    const handlePopupVisible = useCallback((button, data) => {

        if(button.name === "insert") {  //update인 경우도 추가해야함 .
            setPopupVisible(prev => !prev);
            // setSelectedData(data);
        }else if(button.name === "delete"){
            if(data.entrpsCtrtDtlSn != 0){
                setTableData(currentTableData => currentTableData.filter(item => item.entrpsCtrtDtlSn !== data.entrpsCtrtDtlSn));
            }
        }else if(button.name === "update"){
            setPopupVisible(prev => !prev);
            setSelectedData(data);
        }      

    },[popupVisible]);

    const closePopupVisible = useCallback(() => {
        setPopupVisible(false);
        setSelectedData({});
    },[]);


    const handlePopupData = (data) => {
        const existingIndex = tableData.findIndex(item => item.entrpsCtrtDtlSn === data.entrpsCtrtDtlSn);
        if(existingIndex >=0){
            const updatedData = [...tableData];
            updatedData[existingIndex] = data;
            setTableData(updatedData);
        } else {
            const maxSn = tableData.length > 0 ? Math.max(...tableData.map(item => item.entrpsCtrtDtlSn || 0)) : 0;
            data.entrpsCtrtDtlSn = maxSn + 1;  
            setTableData(prev => [...prev, data]);
        }

    }

    
    /**
     *  화면 표출
     */
    return (
        <div className="elecAtrzNewReq-ctrtInfo">
            <div style={{ textAlign: "right", marginBottom:"10px" }}>
                {(!["VTW03702","VTW03703","VTW03704","VTW03705","VTW03706","VTW03707","VTW03405"].includes(sttsCd)) && (
                    data.elctrnAtrzTySeCd !=="VTW04914" 
                ) && (
                <Button name="insert" onClick={()=>handlePopupVisible({name:"insert"})}>{insertButton}</Button>
                )}
            </div>
           <CustomTable
            keyColumn={keyColumn}
            columns={tableColumns}
            values={tableData? tableData : []}
            pagerVisible={false}
            summary={true}
            summaryColumn={summaryColumn}
            onClick={handlePopupVisible}
            />

            <Popup
                width="80%"
                height="80%" 
                visible={popupVisible}
                onHiding={closePopupVisible}
                showCloseButton={true}
                title="지불 계획 입력"
            >
                <PymntPlanPopup 
                    prjctId={prjctId} 
                    handlePopupVisible={closePopupVisible} 
                    handlePlanData={handlePopupData} 
                    selectedData={selectedData}
                    data={data}
                    sttsCd={sttsCd}
                    ctrtTyCd={ctrtTyCd}
                />
            </Popup>
        </div>
    );

}
export default ElecAtrzCtrtInfoDetail;