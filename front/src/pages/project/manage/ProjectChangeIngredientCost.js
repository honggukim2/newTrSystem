import { useEffect, useState } from "react";

import ProjectChangeIngredientCostJson from "./ProjectChangeIngredientCostJson.json"

import CustomAddTable from "../../../components/unit/CustomAddTable";
import Box, {Item} from "devextreme-react/box";
import ApiRequest from "../../../utils/ApiRequest";

const ProjectChangeIngredientCost = ({ prjctId, ctrtYmd, stbleEndYmd, bgtMngOdr, bgtMngOdrTobe, deptId, targetOdr, bizSttsCd, atrzLnSn}) => {

    const [values, setValues] = useState([]);
    const [cdValues, setCdValues] = useState([]);
    const { manuName, tableColumns} = ProjectChangeIngredientCostJson;

    useEffect(() => {
        IngredientCost();
        IngredientCostCd();
    }, []);

    const IngredientCost = async () => {
        const param = [
            { tbNm:"MATRL_CT_PRMPC" },
            { prjctId: prjctId,
             bgtMngOdr : bgtMngOdrTobe },
        ];
        try {
            const response = await ApiRequest("/boot/common/commonSelect", param);
            setValues(response);
        } catch(error) {
            console.error(error);
        }
    }   

    const IngredientCostCd = async () => {

        const param = {
            queryId: "projectMapper.retrievePrjctMatrlCtCd",
            upCdValue: "VTW014",
            useYn: "Y"
        }
        try {
            const response = await ApiRequest("/boot/common/queryIdSearch", param);
            setCdValues(response);
        } catch(error) {
            console.error(error);
        }
    }


    return (
        <>
            <div className="container" style={{ marginTop: "50px" }}>
                <div style={{padding:'20px'}}>

                <Box direction="col" width="100%" height={150}>
                    <Item ratio={1}>
                        <div className="rect demo-dark header">
                            <h5>재료비를 입력합니다.</h5>
                            <div> * + 버튼을 클릭하여 내용을 입력할 수 있습니다. </div>
                            <div> * <a className="dx-link dx-link-save dx-icon-save dx-link-icon" style={{textDecoration: 'none'}} /> 버튼을 클릭하여 입력한 내용을 저장할 수 있습니다.</div>
                            <div> * <a className="dx-link dx-link-edit dx-icon-edit dx-link-icon" style={{textDecoration: 'none'}} /> 버튼을 클릭하여 내용을 수정할 수 있습니다.</div>                        
                            <div> * <a className="dx-link dx-link-revert dx-icon-revert dx-link-icon" style={{textDecoration: 'none'}} /> 버튼을 클릭하여 내용을 수정할 수 있습니다.</div>                        
                            <div> * <a className="dx-link dx-link-delete dx-icon-trash dx-link-icon" style={{textDecoration: 'none'}} /> 버튼을 클릭하여 데이터를 삭제할 수 있습니다.</div>
                            <div> * 입력/수정 후 저장버튼 클릭 시 자동저장됩니다.</div>
                        </div>
                    </Item>
                </Box>

                <CustomAddTable 
                    manuName={manuName} 
                    columns={tableColumns} 
                    values={values} 
                    prjctId={prjctId} 
                    json={ProjectChangeIngredientCostJson} 
                    bgtMngOdr={bgtMngOdr} 
                    bgtMngOdrTobe={bgtMngOdrTobe}
                    cdValues={cdValues}
                    ctrtYmd={ctrtYmd}
                    stbleEndYmd={stbleEndYmd}
                    deptId={deptId}
                    targetOdr={targetOdr}
                    bizSttsCd={bizSttsCd}
                    atrzLnSn={atrzLnSn}/>
                </div>
            </div>
        </>
    )
}

export default ProjectChangeIngredientCost;