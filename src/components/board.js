import { hasSelectionSupport } from "@testing-library/user-event/dist/utils";
import React from "react";
import '../board.css'


function insessionstore(){
    return sessionStorage.getItem('size')?Number(sessionStorage.getItem('size')):9
}



export default class Board extends React.Component{

    constructor(props){
        super(props)
        

        this.state={
            squares:Array(insessionstore()).fill('').map(row => new Array(insessionstore()).fill(''))
            , size:insessionstore(),
            paused:false,
            solving:false
            
            
        }



        
    }

    componentDidMount() {
        if (this.state.size ==6) {
          document.getElementById("gameboard").classList.add("six");
        } else if (this.state.size ==9) {
          document.getElementById("gameboard").classList.add("nine");
        }
      }

   
    pause = () => {
        this.setState({ paused: true });
        document.getElementById('solve').disabled=false;
    }

    handleChange =(row,column,e) =>{


        
        let squares=this.state.squares.slice()

        if (!e.target.value.match(/^\d$/) || e.target.value=='0' || e.target.value>this.state.size){
            e.target.value=''
        }

        if(!this.issafe(squares,row,column,e.target.value))
        {
            let a=parseInt(e.target.value)+1
            while(!this.issafe(squares,row,column,a) && a<this.state.size+1)
                a+=1
                
            
            if(a==this.state.size+1) a=''
            e.target.value=a
        }

        squares[row][column] = e.target.value
        this.setState({
            squares:squares
        })
        
        
        console.log(this.state.squares)

    }

   


    issafe(squares,row,col,num){


        for(let x =0;x<this.state.size;x++)
            if (squares[row][x]==num)
                return false

        for(let x = 0; x<this.state.size;x++)
            if(squares[x][col]==num)
                return false

        
        let n=3
        let startRow =row -row%3;
        let startCol=col -col%3;

        if(this.state.size==6){
            startRow=row - row%2;
            n=2;
        }

        
        
        for(let i=0;i<n;i++)
            for(let j=0;j<3;j++)
                if( squares[i+startRow][j+startCol]==num)
                    return false;


        
        return true;



    }

    
    
    async solvesudoku(squares,row,col){

        

        if (row==this.state.size-1 && col==this.state.size)
            {
                 return true;
            }

        if(col==this.state.size){
            row++;
            col=0;
        }
        
        

        if(squares[row][col]!=''){
            return await this.solvesudoku(squares,row,col+1);
        }
        
        while (this.state.paused) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        for(let num=1;num<=this.state.size;num++)
        {
            
            
            if( this.issafe(squares,row,col,num))
            {

                squares[row][col]=num

                //

                document.getElementById("gameboard").rows[row].cells[col].children[0].value=num

            await new Promise(resolve => setTimeout(resolve, 20)); // add a delay of 20ms before moving on to the next iteration
            if( await this.solvesudoku(squares,row,col+1)) {
                return true;
            }
                
                


            }

            squares[row][col]=''

            //
            
            document.getElementById("gameboard").rows[row].cells[col].children[0].value=''
            await new Promise(resolve => setTimeout(resolve, 20));


        }

        return false;
 
        
    }
    


    solve(){

        if(this.state.solving){
            this.setState({ paused: false ,solving:true});
            return
        }
        
        let squares=this.state.squares.slice()
        console.log(squares)

        const sqs=document.getElementsByClassName("square");

        for(let i=0;i<sqs.length;i++)
            sqs[i].disabled=true

        document.getElementById('solve').disabled=true;
       

        this.setState({ paused: false ,solving:true});
        
        this.solvesudoku(squares,0,0).then(
            ()=>{
                this.setState({ paused: false ,solving:false});
                document.getElementById('solve').disabled=false;

            }
        )
        
        //

        console.log(this.state.squares)
        

        
                

    }

    clear(){

        sessionStorage.setItem("size",this.state.size);
        window.location.reload(false)
        /*
        const sqs=document.getElementsByClassName("square");

        for(let i=0;i<sqs.length;i++)
            sqs[i].disabled=false

        let squares=this.state.squares.slice()

        for(let i=0;i<this.state.size;i++)
            for(let j=0;j<this.state.size;j++)
            {
                squares[i][j]=''
                document.getElementById("gameboard").rows[i].cells[j].children[0].value=''

            }

        this.setState({
            squares:squares
        })

        console.log("cleared "+this.state.squares)
        */

        
    }

    nine(){


        if(this.state.size==6)
        {

        if(this.state.solving){sessionStorage.setItem('size',9);window.location.reload(false)}

        this.setState({
            squares:Array(9).fill('').map(row => new Array(9).fill('')),
            size:9,
            paused:false,
            solving:false
        })

        const sqs=document.getElementsByClassName("square");

        for(let i=0;i<sqs.length;i++)
            {sqs[i].disabled=false;
            sqs[i].value=''}

        document.getElementById("gameboard").className="nine"

        document.getElementById("six").className="sudobtn"
        document.getElementById("nine").className="sudobtn focus"

        }
    }

    six(){
        if(this.state.size==9){

        if(this.state.solving){sessionStorage.setItem('size',6);window.location.reload(false)}
        this.setState({
            squares:Array(6).fill('').map(row => new Array(6).fill('')),
            size:6,
            paused:false,
            solving:false
        })

        const sqs=document.getElementsByClassName("square");

        for(let i=0;i<sqs.length;i++)
            {   sqs[i].disabled=false;
                sqs[i].value=''
            }

            document.getElementById("gameboard").className="six"

            document.getElementById("nine").className="sudobtn"
            document.getElementById("six").className="sudobtn focus"

        }

    }

    

    render()
    {
    return(
    <div className="Game">

        <h1 id="heading">Sudoku Solver!</h1>
        <div id="sizebtns">
       <button type="button" onClick={()=>this.nine()} className="sudobtn focus" id="nine">9x9</button>
       <button type="button" onClick={()=>this.six()} className="sudobtn" id="six">6x6</button>
       </div>

        
       
       <table id="gameboard" className="">
                <tbody>
                    {this.state.squares.map((row,rowIndex) => (
                        <tr key={rowIndex}>
                            {row.map((column,columnIndex)=>(
                                <td key={columnIndex}>
                                    <input type="number" onChange={e=>this.handleChange(rowIndex,columnIndex,e)} className="square" min="1" max={this.state.size} defaultValue=""/>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
        </table>
       <div id="btns">
        
       <button type="button" onClick={()=>this.solve()} className="sudobtn" id="solve">Solve</button>
       
       <button type="button" className="sudobtn" onClick={()=>this.pause()}>Stop</button>
       
       <button type="button" onClick={()=>this.clear()} className="sudobtn">Clear</button>
       
       
       </div>

       </div>

       
    )
    }
    
}