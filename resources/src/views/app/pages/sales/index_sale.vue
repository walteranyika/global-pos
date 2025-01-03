<template>
    <div class="main-content">
        <breadcumb :page="$t('ListSales')" :folder="$t('Sales')"/>
        <div v-if="isLoading" class="loading_page spinner spinner-primary mr-3"></div>
        <div v-else>
            <vue-good-table
                mode="remote"
                :columns="columns"
                :totalRows="totalRows"
                :rows="sales"
                @on-page-change="onPageChange"
                @on-per-page-change="onPerPageChange"
                @on-sort-change="onSortChange"
                @on-search="onSearch"
                :search-options="{
        placeholder: $t('Search_this_table'),
        enabled: true,
      }"
                :select-options="{
          enabled: true ,
          clearSelectionText: '',
        }"
                @on-selected-rows-change="selectionChanged"
                :pagination-options="{
        enabled: true,
        mode: 'records',
        nextLabel: 'next',
        prevLabel: 'prev',
      }"
                :styleClass="showDropdown?'tableOne table-hover vgt-table full-height':'tableOne table-hover vgt-table non-height'">
                <div slot="selected-row-actions">
                    <button class="btn btn-danger btn-sm" @click="delete_by_selected()">{{ $t('Del') }}</button>
                </div>
                <div slot="table-actions" class="mt-2 mb-3">
                    <b-button variant="outline-info ripple m-1" size="sm" v-b-toggle.sidebar-right>
                        <i class="i-Filter-2"></i>
                        {{ $t("Filter") }}
                    </b-button>
                    <b-button @click="Sales_PDF()" size="sm" variant="outline-success ripple m-1">
                        <i class="i-File-Copy"></i> PDF
                    </b-button>
                    <b-button @click="Sales_Excel()" size="sm" variant="outline-danger ripple m-1">
                        <i class="i-File-Excel"></i> EXCEL
                    </b-button>
                    <router-link
                        class="btn-sm btn btn-primary ripple btn-icon m-1"
                        v-if="currentUserPermissions && currentUserPermissions.includes('Sales_add')"
                        to="/app/sales/store"
                    >
            <span class="ul-btn__icon">
              <i class="i-Add"></i>
            </span>
                        <span class="ul-btn__text ml-1">{{ $t('Add') }}</span>
                    </router-link>
                </div>

                <template slot="table-row" slot-scope="props">
          <span v-if="props.column.field == 'actions'">
            <div>
              <b-dropdown
                  id="dropdown-right"
                  variant="link"
                  text="right align"
                  toggle-class="text-decoration-none"
                  size="lg"
                  right
                  no-caret
              >
                <template v-slot:button-content class="_r_btn border-0">
                  <span class="_dot _r_block-dot bg-dark"></span>
                  <span class="_dot _r_block-dot bg-dark"></span>
                  <span class="_dot _r_block-dot bg-dark"></span>
                </template>

                <b-navbar-nav>
                  <b-dropdown-item title="Show" :to="'/app/sales/detail/'+props.row.id">
                    <i class="nav-icon i-Eye font-weight-bold mr-2"></i>
                    {{ $t('SaleDetail') }}
                  </b-dropdown-item>
                </b-navbar-nav>

                  <b-dropdown-item
                      v-if="currentUserPermissions.includes('payment_sales_add')"
                      @click="New_Payment(props.row)"
                  >
                  <i class="nav-icon i-Add font-weight-bold mr-2"></i>
                  {{ $t('AddPayment') }}
                </b-dropdown-item>

                  <b-dropdown-item
                              v-if="currentUserPermissions.includes('payment_sales_add') && props.row.payment_status === 'paid'"
                              @click="printPaymentReceipt(props.row, 'payment')"
                          >
                  <i class="nav-icon i-Printer font-weight-bold mr-2"></i>
                  {{ 'Print Payment Receipt' }}
                </b-dropdown-item>

                  <b-dropdown-item
                              v-if="currentUserPermissions.includes('payment_sales_add') && props.row.payment_status === 'unpaid'"
                              @click="printPaymentReceipt(props.row, 'internal')"
                          >
                  <i class="nav-icon i-Printer font-weight-bold mr-2"></i>
                  {{ "Print Internal Receipt" }}
                </b-dropdown-item>

                  <!--                  <b-dropdown-item
                                        title="Clear Bill"
                                        v-if="currentUserPermissions.includes('Sales_edit') && props.row.statut!=='completed'"
                                        @click="clear_payment(props.row.id , props.row)"
                                    >
                                    <i class="nav-icon i-Billing font-weight-bold mr-2"></i>
                                    Clear Bill
                                  </b-dropdown-item>-->

                <b-dropdown-item
                    title="Edit"
                    v-if="currentUserPermissions.includes('Sales_edit')"
                    :to="'/app/sales/edit/'+props.row.id"
                >
                  <i class="nav-icon i-Pen-2 font-weight-bold mr-2"></i>
                  {{ $t('EditSale') }}
                </b-dropdown-item>

                <b-dropdown-item
                    v-if="currentUserPermissions.includes('payment_sales_view')"
                    @click="Show_Payments(props.row.id , props.row)"
                >
                  <i class="nav-icon i-Money-Bag font-weight-bold mr-2"></i>
                  {{ $t('ShowPayment') }}
                </b-dropdown-item>



                <b-dropdown-item title="Invoice" @click="Invoice_POS(props.row.id)">
                  <i class="nav-icon i-File-TXT font-weight-bold mr-2"></i>
                  {{ $t('Invoice_POS') }}
                </b-dropdown-item>

                <b-dropdown-item title="PDF" @click="Invoice_PDF(props.row , props.row.id)">
                  <i class="nav-icon i-File-TXT font-weight-bold mr-2"></i>
                  {{ $t('DownloadPdf') }}
                </b-dropdown-item>

                <b-dropdown-item title="Email" @click="Sale_Email(props.row , props.row.id)">
                  <i class="nav-icon i-Envelope-2 font-weight-bold mr-2"></i>
                  {{ $t('EmailSale') }}
                </b-dropdown-item>

                <b-dropdown-item
                    title="Delete"
                    v-if="currentUserPermissions.includes('Sales_delete')"
                    @click="Remove_Sale(props.row.id)"
                >
                  <i class="nav-icon i-Close-Window font-weight-bold mr-2"></i>
                  {{ $t('DeleteSale') }}
                </b-dropdown-item>
              </b-dropdown>
            </div>
          </span>
                    <div v-else-if="props.column.field === 'statut'">
            <span
                v-if="props.row.statut === 'completed'"
                class="badge badge-outline-success"
            >{{ $t('complete') }}
            </span>
            <span
                v-else-if="props.row.statut === 'pending'"
                class="badge badge-outline-info"
            >{{ $t('Pending') }} </span>
           <span v-else class="badge badge-outline-warning">{{ $t('Ordered') }}</span>
                    </div>

                    <div v-else-if="props.column.field === 'payment_status'">
            <span
                v-if="props.row.payment_status === 'paid'"
                class="badge badge-outline-success"
            >{{ $t('Paid') }}</span>
                        <span
                            v-else-if="props.row.payment_status === 'partial'"
                            class="badge badge-outline-primary"
                        >{{ $t('partial') }} <b class="text-muted" v-if="props.row.is_credit_sale"> | Credit Sale</b> </span>
                        <span v-else class="badge badge-outline-warning">{{ $t('Unpaid') }} <span v-if="props.row.is_credit_sale"> | Credit Sale</span></span>
                    </div>
                </template>
            </vue-good-table>
        </div>

        <!-- Sidebar Filter -->
        <b-sidebar id="sidebar-right" :title="$t('Filter')" bg-variant="white" right shadow>
            <div class="px-3 py-2">
                <b-row>
                    <!-- date  -->
                    <b-col md="12">
                        <b-form-group :label="$t('date')">
                            <b-form-input type="date" v-model="Filter_date"></b-form-input>
                        </b-form-group>
                    </b-col>

                    <!-- Reference -->
                    <b-col md="12">
                        <b-form-group :label="$t('Reference')">
                            <b-form-input label="Reference" :placeholder="$t('Reference')"
                                          v-model="Filter_Ref"></b-form-input>
                        </b-form-group>
                    </b-col>

                    <!-- Customer  -->
                    <b-col md="12">
                        <b-form-group :label="$t('Customer')">
                            <v-select
                                :reduce="label => label.value"
                                :placeholder="$t('Choose_Customer')"
                                v-model="Filter_Client"
                                :options="customers.map(customers => ({label: customers.name, value: customers.id}))"
                            />
                        </b-form-group>
                    </b-col>

                    <b-col md="12">
                        <b-form-group label="Waiters/Server">
                            <v-select
                                :reduce="label => label.value"
                                placeholder="Choose Waiter/User"
                                v-model="Filter_Waiter"
                                :options="waiters.map(waiter => ({label: waiter.firstname, value: waiter.id}))"
                            />
                        </b-form-group>
                    </b-col>


                    <!-- warehouse -->
                    <b-col md="12">
                        <b-form-group :label="$t('warehouse')">
                            <v-select
                                v-model="Filter_warehouse"
                                :reduce="label => label.value"
                                :placeholder="$t('Choose_Warehouse')"
                                :options="warehouses.map(warehouses => ({label: warehouses.name, value: warehouses.id}))"
                            />
                        </b-form-group>
                    </b-col>

                    <!-- Status  -->
                    <b-col md="12">
                        <b-form-group :label="$t('Status')">
                            <v-select
                                v-model="Filter_status"
                                :reduce="label => label.value"
                                :placeholder="$t('Choose_Status')"
                                :options="
                      [
                        {label: 'completed', value: 'completed'},
                        {label: 'Pending', value: 'pending'},
                        {label: 'Ordered', value: 'ordered'},
                      ]"
                            ></v-select>
                        </b-form-group>
                    </b-col>

                    <!-- Payment Status  -->
                    <b-col md="12">
                        <b-form-group :label="$t('PaymentStatus')">
                            <v-select
                                v-model="Filter_Payment"
                                :reduce="label => label.value"
                                :placeholder="$t('Choose_Status')"
                                :options="
                      [
                        {label: 'Paid', value: 'paid'},
                        {label: 'partial', value: 'partial'},
                        {label: 'UnPaid', value: 'unpaid'},
                      ]"
                            ></v-select>
                        </b-form-group>
                    </b-col>

                    <b-col md="6" sm="12">
                        <b-button
                            @click="Get_Sales(serverParams.page)"
                            variant="primary btn-block ripple m-1"
                            size="sm"
                        >
                            <i class="i-Filter-2"></i>
                            {{ $t("Filter") }}
                        </b-button>
                    </b-col>
                    <b-col md="6" sm="12">
                        <b-button @click="Reset_Filter()" variant="danger ripple btn-block m-1" size="sm">
                            <i class="i-Power-2"></i>
                            {{ $t("Reset") }}
                        </b-button>
                    </b-col>
                </b-row>
            </div>
        </b-sidebar>

        <!-- Modal Show Payments-->
        <b-modal hide-footer size="lg" id="Show_payment" :title="$t('ShowPayment')">
            <b-row>
                <b-col lg="12" md="12" sm="12" class="mt-3">
                    <div class="table-responsive">
                        <table class="table table-hover table-bordered table-md">
                            <thead>
                            <tr>
                                <th scope="col">{{ $t('date') }}</th>
                                <th scope="col">{{ $t('Reference') }}</th>
                                <th scope="col">{{ $t('Amount') }}</th>
                                <th scope="col">{{ $t('PayeBy') }}</th>
                                <th scope="col">{{ $t('Action') }}</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr v-if="payments.length <= 0">
                                <td colspan="5">{{ $t('NodataAvailable') }}</td>
                            </tr>
                            <tr v-for="payment in payments">
                                <td>{{ payment.date }}</td>
                                <td>{{ payment.Ref }}</td>
                                <td>{{ currentUser.currency }} {{ formatNumber(payment.montant, 2) }}</td>
                                <td>{{ payment.Reglement }}</td>
                                <td>
                                    <div role="group" aria-label="Basic example" class="btn-group">
                      <span
                          title="Print"
                          class="btn btn-icon btn-info btn-sm"
                          @click="Payment_Sale_PDF(payment,payment.id)"
                      >
                        <i class="i-Billing"></i>
                      </span>
                                        <span
                                            v-if="currentUserPermissions.includes('payment_sales_edit')"
                                            title="Edit"
                                            class="btn btn-icon btn-success btn-sm"
                                            @click="Edit_Payment(payment)"
                                        >
                        <i class="i-Pen-2"></i>
                      </span>
                                        <span
                                            title="Email"
                                            class="btn btn-icon btn-primary btn-sm"
                                            @click="EmailPayment(payment , sale)"
                                        >
                        <i class="i-Envelope"></i>
                      </span>
                                        <span
                                            title="SMS"
                                            class="btn btn-icon btn-secondary btn-sm"
                                            @click="Payment_Sale_SMS(payment)"
                                        >
                        <i class="i-Speach-Bubble"></i>
                      </span>
                                        <span
                                            v-if="currentUserPermissions.includes('payment_sales_delete')"
                                            title="Delete"
                                            class="btn btn-icon btn-danger btn-sm"
                                            @click="Remove_Payment(payment.id)"
                                        >
                        <i class="i-Close"></i>
                      </span>
                                    </div>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </b-col>
            </b-row>
        </b-modal>

        <!-- Modal Add Payment-->
        <validation-observer ref="Add_payment">
            <b-modal
                hide-footer
                size="lg"
                id="Add_Payment"
                :title="EditPaiementMode?$t('EditPayment'):$t('AddPayment')"
            >
                <b-form @submit.prevent="Submit_Payment">
                    <b-row>
                        <!-- date -->
                        <b-col lg="6" md="12" sm="12">
                            <validation-provider
                                name="date"
                                :rules="{ required: true}"
                                v-slot="validationContext"
                            >
                                <b-form-group :label="$t('date')">
                                    <b-form-input
                                        label="date"
                                        :state="getValidationState(validationContext)"
                                        aria-describedby="date-feedback"
                                        v-model="payment.date"
                                        type="date"
                                    ></b-form-input>
                                    <b-form-invalid-feedback id="date-feedback">{{
                                            validationContext.errors[0]
                                        }}
                                    </b-form-invalid-feedback>
                                </b-form-group>
                            </validation-provider>
                        </b-col>

                        <!-- Reference  -->
                        <b-col lg="6" md="12" sm="12">
                            <b-form-group :label="$t('Reference')">
                                <b-form-input
                                    disabled="disabled"
                                    label="Reference"
                                    :placeholder="$t('Reference')"
                                    v-model="payment.Ref"
                                ></b-form-input>
                            </b-form-group>
                        </b-col>

                        <!-- Amount  -->
                        <b-col lg="6" md="12" sm="12">
                            <validation-provider
                                name="Amount"
                                :rules="{ required: true , regex: /^\d*\.?\d*$/}"
                                v-slot="validationContext"
                            >
                                <b-form-group :label="$t('Amount')">
                                    <b-form-input
                                        label="Amount"
                                        :placeholder="$t('Amount')"
                                        v-model="payment.montant"
                                        :state="getValidationState(validationContext)"
                                        aria-describedby="Amount-feedback"
                                    ></b-form-input>
                                    <b-form-invalid-feedback id="Amount-feedback">{{
                                            validationContext.errors[0]
                                        }}
                                    </b-form-invalid-feedback>
                                </b-form-group>
                            </validation-provider>
                        </b-col>

                        <!-- Payment choice -->
                        <b-col lg="6" md="12" sm="12">
                            <validation-provider name="Payment choice" :rules="{ required: true}">
                                <b-form-group slot-scope="{ valid, errors }" :label="$t('Paymentchoice')">
                                    <v-select
                                        :class="{'is-invalid': !!errors.length}"
                                        :state="errors[0] ? false : (valid ? true : null)"
                                        v-model="payment.Reglement"
                                        @input="Selected_PaymentMethod"
                                        :disabled="EditPaiementMode && payment.Reglement == 'credit card' && 1===2"
                                        :reduce="label => label.value"
                                        :placeholder="$t('PleaseSelect')"
                                        :options="
                                              [
                                                    {label: 'Cash', value: 'Cash'},
                                                    {label: 'Mpesa', value: 'Mpesa'},
                                                    {label: 'Credit', value: 'Credit'},
                                                    {label: 'Credit Card', value: 'Credit card'},
                                                    {label: 'Complimentary', value: 'Complimentary'},
                                                    {label: 'Other', value: 'other'},
                                              ]"
                                    ></v-select>
                                    <b-form-invalid-feedback>{{ errors[0] }}</b-form-invalid-feedback>
                                </b-form-group>
                            </validation-provider>
                        </b-col>
                        <!-- Note -->
                        <b-col lg="12" md="12" sm="12" class="mt-3">
                            <b-form-group :label="$t('Note')">
                                <b-form-textarea id="textarea" v-model="payment.notes" rows="3"
                                                 max-rows="6"></b-form-textarea>
                            </b-form-group>
                        </b-col>
                        <b-col lg="12" md="12" sm="12" class="mt-3">

                            <b-form-checkbox
                                id="checkbox-1"
                                v-model="print_receipt"
                                name="checkbox-1"
                                value="1"
                                unchecked-value="2">
                                Print Receipt?
                            </b-form-checkbox>

                        </b-col>
                        <b-col md="12" class="mt-3">
                            <b-button
                                variant="primary"
                                type="submit"
                                :disabled="paymentProcessing"
                            >{{ $t('submit') }}
                            </b-button>
                            <div v-once class="typo__p" v-if="paymentProcessing">
                                <div class="spinner sm spinner-primary mt-3"></div>
                            </div>
                        </b-col>
                    </b-row>
                </b-form>
            </b-modal>
        </validation-observer>

        <!-- Modal Show Invoice POS-->
        <b-modal hide-footer size="md" scrollable id="Show_invoice" :title="$t('Invoice_POS')">
            <vue-easy-print table-show ref="Show_invoice">
                <div id="invoice-POS">
                    <h6 class="text-right">{{ $t('date') }} : {{ invoice_pos.sale.date }}</h6>
                    <center id="top">
                        <div class="logo">
                            <img :src="'/images/' + invoice_pos.setting.logo">
                        </div>
                        <div class="info">
                            <h3>{{ invoice_pos.setting.CompanyName }}</h3>
                        </div>
                    </center>

                    <div class="info">
                        <h6>{{ $t('Adress') }} : {{ invoice_pos.setting.CompanyAdress }}</h6>
                        <h6>{{ $t('Email') }} : {{ invoice_pos.setting.email }}</h6>
                        <h6>{{ $t('Phone') }} : {{ invoice_pos.setting.CompanyPhone }}</h6>
                        <h6>{{ $t('Customer') }} : {{ invoice_pos.sale.client_name }}</h6>
                    </div>

                    <table class="mt-3 ml-2 table-md">
                        <thead>
                        <tr>
                            <th scope="col">{{ $t('ProductName') }}</th>
                            <th scope="col">{{ $t('Qty') }}</th>
                            <th scope="col">{{ $t('Total') }}</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr v-for="detail_invoice in invoice_pos.details">
                            <td>{{ detail_invoice.name }}</td>
                            <td>{{ formatNumber(detail_invoice.quantity, 2) }} {{ detail_invoice.unit_sale }}</td>
                            <td>{{ formatNumber(detail_invoice.total, 2) }}</td>
                        </tr>
                        <tr>
                            <th></th>
                            <th>{{ $t('Tax') }}</th>
                            <td>{{ formatNumber(invoice_pos.sale.taxe, 2) }}
                                ({{ formatNumber(invoice_pos.sale.tax_rate, 2) }} %)
                            </td>
                        </tr>
                        <tr>
                            <th></th>
                            <th>{{ $t('Discount') }}</th>
                            <td>{{ formatNumber(invoice_pos.sale.discount, 2) }}</td>
                        </tr>
                        <tr>
                            <th></th>
                            <th>{{ $t('Shipping') }}</th>
                            <td>{{ formatNumber(invoice_pos.sale.shipping, 2) }}</td>
                        </tr>
                        </tbody>
                    </table>
                    <table id="total" class="mt-2 ml-2">
                        <tbody>
                        <tr>
                            <th class="p-1 w-75">{{ $t('SubTotal') }}</th>
                            <th
                                class="p-1 w-25"
                            >{{ invoice_pos.symbol }} {{ formatNumber(invoice_pos.sale.GrandTotal, 2) }}
                            </th>
                        </tr>
                        </tbody>
                    </table>

                    <div id="legalcopy" class="ml-2">
                        <p class="legal">
                            <strong>{{ $t('Thank_you_for_your_business') }}</strong>
                        </p>
                        <div id="bar">
                            <barcode
                                class="barcode"
                                :format="barcodeFormat"
                                :value="invoice_pos.sale.Ref"
                                textmargin="0"
                                fontoptions="bold"
                                height="25"
                            ></barcode>
                        </div>
                    </div>
                </div>
            </vue-easy-print>
            <button @click="print_it()" class="btn btn-outline-primary">
                <i class="i-Billing"></i>
                {{ $t('print') }}
            </button>
        </b-modal>
    </div>
