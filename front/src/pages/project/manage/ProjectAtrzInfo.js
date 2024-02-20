import React, { useEffect, useState, useCallback, } from 'react';
import { TreeView } from 'devextreme-react/tree-view';

import ApiRequest from '../../../utils/ApiRequest';
import CustomHorizontalTable from '../../../components/unit/CustomHorizontalTable';
import AtrzInfo from './ProjectAtrzInfoJson.json';

const ProjectAtrzInfo = ({prjctId}) => {
const [atrzInfoData, setAtrzInfoData] = useState([]);
const [atrzDate, setAtrzDate] = useState([]);

const date = [
  {
    atrzLnSn: 1,
    text: "2024-02-15",
  },
  {
    atrzLnSn: 2,
    text: "2024-02-16",
  }
];

useEffect(() => {
  AtrzDate();
  AtrzInfoData(1);
}, []);

const AtrzDate = async () => {
  const param = [
    { tbNm: "PRJCT_ATRZ_LN" },
    { prjctId : prjctId }
  ]

  try {
    const response = await ApiRequest("/boot/common/commonSelect", param);
    setAtrzDate(response);

  } catch (error) {
    console.error('Error fetching data', error);
  }

}


const AtrzInfoData = async (atrzLnSn) => {
  const param =
    { 
      queryId: AtrzInfo.queryId,
      prjctId: prjctId,
      atrzLnSn: atrzLnSn 
    }
 ; 
  try {
    const response = await ApiRequest("/boot/common/queryIdSearch", param);
    setAtrzInfoData(response);
    console.log(response);
  } catch (error) {
    console.error('Error fetching data', error);
  }
};

const handleTreeViewSelectionChange = useCallback((e) => {
  
  console.log(e)
  console.log(e.itemData);
  
  AtrzInfoData(e.itemData.atrzLnSn);
});

  return (
    <div style={{padding: '20px'}}>
    <div className='container'>
      <p><strong>* 결재정보 </strong></p>
      <div className='atrz-container'>
        <div className='left-content'>
          <TreeView
            items={atrzDate}
            dataStructure="plain"
            selectionMode="single"
            selectByClick={true}
            displayExpr={(e) => e.regDt.substr(0,10)}
            keyExpr="atrzLnSn"
            onItemSelectionChanged={handleTreeViewSelectionChange}
          />
        </div>
        <div className='right-content'>
          <CustomHorizontalTable headers={AtrzInfo.AtrzSumry.AtrzSumry1} column={atrzInfoData[0]}/>
          {
            atrzInfoData.map((item) => {
              if(item.atrzOpnnCn !== null) {
                return (
                  <CustomHorizontalTable headers={AtrzInfo.AtrzSumry.AtrzSumry3} column={item}/>
                );
              } else if(item.rjctPrvonsh !== null){
                return (
                  <CustomHorizontalTable headers={AtrzInfo.AtrzSumry.AtrzSumry4} column={item}/>
                )
              } else {
                return (
                  <CustomHorizontalTable headers={AtrzInfo.AtrzSumry.AtrzSumry2} column={item}/>
                )
              }
            })
          }
        </div>
      </div>

{/*       
      <CustomHorizontalTable headers={AtrzInfo.AtrzSumry.AtrzSumry1} column={atrzInfoData[0]}/>
      {
        atrzInfoData.map((item) => {
          if(item.atrzOpnnCn !== null) {
            return (
              <CustomHorizontalTable headers={AtrzInfo.AtrzSumry.AtrzSumry3} column={item}/>
            );
          } else if(item.rjctPrvonsh !== null){
            return (
              <CustomHorizontalTable headers={AtrzInfo.AtrzSumry.AtrzSumry4} column={item}/>
            )
          } else {
            return (
              <CustomHorizontalTable headers={AtrzInfo.AtrzSumry.AtrzSumry2} column={item}/>
            )
          }
        })
      } */}
    </div>
  </div>
  );
};

export default ProjectAtrzInfo;