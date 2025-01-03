<template>
    <div class="main-header">
        <div class="logo">
            <router-link to="/app/dashboard">
                <img :src="'/images/'+currentUser.logo" alt width="60" height="60">
            </router-link>
        </div>

        <div @click="sideBarToggle" class="menu-toggle">
            <div></div>
            <div></div>
            <div></div>
        </div>

        <div style="margin: auto"></div>

        <div class="header-part-right">
            <VueCtkDateTimePicker v-model="from_date" label="Select Start Date"
                                  v-if="currentUserPermissions && currentUserPermissions.includes('Reports_sales')"/>
            <span class="ml-1"></span>
            <VueCtkDateTimePicker v-model="to_date" label="Select End Date"
                                  v-if="currentUserPermissions && currentUserPermissions.includes('Reports_sales')"/>
            <button class="ml-1 btn btn-info mr-1 btn-sm"
                    v-if="currentUserPermissions && currentUserPermissions.includes('Reports_sales')"
                    @click="getDailyReports()">
                Download Report
            </button>
            <button class="ml-1 btn btn-success mr-1 btn-sm"
                    v-if="currentUserPermissions && currentUserPermissions.includes('Reports_sales')"
                    @click="printMonthlyReports()">
                Print Report
            </button>
            <button class="ml-1 btn btn-dark mr-1 btn-sm"
                    v-if="currentUserPermissions && currentUserPermissions.includes('Reports_sales')"
                    @click="downloadStockSheet()">
                Download StockSheet
            </button>
            <router-link
                v-if="currentUserPermissions && currentUserPermissions.includes('Pos_view')"
                class="btn btn-outline-primary tn-sm btn-rounded"
                to="/app/pos"
            >
                <span class="ul-btn__text ml-1">POS</span>
            </router-link>
            <!-- Full screen toggle -->
            <i class="i-Full-Screen header-icon d-none d-sm-inline-block" @click="handleFullScreen"></i>
            <!-- Grid menu Dropdown -->

            <div class="dropdown">
                <b-dropdown
                    id="dropdown"
                    text="Dropdown Button"
                    class="m-md-2 d-none  d-md-block"
                    toggle-class="text-decoration-none"
                    no-caret
                    variant="link"
                >
                    <template slot="button-content">
                        <i
                            class="i-Globe text-muted header-icon"
                            role="button"
                            id="dropdownMenuButton"
                            data-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded="false"
                        ></i>
                    </template>
                    <vue-perfect-scrollbar
                        :settings="{ suppressScrollX: true, wheelPropagation: false }"
                        ref="myData"
                        class="dropdown-menu-right rtl-ps-none notification-dropdown ps scroll"
                    >
                        <div class="menu-icon-grid">
                            <a @click="SetLocal('en')">
                                <i title="en" class="flag-icon flag-icon-squared flag-icon-gb"></i> English
                            </a>
                            <a @click="SetLocal('fr')">
                                <i title="fr" class="flag-icon flag-icon-squared flag-icon-fr"></i>
                                <span class="title-lang">French</span>
                            </a>
                        </div>
                    </vue-perfect-scrollbar>
                </b-dropdown>
            </div>
            <!-- Notificaiton -->
            <div class="dropdown">
                <b-dropdown
                    id="dropdown-1"
                    text="Dropdown Button"
                    class="m-md-2 badge-top-container d-none  d-sm-inline-block"
                    toggle-class="text-decoration-none"
                    no-caret
                    variant="link"
                >
                    <template slot="button-content">
                        <span class="badge badge-primary" v-if="notifs_alert > 0">1</span>
                        <i class="i-Bell text-muted header-icon"></i>
                    </template>
                    <!-- Notification dropdown -->
                    <vue-perfect-scrollbar
                        :settings="{ suppressScrollX: true, wheelPropagation: false }"
                        :class="{ open: getSideBarToggleProperties.isSideNavOpen }"
                        ref="myData"
                        class="dropdown-menu-right rtl-ps-none notification-dropdown ps scroll"
                    >
                        <div class="dropdown-item d-flex" v-if="notifs_alert > 0">
                            <div class="notification-icon">
                                <i class="i-Bell text-primary mr-1"></i>
                            </div>
                            <div class="notification-details flex-grow-1"
                                 v-if="currentUserPermissions && currentUserPermissions.includes('Reports_quantity_alerts')">
                                <router-link tag="a" to="/app/reports/quantity_alerts">
                                    <p class="text-small text-muted m-0">
                                        {{ notifs_alert }} {{ $t('ProductQuantityAlerts') }}
                                    </p>
                                </router-link>
                            </div>
                        </div>

                    </vue-perfect-scrollbar>
                </b-dropdown>
            </div>
            <!-- Notificaiton End -->

            <!-- User avatar dropdown -->
            <div class="dropdown">
                <b-dropdown
                    id="dropdown-1"
                    text="Dropdown Button"
                    class="m-md-4 user col align-self-end d-md-block"
                    toggle-class="text-decoration-none"
                    no-caret
                    variant="link"
                >
                    <template slot="button-content">
                        <img
                            :src="'/images/avatar/'+currentUser.avatar"
                            id="userDropdown"
                            alt
                            data-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded="false"
                        >
                    </template>

                    <div class="dropdown-menu-right" aria-labelledby="userDropdown">
                        <div class="dropdown-header">
                            <i class="i-Lock-User mr-1"></i> <span>{{ currentUser.username }}</span>
                        </div>
                        <router-link to="/app/profile" class="dropdown-item">{{ $t('profil') }}</router-link>
                        <router-link
                            v-if="currentUserPermissions && currentUserPermissions.includes('setting_system')"
                            to="/app/settings/System_settings"
                            class="dropdown-item"
                        >{{ $t('Settings') }}
                        </router-link>
                        <a class="dropdown-item" href="#" @click.prevent="logoutUser">{{ $t('logout') }}</a>
                    </div>
                </b-dropdown>
            </div>
        </div>
    </div>

    <!-- header top menu end -->
