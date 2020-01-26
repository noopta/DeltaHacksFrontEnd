'use strict'
import React, { Component } from "react"
import './App.css';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import axios from 'axios';
import {Link} from 'react-router-dom';
import { Grow } from '@material-ui/core';
import Slider from './Slider';

//------------------------SPEECH RECOGNITION-----------------------------

const SpeechRecognition =  window.webkitSpeechRecognition
const recognition = new SpeechRecognition()


recognition.continous = true
recognition.interimResults = true
recognition.lang = 'en-US'

//---------------POPUP---------------//


//------------------------COMPONENT-----------------------------

class Speech extends Component {
    
    

  constructor() {
      
      
    super()
    this.state = {
    mood: '',
    counter : 0,
      numbers: [],
      ah: 0,
      basically: 0,
      like: 0,
      stuff: 0,
      got: 0,
      score: 0,
      listening: false,
      checked: true,
      open: false,
    }
    this.toggleListen = this.toggleListen.bind(this)
    this.handleListen = this.handleListen.bind(this)
  }

  toggleOpen(){
    this.setState({
        open: true,
    })
}

toggleClose(){
    this.setState({
        open: false,
    })
}

  async toggleListen() {
    const prxyURL = "https://cors-anywhere.herokuapp.com/";
   
    
 //       .then(numbers => this.setState({numbers: numbers.message}))
  //      .catch(error => console.log('Error:', error));
    
 //       console.log(this.state.numbers);

    this.setState({
      counter : this.state.counter + 1,
      listening: !this.state.listening
    }, this.handleListen)
  
    if(this.state.counter == 1){
    this.toggleOpen()
    } 
}

 

