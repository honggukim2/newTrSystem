import React, { useCallback, useState, Suspense, lazy, useEffect } from "react";
import { TabPanel } from "devextreme-react";
import { useLocation } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import { Button } from "devextreme-react/button";
import TextArea from 'devextreme-react/text-area';
import Popup from "devextreme-react/popup";

import ProjectChangeJson from "./ProjectChangeJson.json";
import ProjectPrmpcBgtCmpr from "./ProjectPrmpcBgtCmpr";

import ApiRequest from "utils/ApiRequest";
import { useModal } from "../../../components/unit/ModalContext";

const ProjectChange = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    prjctId = null,
    originCtrtYmd = null,
    originStbleEndYmd = null,
    bgtMngOdr = null,
    bgtMngOdrTobe = null,
    targetOdr = null,
    bizSttsCd = null,
    atrzLnSn = null,
    deptId = null,
    prjctNm = null,
    bfeAtrzDmndSttsCd = null
  } = location.state ?? {};


  const [selectedIndex, setSelectedIndex] = useState(0);

  const [atrzAplyPrvonshCn, setAtrzAplyPrvonshCn] = useState(null);

  const ProjectChangeTab = ProjectChangeJson.tab;
  const popup = ProjectChangeJson.popup;

  const [popupVisible, setPopupVisible] = useState(false);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const empId = userInfo.empId;
  const [requestBtnVisible, setAprvBtnVisible] = useState(true);
  const [cancelBtnVisible, setCancelBtnVisible] = useState(false);
  const [bizSttsBtnVisible, setBizSttsBtnVisible] = useState(false);
  const [atrzDmndSttsCd, setAtrzDmndSttsCd] = useState("VTW03701");

  const [ctrtYmd, setCtrtYmd] = useState();
  const [stbleEndYmd, setStbleEndYmd] = useState();

  const { handleOpen } = useModal();
  useEffect(() => {

    // 해당 프로젝트에 승인요청중인 내역이 있는지 확인한다.
    // 확인 후 있을 경우 -> 승인요청 버튼을 비활성화한다. / 승인취소 버튼을 활성화한다.
    // 확인 후 없을 경우 -> 승인요청 버튼을 활성화한다. / 승인취소 버튼을 비활성화한다.
    const param = [
      { tbNm: "PRJCT_BGT_PRMPC" },
      {
        prjctId: prjctId,
        bgtMngOdr: bgtMngOdrTobe,
      }
    ]

    const response = ApiRequest("/boot/common/commonSelect", param);
    response.then((value) => {

      if(value[0].atrzDmndSttsCd === "VTW03702") {
        setAprvBtnVisible(false);
        setCancelBtnVisible(true);
      }

      if(value[0].atrzDmndSttsCd === "VTW03704") {
        setAtrzDmndSttsCd("VTW03704");
      }
    });

    if(bfeAtrzDmndSttsCd === "VTW03704" && bizSttsCd === "VTW00403") {
      // 이전 결재요청상태 코드값이 반려이면서 사업상태코드가 변경중인 경우
      // 수행전환 버튼을 활성화한다.
      setBizSttsBtnVisible(true)
    }
  }, []);

  useEffect(() => {

    retrivePrjctPeriod();
    
  }, [selectedIndex]);

  const retrivePrjctPeriod = async () => {
    const param = {
      queryId: "projectMapper.retrivePrjctPeriod",
      prjctId: prjctId
    }

    try {
      const response = await ApiRequest("/boot/common/queryIdSearch", param);
      setCtrtYmd(response[0].ctrtYmd);
      setStbleEndYmd(response[0].stbleEndYmd);

    } catch (error) {
      console.log(error);
    }
  }

  

  // 탭 변경시 인덱스 설정
  const onSelectionChanged = useCallback(
    (args) => {
      if (args.name === "selectedIndex") {
        setSelectedIndex(args.value);
      }
    },[]
  );

  const itemTitleRender = (a) => <span>{a.TabName}</span>;
 
  const onPopup = () => {
    setPopupVisible(true);
  }

  const handleClose = () => {
    setPopupVisible(false);
  };

  const onSubmit = () => {

    // 확인 로직
    const boolean = false;

    if(boolean) {
      handleOpen("승인요청중인 내역이 있습니다. 승인요청을 취소하고 다시 요청해주세요.");
      return;
    } else {
      const isconfirm = window.confirm("승인요청을 진행합니다. 승인을 요청하시겠습니까?");
      if(isconfirm){
        handleAtrzLn();
      }
    }
  }

  const onTextAreaValueChanged = useCallback((e) => {
    setAtrzAplyPrvonshCn(e.value);
  }, []);
  

  const handleAtrzLn = async () => {

    // 승인요청 눌렀을 때 
    // * 변수로 해당 차수(targetOdr) 넣어주기.
    const date = new Date();
    const param = [
      { tbNm: "PRJCT_ATRZ_LN"},
      { tbNm: "PRJCT_ATRZ_LN_DTL"},
      { 
        prjctId: prjctId,
        empId: empId,
        deptId: deptId,
        regDt : date.toISOString().split('T')[0]+' '+date.toTimeString().split(' ')[0],
        atrzAplyPrvonshCn: atrzAplyPrvonshCn,
        targetOdr: targetOdr,
      },
    ];
    try {
      const response = await ApiRequest("/boot/prjct/insertRegistProjectAprv", param);

      if(response > 0) {

        /**
         * VTW03701	임시저장
          VTW03702	결재요청
          VTW03703	결재완료
        */

        // 승인요청 되면 PRJCT 수정해주기
        // BIZ_STTS_CD 컬럼이 생성중(VTW00401) 이면 그대로 둔다
        // BIZ_STTS_CD 컬럼이 생성중(VTW00401)이 아니면 -> VTW00403(변경중)
        if(bizSttsCd !== "VTW00401") {
          handlePrjctBizStts("VTW00403");
        }

        // 승인요청 되면 PRJCT_BGT_PRMPC 수정해주기
        // ATRZ_DMND_STTS_CD 컬럼 -> VTW03702(결재요청)
        handleBgtPrmpc("VTW03702");

        // 승인요청이 되면 PRJCT_HIST 수정해주기
        // ATRZ_DMND_STTS_CD 컬럼 -> VTW03702(결재요청)
        handleTempPrjct("VTW03702");

        handleOpen("승인요청이 완료되었습니다.");
        setPopupVisible(false);
        navigate("../project/ProjectAprv");
      } else {
        handleOpen("승인요청이 실패되었습니다.");
      }
    } catch (error) {
      console.error('Error fetching data', error);
    }
  }

  /**
   * PRJCT_BGT_PRMPC(프로젝트예산변경요청) 테이블의 ATRZ_DMND_STTS_CD(승인요청상태코드)를 변경한다.
   * @param {"VTW03701", "VTW03702", "VTW03703"} cdValue : ATRZ_DMND_STTS_CD(승인요청상태코드)
   */
  const handleBgtPrmpc = async (cdValue) => {
    const mdfcnDt = new Date().toISOString().split('T')[0]+' '+new Date().toTimeString().split(' ')[0];

    const param = [
      { tbNm : "PRJCT_BGT_PRMPC" },
      {
        atrzDmndSttsCd: cdValue,
        mdfcnEmpId: empId,
        mdfcnDt: mdfcnDt,
      },
      {
        prjctId: prjctId,
        bgtMngOdr: targetOdr,
      }
    ]
    try {
      await ApiRequest("/boot/common/commonUpdate", param);
    } catch (error) {
      console.error('Error fetching data', error);
    }
  }

  /**
   * PRJCT_HIST(프로젝트이력) 테이블의 ATRZ_DMND_STTS_CD(승인요청상태코드)를 변경한다.
   * @param {"VTW03701", "VTW03702", "VTW03703"} cdValue : ATRZ_DMND_STTS_CD(승인요청상태코드)
   */
    const handleTempPrjct = async (cdValue) => {
      const mdfcnDt = new Date().toISOString().split('T')[0]+' '+new Date().toTimeString().split(' ')[0];

      
      const param = {
        queryId: "projectMapper.updateTempPrjctAtrzDmndSttsCd",
        prjctId: prjctId,
        atrzDmndSttsCd: cdValue,
        mdfcnEmpId: empId,
        mdfcnDt: mdfcnDt,
        state: "UPDATE"
      } 

      try {
        await ApiRequest("/boot/common/queryIdDataControl", param);
      } catch (error) {
        console.error('Error fetching data', error);
      }
    }

  /**
   * PRJCT(프로젝트) 테이블의 BIZ_STTS_CD(사업상태코드)를 변경한다.
   * @param {"VTW00401", "VTW00402", "VTW00403", "VTW00404"} cdValue : BIZ_STTS_CD(사업상태코드)
   */
  const handlePrjctBizStts = async (cdValue) => {
    const mdfcnDt = new Date().toISOString().split('T')[0]+' '+new Date().toTimeString().split(' ')[0];

    const param = [
      { tbNm : "PRJCT" },
      {
        bizSttsCd: cdValue,
        mdfcnEmpId: empId,
        mdfcnDt: mdfcnDt,
      },
      {
        prjctId: prjctId,
      }
    ];

    try {
      await ApiRequest("/boot/common/commonUpdate", param);
    } catch (error) {
      console.error('Error fetching data', error);
    }
  }

  const toDetail = () => {
    navigate("../project/ProjectDetail",
        {
        state: { prjctId: prjctId, ctrtYmd: originCtrtYmd, stbleEndYmd: originStbleEndYmd, bgtMngOdr:bgtMngOdr, bgtMngOdrTobe:bgtMngOdrTobe, deptId: deptId, targetOdr: targetOdr, bizSttsCd :bizSttsCd , atrzLnSn: atrzLnSn, prjctNm: prjctNm},
        })
  };

  /**
   * 승인요청취소 버튼 클릭
   */
  const onAprvCancel = async () => {
    const mdfcnDt = new Date().toISOString().split('T')[0]+' '+new Date().toTimeString().split(' ')[0];

    /**
     * 승인결재선 테이블을 결재상세코드: 취소(VTW00805)로 수정한다.
     */
    const isconfirm = window.confirm("승인요청을 취소하시겠습니까?");
    if(isconfirm){
      const param = [
        { tbNm: "PRJCT_ATRZ_LN_DTL" },
        {
          atrzSttsCd: "VTW00805",
          mdfcnDt: mdfcnDt,
          mdfcnEmpId: empId,
        },
        {
          prjctId: prjctId,
          atrzLnSn: atrzLnSn,
        }
      ];
      
      try {
        const response = await ApiRequest("/boot/common/commonUpdate", param);
        if(response > 0) {
          handleOpen("승인요청이 취소되었습니다.");
          
          // 수행으로 수정
          if(bizSttsCd !== "VTW00401") {
            handlePrjctBizStts("VTW00402");
          }
          
          // 임시저장으로 수정
          handleBgtPrmpc("VTW03701");

          // 임시저장으로 수정
          handleTempPrjct("VTW03701");

          
        } else {
          handleOpen("승인요청 취소가 실패되었습니다.");
        }
        toDetail();
        
      } catch (error) {
        console.error('Error fetching data', error);
      }
      
    }
  }

  /**
   * 반려되었을 때 프로젝트를 수행 상태로 전환한다.
   */
  const onBizSttsChg = async () => {
    console.log(bizSttsCd);
    console.log(bfeAtrzDmndSttsCd);

    /**
     * 프로젝트 수정
     */

    const param = [
      { tbNm: "PRJCT" },
      {
        bizSttsCd: "VTW00402"
      },
      { 
        prjctId: prjctId
      }
    ]

    try {

      const isconfirm = window.confirm("프로젝트를 수행상태로 전환하시겠습니까?");
      if(isconfirm) {
        const result = await ApiRequest("/boot/common/commonUpdate", param);

        if(result > 0) {
          handleOpen("수행상태로 전환되었습니다.")
          toDetail();
        }
        
      }
      
    } catch (error) {
      console.error('Error fetching data', error);
    }

  }

  return (
    <div>
      <div
        className="title p-1"
        style={{ marginTop: "20px", marginBottom: "10px" }}
      >
        <div style={{ marginRight: "20px", marginLeft: "20px" }}>
          <h1 style={{ fontSize: "30px" }}>프로젝트 변경</h1>
        </div>
      </div>
      <div className="buttons" align="right" style={{ margin: "20px" }}>
        <Button 
          width={110}
          text="Contained"
          type="default"
          stylingMode="contained"
          style={{ margin: "2px" }} 
          onClick={onBizSttsChg} 
          visible={bizSttsBtnVisible}
          >
            수행전환
        </Button>
        <Button 
          width={110}
          text="Contained"
          type="default"
          stylingMode="contained"
          style={{ margin: "2px" }}
          onClick={onPopup} 
          visible={requestBtnVisible}
        >
          승인요청
        </Button>
        <Button 
          width={110}
          text="Contained"
          type="default"
          stylingMode="contained"
          style={{ margin: "2px" }} 
          onClick={onAprvCancel} 
          visible={cancelBtnVisible}
        >
          승인요청취소
        </Button>
        <Button 
          width={50}
          text="Contained"
          type="normal"
          stylingMode="outline"
          style={{ margin : '2px' }} 
          onClick={toDetail}
        >
          이전
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
          dataSource={ProjectChangeTab}
          selectedIndex={selectedIndex}
          onOptionChanged={onSelectionChanged}
          itemTitleRender={itemTitleRender}
          itemComponent={({ data }) => {
          const Component = lazy(() => import(`${data.url}`));
          if (data.index === selectedIndex){
          return (
            <Suspense fallback={<div>Loading...</div>}>
              <Component 
                prjctId={prjctId}
                ctrtYmd={ctrtYmd}
                stbleEndYmd={stbleEndYmd}
                bgtMngOdr={bgtMngOdr}
                bgtMngOdrTobe={targetOdr}
                revise={true}
                tabId={data.tabId}
                change={true}
                deptId={deptId}
                targetOdr={targetOdr}
                bizSttsCd={bizSttsCd}
                atrzLnSn={atrzLnSn}
                requestBtnVisible={requestBtnVisible}
              />
            </Suspense>
          );
          }
        }}
        />
      </div>
      <Popup
        width={popup.width}
        height={popup.height}
        visible={popupVisible} 
        onHiding={handleClose}
        showCloseButton={true}
        title={popup.title}
      >
        <ProjectPrmpcBgtCmpr
          prjctId={prjctId}
          bgtMngOdr={bgtMngOdr}
          bgtMngOdrTobe={targetOdr}
          targetOdr={targetOdr}
          visible={popupVisible}
          atrzDmndSttsCd={atrzDmndSttsCd}
          type="req"
        />
        <br/>
        <TextArea 
          height="30%"
          valueChangeEvent="change"
          onValueChanged={onTextAreaValueChanged}
          placeholder="승인 요청 사유를 입력해주세요."
        />
        <br/>
        <div className="buttons" align="right" style={{ marginTop: "20px" }}>
          <Button           
            width={110}
            text="Contained"
            type="default"
            stylingMode="contained"
            style={{ margin: "2px" }}
            onClick={onSubmit}
            >
              승인요청
          </Button>
          <Button          
            width={110}
            text="Contained"
            type="default"
            stylingMode="contained"
            style={{ margin: "2px" }} 
            onClick={handleClose}
            >
            요청취소
          </Button>
        </div>
      </Popup>
    </div>
  );
};

export default ProjectChange;
