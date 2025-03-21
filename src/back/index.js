const BASE_API = "/api/v1";

let contacts = [
    {
        name: "peter",
        phone: 123456
    },
    {
        name: "pablo",
        phone: 789654
    }
];

function loadBackend(app){
    app.get(BASE_API+"/contacts",(request,response)=>{
        console.log("New GET to /contacts");
        response.send(JSON.stringify(contacts,null,2));
    });
    
    
    app.post(BASE_API+"/contacts",(request,response)=>{
    
        console.log("POST to /contacts");
        console.log(`<${request.body}>`);
    
        let newContact = request.body;
        
        contacts.push(newContact);
    
        response.sendStatus(201);
    });
        
}



export { loadBackend };