import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { Button } from "devextreme-react/button";
import { TextBox } from "devextreme-react/text-box";
import AtrzLnTable from "components/unit/AtrzLnTable";
import ApprovalPopup from "components/unit/ApprovalPopup";
import ApiRequest from "utils/ApiRequest";

const ElecAtrzTitleInfo = ({ contents, onClick,  formData, prjctData, onHandleAtrzTitle, atrzParam }) => {
    const [ cookies ] = useCookies(["userInfo", "userAuth"]);
    const [ atrzLnEmpList, setAtrzLnEmpList ] = useState([]);
    const [ popVisible, setPopVisible ] = useState(false);
  
    const onAtrzLnPopup = async () => {
        setPopVisible(true);
    }

    const onPopHiding = async (aprvrEmpList) => {
        setPopVisible(false);
        setAtrzLnEmpList(aprvrEmpList)
    }

    const setButtons = () => {
        const result = [];
        contents.map((item) => {
            result.push(<Button id={item.id} text={item.text} 
            onClick={item.id === 'onAtrzLnPopup' ? onAtrzLnPopup : onClick} />);
        });
        return result;
    };
    
    useEffect(() => {
        const getAtrzEmp = async () => {
            try{
                const response = await ApiRequest('/boot/common/queryIdSearch', {
                    queryId: "indvdlClmMapper.retrieveElctrnAtrzRefrnInq",
                    searchType: "atrzLnReftnList", 
                    repDeptId: "9da3f461-9c7e-cd6c-00b6-c36541b09b0d"
                })
                setAtrzLnEmpList(response);
            } catch(error) {
                console.log('error', error);
            }
        };
        getAtrzEmp();
    }, []);
  
  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-start" }}>
        <div style={{ float: "left", marginRight: "auto" }}>로고</div>
        <div style={{ display: "inline-block" }}>{setButtons()}</div>
      </div>

      <h3 style={{ textAlign: "center" }}>{formData.gnrlAtrzTtl}</h3>
      <div style={{ display: "flex", marginTop: "20px", marginLeft: "90px", fontSize: '18px' }}>
        <div style={{ flex: 4 }}>
          <table>
            <tr>
              <td>문서번호</td>
              <td> : </td>
              <td></td>
            </tr>
            <tr>
              <td>프로젝트</td>
              <td> : </td>
              <td>
                [{prjctData.prjctCdIdntfr}] {prjctData.prjctNm}
              </td>
            </tr>
            <tr>
              <td>기안자</td>
              <td> : </td>
              <td>부서 명 / {cookies.userInfo.empNm}</td>
            </tr>
            <tr>
              <td>기안일자</td>
              <td> : </td>
              <td></td>
            </tr>
          </table>
        </div>
        {/* 결재선 컴포넌트 */}
        <div style={{ flex: 3, marginRight: "50px" }}>
          <AtrzLnTable 
            atrzLnEmpList={atrzLnEmpList}
            bottomNm={'합의'}
          />
        </div>
      </div>
      <div className="elecAtrzNewReq-title" style={{ marginTop: "20px" }}>
        <div className="dx-fieldset">
          <div className="dx-field">
            <div className="dx-field-label" style={{ width: "5%" }}>참 조</div>
            <TextBox
              className="dx-field-value"
              readOnly={true}
              style={{ width: "95%" }}
              value={atrzLnEmpList.filter((item) => item.approvalCode === 'VTW00706' )
                .map(item => item.listEmpFlnm).join('; ')}
            />
          </div>

          <div className="dx-field">
            <div className="dx-field-label" style={{ width: "5%" }}>제 목</div>
            <TextBox
              className="dx-field-value"
              style={{ width: "95%" }}
              value={atrzParam.title}
              onValueChanged={onHandleAtrzTitle}
            />
          </div>

          <ApprovalPopup
            visible={popVisible}
            atrzLnEmpList={atrzLnEmpList}
            onHiding={onPopHiding}
          />

        </div>
      </div>
      <hr />
    </>
  );
};

export default ElecAtrzTitleInfo;