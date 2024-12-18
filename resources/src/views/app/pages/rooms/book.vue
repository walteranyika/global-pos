<template>
    <div class="main-content">
        <div v-if="isLoading" class="loading_page spinner spinner-primary mr-3"></div>
        <b-row v-if="!isLoading">
            <div class="col-sm-5">
                <div class="card">
                    <div class="card-body">
                        <VueCtkDateTimePicker v-model="from_date" :min-date="from_date" label="Checkin Date"/>
                        <div class="mt-2"></div>
                        <VueCtkDateTimePicker v-model="to_date" :min-date="from_date" label="Checkout Date"/>
                        <div class="mt-2"></div>
                        <button class="ml-1 btn btn-info mr-1 btn-sm" @click="searchAvailableRooms()">
                            Search Available Rooms
                        </button>

                        <div class="mb-2 mt-2 border-bottom"></div>
                        <!--  TODO display list summary of selected rooms  -->
                        <div v-if="selectedRooms.length>0">
                            <b-row>
                                <b-col lg="12" md="12" sm="12">
                                    <validation-provider name="Customer" :rules="{ required: true}">
                                        <b-input-group slot-scope="{ valid, errors }" class="input-customer">
                                            <div class="row w-100">
                                                <div class="col-10">
                                                    <v-select
                                                        :class="{'is-invalid': !!errors.length}"
                                                        :state="errors[0] ? false : (valid ? true : null)"
                                                        v-model="client_id"
                                                        :reduce="label => label.value"
                                                        :placeholder="$t('Choose_Customer')"
                                                        class="w-100"
                                                        :options="clients.map(clients => ({label: clients.name, value: clients.id}))"
                                                    />
                                                </div>
                                                <div class="col-2">
                                                    <b-input-group-append>
                                                        <b-button variant="primary" @click="new_client()">
                                              <span>
                                                <i class="i-Add-User"></i>
                                              </span>
                                                        </b-button>
                                                    </b-input-group-append>
                                                </div>
                                            </div>
                                        </b-input-group>
                                    </validation-provider>
                                </b-col>
                            </b-row>
                        </div>
                        <table class="table table-bordered mt-2" v-if="selectedRooms.length>0">
                            <thead>
                            <tr>
                                <th>Room #</th>
                                <th>Type</th>
                                <th># Days</th>
                                <th>Price</th>
                                <th>Total</th>
                                <th></th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr v-for="room in selectedRooms">
                                <td>{{ room.room_number }}</td>
                                <td>{{ room.type }}</td>
                                <td>{{ room.days }}</td>
                                <td>{{ room.price }}</td>
                                <td>{{ room.total }}</td>
                                <td>
                                    <a
                                        @click="remove_room(room.id)"
                                        title="Delete">
                                        <i class="i-Close-Window text-25 text-danger"></i>
                                    </a>
                                </td>
                            </tr>
                            </tbody>
                            <tfoot>
                            <tr>
                                <td colspan="4"><b>Total</b></td>
                                <td><b>{{ formatNumber(calculatedTotals, 2) }}</b></td>
                            </tr>
                            </tfoot>
                        </table>
                        <button class="ml-1 btn btn-primary mr-1 btn-sm" @click="bookRooms()"
                                v-if="selectedRooms.length>0">
                            Confirm and Book
                        </button>
                    </div>
                </div>

            </div>
            <div class="col-sm-7">
                <div class="card">
                    <div class="card-body">
                        <table class="table table-striped">
                            <thead>
                            <tr>
                                <th>Room #</th>
                                <th>Name</th>
                                <th>Type</th>
                                <th>Price</th>
                                <th>Add</th>
                            </tr>
                            </thead>
                            <tbody v-if="rooms.length > 0">
                            <tr v-for="room in rooms">
                                <td>{{ room.room_number }}</td>
                                <td>{{ room.name }}</td>
                                <td>{{ room.type }}</td>
                                <td>{{ room.price }}</td>
                                <td>
                                    <a
                                        @click="addRoom(room)"
                                        title="Delete">
                                        <i class="i-Add text-25 text-success"></i>
                                    </a>
                                </td>
                            </tr>
                            </tbody>
                            <tr v-else>
                                <td colspan="4" class="text-center">No rooms available</td>
                            </tr>
                        </table>
                    </div>
                </div>

            </div>
        </b-row>

        <validation-observer ref="Create_Customer">
            <b-modal hide-footer size="lg" id="New_Customer" :title="$t('Add')">
                <b-form @submit.prevent="Submit_Customer">
                    <b-row>
                        <!-- Customer Name -->
                        <b-col md="6" sm="12">
                            <validation-provider
                                name="Name Customer"
                                :rules="{ required: true}"
                                v-slot="validationContext"
                            >
                                <b-form-group :label="$t('CustomerName')">
                                    <b-form-input
                                        :state="getValidationState(validationContext)"
                                        aria-describedby="name-feedback"
                                        label="name"
                                        v-model="client.name"
                                    ></b-form-input>
                                    <b-form-invalid-feedback id="name-feedback">{{
                                            validationContext.errors[0]
                                        }}
                                    </b-form-invalid-feedback>
                                </b-form-group>
                            </validation-provider>
                        </b-col>

                        <!-- Customer Email -->
                        <b-col md="6" sm="12">
                            <validation-provider
                                name="Email customer"
                                :rules="{ required: true}"
                                v-slot="validationContext"
                            >
                                <b-form-group :label="$t('Email')">
                                    <b-form-input
                                        :state="getValidationState(validationContext)"
                                        aria-describedby="Email-feedback"
                                        label="Email"
                                        v-model="client.email"
                                    ></b-form-input>
                                    <b-form-invalid-feedback id="Email-feedback">{{
                                            validationContext.errors[0]
                                        }}
                                    </b-form-invalid-feedback>
                                </b-form-group>
                            </validation-provider>
                        </b-col>

                        <!-- Customer Phone -->
                        <b-col md="6" sm="12">
                            <validation-provider
                                name="Phone Customer"
                                :rules="{ required: true}"
                                v-slot="validationContext"
                            >
                                <b-form-group :label="$t('Phone')">
                                    <b-form-input
                                        :state="getValidationState(validationContext)"
                                        aria-describedby="Phone-feedback"
                                        label="Phone"
                                        v-model="client.phone"
                                    ></b-form-input>
                                    <b-form-invalid-feedback id="Phone-feedback">{{
                                            validationContext.errors[0]
                                        }}
                                    </b-form-invalid-feedback>
                                </b-form-group>
                            </validation-provider>
                        </b-col>

                        <!-- Customer Country -->
                        <b-col md="6" sm="12">
                            <validation-provider
                                name="Country customer"
                                :rules="{ required: true}"
                                v-slot="validationContext"
                            >
                                <b-form-group :label="$t('Country')">
                                    <b-form-input
                                        :state="getValidationState(validationContext)"
                                        aria-describedby="Country-feedback"
                                        label="Country"
                                        v-model="client.country"
                                    ></b-form-input>
                                    <b-form-invalid-feedback
                                        id="Country-feedback"
                                    >{{ validationContext.errors[0] }}
                                    </b-form-invalid-feedback>
                                </b-form-group>
                            </validation-provider>
                        </b-col>

                        <!-- Customer City -->
                        <b-col md="6" sm="12">
                            <validation-provider
                                name="City Customer"
                                :rules="{ required: true}"
                                v-slot="validationContext"
                            >
                                <b-form-group :label="$t('City')">
                                    <b-form-input
                                        :state="getValidationState(validationContext)"
                                        aria-describedby="City-feedback"
                                        label="City"
                                        v-model="client.city"
                                    ></b-form-input>
                                    <b-form-invalid-feedback id="City-feedback">{{
                                            validationContext.errors[0]
                                        }}
                                    </b-form-invalid-feedback>
                                </b-form-group>
                            </validation-provider>
                        </b-col>

                        <!-- Customer Adress -->
                        <b-col md="6" sm="12">
                            <validation-provider
                                name="Adress customer"
                                :rules="{ required: true}"
                                v-slot="validationContext"
                            >
                                <b-form-group :label="$t('Adress')">
                                    <b-form-input
                                        :state="getValidationState(validationContext)"
                                        aria-describedby="Adress-feedback"
                                        label="Adress"
                                        v-model="client.adresse"
                                    ></b-form-input>
                                    <b-form-invalid-feedback
                                        id="Adress-feedback"
                                    >{{ validationContext.errors[0] }}
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
import VueCtkDateTimePicker from 'vue-ctk-date-time-picker';
import 'vue-ctk-date-time-picker/dist/vue-ctk-date-time-picker.css';
import moment from 'moment';
import NProgress from "nprogress";
import {mapActions, mapGetters} from "vuex";


