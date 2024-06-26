import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "devextreme-react";
import { parse, format, addMonths, subMonths } from 'date-fns';

import ApiRequest from "../../utils/ApiRequest";
import ProjectChangePopup from "../../pages/project/manage/ProjectChangePopup";
import { useModal } from "./ModalContext";

import { Popup } from "devextreme-react";
import DataGrid, {Column, SearchPanel, Scrolling, Summary, TotalItem, ColumnFixing} from "devextreme-react/data-grid";


const CustomCostTable = (props) => {
  const { columns, values, json, ctrtYmd, stbleEndYmd, prjctId, bgtMngOdr, bgtMngOdrTobe, deptId, targetOdr, bizSttsCd, atrzLnSn } = props;

  const navigate = useNavigate();
  const [period, setPeriod] = useState([]); //사업시작일, 사업종료일을 받아와서 월별로 나눈 배열을 담을 상태
  const dataGridRef = useRef(null); // DataGrid 인스턴스에 접근하기 위한 ref
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [summaryColumns, setSummaryColumns] = useState(json.summaryColumn); 
  const [transformedData, setTransformedData] = useState([]);
  const editColumn = ["수정", "삭제"];
  const { handleOpen } = useModal();

  useEffect(() => {
    const deleteArray = [...json.pkColumns, ...json.nomalColumns, ...json.CdComboboxColumnNm];
    deleteArray.push("total");

    let temp = {...selectedItem};

    for (let i = 0; i < deleteArray.length; i++) {
      delete temp[deleteArray[i]];
    }

    const transformedData = Object.keys(temp).map((key) => {
        const formattedKey = key.replace('년 ', '').replace('월', '');             
        return {
          id: formattedKey,
          value: temp[key]
        };
      });
      setTransformedData(transformedData);

  }, [selectedItem]);

  const showPopup = (data) => {
    setIsPopupVisible(true);
    setSelectedItem(data); // 팝업에 표시할 데이터 설정
  };

  const hidePopup = () => {
    setIsPopupVisible(false);
    handleCancel();
  };
  
  const updateSummaryColumn = (periods) => {
    const newSummaryColumns = periods.map(period => ({
      key: period, value: period, type: "sum", format: json.format
    }));
    setSummaryColumns(prevSummaryColumns => [...prevSummaryColumns, ...newSummaryColumns]);
  };
  
  //기간 set
  useEffect(() => {
    // const start = parse(ctrtYmd || format(new Date(), 'yyyy-MM-dd'), 'yyyy-MM-dd', new Date());
    const start = subMonths(parse(ctrtYmd || format(new Date(), 'yyyy-MM-dd'), 'yyyy-MM-dd', new Date()), 1);
    // const end = stbleEndYmd ? parse(stbleEndYmd, 'yyyy-MM-dd', new Date()) : addMonths(start, 15);
    const end = stbleEndYmd ? addMonths(parse(stbleEndYmd, 'yyyy-MM-dd', new Date()), 1) : addMonths(start, 16);
    const periods = [];
  
    for (let currentDate = start; currentDate <= end; currentDate = addMonths(currentDate, 1)) {
      periods.push(format(currentDate, 'yyyy년 MM월'));
    }
  
    setPeriod(periods);
    updateSummaryColumn(periods);
  }, [ctrtYmd, stbleEndYmd]); 


  const onCellRenderEdit = ({data}) => {
    return (
      <Button
        onClick={() => showPopup(data)}
        text="수정"
        />
    );
  };

  //배열에서 특정 키만 추출
  const pick = (source, keys) => {
    const result = {};
    keys.forEach(key => {
      if (key in source) {
        result[key] = source[key];
      }
    });
    return result;
  };


  // 행 삭제 
  const rowDelete = async(cellInfo) =>{
    console.log("cellInfo", cellInfo)
    const gridInstance = dataGridRef.current.instance;
    const rowIndex = gridInstance.getRowIndexByKey(cellInfo.data[json.keyColumn]); 
    if (rowIndex >= 0) {
      const paramInfo = cellInfo.data;
      const paramInfoNew = pick(paramInfo, json.pkColumns); 
      const param = [
        { tbNm: json.table },
        paramInfoNew
      ];
      
      try {
        const response = await ApiRequest("/boot/common/commonDelete", param); 
          if(response > 0) {
            handleOpen('데이터가 성공적으로 삭제되었습니다.');
            handleCancel();
            console.log(response)
          }
      }catch (error) {
        console.error(error);
      }               
    }

  }

  //행 삭제 렌더 
  const onCellRenderDelete = (cellInfo) => {
    return (
      <Button 
        onClick={()=>handleOpen("삭제하시겠습니까?", ()=>rowDelete(cellInfo))}
        text="삭제"
      />
    );
  };

  const handleAddRow = () => {
    showPopup();
  };

  //취소버튼 클릭시
  const handleCancel = () => {
    navigate("../project/ProjectChange",
        {
    state: { prjctId: prjctId, 
            bgtMngOdrTobe: bgtMngOdrTobe,
            bgtMngOdr: bgtMngOdr,
            ctrtYmd: ctrtYmd, 
            stbleEndYmd: stbleEndYmd, 
            deptId : deptId,  
            targetOdr : targetOdr,
            bizSttsCd : bizSttsCd,
            atrzLnSn : atrzLnSn
            },
    })
  };

  /* 데이터 그리드 컬럼 랜더 */
  const gridRows = () => {
    const result = [];

    columns.map((column) => {
      result.push(
        <Column
          key={column.key}
          dataField={column.key}
          caption={column.value}
          alignment={"center"}
          fixed={true}
          dataType={column.subType ==="NumberBox" ? "number" : 
                    column.subType ==="Date" ? "date" :
                     "string"}
          format={column.subType === "Date" ? "yyyy-MM-dd" : 
                  column.subType === "NumberBox" ? column.format :
                  ""}
        ></Column>     
      );
    });

    period.map((periodItem, index) => {
      result.push(
        <Column
          key={index}
          dataField={periodItem}
          caption={periodItem}
          alignment={"center"}
          fixed={false}
          format={json.popupNumberBoxFormat}
        ></Column>
      );
    });

    editColumn.map((column) => {
      result.push(
        <Column
          key={column}
          dataField={column}
          caption={column}
          alignment={"center"}
          cellRender={
            column === "수정"
              ? (cellData) => onCellRenderEdit(cellData)
              : (cellData) => onCellRenderDelete(cellData)
          }
          fixed={true}
          fixedPosition="right"
        ></Column>  
      );
    });
    
    return result;
  };

  return (
    <div className="">
      <DataGrid
        ref={dataGridRef}
        keyExpr={json.keyColumn}
        id={"dataGrid"}
        dataSource={values}
        showBorders={true}
        showColumnLines={true}
        focusedRowEnabled={false}
        columnAutoWidth={true}
        // width="100%"
        sorting={{ mode: "none" }}
        scrolling={{ mode: 'virtual' }} // 스크롤 모드 설정
        noDataText="No data"
        onCellPrepared={(e) => {
          if (e.rowType === "header") {
            e.cellElement.style.textAlign = "center";
            e.cellElement.style.fontWeight = "bold";
          }
        }}
        wordWrapEnabled={true}
        
      >
        {gridRows()}
        <SearchPanel
          visible={true}
          highlightCaseSensitive={true}
          placeholder="자유롭게 입력하세요"
          width="100%"
        />
        {/* <Scrolling columnRenderingMode="standard" /> */}
        <Summary>
          {summaryColumns.map((item) => (
            <TotalItem
              key={item.key}
              column={item.value}
              summaryType={item.type}
              displayFormat={item.format}
              valueFormat={{ type: "fixedPoint", precision: json.precision }} // 천 단위 구분자 설정
            />
          ))}
        </Summary>
        <ColumnFixing enabled={true} />
      </DataGrid>

      <Popup width={json.popup.width}
             height={json.popup.height}
             visible={isPopupVisible} 
             onHiding={hidePopup}
             showCloseButton={true}
             title={json.popup.title}
             >
        <ProjectChangePopup 
          selectedItem={selectedItem} 
          period={period} 
          popupInfo={json} 
          prjctId={prjctId} 
          bgtMngOdrTobe={bgtMngOdrTobe}
          bgtMngOdr={bgtMngOdr}
          ctrtYmd={ctrtYmd}
          stbleEndYmd={stbleEndYmd}
          transformedData={transformedData}
          deptId={deptId}
          targetOdr={targetOdr}
          bizSttsCd={bizSttsCd}
          atrzLnSn={atrzLnSn}
          />
       </Popup>

      <div style={{ textAlign: "right" }}>
        <Button onClick={handleAddRow}>{json.AddRowBtn}</Button>
      </div>
    </div>
  );
};

export default CustomCostTable;
