let board

class BoardTools{
    getRandom(min, max){
        min = Math.ceil(min)
        max = Math.floor(max)
        return Math.floor(Math.random() * (max - min) + min)
    }
    randomPoint(){
        let x = this.getRandom(0, this.height - 1)
        let y = this.getRandom(0, this.width - 1)
        
        let pointField = document.getElementById(`x${x}y${y}`)
        
        while (pointField.classList.contains('head') || pointField.classList.contains('body')){
            x = this.getRandom(0, this.height - 1)
            y = this.getRandom(0, this.width - 1)    
            pointField = document.getElementById(`x${x}y${y}`)
        }
        pointField.classList.add('point')
    }

    createBorderElement(){
        const border = document.createElement('div')
        border.className = 'border'
        this.DOM.appendChild(border)
    }

    generateDOMBoard(){
        this.DOM.innerHTML = ''

        for (let i = 0; i < this.width + 2; i++)
            this.createBorderElement()

        for (let i in this.fields)
            for (let j in this.fields[i]){
                if (j == 0) 
                    this.createBorderElement()
                
                const field = document.createElement('div')
                    field.id = `x${i}y${j}`
                    field.className = 'field'
                this.DOM.appendChild(field)

                if (j == this.fields[i].length - 1) 
                    this.createBorderElement()
            }
            
        for (let i = 0; i < this.width + 2; i++)
            this.createBorderElement()               
    }

}
class Snake extends BoardTools{
    constructor(height,width){
        super()
        this.setDefault(height, width)
        
        const board = document.getElementById('board')

        this.moveInterval    //dorobić

        //buttons
        board.addEventListener('keydown', (e) => {
            console.log(e.key)
            if (this.isAlreadyPlay){
                e.preventDefault()

                this.intervalTime = 100
                switch(e.key){
                    case this.controls[0]:
                        this.snakeMove(0)
                        break
                    case this.controls[1]:
                        this.snakeMove(1)
                        break
                    case this.controls[2]:
                        this.snakeMove(2)
                        break
                    case this.controls[3]:
                        this.snakeMove(3)
                        break
                    default:
                        console.log("Pozdrawiam cieplutko")
                        break
                }  
            }else{
                clearInterval(this.moveInterval)
            }
        })

        //swipes
        this.xTouchStart = null
        this.yTouchStart = null

        board.addEventListener('touchstart', (event) => {
            const firstTouch = event.changedTouches[0]
            this.xTouchStart = firstTouch.screenX
            this.yTouchStart = firstTouch.screenY
        })
        board.addEventListener('touchmove', (e) => {
            e.preventDefault()
        })

        board.addEventListener('touchend', (event) => {
            let xTouchEnd = event.changedTouches[0].screenX,
                yTouchEnd = event.changedTouches[0].screenY
            this.intervalTime = 200
            if (this.isAlreadyPlay)
                if (Math.abs(xTouchEnd - this.xTouchStart) > Math.abs(yTouchEnd - this.yTouchStart)) {
                    if (xTouchEnd > this.xTouchStart)
                        this.snakeMove(1)
                    else if (xTouchEnd < this.xTouchStart)
                        this.snakeMove(3)
                }else{
                    if (yTouchEnd > this.yTouchStart)
                        this.snakeMove(2)
                    else if(yTouchEnd < this.yTouchStart)
                        this.snakeMove(0)
                }
            else
                clearInterval(this.moveInterval)
        })
    }

    setDefault(height, width){
        this.isAlreadyPlay = true
        this.skin = ''
        this.lastMove = 0
        
        this.height = height
        this.width = width
        
        this.bodyArr = []
        this.length = 0

        this.head = {
            x: Math.floor(this.height/2),
            y: Math.floor(this.width/2),
            direction: 0,                   // 0 - up ; 1 - right ; 2 - bottom ; 3 - left 
            type: 'body'
        }

        let tmpHead = document.getElementById(`x${this.head.x}y${this.head.y}`)

        tmpHead.classList.add('head')

        this.bodyPosition = []
        this.bodyPosition.push(this.head)

        for (let i = 0; i < this.height; i++){
            let tmpCols = []
            for (let j = 0; j < this.width; j++)
                tmpCols.push(0)
            this.bodyArr.push(tmpCols)
        }

        //default controls buttons
        this.controls = [
            'ArrowUp',
            'ArrowRight',
            'ArrowDown',
            'ArrowLeft',
        ]

    }

    getProperGFX(moveBefore, move){
        let tmpUrl = ''
        
        if (moveBefore != move){
            switch (move){
                case moveBefore - 2:
                case moveBefore + 2:
                    this.endGame()
                    break;
                case moveBefore - 1:
                    
                    break;
                case moveBefore + 1:
                    break;

                default:

                    break;
            }
        } return move;
    }

