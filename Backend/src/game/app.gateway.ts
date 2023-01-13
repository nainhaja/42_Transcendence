import { Logger, Req } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import {Socket, Server} from "socket.io"
import { JwtGuard } from 'src/auth/guard';
import { UseGuards } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserDto } from 'src/user/dto';
import { ModeGame, StatusGame, UserStatus } from '@prisma/client';


userinho: new Map<string, number>();

interface player_properties 
{
  input:  string;
  id:     string;
}

interface GameID 
{
  input: string;
}

interface Game 
{
  server: Server;

  width: number;
  height: number;
  aspectRatio : number;

  ball_radius: number;
  ball_speed: number;

  paddle_width: number;
  paddle_height: number;
  paddleSpeed: number;

  ball_x: number;
  ball_y: number;
  ball_direction_x: number;
  ball_direction_y: number;

  fr_paddle_x: number;
  fr_paddle_y: number;

  sec_paddle_x: number;
  sec_paddle_y: number;

  game_initializer: any;

  state: string;
  players: Array<string>;
  users: Array<string>;
  players_avatar : Array<string>;
  players_names : Array<string>;
  spects: Array<string>;

  scores: Array<number>;
  score_limit: number;
  lastscored: string;

  winner : string;
  room: string;
  numgames: number;

   prisma: PrismaService;
   user_Service: UserService;

   user_with_game_id: Map<string, number>;
}

interface GameState {

  // dimentions :
  width: number;
  height: number;
  aspectRatio : number;


  //left paddle
  fr_paddle_x: number;
  fr_paddle_y: number;


  //right paddle
  sec_paddle_x: number;
  sec_paddle_y: number;

  paddle_width: number;
  paddle_height: number;

  // Ball properties :

  ball_x: number;
  ball_y: number;
  ball_direction_x: number;
  ball_direction_y: number;
  ball_radius: number;


  state: string; 

  players : Array<string>;
  players_avatar : Array<string>;
  players_names : Array<string>;

  scores: Array<number>;
  score_limit: number;

  winner: string;
  lastscored: string;
  


}

class Game {
  constructor(server: Server) {
    this.server = server;

    this.width = 800;
    this.height = 400;
    this.aspectRatio = 2 ;
  
    this.ball_radius = 10;
    this.ball_speed = 2.25;

    this.paddle_width = 10;
    this.paddle_height = 100;
    this.paddleSpeed = 10;

    this.ball_x = this.width / 2;
    this.ball_y = this.height / 2;
    this.ball_direction_x = 1;
    this.ball_direction_y = 1;

    this.fr_paddle_x = 0;
    this.fr_paddle_y = 0;

    this.sec_paddle_x = this.width - this.paddle_width;
    this.sec_paddle_y = 0;

    this.state = "waiting";
    this.players = [];
    this.users = [];
    this.players_avatar = [];
    this.players_names = [];

    this.room = "";

    this.scores = [0,0];
    this.score_limit = 2;
    this.winner = "";
    this.lastscored = "";
    this.numgames = 0;
    this.user_with_game_id = new Map<string, number>();

     //this.prisma = new PrismaService(new ConfigService);
     this.user_Service = new UserService(this.prisma, new ConfigService);
    
  }

  player_ids() 
  { 
    return this.players 
  }
  
  emit_and_clear(): void
  {
    this.server.to(this.room).emit("queue_status", this.queue_status());
    clearInterval(this.game_initializer);
  } 

  check_players_are_ready()
  {
    if (this.players.length === 2) 
    {
      //console.log("players are ready");
      this.server.to(this.room).emit("queue_status", this.queue_status());
      this.starting_queue();
      this.update_status("play");
    } 
  }

  update_winner(player_id: string)
  {
    if(this.players[0] === player_id)
      this.winner = this.players[1];
    else
      this.winner = this.players[0];
  }

  push_player(player: string, avatar: string, name: string)
  {
    if (this.players.length < 2)
    {
      if (this.players_names[0] !== name)
      {
        this.players.push(player);
        this.players_avatar.push(avatar);
        this.players_names.push(name);        
      }

    }
  }

