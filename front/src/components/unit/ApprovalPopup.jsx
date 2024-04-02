import { useCallback, useEffect, useState } from 'react';
import { Popup, ToolbarItem } from 'devextreme-react/popup';
import CustomEmpComboBox from './CustomEmpComboBox';
import ApiRequest from 'utils/ApiRequest';
import '../../assets/css/Style.css'

const ApprovalPopup = ({ visible, atrzValue, onHiding }) => {
    const [aprvrEmpList, setAprvrEmpList] = useState(atrzValue);
    const [selectedEmp, setSelectedEmp] = useState({});
    const [stepCdList, setStepCdList] = useState([]);
    const tableTitle = ['입력', '결재단계', '결재권자'];
    
    const getCloseButtonOptions = useCallback(
        () => ({
            text: '등록',
            stylingMode: 'outlined',
            type: 'default',
            onClick: () => onHiding(aprvrEmpList),
        }),
        [onHiding]
    );

    useEffect(() => {
        const getAtrzStepCd = async () => {
            try {
                const response = await ApiRequest('/boot/common/commonSelect', [
                    { tbNm: "CD" }, { upCdValue: "VTW007" }
                ]);
                setStepCdList(response);
            } catch (error) {
                console.log('error', error);
            }
        };
        getAtrzStepCd();
    }, []);

    const onEmpChg = (data) => {
        setSelectedEmp(data[0]);
    };

    const onAddEmp = (cdValue) => {
        // 검토 / 확인 / 심사 / 승인에는 한명만
        const oneEmpCase = ['VTW00702', 'VTW00703', 'VTW00704', 'VTW00705'];
        const isOneCase = oneEmpCase.includes(cdValue);
        const hasEmpAlready = aprvrEmpList.some(emp => emp.approvalCode === cdValue);
        const isEmpIdExist = aprvrEmpList.some(emp => emp.empId === selectedEmp.empId && emp.approvalCode === cdValue);
        
        if (!isEmpIdExist) {
            if (isOneCase && hasEmpAlready) {
                alert('검토, 확인, 심사, 승인 단계 결재권자는 한명만 설정할 수 있습니다. 다시 선택해주세요.');
            } else {
                setAprvrEmpList([...aprvrEmpList, { ...selectedEmp, approvalCode: cdValue }]);
            }
        } else {
            alert('이미 해당 결재단계에 등록되어 있습니다.');
        }
    };

    const removeEmp = (empId, approvalCode) => {
        const updatedList = aprvrEmpList.filter(emp => !(emp.empId === empId && emp.approvalCode === approvalCode));
        setAprvrEmpList(updatedList);
    };

    const addAprvrEmpArea = () => {
        return (
            <div>
                <span style={{ color: 'blue' }}>결재자를 선택하거나 검색 후, 추가 버튼을 이용해 결재권자를 설정합니다.</span>
                <CustomEmpComboBox
                    value={selectedEmp.empId}
                    readOnly={false}
                    useEventBoolean={true}
                    showClearButton={true}
                    onValueChange={onEmpChg}
                />
                <div className="atrz-popup-header">
                    {tableTitle.map((item, index) => (
                        <div className="atrz-popup-cell" key={index}>{item}</div>
                    ))}
                </div>

                {stepCdList.map((cd) => (
                    <div className="atrz-popup-row" key={cd.cdValue}>
                        <div className="atrz-popup-cell atrz-popup-button" onClick={() => onAddEmp(cd.cdValue)}>추가</div>
                        <div className="atrz-popup-cell">{cd.cdNm}</div>
                        <div className="atrz-popup-cell">
                            {aprvrEmpList.length !== 0 && aprvrEmpList.filter(emp => emp.approvalCode === cd.cdValue)
                                .map((emp, index) => (
                                    <div className='aprvrEmp' key={index}>
                                        {emp.empFlnm}
                                        <button onClick={() => removeEmp(emp.empId, emp.approvalCode)}
                                        className='popup-delete-btn'>X</button>
                                    </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div>
            <Popup
                height={660}
                visible={visible}
                onHiding={() => onHiding(aprvrEmpList)}
                showCloseButton={true}
                contentRender={addAprvrEmpArea}
                title="* 결재선지정"
            >
                <ToolbarItem
                    widget="dxButton"
                    toolbar="bottom"
                    location="center"
                    options={getCloseButtonOptions()}
                />
            </Popup>
        </div>
    );
}
export default ApprovalPopup;