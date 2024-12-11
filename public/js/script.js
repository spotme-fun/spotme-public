/*
pin object:
    {
        "lat": 
        "lng": 
        "title": 
        "icon": 
        "color": 
        "notes": 
    },





*/
//define functions---------------------------------------

/*map initialization*/
function initMap(){
    map = new google.maps.Map(document.getElementById('map'),{
        center: {lat:49.846507, lng:15.528009},
        zoom:6,
        mapId:"6cf806ca9c2eb7e",
        gestureHandling: "cooperative",
        disableDefaultUI: true,
    });

}

//back to login    auto log out
function logOut(){
  localStorage.clear();
  window.location.href = '/'
}
//logindetails jwt
function retrieveJWT() {
  let data = localStorage.LOGIN; 
  if (data) {
    data = JSON.parse(data);
    console.log
    return data.accessJWT;
  }
  return null;
}

//add marker function 
function addPin(pinObject){
    const pin = new google.maps.Marker({
        map,
        position:{lat:pinObject.lat,lng:pinObject.lng},
        title:pinObject.title,
        icon:{
            url:pinObject.icon,
            scaledSize: new google.maps.Size(62.4/2,98.4/2),
        },
    });
    const infowindow = new google.maps.InfoWindow({
        content: `<div class="infoWindow">${pinObject.title}</div>`,
    });
    pin.addListener('click', ()=>{
        infowindow.open(map,pin)
    });
}

//pins render
async function callStaticPins(CALLBACK){
    try {
        let res = await fetch('/allStaticPin',{
        method:'GET',
          headers:{
            'Content-Type': 'application/json',
            'Authorization': `BEARER ${retrieveJWT()}`,
          }
        });
        pins = await res.json();
    } catch (err) {
        console.log(err)
        logOut()
    }
CALLBACK();
}
async function callCarPins(CALLBACK = ()=>{}) {
    try {
        let res = await fetch('/allCarPin',{
          method:'GET',
            headers:{
              'Content-Type': 'application/json',
              'Authorization': `BEARER ${retrieveJWT()}`,
            }
          });
        pins = await res.json();
    } catch (err) {
      console.log(err)
      logOut()
    }
    CALLBACK(pins);
}
//call semi static pins 
async function callSemiStaticPins(CALLBACK = ()=>{}) {
  try {
      let res = await fetch('/allSemiStaticPin',{
        method:'GET',
          headers:{
            'Content-Type': 'application/json',
            'Authorization': `BEARER ${retrieveJWT()}`,
          }
        });
      pins = await res.json();
  } catch (err) {
    console.log(err)
    logOut()
  }
  CALLBACK(pins);
}

//update form after submition
function updateForm(){
    addPinForm.innerHTML='<p>What is the car brand?</p><select id="carBrand" name="carBrand"><option disabled selected>Select a car brand</option><option value="Ferrari">Ferrari</option><option value="Lamborghini">Lamborghini</option><option value="Porsche">Porsche</option><option value="Mclaren">McLaren</option><option value="Bugatti">Bugatti</option><option value="Astonmartin">Aston Martin</option><option value="Pagani">Pagani</option><option value="Koenigsegg">Koenigsegg</option><option value="Bentley">Bentley</option><option value="Rollsroyce">Rolls-Royce</option><option value="Maserati">Maserati</option><option value="Lotus">Lotus</option><option value="Rimac">Rimac</option><option value="Zenvo">Zenvo</option><option value="Ssc northamerica">SSC North America</option><option value="Apolloautomobil">Apollo Automobil</option><option value="Wmotors">W Motors</option><option value="Hennessey">Hennessey</option><option value="Mercedesbenz">Mercedes-Benz</option><option value="BMW">BMW</option><option value="Chevrolet">Chevrolet</option><option value="Dodge">Dodge</option><option value="Ford">Ford</option><option value="Nissan">Nissan</option><option value="Toyota">Toyota</option><option value="Subaru">Subaru</option></select><fieldset class="carModel"></fieldset><fieldset class="aditInfo"></fieldset>';
    document.querySelector('select#carBrand').addEventListener('change',()=>{
        let val = document.querySelector('select#carBrand').value.toLowerCase()
        let opt 
        brandXmodel[val].models.forEach((model)=>{
            opt = opt + `<option value="${model}">${model}</option>`
        })
        document.querySelector('fieldset.carModel').innerHTML=`<select id="carModel" name="carModel"><option disabled selected>Select a model</option>${opt}</select>`
    
        document.querySelector('select#carModel').addEventListener('change',(e)=>{
            document.querySelector('fieldset.aditInfo').innerHTML = '<select name="type" id="type"><option value="spuper">Sports/Super car</option><option value="jdm">JDM</option><option value="hyper">Hyper car</option></select><input type="text" name="notes" id="notes" placeholder="Any other info?"><input type="submit">'
        })
    })
}

