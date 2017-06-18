
var app = function() {

    var self = {};
    self.is_configured = false;

    var server_url = "https://luca-ucsc-teaching-backend.appspot.com/keystore/";
    var call_interval = 2000;

    Vue.config.silent = false; // show all warnings

    // Extends an array
    self.extend = function(a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };


     //checks for valid placement of ship of ship_size in a board_size x board_size at (x,y) with orientatation (0->horizontal, 1-> vertical)
        function isvalid(board, x, y, orientation, ship_size, board_size){
            if(orientation){
                if(x+ship_size >= board_size) return false;
                for(var i = x; i < x+ship_size; i++){
                    if(board[i][y] != '*' || 
                        (y-1 >= 0 && board[i][y-1] != '*') || // to ensure that ships do not "touch each other"
                        (y+1 < board_size && board[i][y+1] != ' ')) 
                            return false;
                }
                if((x - 1 >= 0 && board[x-1][y] != '*') || 
                    (x + ship_size < board_size && board[x+ship_size][y] != '*')) return false;
            } else {
                if(y+ship_size >= board_size) return false;
                for(var i = y; i < y+ship_size; i++){
                    if(board[x][i] != '*' || 
                        (x-1 >= 0 && board[x-1][i] != '*') || // to ensure that ships do not "touch each other"
                        (x+1 < board_size && board[x+1][i] != '*')) 
                            return false;
                }
                if((y-1 >= 0 && board[x][y-1] != '*') || 
                    (y+ship_size < board_size && board[x][y+ship_size] != '*')) return false;
            }
            return true;
        }

        function print(board){
            var size = Math.sqrt(board.length);
            for(var i = 0; i < size; i++){
                var s = "";
                for(var j = 0; j < size; j++){
                    s += board[i*size + j];
                }
                console.log(s);
            }
        }

        //creates a ship in board with shipid
        function setShip(board, orientation, x, y, ship_size, shipid){
            if(orientation){
                for(var i = x; i < x+ship_size; i++){
                    board[i][y] = shipid;
                }
            }else{
                for(var i = y; i < y+ship_size; i++){
                    board[x][i] = shipid;
                }
            }
        }

        //get random integers in range [Min, Max]
        function get_random(Min, Max){
            return Math.floor(Math.random() * (Max - Min +1)) + Min;
        }

        //create a ship
        function createShip(board, board_size, ship_size, shipid){
            var counter=0;
            while(counter < 200){
                counter++;
                var orientation = get_random(0, 1);//0 -> horizontal, 1-> vertical
                var x=0;
                var y=0;
                if(orientation){
                    x = get_random(0, board_size-ship_size-1);
                    y = get_random(0, board_size-1);
                }else{
                    x = get_random(0, board_size-1);
                    y = get_random(0, board_size-ship_size-1);
                }
                if(!isvalid(board, x, y, orientation, ship_size, board_size)) continue; //check if it conflicts
                setShip(board, orientation, x, y, ship_size, shipid);
                break;
            }
        }

        //create all ships
        function createShips(board, board_size){
            var ships = [[1,3], [3,1], [2,2]]; // first element of every pair is number of ships, second element is length of ship
            var shipid = 1;
            for(var i = 0; i < ships.length; i++){
                for(var count = 0; count < ships[i][0]; count++){
                    createShip(board, board_size, ships[i][1], shipid);
                    shipid++;
                }
            }
        }

        //flatten 2d vector to 1d vector
        function flatten(board){
            var size = board.length;
            var board2 = new Array(size*size);
            for(var i = 0; i < size; i++){
                for(var j = 0; j < size; j++)
                    board2[i*size + j] = board[i][j];
            }
            return board2;
        }

        // get 8x8 board flattened
        function getBoard(){
            var size = 8;
            var board = new Array(size);
            for (var i = 0; i < size; i++) {
                board[i] = new Array(size);
                for (var j = 0; j < size; j++)
                    board[i][j] = '*';
            }
            createShips(board, size);
            board = flatten(board);
            return board;
        }

    self.my_identity = randomString(20);
    self.numOfplays=0;
    self.numOfships1=0;
    self.numOfships2=0;
    self.newGame=null;
    self.null_board = getBoard();
    self.new_board = getBoard();
    self.waiting=false;

    // Enumerates an array.
    var enumerate = function(v) {
        var k=0;
        v.map(function(e) {e._idx = k++;});
    };

    // Initializes an attribute of an array of objects.
    var set_array_attribute = function (v, attr, x) {
        v.map(function (e) {e[attr] = x;});
    };

    self.initialize = function () {
        document.addEventListener('deviceready', self.ondeviceready, false);
    };

    self.ondeviceready = function () {
        // This callback is called once Cordova has finished its own initialization.
        console.log("The device is ready");

        $("#vue-div").show();
        self.is_configured = true;
    };

    // This is the object that contains the information coming from the server.
    self.player_1 = null;
    self.player_2 = null;

    self.set_magic_word_again = function () {
    self.vue.chosen_magic_word = self.vue.magic_word;
    self.vue.need_new_magic_word = false;
    // Resets board and turn.
    self.vue.newGame = true;
    self.vue.board = getBoard();
    self.vue.board1 = getBoard();
    self.vue.is_my_turn = false;
    self.vue.wait = false;
    self.vue.numOfplays=0;
    self.vue.numOfships1=0;
    self.vue.numOfships2=0;
    self.vue.my_role = "";
    self.send_state();
    };
    
    self.set_magic_word = function () {
        self.vue.chosen_magic_word = self.vue.magic_word;
        self.vue.need_new_magic_word = false;
        console.log("HERRREERERERREE");
        // Resets board and turn.
        self.vue.newGame = true;
        self.vue.board = getBoard();
        self.vue.board1 = getBoard();
        self.vue.is_my_turn = false;
        self.vue.wait = false;
        self.vue.numOfplays=0;
        self.vue.numOfships1=0;
        self.vue.numOfships2=0;
        self.player_1 = null;
        self.player_2 = null;
        self.vue.player_1=null;
        self.vue.player_2=null;
        self.vue.my_role = "";
        self.send_state();
    };


    // This is the main control loop.
    function call_server() {
        console.log("Calling the server");
        if (self.vue.chosen_magic_word === null) {
            console.log("No magic word.");
            setTimeout(call_server, call_interval);
        } else {
            // We can do a server call.
            // Add a bit of random delay to avoid synchronizations.
            var extra_delay = Math.floor(Math.random() * 1000);
            $.ajax({
                dataType: 'json',
                url: server_url +'read',
                data: {key: self.vue.chosen_magic_word},
                success: self.process_server_data,
                complete: setTimeout(call_server, call_interval + extra_delay) // Here we go again.
            });
        }
    }

    // Main function for sending the state.
    self.send_state = function () {
        $.post(server_url + 'store',
            {
                key: self.vue.chosen_magic_word,
                val: JSON.stringify(
                    {
                        'player_1': self.player_1,
                        'player_2': self.player_2,
                        'board':    self.vue.board,
                        'board1':   self.vue.board1,
                        'numOfplays':   self.vue.numOfplays,
                        'numOfships1': self.vue.numOfships1,
                        'numOfships2': self.vue.numOfships2,
                        'newGame' : self.vue.newGame
                    }
                )
            }
        );
    };


    // Main place where we receive data and act on it.
    self.process_server_data = function (data) {
        // If data is null, we send our data.
        if (!data.result) {
            self.player_1 = self.my_identity;
            self.player_2 = null;
            self.vue.board = self.null_board;
            self.vue.board1 = self.new_board;
            self.vue.numOfplays = self.numOfplays;
            self.vue.numOfships1 = self.numOfships1;
            self.vue.numOfships2 = self.numOfships2;
            self.vue.is_my_turn = false;
            self.vue.wait = false;
            self.vue.newGame = false;
            self.send_state();
        } else {
            // I technically don't need to assign this to self, but it helps debug the code.
            self.server_answer = JSON.parse(data.result);
            self.player_1 = self.server_answer.player_1;
            self.player_2 = self.server_answer.player_2;
            self.numOfplays = self.server_answer.numOfplays;
            self.vue.numOfships1 = self.server_answer.numOfships1;
            self.vue.numOfships2 = self.server_answer.numOfships2;
            self.vue.newGame = self.server_answer.newGame;
            if (self.player_1 === null || self.player_2 === null) {
                // Some player is missing. We cannot play yet.
                self.vue.is_my_turn = false;
                self.vue.wait = false;
                console.log("Not all players present.");
                if (self.player_2 === self.my_identity || self.player_1 === self.my_identity) {
                    // We are already present, nothing to do.
                    self.vue.wait = true;
                    console.log("Waiting for other player to join");
                } else {
                    console.log("Signing up now.");
                    // We are not present.  Let's join if we can.
                    if (self.player_1 === null) {
                        // Preferentially we play as x.
                        self.vue.wait = true;
                        self.player_1 = self.my_identity;
                        self.send_state();
                    } else if (self.player_2 === null) {
                        self.vue.wait = true;
                        self.player_2 = self.my_identity;
                        self.send_state();
                    } else {
                        // The magic word is already taken.
                        self.vue.need_new_magic_word = true;
                    }
                }
            } else {
                console.log("Both players are present");
               self.vue.wait = false;
                // Both players are present.
                // Let us determine our role if any.
                if (self.player_2 !== self.my_identity && self.player_1 !== self.my_identity) {
                    // Again, we are intruding in a game.
                    self.vue.need_new_magic_word = true;
                } else {
                    // Here is the interesting code: we are playing, and the opponent is there.
                    // Reconciles the state.
                    self.update_local_vars(self.server_answer);
                }

            }
        }
    };

    self.update_local_vars = function (server_answer) {
        // First, figures out our role.
        if (server_answer.player_2 === self.my_identity) {
            self.vue.my_role = 'o';
        } else if (server_answer.player_1 === self.my_identity) {
            self.vue.my_role = 'x';
        } else {
            self.vue.my_role = ' ';
        }
        console.log("first check");
        console.log(self.server_answer.newGame);
         console.log(self.vue.newGame);

        

        if(self.vue.my_role=='o'){
        var device_has_newer_state = false;
        for (var i = 0; i < 64; i++) {
            if(self.server_answer.newGame===true){
                if (self.vue.board[i]!==server_answer.board[i]) {
                    Vue.set(self.vue.board, i, server_answer.board[i]);
                     self.vue.numOfplays = server_answer.numOfplays;
                    self.numOfships1 = server_answer.numOfships1;
                    self.numOfships2 = server_answer.numOfships2;
                    self.vue.newGame = self.server_answer.newGame;
                    device_has_newer_state = true;
                }
                if (self.vue.board1[i] !== server_answer.board1[i]) {
                    Vue.set(self.vue.board1, i, server_answer.board1[i]);
                    self.vue.numOfplays = server_answer.numOfplays;
                    self.numOfships1 = server_answer.numOfships1;
                    self.numOfships2 = server_answer.numOfships2;
                    self.vue.newGame = self.server_answer.newGame;
                    device_has_newer_state = true;
                }
        }else{
            if (self.vue.board[i]!==server_answer.board[i]) {
                Vue.set(self.vue.board, i, server_answer.board[i]);
                 self.vue.numOfplays = server_answer.numOfplays;
                self.numOfships1 = server_answer.numOfships1;
                self.numOfships2 = server_answer.numOfships2;
                self.vue.newGame = self.server_answer.newGame;
                device_has_newer_state = true;
            }
        }
        }
        self.vue.newGame = false;
    }
         
        if(self.vue.my_role=='x'){
            var device_has_newer_state = false;
            for (var i = 0; i < 64; i++) {
            if(self.server_answer.newGame===true){
                if (self.vue.board[i]!==server_answer.board[i]) {
                    Vue.set(self.vue.board, i, server_answer.board[i]);
                     self.vue.numOfplays = server_answer.numOfplays;
                    self.numOfships1 = server_answer.numOfships1;
                    self.numOfships2 = server_answer.numOfships2;
                    self.vue.newGame = self.server_answer.newGame;
                    device_has_newer_state = true;
                }
                if (self.vue.board1[i] !== server_answer.board1[i]) {
                    Vue.set(self.vue.board1, i, server_answer.board1[i]);
                    self.vue.numOfplays = server_answer.numOfplays;
                    self.numOfships1 = server_answer.numOfships1;
                    self.numOfships2 = server_answer.numOfships2;
                    self.vue.newGame = self.server_answer.newGame;
                    device_has_newer_state = true;
                }
        }else{
                if (self.vue.board1[i] !== server_answer.board1[i]) {
                    Vue.set(self.vue.board1, i, server_answer.board1[i]);
                    self.vue.numOfplays = server_answer.numOfplays;
                    self.numOfships1 = server_answer.numOfships1;
                    self.numOfships2 = server_answer.numOfships2;
                    self.vue.newGame = self.server_answer.newGame;
                    device_has_newer_state = true;

                }
        }

            }
self.vue.newGame = false;
        }
  
        // If we have newer state than the server, we send it to the server.
        if (device_has_newer_state) {
            self.send_state();
        }
        
    };


    

    self.play = function (i, j) {

        if(self.vue.my_role=='x' &&  self.vue.numOfplays%2==0){
        if(self.vue.board[i * 8 + j]=='*'){
        Vue.set(self.vue.board, i * 8 + j, -2);
        self.vue.numOfplays=self.vue.numOfplays+1;
        }
        

         // large ship sink       
        if((self.vue.board[i * 8 + j]==1)){
        if( (self.vue.board[(i*8+j)+1]==0) && (self.vue.board[(i*8+j)+2]==0) ){
            
            if(j==5 && (i!=0) && (i!=7)){
            Vue.set(self.vue.board, i * 8 + j,0);

            Vue.set(self.vue.board, i * 8 + j+10 ,-2);
            Vue.set(self.vue.board, i * 8 + j+9 ,-2);
            Vue.set(self.vue.board, i * 8 + j+8 ,-2);
            Vue.set(self.vue.board, i * 8 + j-1 ,-2);
            Vue.set(self.vue.board, i * 8 + j-8 ,-2);
            Vue.set(self.vue.board, i * 8 + j-7 ,-2);
            Vue.set(self.vue.board, i * 8 + j-6 ,-2);
                
                self.vue.numOfships1=self.vue.numOfships1+1;
            }else if(j==0 && (i!=0) && (i!=7)){
                Vue.set(self.vue.board, i * 8 + j,0);
                
                Vue.set(self.vue.board, i * 8 + j+3  ,-2);
                Vue.set(self.vue.board, i * 8 + j+10 ,-2);
                Vue.set(self.vue.board, i * 8 + j+9  ,-2);
                Vue.set(self.vue.board, i * 8 + j+8  ,-2);
                Vue.set(self.vue.board, i * 8 + j-8  ,-2);
                Vue.set(self.vue.board, i * 8 + j-7  ,-2);
                Vue.set(self.vue.board, i * 8 + j-6  ,-2);	
                self.vue.numOfships1=self.vue.numOfships1+1;
                
            }else if ((j==0) && (i==7)) {
                Vue.set(self.vue.board, i * 8 + j,0);
                
                Vue.set(self.vue.board, i * 8 + j+3,-2);
                Vue.set(self.vue.board, i * 8 + j-8,-2);
                Vue.set(self.vue.board, i * 8 + j-7,-2);
                Vue.set(self.vue.board, i * 8 + j-6,-2);
                	
                self.vue.numOfships1=self.vue.numOfships1+1;
            }else if((j==5) && (i==0)) {
                Vue.set(self.vue.board, i * 8 + j,0);
                
                Vue.set(self.vue.board, i * 8 + j+10,-2);
                Vue.set(self.vue.board, i * 8 + j+9,-2);
                Vue.set(self.vue.board, i * 8 + j+8,-2);
                Vue.set(self.vue.board, i * 8 + j-1,-2);
                
                self.vue.numOfships1=self.vue.numOfships1+1;
                
            }else if(i==0 && (j!=0) && (j!=5)){
                Vue.set(self.vue.board, i * 8 + j,0);
                Vue.set(self.vue.board, i * 8 + j+3, -2);
                Vue.set(self.vue.board, i * 8 + j+10,-2);
                Vue.set(self.vue.board, i * 8 + j+9,-2);
                Vue.set(self.vue.board, i * 8 + j+8,-2);
                Vue.set(self.vue.board, i * 8 + j-1, -2);
                
                self.vue.numOfships1=self.vue.numOfships1+1;
                
            }else if(i==7 && (j!=0) && (j!=5)   ){
                Vue.set(self.vue.board, i * 8 + j,0);
                Vue.set(self.vue.board, i * 8 + j+3,-2);
                Vue.set(self.vue.board, i * 8 + j-1,-2);
                Vue.set(self.vue.board, i * 8 + j-8,-2);
                Vue.set(self.vue.board, i * 8 + j-7,-2);
                Vue.set(self.vue.board, i * 8 + j-6,-2);
                
                self.vue.numOfships1=self.vue.numOfships1+1;

            }else if(i==0 && (j==0)){
            Vue.set(self.vue.board, i * 8 + j,0);
            
            Vue.set(self.vue.board, i * 8 + j+3  ,-2);
            Vue.set(self.vue.board, i * 8 + j+10 ,-2);
            Vue.set(self.vue.board, i * 8 + j+9  ,-2);
            Vue.set(self.vue.board, i * 8 + j+8  ,-2);
            
            self.vue.numOfships1=self.vue.numOfships1+1;
            }else {
            Vue.set(self.vue.board, i * 8 + j,0);
            Vue.set(self.vue.board, i * 8 + j+3,-2);
            Vue.set(self.vue.board, i * 8 + j+10,-2);
            Vue.set(self.vue.board, i * 8 + j+9,-2);
            Vue.set(self.vue.board, i * 8 + j+8,-2);
            Vue.set(self.vue.board, i * 8 + j-1,-2);
            Vue.set(self.vue.board, i * 8 + j-8,-2);
            Vue.set(self.vue.board, i * 8 + j-7,-2);
            Vue.set(self.vue.board, i * 8 + j-6,-2);
            self.vue.numOfships1=self.vue.numOfships1+1;
            }
            self.vue.numOfplays=self.vue.numOfplays+1;

            
        }else if( (self.vue.board[i * 8 + j-1]==0) && (self.vue.board[i * 8 + j-2]==0) ){ 
                if(j==7 && (i!=0) && (i!=7)){
                Vue.set(self.vue.board, i * 8 + j,0);
                
                    Vue.set(self.vue.board, i * 8 + j+6,-2);
                    Vue.set(self.vue.board, i * 8 + j-3,-2);
                    Vue.set(self.vue.board, i * 8 + j+7,-2);
                    Vue.set(self.vue.board, i * 8 + j+8,-2);
                    Vue.set(self.vue.board, i * 8 + j-8,-2);
                    Vue.set(self.vue.board, i * 8 + j-9,-2);
                    Vue.set(self.vue.board, i * 8 + j-10,-2);
                    
                    self.vue.numOfships1=self.vue.numOfships1+1;
                    
                }else if(j==2 && (i!=0) && (i!=7)){
                Vue.set(self.vue.board, i * 8 + j,0);
            
                Vue.set(self.vue.board, i * 8 + j+6,-2);
                Vue.set(self.vue.board, i * 8 + j+7,-2);
                Vue.set(self.vue.board, i * 8 + j+8,-2);
                Vue.set(self.vue.board, i * 8 + j+1,-2);
                Vue.set(self.vue.board, i * 8 + j-8,-2);
                Vue.set(self.vue.board, i * 8 + j-9,-2);
                Vue.set(self.vue.board, i * 8 + j-10,-2);
                
                self.vue.numOfships1=self.vue.numOfships1+1;
                }else if ((i==0)&&(j==7)) {
                Vue.set(self.vue.board, i * 8 + j,0);
                
                Vue.set(self.vue.board, i * 8 + j+6,-2);
                Vue.set(self.vue.board, i * 8 + j+7,-2);
                Vue.set(self.vue.board, i * 8 + j+8,-2);
                Vue.set(self.vue.board, i * 8 + j-3,-2);
                self.vue.numOfships1=self.vue.numOfships1+1;
                
                }else if((i==7) && (j==2)) {
                Vue.set(self.vue.board, i * 8 + j,0);
                
                Vue.set(self.vue.board, i * 8 + j+1,-2);
                Vue.set(self.vue.board, i * 8 + j-8,-2);
                Vue.set(self.vue.board, i * 8 + j-9,-2);
                Vue.set(self.vue.board, i * 8 + j-10,-2);
                
                self.vue.numOfships1=self.vue.numOfships1+1;
            

                }else if(i==0 && (j!=0) && (j!=7) ){
                Vue.set(self.vue.board, i * 8 + j,0);
                
                Vue.set(self.vue.board, i * 8 + j-3,-2);
                Vue.set(self.vue.board, i * 8 + j+1,-2);
                Vue.set(self.vue.board, i * 8 + j+6,-2);
                Vue.set(self.vue.board, i * 8 + j+7,-2);
                Vue.set(self.vue.board, i * 8 + j+8,-2);
                
                self.vue.numOfships1=self.vue.numOfships1+1;

                }else if(i==7 && (j!=0) && (j!=7)){
                   
                Vue.set(self.vue.board, i * 8 + j,0);
                
                    Vue.set(self.vue.board, i * 8 + j-3,-2);
                    Vue.set(self.vue.board, i * 8 + j+1,-2);
                    Vue.set(self.vue.board, i * 8 + j-8,-2);
                    Vue.set(self.vue.board, i * 8 + j-9,-2);
                    Vue.set(self.vue.board, i * 8 + j-10,-2);
                    
                    self.vue.numOfships1=self.vue.numOfships1+1;
                }else {

                    Vue.set(self.vue.board, i * 8 + j,0);
                        Vue.set(self.vue.board, i * 8 + j+6,-2);
                        Vue.set(self.vue.board, i * 8 + j-3,-2);
                        Vue.set(self.vue.board, i * 8 + j+7,-2);
                        Vue.set(self.vue.board, i * 8 + j+8,-2);
                        Vue.set(self.vue.board, i * 8 + j+1,-2);
                        Vue.set(self.vue.board, i * 8 + j-8,-2);
                        Vue.set(self.vue.board, i * 8 + j-9,-2);
                        Vue.set(self.vue.board, i * 8 + j-10,-2);
                        self.vue.numOfships1=self.vue.numOfships1+1;

                }
                
            self.vue.numOfplays=self.vue.numOfplays+1;		
            
          }else if( (self.vue.board[i * 8 + j-1]==0) && (self.vue.board[i * 8 + j+1]==0) ){	
           

         if(j==6 && (i!=0) && (i!=7) ){
            Vue.set(self.vue.board, i * 8 + j,0);
            
            Vue.set(self.vue.board, i * 8 + j+9,-2);
            Vue.set(self.vue.board, i * 8 + j-2,-2);
            Vue.set(self.vue.board, i * 8 + j+7,-2);
            Vue.set(self.vue.board, i * 8 + j+8,-2);
            Vue.set(self.vue.board, i * 8 + j-8,-2);
            Vue.set(self.vue.board, i * 8 + j-9,-2);
            Vue.set(self.vue.board, i * 8 + j-7,-2);
            
            self.vue.numOfships1=self.vue.numOfships1+1;	
            }else if(j==1 && (i!=0) && (i!=7)){

            Vue.set(self.vue.board, i * 8 + j,0);
            
            Vue.set(self.vue.board, i * 8 + j+9,-2);
            Vue.set(self.vue.board, i * 8 + j+7,-2);
            Vue.set(self.vue.board, i * 8 + j+8,-2);
            Vue.set(self.vue.board, i * 8 + j+2,-2);
            Vue.set(self.vue.board, i * 8 + j-8,-2);
            Vue.set(self.vue.board, i * 8 + j-9,-2);
            Vue.set(self.vue.board, i * 8 + j-7,-2);
            
            self.vue.numOfships1=self.vue.numOfships1+1;
            }else if ((i==0)&&(j==6)) {
            
            Vue.set(self.vue.board, i * 8 + j,0);
            
            Vue.set(self.vue.board, i * 8 + j+9,-2);
            Vue.set(self.vue.board, i * 8 + j+7,-2);
            Vue.set(self.vue.board, i * 8 + j+8,-2);
            Vue.set(self.vue.board, i * 8 + j-2,-2);
            
            self.vue.numOfships1=self.vue.numOfships1+1;
            }else if((i==7) && (j==1)) {
                Vue.set(self.vue.board, i * 8 + j,0);
                
                Vue.set(self.vue.board, i * 8 + j+2,-2);
                Vue.set(self.vue.board, i * 8 + j-8,-2);
                Vue.set(self.vue.board, i * 8 + j-9,-2);
                Vue.set(self.vue.board, i * 8 + j-7,-2);
                
                self.vue.numOfships1=self.vue.numOfships1+1;
            }else if(i==7 && (j!=1)&&(j!=6)){
            Vue.set(self.vue.board, i * 8 + j,0);
            
            Vue.set(self.vue.board, i * 8 + j-2,-2);
            Vue.set(self.vue.board, i * 8 + j+2,-2);
            Vue.set(self.vue.board, i * 8 + j-8,-2);
            Vue.set(self.vue.board, i * 8 + j-9,-2);
            Vue.set(self.vue.board, i * 8 + j-7,-2);
            
            self.vue.numOfships1=self.vue.numOfships1+1;
            }else if(i==0 && (j!=1)&&(j!=6)){
            Vue.set(self.vue.board, i * 8 + j,0);
            
            Vue.set(self.vue.board, i * 8 + j+9,-2);
            Vue.set(self.vue.board, i * 8 + j-2,-2);
            Vue.set(self.vue.board, i * 8 + j+7,-2);
            Vue.set(self.vue.board, i * 8 + j+8,-2);
            Vue.set(self.vue.board, i * 8 + j+2,-2);
            
            self.vue.numOfships1=self.vue.numOfships1+1;
            
            }else {
            Vue.set(self.vue.board, i * 8 + j,0);
            Vue.set(self.vue.board, i * 8 + j+9,-2);
            Vue.set(self.vue.board, i * 8 + j-2,-2);
            Vue.set(self.vue.board, i * 8 + j+7,-2);
            Vue.set(self.vue.board, i * 8 + j+8,-2);
            Vue.set(self.vue.board, i * 8 + j+2,-2);
            Vue.set(self.vue.board, i * 8 + j-8,-2);
            Vue.set(self.vue.board, i * 8 + j-9,-2);
            Vue.set(self.vue.board, i * 8 + j-7,-2);
            self.vue.numOfships1=self.vue.numOfships1+1;

            }
            
            self.vue.numOfplays=self.vue.numOfplays+1;	
            

        }else if( (self.vue.board[i * 8 + j-8]==0) && (self.vue.board[i * 8 + j-16]==0) ){
            if(j==7 && (i!=2) && (i!=7)){		
                Vue.set(self.vue.board, i * 8 + j,0);
                
                Vue.set(self.vue.board, i * 8 + j-1,-2);
                Vue.set(self.vue.board, i * 8 + j+8,-2);
                Vue.set(self.vue.board, i * 8 + j-9,-2);

                Vue.set(self.vue.board, i * 8 + j-24,-2);
                Vue.set(self.vue.board, i * 8 + j-17,-2);
                
            self.vue.numOfships1=self.vue.numOfships1+1;		
            }else if(j==0 && (i!=2) && (i!=7)){
            Vue.set(self.vue.board, i * 8 + j,0);
            
            Vue.set(self.vue.board, i * 8 + j+8,-2);
            Vue.set(self.vue.board, i * 8 + j-15,-2);
            Vue.set(self.vue.board, i * 8 + j-7,-2);
            Vue.set(self.vue.board, i * 8 + j+1,-2);
            Vue.set(self.vue.board, i * 8 + j-24,-2);
            
        self.vue.numOfships1=self.vue.numOfships1+1;

            }else if ((i==2)&&(j==7)) {
            Vue.set(self.vue.board, i * 8 + j,0);
            
            Vue.set(self.vue.board, i * 8 + j-1,-2);
            Vue.set(self.vue.board, i * 8 + j-9,-2);
            Vue.set(self.vue.board, i * 8 + j-24,-2);
            Vue.set(self.vue.board, i * 8 + j+8,-2);
            
        self.vue.numOfships1=self.vue.numOfships1+1;

            }else if((i==7) && (j==0)) {
                Vue.set(self.vue.board, i * 8 + j,0);
                
                Vue.set(self.vue.board, i * 8 + j+1,-2);
                Vue.set(self.vue.board, i * 8 + j-24,-2);
                Vue.set(self.vue.board, i * 8 + j-15,-2);
                Vue.set(self.vue.board, i * 8 + j-7,-2);
                
            self.vue.numOfships1=self.vue.numOfships1+1;
            }else if(i==7 && (j!=0)&& (j!=7)){
                Vue.set(self.vue.board, i * 8 + j,0);
                
                Vue.set(self.vue.board, i * 8 + j-1,-2);
                Vue.set(self.vue.board, i * 8 + j+1,-2);		
                Vue.set(self.vue.board, i * 8 + j-7,-2);
                Vue.set(self.vue.board, i * 8 + j-17,-2);
                Vue.set(self.vue.board, i * 8 + j-9,-2);
                Vue.set(self.vue.board, i * 8 + j-24,-2);
                Vue.set(self.vue.board, i * 8 + j-15,-2);
                
            self.vue.numOfships1=self.vue.numOfships1+1;

            }else if(i==0 && (j!=0)&& (j!=7)){
            Vue.set(self.vue.board, i * 8 + j,0);
            
            Vue.set(self.vue.board, i * 8 + j-1,-2);
            Vue.set(self.vue.board, i * 8 + j+1,-2);
            
            Vue.set(self.vue.board, i * 8 + j-7,-2);
            Vue.set(self.vue.board, i * 8 + j-17,-2);

            Vue.set(self.vue.board, i * 8 + j+8,-2);
            Vue.set(self.vue.board, i * 8 + j-9,-2);
            Vue.set(self.vue.board, i * 8 + j-15,-2);
            
        self.vue.numOfships1=self.vue.numOfships1+1;
            }else {
            Vue.set(self.vue.board, i * 8 + j,0);
            Vue.set(self.vue.board, i * 8 + j-1,-2);
            Vue.set(self.vue.board, i * 8 + j+1,-2);
            
            Vue.set(self.vue.board, i * 8 + j-7,-2);
            Vue.set(self.vue.board, i * 8 + j+8,-2);
            Vue.set(self.vue.board, i * 8 + j-17,-2);

            Vue.set(self.vue.board, i * 8 + j-24,-2);
            Vue.set(self.vue.board, i * 8 + j-9,-2);
            Vue.set(self.vue.board, i * 8 + j-15,-2);
        self.vue.numOfships1=self.vue.numOfships1+1;

            }
                
        self.vue.numOfplays=self.vue.numOfplays+1;		
            
            

        }else if( (self.vue.board[i * 8 + j+8]==0) && (self.vue.board[i * 8 + j+16]==0) ){
            
            
            if(j==7 && (i!=0) && (i!=5)){
                Vue.set(self.vue.board, i * 8 + j,0);
                
                Vue.set(self.vue.board, i * 8 + j+7,-2);
                Vue.set(self.vue.board, i * 8 + j-1,-2);
                Vue.set(self.vue.board, i * 8 + j+15,-2);
                Vue.set(self.vue.board, i * 8 + j+24,-2);
                Vue.set(self.vue.board, i * 8 + j-8,-2);

                self.vue.numOfships1=self.vue.numOfships1+1;

                
            }else if(j==0 && (i!=0) && (i!=5)){
            Vue.set(self.vue.board, i * 8 + j,0);
            
            Vue.set(self.vue.board, i * 8 + j+1,-2);
            
            Vue.set(self.vue.board, i * 8 + j+9,-2);
            Vue.set(self.vue.board, i * 8 + j-8,-2);

            Vue.set(self.vue.board, i * 8 + j+24,-2);
            Vue.set(self.vue.board, i * 8 + j+17,-2);
            
            self.vue.numOfships1=self.vue.numOfships1+1;

            }else if ((i==0)&&(j==7)) {
            Vue.set(self.vue.board, i * 8 + j,0);
            
            Vue.set(self.vue.board, i * 8 + j+1,-2);
            
            Vue.set(self.vue.board, i * 8 + j+9,-2);

            Vue.set(self.vue.board, i * 8 + j+24,-2);
            Vue.set(self.vue.board, i * 8 + j+17,-2);
            
            self.vue.numOfships1=self.vue.numOfships1+1;

            }else if((i==5) && (j==0)) {
                Vue.set(self.vue.board, i * 8 + j,0);
                
                Vue.set(self.vue.board, i * 8 + j+1,-2);
                Vue.set(self.vue.board, i * 8 + j+9,-2);
                Vue.set(self.vue.board, i * 8 + j-8,-2);
                Vue.set(self.vue.board, i * 8 + j+17,-2);
                
                self.vue.numOfships1=self.vue.numOfships1+1;

            }else if(i==0 && (j!=0) && (j!=7)){
            Vue.set(self.vue.board, i * 8 + j,0);
            
            Vue.set(self.vue.board, i * 8 + j-1,-2);
            Vue.set(self.vue.board, i * 8 + j+1,-2);
            
            Vue.set(self.vue.board, i * 8 + j+7,-2);
            Vue.set(self.vue.board, i * 8 + j+24,-2);
            Vue.set(self.vue.board, i * 8 + j+17,-2);
            Vue.set(self.vue.board, i * 8 + j+9,-2);
            Vue.set(self.vue.board, i * 8 + j+15,-2);
            
            self.vue.numOfships1=self.vue.numOfships1+1;
            }else if(i==7 && (j!=0) && (j!=7)){
                Vue.set(self.vue.board, i * 8 + j,0);
                
                Vue.set(self.vue.board, i * 8 + j-1,-2);
                Vue.set(self.vue.board, i * 8 + j+1,-2);
                
                Vue.set(self.vue.board, i * 8 + j+7,-2);
                Vue.set(self.vue.board, i * 8 + j+17,-2);

                Vue.set(self.vue.board, i * 8 + j-8,-2);
                Vue.set(self.vue.board, i * 8 + j+9,-2);
                Vue.set(self.vue.board, i * 8 + j+15,-2);
                self.vue.numOfships1=self.vue.numOfships1+1;
               
            }else {

            Vue.set(self.vue.board, i * 8 + j,0);
            Vue.set(self.vue.board, i * 8 + j-1,-2);
            Vue.set(self.vue.board, i * 8 + j+1,-2);
            
            Vue.set(self.vue.board, i * 8 + j+7,-2);
            Vue.set(self.vue.board, i * 8 + j-8,-2);
            Vue.set(self.vue.board, i * 8 + j+17,-2);

            Vue.set(self.vue.board, i * 8 + j+24,-2);
            Vue.set(self.vue.board, i * 8 + j+9,-2);
            Vue.set(self.vue.board, i * 8 + j+15,-2);
            self.vue.numOfships1=self.vue.numOfships1+1;
            }
        self.vue.numOfplays=self.vue.numOfplays+1;	

            
        }
        else if ((self.vue.board[i * 8 + j+8]==0) && (self.vue.board[i * 8 + j-8]==0)) {
            
            if(j==7 && (i!=1) && (i!=6)){        
        Vue.set(self.vue.board, i * 8 + j,0);

        Vue.set(self.vue.board, i * 8 + j-1,-2);
        Vue.set(self.vue.board, i * 8 + j+7,-2);

        Vue.set(self.vue.board, i * 8 + j-9,-2);

        Vue.set(self.vue.board, i * 8 + j+16,-2);
        Vue.set(self.vue.board, i * 8 + j-16,-2);

            self.vue.numOfships1=self.vue.numOfships1+1;
                
            }else if(j==0 && (i!=1) && (i!=6)){

            Vue.set(self.vue.board, i * 8 + j,0);

            Vue.set(self.vue.board, i * 8 + j+1,-2);
            
            Vue.set(self.vue.board, i * 8 + j-7,-2);
            
            Vue.set(self.vue.board, i * 8 + j+9,-2);

            Vue.set(self.vue.board, i * 8 + j+16,-2);
            Vue.set(self.vue.board, i * 8 + j-16,-2);

            self.vue.numOfships1=self.vue.numOfships1+1;

            }else if ((i==1)&&(j==7)) {
            Vue.set(self.vue.board, i * 8 + j,0);

            Vue.set(self.vue.board, i * 8 + j-1,-2);
            Vue.set(self.vue.board, i * 8 + j+7,-2);

            Vue.set(self.vue.board, i * 8 + j-9,-2);

            Vue.set(self.vue.board, i * 8 + j+16,-2);

                self.vue.numOfships1=self.vue.numOfships1+1;

            }else if((i==5) && (j==0)) {
                Vue.set(self.vue.board, i * 8 + j,0);

                Vue.set(self.vue.board, i * 8 + j+1,-2);
                Vue.set(self.vue.board, i * 8 + j-7,-2);
                Vue.set(self.vue.board, i * 8 + j+9,-2);
                Vue.set(self.vue.board, i * 8 + j-16,-2);

                self.vue.numOfships1=self.vue.numOfships1+1;

            }else if(i==1 && (j!=0) && (j!=7)){

            Vue.set(self.vue.board, i * 8 + j,0);
            Vue.set(self.vue.board, i * 8 + j-1,-2);
            Vue.set(self.vue.board, i * 8 + j+1,-2);
            
            Vue.set(self.vue.board, i * 8 + j+7,-2);
            Vue.set(self.vue.board, i * 8 + j-7,-2);
            
            Vue.set(self.vue.board, i * 8 + j+9,-2);
            Vue.set(self.vue.board, i * 8 + j-9,-2);

            Vue.set(self.vue.board, i * 8 + j+16,-2);
            
            self.vue.numOfships1=self.vue.numOfships1+1;

            }else if(i==6 && (j!=0) && (j!=7)){
                Vue.set(self.vue.board, i * 8 + j,0);
                Vue.set(self.vue.board, i * 8 + j-1,-2);
                Vue.set(self.vue.board, i * 8 + j+1,-2);
                
                Vue.set(self.vue.board, i * 8 + j+7,-2);
                Vue.set(self.vue.board, i * 8 + j-7,-2);
                
                Vue.set(self.vue.board, i * 8 + j+9,-2);
                Vue.set(self.vue.board, i * 8 + j-9,-2);

                Vue.set(self.vue.board, i * 8 + j-16,-2);
                
                self.vue.numOfships1=self.vue.numOfships1+1;
               
            }else {
            Vue.set(self.vue.board, i * 8 + j,0);
            Vue.set(self.vue.board, i * 8 + j-1,-2);
            Vue.set(self.vue.board, i * 8 + j+1,-2);
            
            Vue.set(self.vue.board, i * 8 + j+7,-2);
            Vue.set(self.vue.board, i * 8 + j-7,-2);
            
            Vue.set(self.vue.board, i * 8 + j+9,-2);
            Vue.set(self.vue.board, i * 8 + j-9,-2);

            Vue.set(self.vue.board, i * 8 + j+16,-2);	
            self.vue.numOfships1=self.vue.numOfships1+1;

            }
            self.vue.numOfplays=self.vue.numOfplays+1;	
            
            
        }else{
             Vue.set(self.vue.board, i * 8 + j,0);
            self.vue.numOfplays=self.vue.numOfplays+1;	
        }





        }



if( self.vue.board[i*8+j]>=2 && self.vue.board[i*8+j]<=4 ){
        Vue.set(self.vue.board, i * 8 + j,0);
    if(j==7 && (i!=0) && (i!=7)){
        Vue.set(self.vue.board, i * 8 + j-1,-2);
        Vue.set(self.vue.board, i * 8 + j+8,-2);
        Vue.set(self.vue.board, i * 8 + j-8,-2);
        self.vue.numOfplays=self.vue.numOfplays+1;
        self.vue.numOfships1=self.vue.numOfships1+1;
    }else if(j==0 && (i!=0) && (i!=7)){
        Vue.set(self.vue.board, i * 8 + j+1,-2);
        Vue.set(self.vue.board, i * 8 + j+8,-2);
        Vue.set(self.vue.board, i * 8 + j-8,-2);
        self.vue.numOfplays=self.vue.numOfplays+1;
        self.vue.numOfships1=self.vue.numOfships1+1;
    }else if ((j==0) && (i==0)) {
        Vue.set(self.vue.board, i * 8 + j+1,-2);
        Vue.set(self.vue.board, i * 8 + j+8,-2);
        self.vue.numOfplays=self.vue.numOfplays+1;
        self.vue.numOfships1=self.vue.numOfships1+1;
    }else if((j==7) && (i==0)) {
        Vue.set(self.vue.board, i * 8 + j-1,-2);
        Vue.set(self.vue.board, i * 8 + j+8,-2);
        self.vue.numOfplays=self.vue.numOfplays+1;
        self.vue.numOfships1=self.vue.numOfships1+1;
    }else if(i==0 && (j!=0) && (j!=7)){
        Vue.set(self.vue.board, i * 8 + j+1,-2);
        Vue.set(self.vue.board, i * 8 + j-1,-2);
        Vue.set(self.vue.board, i * 8 + j+8,-2);
        self.vue.numOfplays=self.vue.numOfplays+1;
        self.vue.numOfships1=self.vue.numOfships1+1;
    }else if(i==7 && (i!=0) && (i!=7) ){
        Vue.set(self.vue.board, i * 8 + j+1,-2);
        Vue.set(self.vue.board, i * 8 + j-1,-2);
        Vue.set(self.vue.board, i * 8 + j-8,-2);
        self.vue.numOfplays=self.vue.numOfplays+1;
        self.vue.numOfships1=self.vue.numOfships1+1;
    }else if((i==7) && (j==0)){
        Vue.set(self.vue.board, i * 8 + j+1,-2);
        Vue.set(self.vue.board, i * 8 + j+8,-2);
        self.vue.numOfplays=self.vue.numOfplays+1;
        self.vue.numOfships1=self.vue.numOfships1+1;
    }else if((i==7) && (j==7)){
    Vue.set(self.vue.board, i * 8 + j-1,-2);
    Vue.set(self.vue.board, i * 8 + j+8,-2);
    self.vue.numOfplays=self.vue.numOfplays+1;
    self.vue.numOfships1=self.vue.numOfships1+1;   
    }else {
    Vue.set(self.vue.board, i * 8 + j+1,-2);
    Vue.set(self.vue.board, i * 8 + j-1,-2);
    Vue.set(self.vue.board, i * 8 + j+8,-2);
    Vue.set(self.vue.board, i * 8 + j-8,-2);
    self.vue.numOfplays=self.vue.numOfplays+1;
    self.vue.numOfships1=self.vue.numOfships1+1;
    }
     }
        
        
        if( self.vue.board[i*8+j]==5 || self.vue.board[i*8+j]==6 ){        
                if(self.vue.board[(i*8+j)+1]==0){
                    
                    
                    if(j==6 && (i!=0) && (i!=7)){
                    Vue.set(self.vue.board, i * 8 + j,0);
                    
                    Vue.set(self.vue.board, (i*8+j)+9,-2);
                    Vue.set(self.vue.board, i * 8 + j-7,-2);
                    Vue.set(self.vue.board, i * 8 + j-1,-2);
                    Vue.set(self.vue.board, i * 8 + j+8,-2);
                    Vue.set(self.vue.board, i * 8 + j-8,-2);
                    
                    self.vue.numOfships1=self.vue.numOfships1+1;
                        
                    }else if(j==0 && (i!=0) && (i!=7)){
                    Vue.set(self.vue.board, i * 8 + j,0);
                    
                    Vue.set(self.vue.board, (i*8+j)+9,-2);
                    Vue.set(self.vue.board, i * 8 + j-7,-2);
                    Vue.set(self.vue.board, i * 8 + j+2,-2);
                    Vue.set(self.vue.board, i * 8 + j+8,-2);
                    Vue.set(self.vue.board, i * 8 + j-8,-2);
                    
                    self.vue.numOfships1=self.vue.numOfships1+1;

                    }else if ((i==0)&&(j==6)) {
                    Vue.set(self.vue.board, i * 8 + j,0);
                    
                    Vue.set(self.vue.board, (i*8+j) +9,-2);
                    Vue.set(self.vue.board, i * 8 + j-1,-2);
                    Vue.set(self.vue.board, i * 8 + j+8,-2);
                    
                    self.vue.numOfships1=self.vue.numOfships1+1;

                    }else if((i==7) && (j==0)) {
                        Vue.set(self.vue.board, i * 8 + j,0);

                        Vue.set(self.vue.board, i * 8 + j-7,-2);
                        Vue.set(self.vue.board, i * 8 + j+2,-2);
                        Vue.set(self.vue.board, i * 8 + j-8,-2);
                        
                        self.vue.numOfships1=self.vue.numOfships1+1;

                    }else if(i==0 && (j!=0) && (j!=6)){
                        Vue.set(self.vue.board, i * 8 + j,0);
                        
                        Vue.set(self.vue.board, (i*8+j)+9,-2);
                        
                        Vue.set(self.vue.board, i * 8 + j+2,-2);
                        Vue.set(self.vue.board, i * 8 + j-1,-2);
                        Vue.set(self.vue.board, i * 8 + j+8,-2);
                        self.vue.numOfships1=self.vue.numOfships1+1;

                    }else if(i==7 && (j!=0) && (j!=6) ){
                        Vue.set(self.vue.board, i * 8 + j,0);
                        
                        Vue.set(self.vue.board, (i*8+j)-7,-2);	
                        Vue.set(self.vue.board, i * 8 + j+2,-2);
                        Vue.set(self.vue.board, i * 8 + j-8,-2);
                        
                        self.vue.numOfships1=self.vue.numOfships1+1;	   
                    
                    }else {
                    Vue.set(self.vue.board, i * 8 + j,0);
                    
                    Vue.set(self.vue.board, (i*8+j)+9,-2);
                    Vue.set(self.vue.board, i * 8 + j-7,-2);
                    
                    Vue.set(self.vue.board, i * 8 + j+2,-2);
                    Vue.set(self.vue.board, i * 8 + j-1,-2);
                    Vue.set(self.vue.board, i * 8 + j+8,-2);
                    Vue.set(self.vue.board, i * 8 + j-8,-2);
                    self.vue.numOfships1=self.vue.numOfships1+1;
                    }
                    
                    
                    }else if(self.vue.board[(i*8+j)-1]==0) {
                        
                        if(j==7 && (i!=0) && (i!=7)){
                        Vue.set(self.vue.board, i * 8 + j,0);
                        
                        Vue.set(self.vue.board, i * 8 + j+7,-2);
                        Vue.set(self.vue.board, i * 8 + j-9,-2);
                        
                        Vue.set(self.vue.board, i * 8 + j-2,-2);
                        
                        Vue.set(self.vue.board, i * 8 + j+8,-2);
                        Vue.set(self.vue.board, i * 8 + j-8,-2);
                        self.vue.numOfships1=self.vue.numOfships1+1;
                            
                        }else if(j==1 && (i!=0) && (i!=7)){
                        Vue.set(self.vue.board, i * 8 + j,0);
                        
                        Vue.set(self.vue.board, i * 8 + j+7,-2);
                        Vue.set(self.vue.board, i * 8 + j-9,-2);
                        
                        Vue.set(self.vue.board, i * 8 + j+1,-2);
                        
                        Vue.set(self.vue.board, i * 8 + j+8,-2);
                        Vue.set(self.vue.board, i * 8 + j-8,-2);
                        self.vue.numOfships1=self.vue.numOfships1+1;

                        }else if ((i==0)&&(j==7)) {
                        Vue.set(self.vue.board, i * 8 + j,0);
                        
                        Vue.set(self.vue.board, i * 8 + j+7,-2);				
                        Vue.set(self.vue.board, i * 8 + j-2,-2);
                        
                        Vue.set(self.vue.board, i * 8 + j+8,-2);
                        self.vue.numOfships1=self.vue.numOfships1+1;

                        }else if((i==7) && (j==1)) {
                            Vue.set(self.vue.board, i * 8 + j,0);
                            
                            Vue.set(self.vue.board, i * 8 + j-9,-2);
                            Vue.set(self.vue.board, i * 8 + j+1,-2);
                            Vue.set(self.vue.board, i * 8 + j-8,-2);
                            
                            self.vue.numOfships1=self.vue.numOfships1+1;
                        }else if(i==0 && (j!=1) && (j!=7)){
                            Vue.set(self.vue.board, i * 8 + j,0);
                            
                            Vue.set(self.vue.board, i * 8 + j+7,-2);
                            Vue.set(self.vue.board, i * 8 + j-2,-2);
                            Vue.set(self.vue.board, i * 8 + j+1,-2);
                            Vue.set(self.vue.board, i * 8 + j+8,-2);
                        
                            self.vue.numOfships1=self.vue.numOfships1+1;

                        }else if(i==7 && (j!=1) && (j!=7)){
                         Vue.set(self.vue.board, i * 8 + j,0);

                        Vue.set(self.vue.board, i * 8 + j-9,-2);				
                        Vue.set(self.vue.board, i * 8 + j-2,-2);
                        Vue.set(self.vue.board, i * 8 + j+1,-2);
                        Vue.set(self.vue.board, i * 8 + j-8,-2);
                        
                        self.vue.numOfships1=self.vue.numOfships1+1;
                        }else {
                        Vue.set(self.vue.board, i * 8 + j,0);
                        
                        Vue.set(self.vue.board, i * 8 + j+7,-2);
                        Vue.set(self.vue.board, i * 8 + j-9,-2);
                        
                        Vue.set(self.vue.board, i * 8 + j-2,-2);
                        Vue.set(self.vue.board, i * 8 + j+1,-2);
                        
                        Vue.set(self.vue.board, i * 8 + j+8,-2);
                        Vue.set(self.vue.board, i * 8 + j-8,-2);
                        self.vue.numOfships1=self.vue.numOfships1+1;
                        }
                        
                }
                else if(self.vue.board[(i*8+j)-8]==0) {
                    
                    if(j==7 && (i!=1) && (i!=7)){
                    Vue.set(self.vue.board, i * 8 + j,0);
                    
                    Vue.set(self.vue.board, i * 8 + j-9,-2);
                    Vue.set(self.vue.board, i * 8 + j-1,-2);
                    Vue.set(self.vue.board, i * 8 + j+8,-2);
                    Vue.set(self.vue.board, i * 8 + j-16,-2);
                    
                    self.vue.numOfships1=self.vue.numOfships1+1;
                        
                    }else if(j==0 && (i!=1) && (i!=7) ){
                    Vue.set(self.vue.board, i * 8 + j,0);

                    Vue.set(self.vue.board, i * 8 + j-7,-2);
                    Vue.set(self.vue.board, i * 8 + j+1,-2);
                    Vue.set(self.vue.board, i * 8 + j+8,-2);
                    Vue.set(self.vue.board, i * 8 + j-16,-2);
                    
                    self.vue.numOfships1=self.vue.numOfships1+1;

                    }else if ((i==1)&&(j==7)) {
                    Vue.set(self.vue.board, i * 8 + j,0);
                    
                    Vue.set(self.vue.board, i * 8 + j-9,-2);
                    Vue.set(self.vue.board, i * 8 + j-1,-2);
                    Vue.set(self.vue.board, i * 8 + j+8,-2);
                    
                    self.vue.numOfships1=self.vue.numOfships1+1;

                    }else if((i==7) && (j==0)) {
                    Vue.set(self.vue.board, i * 8 + j,0);

                    Vue.set(self.vue.board, i * 8 + j-7,-2);
                    Vue.set(self.vue.board, i * 8 + j+1,-2);
                    Vue.set(self.vue.board, i * 8 + j-16,-2);
                    
                    self.vue.numOfships1=self.vue.numOfships1+1;
                    }else if(i==1 && (j!=0) && (j!=7) ){
                        Vue.set(self.vue.board, i * 8 + j,0);
                        Vue.set(self.vue.board, i * 8 + j-9,-2);
                        Vue.set(self.vue.board, i * 8 + j-7,-2);
                        Vue.set(self.vue.board, i * 8 + j-1,-2);
                        Vue.set(self.vue.board, i * 8 + j+1,-2);
                        Vue.set(self.vue.board, i * 8 + j+8,-2);
                        
                        self.vue.numOfships1=self.vue.numOfships1+1;
                    }else if(i==7){
                       Vue.set(self.vue.board, i * 8 + j,0);
                    Vue.set(self.vue.board, i * 8 + j-9,-2);
                    Vue.set(self.vue.board, i * 8 + j-7,-2);
                    Vue.set(self.vue.board, i * 8 + j-1,-2);
                    Vue.set(self.vue.board, i * 8 + j+1,-2);
                    
                    Vue.set(self.vue.board, i * 8 + j-16,-2);
                    self.vue.numOfships1=self.vue.numOfships1+1;
                    }else {
                    Vue.set(self.vue.board, i * 8 + j,0);
                    Vue.set(self.vue.board, i * 8 + j-9,-2);
                    Vue.set(self.vue.board, i * 8 + j-7,-2);
                    Vue.set(self.vue.board, i * 8 + j-1,-2);
                    Vue.set(self.vue.board, i * 8 + j+1,-2);
                    Vue.set(self.vue.board, i * 8 + j+8,-2);
                    Vue.set(self.vue.board, i * 8 + j-16,-2);
                    self.vue.numOfships1=self.vue.numOfships1+1;

                    }
                    
                    }
                else if(self.vue.board[(i*8+j)+8]==0) {
                    
                    if(j==7 && (i!=0) && (i!=6)){
                    Vue.set(self.vue.board, i * 8 + j,0);
                    
                    Vue.set(self.vue.board, i * 8 + j+7,-2);
                    Vue.set(self.vue.board, i * 8 + j-1,-2);
                    Vue.set(self.vue.board, i * 8 + j-8,-2);
                    Vue.set(self.vue.board, i * 8 + j+16,-2);
                    
                    self.vue.numOfships1=self.vue.numOfships1+1;
                        
                    }else if(j==0 && (i!=0) && (i!=6)){
                    Vue.set(self.vue.board, i * 8 + j,0);
                    
                    Vue.set(self.vue.board, i * 8 + j+9,-2);
                    Vue.set(self.vue.board, i * 8 + j+1,-2);
                    Vue.set(self.vue.board, i * 8 + j-8,-2);
                    Vue.set(self.vue.board, i * 8 + j+16,-2);
                    
                    self.vue.numOfships1=self.vue.numOfships1+1;

                    }else if ((i==0)&&(j==7)) {
                    Vue.set(self.vue.board, i * 8 + j,0);
                    
                    Vue.set(self.vue.board, i * 8 + j+7,-2);
                    Vue.set(self.vue.board, i * 8 + j-1,-2);
                    Vue.set(self.vue.board, i * 8 + j+16,-2);
                    
                    self.vue.numOfships1=self.vue.numOfships1+1;

                    }else if((i==6) && (j==0)) {
                        Vue.set(self.vue.board, i * 8 + j,0);
                        
                        Vue.set(self.vue.board, i * 8 + j+9,-2);
                        Vue.set(self.vue.board, i * 8 + j+1,-2);
                        Vue.set(self.vue.board, i * 8 + j-8,-2);
                        
                        self.vue.numOfships1=self.vue.numOfships1+1;

                    }else if(i==0 && (j!=0) && (j!=7)){
                        Vue.set(self.vue.board, i * 8 + j,0);
                        
                        Vue.set(self.vue.board, i * 8 + j+9,-2);
                        Vue.set(self.vue.board, i * 8 + j+7,-2);
                        Vue.set(self.vue.board, i * 8 + j-1,-2);
                        Vue.set(self.vue.board, i * 8 + j+1,-2);
                        Vue.set(self.vue.board, i * 8 + j+16,-2);
                        
                        self.vue.numOfships1=self.vue.numOfships1+1;

                    }else if(i==6 && (j!=0) && (j!=7)){
                        Vue.set(self.vue.board, i * 8 + j,0);
                        
                        Vue.set(self.vue.board, i * 8 + j+9,-2);
                        Vue.set(self.vue.board, i * 8 + j+7,-2);
                        Vue.set(self.vue.board, i * 8 + j-1,-2);
                        Vue.set(self.vue.board, i * 8 + j+1,-2);
                        Vue.set(self.vue.board, i * 8 + j-8,-2);

                        
                        self.vue.numOfships1=self.vue.numOfships1+1;
                    }else {
                    Vue.set(self.vue.board, i * 8 + j,0);
                    Vue.set(self.vue.board, i * 8 + j+9,-2);
                    Vue.set(self.vue.board, i * 8 + j+7,-2);
                    Vue.set(self.vue.board, i * 8 + j-1,-2);
                    Vue.set(self.vue.board, i * 8 + j+1,-2);
                    Vue.set(self.vue.board, i * 8 + j-8,-2);
                    Vue.set(self.vue.board, i * 8 + j+16,-2);
                    self.vue.numOfships1=self.vue.numOfships1+1;

                    }
                    
                }else{
                Vue.set(self.vue.board, i * 8 + j,0);
                }

          self.vue.numOfplays=self.vue.numOfplays+1;
                }
        
        if((self.vue.board[i * 8 + j]==0)){
        temp=self.vue.board[i * 8 + j];
        Vue.set(self.vue.board, i * 8 + j,0);
        }
        
        self.send_state();
        return;
        }
    
        
        

if(self.vue.my_role=='o' && self.vue.numOfplays%2!=0){
       
    
    
     if(self.vue.board1[i * 8 + j]=='*'){
        Vue.set(self.vue.board1, i * 8 + j, -2);
        self.vue.numOfplays=self.vue.numOfplays+1;
        }
        
        
  // large ship sink       
if((self.vue.board1[i * 8 + j]==1)){
  
if( (self.vue.board1[(i*8+j)+1]==0) && (self.vue.board1[(i*8+j)+2]==0) ){
    
    if(j==5 && (i!=0) && (i!=7)){
    Vue.set(self.vue.board1, i * 8 + j,0);

    Vue.set(self.vue.board1, i * 8 + j+10 ,-2);
    Vue.set(self.vue.board1, i * 8 + j+9 ,-2);
    Vue.set(self.vue.board1, i * 8 + j+8 ,-2);
    Vue.set(self.vue.board1, i * 8 + j-1 ,-2);
    Vue.set(self.vue.board1, i * 8 + j-8 ,-2);
    Vue.set(self.vue.board1, i * 8 + j-7 ,-2);
    Vue.set(self.vue.board1, i * 8 + j-6 ,-2);
        
        self.vue.numOfships2=self.vue.numOfships2+1;
    }else if(j==0 && (i!=0) && (i!=7)){
        Vue.set(self.vue.board1, i * 8 + j,0);
        
        Vue.set(self.vue.board1, i * 8 + j+3  ,-2);
        Vue.set(self.vue.board1, i * 8 + j+10 ,-2);
        Vue.set(self.vue.board1, i * 8 + j+9  ,-2);
        Vue.set(self.vue.board1, i * 8 + j+8  ,-2);
        Vue.set(self.vue.board1, i * 8 + j-8  ,-2);
        Vue.set(self.vue.board1, i * 8 + j-7  ,-2);
        Vue.set(self.vue.board1, i * 8 + j-6  ,-2);	
        self.vue.numOfships2=self.vue.numOfships2+1;
        
    }else if ((j==0) && (i==7)) {
        Vue.set(self.vue.board1, i * 8 + j,0);
        
        Vue.set(self.vue.board1, i * 8 + j+3,-2);
        Vue.set(self.vue.board1, i * 8 + j-8,-2);
        Vue.set(self.vue.board1, i * 8 + j-7,-2);
        Vue.set(self.vue.board1, i * 8 + j-6,-2);
            
        self.vue.numOfships2=self.vue.numOfships2+1;
    }else if((j==5) && (i==0)) {
        Vue.set(self.vue.board1, i * 8 + j,0);
        
        Vue.set(self.vue.board1, i * 8 + j+10,-2);
        Vue.set(self.vue.board1, i * 8 + j+9,-2);
        Vue.set(self.vue.board1, i * 8 + j+8,-2);
        Vue.set(self.vue.board1, i * 8 + j-1,-2);
        
        self.vue.numOfships2=self.vue.numOfships2+1;
        
    }else if(i==0 && (j!=0) && (j!=5)){
        Vue.set(self.vue.board1, i * 8 + j,0);
        Vue.set(self.vue.board1, i * 8 + j+3, -2);
        Vue.set(self.vue.board1, i * 8 + j+10,-2);
        Vue.set(self.vue.board1, i * 8 + j+9,-2);
        Vue.set(self.vue.board1, i * 8 + j+8,-2);
        Vue.set(self.vue.board1, i * 8 + j-1, -2);
        
        self.vue.numOfships2=self.vue.numOfships2+1;
        
    }else if(i==7 && (j!=0) && (j!=5)   ){
        Vue.set(self.vue.board1, i * 8 + j,0);
        Vue.set(self.vue.board1, i * 8 + j+3,-2);
        Vue.set(self.vue.board1, i * 8 + j-1,-2);
        Vue.set(self.vue.board1, i * 8 + j-8,-2);
        Vue.set(self.vue.board1, i * 8 + j-7,-2);
        Vue.set(self.vue.board1, i * 8 + j-6,-2);
        
        self.vue.numOfships2=self.vue.numOfships2+1;

    }else if(i==0 && (j==0)){
    Vue.set(self.vue.board1, i * 8 + j,0);
    
    Vue.set(self.vue.board1, i * 8 + j+3  ,-2);
    Vue.set(self.vue.board1, i * 8 + j+10 ,-2);
    Vue.set(self.vue.board1, i * 8 + j+9  ,-2);
    Vue.set(self.vue.board1, i * 8 + j+8  ,-2);
    
    self.vue.numOfships2=self.vue.numOfships2+1;
    }else {
    Vue.set(self.vue.board1, i * 8 + j,0);
    Vue.set(self.vue.board1, i * 8 + j+3,-2);
    Vue.set(self.vue.board1, i * 8 + j+10,-2);
    Vue.set(self.vue.board1, i * 8 + j+9,-2);
    Vue.set(self.vue.board1, i * 8 + j+8,-2);
    Vue.set(self.vue.board1, i * 8 + j-1,-2);
    Vue.set(self.vue.board1, i * 8 + j-8,-2);
    Vue.set(self.vue.board1, i * 8 + j-7,-2);
    Vue.set(self.vue.board1, i * 8 + j-6,-2);
    self.vue.numOfships2=self.vue.numOfships2+1;
    }
    self.vue.numOfplays=self.vue.numOfplays+1;

    
}else if( (self.vue.board1[i * 8 + j-1]==0) && (self.vue.board1[i * 8 + j-2]==0) ){ 
        if(j==7 && (i!=0) && (i!=7)){
        Vue.set(self.vue.board1, i * 8 + j,0);
        
            Vue.set(self.vue.board1, i * 8 + j+6,-2);
            Vue.set(self.vue.board1, i * 8 + j-3,-2);
            Vue.set(self.vue.board1, i * 8 + j+7,-2);
            Vue.set(self.vue.board1, i * 8 + j+8,-2);
            Vue.set(self.vue.board1, i * 8 + j-8,-2);
            Vue.set(self.vue.board1, i * 8 + j-9,-2);
            Vue.set(self.vue.board1, i * 8 + j-10,-2);
            
            self.vue.numOfships2=self.vue.numOfships2+1;
            
        }else if(j==2 && (i!=0) && (i!=7)){
        Vue.set(self.vue.board1, i * 8 + j,0);
    
        Vue.set(self.vue.board1, i * 8 + j+6,-2);
        Vue.set(self.vue.board1, i * 8 + j+7,-2);
        Vue.set(self.vue.board1, i * 8 + j+8,-2);
        Vue.set(self.vue.board1, i * 8 + j+1,-2);
        Vue.set(self.vue.board1, i * 8 + j-8,-2);
        Vue.set(self.vue.board1, i * 8 + j-9,-2);
        Vue.set(self.vue.board1, i * 8 + j-10,-2);
        
        self.vue.numOfships2=self.vue.numOfships2+1;
        }else if ((i==0)&&(j==7)) {
        Vue.set(self.vue.board1, i * 8 + j,0);
        
        Vue.set(self.vue.board1, i * 8 + j+6,-2);
        Vue.set(self.vue.board1, i * 8 + j+7,-2);
        Vue.set(self.vue.board1, i * 8 + j+8,-2);
        Vue.set(self.vue.board1, i * 8 + j-3,-2);
        self.vue.numOfships2=self.vue.numOfships2+1;
        
        }else if((i==7) && (j==2)) {
        Vue.set(self.vue.board1, i * 8 + j,0);
        
        Vue.set(self.vue.board1, i * 8 + j+1,-2);
        Vue.set(self.vue.board1, i * 8 + j-8,-2);
        Vue.set(self.vue.board1, i * 8 + j-9,-2);
        Vue.set(self.vue.board1, i * 8 + j-10,-2);
        
        self.vue.numOfships2=self.vue.numOfships2+1;
    

        }else if(i==0 && (j!=0) && (j!=7) ){
        Vue.set(self.vue.board1, i * 8 + j,0);
        
        Vue.set(self.vue.board1, i * 8 + j-3,-2);
        Vue.set(self.vue.board1, i * 8 + j+1,-2);
        Vue.set(self.vue.board1, i * 8 + j+6,-2);
        Vue.set(self.vue.board1, i * 8 + j+7,-2);
        Vue.set(self.vue.board1, i * 8 + j+8,-2);
        
        self.vue.numOfships2=self.vue.numOfships2+1;

        }else if(i==7 && (j!=0) && (j!=7)){
           
        Vue.set(self.vue.board1, i * 8 + j,0);
        
            Vue.set(self.vue.board1, i * 8 + j-3,-2);
            Vue.set(self.vue.board1, i * 8 + j+1,-2);
            Vue.set(self.vue.board1, i * 8 + j-8,-2);
            Vue.set(self.vue.board1, i * 8 + j-9,-2);
            Vue.set(self.vue.board1, i * 8 + j-10,-2);
            
            self.vue.numOfships2=self.vue.numOfships2+1;
        }else {

            Vue.set(self.vue.board1, i * 8 + j,0);
                Vue.set(self.vue.board1, i * 8 + j+6,-2);
                Vue.set(self.vue.board1, i * 8 + j-3,-2);
                Vue.set(self.vue.board1, i * 8 + j+7,-2);
                Vue.set(self.vue.board1, i * 8 + j+8,-2);
                Vue.set(self.vue.board1, i * 8 + j+1,-2);
                Vue.set(self.vue.board1, i * 8 + j-8,-2);
                Vue.set(self.vue.board1, i * 8 + j-9,-2);
                Vue.set(self.vue.board1, i * 8 + j-10,-2);
                self.vue.numOfships2=self.vue.numOfships2+1;

        }
        
    self.vue.numOfplays=self.vue.numOfplays+1;		
    
  }else if( (self.vue.board1[i * 8 + j-1]==0) && (self.vue.board1[i * 8 + j+1]==0) ){	
   

 if(j==6 && (i!=0) && (i!=7) ){
    Vue.set(self.vue.board1, i * 8 + j,0);
    
    Vue.set(self.vue.board1, i * 8 + j+9,-2);
    Vue.set(self.vue.board1, i * 8 + j-2,-2);
    Vue.set(self.vue.board1, i * 8 + j+7,-2);
    Vue.set(self.vue.board1, i * 8 + j+8,-2);
    Vue.set(self.vue.board1, i * 8 + j-8,-2);
    Vue.set(self.vue.board1, i * 8 + j-9,-2);
    Vue.set(self.vue.board1, i * 8 + j-7,-2);
    
    self.vue.numOfships2=self.vue.numOfships2+1;	
    }else if(j==1 && (i!=0) && (i!=7)){

    Vue.set(self.vue.board1, i * 8 + j,0);
    
    Vue.set(self.vue.board1, i * 8 + j+9,-2);
    Vue.set(self.vue.board1, i * 8 + j+7,-2);
    Vue.set(self.vue.board1, i * 8 + j+8,-2);
    Vue.set(self.vue.board1, i * 8 + j+2,-2);
    Vue.set(self.vue.board1, i * 8 + j-8,-2);
    Vue.set(self.vue.board1, i * 8 + j-9,-2);
    Vue.set(self.vue.board1, i * 8 + j-7,-2);
    
    self.vue.numOfships2=self.vue.numOfships2+1;
    }else if ((i==0)&&(j==6)) {
    
    Vue.set(self.vue.board1, i * 8 + j,0);
    
    Vue.set(self.vue.board1, i * 8 + j+9,-2);
    Vue.set(self.vue.board1, i * 8 + j+7,-2);
    Vue.set(self.vue.board1, i * 8 + j+8,-2);
    Vue.set(self.vue.board1, i * 8 + j-2,-2);
    
    self.vue.numOfships2=self.vue.numOfships2+1;
    }else if((i==7) && (j==1)) {
        Vue.set(self.vue.board1, i * 8 + j,0);
        
        Vue.set(self.vue.board1, i * 8 + j+2,-2);
        Vue.set(self.vue.board1, i * 8 + j-8,-2);
        Vue.set(self.vue.board1, i * 8 + j-9,-2);
        Vue.set(self.vue.board1, i * 8 + j-7,-2);
        
        self.vue.numOfships2=self.vue.numOfships2+1;
    }else if(i==7 && (j!=1)&&(j!=6)){
    Vue.set(self.vue.board1, i * 8 + j,0);
    
    Vue.set(self.vue.board1, i * 8 + j-2,-2);
    Vue.set(self.vue.board1, i * 8 + j+2,-2);
    Vue.set(self.vue.board1, i * 8 + j-8,-2);
    Vue.set(self.vue.board1, i * 8 + j-9,-2);
    Vue.set(self.vue.board1, i * 8 + j-7,-2);
    
    self.vue.numOfships2=self.vue.numOfships2+1;
    }else if(i==0 && (j!=1)&&(j!=6)){
    Vue.set(self.vue.board1, i * 8 + j,0);
    
    Vue.set(self.vue.board1, i * 8 + j+9,-2);
    Vue.set(self.vue.board1, i * 8 + j-2,-2);
    Vue.set(self.vue.board1, i * 8 + j+7,-2);
    Vue.set(self.vue.board1, i * 8 + j+8,-2);
    Vue.set(self.vue.board1, i * 8 + j+2,-2);
    
    self.vue.numOfships2=self.vue.numOfships2+1;
    
    }else {
    Vue.set(self.vue.board1, i * 8 + j,0);
    Vue.set(self.vue.board1, i * 8 + j+9,-2);
    Vue.set(self.vue.board1, i * 8 + j-2,-2);
    Vue.set(self.vue.board1, i * 8 + j+7,-2);
    Vue.set(self.vue.board1, i * 8 + j+8,-2);
    Vue.set(self.vue.board1, i * 8 + j+2,-2);
    Vue.set(self.vue.board1, i * 8 + j-8,-2);
    Vue.set(self.vue.board1, i * 8 + j-9,-2);
    Vue.set(self.vue.board1, i * 8 + j-7,-2);
    self.vue.numOfships2=self.vue.numOfships2+1;

    }
    
    self.vue.numOfplays=self.vue.numOfplays+1;	
    

}else if( (self.vue.board1[i * 8 + j-8]==0) && (self.vue.board1[i * 8 + j-16]==0) ){
    if(j==7 && (i!=2) && (i!=7)){		
        Vue.set(self.vue.board1, i * 8 + j,0);
        
        Vue.set(self.vue.board1, i * 8 + j-1,-2);
        Vue.set(self.vue.board1, i * 8 + j+8,-2);
        Vue.set(self.vue.board1, i * 8 + j-9,-2);

        Vue.set(self.vue.board1, i * 8 + j-24,-2);
        Vue.set(self.vue.board1, i * 8 + j-17,-2);
        
    self.vue.numOfships2=self.vue.numOfships2+1;		
    }else if(j==0 && (i!=2) && (i!=7)){
    Vue.set(self.vue.board1, i * 8 + j,0);
    
    Vue.set(self.vue.board1, i * 8 + j+8,-2);
    Vue.set(self.vue.board1, i * 8 + j-15,-2);
    Vue.set(self.vue.board1, i * 8 + j-7,-2);
    Vue.set(self.vue.board1, i * 8 + j+1,-2);
    Vue.set(self.vue.board1, i * 8 + j-24,-2);
    
self.vue.numOfships2=self.vue.numOfships2+1;

    }else if ((i==2)&&(j==7)) {
    Vue.set(self.vue.board1, i * 8 + j,0);
    
    Vue.set(self.vue.board1, i * 8 + j-1,-2);
    Vue.set(self.vue.board1, i * 8 + j-9,-2);
    Vue.set(self.vue.board1, i * 8 + j-24,-2);
    Vue.set(self.vue.board1, i * 8 + j+8,-2);
    
self.vue.numOfships2=self.vue.numOfships2+1;

    }else if((i==7) && (j==0)) {
        Vue.set(self.vue.board1, i * 8 + j,0);
        
        Vue.set(self.vue.board1, i * 8 + j+1,-2);
        Vue.set(self.vue.board1, i * 8 + j-24,-2);
        Vue.set(self.vue.board1, i * 8 + j-15,-2);
        Vue.set(self.vue.board1, i * 8 + j-7,-2);
        
    self.vue.numOfships2=self.vue.numOfships2+1;
    }else if(i==7 && (j!=0)&& (j!=7)){
        Vue.set(self.vue.board1, i * 8 + j,0);
        
        Vue.set(self.vue.board1, i * 8 + j-1,-2);
        Vue.set(self.vue.board1, i * 8 + j+1,-2);		
        Vue.set(self.vue.board1, i * 8 + j-7,-2);
        Vue.set(self.vue.board1, i * 8 + j-17,-2);
        Vue.set(self.vue.board1, i * 8 + j-9,-2);
        Vue.set(self.vue.board1, i * 8 + j-24,-2);
        Vue.set(self.vue.board1, i * 8 + j-15,-2);
        
    self.vue.numOfships2=self.vue.numOfships2+1;

    }else if(i==0 && (j!=0)&& (j!=7)){
    Vue.set(self.vue.board1, i * 8 + j,0);
    
    Vue.set(self.vue.board1, i * 8 + j-1,-2);
    Vue.set(self.vue.board1, i * 8 + j+1,-2);
    
    Vue.set(self.vue.board1, i * 8 + j-7,-2);
    Vue.set(self.vue.board1, i * 8 + j-17,-2);

    Vue.set(self.vue.board1, i * 8 + j+8,-2);
    Vue.set(self.vue.board1, i * 8 + j-9,-2);
    Vue.set(self.vue.board1, i * 8 + j-15,-2);
    
self.vue.numOfships2=self.vue.numOfships2+1;
    }else {
    Vue.set(self.vue.board1, i * 8 + j,0);
    Vue.set(self.vue.board1, i * 8 + j-1,-2);
    Vue.set(self.vue.board1, i * 8 + j+1,-2);
    
    Vue.set(self.vue.board1, i * 8 + j-7,-2);
    Vue.set(self.vue.board1, i * 8 + j+8,-2);
    Vue.set(self.vue.board1, i * 8 + j-17,-2);

    Vue.set(self.vue.board1, i * 8 + j-24,-2);
    Vue.set(self.vue.board1, i * 8 + j-9,-2);
    Vue.set(self.vue.board1, i * 8 + j-15,-2);
self.vue.numOfships2=self.vue.numOfships2+1;

    }
        
self.vue.numOfplays=self.vue.numOfplays+1;		
    
    

}else if( (self.vue.board1[i * 8 + j+8]==0) && (self.vue.board1[i * 8 + j+16]==0) ){
    
    
    if(j==7 && (i!=0) && (i!=5)){
        Vue.set(self.vue.board1, i * 8 + j,0);
        
        Vue.set(self.vue.board1, i * 8 + j+7,-2);
        Vue.set(self.vue.board1, i * 8 + j-1,-2);
        Vue.set(self.vue.board1, i * 8 + j+15,-2);
        Vue.set(self.vue.board1, i * 8 + j+24,-2);
        Vue.set(self.vue.board1, i * 8 + j-8,-2);

        self.vue.numOfships2=self.vue.numOfships2+1;

        
    }else if(j==0 && (i!=0) && (i!=5)){
    Vue.set(self.vue.board1, i * 8 + j,0);
    
    Vue.set(self.vue.board1, i * 8 + j+1,-2);
    
    Vue.set(self.vue.board1, i * 8 + j+9,-2);
    Vue.set(self.vue.board1, i * 8 + j-8,-2);

    Vue.set(self.vue.board1, i * 8 + j+24,-2);
    Vue.set(self.vue.board1, i * 8 + j+17,-2);
    
    self.vue.numOfships2=self.vue.numOfships2+1;

    }else if ((i==0)&&(j==7)) {
    Vue.set(self.vue.board1, i * 8 + j,0);
    
    Vue.set(self.vue.board1, i * 8 + j+1,-2);
    
    Vue.set(self.vue.board1, i * 8 + j+9,-2);

    Vue.set(self.vue.board1, i * 8 + j+24,-2);
    Vue.set(self.vue.board1, i * 8 + j+17,-2);
    
    self.vue.numOfships2=self.vue.numOfships2+1;

    }else if((i==5) && (j==0)) {
        Vue.set(self.vue.board1, i * 8 + j,0);
        
        Vue.set(self.vue.board1, i * 8 + j+1,-2);
        Vue.set(self.vue.board1, i * 8 + j+9,-2);
        Vue.set(self.vue.board1, i * 8 + j-8,-2);
        Vue.set(self.vue.board1, i * 8 + j+17,-2);
        
        self.vue.numOfships2=self.vue.numOfships2+1;

    }else if(i==0 && (j!=0) && (j!=7)){
    Vue.set(self.vue.board1, i * 8 + j,0);
    
    Vue.set(self.vue.board1, i * 8 + j-1,-2);
    Vue.set(self.vue.board1, i * 8 + j+1,-2);
    
    Vue.set(self.vue.board1, i * 8 + j+7,-2);
    Vue.set(self.vue.board1, i * 8 + j+24,-2);
    Vue.set(self.vue.board1, i * 8 + j+17,-2);
    Vue.set(self.vue.board1, i * 8 + j+9,-2);
    Vue.set(self.vue.board1, i * 8 + j+15,-2);
    
    self.vue.numOfships2=self.vue.numOfships2+1;
    }else if(i==7 && (j!=0) && (j!=7)){
        Vue.set(self.vue.board1, i * 8 + j,0);
        
        Vue.set(self.vue.board1, i * 8 + j-1,-2);
        Vue.set(self.vue.board1, i * 8 + j+1,-2);
        
        Vue.set(self.vue.board1, i * 8 + j+7,-2);
        Vue.set(self.vue.board1, i * 8 + j+17,-2);

        Vue.set(self.vue.board1, i * 8 + j-8,-2);
        Vue.set(self.vue.board1, i * 8 + j+9,-2);
        Vue.set(self.vue.board1, i * 8 + j+15,-2);
        self.vue.numOfships2=self.vue.numOfships2+1;
       
    }else {

    Vue.set(self.vue.board1, i * 8 + j,0);
    Vue.set(self.vue.board1, i * 8 + j-1,-2);
    Vue.set(self.vue.board1, i * 8 + j+1,-2);
    
    Vue.set(self.vue.board1, i * 8 + j+7,-2);
    Vue.set(self.vue.board1, i * 8 + j-8,-2);
    Vue.set(self.vue.board1, i * 8 + j+17,-2);

    Vue.set(self.vue.board1, i * 8 + j+24,-2);
    Vue.set(self.vue.board1, i * 8 + j+9,-2);
    Vue.set(self.vue.board1, i * 8 + j+15,-2);
    self.vue.numOfships2=self.vue.numOfships2+1;
    }
self.vue.numOfplays=self.vue.numOfplays+1;	

    
}
else if ((self.vue.board1[i * 8 + j+8]==0) && (self.vue.board1[i * 8 + j-8]==0)) {
    
    if(j==7 && (i!=1) && (i!=6)){        
Vue.set(self.vue.board1, i * 8 + j,0);

Vue.set(self.vue.board1, i * 8 + j-1,-2);
Vue.set(self.vue.board1, i * 8 + j+7,-2);

Vue.set(self.vue.board1, i * 8 + j-9,-2);

Vue.set(self.vue.board1, i * 8 + j+16,-2);
Vue.set(self.vue.board1, i * 8 + j-16,-2);

    self.vue.numOfships2=self.vue.numOfships2+1;
        
    }else if(j==0 && (i!=1) && (i!=6)){

    Vue.set(self.vue.board1, i * 8 + j,0);

    Vue.set(self.vue.board1, i * 8 + j+1,-2);
    
    Vue.set(self.vue.board1, i * 8 + j-7,-2);
    
    Vue.set(self.vue.board1, i * 8 + j+9,-2);

    Vue.set(self.vue.board1, i * 8 + j+16,-2);
    Vue.set(self.vue.board1, i * 8 + j-16,-2);

    self.vue.numOfships2=self.vue.numOfships2+1;

    }else if ((i==1)&&(j==7)) {
    Vue.set(self.vue.board1, i * 8 + j,0);

    Vue.set(self.vue.board1, i * 8 + j-1,-2);
    Vue.set(self.vue.board1, i * 8 + j+7,-2);

    Vue.set(self.vue.board1, i * 8 + j-9,-2);

    Vue.set(self.vue.board1, i * 8 + j+16,-2);

        self.vue.numOfships2=self.vue.numOfships2+1;

    }else if((i==5) && (j==0)) {
        Vue.set(self.vue.board1, i * 8 + j,0);

        Vue.set(self.vue.board1, i * 8 + j+1,-2);
        Vue.set(self.vue.board1, i * 8 + j-7,-2);
        Vue.set(self.vue.board1, i * 8 + j+9,-2);
        Vue.set(self.vue.board1, i * 8 + j-16,-2);

        self.vue.numOfships2=self.vue.numOfships2+1;

    }else if(i==1 && (j!=0) && (j!=7)){

    Vue.set(self.vue.board1, i * 8 + j,0);
    Vue.set(self.vue.board1, i * 8 + j-1,-2);
    Vue.set(self.vue.board1, i * 8 + j+1,-2);
    
    Vue.set(self.vue.board1, i * 8 + j+7,-2);
    Vue.set(self.vue.board1, i * 8 + j-7,-2);
    
    Vue.set(self.vue.board1, i * 8 + j+9,-2);
    Vue.set(self.vue.board1, i * 8 + j-9,-2);

    Vue.set(self.vue.board1, i * 8 + j+16,-2);
    
    self.vue.numOfships2=self.vue.numOfships2+1;

    }else if(i==6 && (j!=0) && (j!=7)){
        Vue.set(self.vue.board1, i * 8 + j,0);
        Vue.set(self.vue.board1, i * 8 + j-1,-2);
        Vue.set(self.vue.board1, i * 8 + j+1,-2);
        
        Vue.set(self.vue.board1, i * 8 + j+7,-2);
        Vue.set(self.vue.board1, i * 8 + j-7,-2);
        
        Vue.set(self.vue.board1, i * 8 + j+9,-2);
        Vue.set(self.vue.board1, i * 8 + j-9,-2);

        Vue.set(self.vue.board1, i * 8 + j-16,-2);
        
        self.vue.numOfships2=self.vue.numOfships2+1;
       
    }else {
    Vue.set(self.vue.board1, i * 8 + j,0);
    Vue.set(self.vue.board1, i * 8 + j-1,-2);
    Vue.set(self.vue.board1, i * 8 + j+1,-2);
    
    Vue.set(self.vue.board1, i * 8 + j+7,-2);
    Vue.set(self.vue.board1, i * 8 + j-7,-2);
    
    Vue.set(self.vue.board1, i * 8 + j+9,-2);
    Vue.set(self.vue.board1, i * 8 + j-9,-2);

    Vue.set(self.vue.board1, i * 8 + j+16,-2);	
    self.vue.numOfships2=self.vue.numOfships2+1;

    }
    self.vue.numOfplays=self.vue.numOfplays+1;	
    
    
}else{
     Vue.set(self.vue.board1, i * 8 + j,0);
    self.vue.numOfplays=self.vue.numOfplays+1;	
}

}
// small ships
        if( self.vue.board1[i*8+j]>=2 && self.vue.board1[i*8+j]<=4 ){
        Vue.set(self.vue.board1, i * 8 + j,0);
        if(j==7 && (i!=0) && (i!=7)){
            Vue.set(self.vue.board1, i * 8 + j-1,-2);
            Vue.set(self.vue.board1, i * 8 + j+8,-2);
            Vue.set(self.vue.board1, i * 8 + j-8,-2);
            self.vue.numOfplays=self.vue.numOfplays+1;
            self.vue.numOfships2=self.vue.numOfships2+1;
        }else if(j==0 && (i!=0) && (i!=7)){
            Vue.set(self.vue.board1, i * 8 + j+1,-2);
            Vue.set(self.vue.board1, i * 8 + j+8,-2);
            Vue.set(self.vue.board1, i * 8 + j-8,-2);
            self.vue.numOfplays=self.vue.numOfplays+1;
            self.vue.numOfships2=self.vue.numOfships2+1;
        }else if ((j==0) && (i==0)) {
            Vue.set(self.vue.board1, i * 8 + j+1,-2);
            Vue.set(self.vue.board1, i * 8 + j+8,-2);
            self.vue.numOfplays=self.vue.numOfplays+1;
            self.vue.numOfships2=self.vue.numOfships2+1;
        }else if((j==7) && (i==0)) {
            Vue.set(self.vue.board1, i * 8 + j-1,-2);
            Vue.set(self.vue.board1, i * 8 + j+8,-2);
            self.vue.numOfplays=self.vue.numOfplays+1;
            self.vue.numOfships2=self.vue.numOfships2+1;
        }else if(i==0 && (j!=0) && (j!=7)){
            Vue.set(self.vue.board1, i * 8 + j+1,-2);
            Vue.set(self.vue.board1, i * 8 + j-1,-2);
            Vue.set(self.vue.board1, i * 8 + j+8,-2);
            self.vue.numOfplays=self.vue.numOfplays+1;
            self.vue.numOfships2=self.vue.numOfships2+1;
        }else if(i==7 && (j!=0) && (j!=7)){
            Vue.set(self.vue.board1, i * 8 + j+1,-2);
            Vue.set(self.vue.board1, i * 8 + j-1,-2);
            Vue.set(self.vue.board1, i * 8 + j-8,-2);
            self.vue.numOfplays=self.vue.numOfplays+1;
            self.vue.numOfships2=self.vue.numOfships2+1;
        }else if((i==7) && (j==0)){
            Vue.set(self.vue.board1, i * 8 + j+1,-2);
            Vue.set(self.vue.board1, i * 8 + j+8,-2);
            self.vue.numOfplays=self.vue.numOfplays+1;
            self.vue.numOfships2=self.vue.numOfships2+1;
        }else if((i==7) && (j==7)){
        Vue.set(self.vue.board1, i * 8 + j-1,-2);
        Vue.set(self.vue.board1, i * 8 + j+8,-2);
        self.vue.numOfplays=self.vue.numOfplays+1;
        self.vue.numOfships2=self.vue.numOfships2+1;   
        }else {
        Vue.set(self.vue.board1, i * 8 + j+1,-2);
        Vue.set(self.vue.board1, i * 8 + j-1,-2);
        Vue.set(self.vue.board1, i * 8 + j+8,-2);
        Vue.set(self.vue.board1, i * 8 + j-8,-2);
        self.vue.numOfplays=self.vue.numOfplays+1;
        self.vue.numOfships2=self.vue.numOfships2+1;
        }
        
        }
        
        // med ships
        if( self.vue.board1[i*8+j]==5 || self.vue.board1[i*8+j]==6 ){        
                if(self.vue.board1[(i*8+j)+1]==0){
                    
                    
                    if(j==6 && (i!=0) && (i!=7)){
                    Vue.set(self.vue.board1, i * 8 + j,0);
                    
                    Vue.set(self.vue.board1, (i*8+j)+9,-2);
                    Vue.set(self.vue.board1, i * 8 + j-7,-2);
                    Vue.set(self.vue.board1, i * 8 + j-1,-2);
                    Vue.set(self.vue.board1, i * 8 + j+8,-2);
                    Vue.set(self.vue.board1, i * 8 + j-8,-2);
                    
                    self.vue.numOfships2=self.vue.numOfships2+1;
                        
                    }else if(j==0 && (i!=0) && (i!=7)){
                    Vue.set(self.vue.board1, i * 8 + j,0);
                    
                    Vue.set(self.vue.board1, (i*8+j)+9,-2);
                    Vue.set(self.vue.board1, i * 8 + j-7,-2);
                    Vue.set(self.vue.board1, i * 8 + j+2,-2);
                    Vue.set(self.vue.board1, i * 8 + j+8,-2);
                    Vue.set(self.vue.board1, i * 8 + j-8,-2);
                    
                    self.vue.numOfships2=self.vue.numOfships2+1;

                    }else if ((i==0)&&(j==6)) {
                    Vue.set(self.vue.board1, i * 8 + j,0);
                    
                    Vue.set(self.vue.board1, (i*8+j) +9,-2);
                    Vue.set(self.vue.board1, i * 8 + j-1,-2);
                    Vue.set(self.vue.board1, i * 8 + j+8,-2);
                    
                    self.vue.numOfships2=self.vue.numOfships2+1;

                    }else if((i==7) && (j==0)) {
                        Vue.set(self.vue.board1, i * 8 + j,0);

                        Vue.set(self.vue.board1, i * 8 + j-7,-2);
                        Vue.set(self.vue.board1, i * 8 + j+2,-2);
                        Vue.set(self.vue.board1, i * 8 + j-8,-2);
                        
                        self.vue.numOfships2=self.vue.numOfships2+1;

                    }else if(i==0 && (j!=0) && (j!=6)){
                        Vue.set(self.vue.board1, i * 8 + j,0);
                        
                        Vue.set(self.vue.board1, (i*8+j)+9,-2);
                        
                        Vue.set(self.vue.board1, i * 8 + j+2,-2);
                        Vue.set(self.vue.board1, i * 8 + j-1,-2);
                        Vue.set(self.vue.board1, i * 8 + j+8,-2);
                        self.vue.numOfships2=self.vue.numOfships2+1;

                    }else if(i==7 && (j!=0) && (j!=6) ){
                        Vue.set(self.vue.board1, i * 8 + j,0);
                        
                        Vue.set(self.vue.board1, (i*8+j)-7,-2);	
                        Vue.set(self.vue.board1, i * 8 + j+2,-2);
                        Vue.set(self.vue.board1, i * 8 + j-8,-2);
                        
                        self.vue.numOfships2=self.vue.numOfships2+1;	   
                    
                    }else {
                    Vue.set(self.vue.board1, i * 8 + j,0);
                    
                    Vue.set(self.vue.board1, (i*8+j)+9,-2);
                    Vue.set(self.vue.board1, i * 8 + j-7,-2);
                    
                    Vue.set(self.vue.board1, i * 8 + j+2,-2);
                    Vue.set(self.vue.board1, i * 8 + j-1,-2);
                    Vue.set(self.vue.board1, i * 8 + j+8,-2);
                    Vue.set(self.vue.board1, i * 8 + j-8,-2);
                    self.vue.numOfships2=self.vue.numOfships2+1;
                    }
                    
                    
                    }else if(self.vue.board1[(i*8+j)-1]==0) {
                        
                        if(j==7 && (i!=0) && (i!=7)){
                        Vue.set(self.vue.board1, i * 8 + j,0);
                        
                        Vue.set(self.vue.board1, i * 8 + j+7,-2);
                        Vue.set(self.vue.board1, i * 8 + j-9,-2);
                        
                        Vue.set(self.vue.board1, i * 8 + j-2,-2);
                        
                        Vue.set(self.vue.board1, i * 8 + j+8,-2);
                        Vue.set(self.vue.board1, i * 8 + j-8,-2);
                        self.vue.numOfships2=self.vue.numOfships2+1;
                            
                        }else if(j==1 && (i!=0) && (i!=7)){
                        Vue.set(self.vue.board1, i * 8 + j,0);
                        
                        Vue.set(self.vue.board1, i * 8 + j+7,-2);
                        Vue.set(self.vue.board1, i * 8 + j-9,-2);
                        
                        Vue.set(self.vue.board1, i * 8 + j+1,-2);
                        
                        Vue.set(self.vue.board1, i * 8 + j+8,-2);
                        Vue.set(self.vue.board1, i * 8 + j-8,-2);
                        self.vue.numOfships2=self.vue.numOfships2+1;

                        }else if ((i==0)&&(j==7)) {
                        Vue.set(self.vue.board1, i * 8 + j,0);
                        
                        Vue.set(self.vue.board1, i * 8 + j+7,-2);				
                        Vue.set(self.vue.board1, i * 8 + j-2,-2);
                        
                        Vue.set(self.vue.board1, i * 8 + j+8,-2);
                        self.vue.numOfships2=self.vue.numOfships2+1;

                        }else if((i==7) && (j==1)) {
                            Vue.set(self.vue.board1, i * 8 + j,0);
                            
                            Vue.set(self.vue.board1, i * 8 + j-9,-2);
                            Vue.set(self.vue.board1, i * 8 + j+1,-2);
                            Vue.set(self.vue.board1, i * 8 + j-8,-2);
                            
                            self.vue.numOfships2=self.vue.numOfships2+1;
                        }else if(i==0 && (j!=1) && (j!=7)){
                            Vue.set(self.vue.board1, i * 8 + j,0);
                            
                            Vue.set(self.vue.board1, i * 8 + j+7,-2);
                            Vue.set(self.vue.board1, i * 8 + j-2,-2);
                            Vue.set(self.vue.board1, i * 8 + j+1,-2);
                            Vue.set(self.vue.board1, i * 8 + j+8,-2);
                        
                            self.vue.numOfships2=self.vue.numOfships2+1;

                        }else if(i==7 && (j!=1) && (j!=7)){
                         Vue.set(self.vue.board1, i * 8 + j,0);

                        Vue.set(self.vue.board1, i * 8 + j-9,-2);				
                        Vue.set(self.vue.board1, i * 8 + j-2,-2);
                        Vue.set(self.vue.board1, i * 8 + j+1,-2);
                        Vue.set(self.vue.board1, i * 8 + j-8,-2);
                        
                        self.vue.numOfships2=self.vue.numOfships2+1;
                        }else {
                        Vue.set(self.vue.board1, i * 8 + j,0);
                        
                        Vue.set(self.vue.board1, i * 8 + j+7,-2);
                        Vue.set(self.vue.board1, i * 8 + j-9,-2);
                        
                        Vue.set(self.vue.board1, i * 8 + j-2,-2);
                        Vue.set(self.vue.board1, i * 8 + j+1,-2);
                        
                        Vue.set(self.vue.board1, i * 8 + j+8,-2);
                        Vue.set(self.vue.board1, i * 8 + j-8,-2);
                        self.vue.numOfships2=self.vue.numOfships2+1;
                        }
                        
                }
                else if(self.vue.board1[(i*8+j)-8]==0) {
                    
                    if(j==7 && (i!=1) && (i!=7)){
                    Vue.set(self.vue.board1, i * 8 + j,0);
                    
                    Vue.set(self.vue.board1, i * 8 + j-9,-2);
                    Vue.set(self.vue.board1, i * 8 + j-1,-2);
                    Vue.set(self.vue.board1, i * 8 + j+8,-2);
                    Vue.set(self.vue.board1, i * 8 + j-16,-2);
                    
                    self.vue.numOfships2=self.vue.numOfships2+1;
                        
                    }else if(j==0 && (i!=1) && (i!=7) ){
                    Vue.set(self.vue.board1, i * 8 + j,0);

                    Vue.set(self.vue.board1, i * 8 + j-7,-2);
                    Vue.set(self.vue.board1, i * 8 + j+1,-2);
                    Vue.set(self.vue.board1, i * 8 + j+8,-2);
                    Vue.set(self.vue.board1, i * 8 + j-16,-2);
                    
                    self.vue.numOfships2=self.vue.numOfships2+1;

                    }else if ((i==1)&&(j==7)) {
                    Vue.set(self.vue.board1, i * 8 + j,0);
                    
                    Vue.set(self.vue.board1, i * 8 + j-9,-2);
                    Vue.set(self.vue.board1, i * 8 + j-1,-2);
                    Vue.set(self.vue.board1, i * 8 + j+8,-2);
                    
                    self.vue.numOfships2=self.vue.numOfships2+1;

                    }else if((i==7) && (j==0)) {
                    Vue.set(self.vue.board1, i * 8 + j,0);

                    Vue.set(self.vue.board1, i * 8 + j-7,-2);
                    Vue.set(self.vue.board1, i * 8 + j+1,-2);
                    Vue.set(self.vue.board1, i * 8 + j-16,-2);
                    
                    self.vue.numOfships2=self.vue.numOfships2+1;
                    }else if(i==1 && (j!=0) && (j!=7) ){
                        Vue.set(self.vue.board1, i * 8 + j,0);
                        Vue.set(self.vue.board1, i * 8 + j-9,-2);
                        Vue.set(self.vue.board1, i * 8 + j-7,-2);
                        Vue.set(self.vue.board1, i * 8 + j-1,-2);
                        Vue.set(self.vue.board1, i * 8 + j+1,-2);
                        Vue.set(self.vue.board1, i * 8 + j+8,-2);
                        
                        self.vue.numOfships2=self.vue.numOfships2+1;
                    }else if(i==7){
                       Vue.set(self.vue.board1, i * 8 + j,0);
                    Vue.set(self.vue.board1, i * 8 + j-9,-2);
                    Vue.set(self.vue.board1, i * 8 + j-7,-2);
                    Vue.set(self.vue.board1, i * 8 + j-1,-2);
                    Vue.set(self.vue.board1, i * 8 + j+1,-2);
                    
                    Vue.set(self.vue.board1, i * 8 + j-16,-2);
                    self.vue.numOfships2=self.vue.numOfships2+1;
                    }else {
                    Vue.set(self.vue.board1, i * 8 + j,0);
                    Vue.set(self.vue.board1, i * 8 + j-9,-2);
                    Vue.set(self.vue.board1, i * 8 + j-7,-2);
                    Vue.set(self.vue.board1, i * 8 + j-1,-2);
                    Vue.set(self.vue.board1, i * 8 + j+1,-2);
                    Vue.set(self.vue.board1, i * 8 + j+8,-2);
                    Vue.set(self.vue.board1, i * 8 + j-16,-2);
                    self.vue.numOfships2=self.vue.numOfships2+1;

                    }
                    
                    }
                else if(self.vue.board1[(i*8+j)+8]==0) {
                    
                    if(j==7 && (i!=0) && (i!=6)){
                    Vue.set(self.vue.board1, i * 8 + j,0);
                    
                    Vue.set(self.vue.board1, i * 8 + j+7,-2);
                    Vue.set(self.vue.board1, i * 8 + j-1,-2);
                    Vue.set(self.vue.board1, i * 8 + j-8,-2);
                    Vue.set(self.vue.board1, i * 8 + j+16,-2);
                    
                    self.vue.numOfships2=self.vue.numOfships2+1;
                        
                    }else if(j==0 && (i!=0) && (i!=6)){
                    Vue.set(self.vue.board1, i * 8 + j,0);
                    
                    Vue.set(self.vue.board1, i * 8 + j+9,-2);
                    Vue.set(self.vue.board1, i * 8 + j+1,-2);
                    Vue.set(self.vue.board1, i * 8 + j-8,-2);
                    Vue.set(self.vue.board1, i * 8 + j+16,-2);
                    
                    self.vue.numOfships2=self.vue.numOfships2+1;

                    }else if ((i==0)&&(j==7)) {
                    Vue.set(self.vue.board1, i * 8 + j,0);
                    
                    Vue.set(self.vue.board1, i * 8 + j+7,-2);
                    Vue.set(self.vue.board1, i * 8 + j-1,-2);
                    Vue.set(self.vue.board1, i * 8 + j+16,-2);
                    
                    self.vue.numOfships2=self.vue.numOfships2+1;

                    }else if((i==6) && (j==0)) {
                        Vue.set(self.vue.board1, i * 8 + j,0);
                        
                        Vue.set(self.vue.board1, i * 8 + j+9,-2);
                        Vue.set(self.vue.board1, i * 8 + j+1,-2);
                        Vue.set(self.vue.board1, i * 8 + j-8,-2);
                        
                        self.vue.numOfships2=self.vue.numOfships2+1;

                    }else if(i==0 && (j!=0) && (j!=7)){
                        Vue.set(self.vue.board1, i * 8 + j,0);
                        
                        Vue.set(self.vue.board1, i * 8 + j+9,-2);
                        Vue.set(self.vue.board1, i * 8 + j+7,-2);
                        Vue.set(self.vue.board1, i * 8 + j-1,-2);
                        Vue.set(self.vue.board1, i * 8 + j+1,-2);
                        Vue.set(self.vue.board1, i * 8 + j+16,-2);
                        
                        self.vue.numOfships2=self.vue.numOfships2+1;

                    }else if(i==6 && (j!=0) && (j!=7)){
                        Vue.set(self.vue.board1, i * 8 + j,0);
                        
                        Vue.set(self.vue.board1, i * 8 + j+9,-2);
                        Vue.set(self.vue.board1, i * 8 + j+7,-2);
                        Vue.set(self.vue.board1, i * 8 + j-1,-2);
                        Vue.set(self.vue.board1, i * 8 + j+1,-2);
                        Vue.set(self.vue.board1, i * 8 + j-8,-2);

                        
                        self.vue.numOfships2=self.vue.numOfships2+1;
                    }else {
                    Vue.set(self.vue.board1, i * 8 + j,0);
                    Vue.set(self.vue.board1, i * 8 + j+9,-2);
                    Vue.set(self.vue.board1, i * 8 + j+7,-2);
                    Vue.set(self.vue.board1, i * 8 + j-1,-2);
                    Vue.set(self.vue.board1, i * 8 + j+1,-2);
                    Vue.set(self.vue.board1, i * 8 + j-8,-2);
                    Vue.set(self.vue.board1, i * 8 + j+16,-2);
                    self.vue.numOfships2=self.vue.numOfships2+1;

                    }
                    
                }else{
                Vue.set(self.vue.board1, i * 8 + j,0);
                }

          self.vue.numOfplays=self.vue.numOfplays+1;
                }
        
        if((self.vue.board1[i * 8 + j]==0)){
        temp=self.vue.board1[i * 8 + j];
        Vue.set(self.vue.board1, i * 8 + j,0);
        }
        
        self.send_state();
        return;
        }
        
        
        self.vue.is_my_turn = false;
        self.send_state();
        // We have already played.
    };


    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            magic_word: "",
            chosen_magic_word: null,
            need_new_magic_word: false,
            my_role: "",
            board: self.null_board,
            board1: self.new_board,
            numOfplays: self.numOfplays,
            numOfships1: self.numOfships1,
            numOfships2: self.numOfships2,
            is_other_present: false,
            is_my_turn: false,
            wait: false,
            newGame: self.newGame
        },
        methods: {
            set_magic_word: self.set_magic_word,
            set_magic_word_again: self.set_magic_word_again,
            play: self.play
        }

    });

    call_server();

    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){
    APP = app();
    APP.initialize();
});
