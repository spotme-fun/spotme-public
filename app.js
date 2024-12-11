require('dotenv').config();

let mongoose = require('mongoose');
let user = require(`${__dirname}/dbSchema/usersSchema.js`);
let carPin = require(`${__dirname}/dbSchema/carPinsSchema.js`);
let staticPin = require(`${__dirname}/dbSchema/staticPinsSchema.js`);
let semiStaticPin = require(`${__dirname}/dbSchema/semiStaticPinsSchema.js`);
let express = require('express');
let app = express();
const bcrypt = require('bcrypt')
let path = require('path');
let jwt = require('jsonwebtoken');


//VIEW ENGINE
app.set('view engine', 'ejs');

//SERVER RUNNING
app.listen(3000, ()=>{
    console.log('server running');
});

//MngoDB CONNECTION 
mongoose.connect('mongodb://localhost/spotme')
    .then(() => {console.log('MongoDB connected',mongoose.connection.name)})
    .catch((err) => console.log('MongoDB connection error: ', err));;

//MIDDLEWEARE
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function authToken(req, res, next ){
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]

    if(token===null) return res.status(401).render('login');
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET,(err,userData)=>{
        if(err)return res.status(403).render('login')
        req.user= userData
        next();
    })
}


//ROUTING
//file paths
app.get('/',(req,res)=>{
    res.render('login');
});
app.post('/login',async (req,res)=>{

    let currUser = await user.findOne({
        $or: [
            { userName: req.body.username }
        ]
    });

    if(currUser === null ){
        return res.status(400).json({message:'Uživatel neexistuje'});
    }
    try{
        if(await bcrypt.compare(req.body.password, currUser.password)){
            currUser.password = undefined

            let accessJWT  = jwt.sign({userName:currUser.userName}, process.env.ACCESS_TOKEN_SECRET)

            res.json({user:currUser,accessJWT:accessJWT,message:""})
        }else{
            res.status(400).json({message:'Heslo je nesprávné'})
        }
    }catch(err){
        res.send(err);
        console.log(err);
    }
    

})
app.post('/usernameAvailable', async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) {
            return res.status(400).json({ error: 'Username is required' });
        }
        const exists = await user.exists({ userName: new RegExp(`^${username}$`, 'i') });
        res.json({ exists: !!exists });
    } catch (err) {
        console.error('Error checking username availability:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.get('/signup',(req,res)=>{
    res.render('signup');
});
app.post('/signup',async (req,res)=>{
    let adduser = async()=>{try{
        let salt = await bcrypt.genSalt();
        let hashedPassword = await bcrypt.hash(req.body.password, salt);
        
         
        let newUser = {
            userName: req.body.userName,
            password: hashedPassword,
            myPins: [],
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            accountCreated: Date.now(),
            lastActive: Date.now(),
            name: {
                firstname: req.body.name.firstname,
                surname: req.body.name.surname
            },
            level:0,
            xp:0,
        };
        try{
            await user.create(newUser);
            res.send('Uživatel vytvořen') 
        }catch(err){
            res.status(500).send(err)
            console.log(err);
        }
    }catch(err){
        console.log(err)
    }
    }

    let existingUser = await user.findOne({
        $or: [
            { userName: req.body.userName },
            { email: req.body.email }
        ]
    });

    if(!existingUser){
        adduser()
    }else{
        res.send('uživatel se stejnými údaji už existuje');
    }

});



app.get('/game',(req,res)=>{
    res.sendFile(`${__dirname}/views/game.html`);
});
app.get('/userinfo',(req,res)=>{

})
app.get('/generalfont',(req,res)=>{
 res.sendFile(`${__dirname}/public/font/main.ttf`);
})
app.get('/lightfont',(req,res)=>{
    res.sendFile(`${__dirname}/public/font/light.ttf`);
})

//pins icons paths
app.get('/orange-pin',(req,res)=>{
    res.sendFile((`${__dirname}/public/img/pins/orange-pin.svg`));
});
app.get('/blue-pin',(req,res)=>{
    res.sendFile((`${__dirname}/public/img/pins/blue-pin.svg`));
});

//dynamic links(database connection etc.)
app.get('/allStaticPin',authToken,async (req,res)=>{

    try {
        let qRes = await staticPin.find().exec();
        res.send(qRes);
    } catch (err) {
        console.error('Error querying static pins:', err);
        res.status(500).send('Internal Server Error');
    }
})
app.get('/allSemiStaticPin',authToken,async (req,res)=>{
    try {
        let qRes = await semiStaticPin.find().exec();
        res.send(qRes);
    } catch (err) {
        console.error('Error querying static pins:', err);
        res.status(500).send('Internal Server Error');
    }
})
app.get('/allCarPin', authToken,async (req,res)=>{
    
    try {
        let qRes = await carPin.find().exec();
        let pins=[];
        qRes.forEach(pin => {
            let nPin={
                lat: pin.lat,
                lng: pin.lng,
                title: pin.title,
                icon: pin.icon,
                notes: pin.notes
            }
            pins.push(nPin)
        });
        res.send(JSON.stringify(pins));
    } catch (err) {
        console.error('Error querying static pins:', err);
        res.status(500).send('Internal Server Error');
    }
});
app.post('/postPin',authToken,async (req, res)=>{
    req.body.creator=req.user.userName
    try{
        await carPin.create(req.body);
        try{
            await user.updateOne({userName:req.user.userName},{$push:{myPins:req.body}})
        }catch(err){
            console.log(err)
        }
        res.send('sucess') 
    }catch(err){
        res.status(500).send(err)
        console.log(err);
    }
});
app.put('/updatePoints', authToken, async (req, res) => {
    try {
        const curruser = await user.findOne({ userName: req.user.userName });
        if (curruser) {
            let points = curruser.xp + req.body.points;
            if (points >= 300) {
                curruser.xp = 0;
                curruser.level += 1;
            } else {
                curruser.xp = points;
            }
            await curruser.save();
            return res.json({ message: 'sucess'});
        } else {
            return res.status(404).send('User not found');
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send('Server error');
    }
});
app.get('/myCars',authToken,async(req,res)=>{
    try{
    let qRes = await user.findOne({userName:req.user.userName})
    let data = qRes.myPins;
    res.send(data)
    }catch(err){
        console.log(err)
        res.status(500).render('login')
    }
})
app.get('/getLevelAndXp',authToken,async (req,res)=>{
    try{
    let qRes = await user.findOne({userName:req.user.userName})
    return res.send({
        xp:qRes.xp,
        level:qRes.level
    })
    }catch(err){
        console.log(err)
        return res.status(500).render('login')
    }
})




//mongoose.set('debug', true);




// semi static pins not called 
//add a last active date update on login 

