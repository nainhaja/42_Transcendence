import {  WebSocketGateway, 
          SubscribeMessage,
          MessageBody,
          WebSocketServer,
          OnGatewayConnection,
          OnGatewayDisconnect, 
          OnGatewayInit
        } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { Server, Socket } from "socket.io";
import {TypeChat } from '@prisma/client'
import { Logger } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getFromContainer } from 'class-validator';

enum NOTIF_STATUS {
  FAILED = 'Failed',
  SUCCESS = 'Success',
  UPDATE = 'Update',
  RESTRICTED = 'Restricted',
}

enum RESTRICTION {
  BAN = 'BAN',
  MUTE = 'MUTE',
  KICK = 'KICK',
}

enum ACCESS {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  PROTECTED = 'PROTECTED',
  DM = 'DM'
}

enum MUTEDURATION {
  HALFMIN = '15 SEC',
  MIN = '1 MIN',
  HALFHOUR = '30 MIN',
  HOUR = '1 HOUR'
}




interface Message {
  sender: string;
  msg: string;
}

interface  User {
  id: String ;
  full_name: String
  username: String //unique


  // chats ChatUser[]
  // messages MessageUser[]

}

interface ChatUser{
  // chat_id Int
  // chat Chat @relation(fields: [chat_id], references: [id])
  // user_id String
  // user User @relation(fields: [user_id], references: [id])
  // role Role
  // is_muted Boolean
  // mute_time MuteTime?
  // is_banned Boolean

  // @@id([chat_id, user_id])
}

// model MessageUser{
//   chat_id Int
//   chat Chat @relation(fields: [chat_id], references: [id])
//   user_id String
//   user User @relation(fields: [user_id], references: [id])
//   text String
//   time DateTime @default(now())

//   @@id([chat_id, user_id])
// }

interface Room {
  id: number;
  name: string;
  type: string;
  // password String?
  // users ChatUser[]
  messages: Array<Message>;
}

class Room {
  constructor(id: number, name: string, type: string) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.messages = Array<Message>();
}

  pushMessage(newMsg: Message){
    this.messages.push(newMsg);
  }

  getAllMessages(): any{
    return ({});
  }
}


interface userSocket{
  //usernme: string;
  username: string;
  socket: Socket;
  room: string;
}

class userSocket{
  constructor(userid: string, socket: Socket) {
    this.username = userid;
    this.socket = socket;
    this.room = '';
  }
  setroom(room: string){
    this.room = room;
  }
  getroom() : string{
    return this.room;
  }
  getsocket(): Socket{
    return this.socket
  }
  getusername(): string {
    return this.username;
  }
}


interface notification{
  status: string;
  statuscontent: string
}

class notification{
  constructor(){
    this.status = '';
    this.statuscontent = '';
  }
  setStatus(status: string){
    this.status = status;
  }

  getStatus(): string{
    return this.status;
  }

  setStatusContent(statuscontent: string){
    this.statuscontent = statuscontent;
  }
  getStatusContent(){
    return this.statuscontent;
  }

  getNotification(){
    let data = {
      status: this.status,
      statuscontent: this.statuscontent,
    };
    return data;
  }
}

/*
  // TOADD: payloads interfaces and classes
*/



