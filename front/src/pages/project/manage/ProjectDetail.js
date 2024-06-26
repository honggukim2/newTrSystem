import React, { useCallback, useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { TabPanel } from "devextreme-react";
import { useLocation } from "react-router-dom";
import Button from "devextreme-react/button";

import ApiRequest from "../../../utils/ApiRequest";
import ProjectDetailJson from "./ProjectDetailJson.json";
import { useModal } from "../../../components/unit/ModalContext";

const ProjectDetail = () => {
  const navigate = useNavigate ();
  const location = useLocation();
  const {
        prjctId,
        totBgt,
        bgtMngOdr,
        ctrtYmd,
        stbleEndYmd,
        bgtMngOdrTobe,
        bizSttsCd,
        deptId,
        prjctNm,
        path
  } = location.state || {};
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [atrzLnSn, setAtrzLnSn] = useState();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const atrzDmndSttsCd = "VTW03703";

  const { handleOpen } = useModal();
  const empId = userInfo.empId;

  /* 화면 최초 셋팅 */
  useEffect(() => {
    const param = { 
      queryId: "projectMapper.retrievePrjctAtrzLnSn",
      prjctId: prjctId,
    };
    const response = ApiRequest("/boot/common/queryIdSearch", param);

    response.then((value) => {
      if(value[0] !== null) {
        setAtrzLnSn(value[0].atrzLnSn);
      }
    });
  
  }, []);


  /* 탭 변경시 인덱스 설정 */
  const onSelectionChanged = useCallback(
    (args) => {
      if (args.name === "selectedIndex") {
        setSelectedIndex(args.value);
      }
    },
    [setSelectedIndex]
  );
  const itemTitleRender = (a) => <span>{a.TabName}</span>;


  /* 변경원가 버튼 클릭 */
  const onClikcChngBgt = async () => {


    if(atrzLnSn === undefined) {
      // null이면 check 할 필요가 없다.
      const isconfirm = window.confirm("원가 등록을 진행하시겠습니까?");
      if(isconfirm){
        await projectChgHandle();
      }
    } else {
      const result = await chkBgtOdr().then((value) => {
        return value;
      });

      if(result != null) {
          if(result === 'VTW03701') {
              // 임시저장인 경우
              // handleOpen("프로젝트 변경을 진행하시겠습니까?", projectChgHandle, true);
              const isconfirm = window.confirm("프로젝트 변경을 진행하시겠습니까?");
              if(isconfirm) {
                await projectChgHandle();
              }
          } else if (result === 'VTW03704') {
            // 생성중인 프로젝트가 아니고, 반려인 경우 작동
            // handleOpen("기존에 반려된 요청이 존재합니다. 반려된 요청을 수정하시겠습니까?", projectChgHandle(result), true);
            const isconfirm = window.confirm("반려된 요청이 존재합니다. 반려된 요청을 수정하시겠습니까?");
            if(isconfirm) {
                await projectChgHandle(result);
            } else {
              const isconfirm = window.confirm("반려된 내용을 제거하시겠습니까? 작성한 데이터가 사라집니다.");
              if(isconfirm) {
                const isconfirm = window.confirm("정말로 반려된 내용을 제거하시겠습니까?");
                if(isconfirm) {
                  await resetPrmpc();
                }
              }
            }

          } else {
            const isconfirm = window.confirm("프로젝트 변경을 진행하시겠습니까?");
            if(isconfirm){
              await projectChgHandle();
            }
          }
      }
    }
  };

  const projectChgHandle = async (bfeAtrzDmndSttsCd) => {

      let targetOdr;
      
      const result = await handleBgtPrmpc().then((value) => {

        if(value === -1) {
          handleOpen("문제가 발생하였습니다. 괸리자에게 문의하세요.");
          return;
        }
          targetOdr = value;
      });
      navigate("../project/ProjectChange",
        {
        state: { prjctId: prjctId
               , originCtrtYmd: ctrtYmd
               , originStbleEndYmd: stbleEndYmd
               , bgtMngOdr:bgtMngOdr
               , bgtMngOdrTobe: bgtMngOdrTobe
               , targetOdr: targetOdr
               , bizSttsCd: bizSttsCd
               , atrzLnSn: atrzLnSn
               , deptId: deptId
               , prjctNm: prjctNm
               , bfeAtrzDmndSttsCd: bfeAtrzDmndSttsCd
              },
      })
  }

  /**
   * 승인이 반려된 차수일 때 이를 초기화 요청 시
   * 다음차수로 올린 뒤 최종 승인 완료된 값을 넣어준다.
   * + 프로젝트를 수행중으로 바꾼다.
   */
  const resetPrmpc = async () => {
    const date = new Date();
    
    const param = {
      prjctId: prjctId,
      totAltmntBgt: totBgt,
      bgtMngOdr: bgtMngOdr,
      bgtMngOdrTobe: bgtMngOdrTobe,
      atrzDmndSttsCd: "VTW03701",
      regDt : date.toISOString().split('T')[0]+' '+date.toTimeString().split(' ')[0],
      regEmpId: empId,
      bizSttsCd: bizSttsCd
    };

    try {
      const response = await ApiRequest("/boot/prjct/resetPrmpc", param);
      if(response > 0) {
        navigate("../project/ProjectChange",
        {
          state: {
            prjctId: prjctId
            , originCtrtYmd: ctrtYmd
            , originStbleEndYmd: stbleEndYmd
            , bgtMngOdr: bgtMngOdr
            , bgtMngOdrTobe: response
            , targetOdr: response
            , bizSttsCd: bizSttsCd
            , atrzLnSn: atrzLnSn
            , deptId: deptId
          },
        })
      }

    } catch (error) {
      console.error('Error fetching data', error);
    }

  };

  /**
   * 변경원가 차수가 반려되거나 임시저장인 차수인지 확인한다.
   * VTW03701: 임시저장
   * VTW03704: 반려
   * @returns 
   */
  const chkBgtOdr = async () => {

    const param = { 
      queryId: "projectMapper.retrieveTmprRjctBgtOdr",
      prjctId: prjctId,
      bgtMngOdr: bgtMngOdrTobe
    };

    const response = await ApiRequest("/boot/common/queryIdSearch", param);

    return response[0].atrzDmndSttsCd;
  };

  const handleBgtPrmpc = async () => {
    const date = new Date();

    const param = [ 
      { tbNm: "PRJCT_BGT_PRMPC" },
      { 
        prjctId: prjctId,
        totAltmntBgt: totBgt,
        bgtMngOdr: bgtMngOdr,
        bgtMngOdrTobe: bgtMngOdrTobe,
        atrzDmndSttsCd: "VTW03701",
        regDt : date.toISOString().split('T')[0]+' '+date.toTimeString().split(' ')[0],
        regEmpId: empId
      }, 
    ]; 
    try {
        const response = await ApiRequest("/boot/prjct/insertProjectCostChg", param);
        console.log("response", response);
        return response;
    } catch (error) {
        console.error('Error fetching data', error);
    }
  }

  /**
   * 사업종료로 수정해준다.
   */
  const onClickEnd = async () => {

    const param = [
      { tbNm: "PRJCT" },
      { bizSttsCd: "VTW00404" },
      { prjctId: prjctId }
    ]
    
    handleOpen("프로젝트를 종료 하시겠습니까?",  () => endPrjct(param), true);

    const endPrjct = async (param) => {
      const response = await ApiRequest("/boot/common/commonUpdate", param);
    }

  }

  return (
    <div>
      <div
        className="title p-1"
        style={{ marginTop: "20px", marginBottom: "10px" }}
      >
        <div style={{ marginRight: "20px", marginLeft: "20px" }}>
          <h1 style={{ fontSize: "30px" }}>프로젝트 관리</h1>
          <div>{prjctNm}</div>
        </div>
      </div>
      <div className="buttons" align="right" style={{ margin: "20px" }}>
        <Button
          width={110}
          text="Contained"
          type="default"
          stylingMode="contained"
          style={{ margin: "2px" }}
          visible={bizSttsCd === "VTW00404" ? false : true}
          onClick={onClikcChngBgt}
        >
          {bizSttsCd === "VTW00401" ? "원가등록" : "변경원가" }
        </Button>
        <Button
          width={110}
          text="Contained"
          type="default"
          stylingMode="contained"
          style={{ margin: "2px" }}
          visible={bizSttsCd === "VTW00404" ? false : true}
          onClick={onClickEnd}
        >
          프로젝트종료
        </Button>
        <Button
          width={50}
          text="Contained"
          type="normal"
          stylingMode="outline"
          style={{ margin : '2px' }}
          onClick={() => navigate(`..${path}`)}
        >
          목록
        </Button>
      </div>
      <div
        style={{
          marginTop: "20px",
          marginBottom: "10px",
          width: "100%",
          height: "100%",
        }}
      >
        <TabPanel
          height="auto"
          width="auto"
          dataSource={ProjectDetailJson}
          selectedIndex={selectedIndex}
          onOptionChanged={onSelectionChanged}
          itemTitleRender={itemTitleRender}
          animationEnabled={true}
          itemComponent={({ data }) => {
          const Component = React.lazy(() => import(`${data.url}`));
          if(data.index === selectedIndex) {
              return (
                <React.Suspense fallback={<div>Loading...</div>}>
                <Component 
                  prjctId={prjctId} 
                  ctrtYmd={ctrtYmd} 
                  stbleEndYmd={stbleEndYmd} 
                  bgtMngOdr={bgtMngOdr} 
                  bgtMngOdrTobe={bgtMngOdrTobe} 
                  atrzDmndSttsCd={atrzDmndSttsCd}
                  bizSttsCd={bizSttsCd}
                />
              </React.Suspense>
            );
          }
        }}
        />
      </div>
    </div>
  );
};

export default ProjectDetail;
