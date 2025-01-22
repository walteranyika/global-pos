<template>
    <div class="main-content">
        <breadcumb page="User Sales Summary" :folder="$t('Sales')"/>

        <div v-if="isLoading" class="loading_page spinner spinner-primary mr-3"></div>
        <div v-else>
            <vue-good-table
                :columns="columns"
                :rows="user_sales"
                :lineNumbers="true"
                :search-options="{
                    enabled: true,
                    placeholder: $t('Search_this_table'),
                  }"
                :sort-options="{
                    enabled: true,
                }"
                :pagination-options="{
                    enabled: true,
                    perPage:15,
                    nextLabel: 'next',
                    prevLabel: 'prev',
                  }" styleClass="tableOne table-hover vgt-table">
                <div slot="table-actions" class="mt-2 mb-3">
                    <div class="row">
                        <div class="col-sm-4">
                            <VueCtkDateTimePicker v-model="start_date" label="Select Start Date"/>
                        </div>
                        <div class="col-sm-4">
                            <VueCtkDateTimePicker v-model="end_date" label="Select Start Date"/>
                        </div>
                        <div class="col-sm-4">
                            <b-button variant="outline-info ripple m-1" size="sm" @click="getUserSales()">
                                <i class="i-Filter-2"></i>
                                {{ $t("Filter") }}
                            </b-button>

                            <b-button variant="outline-danger ripple m-1" size="sm" @click="Reset_Filter()">
                                <i class="i-Reset"></i>
                                {{ 'Reset' }}
                            </b-button>
                        </div>
                    </div>
                </div>
                <template slot="table-row" slot-scope="props">
                      <span v-if="props.column.field == 'action'">
                          <i class="i-Eye text-25 text-success" @click="getHeldItemsForUser(props.row.userId)"></i>
                      </span>
                </template>
            </vue-good-table>
        </div>

        <b-modal hide-footer size="sm" id="user_held_items" title="Held Item">
            <table class="table table-stripped">
                <tr>
                    <th>Client</th>
                    <th>User</th>
                    <th>Code</th>
                    <th># Items</th>
                    <th>Comment</th>
                    <th>Created</th>
                    <th>Total</th>
                    <th>Action</th>
                </tr>
                <tr v-for="item in heldItems">
                    <td>{{item.client.name}}</td>
                    <td>{{item.user}}</td>
                    <td>{{item.code}}</td>
                    <td>{{item.number_items}}</td>
                    <td>{{item.comment}}</td>
                    <td>{{item.created_at}}</td>
                    <td>{{item.total}}</td>
                    <td><i class="i-Eye text-25 text-success" @click="detailsHeldSale(item.items)"></i></td>
                </tr>
            </table>
        </b-modal>

        <b-modal hide-footer size="sm" id="details_held_items" title="Held Item Details">
            <table class="table table-stripped">
                <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                </tr>
                <tr v-for="item in details">
                    <td>{{item.name}}</td>
                    <td>{{item.quantity}}</td>
                    <td>{{item.Net_price}}</td>
                    <td>{{item.subtotal}}</td>
                </tr>
            </table>
        </b-modal>
    </div>
</template>

<script>
import {mapActions, mapGetters} from "vuex";
import NProgress from "nprogress";
import "jspdf-autotable";
import VueCtkDateTimePicker from 'vue-ctk-date-time-picker';
import 'vue-ctk-date-time-picker/dist/vue-ctk-date-time-picker.css';
import moment from 'moment'

