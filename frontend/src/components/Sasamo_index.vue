<template lang="html">
<div id="app" class="total_container">
    
    <div class="row">
        <div class="col-md-4"></div>
        <div class="col-md-4" id="logo_container">
            <img id="logo2" src="../assets/beloved_logo2.png">
            <img id="logo1" src="../assets/beloved_logo1.png">
        </div>
        <div class="col-md-4"></div>
    </div>



    <br>
    <form id="loginForm" @submit.prevent='login' action="/login">
        <table id="login">
            <tr>
                <td>교번 : </td>
                <td><input class="form-control" type="text" name="id" v-model="userID"></td>
            </tr>
            <tr>
                <td colspan="2">
                    <div id="wrapper_btn">
                    <input class="btn btn-primary" type="submit" value="로그인">
                    </div>
                </td>
            </tr>
        </table>
    </form>
   
    
</div>
        
</template>
<style scoped>
#login{
    text-align : center;
    margin-left: auto; 
    margin-right: auto;

}
#wrapper_btn{
    margin-top: 10%;
}


</style>

<script>
export default {
  created () {
      
    
  },
  data () {
    return {
      token: "",
      greeting: "사역자님 안녕하세요!",
    }
  },
  methods: {
      login() {
        const userid = this.userID
        console.log('-----------------',userid)
        this.$router.push({ name: 'sasamo_main' , params: {id : userid}})
           
      },
        signup() {
            this.$router.push({ name: 'sasamo_signup' })
            console.log('signUP')
        }

  }

}
</script>