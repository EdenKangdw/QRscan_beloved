var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken')
var secretObj = require('../config/jwt')

var mysql_dbc = require('../model/db/db_conn')();
var connection = mysql_dbc.init();

router.get('/', function (req, res, next) {
	console.log('work');
	res.sendFile(path.join(__dirname, '../public', 'index.html'))
	console.log("1e232323");
  });

// model 

function resModel() {
	return {
		success: Boolean,
		error: String,
		data: String
	}
}

function userModel(userVal, checkStatus, Boolean) {
	return new Promise((resolve, reject) => {
		let data = {
			id: userVal.ssm_id ? userVal.ssm_id : "fail",
			pw: userVal.ssm_pw ? userVal.ssm_pw : "fail",
			ssm_seq: userVal.ssm_seq ? userVal.ssm_seq : "fail",
			ssm_group: userVal.ssm_group ? userVal.ssm_group : '0',
			ssm_name: userVal.ssm_name ? userVal.ssm_name : 'none',
			grp_seq : userVal.grp_seq ? userVal.grp_seq : '0',
			isTodayApply: checkStatus.chk_isApply ? checkStatus.chk_isApply : 'none',
			isTodayCheck: checkStatus.chk_isCheck ? checkStatus.chk_isCheck : 'none',
			leader: userVal.ssm_tmldr ? userVal.ssm_tmldr : "n",
			eventSeq: checkStatus.evt_seq ? checkStatus.evt_seq : "n",
			ok: Boolean ? Boolean : false
		};
		resolve(data)

	})
}

function checkModel(userVal, eventVal) {
	return new Promise(function (resolve, reject) {
		let data = {
			ssm_seq: userVal.ssm_seq ? userVal.ssm_seq : "n",
			ssm_name: userVal.ssm_name ? userVal.ssm_name : "n",
			evt_seq: eventVal.evt_seq ? eventVal.evt_seq : "n",
			evt_name: eventVal.evt_name ? eventVal.evt_name : "n",
			isTodayApply: "n",
			istodayCheck: "n"
		}
		resolve(data)
	})
}

arrangeModel = (checkVal, teamList) => {
	return new Promise((resolve, reject) => {
		let data = {

		}
	})
}


function teamModel(count, group) {
	return {
		team: count % group ? count % group : 0
	};
}






// 회원의 상태값 가져오는 함수 
function statusModel(todayModel) {
	var query =
		`select * from ssm_check where ssm_seq=${todayModel.ssm_seq} and evt_seq=${todayModel.evt_seq}`
	return new Promise((resolve, reject) => {
		connection.query(query, function (err, result) {
			if (err) {
				console.log('statusModel Error: ', err)
				reject(err)
				throw err
			} else if (result != "") {
				// 데이터가 있을 때, 
				let data = result
				console.log('Status :', data)
				resolve(data)
			} else {
				// 체크 데이터가 없을때 
				const userQuery = `select * from ssm_member where ssm_seq='${todayModel.ssm_seq}'`
				connection.query(userQuery, (err2, result2) => {
					if (err2) {
						console.log("err2 :", err2)
						reject(err2)
					} else {
						let data2 = result2
						console.log('Status2 :', data2)
						resolve(data2)
					}

				})

			}
		})
	})
}



// router
// 토큰값을 userModel로 변경하여 처리하기 

// 로그인해서 token 받기 
router.post('/login', function (req, res) {
	var id = req.body.id
	var pw = req.body.pw
	var query = `select * from ssm_member where ssm_id='${id}'`;
	console.log(`login ${id} and ${pw}`)
	console.log(typeof id)
	connection.query(query, function (err, result) {
		if (err) {
			console.log(err)
			throw err;
		} else {
			console.log(typeof result, result.length, result)
			console.log('user DATA: ', result[0])
			if (result[0]) {
				if (id === result[0].ssm_id && pw === result[0].ssm_pw) {
					// 정상적으로 로그인하는 경우
					const userInfo = result[0]
					// 로그인에 쓰일 토큰을 생성한다 
					var token = jwt.sign({ data: userInfo }, secretObj.secret, { expiresIn: '5m' })
					console.log("CREATE TOKEN :", token)
					res.send(token)
				} else {
					// 로그인 정보가 달라 실패한 경우
					res.send("fail")
				}
			}
			else {
				// 로그인 정보가 달라 실패한 경우
				res.send("fail")
			}
		}
	})
})