  async handleListen() {

    console.log('listening?', this.state.listening)
    console.log(this.state.counter)
    if (this.state.listening) {
      recognition.start()
      recognition.onend = () => {
        console.log("...continue listening...")
        recognition.start()
      }

    } else {
      recognition.stop()
      recognition.onend = () => {
        console.log("Stopped listening per click")
       
      }
    }

    recognition.onstart = () => {
      console.log("Listening!")
    }

    let finalTranscript = ''
    recognition.onresult = async event => {
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalTranscript += transcript + ' ';
        else interimTranscript += transcript;
      }
      document.getElementById('interim').innerHTML = interimTranscript
      document.getElementById('final').innerHTML = finalTranscript
      

    //-------------------------COMMANDS------------------------------------

      const transcriptArr = finalTranscript.split(' ')
      const stopCmd = transcriptArr.slice(-3, -1)
      console.log('stopCmd', stopCmd)

      if (stopCmd[0] === 'stop' && stopCmd[1] === 'listening'){
        this.toggleOpen()
        recognition.stop()
        recognition.onend = () => {
          console.log('Stopped listening per command')
          const finalText = transcriptArr.slice(0, -3).join(' ')
          document.getElementById('final').innerHTML = finalText
        }
    }
   const res =  await axios.post(
        `http://shesan.pythonanywhere.com/stats`,
        {
            "speechtext":finalTranscript,
            "keywords": ["basically", "stuff","got", "ah","like"]
        },
      );

      this.setState({
        ah: res.data.keywordcount.ah,
        basically: res.data.keywordcount.basically,
        like: res.data.keywordcount.like,
        got: res.data.keywordcount.got,
        stuff: res.data.keywordcount.stuff,
        mood: res.data.sentimentscore,
      })

      console.log(res);
      
console.log(finalTranscript);
    }

    
  //-----------------------------------------------------------------------
    this.state.finalString = finalTranscript;
    recognition.onerror = event => {
      console.log("Error occurred in recognition: " + event.error)
    }

  }
  

  render() {

    const useStyles = makeStyles(theme => ({
        root: {
          width: 300 + theme.spacing(3) * 2,
        },
        margin: {
          height: theme.spacing(3),
        },
      }));
      

    const IOSSlider = withStyles({
        root: {
          color: '#3880ff',
          height: 2,
          padding: '15px 0',
        },
        thumb: {
          height: 28,
          width: 28,
          backgroundColor: '#fff',
          marginTop: -14,
          marginLeft: -14,
          '&:focus,&:hover,&$active': {
            boxShadow: '0 3px 1px rgba(0,0,0,0.1),0 4px 8px rgba(0,0,0,0.3),0 0 0 1px rgba(0,0,0,0.02)',
            // Reset on touch devices, it doesn't add specificity
          },
        },
        active: {},
        valueLabel: {
          left: 'calc(-50% + 11px)',
          top: -22,
          '& *': {
            background: 'transparent',
            color: '#000',
          },
        },
        track: {
          height: 2,
        },
        rail: {
          height: 2,
          opacity: 0.5,
          backgroundColor: '#bfbfbf',
        },
        mark: {
          backgroundColor: '#bfbfbf',
          height: 8,
          width: 1,
          marginTop: -3,
        },
        markActive: {
          opacity: 1,
          backgroundColor: 'currentColor',
        },
      })(Slider);
    const Transition = React.forwardRef(function Transition(props, ref) {
        return <Slide direction="up" ref={ref} {...props} />;
      });
      
    return (
      <div style={container}>
          <h1 style = {{textAlign:'center', fontSize:'40px', fontFamily:'Oswald'}}>Vocally</h1>
        <button id='microphone-btn' style={button} onClick={this.toggleListen} />
        <p style ={{fontSize: '18px', fontFamily: 'Oswald'}}>Press button to begin</p>
        <div id='interim' style={interim}></div>
        <div id='final' style={final}></div>
     
        <Dialog
        open={this.state.open}
        TransitionComponent={Transition}
        keepMounted
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle id="alert-dialog-slide-title">{"Analysis"}</DialogTitle>
        <hr />
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            Unnecessary words counted:
            <ul>
            <Grow
          in={this.state.checked}
          style={{ transformOrigin: '0 0 0' }}
          {...(this.state.checked ? { timeout: 1000 } : {})}
                >
         
            <Slider word = "Basically" count  = {this.state.basically}/>

            </Grow>
            <Grow
          in={this.state.checked}
          style={{ transformOrigin: '0 0 0' }}
          {...(this.state.checked ? { timeout: 2000 } : {})}
                >
                    <Slider word = "Like" count  = {this.state.like}/>
      {/**  <li>Like: {this.state.like} </li>*/}
            </Grow>
            <Grow
          in={this.state.checked}
          style={{ transformOrigin: '0 0 0' }}
          {...(this.state.checked ? { timeout: 3000 } : {})}
                >
                     <Slider word = "Stuff" count  = {this.state.stuff}/>
         {/**    <li>Ah: {this.state.ah}</li>*/}
            </Grow>
            <Grow
          in={this.state.checked}
          style={{ transformOrigin: '0 0 0' }}
          {...(this.state.checked ? { timeout: 4000 } : {})}
                >
                     <Slider word = "Got" count  = {this.state.got}/>
          {/**    <li>Er: {this.state.er}</li> */}
            </Grow>
            <Grow
          in={this.state.checked}
          style={{ transformOrigin: '0 0 0' }}
          {...(this.state.checked ? { timeout: 5000 } : {})}
                >
               <Slider word = "Ah" count  = {this.state.ah} />
            {/** <li>Uh: {this.state.uh}</li> */}
             </Grow>

            </ul>
            <Grow
          in={this.state.checked}
          style={{ transformOrigin: '0 0 0' }}
          {...(this.state.checked ? { timeout: 6000 } : {})}
                >
            <Button style = {{margin: '2em'}} variant = "outlined" color = "secondary">
                <p style = {{color: 'red', fontSize: '14px'}}> General mood detected to be :  {this.state.mood} </p>
            </Button>
            </Grow>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          
        
          <Button color="primary">
            Finish
          </Button>
    
        </DialogActions>
      </Dialog>

      </div>
    )
  }
}

export default Speech


//-------------------------CSS------------------------------------

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    minHeight: '100vh',
    borderStyle: 'solid',
    borderColor: '#000080',
    width: '100%'
  },
  button: {
    width: '60px',
    height: '60px',
    background: 'red',
    boxShadow: '2px',
    borderRadius: '50%',
    margin: '6em 0 2em 0'
  },
  interim: {
    color: 'gray',
    border: '#ccc 1px solid',
    padding: '1em',
    margin: '1em',
    width: '50%'
  },
  final: {
    color: 'black',
    border: '#ccc 1px solid',
    padding: '1em',
    margin: '1em',
    width: '50%'
  }
}

const { container, button, interim, final } = styles