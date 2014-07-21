/*
 * Simple test of cassandra-db-handler
 */

debugger;
var db = require('./cassandra-db-handler.js');
debugger;
var colors = ['Purple','Gnostic Orange','Petulant Blue','Garish Yellow','Voracious Orange'];
colors.forEach(function(color){
  db.logWord(color); 
});

//dblogWord('Seal Green');
console.log('word logged!');
debugger;
