<template>
  <div class="vertical-center">
    <div class="inner-block">
      <b-tabs content-class="mt-3" fill>
        <b-tab title="회원정보 수정">
          <form name="frm" action="userupdate" method="post">
            <div class="form-group">
              <label for="nickname">닉네임</label>
              <div class="input-group">
                <input 
                  v-model="nickName" 
                  v-validate="'required|min:3|max:20'"
                  type="text" 
                  name="nickname"
                  class="form-control"
                  autocomplete="off"
                />
                <span class="input-group-btn" style="margin-left: 10px">
                  <button type="button" class="btn btn-primary" @click="nicknameCheck">중복 확인</button>
                </span>
              </div>
              <div class="alert alert-danger" v-if="errors.has('nickname')">
                {{ errors.first('nickname') }}
              </div>
            </div>
            <div class="form-group">
              <label for="introduce">유저 소개</label>
              <textarea
                v-model="introduce"
                name="introduce"
                type="text"
                class="form-control"
                style="height:100px;"
              />
            </div>
            <button type="submit" @click="backsubmit" class="btn btn-dark btn-lg btn-block">회원정보 수정</button>
          </form>
        </b-tab>
        <b-tab title="비밀번호 변경">
          <form name="frm" action="userupdate" method="post">
            <div class="form-group">
              <label for="originalPassword">기존 비밀번호</label>
              <input 
                v-model="originalPassword" 
                name="originalPassword" 
                :type="passwordType" 
                placeholder="기존 비밀번호를 입력해주세요" 
                class="form-control"
              />
            </div>
            <div class="form-group">
              <label for="password">비밀번호</label>
              <input 
                v-model="password" 
                name="password" 
                :type="passwordType" 
                placeholder="비밀번호를 입력해주세요" 
                class="form-control"
                ref="password"
                v-validate="'required|min:8|verify_password'"
              />
              <div class="alert alert-danger" v-if="errors.has('password')">
                {{ errors.first('password') }}
              </div>
            </div>
            <div class="form-group">
              <label for="password-confirmation">비밀번호 확인</label>
              <input 
                v-model="passwordConfirm"
                v-validate="'required|confirmed:password'" 
                name="password_confirmation" 
                type="password" 
                class="form-control" 
                placeholder="비밀번호를 재입력해주세요" 
                data-vv-as="password"
              />
              <div class="alert alert-danger" v-if="errors.has('password_confirmation')">
                {{ errors.first('password_confirmation') }}          
              </div>
            </div>
            <button type="submit" @click="backsubmit2" class="btn btn-dark btn-lg btn-block">비밀번호 변경</button>
          </form>
        </b-tab>
      </b-tabs>
      
    </div>
  </div>
</template>

<script>
export default {
  name: "UserUpdate",
  methods: {
    async remakeToken(newEmail, newPassword) {
      await this.$store.dispatch('login', {email: newEmail, password: newPassword})
      this.$router.push('/profile')
    },
    async backsubmit(event) {
      event.preventDefault();
      this.submitted = true;
      if (this.nickName != this.originalNickName && this.nicknameDup) {
        alert('닉네임 중복 확인을 해 주세요')
        return
      }
      await this.$store.dispatch('checkLogin').then(res => {
        this.$axios.put(`/api/user/${res.email}`, 
          {
            email: res.email,
            password: res.password,
            nickname: this.nickName,
            introduce: this.introduce
          }, { headers: {'Content-Type': 'application/json'}}
        ).then(response => {
          alert('회원정보 수정이 완료되었습니다')
          this.remakeToken(res.email, res.password)
        })
      })
    },
    async backsubmit2(event) {
      event.preventDefault();
      this.submitted = true;
      await this.$store.dispatch('checkLogin').then(res => {
        if (res.password != this.originalPassword) {
          alert('기존 패스워드가 일치하지 않습니다. 다시 입력해 주세요')
          this.originalPassword = ""
          return
        }
        else {
          this.$axios.put(`/api/user/${res.email}`, 
            {
              email: res.email,
              password: this.password,
              nickname: res.nickname,
              introduce: res.introduce
            }, { headers: {'Content-Type': 'application/json'}}
          ).then(response => {
            alert('회원정보 수정이 완료되었습니다')
            this.remakeToken(res.email, this.password)
          })
        }
      })
    },
    nicknameCheck() {
      if (this.nickName === this.originalNickName) {
        alert('기존 닉네임과 동일합니다. ')
        return;
      }
      this.$validator.validate('nickname').then(isValid => {
        if (isValid) {
          this.$axios.get('/api/user/nicknameCheck', {
            params: {
              nickname: this.nickName
            },
            headers: {'Content-Type': 'application/json'}
          }).then(res => {
            if (res.data == true) {
              alert('이미 사용중인 닉네임입니다. 다른 닉네임을 입력해 주세요')
              this.nickName = ""
            }
            else {
              alert('사용 가능한 닉네임입니다')
            }
            this.nicknameDup = res.data
          })
        }
      })
    },
  },
  data: () => {
    return {
      email: "",
      originalNickName: "",
      nickName: "",
      introduce: "",
      originalPassword: "",
      password: "",
      passwordConfirm: "",
      passwordType: "password",
      passwordConfirmType: "password",
      submitted: false,
      nicknameDup: true
    };
  },
  mounted: function() {
      this.$store.dispatch('checkLogin').then(res => {
          this.originalNickName = res.nickname
          this.nickName = this.originalNickName
          this.introduce = res.introduce
          this.email = res.email
      })
  },
  watch: {
    nickName: function (newVal, oldVal) {
      this.nicknameDup = true
    }
  }
}
</script>

<style scoped>
  .vertical-center {
    display: flex;
    text-align: left;
    justify-content: center;
    flex-direction: column;    
  }

  .inner-block {
    width: 450px;
    margin: auto;
    margin-top: 30px;
    margin-bottom: 30px;
    background: #ffffff;
    box-shadow: 0px 14px 80px rgba(34, 35, 58, 0.2);
    padding: 40px 40px 40px 40px;
    border-radius: 15px;
    transition: all .3s;
  }

  .vertical-center .form-control:focus {
    border-color: #2554FF;
    box-shadow: none;
  }

  .vertical-center .form-control:disabled {
    background-color: #888888;
  }

  .vertical-center h3 {
    text-align: center;
    margin: 0;
    line-height: 1;
    padding-bottom: 20px;
  }
  button.btn {
    background-color:#6495ED;
  }
  .alert-danger {
    font-size: 14px;
  }
</style>