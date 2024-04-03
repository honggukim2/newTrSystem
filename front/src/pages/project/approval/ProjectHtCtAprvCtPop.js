import React from 'react';

import Scheduler from 'devextreme-react/scheduler';

const ProjectHrCtAprvCtPop = ({props, prjctNm, data, currentDate, setCurrentDate}) => {

    const showDetails = () => {

        const results = [];

        props.map((data) => {
            results.push(
                <>
                <hr/>
                <table>
                    <thead>
                        <tr>
                            <th>{data.startDate}({data.ctPrpos})</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>사용금액: {data.utztnAmt} 원</td>
                        </tr>
                        <tr>
                            <td>상세내역(목적): {data.ctPrpos}</td>
                        </tr>
                        <tr>
                            <td>용도(참석자명단): {data.atdrn}</td>
                        </tr>
                        <tr>
                            <td>사용처: {data.useOffic} | 결재정보: {data.atrzDmndSttsCd}</td>
                        </tr>
                    </tbody>
                </table>
                </>
            )
        });

        return results;

    }


    return (
        <div className="container">
            <div className="" style={{ marginBottom: "10px" }}>
                <>
                    <span>* {prjctNm} ({data.aplySn} 차수) 프로젝트 비용 </span>
                    <br/>
                    <span>* {data.empFlnm}</span>
                </> 
            </div>
            <Scheduler
                timeZone="Asia/Seoul"
                dataSource={props}
                defaultCurrentView="month"
                currentDate={currentDate}
                editing={false}
                views={["month"]}
                descriptionExpr='ctPrpos'
                onOptionChanged={e => {
                    if (e.name === "currentDate") {
                        setCurrentDate(e.value);
                    }
                }}
            >
            </Scheduler>
            <br/>
            {showDetails()}
        </div>
    );

}
export default ProjectHrCtAprvCtPop;