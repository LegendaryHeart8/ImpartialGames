

const max = Math.max;
const min = Math.min;
const abs = Math.abs;
const floor = Math.floor;
const ceil = Math.ceil;

class Game
{
	constructor(){
	}
	get values(){
		console.warn("Call to abstract class. get values.");
		return [];
	}
	get value(){
		return xorTotal(this.values);
	}
	randomMove(){
		console.warn("Call to abstract class. randomMove().");
	}
	get canMove(){
		let vals = this.values;
		for(let i=0;i<vals.length;i++)
		{
			if(vals[i]>0)
			{
				return true;
			}
		}
		return false;
	}
	gotoValue(ind, val){
		console.warn("Call to abstract class. gotoValue().");
	}
	draw(){
		console.warn("Call to abstract class. Game.draw().");
	}
	clear(){
		console.warn("Call to abstract class. Game.clear().");
	}
}

class Nim extends Game
{
	constructor(heaps){
		super();
		this.heaps = heaps; //integer list, the integer says how many beans there are in a heap
		//UI
		this.tBody=document.getElementById("bodyNim");
		createEmptyTable(this.tBody, maxValue(this.heaps), this.heaps.length);
		this.selCol = -1;
		this.selBeans = 0;//the number of beans selected in a column
		//add
		this.beanCount=document.getElementById("addNimBeans");
		this.addButton=document.getElementById("addNimSubmit");
		this.addButton.addEventListener("click", function(){
			let thisGame = this.thisGame;
			let beans = parseInt(thisGame.beanCount.value);
			thisGame.addHeap(beans);
			
		});
		this.addButton.thisGame = this; //so Nim object accessable in event call
	}
	get values(){
		return this.heaps;
	}
	randomMove(){
		let canChange = [];
		for(let i=0;i<this.heaps.length;i++)
		{
			if(this.heaps[i]>0)
			{
				canChange.push(i);
			}
		}
		let ind = canChange[randInt(0, canChange.length)];
		this.heaps[ind] = randInt(0, this.heaps[ind]);
	}
	gotoValue(ind, beans){
		this.heaps[ind] = beans;
	}
	draw(){
		clearTable(this.tBody);
		drawHeaps(this.tBody, this.heaps, this);
		addNimEvents(this.tBody, this);
	}
	addHeap(beans)
	{
		this.heaps.push(beans);
		createEmptyTable(this.tBody, maxValue(this.heaps), this.heaps.length);
		this.draw();
	}
	clear()
	{
		this.heaps = [];
		createEmptyTable(this.tBody, maxValue(this.heaps), this.heaps.length);
		this.draw();
	}
	deselect()
	{
		changeSelection(this.tBody, -1, 0, this);
	}
}
class Chess extends Game
{
	constructor(){
		super();
		this.pieces = [];//list of objects of Chess Piece
		this.boardSize = 8;
		// UI
		this.canvas=document.getElementById("canvasChess");
		this.canvas.thisGame = this; //so the game is passed onto event listener
		this.canvas.addEventListener('click', this.click);
		this.ctx = this.canvas.getContext('2d');
		//interaction
		this.selected = -1;
		//add
		this.addFig= document.getElementById("addChessFigure")
		this.addX= document.getElementById("addChessX");
		this.addY= document.getElementById("addChessY");
		this.addButton=document.getElementById("addChessSubmit");
		//add all figures as options in selection
		for(const figureProp in figures)
		{
			let opt = document.createElement("option");
			let val = figures[figureProp];
			opt.value = val;
			opt.innerHTML = val;
			this.addFig.appendChild(opt);
		}
		this.addButton.addEventListener("click", function(){
			let thisGame = this.thisGame;
			let x = parseInt(thisGame.addX.value);
			let y = parseInt(thisGame.addY.value);
			thisGame.addPiece(thisGame.addFig.value, x, y);
			
		});
		this.addButton.thisGame = this; //so Nim object accessable in event call
	}
	get values(){
		let valuesArr = Array(this.pieces.length);
		for(let i=0;i<valuesArr.length;i++)
		{
			valuesArr[i]=this.pieces[i].value;
		}
		return valuesArr;
	}
	get canMove(){
		for(let i=0;i<this.pieces.length;i++)
		{
			if(!this.pieces[i].isHome)
			{
				return true;
			}
		}
		return false;
	}
	randomMove(){
		let canChange = [];
		for(let i=0;i<this.pieces.length;i++)
		{
			if(!this.pieces[i].isHome)
			{
				canChange.push(i);
			}
		}
		let ind = randArr(canChange);
		this.pieces[ind].randomMove();
	}
	gotoValue(ind, value){
		this.pieces[ind].moveToValue(value);
	}
	// GUI
	draw(){
		let ctx=this.ctx;
		//draw checkered board
		this.tileSize =this.canvas.width/this.boardSize;
		let tileSize = this.tileSize;
		for(let x=0;x<this.boardSize; x++)
		{
			for(let y=0;y<this.boardSize; y++)
			{
				this.drawTile(x, y, tileColours, tileSize);
			}
		}
		let selKnight = false; //true if a knight has been selected
		if(this.selected != -1) //if selected piece
		{
			//draw selected piece moves
			let ps = this.pieces[this.selected];
			this.drawMoves(ps.figure, ps.x, ps.y);
			selKnight = ps.figure == figures.KNIGHT;
		}
		//draw home
		let homeSize = 1;
		if(selKnight)
		{
			homeSize = 2;
		}
		ctx.strokeStyle = homeColour;
		ctx.lineWidth=4;
		ctx.beginPath();
		ctx.moveTo(tileSize*homeSize, 0);
		ctx.lineTo(tileSize*homeSize, tileSize*homeSize);
		ctx.lineTo(0, tileSize*homeSize);
		ctx.stroke();
		//draw pieces
		for(let i=0;i<this.pieces.length;i++)
		{
			let p = this.pieces[i];
			this.drawPiece(p.figure, p.x, p.y);
		}
	}
	drawPiece(figure, x, y){
		let pieceImg = chessImgs[figure];
		//calculate size of piece
		let targetHeight = this.tileSize*pieceScale;
		let scaleFactor = (targetHeight)/pieceImg.naturalHeight;//scale image such that it takes up pieceScale% of the tile
		let targetWidth = pieceImg.naturalWidth*scaleFactor;
		//calculate position
		let centreX = x*this.tileSize + this.tileSize*0.5 - targetWidth*0.5;
		let centreY = y*this.tileSize + this.tileSize*0.5 - targetHeight*0.5;
		//draw to canvas
		this.ctx.drawImage(pieceImg, centreX, centreY, targetWidth, targetHeight);
	}
	drawMoves(figure, x, y){
		let tileSize = this.tileSize;
		//depends on figure
		switch(figure)
		{
			case figures.ROOK:
				//draw horizontal
				for(let i = 0; i<x; i++)
				{
					this.drawTile(i, y, moveColours, tileSize);
					//this.ctx.fillRect(i*tileSize, y*tileSize, tileSize, tileSize);
				}
				//draw vertical
				for(let i = 0; i<y; i++)
				{
					this.drawTile(x, i, moveColours, tileSize);
					//this.ctx.fillRect(x*tileSize, i*tileSize, tileSize, tileSize);
				}
			break;
			case figures.KNIGHT:
				let potentialMoves = [[x-2, y-1], [x-2, y+1], [x-1, y-2], [x+1, y-2]];
				for(let i=0;i<potentialMoves.length;i++)
				{
					let X = potentialMoves[i][0];
					let Y = potentialMoves[i][1];
					this.drawTile(X, Y, moveColours, tileSize);
				}
			break;
		}
	}
	drawTile(x, y, colours, tileSize){
		this.ctx.fillStyle = colours[(x+y)%2];
		this.ctx.fillRect(x*tileSize, y*tileSize, tileSize, tileSize);
	}
	//interaction
	click(e){
		//in this method when called by the event listener, 'this' refers to the canvas and not the game object. 
		let thisGame = this.thisGame; // use variable thisGame rather than this to refer to the game object
		let mx = e.offsetX;
		let my = e.offsetY;
		
		let tileSize = thisGame.tileSize;
		let gx = ~~(mx/tileSize);
		let gy = ~~(my/tileSize);
		
		//move to position if piece selected
		if(thisGame.selected != -1)
		{
			if(thisGame.pieces[thisGame.selected].canMoveThere(gx, gy)) //if can move to location
			{
				handlePlayerTurn(function(){
					thisGame.pieces[thisGame.selected].move(gx, gy);
					thisGame.selected = -1; //deselect current piece
				});
				return;
			}
		}
		
		//find piece to select
		thisGame.selected = thisGame.selectPiece(gx, gy);
		
		//redraw game
		thisGame.draw();
	}
	selectPiece(gx, gy){
		let samePiece = false; //if the only piece at spot is the same as the piece already selected
		if(this.selected != -1)
		{
			samePiece = this.pieces[this.selected].isHere(gx, gy);
		}
		
		if(samePiece)
		{
			//find next piece at same spot
			for(let i=this.selected+1; i<this.pieces.length;i++)
			{
				if(this.pieces[i].figure != this.pieces[this.selected].figure && this.pieces[i].isHere(gx, gy) && !this.pieces[i].isHome)
				{
					return i;	
				}
			}
			//no next piece, try wrapping around
			/*for(let i=0; i<this.selected;i++)
			{
				if(this.pieces[i].isHere(gx, gy))
				{
					return i;	
				}
			}*/
			//no piece at same spot
			return -1; //deselect piece
		}
		
		for(let i=0; i<this.pieces.length;i++)
		{
			if(this.pieces[i].isHere(gx, gy))
			{
				return i; //found piece
			}
		}
		return -1; // no piece found at spot
	}
	//addition
	addPiece(figure, x, y){
		this.pieces.push(new ChessPiece(figure, x, y));
		this.fitBoard();
		this.draw();
	}
	//resizes the board so that all pieces can be seen
	fitBoard(give=1){
		this.boardSize = 1;
		for(let i=0;i < this.pieces.length; i++)
		{
			this.boardSize = Math.max(this.boardSize, this.pieces[i].spaceNeeded + give)
		}
	}
	clear(){
		this.pieces = [];
		this.boardSize = 8;
		this.selected = -1;
		this.draw();
	}
}
const figures = {ROOK: "Rook", KNIGHT: "Knight"};
class ChessPiece
{
	constructor(figure, x=0, y=0)
	{
		this.figure = figure;
		this.x = x;
		this.y = y;
	}
	get value()
	{
		//depends on figure
		switch(this.figure)
		{
			case figures.ROOK:
				return this.x^this.y;
			case figures.KNIGHT:
				return knightValue(this.x,this.y);
		}
	}
	move(x, y)
	{
		this.x=x;
		this.y=y;
	}
	//returns true when the desired value is achieved. Returns false when it is incapable.
	moveToValue(val)
	{
		//depends on figure
		switch(this.figure)
		{
			case figures.ROOK:
				let yTarget = this.x^val;
				if(this.y>yTarget)
				{
					this.y= yTarget;
					return true;
				}
				let xTarget = this.y^val;
				if(this.x>xTarget)
				{
					this.x= xTarget;
					return true;
				}
				
				return false;
			break;
			case figures.KNIGHT:
				let potentialMoves = [[this.x-2, this.y-1], [this.x-2, this.y+1], [this.x-1, this.y-2], [this.x+1, this.y-2]];
				let validMoves = [];
				for(let i=0; i<potentialMoves.length; i++)
				{
					let X = potentialMoves[i][0];
					let Y = potentialMoves[i][1];
					if(X >= 0 && Y >= 0)//check if move is within bounds
					{
						if(knightValue(X, Y) == val)
						{
							validMoves.push(i);
						}
					}
				}
				if(validMoves.length <= 0)
				{
					return false;
				}
				let move = potentialMoves[randArr(validMoves)];
				this.x = move[0];
				this.y = move[1];
				return true;
		}
	}
	randomMove()
	{
		//dpeneds on figure
		switch(this.figure)
		{
			case figures.ROOK:
				let changeY = false;//set to move in x by default
				if(this.y!=0)//if can move in y
				{
					changeY = randBool(); //randomly pick between moving vertically or horizontally
				}
				if(changeY)
				{
					this.y=randInt(0, this.y);
				}
				else
				{
					this.x=randInt(0, this.x);
				}
			break;
			case figures.KNIGHT:
				let potentialMoves = [[this.x-2, this.y-1], [this.x-2, this.y+1], [this.x-1, this.y-2], [this.x+1, this.y-2]];
				let validMoves = [];
				for(let i=0; i<potentialMoves.length; i++)
				{
					if(potentialMoves[i][0] >= 0 && potentialMoves[i][1] >= 0)//check if move is within bounds
					{
						validMoves.push(i);
					}
				}
				let move = potentialMoves[randArr(validMoves)];
				this.x = move[0];
				this.y = move[1];
			break;
		}
	}
	canMoveThere(x, y)
	{
		//depends on figure
		switch(this.figure)
		{
			case figures.ROOK:
				if(x==this.x && y < this.y) // vertical moves
				{
					return true;
				}
				if(x<this.x && y==this.y) // horizontal moves
				{
					return true;
				}
				return false;
			case figures.KNIGHT:
				let nums1 = 0;
				let nums2 = 0;
				let dx = x-this.x;
				let dy = y-this.y;
				
				if(abs(dx) == 1)nums1+=1;
				if(abs(dy) == 1)nums1+=1;
				
				if(dx == -2)nums2+=1;
				if(dy == -2)nums2+=1;
				
				return nums1 == 1 && nums2 ==1;
		}
	}
	//returns if the chess piece can move or not. True if the piece can't move. False if the piece can move. 
	get isHome()
	{
		//depends on figure
		switch(this.figure)
		{
			case figures.KNIGHT:
				if(this.x<2 && this.y<2)
				{
					return true;
				}
				return false;
			default:
				if(this.x<1 && this.y<1)
				{
					return true;
				}
				return false;
		}
	}
	isHere(x, y)
	{
		return this.x==x && this.y==y;
	}
	//the space needed so that piece can be seen now and how many moves later
	get spaceNeeded(){
		//depends on figure
		switch(this.figure){
			case figures.ROOK:
				return max(this.x, this.y)+1;
			break;
			case figures.KNIGHT:
				let xSpace = this.x + (this.y >> 1);
				let ySpace = this.y + (this.x >> 1);
				return max(xSpace, ySpace)+1;
			break;
			default:
				return max(this.x, this.y)+1;
			break;
		}
	}
}

