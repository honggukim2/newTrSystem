import { useEffect, useState } from "react";

import ProjectOutordEmpCostJson from "./ProjectOutordEmpCostJson.json";

import CustomCostTable from "components/unit/CustomCostTable";
import Box, { Item } from "devextreme-react/box";
import ApiRequest from "../../../utils/ApiRequest";
import { format } from 'date-fns';

const ProjectOutordEmpCost = ({ prjctId, ctrtYmd, bizEndYmd, bgtMngOdrTobe }) => {
  const [values, setValues] = useState([]);
  const { manuName, tableColumns, keyColumn, summaryColumn, popup } = ProjectOutordEmpCostJson;
  let groupingDtl = [];
  
  useEffect(() => {
    const runOrder = async() => {
      await OutordEmpDtl();
      await OutordEmp();
    };
    runOrder();
  }, []);

  const OutordEmpDtl = async () => {
    const param = [
      { tbNm: "OUTORD_LBRCO_PRMPC_DTL" },
      { prjctId: prjctId,
        bgtMngOdr: bgtMngOdrTobe,
      }, 
    ];

  try {
    const response = await ApiRequest("/boot/common/commonSelect", param);
    response.reduce((acc, item) => {
      // outordEmpId 값으로 그룹핑
      acc[item.outordLbrcoPrmpcSn] = acc[item.outordLbrcoPrmpcSn] || [];
      acc[item.outordLbrcoPrmpcSn].push(item);
      groupingDtl = acc;
      return acc;
    }, {});
    

  } catch (error) {
    console.error(error);
  }
};

  const OutordEmp = async () => {

    const param = {
      queryId: "projectMapper.retrieveOutordHnfPrmpc",
      prjctId: prjctId,
      bgtMngOdr: bgtMngOdrTobe,
    }

    try {
      const response = await ApiRequest("/boot/common/queryIdSearch", param);
      //월별정보 및 총 합계 response에 추가
      for(let j=0; j<Object.keys(groupingDtl).length; j++){
        let total = 0;
        for(let k=0; k<Object.values(groupingDtl)[j].length; k++){
          response[j][format(Object.values(groupingDtl)[j][k].inptYm, 'yyyy년 MM월')] = Object.values(groupingDtl)[j][k].expectMm;
          total += Object.values(groupingDtl)[j][k].expectMm;
        } 
        const fixedSum = Number(total.toFixed(2)); //js의 부동소수 이슈로 인한 자릿수 조정.
        response[j].total = fixedSum;     
      }
      setValues(response);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <div style={{ margin: "50px" }}>
        <div style={{ padding: "20px" }}>
            
        <Box direction="col" width="100%" height={150}>
                    <Item ratio={1}>
                        <div className="rect demo-dark header">
                            <h5>외주인력을 입력합니다.</h5>
                            <div> * + 버튼을 클릭하여 내용을 입력할 수 있습니다. </div>
                            <div> * <a className="dx-link dx-link-save dx-icon-save dx-link-icon" style={{textDecoration: 'none'}} /> 버튼을 클릭하여 입력한 내용을 저장할 수 있습니다.</div>
                            <div> * <a className="dx-link dx-link-edit dx-icon-edit dx-link-icon" style={{textDecoration: 'none'}} /> 버튼을 클릭하여 내용을 수정할 수 있습니다.</div>
                            <div> * 입력/수정 후 저장버튼 클릭 시 자동저장됩니다.</div>
                            <div> * <a className="dx-link dx-link-delete dx-icon-trash dx-link-icon" style={{textDecoration: 'none'}} /> 버튼을 클릭하여 데이터를 삭제할 수 있습니다.</div>
                        </div>
                    </Item>
                </Box>
          <div>
            <p style={{ textAlign: "right", marginBottom: "0px" }}>
            검색 (성명, 역할, 등급, 담당업무, 예정일, 맨먼스등 다양하게 검색가능) 
            </p>
            <CustomCostTable
              keyColumn={keyColumn}
              manuName={manuName}
              columns={tableColumns}
              values={values}
              prjctId={prjctId}
              summaryColumn={summaryColumn}
              popup={popup}
              costTableInfoJson={ProjectOutordEmpCostJson}
              ctrtYmd={ctrtYmd}
              bizEndYmd={bizEndYmd}
              bgtMngOdrTobe={bgtMngOdrTobe}
              json={ProjectOutordEmpCostJson}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectOutordEmpCost;
