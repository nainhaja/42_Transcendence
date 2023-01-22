import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { Server, Socket } from "socket.io";
import { Logger, PayloadTooLargeException } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getFromContainer } from 'class-validator';
import { Role } from '@prisma/client';
import { emit } from 'process';
import { access } from 'fs';

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


enum ROLE {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER'
}



interface userSocket {
  username: string;
  socket: Socket;
  currentroom: string;
}

class userSocket {
  constructor(userid: string, socket: Socket) {
    this.username = userid;
    this.socket = socket;
    this.currentroom = '';
  }
  setroom(room: string) {
    this.currentroom = room;
  }
  getroom(): string {
    return this.currentroom;
  }
  getsocket(): Socket {
    return this.socket
  }
  getusername(): string {
    return this.username;
  }
}


interface notification {
  status: string;
  statuscontent: string
}

class notification {
  constructor() {
    this.status = '';
    this.statuscontent = '';
  }
  setStatus(status: string) {
    this.status = status;
  }

  getStatus(): string {
    return this.status;
  }

  setStatusContent(statuscontent: string) {
    this.statuscontent = statuscontent;
  }
  getStatusContent() {
    return this.statuscontent;
  }

  getNotification() {
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

interface Message {
  id: number;
  sender: string;
  messagecontent: string;
  time: Date;
  profile: string;
}

@WebSocketGateway(4000, {
  cors: {
    credentials: true,
    origin: 'http://localhost:3000',
  }
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly jwtService: JwtService, private readonly prismaService: PrismaService) { }
  private server: Server;
  private logger: Logger = new Logger("ChatGateway");

  private chatservice: ChatService;


  //TODO: an array of the connected sockets
  private userSocketMap: Array<userSocket> = Array<userSocket>();


  roomcount: number = 0;

  afterInit(server: Server) {
    this.server = server;
    this.logger.log("INITIALIZED")
  }

  async handleConnection(client: Socket) {
    try {
      const user = await this.getUserFromSocket(client);
      console.log(user.username + " has just connected!");

      // TODO: add client to connected_clients_map
      this.userSocketMap.push(new userSocket(user.username, client));

      let notif: notification = new notification();
      var sentpayload = {
        notification: {},
        payload: null,
      };


      const roomusers = await this.getAllRoomsByUserId(user.id);
      // const roomusers = await this.prismaService.roomUser.findMany({
      //   where: {
      //     user_id: user.id
      //   },
      //   include: {
      //     chat: true
      //   }
      // })



      let joinedrooms = roomusers.map((room) => {
        room.chat['joined'] = true;
        room.chat['lastmessage'] = ''
        return (room.chat);
      })

      let allrooms = await this.getAllRooms(client);

      for (let i = 0; i < allrooms.length; i++) {
        let found = false;
        for (let j = 0; j < joinedrooms.length; j++) {
          if (allrooms[i].id == joinedrooms[j].id) {
            found = true
            break;
          }
        }
        if (!found)
          joinedrooms.push(allrooms[i]);
      }

      sentpayload.payload = {
        rooms: joinedrooms,
        otherrooms: [],
        dms: [],
        username: user.username,
        id: user.id,
        fullname: user.full_name,
        profile: user.avatar,
      };


      await client.emit('connection', sentpayload);
      //console.log('hhhahshhashashash' + JSON.stringify(array));




      // let objArray: any[] = Array.from(roomusers, async roomuser => {
      //   const room = await this.prismaService.room.findUnique({
      //     where: {
      //       id: roomuser.Room_id,
      //     }
      //   })
      //   return {
      //     roomname: room.name,
      //     lastmessage: '',
      //     access: room.type,
      //     id: room.id
      //   }
      // });

      // sentpayload.payload.rooms = here;

      //   username: user.username,}
      //console.log('sent payload is ' + here[0].roomname)



      // TODO: notify the server to updated online users
    }

    catch {
      console.log('couldnt connect')
    }
  }

  handleDisconnect(client: Socket) {
    console.log("client has disconnected ");

    // TODO: remove the client from connected_clients_array
    let index = this.userSocketMap.findIndex(e => e.socket == client);
    this.userSocketMap.splice(index, 1);
  }

  @SubscribeMessage('leave')
  async handleLeave(client: Socket, payload: any) {
    try {
      // const user = await this.getUserFromSocket(client);
      // const room = await this.getRoomByRoomId(payload.roomid);
      // const deleteroomuser = await this.prismaService.roomUser.delete({
      //   where: {
      //     AND: [
      //       {
      //         Room_id: room.id
      //       },
      //       {
      //        user_id: user.id
      //       },
      //     ],
      //   },
      // }) 
    } catch (error) {
      
    }



    // TODO: if client is owner, assign owner role to another random memeber
    // TODO: if the client is the only memeber in the room, delete the room from the database

    // TODO:  remove the user from the selected room from user_chats table

    // TODO: notify all the rooms memebers clients by sending ([UserName] has left the chat)

    // TODO: add the sent message to database

  }

  @SubscribeMessage('createroom')
  async create_room(client: Socket, payload: any) {



    // this.rooms.push(new IRoom(this.roomcount++, payload.name, payload.access, payload.password, user.username))

    // TODO: check the new room type

    // TODO: get the new memebers and put them in (array or objects, still havent decided yet)

    // TODO: create the new room in the data base

    // TODO: add the members database

    // TODO: set the the room creator as owner

    // TODO: if the created room is public or protected 
    // TODO: notify all the server clients to update thier room list in the frontend

    try {
      const user = await this.getUserFromSocket(client);
      const room = await this.prismaService.room.create({
        data: {
          name: payload.name,
          type: payload.access,
          password: payload.password,
        }
      });
      const roomuser = await this.prismaService.roomUser.create({
        data: {
          user_id: user.id,
          Room_id: room.id,
          role: Role.OWNER,
          is_banned: false,
          mute_time: new Date(),
        }
      });


      room['joined'] = true;
      let sentpayload = {
        payload: {
          room: room,
        }
      }



      console.log(payload.name + ' with id: ' + room.id + ' has been created succefully ');
      client.emit('roomcreate', sentpayload);

      this.server.emit('requestroomsupdate');

      const roominfo = {
        // profile: 'hgrissen.jpeg',//props.room.profile,
        roomname: room.name,
        lastmessage: 'hello',//props.room.lastmessage,
        lastmessagedate: '',
        id: room.id,
        type: room.type,
        joined: true,
        password: '',
      }
      this.enterroom(client, roominfo)
    }
    catch {
      console.log('room cant be created');
    }



  }


  @SubscribeMessage('joinroom')
  async handleJoin(client: Socket, payload: any) {
    try {
      const room = await this.getRoomByRoomId(payload.id);
      const user = await this.getUserFromSocket(client);
      if (room.type == ACCESS.PROTECTED && room.password != payload.password) {
        console.log('Wrong Password!!??');
        client.emit('roomjoinerror', { message: 'wrong password!' });
        return;
      }
      const roomuser = await this.prismaService.roomUser.create({
        data: {
          user_id: user.id,
          Room_id: room.id,
          role: Role.MEMBER,
          is_banned: false,
          mute_time: new Date(),
        }
      });
      client.emit('roomjoin', roomuser);

      const roominfo = {
        // profile: 'hgrissen.jpeg',//props.room.profile,
        roomname: room.name,
        lastmessage: '',//props.room.lastmessage,
        lastmessagedate: '',
        id: room.id,
        type: room.type,
        joined: true,
        password: '',
      }
      this.enterroom(client, roominfo)


      client.emit('requestroomsupdate');

    } catch (error) {
      client.emit('roomjoinerror', { message: 'try again later!' });
    }


    // TODO: check if the client has permission to join
    // TODO: if not notify the client with the reason why
    // client.emit('roomjoin', payload.room);

    // TODO: add the client user in the selected room table


    // TODO: notify all the room memebers clients by sending ("[UserName] has joined the room") message

    // TODO: add the sent message("[UserName] has joined the room") to database

    // client.emit('joined', payload.room);


    // TODO: enter the room
    // leave old room
    // join new room
  }




  //   try{
  //     if (!user.achievements.includes(achievement)){
  //         const updated_user = await this.prisma.user.update({
  //             where: {id: user.id },
  //             data: {
  //                 achievements: {
  //                     push: achievement,
  //                 }
  //             }
  //           });
  //         return updated_user;
  //     }
  //     return user;
  // }



  @SubscribeMessage('recievemessage')
  async messagerecieved(client: Socket, payload: any) {


    try {
      const user = await this.getUserFromSocket(client);
      console.log(user.username + " : ", payload.message);


      let newmesg = { sender: user.username, messagecontent: payload.message, profile: user.avatar };

      this.userSocketMap.forEach((usersocket) => {
        //console.log(usersocket.currentroom);
        if (usersocket.currentroom == payload.roomid)
          usersocket.getsocket().emit('messagerecieve', newmesg);

      })

      let room = await this.getRoomByRoomId(payload.roomid);

      const msguser = await this.prismaService.messageUser.create({
        data: {
          room_id: room.id,
          user_id: user.id,
          content: payload.message,
          avatar: user.avatar,
          username: user.username,
        }
      })

    } catch (error) {

    }


    // TODO: check if user mute ((currentTimeStamp - user.muteTimeStamp) > user.muteDuration)
    //client.emit('mute', 'muted')

    // TODO: send message to all sockets actaully in the room

    // TODO: add the message in the data base


    // retrieve all messages
    //this.enterroom(client, payload);
  }

  // client has selected a room in frontend {MIGHT CHANGE TO BE INCLUDED IN JOINROOM}
  @SubscribeMessage('enterroom')
  async enterroom(client: Socket, payload: any) {

    // TODO: check if user already joined the selected room
    const room = await this.getRoomByRoomId(payload.id);

    const user = await this.getUserFromSocket(client);
    //console.log(room);

    const roomuser = await this.prismaService.roomUser.findMany({
      where: {
        AND: [
          {
            user_id: user.id
          },
          {
            Room_id: room.id
          },
        ],
      },
    })

    if (roomuser[0].is_banned) {
      //emit error your arre banned from this channel
      //client.emit('');
      return;
    }



    const msgs = await this.getAllMessagesByRoomId(room.id, user.id);

    //let messages = [];
    //let messages;//: Array<Message> = Array<Message>();
    // {id : 0, sender: 'fibo', messagecontent: 'wash al3shir hani', profile: 'hgrissen.jpeg'},
    // {id : 1, sender: 'nizar', messagecontent: 'hmd o nta ?', profile: 'hgrissen.jpeg'},
    // {id : 2, sender: 'fibo', messagecontent: 'bikhir ', profile: 'hgrissen.jpeg'},
    // {id : 3, sender: 'nizar', messagecontent: 'dik chat maghadish issali wla kifash??', profile: 'hgrissen.jpeg'},
    // {id : 4, sender: 'fibo', messagecontent: 'wa ghir sma7lia a dak zamel', profile: 'hgrissen.jpeg'},
    // {id : 5, sender: 'nizar', messagecontent: 'shuf 3rfti ash ghadi dir', profile: 'hgrissen.jpeg'},
    // {id : 6, sender: 'nizar', messagecontent: 'ana mab9itsh m3akum fhad lprojet', profile: 'hgrissen.jpeg'},

    //  messages = msgs.map(async (msg) => {
    //     const sender = await this.prismaService.user.findUnique({
    //       where: {
    //         id: msg.user_id
    //       }
    //     })


    //     msg['id'] = msg.Message_id,
    //     msg['sender'] = sender.username,
    //     msg['messagecontent'] = msg.content,
    //     msg['time'] = msg.time,
    //     msg['profile'] = sender.avatar

    //   })

    // msgs.forEach(async (msg) => {
    //   const sender = await this.prismaService.user.findUnique({
    //     where: {
    //       id: msg.user_id
    //     }
    //   })

    //   await messages.push({
    //     id: msg.Message_id,
    //     sender: sender.username,
    //     messagecontent: msg.content,
    //     time: msg.time,
    //     profile: sender.avatar
    //   });
    // })


    const sentpayload = {
      room: room,
      messages: msgs,
    }

    room['role'] = roomuser[0].role;


    // console.log('    hi     ');

    // console.log(sentpayload.messages);

    // console.log('    ho     ');

    let index = this.userSocketMap.findIndex(e => e.socket == client);
    client.leave[this.userSocketMap[index].getroom()];
    this.userSocketMap[index].setroom(room.id.toString());
    client.join[this.userSocketMap[index].getroom()];



    client.emit('roomenter', sentpayload);

    // client.leave(payload.room_id);
    // join room this room socket
    // client.join(payload.room_id);


    // TODO: retrieve all the selected room's messages from the database 
    //const messages = await this.getAllMessagesByRoomId(payload.room_id);

    // TODO: send the retrieved messages to joined client
    // client.emit('roomenter', { messages: 'messages' });
  }

  // user has added another user to a room
  @SubscribeMessage('invite')
  async inviteusertoroom(client: Socket, payload: any) {
    let notif: notification = new notification();
    var sentpayload = {
      notification: {},
      payload: null,
    };




    try {

      const updator = await this.getUserFromSocket(client);
      const updatorroomuser = await this.getRoomUser(payload.roomid, updator.id);

      if ((updatorroomuser.role != ROLE.OWNER && updatorroomuser.role != ROLE.ADMIN) || updatorroomuser.chat.type == ACCESS.DM) {
        notif.setStatus(NOTIF_STATUS.FAILED);
        notif.setStatusContent('Permission Denied');
        sentpayload.notification = notif.getNotification();
        client.emit('invited', sentpayload);
        return;
      }

      const inviteduser = await this.getUserByUserName(payload.username);
      let addedroomuser;
      if (inviteduser)
        addedroomuser = await this.getRoomUser(payload.roomid, inviteduser.id);

      if (addedroomuser || !inviteduser) {
        console.log('already in room or user doesn\'t exist!');
        return;
      }
      else
        console.log('will be in room soon!');

      // TODO: check client has permission to invite other users (only owner or admins can)


      // const inviteduser = await this.getUserByUserName(payload.username);


      addedroomuser = await this.prismaService.roomUser.create({
        data: {
          user_id: inviteduser.id,
          Room_id: payload.roomid,
          role: Role.MEMBER,
          is_banned: false,
          mute_time: new Date(),
        }
      });

      const othersocket = this.getUserSocket(payload.username);
      othersocket.emit('requestroomsupdate');

    } catch (error) {

    }

    // TODO: add the invited user in the room's database
    // TODO: add the inviteduser Message in the room's database

    // TODO: notify all clients in the room
    // TOFIX: send a message in the room 
    // notif.setStatus(NOTIF_STATUS.UPDATE);
    // notif.setStatusContent(payload.invited + ' has been invited ' + payload.access);
    // sentpayload.notification = notif.getNotification();
    // sentpayload.payload = { invited: payload.invited };
    // let roomid = this.getuserSocketRoom(payload.inviter);
    // this.server.to[roomid].emit('access_update', sentpayload);


    // TODO: notify the client
    // sentpayload.payload = null;
    // notif.setStatus(NOTIF_STATUS.SUCCESS);
    // notif.setStatusContent(payload.invited + ' has been added successfully');
    // sentpayload.notification = notif.getNotification();
    // client.emit('access_update', sentpayload);

  }

  // change a room type(public, private, protected)
  @SubscribeMessage('update_access')
  async updateroomaccess(client: Socket, payload: any) {
    let notif: notification = new notification();
    var sentpayload = {
      notification: {},
      payload: null,
    };

    //  TODO: get user role, and room type from the database
    let updator_role = 'OWNER'; //  await getUserRole(payload.updator.username, payload.roomid);
    let room_type = 'PUBLIC'; //  await getUserType(payload.roomid);

    // TODO: check client has permission for the change (only owner)
    if (updator_role !== 'OWNER' || room_type === 'DM') {
      notif.setStatus(NOTIF_STATUS.FAILED);
      notif.setStatusContent('Permission Denied');
      sentpayload.notification = notif.getNotification();
      client.emit('access_update', sentpayload);
      return;
    }

    // TODO: if new type is protected check the password
    if (payload.access === 'protected' && payload.password == undefined) {
      notif.setStatus(NOTIF_STATUS.FAILED);
      notif.setStatusContent('Valid Password Required');
      sentpayload.notification = notif.getNotification();
      client.emit('access_update', sentpayload);
      return;
    }

    // TODO: change the room access type in data base



    // TODO: notify the room clients
    sentpayload.payload = { room: payload.room, newaccess: payload.access }
    notif.setStatus(NOTIF_STATUS.UPDATE);
    notif.setStatusContent(payload.room + ' is now ' + payload.access);
    sentpayload.notification = notif.getNotification();
    let roomid = this.getuserSocketRoom(payload.updater);
    this.server.to[roomid].emit('access_update', sentpayload);


    // TODO: notify the client 
    sentpayload.payload = null;
    notif.setStatus(NOTIF_STATUS.SUCCESS);
    notif.setStatusContent(payload.room + ' is now ' + payload.access);
    sentpayload.notification = notif.getNotification();
    client.emit('access_update', sentpayload);

  }

  // change a room name
  @SubscribeMessage('update_name')
  async updateroomname(client: any, payload: any) {
    let notif: notification = new notification();
    var sentpayload = {
      notification: {},
      payload: null,
    };


    //  TODO: get user role, and room type from the database
    let updator_role = 'OWNER'; //  await getUserRole(payload.updator.username, payload.roomid);
    let room_type = 'PUBLIC'; //  await getUserType(payload.roomid);

    // TODO: check client has permission for the change (owner or admins)
    // TODO: check room is not DM
    // TOFIX: 
    if (updator_role === 'member' || room_type === 'DM') {
      notif.setStatus(NOTIF_STATUS.FAILED);
      notif.setStatusContent('Permission Denied');
      sentpayload.notification = notif.getNotification();
      client.emit('name_update', { oldname: payload.oldname, newname: payload.newname });
      return;
    }

    // TODO: check new name (not empty, max lenght, min lenght...,)
    else if (payload.newname === '    ') {//TOFIX: 
      notif.setStatus(NOTIF_STATUS.FAILED);
      notif.setStatusContent('Invalid Name');
      sentpayload.notification = notif.getNotification();
      client.emit('name_update', { oldname: payload.oldname, newname: payload.newname });
      return;
    }


    // TODO: change the room name in the data base

    // TODO: notify the server sockets 
    this.server.emit('name_update', { oldname: payload.oldname, newname: payload.newname });


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
      notification: {},
      payload: null,
    };

    // TODO:::::MUST BE FETCHED FROM DATABASE
    let updated_role = 'member'; // await getUserRole(payload.updated.username, payload.roomid);
    let updator_role = 'owner'; //  await getUserRole(payload.updator.username, payload.roomid);

    // TODO: check if the clientUser has the required permission (owner or admin)
    if (updator_role !== 'owner' || payload.newrole === 'owner') {
      notif.setStatus(NOTIF_STATUS.FAILED);
      notif.setStatusContent('Permission Denied');
      sentpayload.notification = notif.getNotification();
      client.emit('role_update', sentpayload);
      return;
    }

    // TODO: change the selected member role in the database

    if (sentpayload.payload == null) {
      // TODO: notify the client
      notif.setStatusContent('Try Again Later');
      notif.setStatus(NOTIF_STATUS.FAILED);
      sentpayload.notification = notif.getNotification();
      client.emit('role_update', 'Role Updated');
    } else {
      // TODO: Notify all members in the room
      notif.setStatus(NOTIF_STATUS.UPDATE);
      notif.setStatusContent(updated_role + ' role Has Been Updated');
      sentpayload.notification = notif.getNotification();
      let roomid = this.getuserSocketRoom(payload.updator);
      this.server.to[roomid].emit('role_update', { room: payload.room, updateduser: updated_role, newrole: payload.newrole });
    }
  }

  // ban, mute or kick user in specific room
  @SubscribeMessage('update_restriction')
  updaterestriction(client: Socket, payload: any) {
    let notif: notification = new notification();
    var sentpayload = {
      notification: {},
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
      notif.setStatus(NOTIF_STATUS.FAILED);
      notif.setStatusContent('Permission Denied');
      sentpayload.notification = notif.getNotification();
      client.emit('restriction_update', sentpayload);
      return;
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
      notif.setStatus(NOTIF_STATUS.FAILED);
      notif.setStatusContent('Invalid Restriction');
      sentpayload.notification = notif.getNotification();
      client.emit('restriction_update', sentpayload);
      return;
    }




    // TODO: notify client in failure
    if (sentpayload.payload == null) {
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


  @SubscribeMessage('updaterooms')
  async updateAllSocketRooms(client: Socket) {

    try {
      const user = await this.getUserFromSocket(client);

      let notif: notification = new notification();
      var sentpayload = {
        notification: {},
        payload: null,
      };


      const roomusers = await this.getAllRoomsByUserId(user.id);



      let joinedrooms = roomusers.map((room) => {
        room.chat['joined'] = true;
        room.chat['lastmessage'] = ''
        return (room.chat);
      })

      let allrooms = await this.getAllRooms(client);

      for (let i = 0; i < allrooms.length; i++) {
        let found = false;
        for (let j = 0; j < joinedrooms.length; j++) {
          if (allrooms[i].id == joinedrooms[j].id) {
            found = true
            break;
          }
        }
        if (!found)
          joinedrooms.push(allrooms[i]);
      }

      sentpayload.payload = {
        rooms: joinedrooms,
        otherrooms: [],
        dms: [],
      };
      client.emit('roomsupdate', sentpayload)
    }

    catch {
      console.log('couldnt connect')
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

  getuserSocketRoom(username: string): string {
    let index = this.userSocketMap.findIndex(usersocket => usersocket.getusername() == username);
    return this.userSocketMap[index].getroom();
  }

  getUserSocket(username: string): Socket {
    let index = this.userSocketMap.findIndex(usersocket => usersocket.getusername() == username);
    return this.userSocketMap[index].getsocket();
  }

  async getAllRooms(socket: Socket) {
    const allrooms = await this.prismaService.room.findMany({
      where: {
        NOT: {
          type: ACCESS.PRIVATE
        }
      },
    })
    return (allrooms);
  }

  async getAllRoomsByUserId(user_id: string) {
    // const roomusers = await this.prismaService.roomUser.findMany({
    //   where: {
    //     user_id: user_id
    //   },
    //   include: {
    //     chat: true
    //   }
    // })
    // return (roomusers);

    const roomusers = await this.prismaService.roomUser.findMany({
      where: {
        AND: [
          {
            user_id: user_id
          },
          {
            is_banned: false
          },
        ],
      },
      include: {
        chat: {

        }
      }
    })

    // roomusers[0].chat
    return (roomusers);
  }

  async getAllMessagesByRoomId(room_id: any, user_id: string) {
    const allMessages = await this.prismaService.messageUser.findMany({
      where: {
        room_id: room_id
      },
    })

    let messages = allMessages.map((msg) => {
      // const sender = await this.prismaService.user.findUnique({
      //   where: {
      //     id: msg.user_id
      //   }
      // })
      return {
        id: msg.Message_id,
        sender: msg.username,
        messagecontent: msg.content,
        time: msg.time,
        profile: msg.avatar
      }

      // msg['id'] = msg.Message_id,
      // msg['sender'] = sender.username,
      // msg['messagecontent'] = msg.content,
      // msg['time'] = msg.time,
      // msg['profile'] = sender.avatar

    })

    return messages
  }


  async getLastMessagesByRoomId(room_id: any) {
    const lastmessage = await this.prismaService.messageUser.findMany({
      where: {
        room_id: room_id,

      },
      orderBy: {
        time: 'desc'
      },
      take: 1
    })

    return (lastmessage);

  }

  async getUserByUserName(username: string) {
    const user = await this.prismaService.user.findFirst({
      where: {
        username: username
      }
    })
    return user
  }


  async getRoomUser(roomid: number, userid: string) {
    const roomuser = await this.prismaService.roomUser.findFirst({
      where: {
        AND: [{
          Room_id: roomid
        }, {
          user_id: userid
        }]
      },
      include: {
        chat: true
      }
    })
    return roomuser;
  }
  async getRoomByRoomId(room_id: number) {
    const room = await this.prismaService.room.findUnique({
      where: {
        id: room_id
      }
    })
    return room;
  }


}