const knightValuesStart = [
	[0, 0, 1, 1, 0],
	[0, 0, 1, 1, 0],
	[1, 2, 2, 2, 3],
	[1, 1, 2, 1, 4],
	[0, 0, 3, 4, 0]
];
const repeating1 = [0, 0, 1, 1];
const repeating2 = [3, 2, 2, 2];
const repeating3 = [3, 3, 2, 3];
function knightValue(x,y)
{
	let k = min(x >> 2, y >> 2) << 2; //x >> 2 means integer divide x by 4
	let X = x-k;
	let Y = y-k;
	let rx = max(X, Y);
	let ry = min(X, Y); // guaratanteed to be < 4
	
	if(rx <= 4)
	{
		return knightValuesStart[rx][ry];
	}
	else if (ry <= 1)
	{
		return repeating1[rx % 4];
	}
	else if (ry == 2)
	{
		return repeating2[rx % 4];
	}
	else
	{
		return repeating3[rx % 4];
	}
}

//Math ops
//random
function randInt(lower, upper)
{
	return Math.floor(Math.random() * (upper-lower)) + lower;
}
function randArr(arr)
{
	return arr[randInt(0, arr.length)];
}
//returns true or false with 50-50 chance
function randBool()
{
	return randInt(0, 2) == 0;
}
function xorTotal(arr)
{
	let total = 0;
	for(let i=0;i<arr.length;i++)
	{
		total = arr[i] ^ total;
	}
	return total;
}
function xorTotalGames()
{
	let total = 0;
	for(let i=0;i<games.length;i++)
	{
		total ^= games[i].value;
	}
	return total;
}
function maxValue(arr)
{
	return Math.max(...arr);
}
//integer division a and b
function div(a,b)
{
	return ~~(a/b);
}
//html objects
var turnShow;
var addSelection;
var addGames;

