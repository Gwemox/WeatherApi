#!/bin/bash
CMD='rs.initiate( {
   _id : "MySecureData",
   members: [
      { _id: 0, host: "mongo_1:27017", priority: 1 },
      { _id: 1, host: "mongo_2:27017", priority: 0.1 },
      { _id: 2, host: "mongo_3:27017", priority: 0.1 }
   ]
})'

echo $CMD | mongo --host mongo_1