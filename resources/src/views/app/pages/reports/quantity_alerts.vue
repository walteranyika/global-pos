<template>
  <div class="main-content">
    <breadcumb :page="$t('ProductQuantityAlerts')" :folder="$t('Reports')"/>
    <div v-if="isLoading" class="loading_page spinner spinner-primary mr-3"></div>
    <div v-else>
      <vue-good-table
              mode="remote"
              :columns="columns"
              :totalRows="totalRows"
              :rows="purchases"
              @on-page-change="onPageChange"
              @on-per-page-change="onPerPageChange"
              @on-sort-change="onSortChange"
              @on-search="onSearch"
              :search-options="{
        placeholder: $t('Search_this_table'),
        enabled: true,
      }"
              :select-options="{
          enabled: false ,
          clearSelectionText: '',
        }"
              @on-selected-rows-change="selectionChanged"
              :pagination-options="{
          enabled: true,
          mode: 'records',
          nextLabel: 'next',
          prevLabel: 'prev',
        }"
              :styleClass="showDropdown?'tableOne table-hover vgt-table full-height':'tableOne table-hover vgt-table non-height'"
      >

        <div slot="table-actions" class="mt-2 mb-3">
          <b-button @click="Purchase_PDF()" size="sm" variant="outline-success ripple m-1">
            <i class="i-File-Copy"></i> PDF
          </b-button>
        </div>

      </vue-good-table>
    </div>

  </div>
</template>