var games = [];
var turn = 0; //0=player, 1=AI
const AIwait = 500; //in ms

//UI variables 
const addOptions = ["Nim", "Wythoff's Chess"];
//Chess UI variables
const tileColours = ["white", "#161619"];
const moveColours = ["khaki", "yellow"];
const homeColour = "green";
var chessImgs={};
const pieceScale = 0.8;


function pageload()
{
	//load assets
	chessImgs[figures.ROOK] = new Image(550, 643);
	chessImgs[figures.ROOK].src="Assets/white-rook.png";
	chessImgs[figures.KNIGHT] = new Image(550, 643);
	chessImgs[figures.KNIGHT].src="Assets/white-knight.png";
	//get html objects
	turnShow = document.getElementById("turnShow");
	addSelection = document.getElementById("addSelection");
	addGames = document.getElementById("addGames");
	
	//generate options for addSelection
	for(let i=0;i<addOptions.length;i++)
	{
		let opt = document.createElement("option");
		let label = addOptions[i];
		opt.value = i+"";
		opt.innerHTML = label;
		addSelection.appendChild(opt);
	}
	//create games
	games = [new Nim([]), new Chess()];
	//draw games
	drawGames();
	drawMoves();
	addSelectInput();
}

function clearGames()
{
	turn = 0;
	for(let i=0;i<games.length;i++)
	{
		games[i].clear();
	}
	drawMoves();
}

