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


interface player_properties 
{
  input:  string;
  id:     string;
  mode: number;

}

interface for_spect 
{
  user_1_name: string;
  user_2_name: string;

  user_1_score: number;
  user_2_score: number;
  
  user_1_avatar: string;
  user_2_avatar: string;

  index: number;
}



interface Game 
{
  server: Server;

  width: number;
  height: number;
  aspectRatio : number;

  ball_radius: number;
  ball_speed: number;
  game_mode : number;

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
  users_names: Array<string>;
  players_avatar : Array<string>;
  players_names : Array<string>;
  spects: Array<string>;

  scores: Array<number>;
  score_limit: number;
  lastscored: string;

  winner : string;
  winner_name : string;
  room: string;
  numgames: number;

   prisma: PrismaService;
   user_Service: UserService;

   user_with_game_id: Map<string, number>;
}

interface mode_du_game
{
  queues: Array<Game>;
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
  ball_speed: number;

  state: string; 

  players : Array<string>;
  players_avatar : Array<string>;
  players_names : Array<string>;

  users: Array<string>;
  users_names: Array<string>;


  scores: Array<number>;
  score_limit: number;

  winner: string;
  winner_name : string;
  lastscored: string;
  


}

class mode_du_game
{
  constructor()
  {
    this.queues = new Array<Game>();
  } 
}

class for_spect
{
  constructor()
  {
    this.user_1_name = "";
    this.user_2_name = "";

    this.user_1_score = 0;
    this.user_2_score = 0;

    this.user_1_avatar = "";
    this.user_2_avatar = "";

    this.index = -1;
  } 
}