//update points in the user database 
async function updateScore(){
  let val = document.querySelector('select#carBrand').value.toLowerCase();
  let constant = brandXmodel[val].points
  let variable = Math.floor(Math.random() * 4) + 2;
  let points = constant * variable 


  await fetch('/updatePoints',{
    method:'PUT',
    body:JSON.stringify({points:points}),
    headers:{
      'Content-Type': 'application/json',
      'Authorization': `BEARER ${retrieveJWT()}`
   }
  })
  .then(data=>data.json())
  .then(message=>console.log(message.body.message))
  .catch(err=>console.log(err))
}

//get points and xp information
async function setScoreAndXp() {
  let level = document.querySelector('#leveldisplay')
  let xp = document.querySelector('#pointindicator')

  let data = await fetch('/GetLevelAndXp',{
    method:"GET",
    headers:{
       'Content-Type': 'application/json',
       'Authorization': `BEARER ${retrieveJWT()}`
    }
  })
  .then(data=>data.json())
  .then(data=>  data )

  level.innerHTML = data.level
  xp.style.width = `${data.xp/3}%`

}

//define variables----------------------------------------
let HTML = document.querySelector('html');
let myCarsOpen = document.getElementById('myCars');
let myCarsBox = document.getElementById('myCarsBox');
let myCarsClose = document.getElementById('myCarsClose')
let addPinOpen = document.getElementById('addPin');
let addPinBox= document.getElementById('addPinBox')
let addPinClose = document.getElementById('addPinClose');
let addPinForm = document.getElementById('addPinForm');

let pins;// this is here for the api, the fetch request saves it to a pins variable, this all happens betweens lines 27 and 66 look for reference