<script>
  import { mapActions, mapGetters } from "vuex";
  import NProgress from "nprogress";
  import jsPDF from "jspdf";
  import "jspdf-autotable";

  export default {
    metaInfo: {
      title: "Stock Alert"
    },

    data() {
      return {
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
        showDropdown: false,
        EditPaiementMode: false,
        Filter_Supplier: "",
        Filter_status: "",
        Filter_Payment: "",
        Filter_warehouse: "",
        Filter_Ref: "",
        Filter_date: "",
        Purchase_id: "",
        suppliers: [],
        warehouses: [],
        details: [],
        purchases: [],
        purchase: {},
        factures: [],
        facture: {},
        limit: "10",
/*        email: {
          to: "",
          subject: "",
          message: "",
          client_name: "",
          purchase_Ref: ""
        },
        emailPayment: {
          id: "",
          to: "",
          subject: "",
          message: "",
          client_name: "",
          Ref: ""
        }*/
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
            label: this.$t("ProductCode"),
            field: "code",
            tdClass: "text-left",
            thClass: "text-left",
            sortable: false
          },
          {
            label: this.$t("ProductName"),
            field: "name",
            tdClass: "text-left",
            thClass: "text-left",
            sortable: false
          },
          {
            label: this.$t("warehouse"),
            field: "warehouse",
            tdClass: "text-left",
            thClass: "text-left",
            sortable: false
          },
          {
            label: this.$t("Quantity"),
            field: "quantity",
            tdClass: "text-left",
            thClass: "text-left",
            sortable: false
          },
          {
            label: this.$t("AlertQuantity"),
            field: "stock_alert",
            tdClass: "text-left",
            thClass: "text-left",
            sortable: false
          }
/*          {
            label: this.$t("Reference"),
            field: "Ref",
            tdClass: "text-left",
            thClass: "text-left"
          },
          {
            label: this.$t("Supplier"),
            field: "provider_name",
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
            // type: "decimal",
            tdClass: "text-left",
            thClass: "text-left"
          },
          {
            label: this.$t("Paid"),
            field: "paid_amount",
            // type: "decimal",
            tdClass: "text-left",
            thClass: "text-left"
          },
          {
            label: this.$t("Due"),
            field: "due",
            // type: "decimal",
            tdClass: "text-left",
            thClass: "text-left"
          },
          {
            label: this.$t("PaymentStatus"),
            field: "payment_status",
            html: true,
            tdClass: "text-left",
            thClass: "text-left"
          },*/
        ];
      }
    },

    methods: {

      updateParams(newProps) {
        this.serverParams = Object.assign({}, this.serverParams, newProps);
      },

      //---- Event Page Change
      onPageChange({ currentPage }) {
        if (this.serverParams.page !== currentPage) {
          this.updateParams({ page: currentPage });
          this.Get_Purchases(currentPage);
        }
      },

      //---- Event Per Page Change
      onPerPageChange({ currentPerPage }) {
        if (this.limit !== currentPerPage) {
          this.limit = currentPerPage;
          this.updateParams({ page: 1, perPage: currentPerPage });
          this.Get_Purchases(1);
        }
      },

      //---- Event Select Rows
      selectionChanged({ selectedRows }) {
        this.selectedIds = [];
        selectedRows.forEach((row, index) => {
          this.selectedIds.push(row.id);
        });
      },

      //---- Event on Sort Change
      onSortChange(params) {
        let field = "";
        if (params[0].field == "provider_name") {
          field = "provider_id";
        } else if (params[0].field == "warehouse_name") {
          field = "warehouse_id";
        } else {
          field = params[0].field;
        }
        this.updateParams({
          sort: {
            type: params[0].type,
            field: field
          }
        });
        this.Get_Purchases(this.serverParams.page);
      },

      onSearch(value) {
        this.search = value.searchTerm;
        this.Get_Purchases(this.serverParams.page);
      },

      //------ Validate Form Submit_Payment
/*      Submit_Payment() {
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
      },*/

      //---Validate State Fields
      getValidationState({ dirty, validated, valid = null }) {
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
        this.Filter_Supplier = "";
        this.Filter_status = "";
        this.Filter_Payment = "";
        this.Filter_Ref = "";
        this.Filter_date = "";
        (this.Filter_warehouse = ""), this.Get_Purchases(this.serverParams.page);
      },

      //---------------------- Purchases PDF -------------------------------\\
      Purchase_PDF() {
        var self = this;

        let pdf = new jsPDF("p", "pt");
        let columns = [
          { title: "Item", dataKey: "name" },
          { title: "Quantity In Stock", dataKey: "quantity" },
          { title: "Alert Level", dataKey: "stock_alert" },
        ];
        pdf.autoTable(columns, self.purchases);
        pdf.text("Stock Alert "+this.warehouses[0].name, 40, 25);
        let today = new Date();
        let time = today.getHours() + "_" + today.getMinutes() + "_" + today.getSeconds();
        let date = today.getFullYear()+'_'+(today.getMonth()+1)+'_'+today.getDate();
        pdf.save("Stock_Alert_Date_"+date+"_"+time+".pdf");
      },

      setToStrings() {
        // Simply replaces null values with strings=''
        if (this.Filter_Supplier === null) {
          this.Filter_Supplier = "";
        } else if (this.Filter_warehouse === null) {
          this.Filter_warehouse = "";
        } else if (this.Filter_status === null) {
          this.Filter_status = "";
        } else if (this.Filter_Payment === null) {
          this.Filter_Payment = "";
        }
      },


      //------------------------------------------------ Get All Purchases -------------------------------\\
      Get_Purchases(page) {
          // Start the progress bar.
          NProgress.start();
          NProgress.set(0.1);
          axios
                  .get(
                          "Products/Stock/Alerts?page=" +
                          page +
                          "&warehouse=1" +
                          "&limit=" +
                          this.limit
                  )
                  .then(response => {
                    this.purchases = response.data.products.data;
                    this.warehouses = response.data.warehouses;
                    this.totalRows = response.data.products.total;
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


       /* NProgress.start();
        NProgress.set(0.1);
        this.setToStrings();
        axios
                .get(
                        "purchases?page=" +
                        page +
                        "&Ref=" +
                        this.Filter_Ref +
                        "&date=" +
                        this.Filter_date +
                        "&provider_id=" +
                        this.Filter_Supplier +
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
                  this.purchases = response.data.purchases;
                  this.suppliers = response.data.suppliers;
                  this.warehouses = response.data.warehouses;
                  this.totalRows = response.data.totalRows;

                  // Complete the animation of theprogress bar.
                  NProgress.done();
                  this.isLoading = false;
                })
                .catch(response => {
                  // Complete the animation of theprogress bar.
                  NProgress.done();
                  this.isLoading = false;
                });*/
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

      //------------------------------- Remove Purchase -------------------------\\

      reset_form_payment() {
        this.facture = {
          id: "",
          purchase_id: "",
          date: "",
          Ref: "",
          montant: "",
          Reglement: "",
          notes: ""
        };
      },

    },

    //-----------------------------Created function-------------------
    created: function() {
      this.Get_Purchases(1);

/*      Fire.$on("Delete_Purchase", () => {
        setTimeout(() => {
          this.Get_Purchases(this.serverParams.page);
          // Complete the animation of the  progress bar.
          NProgress.done();
        }, 500);
      });

      Fire.$on("Create_Facture_purchase", () => {
        setTimeout(() => {
          this.Get_Purchases(this.serverParams.page);
          // Complete the animation of the  progress bar.
          NProgress.done();
          this.$bvModal.hide("Add_Payment");
        }, 500);
      });

      Fire.$on("Update_Facture_purchase", () => {
        setTimeout(() => {
          this.Get_Payments(this.Purchase_id);
          this.Get_Purchases(this.serverParams.page);
          // Complete the animation of the  progress bar.
          NProgress.done();
          this.$bvModal.hide("Add_Payment");
        }, 500);
      });

      Fire.$on("Delete_Facture_purchase", () => {
        setTimeout(() => {
          this.Get_Payments(this.Purchase_id);
          this.Get_Purchases(this.serverParams.page);
          // Complete the animation of the  progress bar.
          NProgress.done();
        }, 500);
      });*/
    }
  };
</script>
<!--
<template>
  <div class="main-content">
    <breadcumb :page="$t('ProductQuantityAlerts')" :folder="$t('Reports')"/>
    <div v-if="isLoading" class="loading_page spinner spinner-primary mr-3"></div>
    <b-card class="wrapper" v-if="!isLoading">
    <vue-good-table
      mode="remote"
      :columns="columns"
      :totalRows="totalRows"
      :rows="products"
      @on-page-change="onPageChange"
      @on-per-page-change="onPerPageChange"
      @on-sort-change="onSortChange"
      @on-search="onSearch"
      :search-options="{
        placeholder: $t('Search_this_table'),
        enabled: false,
      }"
      :pagination-options="{
        enabled: true,
        mode: 'records',
        nextLabel: 'next',
        prevLabel: 'prev',
      }"
      styleClass="order-table vgt-table"
    >
      <div slot="table-actions" class="mt-2 mb-3 quantity_alert_warehouse">
        &lt;!&ndash; warehouse &ndash;&gt;
        <b-form-group :label="$t('warehouse')" v-if="false">
          <v-select
            @input="Selected_Warehouse"
            v-model="warehouse_id"
            :reduce="label => label.value"
            :placeholder="$t('Choose_Warehouse')"
            :options="warehouses.map(warehouses => ({label: warehouses.name, value: warehouses.id}))"
          />
        </b-form-group>

        <b-button @click="Alerts_PDF()" size="sm" variant="outline-success ripple m-1">
          <i class="i-File-Copy"></i> PDF
        </b-button>
      </div>

      <template slot="table-row" slot-scope="props">
        <div v-if="props.column.field == 'stock_alert'">
          <span class="badge badge-outline-danger">{{props.row.stock_alert}}</span>
        </div>
      </template>
    </vue-good-table>
    </b-card>
  </div>