</template>

<script>
import {mapActions, mapGetters} from "vuex";
import NProgress from "nprogress";
import jsPDF from "jspdf";
import "jspdf-autotable";
import vueEasyPrint from "vue-easy-print";
import VueBarcode from "vue-barcode";

export default {
    components: {
        vueEasyPrint,
        barcode: VueBarcode
    },
    metaInfo: {
        title: "Sales"
    },
    data() {
        return {
            print_receipt: "2",
            cardElement: {},
            paymentProcessing: false,
            isLoading: true,
            serverParams: {
                sort: {
                    field: "id",
                    type: "desc"
                },
                page: 1,
                perPage: 10
            },
            selectedIds: [],
            search: "",
            totalRows: "",
            barcodeFormat: "CODE128",
            showDropdown: false,
            EditPaiementMode: false,
            Filter_Client: "",
            Filter_Waiter: "",
            Filter_Ref: "",
            Filter_date: "",
            Filter_status: "",
            Filter_Payment: "",
            Filter_warehouse: "",
            customers: [],
            waiters: [],
            warehouses: [],
            sales: [],
            invoice_pos: {
                sale: {
                    Ref: "",
                    client_name: "",
                    discount: "",
                    taxe: "",
                    tax_rate: "",
                    shipping: "",
                    GrandTotal: ""
                },
                details: [],
                setting: {
                    logo: "",
                    CompanyName: "",
                    CompanyAdress: "",
                    email: "",
                    CompanyPhone: ""
                }
            },
            payments: [],
            payment: {},
            Sale_id: "",
            limit: "10",
            sale: {},
            email: {
                to: "",
                subject: "",
                message: "",
                client_name: "",
                Sale_Ref: ""
            },
            emailPayment: {
                id: "",
                to: "",
                subject: "",
                message: "",
                client_name: "",
                Ref: ""
            }
        };
    },
    mounted() {
        this.$root.$on("bv::dropdown::show", bvEvent => {
            this.showDropdown = true;
        });
        this.$root.$on("bv::dropdown::hide", bvEvent => {
            this.showDropdown = false;
        });
    },
    computed: {
        ...mapGetters(["currentUserPermissions", "currentUser"]),
        columns() {
            return [
                {
                    label: this.$t("Reference"),
                    field: "Ref",
                    tdClass: "text-left",
                    thClass: "text-left"
                },
                {
                    label: "Date",
                    field: "date",
                    tdClass: "text-left",
                    thClass: "text-left"
                },
                {
                    label: this.$t("Customer"),
                    field: "client_name",
                    tdClass: "text-left",
                    thClass: "text-left"
                },
                {
                    label: 'User',
                    field: "served_by",
                    tdClass: "text-left",
                    thClass: "text-left"
                },
                {
                    label: this.$t("warehouse"),
                    field: "warehouse_name",
                    tdClass: "text-left",
                    thClass: "text-left"
                },
                {
                    label: this.$t("Status"),
                    field: "statut",
                    html: true,
                    tdClass: "text-left",
                    thClass: "text-left"
                },
                {
                    label: this.$t("Total"),
                    field: "GrandTotal",
                    tdClass: "text-left",
                    thClass: "text-left"
                },
                {
                    label: this.$t("Paid"),
                    field: "paid_amount",
                    tdClass: "text-left",
                    thClass: "text-left"
                },
                {
                    label: this.$t("Due"),
                    field: "due",
                    tdClass: "text-left",
                    thClass: "text-left"
                },
                {
                    label: this.$t("PaymentStatus"),
                    field: "payment_status",
                    html: true,
                    tdClass: "text-left",
                    thClass: "text-left"
                },
                {
                    label: "Method",
                    field: "payment_method",
                    html: true,
                    tdClass: "text-left",
                    thClass: "text-left"
                },
                {
                    label: this.$t("Action"),
                    field: "actions",
                    html: true,
                    tdClass: "text-right",
                    thClass: "text-right",
                    sortable: false
                }
            ];
        }
    },
    methods: {
        //---------------------- Event Select Payment Method ------------------------------\\
        Selected_PaymentMethod(value) {

        },
        //---- print Invoice
        print_it() {
            this.$refs.Show_invoice.print();
        },
        //---- update Params Table
        updateParams(newProps) {
            this.serverParams = Object.assign({}, this.serverParams, newProps);
        },
        //---- Event Page Change
        onPageChange({currentPage}) {
            if (this.serverParams.page !== currentPage) {
                this.updateParams({page: currentPage});
                this.Get_Sales(currentPage);
            }
        },
        //---- Event Per Page Change
        onPerPageChange({currentPerPage}) {
            if (this.limit !== currentPerPage) {
                this.limit = currentPerPage;
                this.updateParams({page: 1, perPage: currentPerPage});
                this.Get_Sales(1);
            }
        },
        //---- Event Select Rows
        selectionChanged({selectedRows}) {
            this.selectedIds = [];
            selectedRows.forEach((row, index) => {
                this.selectedIds.push(row.id);
            });
        },
        //---- Event Sort change
        onSortChange(params) {
            let field = "";
            if (params[0].field === "client_name") {
                field = "client_id";
            } else if (params[0].field === "warehouse_name") {
                field = "warehouse_id";
            }else if (params[0].field === "served_by") {
                field = "user_id";
            } else {
                field = params[0].field;
            }
            this.updateParams({
                sort: {
                    type: params[0].type,
                    field: field
                }
            });
            this.Get_Sales(this.serverParams.page);
        },
        onSearch(value) {
            this.search = value.searchTerm;
            this.Get_Sales(this.serverParams.page);
        },
        //------ Validate Form Submit_Payment
        Submit_Payment() {
            this.$refs.Add_payment.validate().then(success => {
                if (!success) {
                    return;
                } else {
                    if (!this.EditPaiementMode) {
                        this.Create_Payment();
                    } else {
                        this.Update_Payment();
                    }
                }
            });
        },
        //---Validate State Fields
        getValidationState({dirty, validated, valid = null}) {
            return dirty || validated ? valid : null;
        },
        //------ Toast
        makeToast(variant, msg, title) {
            this.$root.$bvToast.toast(msg, {
                title: title,
                variant: variant,
                solid: true
            });
        },
        //------ Reset Filter
        Reset_Filter() {
            this.search = "";
            this.Filter_Client = "";
            this.Filter_Waiter = "";
            this.Filter_status = "";
            this.Filter_Payment = "";
            this.Filter_Ref = "";
            this.Filter_date = "";
            (this.Filter_warehouse = ""), this.Get_Sales(this.serverParams.page);
        },
        //------------------------------Formetted Numbers -------------------------\\
        formatNumber(number, dec) {
            const value = (typeof number === "string"
                    ? number
                    : number.toString()
            ).split(".");
            if (dec <= 0) return value[0];
            let formated = value[1] || "";
            if (formated.length > dec)
                return `${value[0]}.${formated.substr(0, dec)}`;
            while (formated.length < dec) formated += "0";
            return `${value[0]}.${formated}`;
        },
        //----------------------------------- Sales PDF ------------------------------\\
        Sales_PDF() {
            var self = this;
            let pdf = new jsPDF("p", "pt");
            let columns = [
                {title: "Ref", dataKey: "Ref"},
                {title: "Owner", dataKey: "served_by"},
                {title: "Date", dataKey: "date"},
                {title: "Client", dataKey: "client_name"},
                {title: "Status", dataKey: "statut"},
                {title: "Total", dataKey: "GrandTotal"},
                {title: "Paid", dataKey: "paid_amount"},
                {title: "Due", dataKey: "due"},
                {title: "Status Payment", dataKey: "payment_status"}
            ];
            const total = self.sales.reduce((accumulator, item) => {
                console.log(item)
                return accumulator += parseFloat(item.GrandTotal)
            }, 0);

            const paid = self.sales.reduce((accumulator, item) => {
                return accumulator += parseFloat(item.paid_amount)
            }, 0);

            const due = self.sales.reduce((accumulator, item) => {
                return accumulator += parseFloat(item.due)
            }, 0);


            const data = [...this.sales];
            data.push({
                Ref:"",
                served_by:"",
                date:"",
                client_name:"",
                statut:"TOTALS",
                GrandTotal: total,
                paid_amount:paid,
                due: due,
                payment_status:""
            })

            pdf.autoTable(columns, data);
            pdf.text(`Sale List`, 40, 25);
            pdf.save("Sale_List.pdf");
        },
        //-------------------------------- Invoice POS ------------------------------\\
        Invoice_POS(id) {
            // Start the progress bar.
            NProgress.start();
            NProgress.set(0.1);
            axios
                .get("Sales/Print_Invoice/" + id)
                .then(response => {
                    this.invoice_pos = response.data;
                    setTimeout(() => {
                        // Complete the animation of the  progress bar.
                        NProgress.done();
                        this.$bvModal.show("Show_invoice");
                    }, 500);
                    setTimeout(() => this.print_it(), 1000);
                })
                .catch(() => {
                    // Complete the animation of the  progress bar.
                    setTimeout(() => NProgress.done(), 500);
                });
        },
        //-------------------------------- Sales Excel ------------------------------\\
        Sales_Excel() {
            // Start the progress bar.
            NProgress.start();
            NProgress.set(0.1);
            axios
                .get("sales/export/Excel", {
                    responseType: "blob", // important
                    headers: {
                        "Content-Type": "application/json"
                    }
                })
                .then(response => {
                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement("a");
                    link.href = url;
                    link.setAttribute("download", "List_Sales.xlsx");
                    document.body.appendChild(link);
                    link.click();
                    // Complete the animation of the  progress bar.
                    setTimeout(() => NProgress.done(), 500);
                })
                .catch(() => {
                    // Complete the animation of the  progress bar.
                    setTimeout(() => NProgress.done(), 500);
                });
        },
        //-----------------------------  Invoice PDF ------------------------------\\
        Invoice_PDF(sale, id) {
            // Start the progress bar.
            NProgress.start();
            NProgress.set(0.1);
            axios
                .get("Sale_PDF/" + id, {
                    responseType: "blob", // important
                    headers: {
                        "Content-Type": "application/json"
                    }
                })
                .then(response => {
                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement("a");
                    link.href = url;
                    link.setAttribute("download", "Sale-" + sale.Ref + ".pdf");
                    document.body.appendChild(link);
                    link.click();
                    // Complete the animation of the  progress bar.
                    setTimeout(() => NProgress.done(), 500);
                })
                .catch(() => {
                    // Complete the animation of the  progress bar.
                    setTimeout(() => NProgress.done(), 500);
                });
        },
        //------------------------ Payments Sale PDF ------------------------------\\
        Payment_Sale_PDF(payment, id) {
            // Start the progress bar.
            NProgress.start();
            NProgress.set(0.1);

            axios
                .get("payment_Sale_PDF/" + id, {
                    responseType: "blob", // important
                    headers: {
                        "Content-Type": "application/json"
                    }
                })
                .then(response => {
                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement("a");
                    link.href = url;
                    link.setAttribute("download", "Payment-" + payment.Ref + ".pdf");
                    document.body.appendChild(link);
                    link.click();
                    // Complete the animation of the  progress bar.
                    setTimeout(() => NProgress.done(), 500);
                })
                .catch(() => {
                    // Complete the animation of the  progress bar.
                    setTimeout(() => NProgress.done(), 500);
                });
        },
        //---------------------------------------- Set To Strings-------------------------\\
        setToStrings() {
            // Simply replaces null values with strings=''
            if (this.Filter_Client === null) {
                this.Filter_Client = "";
            } else if (this.Filter_warehouse === null) {
                this.Filter_warehouse = "";
            } else if (this.Filter_Waiter === null) {
                this.Filter_Waiter = "";
            } else if (this.Filter_status === null) {
                this.Filter_status = "";
            } else if (this.Filter_Payment === null) {
                this.Filter_Payment = "";
            }
        },
        //----------------------------------------- Get all Sales ------------------------------\\
        Get_Sales(page) {
            // Start the progress bar.
            NProgress.start();
            NProgress.set(0.1);
            this.setToStrings();
            axios
                .get(
                    "sales?page=" +
                    page +
                    "&Ref=" +
                    this.Filter_Ref +
                    "&date=" +
                    this.Filter_date +
                    "&client_id=" +
                    this.Filter_Client +
                    "&user_id=" +
                    this.Filter_Waiter +
                    "&statut=" +
                    this.Filter_status +
                    "&warehouse_id=" +
                    this.Filter_warehouse +
                    "&payment_statut=" +
                    this.Filter_Payment +
                    "&SortField=" +
                    this.serverParams.sort.field +
                    "&SortType=" +
                    this.serverParams.sort.type +
                    "&search=" +
                    this.search +
                    "&limit=" +
                    this.limit
                )
                .then(response => {
                    this.sales = response.data.sales;
                    this.customers = response.data.customers;
                    this.waiters = response.data.waiters;
                    this.warehouses = response.data.warehouses;
                    this.totalRows = response.data.totalRows;

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

        //---------SMS notification
        Payment_Sale_SMS(payment) {
            // Start the progress bar.
            NProgress.start();
            NProgress.set(0.1);
            axios
                .post("payment/sale/send/sms", {
                    id: payment.id,
                })
                .then(response => {
                    // Complete the animation of the  progress bar.
                    setTimeout(() => NProgress.done(), 500);
                    this.makeToast(
                        "success",
                        this.$t("Send_SMS"),
                        this.$t("Success")
                    );
                })
                .catch(error => {
                    // Complete the animation of the  progress bar.
                    setTimeout(() => NProgress.done(), 500);
                    this.makeToast("danger", this.$t("sms_config_invalid"), this.$t("Failed"));
                });
        },


        //--------------------------------------------- Send Payment to Email -------------------------------\\
        EmailPayment(payment, sale) {
            this.emailPayment.id = payment.id;
            this.emailPayment.to = sale.client_email;
            this.emailPayment.Ref = payment.Ref;
            this.emailPayment.client_name = sale.client_name;
            this.Send_Email_Payment();
        },
        Send_Email_Payment() {
            // Start the progress bar.
            NProgress.start();
            NProgress.set(0.1);
            axios
                .post("payment/sale/send/email", {
                    id: this.emailPayment.id,
                    to: this.emailPayment.to,
                    client_name: this.emailPayment.client_name,
                    Ref: this.emailPayment.Ref
                })
                .then(response => {
                    // Complete the animation of the  progress bar.
                    setTimeout(() => NProgress.done(), 500);
                    this.makeToast(
                        "success",
                        this.$t("Send.TitleEmail"),
                        this.$t("Success")
                    );
                })
                .catch(error => {
                    // Complete the animation of the  progress bar.
                    setTimeout(() => NProgress.done(), 500);
                    this.makeToast("danger", this.$t("SMTPIncorrect"), this.$t("Failed"));
                });
        },
        //--------------------------------- Send Sale in Email ------------------------------\\
        Sale_Email(sale) {
            this.email.to = sale.client_email;
            this.email.Sale_Ref = sale.Ref;
            this.email.client_name = sale.client_name;
            this.Send_Email(sale.id);
        },
        Send_Email(id) {
            // Start the progress bar.
            NProgress.start();
            NProgress.set(0.1);
            axios
                .post("sales/send/email", {
                    id: id,
                    to: this.email.to,
                    client_name: this.email.client_name,
                    Ref: this.email.Sale_Ref
                })
                .then(response => {
                    // Complete the animation of the  progress bar.
                    setTimeout(() => NProgress.done(), 500);
                    this.makeToast(
                        "success",
                        this.$t("Send.TitleEmail"),
                        this.$t("Success")
                    );
                })
                .catch(error => {
                    // Complete the animation of the  progress bar.
                    setTimeout(() => NProgress.done(), 500);
                    this.makeToast("danger", this.$t("SMTPIncorrect"), this.$t("Failed"));
                });
        },
        Number_Order_Payment() {
            axios
                .get("payment/sale/Number/Order")
                .then(({data}) => (this.payment.Ref = data));
        },
        //----------------------------------- New Payment Sale ------------------------------\\
        printPaymentReceipt(sale,type){
            axios.get(`payments/${sale.id}/print/${type}`)
                .then(response => {
                    //this.paymentProcessing = false;
                    //Fire.$emit("Create_Facture_sale");
                    NProgress.done();
                    this.makeToast(
                        "success",
                        'Printed Payment Receipt Successfully',
                        this.$t("Success")
                    );
                })
                .catch(error => {
                    // this.paymentProcessing = false;
                    // Complete the animation of the  progress bar.
                    NProgress.done();
                    this.makeToast("danger", this.$t("InvalidData"), this.$t("Failed"));
                });
        },
        New_Payment(sale) {
            if (sale.payment_status == "paid") {
                this.$swal({
                    icon: "error",
                    title: "Oops...",
                    text: this.$t("PaymentComplete")
                });
            } else {
                // Start the progress bar.
                NProgress.start();
                NProgress.set(0.1);
                this.reset_form_payment();
                this.EditPaiementMode = false;
                this.sale = sale;
                this.payment.date = new Date().toISOString().slice(0, 10);
                this.Number_Order_Payment();
                this.payment.montant = sale.due;
                setTimeout(() => {
                    // Complete the animation of the  progress bar.
                    NProgress.done();
                    this.$bvModal.show("Add_Payment");
                }, 500);
            }
        },
        //------------------------------------Edit Payment ------------------------------\\
        Edit_Payment(payment) {
            // Start the progress bar.
            NProgress.start();
            NProgress.set(0.1);
            this.reset_form_payment();
            this.payment = payment;
            this.EditPaiementMode = true;
            setTimeout(() => {
                // Complete the animation of the  progress bar.
                NProgress.done();
                this.$bvModal.show("Add_Payment");
            }, 500);
        },
        //-------------------------------Show All Payment with Sale ---------------------\\
        Show_Payments(id, sale) {
            // Start the progress bar.
            NProgress.start();
            NProgress.set(0.1);
            this.reset_form_payment();
            this.Sale_id = id;
            this.sale = sale;
            this.Get_Payments(id);
        },

        //-------------------------------Clear A Sale ---------------------\\
        clear_payment(id, sale) {
            // Start the progress bar.
            NProgress.start();
            NProgress.set(0.1);
            console.log(id)
            console.log(sale)
            axios.get(`sales/${id}/clear`)
                .then(response => {
                    //this.paymentProcessing = false;
                    //Fire.$emit("Create_Facture_sale");
                    NProgress.done();
                    this.makeToast(
                        "success",
                        'Sale cleared successfully',
                        this.$t("Success")
                    );
                })
                .catch(error => {
                    // this.paymentProcessing = false;
                    // Complete the animation of the  progress bar.
                    NProgress.done();
                    this.makeToast("danger", this.$t("InvalidData"), this.$t("Failed"));
                });
        },
        //----------------------------------Process Payment (Mode Create) ------------------------------\\
        async processPayment_Create() {

                axios
                    .post("payment/sale", {
                        sale_id: this.sale.id,
                        client_email: this.sale.client_email,
                        client_id: this.sale.client_id,
                        date: this.payment.date,
                        montant: this.payment.montant,
                        Reglement: this.payment.Reglement,
                        notes: this.payment.notes,
                        token: token.id
                    })
                    .then(response => {
                        this.paymentProcessing = false;
                        Fire.$emit("Create_Facture_sale");
                        this.makeToast(
                            "success",
                            this.$t("Create.TitlePayment"),
                            this.$t("Success")
                        );
                    })
                    .catch(error => {
                        this.paymentProcessing = false;
                        // Complete the animation of the  progress bar.
                        NProgress.done();
                        this.makeToast("danger", this.$t("InvalidData"), this.$t("Failed"));
                    });

        },
        //----------------------------------Process Payment (Mode Edit) ------------------------------\\
        async processPayment_Update() {
                axios
                    .put("payment/sale/" + this.payment.id, {
                        sale_id: this.sale.id,
                        client_email: this.sale.client_email,
                        client_id: this.sale.client_id,
                        date: this.payment.date,
                        montant: this.payment.montant,
                        Reglement: this.payment.Reglement,
                        notes: this.payment.notes,
                        token: token.id
                    })
                    .then(response => {
                        this.paymentProcessing = false;
                        Fire.$emit("Update_Facture_sale");
                        this.makeToast(
                            "success",
                            this.$t("Update.TitlePayment"),
                            this.$t("Success")
                        );
                    })
                    .catch(error => {
                        this.paymentProcessing = false;
                        // Complete the animation of the  progress bar.
                        NProgress.done();
                        this.makeToast("danger", this.$t("InvalidData"), this.$t("Failed"));
                    });

        },
        //----------------------------------Create Payment sale ------------------------------\\
        Create_Payment() {
            this.paymentProcessing = true;
            NProgress.start();
            NProgress.set(0.1);
            axios
                .post("payment/sale", {
                    sale_id: this.sale.id,
                    date: this.payment.date,
                    montant: this.payment.montant,
                    Reglement: this.payment.Reglement,
                    notes: this.payment.notes,
                    print_receipt: this.print_receipt
                })
                .then(response => {
                    this.paymentProcessing = false;
                    Fire.$emit("Create_Facture_sale");
                    this.makeToast(
                        "success",
                        this.$t("Create.TitlePayment"),
                        this.$t("Success")
                    );
                })
                .catch(error => {
                    this.paymentProcessing = false;
                    NProgress.done();
                });
        },
        //---------------------------------------- Update Payment ------------------------------\\
        Update_Payment() {
            this.paymentProcessing = true;
            NProgress.start();
            NProgress.set(0.1);
            axios
                .put("payment/sale/" + this.payment.id, {
                    sale_id: this.sale.id,
                    date: this.payment.date,
                    montant: this.payment.montant,
                    Reglement: this.payment.Reglement,
                    notes: this.payment.notes
                })
                .then(response => {
                    this.paymentProcessing = false;
                    Fire.$emit("Update_Facture_sale");
                    this.makeToast(
                        "success",
                        this.$t("Update.TitlePayment"),
                        this.$t("Success")
                    );
                })
                .catch(error => {
                    this.paymentProcessing = false;
                    NProgress.done();
                });

        },
        //----------------------------------------- Remove Payment ------------------------------\\
        Remove_Payment(id) {
            this.$swal({
                title: this.$t("Delete.Title"),
                text: this.$t("Delete.Text"),
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                cancelButtonText: this.$t("Delete.cancelButtonText"),
                confirmButtonText: this.$t("Delete.confirmButtonText")
            }).then(result => {
                if (result.value) {
                    // Start the progress bar.
                    NProgress.start();
                    NProgress.set(0.1);
                    axios
                        .delete("payment/sale/" + id)
                        .then(() => {
                            this.$swal(
                                this.$t("Delete.Deleted"),
                                this.$t("Delete.PaymentDeleted"),
                                "success"
                            );
                            Fire.$emit("Delete_Facture_sale");
                        })
                        .catch(() => {
                            // Complete the animation of the  progress bar.
                            setTimeout(() => NProgress.done(), 500);
                            this.$swal(
                                this.$t("Delete.Failed"),
                                this.$t("Delete.Therewassomethingwronge"),
                                "warning"
                            );
                        });
                }
            });
        },
        //----------------------------------------- Get Payments  -------------------------------\\
        Get_Payments(id) {
            axios
                .get("sales/payments/" + id)
                .then(response => {
                    this.payments = response.data;
                    setTimeout(() => {
                        // Complete the animation of the  progress bar.
                        NProgress.done();
                        this.$bvModal.show("Show_payment");
                    }, 500);
                })
                .catch(() => {
                    // Complete the animation of the  progress bar.
                    setTimeout(() => NProgress.done(), 500);
                });
        },
        //------------------------------------------ Reset Form Payment ------------------------------\\
        reset_form_payment() {
            this.payment = {
                id: "",
                Sale_id: "",
                date: "",
                Ref: "",
                montant: "",
                Reglement: "",
                notes: ""
            };
        },
        //------------------------------------------ Remove Sale ------------------------------\\
        Remove_Sale(id) {
            this.$swal({
                title: this.$t("Delete.Title"),
                text: this.$t("Delete.Text"),
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                cancelButtonText: this.$t("Delete.cancelButtonText"),
                confirmButtonText: this.$t("Delete.confirmButtonText")
            }).then(result => {
                if (result.value) {
                    // Start the progress bar.
                    NProgress.start();
                    NProgress.set(0.1);
                    axios
                        .delete("sales/" + id)
                        .then(() => {
                            this.$swal(
                                this.$t("Delete.Deleted"),
                                this.$t("Delete.SaleDeleted"),
                                "success"
                            );
                            Fire.$emit("Delete_sale");
                        })
                        .catch(() => {
                            // Complete the animation of the  progress bar.
                            setTimeout(() => NProgress.done(), 500);
                            this.$swal(
                                this.$t("Delete.Failed"),
                                this.$t("Delete.Therewassomethingwronge"),
                                "warning"
                            );
                        });
                }
            });
        },
        //---- Delete sales by selection
        delete_by_selected() {
            this.$swal({
                title: this.$t("Delete.Title"),
                text: this.$t("Delete.Text"),
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                cancelButtonText: this.$t("Delete.cancelButtonText"),
                confirmButtonText: this.$t("Delete.confirmButtonText")
            }).then(result => {
                if (result.value) {
                    // Start the progress bar.
                    NProgress.start();
                    NProgress.set(0.1);
                    axios
                        .post("sales/delete/by_selection", {
                            selectedIds: this.selectedIds
                        })
                        .then(() => {
                            this.$swal(
                                this.$t("Delete.Deleted"),
                                this.$t("Delete.SaleDeleted"),
                                "success"
                            );
                            Fire.$emit("Delete_sale");
                        })
                        .catch(() => {
                            // Complete the animation of theprogress bar.
                            setTimeout(() => NProgress.done(), 500);
                            this.$swal(
                                this.$t("Delete.Failed"),
                                this.$t("Delete.Therewassomethingwronge"),
                                "warning"
                            );
                        });
                }
            });
        }
    },
    //----------------------------- Created function-------------------\\
    created() {
        this.Get_Sales(1);
        Fire.$on("Create_Facture_sale", () => {
            setTimeout(() => {
                this.Get_Sales(this.serverParams.page);
                // Complete the animation of the  progress bar.
                NProgress.done();
                this.$bvModal.hide("Add_Payment");
            }, 500);
        });
        Fire.$on("Update_Facture_sale", () => {
            setTimeout(() => {
                this.Get_Payments(this.Sale_id);
                this.Get_Sales(this.serverParams.page);
                // Complete the animation of the  progress bar.
                NProgress.done();
                this.$bvModal.hide("Add_Payment");
            }, 500);
        });
        Fire.$on("Delete_Facture_sale", () => {
            setTimeout(() => {
                this.Get_Payments(this.Sale_id);
                this.Get_Sales(this.serverParams.page);
                // Complete the animation of the  progress bar.
                NProgress.done();
            }, 500);
        });
        Fire.$on("Delete_sale", () => {
            setTimeout(() => {
                this.Get_Sales(this.serverParams.page);
                // Complete the animation of the  progress bar.
                NProgress.done();
            }, 500);
        });
    }
};
</script>
