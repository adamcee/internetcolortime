/*
 * main.js
 */
import React from 'react';
import ReactDOM from 'react-dom';
import { View, Text, Image, StyleSheet } from 'react-primitives';

console.log("Hello world!");

class Foo extends React.Component {
    render() {
        return (<div>Foo</div>);
        //return (
            //<View style={styles.foo}>
                //{this.props.children}
            //</View>
        //);
    }
}

const styles = StyleSheet.create({
    foo: {
        width: 100,
            height: 100,
            backgroundColor: '#ff00ff',
    },
});

// noinspection UnterminatedStatementJS
const mountPoint = document.getElementById('root');
// noinspection UnterminatedStatementJS
ReactDOM.render(<div><Foo /></div>, mountPoint);
