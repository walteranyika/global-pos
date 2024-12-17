<template>
    <div class="main-content">
        <div v-if="isLoading" class="loading_page spinner spinner-primary mr-3"></div>
        <b-card class="wrapper" v-if="!isLoading">
            <vue-good-table
                mode="remote"
                :columns="columns"
                :totalRows="totalRows"
                :rows="rooms"
                @on-page-change="onPageChange"
                @on-per-page-change="onPerPageChange"
                @on-sort-change="onSortChange"
                @on-search="onSearch"
                :search-options="{
        enabled: true,
        placeholder: $t('Search_this_table'),
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
                styleClass="table-hover tableOne vgt-table"
            >
                <div slot="selected-row-actions">
                    <button class="btn btn-danger btn-sm" @click="delete_by_selected()">{{ $t('Del') }}</button>
                </div>
                <div slot="table-actions" class="mt-2 mb-3">
                    <b-button
                        @click="new_room()"
                        class="btn-rounded"
                        variant="btn btn-primary btn-icon m-1"
                    >
                        <i class="i-Add"></i>
                        {{ $t('Add') }}
                    </b-button>
                </div>

                <template slot="table-row" slot-scope="props">
          <span v-if="props.column.field == 'actions'">
            <a @click="edit_room(props.row)" title="Edit" v-b-tooltip.hover>
              <i class="i-Edit text-25 text-success"></i>
            </a>
            <a title="Delete" v-b-tooltip.hover @click="remove_room(props.row.id)">
              <i class="i-Close-Window text-25 text-danger"></i>
            </a>
          </span>
                </template>
            </vue-good-table>
        </b-card>

        <validation-observer ref="create_room">
            <b-modal hide-footer size="md" id="new_room_modal" :title="editmode?$t('Edit'):$t('Add')">
                <b-form @submit.prevent="submit_room">
                    <b-row>
                        <!-- Room Number -->
                        <b-col md="12">
                            <validation-provider
                                name="Room Number"
                                :rules="{ required: true}"
                                v-slot="validationContext"
                            >
                                <b-form-group label="Room Number">
                                    <b-form-input
                                        placeholder="Enter Room Number"
                                        :state="getValidationState(validationContext)"
                                        aria-describedby="room_number_feedback"
                                        label="Room Number"
                                        v-model="room.room_number"
                                    ></b-form-input>
                                    <b-form-invalid-feedback id="room_number_feedback">{{
                                            validationContext.errors[0]
                                        }}
                                    </b-form-invalid-feedback>
                                </b-form-group>
                            </validation-provider>
                        </b-col>

                        <!-- Room Number -->
                        <b-col md="12">
                            <validation-provider
                                name="Room Name"
                                :rules="{ required: true}"
                                v-slot="validationContext"
                            >
                                <b-form-group label="Room Name">
                                    <b-form-input
                                        placeholder="Enter Room Name"
                                        :state="getValidationState(validationContext)"
                                        aria-describedby="room_name_feedback"
                                        label="Room Name"
                                        v-model="room.name"
                                    ></b-form-input>
                                    <b-form-invalid-feedback id="room_name_feedback">{{
                                            validationContext.errors[0]
                                        }}
                                    </b-form-invalid-feedback>
                                </b-form-group>
                            </validation-provider>
                        </b-col>

                        <b-col md="12">
                            <b-form-group label="Room Type">
                                <v-select
                                    v-model="room.type"
                                    :reduce="label => label.value"
                                    placeholder="Select Room Type"
                                    :options="room_types.map(type => ({label: type, value: type}))"
                                />
                            </b-form-group>
                        </b-col>


                        <b-col md="12">
                            <validation-provider
                                name="Price"
                                :rules="{ regex: /^\d*\.?\d*$/}"
                                v-slot="validationContext"
                            >
                                <b-form-group label="Price">
                                    <b-form-input
                                        placeholder="Enter Room Price"
                                        :state="getValidationState(validationContext)"
                                        aria-describedby="room_price_feedback"
                                        label="Room Price"
                                        v-model="room.price"
                                    ></b-form-input>
                                    <b-form-invalid-feedback id="room_price_feedback">{{
                                            validationContext.errors[0]
                                        }}
                                    </b-form-invalid-feedback>
                                </b-form-group>
                            </validation-provider>
                        </b-col>

                        <b-col md="12" class="mt-3">
                            <b-button variant="primary" type="submit">{{ $t('submit') }}</b-button>
                        </b-col>
                    </b-row>
                </b-form>
            </b-modal>
        </validation-observer>
    </div>
</template>


<script>
import NProgress from "nprogress";