export default {
    metaInfo: {
        title: "Users Sales Summary"
    },
    components: {
        VueCtkDateTimePicker,
    },
    data() {
        return {
            isLoading: true,
            serverParams: {
                columnFilters: {},
                sort: {
                    field: "id",
                    type: "desc"
                },
                page: 1,
                perPage: 10
            },

            totalRows: "",
            search: "",
            start_date: "",
            end_date: "",
            Filter_warehouse: "",
            Filter_category: "",
            user_sales: [],
            heldItems:[],
            details: []

        };
    },

    computed: {
        ...mapGetters(["currentUserPermissions", "currentUser"]),
        columns() {
            return [
                {
                    label: "User",
                    field: "user",
                    tdClass: "text-left",
                    thClass: "text-left"
                },
                {
                    label: "Completed",
                    field: "paid",
                    type: "number",
                    tdClass: "text-left",
                    thClass: "text-left",
                    formatFn: this.formatNumber,

                },
                {
                    label: "Pending",
                    field: "unpaid",
                    type: "number",
                    tdClass: "text-left",
                    thClass: "text-left",
                    formatFn: this.formatNumber,

                },
                {
                    label: "Cash",
                    field: "Cash",
                    type: "number",
                    tdClass: "text-left",
                    thClass: "text-left",
                    formatFn: this.formatNumber,

                },
                {
                    label: "Mpesa",
                    field: "Mpesa",
                    type: "number",
                    tdClass: "text-left",
                    thClass: "text-left",
                    formatFn: this.formatNumber,

                },
                {
                    label: "Credit Card",
                    field: "Credit Card",
                    type: "number",
                    tdClass: "text-left",
                    thClass: "text-left",
                    formatFn: this.formatNumber,

                },
                {
                    label: "Complimentary",
                    field: "Complimentary",
                    type: "number",
                    tdClass: "text-left",
                    thClass: "text-left",
                    formatFn: this.formatNumber,

                },
                {
                    label: "Other",
                    field: "Other",
                    type: "number",
                    tdClass: "text-left",
                    thClass: "text-left",
                    formatFn: this.formatNumber,

                },
                {
                    label: "In Hold",
                    field: "Total_Held_Sales",
                    type: "number",
                    tdClass: "text-left",
                    thClass: "text-left",
                    formatFn: this.formatNumber,
                },
                {
                    label: "Action",
                    field: "action",
                    tdClass: "text-left",
                    thClass: "text-left",
                }
            ];
        }
    },

    methods: {

        //------ Reset Filter
        Reset_Filter() {
            this.search = "";
            this.start_date = moment().subtract(2, 'days').startOf('day').format("YYYY-MM-DD hh:mm a");  //.subtract(1, 'days').format("YYYY-MM-DD hh:mm a");
            this.end_date = moment().add(1, 'days').startOf('day').format("YYYY-MM-DD hh:mm a")
            this.getUserSales();
        },
        formatNumber(num) {
            return num.toLocaleString('en-US');
        },
        makeToast(variant, msg, title) {
            this.$root.$bvToast.toast(msg, {
                title: title,
                variant: variant,
                solid: true
            });
        },
        detailsHeldSale(items){
           this.details = items
            this.$bvModal.show("details_held_items");
        },
        getHeldItemsForUser(user_id){
            if (this.start_date === "" || this.end_date === "") {
                this.makeToast(
                    "warning",
                    "Please select the start and end dates",
                    this.$t("Warning")
                );
            }
            NProgress.start();
            NProgress.set(0.1);
            let data = {"start_date": this.start_date, "end_date": this.end_date, "user_id":user_id}
            axios
                .post("user/held/items", data)
                .then(response => {
                    this.heldItems = response.data;
                    this.$bvModal.show("user_held_items");
                    // Complete the animation of theprogress bar.
                    NProgress.done();
                    this.isLoading = false;
                })
                .catch(response => {
                    // Complete the animation of theprogress bar.
                    NProgress.done();
                    setTimeout(() => {
                        this.isLoading = false;
                    }, 500);
                });

        },
        getUserSales() {
            // Start the progress bar.
            if (this.start_date === "" || this.end_date === "") {
                this.makeToast(
                    "warning",
                    "Please select the start and end dates",
                    this.$t("Warning")
                );
            }
            NProgress.start();
            NProgress.set(0.1);
            let data = {"start_date": this.start_date, "end_date": this.end_date}
            axios
                .post("report/user/sales/summary", data)
                .then(response => {
                    this.user_sales = response.data.user_sales;
                    this.totalRows = response.data.user_sales.length;
                    // Complete the animation of theprogress bar.
                    NProgress.done();
                    this.isLoading = false;
                })
                .catch(response => {
                    // Complete the animation of theprogress bar.
                    NProgress.done();
                    setTimeout(() => {
                        this.isLoading = false;
                    }, 500);
                });
        },

    },

    //----------------------------- Created function-------------------
    created: function () {
        this.start_date = moment().subtract(2, 'days').startOf('day').format("YYYY-MM-DD hh:mm a");  //.subtract(1, 'days').format("YYYY-MM-DD hh:mm a");
        this.end_date = moment().add(1, 'days').startOf('day').format("YYYY-MM-DD hh:mm a")
        this.getUserSales();
    }
};
</script>