export default {
    components: {
        VueCtkDateTimePicker
    },
    metaInfo: {
        title: "Rooms POS"
    },
    data() {
        return {
            isLoading: false,
            is_Load: false,
            from_date: null,
            to_date: null,
            min_date: null,
            rooms: [],
            client_id: "",
            selectedRooms: [],
            clients: [],
            sound: "/audio/Beep.wav",
            audio: new Audio("/audio/Beep.wav"),
            client: {
                id: "",
                name: "",
                code: "",
                email: "default@gmail.com",
                phone: "0720000000",
                country: "Kenya",
                city: "Webuye",
                adresse: "Western Kenya"
            },
        };
    },
    computed: {
        ...mapGetters([
            "currentUser",
            "currentUserPermissions",
        ]),
        calculatedTotals() {
            return this.selectedRooms.reduce((accumulator, room) => accumulator + room.total, 0)
        },
    },
    created() {
        this.from_date = moment().hour(10).minute(0).second(0).format("YYYY-MM-DD hh:mm a");
        this.to_date = moment().add(1, 'days').hour(10).minute(0).second(0).format("YYYY-MM-DD hh:mm a")
    },

    methods: {

        ...mapActions([
            "logout",
        ]),

        logoutUser() {
            this.$store.dispatch("logout");
        },

        searchAvailableRooms() {
            NProgress.start();
            NProgress.set(0.1);
            axios
                .post("rooms/available", {start_date: this.from_date, end_date: this.to_date}, {
                    headers: {
                        "Content-Type": "application/json"
                    }
                })
                .then(response => {
                    // Complete the animation of the  progress bar.
                    console.log(response.data)
                    this.rooms = response.data.rooms
                    NProgress.done();
                    //TODO Reset
                })
                .catch(() => {
                    // Complete the animation of the  progress bar.
                    NProgress.done();
                });
            this.Get_Client_Without_Paginate();
        },

        addRoom(room) {
            this.audio.play();
            if (this.selectedRooms.some(detail => detail.id === room.id)) {
                this.makeToast("warning", "This room is already added!", this.$t("Warning"));
            } else {
                this.selectedRooms.push(room);
            }
        },

        remove_room(id) {
            for (let i = 0; i < this.selectedRooms.length; i++) {
                if (id === this.selectedRooms[i].id) {
                    this.selectedRooms.splice(i, 1);
                }
            }
        },

        bookRooms() {
            if (this.selectedRooms.length === 0) {
                this.makeToast(
                    "danger",
                    'Search and select a room',
                    this.$t("Failed")
                );
            } else {
                NProgress.start();
                NProgress.set(0.1);
                const selectedRoomIds = this.selectedRooms.map((room) => {
                    return room.id
                });
                axios
                    .post("rooms/book", {
                        selectedRooms: selectedRoomIds,
                        start_date: this.from_date,
                        end_date: this.to_date,
                        client_id: this.client_id
                    }, {
                        headers: {
                            "Content-Type": "application/json"
                        }
                    })
                    .then(response => {
                        // Complete the animation of the  progress bar.
                        console.log(response.data)
                        NProgress.done();
                        this.rooms = []
                        this.selectedRooms = []
                        this.makeToast("success", 'Updated comment successfully', 'Updated');
                    })
                    .catch(() => {
                        // Complete the animation of the  progress bar.
                        NProgress.done();
                    });
            }
        },
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
        makeToast(variant, msg, title) {
            this.$root.$bvToast.toast(msg, {
                title: title,
                variant: variant,
                solid: true
            });
        },
        //------------------------------ New Model (create Customer) -------------------------------\\
        new_client() {
            this.reset_Form_client();
            this.$bvModal.show("New_Customer");
        },

        //-------------------------------- reset Form -------------------------------\\
        reset_Form_client() {
            this.client = {
                id: "",
                name: "",
                email: "info@gmail.com",
                phone: "0723444555",
                country: "Kenya",
                city: "Kenya",
                adresse: "Kenya"
            };
        },
        Create_Client() {
            axios
                .post("clients", {
                    name: this.client.name,
                    email: this.client.email,
                    phone: this.client.phone,
                    country: this.client.country,
                    city: this.client.city,
                    adresse: this.client.adresse
                })
                .then(response => {
                    NProgress.done();
                    this.makeToast(
                        "success",
                        this.$t("Create.TitleCustomer"),
                        this.$t("Success")
                    );
                    this.Get_Client_Without_Paginate();
                    this.$bvModal.hide("New_Customer");
                })
                .catch(error => {
                    NProgress.done();
                    this.makeToast("danger", this.$t("InvalidData"), this.$t("Failed"));
                });
        },
        //------------------------------------ Get Clients Without Paginate -------------------------\\
        Get_Client_Without_Paginate() {
            axios
                .get("Get_Clients_Without_Paginate")
                .then(({data}) => (this.clients = data));
        },
        Submit_Customer() {
            // Start the progress bar.
            NProgress.start();
            NProgress.set(0.1);
            this.$refs.Create_Customer.validate().then(success => {
                if (!success) {
                    NProgress.done();
                    this.makeToast(
                        "danger",
                        this.$t("Please_fill_the_form_correctly"),
                        this.$t("Failed")
                    );
                } else {
                    this.Create_Client();
                }
            });
        },
        //---Validate State Fields
        getValidationState({dirty, validated, valid = null}) {
            return dirty || validated ? valid : null;
        },

    }
};
</script>