@WebSocketGateway(4000, { 
  cors: {
    credentials: true,
  origin: 'http://localhost:3000',
  }
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly jwtService: JwtService, private readonly prismaService: PrismaService) {}
  private server: Server;
  private logger: Logger = new Logger("ChatGateway");
  private rooms: Array<Room> = Array<Room>();
  private chatservice: ChatService;


  //TODO: an array of the connected sockets
  private userSocketMap: Array<userSocket> = Array<userSocket>();


  roomcount: number = 0;

  afterInit(server: Server) {
    this.server = server;
    this.logger.log("INITIALIZED")
  }

  async handleConnection(client: Socket) {    
    const user = await this.getUserFromSocket(client);
    
    if (user)
    {
      //console.log("client has connected  " + user.username);

    // TODO: retrieve all the connected user's DMs

    // TODO: retrieve all rooms except privates rooms

    // TODO: notify client

    // TODO: add client to connected_clients_map
      this.userSocketMap.push(new userSocket(user.username, client));
    
      let notif: notification = new notification();
      var sentpayload = {
        notification: { },
        payload: null,
      };
      notif.setStatusContent('Name Has Been Changed Successfully');
      notif.setStatus(NOTIF_STATUS.SUCCESS);
      sentpayload.notification = notif.getNotification();

      client.emit('connection', sentpayload);

      // TODO: notify the server to updated online users      
    }
  }

  handleDisconnect(client: Socket) {
    //console.log("client has disconnected ");
    
    // TODO: remove the client from connected_clients_array
    let index = this.userSocketMap.findIndex(e => e.socket == client);
    this.userSocketMap.splice(index, 1);
  }
  
  @SubscribeMessage('leave')
  async handleLeave(client: any, payload: any) {
    console.log("linet has joined payload  " + payload.room);
    client.leave(payload.room);
    this.server.emit('left', payload.room);


    // TODO: if client is owner, assign owner role to another random memeber
        // TODO: if the client is the only memeber in the room, delete the room from the database
    
    // TODO:  remove the user from the selected room from user_chats table
    
    // TODO: notify all the rooms memebers clients by sending ([UserName] has left the chat)

    // TODO: add the sent message to database

  }

  @SubscribeMessage('createRoom')
  async create_room(client: Socket, payload: any) {
   let membersObj = JSON.parse(payload['members']);
   if (payload['type'] === 'protected' && payload['password'] === undefined)
   {
     client.emit('roomnotcreated', 'Password Required');
     return ;
    }
    const user = await this.getUserFromSocket(client);
    this.chatservice.CreateRoom(user.username, payload['name'], payload['type'], membersObj, payload['password'], this.server, client);
    console.log(user.username + " has create room  : " + payload.name + ' of type : ' + payload.type);
  
    // TODO: check the new room type

    // TODO: get the new memebers and put them in (array or objects, still havent decided yet)
    
    // TODO: create the new room in the data base

    // TODO: add the members database

    // TODO: set the the room creator as owner

    // TODO: if the created room is public or protected 
        // TODO: notify all the server clients to update thier room list in the frontend
  
  }


  @SubscribeMessage('join')
  async handleJoin(client: Socket, payload: any) {
    console.log("linet has joined room  " + payload.room);
    client.join(payload.room);
    this.server.emit('joined', payload.room);
    let index = this.rooms.findIndex(room => room.name == payload.room);
    this.rooms[index].messages.forEach(msg => {
      this.server.to(payload.room).emit("recieved", msg);
    });


    // TODO: check if the client has permission to join
        // TODO: if not notify the client with the reason why
    client.emit('not_joined', payload.room);

    // TODO: add the client user in the selected room table

    // TODO: notify all the room memebers clients by sending ("[UserName] has joined the room") message

    // TODO: add the sent message to database

     client.emit('joined', payload.room);
     client.emit('not_joined', payload.room);

     // TODO: enter the room
  }

  @SubscribeMessage('recieved')
  async messagerecieved( client: Socket, payload: any){

    console.log("Message sent By : ", payload.sender);
    console.log(payload.msg + " new message sent in " + payload.room);
    this.server.to(payload.room).emit("recieved", payload);


    let index = this.rooms.findIndex(room => room.name == payload.room);
    let newmsg: Message = {
      sender: payload.sender,
      msg: payload.msg
    };
    this.rooms[index].pushMessage(newmsg);

    // TODO: check if user mute ((currentTimeStamp - user.muteTimeStamp) > user.muteDuration)
    //client.emit('mute', 'muted')

    // TODO: send message to all sockets actaully in the room

    // TODO: add the message in the data base

  }

  // client has selected a room in frontend {MIGHT CHANGE TO BE INCLUDED IN JOINROOM}
  @SubscribeMessage('enter_room')
  async enterroom(client: Socket, payload: any) {

    // TODO: check if user already joined the selected room
    client.emit('room_not_entered', payload.roomname);
    
    client.join(payload.roomname);
    // TODO: retrieve all the selected room's messages from the database 
    
    // TODO: send the retrieved messages to joined client
    client.emit('room_enter', {messages: 'messages'});
  }

  // user has added another user to a room
  @SubscribeMessage('invite')
  async inviteusertoroom(client: Socket, payload: any) {
    let notif: notification = new notification();
    var sentpayload = {
      notification: { },
      payload: null,
    };


    //  TODO: get user role, and room type from the database
    let updator_role = 'OWNER'; //  await getUserRole(payload.updator.username, payload.roomid);
    let room_type = 'PUBLIC'; //  await getUserType(payload.roomid);
    

    // TODO: check client has permission to invite other users (only owner or admins can)
    if ((updator_role !== 'OWNER' && updator_role !== 'ADMIN') || room_type === 'DM') {
      notif.setStatus(NOTIF_STATUS.FAILED);
      notif.setStatusContent('Permission Denied');
      sentpayload.notification = notif.getNotification();
      client.emit('invited', sentpayload);
      return;
    }
    
    // TODO: add the invited user in the room's database
    // TODO: add the inviteduser Message in the room's database
    
    // TODO: notify all clients in the room
    // TOFIX: send a message in the room 
    notif.setStatus(NOTIF_STATUS.UPDATE);
    notif.setStatusContent(payload.invited + ' has been invited ' + payload.access);
    sentpayload.notification = notif.getNotification();
    sentpayload.payload = { invited: payload.invited};
    let roomid = this.getuserSocketRoom(payload.inviter);
    this.server.to[roomid].emit('access_update', sentpayload);


    // TODO: notify the client
    sentpayload.payload = null;
    notif.setStatus(NOTIF_STATUS.SUCCESS);
    notif.setStatusContent(payload.invited + ' has been added successfully');
    sentpayload.notification = notif.getNotification();
    client.emit('access_update', sentpayload);
    
  }
  
  // change a room type(public, private, protected)
  @SubscribeMessage('update_access')
  async updateroomaccess(client: Socket, payload: any) {
    let notif: notification = new notification();
    var sentpayload = {
      notification: { },
      payload: null,
    };

    //  TODO: get user role, and room type from the database
    let updator_role = 'OWNER'; //  await getUserRole(payload.updator.username, payload.roomid);
    let room_type = 'PUBLIC'; //  await getUserType(payload.roomid);
    
    // TODO: check client has permission for the change (only owner)
    if (updator_role !== 'OWNER' || room_type === 'DM'){
      notif.setStatus(NOTIF_STATUS.FAILED)   ;
      notif.setStatusContent('Permission Denied') ;
      sentpayload.notification = notif.getNotification();
      client.emit('access_update', sentpayload);
      return ;
    }

    // TODO: if new type is protected check the password
    if (payload.access === 'protected' && payload.password == undefined){
      notif.setStatus(NOTIF_STATUS.FAILED)   ;
      notif.setStatusContent('Valid Password Required') ;
      sentpayload.notification = notif.getNotification();
      client.emit('access_update', sentpayload);
      return ;
    }

    // TODO: change the room access type in data base
    
    

    // TODO: notify the room clients
    sentpayload.payload = { room: payload.room, newaccess: payload.access}
    notif.setStatus(NOTIF_STATUS.UPDATE);
    notif.setStatusContent(payload.room + ' is now ' + payload.access) ;
    sentpayload.notification = notif.getNotification();
    let roomid = this.getuserSocketRoom(payload.updater);
    this.server.to[roomid].emit('access_update', sentpayload);


    // TODO: notify the client 
    sentpayload.payload = null;
    notif.setStatus(NOTIF_STATUS.SUCCESS)   ;
    notif.setStatusContent(payload.room + ' is now ' + payload.access) ;
    sentpayload.notification = notif.getNotification();
    client.emit('access_update', sentpayload);

  }

  // change a room name
  @SubscribeMessage('update_name')
  async updateroomname(client: any, payload: any) {
    let notif: notification = new notification();
    var sentpayload = {
      notification: { },
      payload: null,
    };

    
    //  TODO: get user role, and room type from the database
    let updator_role = 'OWNER'; //  await getUserRole(payload.updator.username, payload.roomid);
    let room_type = 'PUBLIC'; //  await getUserType(payload.roomid);

    // TODO: check client has permission for the change (owner or admins)
    // TODO: check room is not DM
    // TOFIX: 
    if (updator_role === 'member' || room_type === 'DM'){
      notif.setStatus(NOTIF_STATUS.FAILED)   ;
      notif.setStatusContent('Permission Denied') ;
      sentpayload.notification = notif.getNotification();
      client.emit('name_update', { oldname: payload.oldname, newname: payload.newname});
      return ;
    }

    // TODO: check new name (not empty, max lenght, min lenght...,)
    else if (payload.newname === '    ') {//TOFIX: 
      notif.setStatus(NOTIF_STATUS.FAILED);
      notif.setStatusContent('Invalid Name');
      sentpayload.notification = notif.getNotification();
      client.emit('name_update', { oldname: payload.oldname, newname: payload.newname });
      return ;
    }
    

    // TODO: change the room name in the data base

    // TODO: notify the server sockets 
    this.server.emit('name_update', { oldname: payload.oldname, newname: payload.newname});
    
    
    // TODO: notify the client 
    sentpayload.payload = { updator: payload.updator, newname: payload.newname, oldname: payload.oldname }
    notif.setStatusContent('Name Has Been Changed Successfully');
    notif.setStatus(NOTIF_STATUS.SUCCESS);
    sentpayload.notification = notif.getNotification();
    client.emit('name_update', sentpayload);
  }

  // update a user role in specific room
  @SubscribeMessage('update_role')
  async updateuserrole(client: any, payload: any) {
    // TODO: create empty notifationobject and empty sent object
    let notif: notification = new notification();
    var sentpayload = {
      notification: { },
      payload: null,
    };
  
    // TODO:::::MUST BE FETCHED FROM DATABASE
    let updated_role = 'member'; // await getUserRole(payload.updated.username, payload.roomid);
    let updator_role = 'owner'; //  await getUserRole(payload.updator.username, payload.roomid);
    
    // TODO: check if the clientUser has the required permission (owner or admin)
    if (updator_role !== 'owner' || payload.newrole === 'owner'){
      notif.setStatus(NOTIF_STATUS.FAILED)   ;
      notif.setStatusContent('Permission Denied') ;
      sentpayload.notification = notif.getNotification();
      client.emit('role_update', sentpayload);
      return ;
    }
    
    // TODO: change the selected member role in the database
    
    if (sentpayload.payload == null){
    // TODO: notify the client
      notif.setStatusContent('Try Again Later');
      notif.setStatus(NOTIF_STATUS.FAILED);
      sentpayload.notification = notif.getNotification();
      client.emit('role_update', 'Role Updated');
    }else{
      // TODO: Notify all members in the room
      notif.setStatus(NOTIF_STATUS.UPDATE);
      notif.setStatusContent(updated_role + ' role Has Been Updated');
      sentpayload.notification = notif.getNotification();
      let roomid = this.getuserSocketRoom(payload.updator);
      this.server.to[roomid].emit('role_update', {room: payload.room, updateduser: updated_role, newrole: payload.newrole});
    }
  }
  
  // ban, mute or kick user in specific room
  @SubscribeMessage('update_restriction')
  updaterestriction(client: Socket, payload: any) {
    let notif: notification = new notification();
    var sentpayload = {
      notification: { },
      payload: null,
    };

    // TODO:::::MUST BE FETCHED FROM DATABASE
    let restricted_role = 'member'; // await getUserRole(payload.restricted.username, payload.roomid);
    let restrictor_role = 'owner'; //  await getUserRole(payload.restrictor.username, payload.roomid);

    // TODO: if restrictor is a normal member
    // TODO: restricted === 'owner'
    // TODO: restricted === 'admin' && restrictor === 'admin'
    if (restrictor_role === 'member' || restricted_role === 'owner'
    || (restricted_role === 'admin' && restrictor_role === 'admin')) {
        notif.setStatus(NOTIF_STATUS.FAILED)   ;
        notif.setStatusContent('Permission Denied') ;
        sentpayload.notification = notif.getNotification();
        client.emit('restriction_update', sentpayload);
        return ;
    }


    // TODO: check the type of the restriction
    if (payload.restriction === RESTRICTION.BAN) {
      sentpayload.payload.message = payload.updateduser + ' Has Been Banned';
      notif.setStatusContent(payload.updateduser + ' Has Been Banned');
      // TODO: apply the change in the data base
      //sentpayload.payload = this.chatservice.banUser(client, this.server, payload);
    }
    else if (payload.restriction === RESTRICTION.MUTE) {
      sentpayload.payload.message = payload.updateduser + ' Has Been Muted For ' + payload.muteduration
      notif.setStatusContent(payload.updateduser + ' Has Been Muted For ' + payload.muteduration);
      // TODO: apply the change in the data base
      //sentpayload.payload = this.chatservice.muteUser(client, this.server, payload);
    }
    else if (payload.restriction === RESTRICTION.KICK) {
      sentpayload.payload.message = payload.updateduser + ' Has Been Kicked';
      notif.setStatusContent(payload.updateduser + ' Has Been Kicked');
      // TODO: apply the change in the data base
      //sentpayload.payload = this.chatservice.kickUser(client, this.server, payload);
    }
    else {
      notif.setStatus(NOTIF_STATUS.FAILED)   ;
      notif.setStatusContent('Invalid Restriction') ;
      sentpayload.notification = notif.getNotification();
      client.emit('restriction_update', sentpayload);
      return ;
    }




    // TODO: notify client in failure
    if (sentpayload.payload == null){
      notif.setStatusContent('Try Again Later');
      notif.setStatus(NOTIF_STATUS.FAILED);
      sentpayload.notification = notif.getNotification();
      client.emit('restriction_updated', sentpayload);
    }
    else {
      // TODO: send user name has been banned message in the room
      notif.setStatus(NOTIF_STATUS.UPDATE);
      let roomid = this.getuserSocketRoom(payload.restrictor.username);
      sentpayload.notification = notif.getNotification();
      this.server.to[roomid].emit('restriction_updated', sentpayload);

      // TODO: clear payload
      sentpayload.payload = null;
      
      // TODO: notify the restrictor
      notif.setStatusContent('You Have Banned ' + payload.updateduser + 'Successfully');
      notif.setStatus(NOTIF_STATUS.SUCCESS);
      sentpayload.notification = notif.getNotification();
      client.emit('restriction_updated', sentpayload);
      
      // TODO: notify the restricted
      var restrictedSocket = this.getUserSocket(payload.updateduser); // getUserSocket(payload.restricted.username);
      notif.setStatusContent('You Have Been Banned');
      notif.setStatus(NOTIF_STATUS.RESTRICTED);
      sentpayload.notification = notif.getNotification();
      restrictedSocket.emit('restriction_updated', sentpayload);
    }

  }



  async getUserFromSocket(socket: Socket) {
		const cookies = socket.handshake.headers.cookie;
		if (cookies) {
			const token = cookies.split(';').find((c) => c.trim().startsWith('access_token='));
			if (token) {
				const payload: any = this.jwtService.decode(token.split('=')[1]);
        //console.table(payload);
				const user = await this.prismaService.user.findUnique({
					where: { id: payload.id },
          
				});
        //console.log(user);
				return user;
			}
		}
		return null;
	}

  getuserSocketRoom(username: string): string
  {
    let index = this.userSocketMap.findIndex(usersocket => usersocket.getusername() == username);
    return this.userSocketMap[index].getroom();
  }

  getUserSocket(username: string): Socket{
    let index = this.userSocketMap.findIndex(usersocket => usersocket.getusername() == username);
    return this.userSocketMap[index].getsocket();
  }

}