  push_users(player: string)
  {
    if (this.users.length < 2)
    {
        this.users.push(player);  
    }
  }

  remove_player()
  {
    this.players.pop();
    this.players_avatar.pop();
    this.players_names.pop();
  }

  addSpec(spec: string)
  {
    this.spects.push(spec);
  }

  update_room(name: string)
  {
    this.room = name; 
  }

  update_status(state: string)
  {
    this.state = state
  }
  
  ball_properties() 
  {
    this.ball_x += this.ball_speed * this.ball_direction_x;
    this.ball_y += this.ball_speed * this.ball_direction_y;
  }

  starting_queue()
  {
    this.game_initializer = setInterval(this.My_loop_function, 1000/60, this);
  }

  My_loop_function(game: Game) 
  {
    game.ball_properties();
    game.ball_collision_with_screen();
    game.ball_collision_with_paddles();
    game.updateScore(game);
    
    game.server.to(game.room).emit("queue_status", game.queue_status());
  }

  initGame(id: string)
  {
    if(id === this.players[0])
    {
      this.ball_x = this.width / 10;
      this.ball_y = this.height / 5;
      console.log("player1 trying to start");
      this.ball_direction_x *= -1;
    }
    else if(id === this.players[1])
    {
      this.ball_x = this.width *  (9 / 10) ;
      this.ball_y = this.height / 5;
      this.ball_direction_x *= -1;
      console.log("player2 trying to start");
    }
    this.starting_queue();
    this.update_status("play");
  }


  async updateScore(game: Game)
  {
    if(this.ball_x > this.sec_paddle_x)
    {
        this.scores[0]++;
        console.log("scored1");
        



        this.update_status("scored");
        console.log("players are "+this.players.length)
        this.lastscored = this.players[0];
        clearInterval(this.game_initializer);
    }
    else if (this.ball_x < this.fr_paddle_x + this.paddle_width)
    {
      console.log("scored2");
        this.scores[1]++;
        this.update_status("scored");
        this.lastscored = this.players[1];
        clearInterval(this.game_initializer);
    }
    //BACK TO THIS 
    if(this.scores[0] === this.score_limit)
    {
      this.winner = this.players[0];
      this.update_status("endGame");
      clearInterval(this.game_initializer);
    }
    else if (this.scores[1] === this.score_limit)
    {
      this.winner = this.players[1];
      this.update_status("endGame");
      clearInterval(this.game_initializer);
    }
  }

  ball_collision_with_screen() 
  {
    if (this.ball_x + (this.ball_radius / 2) >= this.width)
      this.ball_direction_x *= -1;
    else if ( this.ball_x - (this.ball_radius / 2) <= 0)
      this.ball_direction_x *= -1;

    if (this.ball_y + (this.ball_radius / 2) >= this.height)
      this.ball_direction_y *= -1;
    else if (this.ball_y - (this.ball_radius / 2) <= 0)
      this.ball_direction_y *= -1;

    //console.log("my hieght is " + this.height);
  }
  
  ball_collision_with_paddles() 
  {
    // checking paddles on the left 
    if (this.ball_direction_x === -1)
    {
      if (this.ball_y > this.fr_paddle_y && this.ball_y < this.fr_paddle_y + this.paddle_height)
      {
        if ((this.ball_x - (this.ball_radius / 2) - this.paddle_width) <= 0)
          this.ball_direction_x *= -1;
      }
    }
    // checking paddles on the right 
    if (this.ball_direction_x === 1)
    {
      if (this.ball_y > this.sec_paddle_y && this.ball_y < this.sec_paddle_y + this.paddle_height)
      {
        if ((this.ball_x + (this.ball_radius / 2) + this.paddle_width) >= this.width)
          this.ball_direction_x *= -1;
      }
    }
  }