export default {
    metaInfo: {
        title: "Rooms"
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
            selectedIds: [],
            totalRows: "",
            search: "",
            limit: "10",
            rooms: [],
            editmode: false,

            room_types:['SINGLE', 'DOUBLE','FAMILY'],
            room: {
                id: "",
                room_number: "",
                name: "",
                type: "",
                price: 0
            }
        };
    },
    computed: {
        columns() {
            return [
                {
                    label: "Room Number",
                    field: "room_number",
                    tdClass: "text-left",
                    thClass: "text-left"
                },
                {
                    label: "Name",
                    field: "name",
                    tdClass: "text-left",
                    thClass: "text-left"
                },
                {
                    label: "Type",
                    field: "type",
                    tdClass: "text-left",
                    thClass: "text-left"
                },
                {
                    label: "Price",
                    field: "price",
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
        //---- update Params Table
        updateParams(newProps) {
            this.serverParams = Object.assign({}, this.serverParams, newProps);
        },

        //---- Event Page Change
        onPageChange({currentPage}) {
            if (this.serverParams.page !== currentPage) {
                this.updateParams({page: currentPage});
                this.get_rooms(currentPage);
            }
        },

        //---- Event Per Page Change
        onPerPageChange({currentPerPage}) {
            if (this.limit !== currentPerPage) {
                this.limit = currentPerPage;
                this.updateParams({page: 1, perPage: currentPerPage});
                this.get_rooms(1);
            }
        },

        //---- Event Select Rows
        selectionChanged({selectedRows}) {
            this.selectedIds = [];
            selectedRows.forEach((row, index) => {
                this.selectedIds.push(row.id);
            });
        },

        //---- Event on Sort Change
        onSortChange(params) {
            this.updateParams({
                sort: {
                    type: params[0].type,
                    field: params[0].field
                }
            });
            this.get_rooms(this.serverParams.page);
        },

        //---- Event on Search

        onSearch(value) {
            this.search = value.searchTerm;
            this.get_rooms(this.serverParams.page);
        },

        //---- Validation State Form

        getValidationState({dirty, validated, valid = null}) {
            return dirty || validated ? valid : null;
        },

        //------------- Submit Validation Create & Edit Room
        submit_room() {
            this.$refs.create_room.validate().then(success => {
                if (!success) {
                    this.makeToast(
                        "danger",
                        this.$t("Please_fill_the_form_correctly"),
                        this.$t("Failed")
                    );
                } else {
                    if (!this.editmode) {
                        this.create_room();
                    } else {
                        this.update_room();
                    }
                }
            });
        },

        //------ Toast
        makeToast(variant, msg, title) {
            this.$root.$bvToast.toast(msg, {
                title: title,
                variant: variant,
                solid: true
            });
        },

        //------------------------------ Modal  (create Room) -------------------------------\\
        new_room() {
            this.reset_Form();
            this.editmode = false;
            this.$bvModal.show("new_room_modal");
        },

        //------------------------------ Modal (Update Room) -------------------------------\\
        edit_room(room) {
            this.get_rooms(this.serverParams.page);
            this.reset_Form();
            this.room = room;
            this.editmode = true;
            this.$bvModal.show("new_room_modal");
        },

        //--------------------------Get ALL Rooms ---------------------------\\

        get_rooms(page) {
            // Start the progress bar.
            NProgress.start();
            NProgress.set(0.1);
            axios
                .get(
                    "rooms?page=" +
                    page +
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
                    this.rooms = response.data.rooms;
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

        //----------------------------------Create new Room ----------------\\
        create_room() {
            axios
                .post("rooms", {
                    room_number: this.room.room_number,
                    name: this.room.name,
                    type: this.room.type,
                    price: this.room.price
                })
                .then(response => {
                    Fire.$emit("Event_Room");
                    this.makeToast(
                        "success",
                        "Room Added Successfully",
                        this.$t("Success")
                    );
                })
                .catch(error => {
                    this.makeToast("danger", this.$t("InvalidData"), this.$t("Failed"));
                });
        },

        //---------------------------------- Update Room ----------------\\
        update_room() {
            axios
                .put("rooms/" + this.room.id, {
                    room_number: this.room.room_number,
                    name: this.room.name,
                    type: this.room.type,
                    price: this.room.price
                })
                .then(response => {
                    Fire.$emit("Event_Room");
                    this.makeToast(
                        "success",
                        "Room Updated Successfully",
                        this.$t("Success")
                    );
                })
                .catch(error => {
                    this.makeToast("danger", this.$t("InvalidData"), this.$t("Failed"));
                });
        },

        //--------------------------- reset Form ----------------\\

        reset_Form() {
            this.room = {
                id: "",
                room_number: "",
                name: "",
                type: "",
                price: 0
            };
        },

        //--------------------------- Remove Room----------------\\
        remove_room(id) {
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
                    axios
                        .delete("rooms/" + id)
                        .then(() => {
                            this.$swal(
                                this.$t("Delete.Deleted"),
                                "Room Deleted",
                                "success"
                            );

                            Fire.$emit("Delete_Room");
                        })
                        .catch(() => {
                            this.$swal(
                                this.$t("Delete.Failed"),
                                this.$t("Delete.Therewassomethingwronge"),
                                "warning"
                            );
                        });
                }
            });
        },

        //---- Delete Room by selection

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
                        .post("rooms/delete/by_selection", {
                            selectedIds: this.selectedIds
                        })
                        .then(() => {
                            this.$swal(
                                this.$t("Delete.Deleted"),
                                "Selected rooms were Deleted",
                                "success"
                            );

                            Fire.$emit("Delete_Room");
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
    }, //end Methods

    //----------------------------- Created function-------------------

    created: function () {
        this.get_rooms(1);

        Fire.$on("Event_Room", () => {
            setTimeout(() => {
                this.get_rooms(this.serverParams.page);
                this.$bvModal.hide("new_room_modal");
            }, 500);
        });

        Fire.$on("Delete_Room", () => {
            setTimeout(() => {
                this.get_rooms(this.serverParams.page);
            }, 500);
        });
    }
};
</script>