router.get('/user/info', (req, res) => {
	// 토큰이 있는지 확인 
	let token = req.headers['access-token'] || req.query.token
	let decoded = jwt.decode(token, secretObj.secret)

	console.log("request Token :", token)
	console.log("DECODED INFO", decoded)
	if (decoded) {
		// 토큰이 있을경우 접속허가 
		getEventToday(decoded)
			.then(function (todayModel) {
				console.log('dddddddd', todayModel)
				statusModel(todayModel)
					.then((checkStatus) => {
						console.log('this is status:', checkStatus[0].chk_isApply)
						switch (checkStatus[0].cxhk_isApply) {
							case 'y':
								// 사역 신청을 한 경우
								userModel(decoded.data, checkStatus[0], true)
									.then((user) => {
										console.log('success, today : Ok ', user)
										res.send(user)
									})
								break

							case 'n':
								// 사역신청을 안한 경우
								userModel(decoded.data, checkStatus[0], true)
									.then((user) => {
										console.log('success, today : NO ', user)
										res.send(user)
									})
								break

							default:
								// 처음 로그인을 하는 경우
								userModel(decoded.data, todayModel, true)
									.then(user => {
										console.log('success, first login', user)
										res.send(user)
									})
								break



						}

					})

					.catch((err) => {
						console.log('ERROR: ', err)
					})
			}).catch((err) => {
				console.log('Error :', err)
			})
	} else {
		alert("시간이 만료되어 로그인이 해제되었습니다. 다시 로그인해주세요.")
		res.send(false)
	}


})


var count = 0
router.post('/count', function (req, res) {
	// today 테이블에 count 값을 증가시킨다. 
	count++
	var query = `update ssm_today set tdy_count=${count}`
	connection.query(query, function (err, result) {
		var data = resModel()
		if (err) {
			console.log(query, err)
			throw err
		} else {
			console.log(typeof result, result.length, result)
			console.log("insert success")
			data.success = true
			res.send(data)
		}

	})


})

function updateTeam(group, id) {
	var query = `update ssm_member set ssm_group=${group} where ssm_id='${id}'`
	connection.query(query, function (err, result) {
		if (err) {
			console.log(err)
			throw err
		} else {
			console.log('updateTeam : complete', query)
			return true
		}
	})

}


function enrollEvent(evt) {
	// (서버)이벤트등록 : 오늘의 이벤트로 새로운 이벤트를 추가하여 출석체크 할 수 있도록 함, 식별자는 isToday = y,n
	var query = `insert into ssm_event(evt_name, evt_date, evt_kind, evt_today)`
	query += `values('${evt.evt_name}', now(), '${evt.evt_kind}', 'y')`
	console.log('insert: todayEvent', query)
	connection.query(query, function (err, result) {
		if (err) {
			console.log(err)
			throw err
		} else {
			console.log('insert: today event success', query)
		}
	})
}

// 오늘의 이벤트 정보 가져오기 
function getEventToday(userVal) {
	// 오늘의 이벤트 정보를 가져온다 
	var query = `select * from ssm_event where evt_today = 'y'`
	return new Promise(function (resolve, reject) {
		connection.query(query, function (err, result) {
			if (err) {
				console.log(err)
				reject(new Error(err))
				throw err
			} else {
				console.log("TODAY EVENT : ", result[0])
				console.log('USER : ', userVal)
				// 체크모델 만들기  
				checkModel(userVal.data, result[0])
					.then(function (todayModel) {
						console.log("오늘의 이벤트: ", todayModel)
						resolve(todayModel)
					})
			}
		})
	})
}

function checkToday(userSeq, evtSeq) {
	// 특정 유저가 사역신청을 했는지 여부를 받아오는 함수
	var query = `select * from ssm_check where ssm_seq='${userSeq}'`
	query += `and evt_seq = '${evtSeq}'`
	return new Promise(function (resolve, reject) {
		connection.query(query, function (err, result) {
			if (err) {
				console.log(err)
				reject(new Error(err))
				throw err
			} else {
				var data = checkModel(userVal, result[0])
				console.log("오늘의 이벤트: ", data)
				resolve(data)
			}
		})

	}

	)
}