    isOppositeDirection(move){
        return this.bodyPosition.length > 1 ? this.oppositeDirection(move) == this.lastMove : false
    }
    oppositeDirection(move){
        return move < 2 ? move + 2 : move - 2
    }
    isHeadContainedInBody(){
        const head = document.getElementById(`x${this.head.x}y${this.head.y}`)
        if (head.classList.contains('body'))
            return true
        return false
    }

    snakeMovement(move){
        try{
            this.bodyPositionMovement(move)
            this.headMove(move)
            if (this.isHeadContainedInBody())
                throw TypeError
        }catch{
            // clearInterval(this.moveInterval)
            this.endGame()
            console.log('no i nje dziala')
        }
    }

    snakeMove(move){
        try {
            if (!this.isOppositeDirection(move)){
                clearInterval(this.moveInterval)
                if (this.lastMove != move){
                    this.head.type = 'curve'
                    this.head.side = this.checkDirection(this.lastMove, move)
                    console.log(this.head.side)
                }
                this.snakeMovement(move)
                if (this.lastMove != move){
                    this.head.type = 'body'
                    delete this.head.side
                }
                this.lastMove = move
                this.moveInterval = setInterval(() => {
                    this.head.type = 'body'
                    this.snakeMovement(move)
                }, this.intervalTime);
            }
        } catch {
            this.endGame()
            console.log("No to teraz zadzialaj")
        }
    }

    bodyPositionMovement(move){
        let previousType = ''
        for (let i = this.bodyPosition.length - 1; i > 0; i--){
            if (i == this.bodyPosition.length-1){
                const actualBodyElement = document.getElementById(`x${this.bodyPosition[i].x}y${this.bodyPosition[i].y}`)
                actualBodyElement.classList.remove('body')
                actualBodyElement.removeAttribute('style')
                actualBodyElement.removeAttribute('orientation')
            }
            previousType = this.bodyPosition[i-1].type
            this.bodyPosition[i] = {
                x: this.bodyPosition[i-1].x,
                y: this.bodyPosition[i-1].y,
                direction: this.bodyPosition[i-1].direction,
                type : i == this.bodyPosition.length-1 ? 'tail' : this.bodyPosition[i-1].type,
                side : this.bodyPosition[i-1].side, 
            }
            if ( i == 1 && this.lastMove != move){
                if (move - this.lastMove == 1 || move - this.lastMove == -3){
                    this.bodyPosition[i].direction = this.bodyPosition[i-1].direction == 0 ? 3 : this.bodyPosition[i-1].direction - 1
                    if (this.bodyPosition[i].type == 'tail')
                        this.bodyPosition[i].direction = this.oppositeDirection(this.bodyPosition[i].direction )
                }
                else if (this.bodyPosition[i].type == 'tail')
                    this.bodyPosition[i].direction = this.bodyPosition[i-1].direction == 0 ? 3 : this.bodyPosition[i - 1].direction - 1
            }
            if (this.bodyPosition[i].type == 'tail' && i > 1 && previousType == 'curve'){
                if (this.bodyPosition[i-2].direction - this.bodyPosition[i].direction == -1 || this.bodyPosition[i-2].direction - this.bodyPosition[i].direction == 3){
                    this.bodyPosition[i].direction = this.bodyPosition[i-1].direction == 0 ? 3 : this.bodyPosition[i - 1].direction - 1
                }
                else
                    this.bodyPosition[i].direction = this.oppositeDirection( this.bodyPosition[i-1].direction )
                
                if (this.oppositeDirection(this.bodyPosition[i-1].direction) == this.bodyPosition[i-2].direction && this.bodyPosition[i].side == 'left') {
                    // console.log("XOXOXOXOXOXOXOXOXOXOXO ", previousType, i)
                    this.bodyPosition[i].direction = this.getDirection(this.bodyPosition[i].direction, 1)
                }
            }

            const actualBodyElement = document.getElementById(`x${this.bodyPosition[i].x}y${this.bodyPosition[i].y}`)
            actualBodyElement.classList.add('body')
            actualBodyElement.style.backgroundImage = `url(gfx/${this.getGFX(this.bodyPosition[i].type, this.bodyPosition[i].direction)})`
            actualBodyElement.setAttribute('orientation', this.bodyPosition[i].direction % 2 == 0 ? 'v' : 'h')
        }
    }
    checkDirection( dir1, dir2 ){
        dir1 %= 4; dir2 %= 4;
        let output = '',
            directions = {
                left: this.getDirection(dir1, 1),
                right: this.getDirection(dir1, -1),
                opposite: this.oppositeDirection(dir1)
            } 
        switch (dir2){
            case directions.left: output = 'right'; break;
            case directions.right: output = 'left'; break;
            case directions.opposite: output = 'opposite'; break;
            default: output = 'normal' ; break;
        }
        return output;
    }

