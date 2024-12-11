

let form = document.querySelector('form');
let res = document.querySelector('#res')
let html = document.querySelector('html')


form.addEventListener('submit',async (e)=>{
    e.preventDefault();
    let data = {
        username:form.username.value.toLowerCase(),
        password:form.password.value
    }
    await fetch('/login',{
        method:'POST',
        body:JSON.stringify(data),
        headers:{
            'Content-Type': "application/json"
        }
    })
    .then(res=>res.json())
    .then(async (data)=>{
        console.log(data)
        res.innerHTML = data.message
        data.message=undefined
        if(data.accessJWT){
            localStorage.LOGIN = JSON.stringify(data);

          window.location.href = '/game'
        }
    });
});

