import p5 from 'p5';


interface GameState {
    // Game variables
    width: number;
    height: number;
    aspectRatio: number;

    ball_x: number;
    ball_y: number;
    ball_direction_x: number;
    ball_direction_y: number;
    ball_radius: number;

    fr_paddle_x: number;
    fr_paddle_y: number;
  
    sec_paddle_x: number;
    sec_paddle_y: number;
  
    paddle_width: number;
    paddle_height: number;

    state: string; // "waiting" | "play" | "scored" | "endGame"
    players : Array<string>;
    players_avatar : Array<string>;
    players_names : Array<string>;
    spectators: Array<string>;

    scores: Array<number>;
    score_limit : number;
    winner : string;
    lastscored: string;
}

export type {GameState};

interface GameCount {
    count: number;
}

export type {GameCount}

//   export class Ball {
//     //p5: p5;
//     ball_x: number;
//     ball_y: number;
//     ball_direction_x: number;
//     ball_direction_y: number;
//     ball_radius: number;
  
//     constructor(ball_x: number, ball_y: number, ball_direction_x: number, ball_direction_y: number, ball_radius: number) {
//       //this.p5 = p5;
//       this.ball_x = ball_x;
//       this.ball_y = ball_y;
//       this.ball_direction_x = ball_direction_x;
//       this.ball_direction_y = ball_direction_y;
//       this.ball_radius = ball_radius;
//     }
  
//     // move(y: number) {
//     //   this.y = y;
//     // }
  
//     show() {
//       //this.p5.rect(this.x, this.y, this.width, this.height);
//     }

//     test(p5: p5) {
//         this.show();
//     }
      
//   }