  update_paddles(payload: player_properties)
  {
    if (payload.input === "DOWN")
    {
      if (payload.id === this.players[0])
      {
        if (this.fr_paddle_y + this.paddleSpeed < this.height - this.paddle_height)
          this.fr_paddle_y += this.paddleSpeed;
        else
          this.fr_paddle_y = this.height - this.paddle_height;
      }
      else
      {
        if (this.sec_paddle_y + this.paddleSpeed < this.height - this.paddle_height)
          this.sec_paddle_y += this.paddleSpeed;
        else
          this.sec_paddle_y = this.height - this.paddle_height;
      }
    }
    else 
    {
      if (payload.id === this.players[0])
      {
        if (this.fr_paddle_y - this.paddleSpeed > 0)
          this.fr_paddle_y -= this.paddleSpeed;
        else
          this.fr_paddle_y = 0;
      }
      else
      {
        if (this.sec_paddle_y - this.paddleSpeed > 0)
          this.sec_paddle_y -= this.paddleSpeed;
        else 
          this.sec_paddle_y = 0;
      }
    }
  }

  player_activity(payload: player_properties) 
  {
    if(this.state === "scored" && payload.input === "ENTER")
      this.initGame(payload.id);
    else if (payload.input !== "ENTER")
      this.update_paddles(payload);
  }

  queue_status(): GameState 
  {
    return {
      ball_x: this.ball_x,
      ball_y: this.ball_y,
      ball_direction_x: this.ball_direction_x,
      ball_direction_y: this.ball_direction_y,

      fr_paddle_x: this.fr_paddle_x,
      fr_paddle_y: this.fr_paddle_y,

      sec_paddle_x: this.sec_paddle_x,
      sec_paddle_y: this.sec_paddle_y,

      state: this.state,
      players : this.players,
      players_avatar: this.players_avatar,
      players_names: this.players_names,
      scores : this.scores,
      score_limit : this.score_limit,
      winner : this.winner,
      lastscored : this.lastscored,
      
      width : this.width,
      height : this.height,
      aspectRatio : this.aspectRatio,

      paddle_height : this.paddle_height,
      paddle_width : this.paddle_width,
      ball_radius : this.ball_radius
    }
  }
}



