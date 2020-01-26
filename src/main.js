import {Switch, Route} from 'react-router-dom';
import React from 'react';
import Speech from './Speech';
import App from './App';

const Main = () => (

    <Switch>
        <Route exact path= "/" component = {App} />


       

    </Switch>

)
export default Main;