router.get('/today', function (req, res) {
	let token = req.headers['access-token'] || req.query.token
	let decoded = jwt.decode(token, secretObj.secret)

	if (decoded != null) {
		var user = decoded.data
		console.log('vue-user', user)
		var result = resModel()
		getEventToday(user).then(function (data) {
			result.success = true
			result.data = data
			console.log('todayData 1:', result)
			res.send(result)
		}).catch(function (err) {
			result.error = err
			console.log(result)
		})

	}

})

// 기존 신청 여부 확인
function getApplyCheckModel(userSeq, evtSeq) {
	return new Promise(function (resolve, reject) {
		var query = `select * from ssm_check where ssm_seq = '${userSeq}' and evt_seq = '${evtSeq} order by CRDT desc'`
		connection.query(query, function (err, res) {
			var result = resModel()
			if (err) {
				result.error = err
				reject(new Error(err))
			} else if (res.length != 0) {
				let data = {
					isExist: true,
					isTodayApplied: res[0].chk_isApply,
					isTodayChecked: res[0].chk_isCheck
				}
				console.log('확인', data)
				resolve(data)
			} else {
				resolve(false)
			}
		})
	})


}


router.post('/check', function (req, res) {
	// (클라이언트)사역신청 & 출석체크 : 이미 지정된 이벤트에 대해 insert로 사역신청, isToday가 있을 경우 update로 출석체크
	let token = req.headers['access-token'] || req.query.token
	let decoded = jwt.decode(token, secretObj.secret)

	console.log('check token', token)
	console.log('CHECK USER :', decoded.data)

	if (decoded != null) {
		let { ssm_seq, ssm_name, ssm_team } = decoded.data
		let evt_seq = req.body.evt_seq

		// boolean
		let isTodayCheck = req.body.isTodayCheck
		let isTodayApply = req.body.isTodayApply

		// 기존 신청 이력이 있는지 확인하기, 없으면 사역신청, 있으면 출석체크 
		getApplyCheckModel(ssm_seq, evt_seq)
			.then(function (checkModel) {
				console.log('CHECK MODEL : ', checkModel.isTodayApplied)
				switch (checkModel.isTodayApplied) {
					case 'y':
						// 출석체크 update
						let checkQuery = `update ssm_check set chk_isCheck = 'y', updt = now() where ssm_seq = '${ssm_seq}' `
						checkQuery += `and evt_seq = ${evt_seq} and ssm_team = ${ssm_team}`
						console.log('출석체크 1 : ', checkQuery)
						connection.query(checkQuery, function (err) {
							var data = resModel()
							if (err) {
								console.log(err)
								data.error = err
								res.send(data)
								throw err
							} else {
								console.log('출석체크 2 : 성공')
								data.success = true
								res.send(data)
							}
						})
						break

					case 'n':
						// 재사역신청 update
						let applyQuery = `update ssm_check set chk_isApply = 'y', updt = now() where ssm_seq = '${ssm_seq}' `
						applyQuery += `and evt_seq = ${evt_seq} and ssm_team = ${ssm_team}`
						console.log('재사역신청 1 : ', applyQuery)
						connection.query(applyQuery, function (err) {
							var data = resModel()
							if (err) {
								console.log(err)
								data.error = err
								res.send(data)
								throw err
							} else {
								console.log('출석체크 2 : 성공')
								data.success = true
								res.send(data)
							}
						})
						break

					default:
						// 사역신청 
						var query = `insert into ssm_check(ssm_seq, ssm_name, ssm_team, evt_seq, evt_name, chk_isApply, chk_isCheck)`
						query += ` values(${ssm_seq}, '${ssm_name}', ${ssm_team} ,${evt_seq}, 'null', 'y', 'n')`
						console.log('insert query', query)
						connection.query(query, function (err) {
							var data = resModel()
							if (err) {
								console.log(err)
								data.error = err
								res.send(data)
								throw err
							} else {
								console.log('insert: 사역신청 완료')
								data.success = true
								res.send(data)
							}
						})
				}
			})

			.catch(function (err) {
				res.send(err)
				console.log(err)
			})

	}


})



