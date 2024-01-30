import React, { useEffect, useState } from 'react';

import ApiRequest from '../../../utils/ApiRequest';
import CustomHorizontalTable from '../../../components/unit/CustomHorizontalTable';
import BaseInfo from './ProjectBaseInfo.json';

const ProjectBaseInfo = (prjctId) => {
  const [baseInfoData, setBaseInfoData] = useState([]);
  const [picInfoData, setPicInfoData] = useState([]);
  const [CnsrtmData, setCnsrtmData] = useState([]);

  //baseInfoData데이터    ----> //prjctId가(백단에서 불러오는 데이터가 or 보내는 파라미터가) 동일하다면 동일한 useEffect 2건은 삭제처리 가능.
  useEffect(() => {
    console.log("파라미터 확인 ",prjctId.projIdInfo);
    const BaseInfoData = async () => {
      const param = [ 
        { tbNm: "PRJCT" }, 
        { 
         prjctId: prjctId.projIdInfo, 
        }, 
     ]; 
     console.log("param?",param);
      try {
        const response = await ApiRequest("/boot/common/commonSelect", param);
        setBaseInfoData(response[0]);     
      } catch (error) {
        console.error('Error fetching data', error);
      }
    };
    BaseInfoData();
  }, []);

  //picInfoData 데이터
  useEffect(() => {
    const param = [ 
      { tbNm: "PRJCT" }, 
      { 
       prjctId: prjctId.projIdInfo, 
      }, 
   ]; 
    const PicInfoData = async () => {
      try {
        const response = await ApiRequest("/boot/common/commonSelect", param);
        setPicInfoData(response[0]);  
      } catch (error) {
        console.error('Error fetching data', error);
      }
    };
    PicInfoData();
  }, []);

  //Cnsrtm 데이터 
  useEffect(() => {
    const param = [ 
      { tbNm: "PRJCT_CNSRTM" }, 
      { 
       prjctId: prjctId.projIdInfo, 
      }, 
   ];  
    const Cnsrtm = async () => {
      try {
        const response = await ApiRequest("/boot/common/commonSelect", param);
        setCnsrtmData(response[0]);  
      } catch (error) {
        console.error('Error fetching data', error);
      }
    };
    Cnsrtm();
  }, []);


  return (
    <div style={{padding: '20px'}}>
      <div className='container'>
        <p><strong>* 기본정보</strong></p>
        <CustomHorizontalTable headers={BaseInfo.BaseInfo} column={baseInfoData}/>
        &nbsp;
        <p><strong>* 담당자 정보</strong></p>
        <CustomHorizontalTable headers={BaseInfo.PicInfo} column={picInfoData}/>
        &nbsp;
        <p><strong>* 컨소시엄</strong></p>
        <CustomHorizontalTable headers={BaseInfo.Cnsrtm} column={CnsrtmData}/>
      </div>
    </div>
  );
};

export default ProjectBaseInfo;