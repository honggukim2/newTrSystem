import React, { useEffect, useState } from "react";
import { addMonths, subMonths } from 'date-fns';
import PivotGrid, {
  FieldChooser,
  FieldPanel,
  Scrolling,
} from "devextreme-react/pivot-grid";
import PivotGridDataSource from "devextreme/ui/pivot_grid/data_source";
import ApiRequest from "../../../utils/ApiRequest";

import ProjectGeneralBudgetCostSearchJson from "./ProjectGeneralBudgetCostSearchJson.json";
import {useLocation} from "react-router-dom";
import {add, format} from "date-fns";

const ProjectControlBudgetCostSearch = ({prjctId}) => {
  const location = useLocation();
  // const prjctId = location.state.prjctId;

  const ctrtYmdBefore= new Date(location.state.ctrtYmd);
  const stbleEndYmdBefore = new Date(location.state.stbleEndYmd);

  const ctrtYmd = subMonths(ctrtYmdBefore, 1);
  const stbleEndYmd = addMonths(stbleEndYmdBefore, 1);

  const bgtMngOdr = location.state.bgtMngOdr;

  const [pivotGridConfig, setPivotGridConfig] = useState({
    fields: ProjectGeneralBudgetCostSearchJson,
    store: [],
  });

  useEffect(() => {
      Cnsrtm();
  }, []);

  const param = {
    queryId: "projectMapper.retrieveProjectGeneralBudgetCostSearch",
    prjctId: prjctId,
    costFlag: "control",
    ctrtYmd:ctrtYmd,
    stbleEndYmd:stbleEndYmd,
    bgtMngOdr:bgtMngOdr
  };

  const Cnsrtm = async () => {
    try {
      const response = await ApiRequest("/boot/prjct/retrievePjrctCost", param);
      setPivotGridConfig({
        ...pivotGridConfig,
        store: response,
      });
    } catch (error) {
      console.error(error);
    }
  };


  const dataSource = new PivotGridDataSource(pivotGridConfig);

  return (
    <div style={{ margin: "30px" }}>
      <PivotGrid
        dataSource={dataSource}
        allowSortingBySummary={true}
        height={560}
        showBorders={true}
        showColumnGrandTotals={true}
        allowFiltering={false}
        allowSorting={false}
        allowExpandAll={false}
        showTotalsPrior={'columns'} // "none", "rows", "columns", "both" 중 하나를 선택
      >
        <FieldPanel
          showRowFields={true}
          visible={true}
          showTotals={false}
          showColumnFields={false}
          showDataFields={false}
          showFilterFields={false}
          allowFieldDragging={false}
        />

        <FieldChooser enabled={false} />
        <Scrolling mode="virtual" />
      </PivotGrid>
    </div>
  );
};

export default ProjectControlBudgetCostSearch;
