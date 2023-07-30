import Perks from "../Perks";
import PhotosUploader from "./PhotosUploader";
import { useEffect, useState } from "react";
import axios from "axios";
import AccountNav from "../AccountNav";
import { Navigate, useParams } from "react-router-dom";


const PlacesFormPage = () => {
  const {id} = useParams();
  
  const [title,setTitle] = useState('');
  const [address,setAddress] = useState('');
  const [description,setDescription] = useState('');
  const [addedPhotos,setAddedPhots] = useState([]);
  const [perks,setPerks] = useState('');
  const [extraInfo,setExtraInfo] = useState('');
  const [checkIn,setCheckin] = useState('');
  const [checkOut,setCheckout] = useState('');
  const [maxGuests,setMaxGuests] = useState(1);
  const [redirect,setRedirect] = useState(false);
  const [price,setPrice] = useState(100);
  
  useEffect(() => {
    if(!id){
      return;
    }

    axios.get('/places/'+id).then(response => {
      const {data} = response;

      setTitle(data.title);
      setAddress(data.address);
      setAddedPhots(data.photos);
      setDescription(data.description);
      setPerks(data.perks);
      setExtraInfo(data.extraInfo);
      setCheckin(data.checkIn);
      setCheckout(data.checkOut);
      setMaxGuests(data.maxGuests);
      setPrice(data.price);
    });

  },[id]);

  function inputHeader(text){
    return <h2 className="text-2xl mt-4">{text}</h2>
  }
  function inputDescription(text){
    return <p className="text-gray-500 text-sm">{text}</p>
  }
  function preInput(header,desctiption){
    return (
        <>
            {inputHeader(header)}
            {inputDescription(desctiption)}
        </>
    )
  }

  async function SavePlace(ev) {
    ev.preventDefault();
    
    const placeData ={
            title,address,addedPhotos, 
            description,perks,extraInfo,
            checkIn,checkOut,maxGuests,price
        };
    
    if (id)
    {
      await axios.put('/places',{id,...placeData});
    }
    else 
    {
      await axios.post('/places',placeData);
    }
    setRedirect(true);
  }

  if (redirect){
    return <Navigate to={'/account/places'} />
  }

  return (
    <div className="grow flex justify-center ">
      <div className="max-w-6xl ">
          <AccountNav />
          <form className="mt-16" onSubmit={SavePlace}>
              {preInput('Title','Title for your place. Should be soht and catchy as in advertisement' )}
              <input type="text" value={title} onChange={ev => setTitle(ev.target.value)} placeholder="title, for example: My Lovely appartment" />

              {preInput('Address','Address to this place')}
              <input type="text" value={address} onChange={ev => setAddress(ev.target.value)} placeholder="address" />

              {preInput('Photos','more = better')}
              <PhotosUploader addedPhotos={addedPhotos} onChange={setAddedPhots}/>
              
              {preInput('Description','description of the place')}
              <textarea 
                  value={description} 
                  onChange={ev => setDescription(ev.target.value)}/>

              {preInput('Perks','slect all the perks of your place')}
              <div className="grid mt-2 gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                  <Perks selected={perks} onChange={setPerks}></Perks>
              </div>

              {preInput('Extra','house rules, etc')}
              <textarea value={extraInfo} onChange={ev => setExtraInfo(ev.target.value)}/>
              
              {preInput('Check','add check in and out times,remember to have some time window for cleaning the room between guests')}
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-2">
                  <div>
                      <h3 className="mt-2 -mb-1 " >Check in time</h3>
                      <input type="text" 
                          value={checkIn} 
                          onChange={ev => setCheckin(ev.target.value)} 
                          placeholder="11" />
                  </div>
                  <div>
                      <h3 className="mt-2 -mb-1 " >Check out time</h3>
                      <input type="text" 
                          value={checkOut} 
                          onChange={ev => setCheckout(ev.target.value)} 
                          placeholder="14" />
                  </div>
                  <div>
                      <h3 className="mt-2 -mb-1 " >Max number of guests</h3>
                      <input type="number" 
                          value={maxGuests} 
                          onChange={ev => setMaxGuests(ev.target.value)}
                          />
                  </div>

                  <div>
                      <h3 className="mt-2 -mb-1 " >Price per night</h3>
                      <input type="number" 
                          value={price} 
                          onChange={ev => setPrice(ev.target.value)}
                          />
                  </div>

              </div>
              
              <button className="primary my-4">Save</button>

          </form>
      </div>
    </div>
    
  )
}

export default PlacesFormPage