//AI 
//returns true for successful move, false for failure
function AIMove()
{
	
	let total = xorTotalGames();
	if(total != 0)
	{
		//game is fuzzy and the AI will win
		let possibleMoves = [];
		for(let i=0;i<games.length;i++)
		{
			let values = games[i].values;
			for(let j=0;j<values.length;j++)
			{
				let without = values[j] ^ total; //calculate total without
				if(without < values[j]) //if can force player into zero game
				{
					possibleMoves.push({"game": i, "ind":j, "toValue": without});
				}
			}
		}
		let move = randArr(possibleMoves); // the move the AI is going to make
		games[move.game].gotoValue(move.ind, move.toValue);
		return true;
	}
	else
	{
		//game is zero and the AI has no optimal move at the moment
		let canMove = [];//list of all games the AI can play on
		for(let i=0;i<games.length;i++)
		{
			if(games[i].canMove)
			{
				canMove.push(i);
			}
		}
		if(canMove.length <= 0) //if the AI can't make a valid play
		{
			return false; //failure to play
		}
		let toMove = randArr(canMove); //the game to move on
		games[toMove].randomMove();
		return true;
	}
	
	//return possibleMoves[randint(0, possibleMoves.length)];
}


//UI

function drawGames()
{
	games.forEach(function(g){
		g.draw();
	});
}
function drawMoves()
{
	//update move view
	for(let i=0;i<turnShow.children.length;i++)
	{
		turnShow.children[i].style.display = "none";
	}
	turnShow.children[turn].style.display = "block";
}