router.post('/cancelCheck', function (req, res) {
	// 사역신청 취소하기
	let token = req.headers['access-token'] || req.body.token
	let decoded = jwt.decode(token, secretObj.secret)
	console.log('CANCEL TOKEN', token)
	let evt_seq = req.body.evt_seq
	let { ssm_seq, ssm_team } = decoded.data

	if (decoded != null) {
		getApplyCheckModel(ssm_seq, evt_seq)
			.then(function (checkModel) {
				console.log('data', checkModel.isTodayChecked)
				switch (checkModel.isTodayChecked) {
					case 'y':
						// 출석취소 update
						let checkQuery = `update ssm_check set chk_isCheck = 'n', updt = now() where ssm_seq = '${ssm_seq}' `
						checkQuery += `and evt_seq = ${evt_seq} and ssm_team = ${ssm_team}`
						console.log('출석취소 1 : ', checkQuery)
						connection.query(checkQuery, function (err) {
							var data = resModel()
							if (err) {
								console.log(err)
								data.error = err
								res.send(data)
								throw err
							} else {
								console.log('출석취소 2 : 성공')
								data.success = true
								res.send(data)
							}
						})
						break

					case 'n':
						// 사역취소 update
						let applyQuery = `update ssm_check set chk_isApply = 'n', updt = now() where ssm_seq = '${ssm_seq}' `
						applyQuery += `and evt_seq = ${evt_seq} and ssm_team = ${ssm_team}`
						console.log('재사역신청 1 : ', applyQuery)
						connection.query(applyQuery, function (err) {
							var data = resModel()
							if (err) {
								console.log(err)
								data.error = err
								res.send(data)
								throw err
							} else {
								console.log('사역취소 2 : 성공')
								data.success = true
								res.send(data)
							}
						})
						break
				}
			})
	} else {
		var data = resModel()
		data.error = 'we cannot find correct access token. Please check your token again'
		data.success = false
		res.send(data)

	}
})

router.post('/group', function (req, res) {
	// today에 저장된 count값을 가져와 %로 계산해서 팀 배정 
	var id = req.body.ssm_id
	var groupCnt = req.body.group
	var query = `select * from ssm_today`
	console.log('makeGroup :', query)
	connection.query(query, function (err, result) {
		if (err) {
			console.log(err)
			throw err
		} else {
			var group = teamModel(result[0].tdy_count, groupCnt)
			console.log('당신은 ', group, '입니다')
			updateTeam(group.team, id)
			console.log('팀 배정 완료')
			res.send(success())
		}
	})
})
// 아이디 중복체크
router.post('/checkid', (req, res) => {
	let id = req.body.id
	var query = `select * from ssm_member where ssm_id = '${id}'`
	connection.query(query, (err, result) => {
		if (err) {
			console.log(err)
			throw err
		} else {
			let data = resModel()
			if (result.length != 0) {
				data.success = 'fail'
				data.data = false
				res.send(data)
			} else {
				data.success = 'true'
				data.data = true
				res.send(data)
			}
		}
	})
})


router.post('/signup', function (req, res) {
	console.log('REQ : data', req.body)
	var query = `insert into ssm_member(ssm_name, ssm_id, ssm_pw, ssm_phone, ssm_gen, ssm_type, ssm_team, ssm_group, ssm_level) values `
	query += `('${req.body.ssm_name}','${req.body.ssm_id}','${req.body.ssm_pw}','${req.body.ssm_phone}',`
	query += `'${req.body.ssm_gen}','${req.body.ssm_type}','${req.body.ssm_team}', 0, 'E')`;
	console.log(query)
	connection.query(query, function (err, result) {
		console.log('insert1')
		if (err) {
			console.log(err)
			throw err;
		} else {
			console.log('success insert')
		}
	})


});