class Game {
  constructor(server: Server) {
    this.server = server;

    this.width = 800;
    this.height = 400;
    this.aspectRatio = 2 ;
  
    this.ball_radius = 10;
    this.ball_speed = 0;
    this.game_mode = 0;

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
    this.users_names = [];
    this.players_avatar = [];
    this.players_names = [];

    this.room = "";

    this.scores = [0,0];
    this.score_limit = 2;
    this.winner = "";
    this.winner_name = "";
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
      ////console.log("players are ready");
      this.update_status("waiting");
      this.server.to(this.room).emit("queue_status", this.queue_status());
      this.starting_queue();  
    } 
  }

  update_winner(player_id: string, user_name: string)
  {
    this.winner = player_id;
    this.winner_name = user_name;
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

  push_users(player: string, user_name: string)
  {
    if (this.users.length < 2)
    {
        this.users.push(player); 
        this.users_names.push(user_name);   
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
      //console.log("player1 trying to start");
      this.ball_direction_x *= -1;
    }
    else if(id === this.players[1])
    {
      this.ball_x = this.width *  (9 / 10) ;
      this.ball_y = this.height / 5;
      this.ball_direction_x *= -1;
      //console.log("player2 trying to start");
    }
    this.starting_queue();
    this.update_status("play");
  }


  async updateScore(game: Game)
  {
    if(this.ball_x > this.sec_paddle_x)
    {
        this.scores[0]++;
        //console.log("scored1");
        this.update_status("scored");
        //console.log("players are "+this.players.length)
        this.lastscored = this.players[0];
        this.ball_direction_x *= -1;
        clearInterval(this.game_initializer);
    }
    else if (this.ball_x < this.fr_paddle_x + this.paddle_width)
    {
      //console.log("scored2");
        this.scores[1]++;
        this.update_status("scored");
        this.lastscored = this.players[1];
        this.ball_direction_x *= -1;
        clearInterval(this.game_initializer);
    }
    //BACK TO THIS 
    if(this.scores[0] === this.score_limit)
    {
      this.winner = this.users[0];
      this.winner_name = this.users_names[0];
      this.update_status("endGame");
      clearInterval(this.game_initializer);
    }
    else if (this.scores[1] === this.score_limit)
    {
      this.winner = this.users[1];
      this.winner_name = this.users_names[1];
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

    ////console.log("my hieght is " + this.height);
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
      if (payload.id === this.users[0])
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
      if (payload.id === this.users[0])
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
    ////console.log("INut is "+payload.input)



    
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
      ball_speed: this.ball_speed,

      fr_paddle_x: this.fr_paddle_x,
      fr_paddle_y: this.fr_paddle_y,

      sec_paddle_x: this.sec_paddle_x,
      sec_paddle_y: this.sec_paddle_y,

      state: this.state,
      players : this.players,
      players_avatar: this.players_avatar,
      players_names: this.players_names,

      users : this.users,
      users_names: this.users_names,

      scores : this.scores,
      score_limit : this.score_limit,
      winner : this.winner,
      winner_name : this.winner_name,
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
 

  private GameMode: Array<mode_du_game> = Array<mode_du_game>();
  private queues: Array<Game> = Array<Game>();
  private live_games: Array<Game> = Array<Game>();
  private cpt: number = 0;


  private socket_with_queue_id: Map<string, number> = new Map<string, number>();
  private user_with_queue_id: Map<string, number> = new Map<string, number>();
  private user_with_queue_mode: Map<string, number> = new Map<string, number>();
  private user_with_game_id: Map<string, number> = new Map<string, number>();

  

  afterInit(server: Server) {
    this.server = server;
    if (this.GameMode.length === 0)
    {
      for(let i=0; i < 4; i++)
      {
        this.GameMode.push(new mode_du_game());    
        this.GameMode[i] = new mode_du_game();
        this.GameMode[i].queues = new Array<Game>();
      }
      //console.log("HEre vbyddt here ");
    }
  }

  async handleConnection(client: Socket, payload: any) 
  {
    
    //this.GameMode.push(new Array<Game>());
    const user = await this.getUserFromSocket(client);
    const user_status : UserStatus = "ON";
    const off_status : UserStatus = "OFF";
    if (user)
    {
      const game_history = await this.prismaService.game.findMany({
        where: {user1_id: user.id}
      })
      //console.log("Number of games for user is "+game_history.length);      
      //console.log("HAna hbiba"+user.username);
      // if (!this.user_with_queue_id.get(user.id) && user.status !== UserStatus.INQUEUE)
      //   await this.edit_user_status(user.id, user_status);     
    }

    ////console.log("New status after connecting is "+ await this.get_user_status(user.id));

    //this.logger.log(`User with the id  ${client.id} just logged in`);
  }

  async handleDisconnect(player_ref: Socket)
  {
    // const player_id: number = this.socket_with_queue_id.get(player_ref.id);
    
    // const user = await this.getUserFromSocket(player_ref);
    
    // if (user)
    // {
    //   //console.log("WSELT HNA HABIBBI "+user.username);
    //   const user_id: number = this.user_with_queue_id.get(user.id);
    //   const q_mode: number = this.user_with_queue_mode.get(user.id);
    //   const user_status : UserStatus = "INQUEUE";
    //   const off_status : UserStatus = "OFF";
    //   //this.logger.log(`User with the id  ${player_ref.id} just logged out`);
    //   if (this.user_with_queue_id.has(user.id) && this.socket_with_queue_id.has(player_ref.id))
    //   {
    //     this.GameMode[q_mode].queues[player_id].update_winner(player_ref.id);
    //     this.GameMode[q_mode].queues[player_id].update_status("disconnect");
    //     this.GameMode[q_mode].queues[player_id].emit_and_clear();
    //     this.socket_with_queue_id.delete(player_ref.id);
    //     this.user_with_queue_id.delete(this.GameMode[q_mode].queues[player_id].users[0]);
    //     this.user_with_queue_id.delete(this.GameMode[q_mode].queues[player_id].users[1]);
    //     this.user_with_queue_mode.delete(this.GameMode[q_mode].queues[player_id].users[0]);
    //     this.user_with_queue_mode.delete(this.GameMode[q_mode].queues[player_id].users[1]);
    //     this.GameMode[q_mode].queues[player_id].remove_player();
    //     // //console.log("NUmber of players is "+this.queues[player_id].player_ids().length);
        
    //     //this.queues[player_id].players.splice(user_id, 1);

    //     //this.queues[player_id].players.splice(user.id, 1);
    //     //if (await this.get_user_status(user.id) === user_status)
    //     await this.edit_user_status(user.id, off_status);
    //   // //console.log("New status before discornecting is "+ await this.get_user_status(user.id));
    //   }      
    // }

    // await this.edit_user_status(user.id, off_status);
    // //console.log("New status before discornecting is "+ await this.get_user_status(user.id));
    // else 
    //   this.logger.log(`User with the id  ${player_ref.id} wasn't involved in any game`);
  }


  @SubscribeMessage('Game_Stopped')  
  async Game_stopped(player_ref: Socket)
  {
    const player_id: number = this.socket_with_queue_id.get(player_ref.id);
    
    const user = await this.getUserFromSocket(player_ref);
    
    if (user)
    {
      //console.log("WSELT HNA HABIBBI "+user.username);
      const user_id: number = this.user_with_queue_id.get(user.id);
      const q_mode: number = this.user_with_queue_mode.get(user.id);
      const user_status : UserStatus = "INQUEUE";
      const on_status : UserStatus = "ON";
      //this.logger.log(`User with the id  ${player_ref.id} just logged out`);
      if  (user.id === this.GameMode[q_mode].queues[user_id].users[0])
        this.GameMode[q_mode].queues[user_id].update_winner(this.GameMode[q_mode].queues[user_id].users[0] , this.GameMode[q_mode].queues[user_id].users_names[1]);
      else 
        this.GameMode[q_mode].queues[user_id].update_winner(this.GameMode[q_mode].queues[user_id].users[1] , this.GameMode[q_mode].queues[user_id].users_names[0]);
        
        this.GameMode[q_mode].queues[user_id].update_status("ended");
        this.GameMode[q_mode].queues[user_id].emit_and_clear();

        for(let i=0;i < this.GameMode[q_mode].queues[user_id].players.length; i++)
          this.socket_with_queue_id.delete(this.GameMode[q_mode].queues[user_id].players[i]);

        this.user_with_queue_id.delete(this.GameMode[q_mode].queues[user_id].users[0]);
        this.user_with_queue_id.delete(this.GameMode[q_mode].queues[user_id].users[1]);
        this.user_with_queue_mode.delete(this.GameMode[q_mode].queues[user_id].users[0]);
        this.user_with_queue_mode.delete(this.GameMode[q_mode].queues[user_id].users[1]);

        let game_len = this.GameMode[q_mode].queues[user_id].players.length
        // for(let i=0;i < game_len; i++)
        //   this.GameMode[q_mode].queues[user_id].remove_player();
        // //console.log("NUmber of players is "+this.queues[player_id].player_ids().length);
        
        //this.queues[player_id].players.splice(user_id, 1);

        //this.queues[player_id].players.splice(user.id, 1);
        //if (await this.get_user_status(user.id) === user_status)
        if (game_len >= 2)
        {
          
          await this.edit_user_status(this.GameMode[q_mode].queues[user_id].users[0], on_status);
          await this.edit_user_status(this.GameMode[q_mode].queues[user_id].users[1], on_status);          
        }
        else 
        {
          await this.edit_user_status(user.id, on_status);
        }
      // //console.log("New status before discornecting is "+ await this.get_user_status(user.id));
    }  
  }
  


  @SubscribeMessage('spectJoined')
  spectJoinRoom(socket: Socket): void
  {
    let j: number=0;
    let spect_array: Array<for_spect> = Array<for_spect>();
    
    for(let x = 0; x < this.GameMode.length; x++)
    {
      for(let i = 0; i < this.GameMode[x].queues.length; i++)
      {
        if (this.GameMode[x].queues[i].state === "play")
        {
          spect_array.push(new for_spect());

          spect_array[spect_array.length -1].user_1_name = this.GameMode[x].queues[i].users_names[0];
          spect_array[spect_array.length -1].user_2_name = this.GameMode[x].queues[i].users_names[1];

          spect_array[spect_array.length -1].user_1_score = this.GameMode[x].queues[i].scores[0];
          spect_array[spect_array.length -1].user_2_score = this.GameMode[x].queues[i].scores[1];

          spect_array[spect_array.length -1].user_1_avatar = this.GameMode[x].queues[i].players_avatar[0];
          spect_array[spect_array.length -1].user_2_avatar = this.GameMode[x].queues[i].players_avatar[1];
          spect_array[spect_array.length -1].index = x;
          
          j++;
        }
          
      }      
    }
    //socket.emit('gameCount', j);
    ////console.log("array of spects is ", spect_array.length);
    socket.emit('gameCount', spect_array);
  }

  @SubscribeMessage('spectJoin')  
  spectJoin(socket: Socket,payload: any): void
  {
    let j: number=0;
    let y: number=0;
    let game_type: number=-1;

    if (payload.value !== -1)
    {
      for(let x = 0; x < this.GameMode.length; x++)
      {
        for(let i = 0; i < this.GameMode[x].queues.length; i++)
        {
          if (this.GameMode[x].queues[i].state === "play")
          {
            j++;
            if (j.toString() === payload.value)
            {
              y = i; 
              game_type = x;
            }
          }
        }      
      }
      if (game_type !== -1)
        socket.join(this.GameMode[game_type].queues[y].room);
      else 
        socket.emit('spect_game_ended', 0);
    }
    else if (this.GameMode[0].queues.length > 0)
      socket.join(this.GameMode[0].queues[0].room);

  }

  @SubscribeMessage('GameEnded')
  async GameEnded(socket: Socket, payload: any)
  {
   // //console.log("GAME ENDED INDEEEEED" + socket.id);
    const user = await this.getUserFromSocket(socket);
    const user_id: number = this.user_with_queue_id.get(user.id);
    const user_mode:number =  this.user_with_queue_mode.get(user.id);
    // let user_mode = payload.mode - 1;
    if (user)
    { 
        const gameox = await this.prismaService.game.findUnique({
          where: { id: this.user_with_game_id.get(this.GameMode[user_mode].queues[user_id].users[0])} 
        });
        if (gameox.status !== StatusGame.FINISHED)
        {
          const updatedGame = await this.prismaService.game.update({
            where: { id: this.user_with_game_id.get(this.GameMode[user_mode].queues[user_id].users[0])},
            data: { user1_score: this.GameMode[user_mode].queues[user_id].scores[0]
              , user2_score: this.GameMode[user_mode].queues[user_id].scores[1],
              status: StatusGame.FINISHED,}
          });
          const user1 = await this.prismaService.user.findUnique({
            where: {id: this.GameMode[user_mode].queues[user_id].users[0] }
          });
          const user2 = await this.prismaService.user.findUnique({
            where: {id: this.GameMode[user_mode].queues[user_id].users[1] }
          });
          
          if (this.GameMode[user_mode].queues[user_id].scores[0] === 2)
          {
              await this.prismaService.user.update({
                where: {id: user1.id },
                data: {
                    win: user1.win + 1,
                    win_streak: user1.win_streak + 1,
                    status: "ON",
                }
              });
  
              await this.prismaService.user.update({
                where: {id: user2.id },
                data: {
                    lose: user2.lose + 1,
                    win_streak: 0,
                    status: "ON",
                }
              });
          } 
          else if (this.GameMode[user_mode].queues[user_id].scores[1] === 2)
          {
              await this.prismaService.user.update({
                where: {id: user2.id },
                data: {
                    win: user2.win + 1,
                    win_streak: user2.win_streak + 1,
                    status: "ON",
                }
              });
  
              await this.prismaService.user.update({
                where: {id: user1.id },
                data: {
                    lose: user1.lose + 1,
                    win_streak: 0,
                    status: "ON",
                }
              });
          }
          else
          {
            if (user1.id === user.id)
            {
              await this.prismaService.user.update({
                where: {id: user2.id },
                data: {
                    win: user2.win + 1,
                    win_streak: user2.win_streak + 1,
                    status: "ON",
                }
              });
  
              await this.prismaService.user.update({
                where: {id: user1.id },
                data: {
                    lose: user1.lose + 1,
                    win_streak: 0,
                    status: "ON",
                }
              });
            }
            else 
            {
              await this.prismaService.user.update({
                where: {id: user1.id },
                data: {
                    win: user1.win + 1,
                    win_streak: user1.win_streak + 1,
                    status: "ON",
                }
              });
  
              await this.prismaService.user.update({
                where: {id: user2.id },
                data: {
                    lose: user2.lose + 1,
                    win_streak: 0,
                    status: "ON",
                }
              });
            }
          }

          this.GameMode[user_mode].queues[user_id].scores[0] = 0;
          this.GameMode[user_mode].queues[user_id].scores[1] = 0;
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


  @SubscribeMessage('History')
  async get_match_history(socket: Socket)
  {
    const user = await this.getUserFromSocket(socket);
    
    if (user)
    {
      //console.log("wselt "+user.username);
      const game_history = await this.prismaService.game.findMany({
        where: {user1_id: user.id}
      })
      //console.log("Number of games for user is "+game_history.length);      
    }
  }


async get_user_status(user_id : string){
  const user = await this.prismaService.user.findUnique({
      where: {id: user_id }
    });
  const user_status : UserStatus = user.status;
    return (user_status);
}

@SubscribeMessage('invite_queue')
async invite_qu(socket: Socket, payload: any) 
{
  const user = await this.getUserFromSocket(socket);
  const user_status : UserStatus = "INQUEUE";
  const game_status : UserStatus = "INGAME";

  if (user)
  {
    const room_id: string = user.id;
    let i:number = payload.mode - 1;

    if (!this.user_with_queue_id.has(user.id))
    {

      
      //console.log("Here  "+user.username);
      ////console.log("HEre tani "+payload.mode)
      //
      this.getUserFromSocket(socket);
      let size: number = this.GameMode[payload.mode-1].queues.length;

      
        let nadi = 0;
        //console.log("Xddd"+size+user.status)
        if (size === 0 && user.status === UserStatus.INQUEUE)
        {

          //console.log("zabi nta li baqi lia");
          this.GameMode[i].queues.push(new Game(this.server));
          this.GameMode[i].queues[0].update_room(room_id);
          socket.join(room_id);
          size = 1;
          nadi = 1;
        }
        else if (size !== 0 && user.status === UserStatus.INQUEUE )
        {
          this.GameMode[i].queues.push(new Game(this.server));
          size = this.GameMode[payload.mode-1].queues.length;
          this.GameMode[i].queues[size - 1].update_room(room_id);
          socket.join(room_id);
          nadi = 1;
        }
        else if (this.GameMode[i].queues[size - 1].users.length === 1)
        {
          
          const user1 = await this.prismaService.user.findUnique({
            where: {id: this.GameMode[i].queues[size - 1].users[0] }
          });
          
          if (user1)
          {
              //console.log("Hhhhhh zabi tani "+this.GameMode[i].queues[size - 1].users[0]+" w user hwa "+user1.username+user1.status)
            if (user1.status === UserStatus.INQUEUE)
            {
              await this.edit_user_status(user1.id,UserStatus.INGAME);
              await this.edit_user_status(user.id,UserStatus.INGAME);
              //console.log("Wselt ta hna"+user1.username+user.username);
              socket.join(this.GameMode[i].queues[size - 1].room); 
              this.cpt++;
              nadi = 1;
            }
          }
        }
        if (nadi === 1)
        {
          this.GameMode[i].queues[size - 1].push_player(socket.id, user.avatar, user.username);
          this.GameMode[i].queues[size - 1].push_users(user.id, user.username);
          this.GameMode[i].queues[size - 1].check_players_are_ready();
          if (payload.state === 1)
          {
            this.socket_with_queue_id.set(socket.id, size - 1);
            
            this.user_with_queue_id.set(user.id, size - 1);
            this.user_with_queue_mode.set(user.id, i);            
          }
          else if (payload.state === 0)
          {
            //console.log("Zabi ?");
            this.GameMode[i].queues[size - 1].update_status("decline");
            this.GameMode[i].queues[size-1].emit_and_clear();
            this.user_with_queue_id.delete(this.GameMode[i].queues[size - 1].users[0]);
            this.user_with_queue_mode.delete(this.GameMode[i].queues[size - 1].users[0]);  

            await this.edit_user_status(this.GameMode[i].queues[size - 1].users[0], "ON");
            await this.edit_user_status(this.GameMode[i].queues[size - 1].users[1], "ON");
             
          }
          if (this.GameMode[i].queues[size - 1].users.length === 2 && payload.state === 1)
          {
            const game_modes: any[] = ["MODE1", "MODE2", "MODE3", "MODE2"]; 
            //console.log("Ha mode diali "+game_modes[i]);
            const game = await this.prismaService.game.create({
              data: {
                user1: { connect: { id: this.GameMode[i].queues[size - 1].users[0] } },
                user2: { connect: { id: this.GameMode[i].queues[size - 1].users[1] } },
                user1_score: 0,
                user2_score: 0,
                mode: game_modes[i],
                status: StatusGame.PLAYING,
              }
            });

            

            this.user_with_game_id.set(this.GameMode[i].queues[size - 1].users[0], game.id);
            this.user_with_game_id.set(this.GameMode[i].queues[size - 1].users[1], game.id);
            this.GameMode[i].queues[size - 1].user_with_game_id = this.user_with_game_id;

            
          }
      }
    }
    else 
    {
      const user_id: number = this.user_with_queue_id.get(user.id);
      //const us_mode: number = this.user_with_queue_mode.get(user.id);

        
      this.GameMode[3].queues[user_id].players.push(socket.id);
      socket.join(this.GameMode[3].queues[user_id].room)
    }
  }
}
//this.GameMode[payload.mode].queues
  @SubscribeMessage('player_join_queue')
  async joinRoom(socket: Socket, payload: any) 
  {
    //const game : any;
    const user = await this.getUserFromSocket(socket);
    const user_status : UserStatus = "INQUEUE";
    const game_status : UserStatus = "INGAME";

    if (user)
    {
      ////console.log("My user is " + user.username);
      const room_id: string = user.id;
      let i:number = payload.mode - 1;
      if (!this.user_with_queue_id.has(user.id))
      {
        //console.log("Here  "+user.username);
        ////console.log("HEre tani "+payload.mode)
        //
        this.getUserFromSocket(socket);
        let size: number = this.GameMode[payload.mode-1].queues.length;
        
          await this.edit_user_status(user.id, user_status);
          if (size === 0)
          {
            this.GameMode[i].queues.push(new Game(this.server));
            this.GameMode[i].queues[0].update_room(room_id);
            socket.join(room_id);
            size = 1;
          } 
          else if (this.GameMode[i].queues[size - 1].state === "ended")
          {
            //console.log("Wselt hna");
            this.GameMode[i].queues.push(new Game(this.server));
            size = this.GameMode[payload.mode-1].queues.length;
            this.GameMode[i].queues[size - 1].update_room(room_id);
            socket.join(room_id); 
          }
          else if (this.GameMode[i].queues[size - 1].users.length === 2)
          {
            this.GameMode[i].queues.push(new Game(this.server));
            size = this.GameMode[payload.mode-1].queues.length;
            this.GameMode[i].queues[size - 1].update_room(room_id);
            socket.join(room_id);
          }

          else if (this.GameMode[i].queues[size - 1].player_ids().length === 1)
          {
            //console.log("Wselt ta hna");
            socket.join(this.GameMode[i].queues[size - 1].room); 
            this.cpt++;
          }
          this.GameMode[i].queues[size - 1].push_player(socket.id, user.avatar, user.username);
          this.GameMode[i].queues[size - 1].push_users(user.id, user.username);
          this.GameMode[i].queues[size - 1].check_players_are_ready();
          this.socket_with_queue_id.set(socket.id, size - 1);
          
          this.user_with_queue_id.set(user.id, size - 1);
          this.user_with_queue_mode.set(user.id, i);
          if (this.GameMode[i].queues[size - 1].users.length === 2)
          {
            const game_modes: any[] = ["MODE1", "MODE2", "MODE3"]; 
            const game = await this.prismaService.game.create({
              data: {
                user1: { connect: { id: this.GameMode[i].queues[size - 1].users[0] } },
                user2: { connect: { id: this.GameMode[i].queues[size - 1].users[1] } },
                user1_score: 0,
                user2_score: 0,
                mode: game_modes[i],
                status: StatusGame.PLAYING,
              }
            });
            this.user_with_game_id.set(this.GameMode[i].queues[size - 1].users[0], game.id);
            this.user_with_game_id.set(this.GameMode[i].queues[size - 1].users[1], game.id);
            this.GameMode[i].queues[size - 1].user_with_game_id = this.user_with_game_id;
          }
        }
      
      else 
      {
        //console.log("Ha hna bdina f qwada");
        const user_id: number = this.user_with_queue_id.get(user.id);
        const us_mode: number = this.user_with_queue_mode.get(user.id);

        
        this.GameMode[us_mode].queues[user_id].players.push(socket.id);
        socket.join(this.GameMode[us_mode].queues[user_id].room)
      }
    }
  }

  @SubscribeMessage('player_pressed_key')
  async handlePlayerInput(player_ref: Socket, payload: player_properties)
  {
    const player_id: number = this.socket_with_queue_id.get(player_ref.id);
    
    let x=0;
    const user = await this.getUserFromSocket(player_ref);
    const user_id: number = this.user_with_queue_id.get(user.id);
    const user_mode:number =  this.user_with_queue_mode.get(user.id);
    let i = payload.mode - 1;
    if (payload.input === "ENTER")
    {
      if ( this.GameMode[user_mode].queues[user_id].ball_speed === 0)
      {
        if (payload.mode === 1)
            this.GameMode[user_mode].queues[user_id].ball_speed = 0.75;
          else if (payload.mode === 2 || payload.mode === 4)
            this.GameMode[user_mode].queues[user_id].ball_speed = 0.25;
          else if (payload.mode === 3)
            this.GameMode[user_mode].queues[user_id].ball_speed = 2.75;      
          x = 1;
          this.GameMode[user_mode].queues[user_id].state = "play";
      }
      else
      {
        if (user)
        {
            const user1_id : number = this.user_with_game_id.get(this.GameMode[user_mode].queues[user_id].users[0]);
            
            const updatedGame = await this.prismaService.game.update({
              where: { id: user1_id},
              data: { user1_score: this.GameMode[user_mode].queues[user_id].scores[0]
                , user2_score: this.GameMode[user_mode].queues[user_id].scores[1]}
            });        
        }        
      }



    }
    if (x !== 1)
    {
      this.GameMode[user_mode].queues[user_id].player_activity({ ...payload, id: user.id })
    }
    //else 
      //console.log("SIR THAWA");
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
        ////console.log(user);
				return user;
			}
		}
		return null;
	}
}