function handlePlayerTurn(doMoveFunc)
{
	if(turn == 0)
	{
		doMoveFunc();
		turn=1;
		drawGames();
		drawMoves();
		
		//prepare AI to make move
		setTimeout(function(){
			let success = AIMove();
			if(success)
			{
				turn=0;
			}
			drawGames();
			drawMoves();
			if(!success)
			{
				alert("You win :)! The AI has no more moves avaliable.");
			}
		},AIwait);
	}
}
function addSelectInput()
{
	//hide all add games
	for(let i=0;i<addGames.children.length;i++)
	{
		addGames.children[i].style.display = "none";
	}
	addGames.children[parseInt(addSelection.value)].style.display = "block";
}


//NIM UI
/*
	tBody: table body element to draw heaps onto
	h: an int array with each int representing size of heap
*/
function drawHeaps(tBody, h, gameObj){
	for(let i=0; i<h.length; i++) //iterate through each column of the table
	{
		drawHeap(tBody, h[i], i, gameObj); //draws a heap in one column of the table
	}
}
function drawHeap(tBody, size, col, gameObj)
{
	for(let i=0; i < size; i++)
	{
		let row = tBody.children.length - i - 1;
		let heapSize = i;
		let div = tBody.children[row].children[col].children[0]; //this div is one of the beans in a heap
		//set class of div
		if(i >= size-gameObj.selBeans && col == gameObj.selCol) //if selected
		{
			div.className = "selBean"; 
		}
		else
		{
			div.className = "bean"; 
		}
		let column = col;
		
	}
}
function createEmptyTable(tBody, rows, columns)
{
	//remove all previously before rows
	while (tBody.firstChild) {
		tBody.removeChild(tBody.lastChild);
	}
	//add new rows
	for(let i=0; i<rows; i++)
	{
		let row = document.createElement("tr");
		//create column
		for(let j=0; j<columns; j++)
		{
			let data = document.createElement("td");
			let div = createSquare("empty");
			data.appendChild(div); //add empty block
			row.appendChild(data); //add data to row
		}
		//append row to body
		tBody.appendChild(row);
	}
}
function addNimEvents(tBody, gameObj)
{
	for(let row=0;row<tBody.children.length; row++) //iterate through each row 
	{
		for(let col=0; col<tBody.children[row].children.length; col++) //iterate through each column of the table
		{
			let heapSize = tBody.children.length-row-1; //the new heap size after removing beans
			let selected = gameObj.heaps[col] - heapSize; //the number of beans selected in the heap to be removed from the heap
			let div = tBody.children[row].children[col];
			div.addEventListener("click", function(){
				if(heapSize < gameObj.heaps[col]){
					handlePlayerTurn(function(){
						gameObj.heaps[col] = heapSize;
					});
				}
			});
			div.addEventListener("mouseover", function(){
				changeSelection(tBody, col, selected, gameObj);
			});
		}
	}
}
function changeSelection(tBody, newSel, newBeans, gameObj)
{
	let preSel = gameObj.selCol;
	gameObj.selCol = newSel;
	gameObj.selBeans = newBeans;
	drawHeap(tBody, gameObj.heaps[preSel], preSel, gameObj); //deselect the old heap
	drawHeap(tBody, gameObj.heaps[newSel], newSel, gameObj); //select the new heap
}
function clearTable(tBody)
{
	for(let i=0; i<tBody.children.length; i++)
	{
		let row = tBody.children[i];
		for(let j=0; j<row.children.length; j++)
		{
			let data = row.children[j];
			if (data.firstChild.className != "empty")
			{
				data.removeChild(data.children[0]); //remove existing child
				data.appendChild(createSquare("empty")); //add empty block
			}
		}
	}
}
function updateTable()
{
	clearTable(gameBody);
	drawHeaps(gameBody, heaps);
}
function createSquare(squareClass)
{
	let div = document.createElement("div"); //create div
	div.className = squareClass; //set class of div
	
	return div;
}