let brandXmodel={
    ferrari: {
      name: "Ferrari",
      points:20,
      models: [
        "458 Italia", "488 GTB", "LaFerrari", "F8 Tributo", "812 Superfast", "SF90 Stradale", 
        "California", "F40", "F50", "Enzo Ferrari", "Roma", "599 GTB Fiorano", "360 Modena", 
        "430 Scuderia", "275 GTB", "250 GTO"
      ]
    },
    lamborghini: {
      name: "Lamborghini",
      points:20,
      models: [
        "Huracán", "Aventador", "Gallardo", "Murciélago", "Countach", "Diablo", "Revuelto", 
        "Sián", "Veneno", "Urus", "Sesto Elemento", "Reventón", "Centenario", "Miura"
      ]
    },
    porsche: {
      name: "Porsche",
      points:10,
      models: [
        "911", "Boxster", "Cayman", "Taycan", "918 Spyder", "Panamera", "Carrera GT", "356", 
        "959", "924", "928", "914"
      ]
    },
    mclaren: {
      name: "McLaren",
      points:20,
      models: [
        "720S", "P1", "F1", "765LT", "Senna", "600LT", "570S", "MP4-12C", "650S", "Speedtail", 
        "Elva", "Artura"
      ]
    },
    bugatti: {
      name: "Bugatti",
      points:50,
      models: [
        "Chiron", "Veyron", "Divo", "Bolide", "Centodieci", "Type 57SC Atlantic", "EB110", 
        "Type 35"
      ]
    },
    astonmartin: {
      name: "Aston Martin",
      points:10,
      models: [
        "DB11", "Vantage", "Vanquish", "DBS", "Rapide", "DB5", "Valkyrie", "DB9", "One-77", 
        "Vulcan"
      ]
    },
    pagani: {
      name: "Pagani",
      points:70,
      models: [
        "Huayra", "Zonda"
      ]
    },
    koenigsegg: {
      name: "Koenigsegg",
      points:70,
      models: [
        "Agera", "Jesko", "Regera", "CCX", "One:1", "Gemera", "CCR", "CC8S"
      ]
    },
    bentley: {
      name: "Bentley",
      points:10,
      models: [
        "Continental GT", "Bentayga", "Flying Spur", "Mulsanne", "Arnage", "Brooklands", 
        "Blower", "Azure"
      ]
    },
    rollsroyce: {
      name: "Rolls-Royce",
      points:10,
      models: [
        "Phantom", "Ghost", "Wraith", "Cullinan", "Silver Shadow", "Corniche", "Dawn", 
        "Silver Spirit", "Silver Cloud", "Silver Ghost"
      ]
    },
    maserati: {
      name: "Maserati",
      points:10,
      models: [
        "Ghibli", "Levante", "GranTurismo", "Quattroporte", "MC20", "MC12", "3500 GT", 
        "GranCabrio", "Biturbo"
      ]
    },
    lotus: {
      name: "Lotus",
      points:20,
      models: [
        "Elise", "Evora", "Exige", "Emira", "Esprit", "Seven", "Europa", "Elan", "Eletre"
      ]
    },
    rimac: {
      name: "Rimac",
      points:70,
      models: [
        "Nevera", "Concept_One", "C_Two"
      ]
    },
    zenvo: {
      name: "Zenvo",
      points:100,
      models: [
        "TSR-S", "ST1"
      ]
    },
    sscnorthamerica: {
      name: "SSC North America",
      points:100,
      models:[
        "Tuatara", "Ultimate Aero"
      ]
    },
    apolloautomobil: {
      name: "Apollo Automobil",
      points:100,
      models: [
        "Apollo IE"
      ]
    },
    wmotors: {
      name: "W Motors",
      points:100,
      models: [
        "Lykan HyperSport", "Fenyr SuperSport"
      ]
    },
    hennessey: {
      name: "Hennessey",
      points:100,
      models: [
        "Venom F5", "Venom GT"
      ]
    },
    mercedesbenz: {
      name: "Mercedes-Benz",
      points:5,
      models: [
        "C63 AMG", "A45 AMG", "E63 AMG", "G63 AMG", "S63 AMG", "SL63 AMG", "GT Coupe", 
        "AMG GT 4-Door"
      ]
    },
    bmw: {
      name: "BMW",
      points:5,
      models: [
        "M3", "M5", "M4", "M6", "M2", "M8", "M1"
      ]
    },
    chevrolet: {
      name: "Chevrolet",
      points:10,
      models: [
        "Corvette", "Camaro"
      ]
    },
    dodge: {
      name: "Dodge",
      points:10,
      models: [
        "Viper", "Challenger", "Charger"
      ]
    },
    ford: {
      name: "Ford",
      points:10,
      models: [
        "Mustang", "GT"
      ]
    },
    nissan: {
      name: "Nissan",
      points:10,
      models: [
        "GT-R", "370Z", "350Z", "Skyline", "240SX"
      ]
    },
    toyota: {
      name: "Toyota",
      points:10,
      models: [
        "Supra", "MR2", "Celica", "GR86", "2000GT"
      ]
    },
    subaru: {
      name: "Subaru",
      points:5,
      models: [
        "Impreza WRX", "BRZ"
      ]
    }
  };

//get location -------------------------------------------

let globalLatitude;
let globalLongitude;
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition( position => {

        globalLatitude = position.coords.latitude;
        globalLongitude = position.coords.longitude;

        }, error => {
            console.error(`Error occurred. Error code: ${error.code}`);
        }
    );
} else {
    console.log("Geolocation is not supported by this browser.");
}

