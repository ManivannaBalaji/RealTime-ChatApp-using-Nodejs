const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userslist = document.getElementById("users");

const {username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix:true
});

const socket = io();

//join new chatroom
socket.emit('joinRoom', {username, room});

//show room name and users
socket.on('roomUsers', ({room, users}) => {
    outputRoomName(room);
    outputUsers(users);
});

//message from server
socket.on('message', message => {
    console.log(message);
    outputMessage(message);
    //scroll messagebox to down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});
//form submission
chatForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    //get message from msgbox
    const msg = e.target.elements.msg.value;
    //send message to server
    socket.emit('chatMessage', msg);
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});
//using dom to display message
function outputMessage(message){
    const div = document.createElement('div');
    // div.classList.add('message');
    div.innerHTML = `
    <div id="msg-body" class="card mt-3">
        <div class="card-body">
            <p class="text-muted">${message.user}  <span>${message.time}</span></p>
            ${message.text}
        </div>
    </div>`;
    chatMessages.appendChild(div);
}
//using dom to display room name
function outputRoomName(room){
    roomName.innerText = room;
}
//using dom to display chatroom users
function outputUsers(users){
    userslist.innerHTML = `${users.map(user => `<li class='usernames'>${user.username}</li>`).join('')}`;
}