@WebSocketGateway(4000, { 
  cors: {
    credentials: true,
  origin: 'http://localhost:3000',
  }
})
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect 
{
  constructor(private readonly jwtService: JwtService, private readonly prismaService: PrismaService) {}

  private  server: Server;
  //private   user_serv: UserService;
  private logger: Logger = new Logger("AppGateway");
  //game object
  private queues: Array<Game> = Array<Game>();
  private live_games: Array<Game> = Array<Game>();
  private cpt: number = 0;
  private socket_with_queue_id: Map<string, number> = new Map<string, number>();
  private user_with_queue_id: Map<string, number> = new Map<string, number>();
  private user_with_game_id: Map<string, number> = new Map<string, number>();


  afterInit(server: Server) {
    this.server = server;
    //this.logger.log("INITIALIZED")
  }

  async handleConnection(client: Socket, payload: any) 
  {
    const user = await this.getUserFromSocket(client);
    const user_status : UserStatus = "ON";
    const off_status : UserStatus = "OFF";
    
    if (user)
    {
      if (await this.get_user_status(user.id) === off_status)
        await this.edit_user_status(user.id, user_status);     
    }

    //console.log("New status after connecting is "+ await this.get_user_status(user.id));

    //this.logger.log(`User with the id  ${client.id} just logged in`);
  }

  async handleDisconnect(player_ref: Socket)
  {
    const player_id: number = this.socket_with_queue_id.get(player_ref.id);
    
    const user = await this.getUserFromSocket(player_ref);
    if (user)
    {
      const user_id: number = this.user_with_queue_id.get(user.id);
      const user_status : UserStatus = "INQUEUE";
      const off_status : UserStatus = "OFF";
      //this.logger.log(`User with the id  ${player_ref.id} just logged out`);
      if (this.user_with_queue_id.has(user.id) && this.socket_with_queue_id.has(player_ref.id))
      {
        this.queues[player_id].update_winner(player_ref.id);
        this.queues[player_id].update_status("disconnect");
        this.queues[player_id].emit_and_clear();

        console.log("NUmber of players is "+this.queues[player_id].player_ids().length);
        this.socket_with_queue_id.delete(player_ref.id);
        this.user_with_queue_id.delete(user.id);
        //this.queues[player_id].players.splice(user_id, 1);

        //this.queues[player_id].players.splice(user.id, 1);
        //if (await this.get_user_status(user.id) === user_status)
        await this.edit_user_status(user.id, off_status);
      // console.log("New status before discornecting is "+ await this.get_user_status(user.id));
      }      
    }

    // await this.edit_user_status(user.id, off_status);
    // console.log("New status before discornecting is "+ await this.get_user_status(user.id));
    // else 
    //   this.logger.log(`User with the id  ${player_ref.id} wasn't involved in any game`);
  }
  
  @SubscribeMessage('spectJoined')
  spectJoinRoom(socket: Socket): void
  {
    let j: number=0;
    for(let i = 0; i < this.queues.length; i++)
    {
      if (this.queues[i].state === "play")
        j++;
    }
    //console.log("ANA RANI HNA WECH A 3CHIIIREEEEEEEEEEEEE "+j); 
    socket.emit('gameCount', j);
    //console.log("This is my socket 2: "+socket.id);
  }

  @SubscribeMessage('spectJoin')  
  spectJoin(socket: Socket,payload: any): void
  {
    //const user = this.getUserFromSocket(socket);
    let j: number=0;
    let x: number=0;

    for(let i = 0; i < this.queues.length; i++)
    {
      if (this.queues[i].state === "play")
      {
        j++;
        if (j.toString() === payload.value)
          x = i;
        // else
        // {
        //   socket.leave(this.queues[i].room);
        // }          
      }
    }
    // 
    // console.log("Number of live games now : "+this.queues[x].room);
    //console.log("This is my socket : "+payload.value);
    //if (this.queues.length === 1)
      socket.join(this.queues[x].room);
  }

  @SubscribeMessage('GameEnded')
  async GameEnded(socket: Socket)
  {
   // console.log("GAME ENDED INDEEEEED" + socket.id);
    const user = await this.getUserFromSocket(socket);
    const user_id: number = this.user_with_queue_id.get(user.id);
    if (user)
    {
        const gameox = await this.prismaService.game.findUnique({
          where: { id: this.user_with_game_id.get(this.queues[this.queues.length - 1].users[0])} 
        });
        if (gameox.status !== StatusGame.FINISHED)
        {
          const updatedGame = await this.prismaService.game.update({
            where: { id: this.user_with_game_id.get(this.queues[this.queues.length - 1].users[0])},
            data: { user1_score: this.queues[this.queues.length - 1].scores[0]
              , user2_score: this.queues[this.queues.length - 1].scores[1],
              status: StatusGame.FINISHED,}
          });
          const user1 = await this.prismaService.user.findUnique({
            where: {id: this.queues[this.queues.length - 1].users[0] }
          });
          const user2 = await this.prismaService.user.findUnique({
            where: {id: this.queues[this.queues.length - 1].users[1] }
          });
          
          if (this.queues[this.queues.length - 1].scores[0] === 2)
          {
              await this.prismaService.user.update({
                where: {id: user1.id },
                data: {
                    win: user1.win + 1,
                    win_streak: user1.win_streak + 1,
                }
              });
  
              await this.prismaService.user.update({
                where: {id: user2.id },
                data: {
                    lose: user2.lose + 1,
                    win_streak: 0,
                }
              });
          } 
          else if (this.queues[this.queues.length - 1].scores[1] === 2)
          {
              await this.prismaService.user.update({
                where: {id: user2.id },
                data: {
                    win: user2.win + 1,
                    win_streak: user2.win_streak + 1,
                }
              });
  
              await this.prismaService.user.update({
                where: {id: user1.id },
                data: {
                    lose: user1.lose + 1,
                    win_streak: 0,
                }
              });
          }
          this.queues[this.queues.length - 1].scores[0] = 0;
          this.queues[this.queues.length - 1].scores[1] = 0;
        }
    }
  }
  async edit_user_status(user_id : string, status : UserStatus){
    await this.prismaService.user.update({
        where: {id: user_id },
        data: {
            status: status,
        }
      });
  }


async get_user_status(user_id : string){
  const user = await this.prismaService.user.findUnique({
      where: {id: user_id }
    });
  const user_status : UserStatus = user.status;
    return (user_status);
}

  @SubscribeMessage('player_join_queue')
  async joinRoom(socket: Socket) 
  {
    //const game : any;
    const user = await this.getUserFromSocket(socket);
    const user_status : UserStatus = "INQUEUE";
    const game_status : UserStatus = "INGAME";

    if (user)
    {
      console.log("My user is " + user.username);
      const room_id: string = user.id;
      if (!this.user_with_queue_id.has(user.id))
      {
        console.log("Here  "+user.username);
        await this.edit_user_status(user.id, user_status);
        this.getUserFromSocket(socket);
        
        if (this.queues.length === 0)
        {
          this.queues.push(new Game(this.server));
          this.queues[0].update_room(room_id);
          socket.join(room_id);
        } 
        else if (this.queues[this.queues.length - 1].player_ids().length === 2)
        {
          this.queues.push(new Game(this.server));
          this.queues[this.queues.length - 1].update_room(room_id);
          socket.join(room_id);
        }
        else if (this.queues[this.queues.length - 1].player_ids().length === 1)
        {
          socket.join(this.queues[this.queues.length - 1].room); 
          this.cpt++;
        }       
        this.queues[this.queues.length - 1].push_player(socket.id, user.avatar, user.username);
        this.queues[this.queues.length - 1].push_users(user.id);
        this.queues[this.queues.length - 1].check_players_are_ready();
        this.socket_with_queue_id.set(socket.id, this.queues.length - 1);
        
        this.user_with_queue_id.set(user.id, this.queues.length - 1);
        if (this.queues[this.queues.length - 1].users.length === 2)
        {
          console.log("These are the number of users to this queue "+ 
          this.queues[this.queues.length - 1].users[0],
          this.queues[this.queues.length - 1].users[1]
          );

          const game = await this.prismaService.game.create({
            data: {
              user1: { connect: { id: this.queues[this.queues.length - 1].users[0] } },
              user2: { connect: { id: this.queues[this.queues.length - 1].users[1] } },
              mode: ModeGame.MODE1,
              status: StatusGame.PLAYING,
            }
          });
          this.user_with_game_id.set(this.queues[this.queues.length - 1].users[0], game.id);
          this.user_with_game_id.set(this.queues[this.queues.length - 1].users[1], game.id);
          console.log("Now that iv created the game id :"+ game.id);
          console.log("Now that iv created the game id :"+ this.user_with_game_id.get(this.queues[this.queues.length - 1].users[0]));
          console.log("THe players on it are "+ game.user1_id + game.user2_id);
          this.queues[this.queues.length - 1].user_with_game_id = this.user_with_game_id;
        }

      }
      else 
      {
        socket.join(room_id);
      }
    }
   
    
  }

  @SubscribeMessage('player_pressed_key')
  async handlePlayerInput(player_ref: Socket, payload: player_properties)
  {
    const player_id: number = this.socket_with_queue_id.get(player_ref.id);
    

    const user = await this.getUserFromSocket(player_ref);
    const user_id: number = this.user_with_queue_id.get(user.id);
    if (payload.input === "ENTER")
    {
      if (user)
      {
          const updatedGame = await this.prismaService.game.update({
            where: { id: this.user_with_game_id.get(this.queues[this.queues.length - 1].users[0])},
            data: { user1_score: this.queues[this.queues.length - 1].scores[0]
              , user2_score: this.queues[this.queues.length - 1].scores[1]}
          });        
      }

    }
    //console.log("Hahwa user id o hahwa socket id " +user_id+"|"+player_id);
    
    this.queues[user_id].player_activity({ ...payload, id: player_ref.id })
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
}