    getDirection(direction, move){
        move %= 4
        if (move > 0)
            return direction + move > 3 ? 0 : direction + move
        else 
            return direction + move < 0 ? direction + move + 4 : direction + move
    }

    getGFX(type, direction ){
        let tmpFileName = ''
        switch (type){
            case 'curve':
                tmpFileName = `${this.skin}curve${direction}.png`
                break;
            case 'body':
                tmpFileName = `${this.skin}body${direction}.png`
                break;
            case 'tail':
                tmpFileName = `${this.skin}tail${direction}.png`
                break;
            case 'head':
                tmpFileName = `${this.skin}head${direction}.png`
                break;
            default:
                tmpFileName = "x"
                break;
        }
        return tmpFileName
    }

    endGame(){
        this.isAlreadyPlay = false
        clearInterval(this.moveInterval) 
        setTimeout(()=>{ clearInterval(this.moveInterval) }, 150) // additional security

        document.getElementById('endGame').style.display = 'block'
    }

    headMove(move){
        let headID = `x${this.head.x}y${this.head.y}`
        // try{
            let head = document.getElementById(headID) 
            if (this.bodyPosition.length == 1) head.removeAttribute('style')
            switch(move){
                case 0:
                    head.classList.remove('head')
                    this.head.x--
                    this.head.direction = 0
                    head = document.getElementById(`x${this.head.x}y${this.head.y}`)
                    head.classList.add('head')
                    break
                case 1:
                    head.classList.remove('head')
                    this.head.y++
                    this.head.direction = 1
                    head = document.getElementById(`x${this.head.x}y${this.head.y}`)
                    head.classList.add('head')
                    break
                case 2:
                    head.classList.remove('head')
                    this.head.x++
                    this.head.direction = 2
                    head = document.getElementById(`x${this.head.x}y${this.head.y}`)
                    head.classList.add('head')
                    break
                case 3:
                    head.classList.remove('head')
                    this.head.y--
                    this.head.direction = 3
                    head = document.getElementById(`x${this.head.x}y${this.head.y}`)
                    head.classList.add('head')
                    break      
            }
            try {
                console.log( this.getGFX('head',move))
                head.style.background = `url(gfx/${this.getGFX('head', move)})`
            } catch {
                console.log('kurce')
            }

            if (head.classList.contains('point')){
                this.newBodyElement(this.head.x, this.head.y)
                console.table(this.bodyPosition)
                head.classList.remove('point')
            }
        // } catch {
        //     // clearInterval(this.moveInterval)
        //     this.endGame()
        //     console.log('cos sie cos sie popsulo')
        // }
    }
    // for multiplayer/changing keys
    setKeys(keyArr)
        { this.controls = keyArr }
    setUp( key )     
        { this.controls[0] = key }
    setRight( key )  
        { this.controls[1] = key }
    setBottom( key ) 
        { this.controls[2] = key }
    setLeft( key )   
        { this.controls[3] = key }
    
    newBodyElement(x,y){
        let element = {
            x: x,
            y: y,
            direction: -1
        }
        let elementID = `x${x}y${y}`
        console.log(elementID)
        this.bodyPosition.push(element)
        super.randomPoint()
    }
}

class Board extends BoardTools{
    constructor(height, width){
        super()
        this.height = height
        this.width = width
        this.DOM = document.getElementById('board')
        this.fields = []

        for (let i = 0; i < this.height; i++){
            let tmpCols = []
            for (let j = 0; j < this.width; j++)
                tmpCols.push(0)
            this.fields.push(tmpCols)
        }

        let tmpGridValue = 'grid-template-columns:'

        for (let i = 0; i < width+2; i++)
            tmpGridValue += ' auto' 
        this.DOM.setAttribute('style', tmpGridValue)

        this.generateDOMBoard()

        this.snake = new Snake(this.height, this.width)
        this.snake.randomPoint()

    }
}

window.addEventListener('DOMContentLoaded', (event) =>{
    board = new Board(15,15)
    
    replay = document.getElementById('replay')
    
    endGameDiv = document.getElementById('endGame')

    replay.addEventListener('click', function(){
        delete board.snake
        endGameDiv.style.display = ''
        // board = ''
        board = new Board(15,15)

    })
    console.table(board.fields)
})