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
        <!-- warehouse -->
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
    //---- update Params Table
    updateParams(newProps) {
      this.serverParams = Object.assign({}, this.serverParams, newProps);
    },

    //---- Event Page Change
    onPageChange({ currentPage }) {
      if (this.serverParams.page !== currentPage) {
        this.updateParams({ page: currentPage });
        this.Get_Stock_Alerts(currentPage);
      }
    },

    //---- Event Per Page Change
    onPerPageChange({ currentPerPage }) {
      if (this.limit !== currentPerPage) {
        this.limit = currentPerPage;
        this.updateParams({ page: 1, perPage: currentPerPage });
        this.Get_Stock_Alerts(1);
      }
    },
    //---- Event on Sort Change
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

    //---- Event on Search

    onSearch(value) {
      this.search = value.searchTerm;
      this.Get_Stock_Alerts(this.serverParams.page);
    },

    //---------------------- Event Select Warehouse ------------------------------\\
    Selected_Warehouse(value) {
      if (value === null) {
        this.warehouse_id = "";
      }
      this.Get_Stock_Alerts(1);
    },

    //----------------------------- Get Stock Alerts-------------------\\
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



  //---------------------- Alerts PDF -------------------------------\\



  //----------------------------- Created function------------------- \\

  created: function() {
    this.Get_Stock_Alerts(1);
  }
};
</script>