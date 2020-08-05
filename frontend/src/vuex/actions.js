import axios from 'axios'
import router from '@/router'

export default {
    async login (store, {email, password}) {
        sessionStorage.setItem("jwt-auth-token", "")
        await axios.post(`/api/user/login`,
        {
            email: email,
            password: password
        }, {headers: {'Content-Type': 'application/json'}}
        ).then((response) => {
            if (response.data.status) {
                this.showAlert = true;
                this.errMsg = response.data.data.email + "로그인 되었습니다"
                store.commit('TOKEN', response.headers["jwt-auth-token"])
                store.commit('IS_AUTH', true)
                sessionStorage.setItem("jwt-auth-token", response.headers["jwt-auth-token"])
            }
            else {
                store.commit('TOKEN', '')
                store.commit('IS_AUTH', false)
            }
        })
        return store.getters.getIsAuth
    },

    async signUp (store, {email, password, nickname}) {
        await axios.post(`/api/user/signUp`,
        {
            email: email,
            password: password,
            nickname: nickname,
            introduce: "안녕하세요"
        }, {headers: {'Content-Type': 'application/json'}}
        ).then((response) => {
            store.commit('JOIN_SUCCESS', response.data < 2)
        })
        return store.getters.getJoinSuccess
    },

    async checkLogin (store) {
        var result;
        if (sessionStorage.getItem('jwt-auth-token')) {
            store.commit('TOKEN', sessionStorage.getItem('jwt-auth-token'))
            store.commit('IS_AUTH', true)
            await axios.get(`/api/user/${store.getters.getToken}`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(res => {
                result = res.data
            }).catch(e => {
                store.commit('logout')
                alert('토큰이 만료되었습니다. 다시 로그인해주세요')
                router.push('/');
            })
            return result;
        }
    }
}