// 팀배정용_배정 가능 팀 목록 조회
router.get('/team/list/leader', (req, res) => {
	let token = req.headers['access-token'] || req.query.token
	let decoded = jwt.decode(token, secretObj.secret)

	if (decoded) {
		let team = decoded.data.ssm_team
		const query = `select * from ssm_team where tm_number = ${team}`
		connection.query(query, function (err, result) {
			var data = resModel()
			if (err) {
				console.log(err)
				data.success = false
				data.error = err
				throw err
			} else if (result[0] != null) {
				// 우리팀에 신청한 사람이 있을 때
				data.success = true
				data.data = result[0].tm_teamList
				console.log('TEAM : ', data.data, typeof data.data)
				res.send(data)
			} else {
				// 우리팀에 신청한 사람이 없을 때 
				data.success = true
				data.data = 'none'
				console.log('TEAM : ', data.data, typeof data.data)
				res.send(data)
			}
		})

	} else {
		var data = resModel()
		data.error = `ERROR: we couldn't get vaild token`
		res.send(data)
	}
}),

// 유저용_팀리스트 조회
router.get('/team/list', (req, res) => {
	let token = req.headers['access-token'] || req.query.token
	let decoded = jwt.decode(token, secretObj.secret)

	if(decoded) {
		let grp_seq = decoded.data.grp_seq
		console.log(';lllllllll')
		const query = `select ssm_seq ,ssm_name, ssm_grptype from ssm_member where grp_seq = '${grp_seq}'`

		connection.query(query, async (err, result) => {
			let data = resModel()
			if (err) {
				console.log(err)
				data.success = false
				data.error = err
				throw err
			} else {
				data.success = true
				console.log('teamDATA :', result)
				let teamData = await result.sort(teamOrder)
				console.log(teamData, "datateam")
				data.data = teamData
				res.send(data)
			}
		})
	}
})

const teamOrder = (a,b) => {
	// data에 null이 있으면 sort 작동안함
	console.log(a.ssm_grptype, "type")
	return a.ssm_grptype < b.ssm_grptype ? -1 : a.ssm_grptype > b.ssm_grptype ? 1 : 0
	

}



	// 팀배정용_사역신청자 리스트 조회
	router.get('/team/applied', (req, res) => {
		let token = req.headers['access-token'] || req.query.token
		let decoded = jwt.decode(token, secretObj.secret)

		if (decoded) {
			let ssm_team = decoded.data.ssm_team
			let ssm_seq = decoded.data.ssm_seq
			const query = `select * from ssm_check where ssm_team = ${ssm_team} and chk_isApply = 'y' and ssm_seq <> ${ssm_seq}`

			connection.query(query, function (err, result) {
				var data = resModel()
				if (err) {
					console.log(err)
					data.success = false
					data.error = err
					throw err
				} else {
					data.success = true
					data.data = result
					res.send(data)
				}
			})


		}
		else {
			var data = resModel()
			data.error = 'ERROR: we couldnt get token'
			res.send(data)

		}
	})

// 팀배정하기 

router.post('/team/arrange', function (req, res) {
	console.log('ARRANGE')
	let token = req.headers['access-token'] || req.body.token
	let decoded = jwt.decode(token, secretObj.secret)
	console.log('DECODE :', decoded)
	console.log('parameter :', decoded.data.ssm_tmldr)
	if (decoded) {
		let editTeam = req.body.editTeam
		console.log(typeof editTeam)
		let evt_seq = req.body.evt_seq
		console.log('eventCode', evt_seq)
		console.log('EDIT TEAM :', editTeam[0].ssm_group)
		for (var i = 0; i < editTeam.length; i++) {
			const updateQuery = `update ssm_check set ssm_group ='${editTeam[i].ssm_group}', updt = now() where ssm_seq='${editTeam[i].id}' and evt_seq ='${evt_seq}'`
			connection.query(updateQuery, (err, result) => {
				console.log('EDIT TEAM')
				if (err) {
					console.log(err)
					throw err
				} else {
					console.log('success update', i)
				}
			})
		}


	} else {
		var query = `insert into ssm_member(ssm_name, ssm_id, ssm_pw, ssm_phone, ssm_gen, ssm_type, ssm_team) values `
		query += `('${req.body.ssm_name}','${req.body.ssm_id}','${req.body.ssm_pw}','${req.body.ssm_phone}',`
		query += `'${req.body.ssm_gen}','${req.body.ssm_type}','${req.body.ssm_team}')`;
		console.log(query)
		connection.query(query, function (err, result) {
			console.log('insert1')
			if (err) {
				console.log(err)
				throw err;
			} else {
				console.log('success insert')
			}
		})
	}


});







module.exports = router; 