</template>
<script>
import Util from "./../../../utils";
// import Sidebar from "./Sidebar";
import {isMobile} from "mobile-device-detect";
import {mapGetters, mapActions} from "vuex";
import {mixin as clickaway} from "vue-clickaway";
// import { setTimeout } from 'timers';
import FlagIcon from "vue-flag-icon";
import NProgress from "nprogress";
import VueCtkDateTimePicker from 'vue-ctk-date-time-picker';
import 'vue-ctk-date-time-picker/dist/vue-ctk-date-time-picker.css';
import moment from 'moment'


export default {
    mixins: [clickaway],
    components: {
        FlagIcon,
        VueCtkDateTimePicker
    },

    data() {

        return {
            langs: [
                "en",
                "fr",
            ],

            isDisplay: true,
            isStyle: true,
            isSearchOpen: false,
            isMouseOnMegaMenu: true,
            isMegaMenuOpen: false,
            is_Load: false,
            from_date: null,
            to_date: null,
            // alerts:0,
        };
    },

    computed: {
        ...mapGetters([
            "currentUser",
            "getSideBarToggleProperties",
            "currentUserPermissions",
            "notifs_alert",
        ]),


    },
    created() {
        this.from_date = moment().startOf('month').format("YYYY-MM-DD hh:mm a");  //.subtract(1, 'days').format("YYYY-MM-DD hh:mm a");
        this.to_date = moment().endOf('month').format("YYYY-MM-DD hh:mm a")//.format("YYYY-MM-DD hh:mm a");
    },

    methods: {

        ...mapActions([
            "changeSecondarySidebarProperties",
            "changeSidebarProperties",
            "changeThemeMode",
            "logout",
        ]),

        logoutUser() {
            this.$store.dispatch("logout");
        },

        getDailyReports() {
            NProgress.start();
            NProgress.set(0.1);
            axios
                .post("report/download", {fromDate: this.from_date, toDate: this.to_date}, {
                    responseType: "blob", // important
                    headers: {
                        "Content-Type": "application/json"
                    }
                })
                .then(response => {
                    const url = window.URL.createObjectURL(response.data);
                    const link = document.createElement("a");
                    link.href = url;
                    var d = new Date();
                    var datestring = d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear() + " " + d.getHours() + ":" + d.getMinutes();
                    link.setAttribute("download", datestring + "_daily_list_sales.xlsx");
                    document.body.appendChild(link);
                    link.click();
                    // Complete the animation of the  progress bar.
                    NProgress.done();
                })
                .catch(() => {
                    // Complete the animation of the  progress bar.
                    NProgress.done();
                });
        },

        downloadStockSheet() {
            NProgress.start();
            NProgress.set(0.1);
            axios
                .post("report/stocksheet", {},{
                    responseType: "blob", // important
                    headers: {
                        "Content-Type": "application/json"
                    }
                })
                .then(response => {
                    const url = window.URL.createObjectURL(response.data);
                    console.log(response.data)
                    const link = document.createElement("a");
                    link.href = url;
                    const d = new Date();
                    const date_string = d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear() + " " + d.getHours() + ":" + d.getMinutes();
                    link.setAttribute("download", date_string + "_daily_inventory.xlsx");
                    document.body.appendChild(link);
                    link.click();
                    // Complete the animation of the  progress bar.
                    NProgress.done();
                })
                .catch(() => {
                    // Complete the animation of the  progress bar.
                    NProgress.done();
                });
        },

        printMonthlyReports() {
            NProgress.start();
            NProgress.set(0.1);
            axios
                .post("report/monthly", {fromDate: this.from_date, toDate: this.to_date}, {
                    headers: {
                        "Content-Type": "application/json"
                    }
                })
                .then(response => {
                    // Complete the animation of the  progress bar.
                    NProgress.done();
                })
                .catch(() => {
                    // Complete the animation of the  progress bar.
                    NProgress.done();
                });
        },


        SetLocal(locale) {
            this.$i18n.locale = locale;
            this.$store.dispatch("language/setLanguage", locale);
            Fire.$emit("ChangeLanguage");
        },

        handleFullScreen() {
            Util.toggleFullScreen();
        },

        //logoutUser() {
        // this.logout();
        //},

        closeMegaMenu() {
            this.isMegaMenuOpen = false;
        },
        toggleMegaMenu() {
            this.isMegaMenuOpen = !this.isMegaMenuOpen;
        },
        toggleSearch() {
            this.isSearchOpen = !this.isSearchOpen;
        },

        sideBarToggle(el) {
            if (
                this.getSideBarToggleProperties.isSideNavOpen &&
                this.getSideBarToggleProperties.isSecondarySideNavOpen &&
                isMobile
            ) {
                this.changeSidebarProperties();
                this.changeSecondarySidebarProperties();
            } else if (
                this.getSideBarToggleProperties.isSideNavOpen &&
                this.getSideBarToggleProperties.isSecondarySideNavOpen
            ) {
                this.changeSecondarySidebarProperties();
            } else if (this.getSideBarToggleProperties.isSideNavOpen) {
                this.changeSidebarProperties();
            } else if (
                !this.getSideBarToggleProperties.isSideNavOpen &&
                !this.getSideBarToggleProperties.isSecondarySideNavOpen &&
                !this.getSideBarToggleProperties.isActiveSecondarySideNav
            ) {
                this.changeSidebarProperties();
            } else if (
                !this.getSideBarToggleProperties.isSideNavOpen &&
                !this.getSideBarToggleProperties.isSecondarySideNavOpen
            ) {

                this.changeSidebarProperties();
                this.changeSecondarySidebarProperties();
            }
        }
    }
};
</script>



