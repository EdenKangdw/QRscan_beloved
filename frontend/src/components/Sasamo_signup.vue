<template lang="html">
<div class="row">
	<div class="total_container">
  	<h2 style="margin-bottom:5%;">회원가입.</h2>
  	<!-- <h2>담당사역 확인( {{ checkedDuty }} )</h2> -->
  <form role="form" id="signupForm" @submit.prevent='goSignup'>
    <div class="form-group">
    	<label for="name" class="control-label">이름</label>
    	<input type="text" class="form-control textbox" id="name" v-model="ssm_name">
    </div>
		<div class="form-group">
      <label for="id" class="control-label" id="class">아이디</label>
			<input type="text" style="ime-mode:inactive;" class="form-control" id="id" v-model="ssm_id" @keyup="checkId">
			
      <label class="control-label-sub">{{ idLog }}</label>
      <input type="hidden" :value="idIsChecked">
    </div>
    <div class="form-group">
        <label for="pw" class="control-label">비밀번호</label>
        <input type="password" id="pw" class="form-control" v-model="ssm_pw">
    </div>
    <div class="form-group">
        <label for="phone" class="control-label">전화번호</label>
        <input type="text" id="phone" class="form-control" v-model="ssm_phone">
    </div>
    <div class="form-group">
        <label for="team" class="control-label">팀 번호</label>
        <input type="text" id="team" class="form-control" v-model="ssm_team">
    </div>
    <div class="form-group">
        <label class="control-label">사역자 기수 확인 ( {{ ssm_gen }} )</label>
        <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" id="gen1" value="1" v-model="ssm_gen">
            <label class="form-check-label" for="gen1">1기</label>
        </div>
        <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" id="gen2" value="2" v-model="ssm_gen">
            <label class="form-check-label" for="gen2">2기</label>
        </div>
    </div>
    <div class="form-group">
        <label class="control-label">담당 사역 ( {{ checkedDuty }} )</label>
        <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" id="intern" value="I" v-model="checkedDuty">
            <label class="form-check-label" for="intern">훈련생</label>
        </div>
        <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" id="prophet" value="P" v-model="checkedDuty">
            <label class="form-check-label" for="prophet">예언사역자</label>
        </div>
        <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" id="pastor" value="M" v-model="checkedDuty">
            <label class="form-check-label" for="pastor">교역자</label>
        </div>
    </div>
        
    
      <input class="btn btn-primary" type="button" value="뒤로" @click="goBack">
      <input class="btn btn-primary"type="submit" value="회원가입">
    </form>
    </div>
    </div>

</template>
<style scoped>
        .row {
            background-image: url('../assets/flower_pattern.jpg');
            z-index: 1;
        }
    </style>

<script>
export default {
  created () {
    
  },
  data () {
    return {
        checkedDuty: '',
        idIsChecked: "n",
        idLog: "아이디를 입력해주세요",
        ssm_type : '',
        ssm_gen : '',
        isRightPassword : 'n'

    }
  },
  methods: {
      goSignup() {
          if(this.idIsChecked != 'y'){
              alert('중복되지 않는 아이디를 입력해주세요')
          } else {
            console.log(this.ssm_phone)
            this.ssm_type = this.checkedDuty
            console.log('TYPE : ' ,this.ssm_type)
      
            this.$http.post('/api/sasamo/signup', {
                ssm_name : this.ssm_name,
                ssm_id : this.ssm_id,
                ssm_pw : this.ssm_pw,
                ssm_phone: this.ssm_phone,
                ssm_team : this.ssm_team ? this.ssm_team : 0,
                ssm_type : this.ssm_type,
                ssm_gen : this.ssm_gen,
            })
            this.$router.push({ name: 'sasamo'})
            console.log('goMain')
        }
    },
    checkId(){
				if(this.ssm_id.length < 3){
					this.idLog = "아이디는 6자 이상 입력해주세요."
				} else {
					
					this.$http.post('api/sasamo/checkid', {
						id : this.ssm_id
        }).then(res => {
					console.log('checkID :',res)
            if(res.data.data){
							this.idIsChecked = 'y'
                this.idLog = "사용가능한 아이디입니다"
            } else {
							this.idIsChecked = 'n'
                this.idLog = "이미 사용중인 아이디입니다"
            }
        })

				}
    },
    goBack() {
      this.$router.push({ name: 'sasamo'})
    }
  }

}
</script>
