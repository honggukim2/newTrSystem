package com.trsystem.elecAtrz.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.trsystem.elecAtrz.domain.ElecAtrzDomain;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class ElecAtrzController {

	/**
	 * 전자결재 테이블에 데이터를 입력한다.
	 * 승인요청 / 임시저장
	 * @param params
	 * @return
	 */
	@PostMapping(value = "/boot/elecAtrz/insertElecAtrz")
	public String insertElecAtrz(@RequestBody Map<String, Object> params) {

		String elctrnAtrzId = ElecAtrzDomain.insertElecAtrz(params);
		
		return elctrnAtrzId;
	}

	// 임시저장 데이터 삭제
	@PostMapping(value = "/boot/elecAtrz/deleteTempAtrz")
	public int deleteTempAtrz(@RequestBody Map<String, Object> params) {
		return ElecAtrzDomain.deleteTempAtrz(String.valueOf(params.get("atrzTySeCd")),
				String.valueOf(params.get("elctrnAtrzId")));
	}
	
	/**
	 * 전자결재 승인 프로세스
	 * @param paramList
	 * @return
	 */
	@PostMapping(value = "/boot/elecAtrz/aprvElecAtrz")
	public Map<String, Object> aprvElecAtrz(@RequestBody List<Map<String, Object>> paramList) {
		
		return ElecAtrzDomain.aprvElecAtrz(paramList);
	}
	
	/**
	 * 청구결재 승인 후 후속처리: 프로젝트 비용에 데이터를 넣어준다.
	 * @param param
	 * @return
	 */
	@PostMapping(value = "/boot/elecAtrz/insertPrjctCt")
	public int insertPrjctCt(@RequestBody Map<String, Object> param) {
		return ElecAtrzDomain.insertPrjctCt(param);
	}
	
	/**
	 * 취소결재용 전자결재 결재선 생성
	 * @param params
	 * @return
	 */
	@PostMapping(value = "/boot/elecAtrz/retrieveRtrcnAtrzLn")
	public List<Map<String, Object>> retrieveRtrcnAtrzLn(@RequestBody Map<String, Object> params) {
		return ElecAtrzDomain.retrieveRtrcnAtrzLn(params);
	}
	
	/**
	 * 결재 취소 혹은 변경결재로 인한 후속조치를 실행
	 * @param params
	 * @return
	 */
	@PostMapping(value = "/boot/elecAtrz/updateHistElctrnAtrz")
	public int updateHistElctrnAtrz(@RequestBody Map<String, Object> params) {
		return ElecAtrzDomain.updateHistElctrnAtrz(params);
	}
	
	/**
	 * 결재 취소 혹은 변경결재 반려 시 관련 문서 롤백
	 * @param params
	 * @return
	 */
	@PostMapping(value = "/boot/elecAtrz/rollbackElctrnAtrz")
	public int rollbackElctrnAtrz(@RequestBody Map<String, Object> params) {
		return ElecAtrzDomain.rollbackElctrnAtrz(params);
	}
}