//executed code logic-------------------------------------
setScoreAndXp();

callCarPins((pins)=>{
  pins.forEach(pin=>{
      addPin(pin);
  })
});
callStaticPins(()=>{
  pins.forEach((pin) => {
      addPin(pin);
  });
});
callSemiStaticPins(()=>{
  pins.forEach((pin) => {
      addPin(pin);
  });
});

addPinForm.addEventListener('submit',async (e)=>{
    e.preventDefault();
    let icon;
    if(addPinForm.type.value==='jdm'){
        icon='/blue-pin'
    }else{
        icon='/orange-pin'
    }
    let pinObject = {
        lat: globalLatitude,
        lng: globalLongitude,
        title: `${addPinForm.carBrand.value} ${addPinForm.carModel.value}`,
        notes: addPinForm.notes.value,
        icon:icon,
    }
    console.log(pinObject);
    
    await fetch('/postPin',{
        method:'POST',
        body:JSON.stringify(pinObject),
        headers:{
           'Content-Type': 'application/json',
           'Authorization': `BEARER ${retrieveJWT()}`
        }
    })
    .then(res=>console.log(res))
    .catch(err=>{
      logOut() 
    })
    await updateScore();
    updateForm();
    addPinBox.classList.add('display-none');

    await callCarPins((pins)=>{
      pins.forEach(pin=>{
        addPin(pin);
    })
    })
    await setScoreAndXp()
});

document.querySelector('#logOutButton').addEventListener('click',()=>{
  logOut();
})
//UI operations-------------------------------------------

addPinOpen.addEventListener('click',()=>{
  if(globalLatitude&&globalLongitude){
    addPinBox.classList.remove('display-none');
  }else{
    alert('Pro tuto funkci povolte polohu')
  }
});
addPinClose.addEventListener('click',()=>{
    addPinBox.classList.add('display-none');
});
myCarsOpen.addEventListener('click', async () => {
  let wrapper = document.querySelector('#cardisplay');
  try {
      let response = await fetch('/myCars', {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `BEARER ${retrieveJWT()}`
          }
      });
      if (!response.ok) {
          throw new Error('Failed to fetch cars');
      }
      let data = await response.json();
      if (data.length === 0) {
          wrapper.innerHTML = '<p class="error-msg">No cars yet <span class="no-italics">&#x1F615;</span></p>';
      } else {
          data.reverse().forEach((currPin) => {
              wrapper.innerHTML += `
                  <div style="height: fit-content; width: 100%; display: flex; gap: 3%;">
                      <div style="width: 77%; display: block">
                          <h5 style="font-size: 20px; color: white; line-height: 2;">${currPin.title}</h5>
                          <p style="color: rgb(220, 217, 217); font-size: 14px; font-style: normal; line-height: 1.5; display: inline-block; font-family: Poppins-light;">
                              ${currPin.notes}
                          </p>
                      </div>
                      <img src="${currPin.icon}" style="max-width: 20%;">
                  </div>
              `;
          });
      }
      myCarsBox.classList.remove('display-none');
  } catch (err) {
      console.error('Error fetching car data:', err);
  }
});

myCarsClose.addEventListener('click',()=>{
    myCarsBox.classList.add('display-none');
});

document.querySelector('select#carBrand').addEventListener('change',()=>{
    let val = document.querySelector('select#carBrand').value.toLowerCase()
    let opt 
    brandXmodel[val].models.forEach((model)=>{
        opt = opt + `<option value="${model}">${model}</option>`
    })
    document.querySelector('fieldset.carModel').innerHTML=`<select id="carModel" name="carModel"><option disabled selected>Select a model</option>${opt}</select>`

    document.querySelector('select#carModel').addEventListener('change',(e)=>{
        document.querySelector('fieldset.aditInfo').innerHTML = '<select name="type" id="type"><option value="spuper">Sports/Super car</option><option value="jdm">JDM</option><option value="hyper">Hyper car</option></select><input type="text" name="notes" id="notes" placeholder="Any other info?"><input type="submit">'
    })
})
