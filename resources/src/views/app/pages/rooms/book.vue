<template>
    <div class="main-content">
        <div v-if="isLoading" class="loading_page spinner spinner-primary mr-3"></div>
        <b-row v-if="!isLoading">
             <div class="col-sm-5">
                 <div class="card">
                     <div class="card-body">
                         <VueCtkDateTimePicker v-model="from_date"  :min-date="from_date" label="Checkin Date"/>
                         <div class="mt-2"></div>
                         <VueCtkDateTimePicker v-model="to_date" :min-date="from_date" label="Checkout Date"/>
                         <div class="mt-2"></div>
                         <button class="ml-1 btn btn-info mr-1 btn-sm" @click="searchAvailableRooms()">
                             Search Available Rooms
                         </button>

                         <hr class="mt-2 mb-2">
                         <!--  TODO display list summary of selected rooms  -->
                         <table class="table table-bordered" v-if="selectedRooms.length>0">
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
                                     <td>{{room.room_number}}</td>
                                     <td>{{room.type}}</td>
                                     <td>{{room.days}}</td>
                                     <td>{{room.price}}</td>
                                     <td>{{room.total}}</td>
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
                                 <td><b>{{formatNumber(calculatedTotals, 2)}}</b></td>
                             </tr>
                             </tfoot>
                         </table>
                         <button class="ml-1 btn btn-primary mr-1 btn-sm" @click="bookRooms()" v-if="selectedRooms.length>0">
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
                                <td>{{room.room_number}}</td>
                                <td>{{room.name}}</td>
                                <td>{{room.type}}</td>
                                <td>{{room.price}}</td>
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
    data() {
        return {
            isLoading: false,
            is_Load: false,
            from_date: null,
            to_date: null,
            min_date: null,
            rooms: [],
            selectedRooms: [],
            sound: "/audio/Beep.wav",
            audio: new Audio("/audio/Beep.wav"),
        };
    },
    computed: {
        ...mapGetters([
            "currentUser",
            "currentUserPermissions",
        ]),
        calculatedTotals(){
            return  this.selectedRooms.reduce((accumulator, room) => accumulator + room.total, 0)
        },
    },
    created() {
        this.from_date = moment().hour(10).minute(0).second(0).format("YYYY-MM-DD hh:mm a");
        this.to_date = moment().add(1,'days').hour(10).minute(0).second(0).format("YYYY-MM-DD hh:mm a")
    },

    methods: {

        ...mapActions([
            "logout",
        ]),

        logoutUser() {
            this.$store.dispatch("logout");
        },

        searchAvailableRooms(){
            NProgress.start();
            NProgress.set(0.1);
            axios
                .post("rooms/available", {start_date: this.from_date, end_date:this.to_date}, {
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
        },

        addRoom(room){
            this.audio.play();
            if (this.selectedRooms.some(detail => detail.id === room.id)) {
                this.makeToast("warning", "This room is already added!", this.$t("Warning"));
            } else {
                this.selectedRooms.push(room);
            }
        },

        remove_room(id){
            for (let i = 0; i < this.selectedRooms.length; i++) {
                if (id === this.selectedRooms[i].id) {
                    this.selectedRooms.splice(i, 1);
                }
            }
        },

        bookRooms() {
            if (this.selectedRooms.length === 0){
                this.makeToast(
                    "danger",
                    'Search and select a room',
                    this.$t("Failed")
                );
            }else {
                NProgress.start();
                NProgress.set(0.1);
                const selectedRoomIds = this.selectedRooms.map((room) => {
                    return room.id
                });
                axios
                    .post("rooms/book", {selectedRooms: selectedRoomIds, start_date: this.from_date, end_date: this.to_date, client_id: 1}, {
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
    }
};
</script>