</template>

<script>
import NProgress from "nprogress";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default {
  metaInfo: {
    title: "Products Alert"
  },
  data() {
    return {
      isLoading: true,
      serverParams: {
        sort: {
          field: "id",
          type: "desc"
        },
        page: 1,
        perPage: 50
      },
      search: "",
      limit: "50",
      totalRows: "",
      products: [],
      warehouses: [],
      warehouse_id: ""
    };
  },

  computed: {
    columns() {
      return [
        {
          label: this.$t("ProductCode"),
          field: "code",
          tdClass: "text-left",
          thClass: "text-left",
          sortable: false
        },
        {
          label: this.$t("ProductName"),
          field: "name",
          tdClass: "text-left",
          thClass: "text-left",
          sortable: false
        },
        {
          label: this.$t("warehouse"),
          field: "warehouse",
          tdClass: "text-left",
          thClass: "text-left",
          sortable: false
        },
        {
          label: this.$t("Quantity"),
          field: "quantity",
          tdClass: "text-left",
          thClass: "text-left",
          sortable: false
        },
        {
          label: this.$t("AlertQuantity"),
          field: "stock_alert",
          tdClass: "text-left",
          thClass: "text-left",
          sortable: false
        }
      ];
    }
  },

  methods: {
    //&#45;&#45;&#45;&#45; update Params Table
    updateParams(newProps) {
      this.serverParams = Object.assign({}, this.serverParams, newProps);
    },

    //&#45;&#45;&#45;&#45; Event Page Change
    onPageChange({ currentPage }) {
      if (this.serverParams.page !== currentPage) {
        this.updateParams({ page: currentPage });
        this.Get_Stock_Alerts(currentPage);
      }
    },

    //&#45;&#45;&#45;&#45; Event Per Page Change
    onPerPageChange({ currentPerPage }) {
      if (this.limit !== currentPerPage) {
        this.limit = currentPerPage;
        this.updateParams({ page: 1, perPage: currentPerPage });
        this.Get_Stock_Alerts(1);
      }
    },
    //&#45;&#45;&#45;&#45; Event on Sort Change
    onSortChange(params) {
      let field = "";
      if (params[0].field == "code") {
        field = "name";
      } else {
        field = params[0].field;
      }
      this.updateParams({
        sort: {
          type: params[0].type,
          field: field
        }
      });
      this.Get_Purchases(this.serverParams.page);
    },

    //&#45;&#45;&#45;&#45; Event on Search

    onSearch(value) {
      this.search = value.searchTerm;
      this.Get_Stock_Alerts(this.serverParams.page);
    },

    //&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45; Event Select Warehouse &#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;\\
    Selected_Warehouse(value) {
      if (value === null) {
        this.warehouse_id = "";
      }
      this.Get_Stock_Alerts(1);
    },

    //-&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45; Get Stock Alerts-&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;\\
    Get_Stock_Alerts(page) {
      // Start the progress bar.
      NProgress.start();
      NProgress.set(0.1);
      axios
        .get(
          "Products/Stock/Alerts?page=" +
            page +
            "&warehouse=" +
            this.warehouse_id +
            "&limit=" +
            this.limit
        )
        .then(response => {
          this.products = response.data.products.data;
          this.warehouses = response.data.warehouses;
          this.totalRows = response.data.products.total;
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
    Alerts_PDF() {
      var self = this;

      let pdf = new jsPDF("p", "pt");
      let columns = [
        { title: "Product Name", dataKey: "name" },
        { title: "Stock Quantity", dataKey: "quantity" },
        { title: "Alert Quantity", dataKey: "stock_alert" },
      ];
      pdf.autoTable(columns, self.products);
      pdf.text("Quantity Alert report", 40, 25);
      pdf.save("Quantity_Alert_report.pdf");
    },
  }, //end Methods



  //&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45; Alerts PDF -&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;\\



  //-&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45; Created function-&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45; \\

  created: function() {
    this.Get_Stock_Alerts(1);
  }
};
</script>-->
