/**********
 * Creates Cassandra DB Schema. Assumes coloroftheday keyspace is already created
 * Adam Cahan 7-20-14
 *
 * DRAFT
 * Written cqlsh-style
 **********/

var make_table = function(){
                  return "CREATE TABLE color_table (
                            color_name text,
                            date text,
                            tweet_time timestamp,
                            PRIMARY KEY ((color_name,date),tweet_time)
                          )";
