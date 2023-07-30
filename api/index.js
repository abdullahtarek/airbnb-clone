const express = require('express');
const app = express()
var cors = require('cors')
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const imageDownloader = require('image-downloader');
const multer = require('multer');
const fs = require('fs');
const Place = require('./models/Place');
const BookingModel = require('./models/Booking');

require('dotenv').config();
const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = 'fasefraw4r5r3wq45';

function getUserDataFromReq(req) {
    return new Promise((resolve,reject) => {
        jwt.verify(req.cookies.token,jwtSecret,{}, async (err,userData) => {
            if (err) throw err;
            resolve(userData);
        });
    })
    
}

app.use(express.json());
app.use(cookieParser());
app.use('/uploads',express.static(__dirname+'/uploads'))

const allowedOrigins = [
    'http://127.0.0.1:5173',
    'http://localhost:5173'
];

const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200,
    credentials:true
}

app.use(cors(corsOptions));

mongoose.connect(process.env.MONGO_URL);

app.get('/test', (req,res) => {
    res.cookie('animal','cat');
    res.json('test is working')

});

app.post('/register', async (req,res) => {
    const {name,email,password} = req.body;
    
    try {
        const userdoc = await User.create({
            name,
            email,
            password: bcrypt.hashSync(password,bcryptSalt)
        });

    res.json(userdoc);
    }
    catch(e) {
        res.status(422).json(e);
    }
});

app.post('/login',async (req,res) => {
    const {email,password} = req.body;
    const UserDoc  = await User.findOne({email});

    if (UserDoc){
        const passOk = bcrypt.compareSync(password, UserDoc.password);
        if (passOk){
            jwt.sign({email:UserDoc.email, id:UserDoc._id},jwtSecret,{}, 
                (err,token) => {
                    if (err) throw err;
                    res.cookie('token',token,
                               {secure:true,sameSite:'none'}).json(UserDoc);
            });
            
        } else {
            res.status(422).json('password not ok')
        }        
    } else {
        res.json('not found');
    }
});

app.get('/profile', (req,res)=>{
    const {token} = req.cookies;
    if (token){
        jwt.verify(token,jwtSecret,{}, async (err,userData) => {
            if (err) throw err;
            const {email,name,_id} = await User.findById(userData.id)
            res.json({email,name,_id});
        });
    } else {
        res.json(null);
    }
});

app.post('/logout',(req,res)=>{
    res.cookie('token','').json(true);
});

app.post('/upload-by-link',async (req,res) => {
    const {link} = req.body;
    const newName = 'photo'+Date.now()+'.jpg';
    await imageDownloader.image({
        url: link,
        dest: __dirname+'/uploads/'+newName
        });
    
    res.json(newName)
});

const photosMiddleware = multer({dest:'uploads/'})
app.post('/upload',photosMiddleware.array('photos',100),(req,res) => {
    const uploadedFiles = [];
    for (let i=0;i< req.files.length;i++){
        const {path,originalname} = req.files[i];
        const parts= originalname.split('.');
        const ext = parts[parts.length-1];
        const newPath= path+'.'+ext;
        fs.renameSync(path, newPath);
        uploadedFiles.push(newPath.replace('uploads/',''));
    }
    res.json(uploadedFiles);
});


app.post('/places',(req,res) => {
    const {token} = req.cookies;
    const {title,address,addedPhotos,
         description,perks, extraInfo,
         checkIn,checkOut,maxGuests,price } = req.body;

    jwt.verify(token,jwtSecret,{}, async (err,userData) => {
        if (err) throw err;
        const placeDoc = await Place.create({
            owner: userData.id,
            title,
            address,
            photos:addedPhotos,
            description,
            perks, 
            extraInfo,
            checkIn,
            checkOut,
            maxGuests,
            price
        });

        res.json(placeDoc)
    });
});

app.get('/user-places',(req,res) => {
    const {token} = req.cookies;
    jwt.verify(token,jwtSecret,{}, async (err,userData) => {
        if (err) throw err;
        const {id} = userData;
        res.json(await Place.find({owner:id}))
    });

});

app.get('/places/:id',async (req,res) => {
    const {id} = req.params;
    const place = await Place.findById(id);
    res.json(place);
});

app.put('/places',async (req,res) => {
    const {token} = req.cookies;
    const {id,title,address,addedPhotos,
         description,perks, extraInfo,
         checkIn,checkOut,maxGuests,price } = req.body;
    
    jwt.verify(token,jwtSecret,{}, async (err,userData) => {
        if (err) throw err;
        
        const placeDoc = await Place.findById(id);
        if (userData.id === placeDoc.owner.toString())
        {
            placeDoc.set({
                title,
                address,
                photos:addedPhotos,
                description,
                perks, 
                extraInfo,
                checkIn,
                checkOut,
                maxGuests,
                price
            })
            await placeDoc.save();
            res.json('ok');
        }
    });
});

app.get('/places', async (req,res) => {
    res.json(await Place.find());
});

app.post('/bookings',async (req,res) => {
    const userData = await  getUserDataFromReq(req);

    const {place,checkIn,checkOut, numberOfGuests,
           phone,price,name} = req.body;

    BookingModel.create({
        place,checkIn,checkOut,
        numberOfGuests, phone,price,
        name,user:userData.id
    }).then((doc) => {
        res.json(doc);
    }).catch((err) => {
        throw err;
    });


});



app.get('/bookings',async (req,res) => {
    const userData = await  getUserDataFromReq(req);
    res.json(await BookingModel.find({user: userData.id}).populate('place') )

})

app.listen(4000);