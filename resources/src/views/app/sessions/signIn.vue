<template>
  <div class="auth-layout-wrap">
    <div class="auth-content">
      <div class="card o-hidden">
        <div class="row">
          <div class="col-md-12">
            <div class="p-4">
              <div class="auth-logo text-center mb-30">
                <img :src="'/images/logo.png'">
              </div>
              <h1 class="mb-3 text-18 text-center">Chui POS</h1>
              <!-- <validation-observer ref="submit_login">
                <b-form @submit.prevent="Submit_Login">
                  <validation-provider
                    name="Email Address"
                    :rules="{ required: true}"
                    v-slot="validationContext"
                  >
                    <b-form-group :label="$t('Email_Address')" class="text-12">
                      <b-form-input
                        :state="getValidationState(validationContext)"
                        aria-describedby="Email-feedback"
                        class="form-control-rounded"
                        type="text"
                        v-model="email"
                        email
                      ></b-form-input>
                      <b-form-invalid-feedback id="Email-feedback">{{ validationContext.errors[0] }}</b-form-invalid-feedback>
                    </b-form-group>
                  </validation-provider>

                  <validation-provider
                    name="Password"
                    :rules="{ required: true}"
                    v-slot="validationContext"
                  >
                    <b-form-group :label="$t('password')" class="text-12">
                      <b-form-input
                        :state="getValidationState(validationContext)"
                        aria-describedby="Password-feedback"
                        class="form-control-rounded"
                        type="password"
                        v-model="password"
                      ></b-form-input>
                      <b-form-invalid-feedback
                        id="Password-feedback"
                      >{{ validationContext.errors[0] }}</b-form-invalid-feedback>
                    </b-form-group>
                  </validation-provider>

                  <b-button
                    type="submit"
                    tag="button"
                    class="btn-rounded btn-block mt-2"
                    variant="primary mt-2"
                    :disabled="loading"
                  >{{$t('SignIn')}}</b-button>
                  <div v-once class="typo__p" v-if="loading">
                    <div class="spinner sm spinner-primary mt-3"></div>
                  </div>
                </b-form>
              </validation-observer> -->
             <h2 class="text-center"> &ensp;&ensp;{{"*".repeat(pin.length)}} &ensp;&ensp;</h2> 
             <div class="row justify-content-center">
                 <div class="col-sm-4 mb-3"><button class="btn btn-primary w-100 py-4 text-bold" @click="keyPressed(1)">1</button></div>
                 <div class="col-sm-4 mb-3"><button class="btn btn-primary w-100 py-4 text-bold" @click="keyPressed(2)">2</button></div>
                 <div class="col-sm-4 mb-3"><button class="btn btn-primary w-100 py-4 text-bold" @click="keyPressed(3)">3</button></div>
                 <div class="col-sm-4 mb-3"><button class="btn btn-primary w-100 py-4 text-bold" @click="keyPressed(4)">4</button></div>
                 <div class="col-sm-4 mb-3"><button class="btn btn-primary w-100 py-4 text-bold" @click="keyPressed(5)">5</button></div>
                 <div class="col-sm-4 mb-3"><button class="btn btn-primary w-100 py-4 text-bold" @click="keyPressed(6)">6</button></div>
                 <div class="col-sm-4 mb-3"><button class="btn btn-primary w-100 py-4 text-bold" @click="keyPressed(7)">7</button></div>
                 <div class="col-sm-4 mb-3"><button class="btn btn-primary w-100 py-4 text-bold" @click="keyPressed(8)">8</button></div>
                 <div class="col-sm-4 mb-3"><button class="btn btn-primary w-100 py-4 text-bold" @click="keyPressed(9)">9</button></div>
                 <div class="col-sm-4 mb-3"><button class="btn btn-primary w-100 py-4 text-bold" @click="keyPressed(0)">0</button></div>
                 <div class="col-sm-4 mb-3"><button class="btn btn-danger w-100 py-4 text-bold" @click="keyClear()">CLEAR</button></div>
                 <div class="col-sm-4 mb-3"><button class="btn btn-dark w-100 py-4 text-bold" @click="Submit_PIN_Login()">ENTER</button></div>
             </div>


              <div class="mt-3 text-center">
              <!--
                 <a href="/password/reset"  class="text-muted">
                  <u>{{$t('Forgot_Password')}}</u>
                </a>
                -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters, mapActions } from "vuex";
import NProgress from "nprogress";
import Util from "./../../../utils";


export default {
  metaInfo: {
    title: "SignIn"
  },
  data() {
    return {
      email: "",
      password: "",
      userId: "",
      bgImage: require("./../../../assets/images/photo-wide-4.jpg"),
      loading: false,
      pin:"",
    };
  },
  computed: {
    ...mapGetters(["isAuthenticated", "error"])
  },
  mounted(){
    this.handleFullScreen();
  },

  methods: {
    //------------- Submit Form login
    Submit_Login() {
      this.$refs.submit_login.validate().then(success => {
        if (!success) {
          this.makeToast(
            "danger",
            this.$t("Please_fill_the_form_correctly"),
            this.$t("Failed")
          );
        } else {
          this.Login();
        }
      });
    },

    Submit_PIN_Login() {
      NProgress.start();
      NProgress.set(0.1);
      self.loading = true;
      axios
        .post("/pin/login",{
          pin: this.pin,
        },
        {
          baseURL: '',
        })
        .then(response => {

            this.makeToast(
              "success",
              this.$t("Successfully_Logged_In"),
              this.$t("Success")
            );

          window.location = '/app/pos';
           
          NProgress.done();
          this.loading = false;
        })
        .catch(error => {
          NProgress.done();
          this.loading = false;
          this.pin="";
          this.makeToast(
              "danger",
              this.$t("Incorrect_Login"),
              this.$t("Failed")
            );
        });
    },

    getValidationState({ dirty, validated, valid = null }) {
      return dirty || validated ? valid : null;
    },

    keyPressed(value) {
      if (this.pin.length<6){
        this.pin = this.pin.concat(value)
      }
    },

    keyClear() {
      if (this.pin.length>0){
        this.pin = this.pin.slice(0,-1);
      }
    },

    keyEnter() {
        //login
    },  

    Login() {
      let self = this;
      // Start the progress bar.
      NProgress.start();
      NProgress.set(0.1);
      self.loading = true;
      axios
        .post("/login",{
          email: self.email,
          password: self.password
        },
        {
          baseURL: '',
        })
        .then(response => {

            this.makeToast(
              "success",
              this.$t("Successfully_Logged_In"),
              this.$t("Success")
            );

          window.location = '/app/pos';
           
          NProgress.done();
          this.loading = false;
        })
        .catch(error => {
          NProgress.done();
          this.loading = false;
          this.makeToast(
              "danger",
              this.$t("Incorrect_Login"),
              this.$t("Failed")
            );
        });
    },

    handleFullScreen() {
            //Util.toggleFullScreen();
        },

    //------ Toast
    makeToast(variant, msg, title) {
      this.$root.$bvToast.toast(msg, {
        title: title,
        variant: variant,
        solid: true
      });
    }
  }
};
</script>

<style>
  .btn{
    font-size: 18px !important;
  }
</style>
