import ApiRequest from "../../utils/ApiRequest";

import React, { useEffect, useState } from "react";
import SelectBox from 'devextreme-react/select-box';
import './AutoCompleteProject.css';

// 2024.03.21(박지환)
// return값 추가 (prjctMngrEmpId)
// return값 추가됨에따라 배열로 반환받음

// 2024.04.08(박지환)
// sttsBoolean props 추가 
// 수행중인 프로젝트만 조회

const AutoCompleteProject = ({ placeholderText, onValueChange, sttsBoolean }) => {
  const [suggestionsData, setSuggestionsData] = useState([]);
  const [valid, setValid] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await ApiRequest('/boot/common/queryIdSearch', {queryId: 'commonMapper.autoCompleteProject'});
        const processedData = response.map(({ prjctId, prjctNm, prjctTag, prjctMngrEmpId, bizSttsCd,mngrNm }) => ({
          key: prjctId,
          value: prjctNm,
          prjctTag: prjctTag,
          prjctMngrEmpId: prjctMngrEmpId,
          mngrNm: mngrNm,
          bizSttsCd: bizSttsCd,
        }));

        if(sttsBoolean && sttsBoolean == false){
          setSuggestionsData(processedData);
        } else {
          setSuggestionsData(processedData.filter(item => item.bizSttsCd == "VTW00402"));
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  const handleSelectChange = (e) => {
    const selectedOption = e;

    if (selectedOption) {
      onValueChange(selectedOption);
      setValid(true);
    } else {
      onValueChange("");
      setValid(false);
    }
  };

  const handleBlur = () => {
    setValid(true); // Ensure that the SelectBox is valid after blur
  };

  const ItemTemplate = (item) => {
    return (
        <div className="selectbox-item">
          {item.prjctTag}
        </div>
    );
  };

  return (
    <SelectBox
      id="autoCompleteProject"
      dataSource={suggestionsData}
      valueExpr="key"
      displayExpr="value"
      showClearButton={true}
      // onValueChanged={handleSelectChange(e)}
      onValueChange={(e) => {
        const selectItemValue = [];
        const selectedItem = suggestionsData.find(item => item.key === e);
        if (selectedItem) {
          selectItemValue.push({
            prjctId: selectedItem.key,
            prjctNm: selectedItem.value,
            prjctMngrEmpId: selectedItem.prjctMngrEmpId,
          });
        } else {
          selectItemValue.push({
            prjctId: "",
            prjctNm: "",
            prjctMngrEmpId: "",
          });
        }
        handleSelectChange(selectItemValue)
      }}
      placeholder={placeholderText}
      searchEnabled={true}
      stylingMode="underlined"
      onBlur={handleBlur}
      itemRender={ItemTemplate}
      searchExpr={['value', 'mngrNm']}
      dropDownOptions={{
        position: {
          collision: 'none',
          my: 'top',
          at: 'bottom',
          of: '#autoCompleteProject'
        },
      }}
    />
  );
};

export default AutoCompleteProject;
