<?php

namespace App\Http\Controllers;

use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class BookingController extends Controller
{
    public function getAvailableDates($roomId): JsonResponse
    {
        $bookings = DB::table('bookings')
            ->where('room_id', $roomId)
            ->get(['start_date', 'end_date']);

        // Get the current date and the next 6 months (or any range you prefer)
        $currentDate = Carbon::now();
        $endDate = Carbon::now()->addMonths(1);

        // Create an array of all dates within the range
        $allDates = [];
        for ($date = $currentDate->copy(); $date <= $endDate; $date->addDay()) {
            $allDates[] = $date->toDateString();
        }

        // Exclude dates that are booked
        $unavailableDates = [];
        foreach ($bookings as $booking) {
            $bookingStart = Carbon::parse($booking->start_date);
            $bookingEnd = Carbon::parse($booking->end_date);
            $unavailableDates = array_merge($unavailableDates, $bookingStart->daysUntil($bookingEnd)->toArray());
        }

        $availableDates = array_diff($allDates, $unavailableDates);

        return response()->json(['available_dates' => array_values($availableDates)]);
    }

    public function bookRoom(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'client_id' => 'required|exists:clients,id',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $roomId = $validated['room_id'];
        $customerId = $validated['client_id'];
        $startDate = Carbon::parse($validated['start_date']);
        $endDate = Carbon::parse($validated['end_date']);

        // Check if the room is available for the entire range
        $isBooked = DB::table('bookings')
            ->where('room_id', $roomId)
            ->where(function ($query) use ($startDate, $endDate) {
                $query->whereBetween('start_date', [$startDate, $endDate])
                    ->orWhereBetween('end_date', [$startDate, $endDate])
                    ->orWhere(function ($query) use ($startDate, $endDate) {
                        $query->where('start_date', '<=', $startDate)
                            ->where('end_date', '>=', $endDate);
                    });
            })
            ->exists();

        if ($isBooked) {
            return response()->json(['message' => 'Room is not available for the selected date range'], 422);
        }

        // Calculate total price (assuming price is per day)
        $days = $startDate->diffInDays($endDate) + 1;
        $room = DB::table('rooms')->where('id', $roomId)->first();
        $totalPrice = ($room->price ?? 0) * $days;

        // Create the booking
        DB::table('bookings')->insert([
            'room_id' => $roomId,
            'client_id' => $customerId,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'total_price' => $totalPrice,
            'status' => 'confirmed',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Room booked successfully']);
    }
}
