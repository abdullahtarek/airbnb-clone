import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"
import AddressLink from "../AddressLink";
import PlaceGallery from "../PlaceGallery";
import BookingDates from "../BookingDates";

const BookingPage = () => {
  const {id} = useParams();
  const [booking,setBookings] = useState(null);

  useEffect( () => {
    if(id){
        axios.get('/bookings').then(response => {
            const foundBooking = response.data.find(({_id}) => _id === id);
            if (foundBooking){
                setBookings(foundBooking);
            }
        });
    }
  },[id]);

  if(!booking){
    return '';
  }

  return (
    <div className="max-w-full flex justify-center">
        <div className="mt-4 max-w-7xl px-8 pt-8">
            <h1 className="my-8 text-3xl">
                        {booking.place.title}
            </h1>
            <AddressLink className="my-2 block">{booking.place.address}</AddressLink>
            <div className="flex justify-between bg-gray-200 p-6 my-6 rounded-2xl items-center">
                    <div>
                        <h2 className="text-2xl  mb-4">Your booking information:</h2>
                        <BookingDates booking={booking}/>
                    </div>
                    <div className="bg-primary p-4 text-white rounded-2xl">
                        <div className="">Total price </div>
                        <div className="text-3xl">${booking.price}</div>
                    </div>
            </div>
            <PlaceGallery place={booking.place}/>

        </div>
    </div>
  )
}

export default BookingPage
