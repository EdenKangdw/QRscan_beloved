import Vue from 'vue'
import Router from 'vue-router'
import sasamo from '@/components/Sasamo_index'
import sasamo_main from '@/components/Sasamo_main'
import sasamo_signup from '@/components/Sasamo_signup'
import sasamo_myteam_leader from '@/components/Sasamo_myteam_leader'
import sasamo_myteam_user from '@/components/sasamo_myteam_user'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'sasamo',
      component: sasamo,
      props: true
    },
    {
      path: '/main/:id',
      name: 'sasamo_main',
      component: sasamo_main, 
      props: true
    },
    {
      path: '/signup',
      name: 'sasamo_signup',
      component: sasamo_signup
    },
    {
      path: '/myteam',
      name: 'sasamo_myteam_leader',
      component: sasamo_myteam_leader
    },
    {
      path: '/myteam_user',
      name: 'sasamo_myteam_user',
      component: sasamo_myteam_user
    }
  ]
})
