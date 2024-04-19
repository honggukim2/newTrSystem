import React, { useCallback, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { Button, TabPanel } from "devextreme-react";
import ProjectExpenseJson from "./ProjectExpenseJson.json"
import CustomEditTable from "../../components/unit/CustomEditTable";
import ApiRequest from "../../utils/ApiRequest";

const ProjectExpense = () => {
    const navigate = useNavigate();
    const { ExpenseInfo, keyColumn, ctAplyTableColumns, elcKeyColumn, columnCharge, buttonsConfig,
            aplyAndAtrzCtQueryId, dmndSttsQueryId } = ProjectExpenseJson.ProjectExpenseMain;
    const [index, setIndex] = useState(0);
    const [atrzDmndSttsCnt, setAtrzDmndSttsCnt] = useState({}); // 상태코드별 데이터 개수
    const [ctAply, setCtAply] = useState([]); // 차수 청구내역 (table1)
    const [ctAtrz, setCtAtrz] = useState([]); // 전자결재 청구내역 (table2)
    const [changeColumn, setChangeColumne] = useState([]); // 결재상태 컬럼 -> 버튼렌더를 위해 필요
    const [mmAplyCnt, setMmAplyCnt] = useState(); // 비용 청구 건수 (없을 시 근무시간 먼저)
    const [ctAtrzCmptnYn, setCtAtrzCmptnYn] = useState(null); // 비용결재완료여부
    const [cookies] = useCookies([]);
    const empId = cookies.userInfo.empId;
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getDate() > 15 ? date.getMonth() + 1 : date.getMonth();
    const monthVal = month < 10 ? "0" + month : month;
    const aplyYm = year + monthVal;
    const aplyOdr = date.getDate() > 15 ? "1" : "2";

    const itemTitleRender = (a) => <span>{a.TabName}</span>;
    const onSelectionChanged = useCallback(
        (args) => {
            if (args.name === "selectedIndex") setIndex(args.value);
        }, [setIndex]
    );

    useEffect(() => { getData(); }, []);

    useEffect(() => {
        const columns = atrzDmndSttsCnt.ctReg > 0 ? 'ctAplyBtnColumns' : 'ctAplyStrColumns';
        setChangeColumne(ctAplyTableColumns.concat(ProjectExpenseJson.ProjectExpenseMain[columns]))
    }, [atrzDmndSttsCnt]);

    const getData = async () => {
        const apiInfo = [
            { url: "commonSelect", param: [{ tbNm: "PRJCT_INDVDL_CT_MM" }, { empId, aplyYm, aplyOdr }], setter: setCtAtrzCmptnData },
            { url: "queryIdSearch", param: { queryId: aplyAndAtrzCtQueryId, empId, aplyYm, aplyOdr }, setter: setCtAply }, // 비용 청구내역
            { url: "queryIdSearch", param: { queryId: aplyAndAtrzCtQueryId, empId, aplyYm, aplyOdr, atrz: 'atrz' }, setter: setCtAtrz }, // 전자결재 내역
            { url: "queryIdSearch", param: { queryId: dmndSttsQueryId, empId, aplyYm, aplyOdr }, setter: setCtAtrzDmndSttsData } // 결재요청상태코드별 건수
        ];
        const promises = apiInfo.map(api => ApiRequest(`/boot/common/${api.url}`, api.param));
        const results = await Promise.all(promises);

        results.forEach((result, index) => {
            apiInfo[index].setter(result);
        });
    };

    const setCtAtrzCmptnData = (data) => {
        if (data.length !== 0) setCtAtrzCmptnYn(data[0].ctAtrzCmptnYn); // 비용결재 완료여부
        else setMmAplyCnt(data.length); // 비용청구 건수
    };

    const setCtAtrzDmndSttsData = (data) => {
        setAtrzDmndSttsCnt(data[0]);
    };

    const prjctCtAtrzUpdate = async (data) => {
        const param = {
            queryId: "indvdlClmMapper.updatePrjctCtAtrzStts",
            state: "UPDATE",
            actionType: data.actionType, // PRJCT_CT_ATRZ : 결재요청상태 update (입력마감 / 승인요청)
            empId, aplyYm, aplyOdr
        };
        const response = await ApiRequest("/boot/common/queryIdDataControl", param);
        if (response !== 0) {
            getData();
            alert(data.completeMsg);
        }
    };

    const onClickAction = async (onClick) => {
        if (window.confirm(onClick.msg)) {
            if (onClick.name === 'onInptDdlnClick' && mmAplyCnt === 0) {
                alert('경비청구 건수가 없을 경우 근무시간을 먼저 승인 요청 해주시기 바랍니다.');
                return;
            }
            prjctCtAtrzUpdate(onClick);
        }
        // print
    };

    const getButtonsShow = () => {
        if (ctAtrzCmptnYn === 'N' && (atrzDmndSttsCnt.aprvDmnd > 0 || atrzDmndSttsCnt.rjct > 0)) return buttonsConfig.hasApprovals;
        if (ctAtrzCmptnYn === 'N' && atrzDmndSttsCnt.inptDdln > 0) return buttonsConfig.noApprovals;
        if (ctAtrzCmptnYn === 'Y') return buttonsConfig.completed;

        return buttonsConfig.default;
    };

    const onBtnClick = async (btn, props) => {
        if (window.confirm("삭제하시겠습니까?")) {
            const param = { prjctId: props.data.prjctId, prjctCtAplySn: props.data.prjctCtAplySn, empId, aplyYm, aplyOdr };
            
            if (btn.name === 'atrzDmndSttsCd') { // aply, atrz, atdrn row삭제
                const tables = ["PRJCT_CT_ATRZ", "PRJCT_CT_APLY", "PRJCT_CT_ATDRN" ];
                const deleteRow = tables.map(tbNm => ApiRequest("/boot/common/commonDelete", [{ tbNm }, param]));

                Promise.all(deleteRow).then(responses => {
                    if (responses.every(response => response === 1)) {
                        window.alert("삭제되었습니다.");
                        getData();
                    }
                }).catch(error => {
                    console.error("error:", error);
                });
            }
        }
    }

    const RenderTopTable = ({ title, keyColumn, columns, values }) => {
        return (
            <div style={{ marginBottom: '20px' }}>
                <p>{title}</p>
                <CustomEditTable
                    noEdit={true}
                    keyColumn={keyColumn}
                    columns={columns}
                    values={values}
                    paging={true}
                    pageSize={10}
                    onBtnClick={onBtnClick}
                    noDataText={'데이터가 없습니다.'}
                />
            </div>
        );
    };

    return (
        <div className="container">
            <div>
                <div className="mx-auto" style={{ display: 'flex', marginTop: "20px", marginBottom: "30px" }}>
                    <h1 style={{ fontSize: "30px", marginRight: "20px" }}>프로젝트비용</h1>
                    {getButtonsShow().map(({ onClick, text, type }, index) => (
                        <Button key={index} text={text} type={type} onClick={() => onClickAction(onClick)} style={{ marginRight: '5px' }} />))}
                </div>
                <RenderTopTable title={`* ${aplyYm}-${aplyOdr} 차수 TR 청구 내역`} keyColumn={keyColumn} columns={changeColumn} values={ctAply} />
                <RenderTopTable title='* 전자결재 청구 내역' keyColumn={elcKeyColumn} columns={columnCharge} values={ctAtrz} />

                {ctAtrzCmptnYn === 'Y' ? <span style={{ fontSize: "20px", marginLeft: "30px" }}>입력 마감되었습니다.</span>
                : <TabPanel
                    dataSource={ExpenseInfo}
                    selectedIndex={index}
                    onOptionChanged={onSelectionChanged}
                    itemTitleRender={itemTitleRender}
                    animationEnabled={true}
                    height={1500}
                    itemComponent={({ data }) => {
                        const Component = React.lazy(() => import(`${data.url}`));
                        return (
                            <React.Suspense fallback={<div>Loading...</div>}>
                                <Component
                                    empId={empId}
                                    aplyYm={aplyYm}
                                    aplyOdr={aplyOdr}
                                    setIndex={setIndex}
                                    getData={getData}
                                />
                            </React.Suspense>
                        );
                    }} />}
            </div>
        </div>
    );
};
export default ProjectExpense;