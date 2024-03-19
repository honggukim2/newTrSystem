import React, { useEffect, useState } from 'react';
import { Popup } from "devextreme-react";

import ApiRequest from '../../utils/ApiRequest';
import CustomTable from "../../components/unit/CustomTable";
import ProjectClaimCostIndividualJson from './ProjectClaimCostIndividualJson.json';
import ProjectClaimCostIndividualCtPop from "./ProjectClaimCostIndividualCtPop";
import ProjectClaimCostIndividualMmPop from "./ProjectClaimCostIndividualMmPop";

const ProjectClaimCostIndividual = ({ prjctId, prjctNm, year, monthVal, aplyOdr, empId }) => {
  const { keyColumn, queryId, mmColumns, ctColumns, mmSumColumns, ctSumColumns } = ProjectClaimCostIndividualJson;
  const [mmData, setMMData] = useState([]);
  const [ctData, setCtData] = useState([]);
  const [data, setData] = useState([]);
  const [mmDetailValues, setMmDetailValues] = useState([]);
  const [ctDetailValues, setCtDetailValues] = useState([]);
  const [mmPopupVisible, setMmPopupVisible] = useState(false);
  const [ctPopupVisible, setCtPopupVisible] = useState(false);

  useEffect(() => {
      getMMData();
      getCtData();
  }, [year, monthVal, aplyOdr, empId]);

    const getMMData = async () => {

        const param = {
            queryId: queryId.empMMQueryId,
            prjctId: prjctId,
            aplyYm: year+monthVal,
            aplyOdr: aplyOdr,
            empId: empId
        };
        try{
            const response = await ApiRequest('/boot/common/queryIdSearch', param);
            setMMData(response);
        }catch (error){
            console.log(error)
        }
    };

    const getCtData = async () => {

        const param = {
            queryId: queryId.empCtQueryId,
            prjctId: prjctId,
            aplyYm: year+monthVal,
            aplyOdr: aplyOdr,
            empId: empId
        };
        try{
            const response = await ApiRequest('/boot/common/queryIdSearch', param);
            setCtData(response);
        }catch (error){
            console.log(error)
        }
    };

    const onMmBtnClick = async (button, data) => {
        if (button.name === "empId") {
            setData(data);
        }
        await retrievePrjctCtClmSttusIndvdlMMAcctoDetail(data);
        setMmPopupVisible(true);
    }

    const retrievePrjctCtClmSttusIndvdlMMAcctoDetail = async (data) => {

        const param = {
            queryId: queryId.mmPopupQueryId,
            prjctId: prjctId,
            aplyYm: year+monthVal,
            aplyOdr: aplyOdr,
            empId: data.empId
        }
        const response = await ApiRequest("/boot/common/queryIdSearch", param);
        setMmDetailValues(response);
    }

    const onCtBtnClick = async (button, data) => {
        if (button.name === "empId") {
            setData(data);
        }
        await retrievePrjctCtClmSttusIndvdlCtAcctoDetail(data);
        setCtPopupVisible(true);
    }

    const retrievePrjctCtClmSttusIndvdlCtAcctoDetail = async (data) => {

        const param = {
            queryId: queryId.ctPopupQueryId,
            prjctId: prjctId,
            aplyYm: year+monthVal,
            aplyOdr: aplyOdr,
            empId: data.empId
        }
        const response = await ApiRequest("/boot/common/queryIdSearch", param);
        setCtDetailValues(response);
    }

    const handleClose = () => {
        setCtPopupVisible(false);
        setMmPopupVisible(false);
    };

  return (
    <div style={{padding: '20px'}}>
      <div className='container'>
        <p><strong>* 수행인력</strong></p>
        <CustomTable
          keyColumn={keyColumn}
          values={mmData}
          columns={mmColumns}
          summary={true}
          summaryColumn={mmSumColumns}
          onClick={onMmBtnClick}
        />
        &nbsp;
        <p><strong>* 경비</strong></p>
        <CustomTable
          keyColumn={keyColumn}
          values={ctData}
          columns={ctColumns}
          summary={true}
          summaryColumn={ctSumColumns}
          onClick={onCtBtnClick}
        />
          <Popup
              width="90%"
              height="90%"
              visible={mmPopupVisible}
              onHiding={handleClose}
              showCloseButton={true}
          >
              <ProjectClaimCostIndividualMmPop props={mmDetailValues} prjctNm={prjctNm} data={data}/>
          </Popup>
          <Popup
              width="90%"
              height="90%"
              visible={ctPopupVisible}
              onHiding={handleClose}
              showCloseButton={true}
          >
              <ProjectClaimCostIndividualCtPop props={ctDetailValues} prjctNm={prjctNm} data={data}/>
          </Popup>
      </div>
    </div>
  );
};

export default ProjectClaimCostIndividual;