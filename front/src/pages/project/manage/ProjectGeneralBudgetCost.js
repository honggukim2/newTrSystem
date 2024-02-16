import { useEffect, useState } from "react";

import ProjectGeneralBudgetCostJson from "./ProjectGeneralBudgetCostJson.json";

import CustomCostTable from "components/unit/CustomCostTable";
import Box, { Item } from "devextreme-react/box";
import ApiRequest from "../../../utils/ApiRequest";

const ProjectGeneralBudgetCost = ({ prjctId, ctrtYmd, bizEndYmd, bgtMngOdr }) => {
  const [values, setValues] = useState([]);
  const [popupVisible, setPopupVisible] = useState(false);

  const param = [
    { tbNm: "EXPENS_PRMPC" },
    { prjctId: prjctId }, 
  ];

  useEffect(() => {
    GeneralBudget();
  }, []);

  const GeneralBudget = async () => {
    try {
      const response = await ApiRequest("/boot/common/commonSelect", param);
      setValues(response);
      console.log("response",response);
    } catch (error) {
      console.error(error);
    }
  };

  const onHide = () => {
    setPopupVisible(false);
  }

  return (
    <>
      <div style={{ margin: "50px" }}>
        <div style={{ padding: "20px" }}>
            
        <Box direction="col" width="100%" height={150}>
                    <Item ratio={1}>
                        <div className="rect demo-dark header">
                            <h5>일반경비를 입력합니다.</h5>
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
              검색 (비용코드, 상세내역 등 다양하게 검색가능)
            </p>
            <CustomCostTable
              keyColumn={ProjectGeneralBudgetCostJson.keyColumn}
              manuName={ProjectGeneralBudgetCostJson.manuName}
              columns={ProjectGeneralBudgetCostJson.tableColumns}
              popup={ProjectGeneralBudgetCostJson.popup}
              summaryColumn={ProjectGeneralBudgetCostJson.summaryColumn}
              costTableInfoJson={ProjectGeneralBudgetCostJson}
              values={values}
              prjctId={prjctId}
              ctrtYmd={ctrtYmd}
              bizEndYmd={bizEndYmd}
              bgtMngOdr={bgtMngOdr}
              onHide={onHide}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectGeneralBudgetCost;
