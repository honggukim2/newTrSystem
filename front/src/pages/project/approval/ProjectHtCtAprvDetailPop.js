import React, { useEffect, useState } from 'react';
import ApiRequest from 'utils/ApiRequest';
import { set } from 'date-fns';

import Scheduler, { Resource } from 'devextreme-react/scheduler';

const ProjectHrCtAprvDetailPop = ({props, prjctNm, data}) => {


    const currentDate = new Date();

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
                            <td>사용처: {data.useOffic} | 결재정보_수정예정</td>
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
                {props.length > 0 &&
                <>
                <span>* {prjctNm} ({props[0].aplySn} 차수) 프로젝트 비용 </span>
                <br/>
                <span>* {props[0].empFlnm}</span>
                </> 
                }
            </div>
            <Scheduler
                timeZone="Asia/Seoul"
                dataSource={props}
                defaultCurrentView="month"
                defaultCurrentDate={currentDate}
                editing={false}
                views={["month"]}
            >
            </Scheduler>
            <br/>
            {showDetails()}
        </div>
    );

}
export default ProjectHrCtAprvDetailPop;