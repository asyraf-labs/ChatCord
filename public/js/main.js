/* import { text } from "express"; */

const chatForm = document.getElementById('chat-form'); //access that form
const chatMessages = document.querySelector('.chat-messages'); // ger the class by using querySelector
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Get username and room from URL
const { username, room } = Qs.parse(location.search, { //windows.location.search
    ignoreQueryPrefix: true // ignore the & and other stuff
});

/* console.log(username, room); */

const socket = io();

// Join chatroom
socket.emit('joinRoom', { username, room});

// Join chatroom
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
});

// Message from the server
socket.on('message', message => {
    console.log(message);
    outputMessage(message);

    // Scroll down
   chatMessages.scrollTop = chatMessages.scrollHeight;
   // https://stackoverflow.com/questions/1144805/scroll-to-the-top-of-the-page-using-javascript
   
});

// Message submit
chatForm.addEventListener('submit' , e => {
    e.preventDefault(); // when we submit a form , it automatically just submit to a file |  we want to stop that from happening

    // get the text input
    const msg = e.target.elements.msg.value;
   
    // Emit a message to server
    /*  console.log(msg);*/
    socket.emit('chatMessage', msg);

    // Clear input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message) {
    const div = document.createElement('div');  // create message div
    div.classList.add('message');
    div.innerHTML = `
        <p class="meta">${message.username}<span>  ${message.time}</span></p>
        <p class="text" >
       ${message.text}
        </p>
    `;
    document.querySelector('.chat-messages').appendChild(div); //when we create a message , this will add to the div
}

// Add room name to DOM
function outputRoomName(room) {
    roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = `
   ${users.map(user => `<li>${user.username}</li>`).join('')} 
  `;  
}// join : turning an array to a string