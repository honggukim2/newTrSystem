import React, { useState, useEffect } from "react";
import EmpInfoJson from "./EmpInfoJson.json";
import ApiRequest from "utils/ApiRequest";
import { useCookies } from "react-cookie";
import CustomEditTable from "components/unit/CustomEditTable";

const EmpCareer = ({naviEmpId}) => {
  const { queryId, keyColumn, tableColumns, tbNm } = EmpInfoJson.EmpCareer;
  const [cookies] = useCookies(["userInfo", "userAuth"]);

  let userEmpId;

  if(naviEmpId.length !== 0){
    userEmpId = naviEmpId;
  } else {
    userEmpId = cookies.userInfo.empId;
  }

  const doublePk = { nm: "empId", val: userEmpId };
  const [values, setValues] = useState([]);
  
  useEffect(() => {
    pageHandle();
  }, []);

  const pageHandle = async () => {
    try {
      const response = await ApiRequest("/boot/common/queryIdSearch", {
        queryId: queryId, empId: userEmpId
      });
      if (response.length !== 0) setValues(response);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="container" style={{ height: "100%" }}>
      <div className="title p-1" style={{ marginTop: "20px", marginBottom: "10px" }}>
        <h1 style={{ fontSize: "40px" }}>경력</h1>
      </div>
      <div style={{ marginBottom: "20px" }}>
        <CustomEditTable
          tbNm={tbNm}
          values={values}
          keyColumn={keyColumn}
          columns={tableColumns}
          doublePk={doublePk}
          callback={pageHandle}
        />
      </div>
    </div>
  );
};
export default EmpCareer;