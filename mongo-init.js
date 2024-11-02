db = db.getSiblingDB('overchain');

db.createCollection("users");

db.users.insertOne({
    username: "admin",
    password: "$2b$10$3hQwn/IR0AXhQYiA7sgKieLIa5AaT4M7P3PXK7.VXJQGpfYik4mrC",
    role: 'admin',
    hints:{
        //This section is for help if you get stuck. If you don’t need help, don’t decode the hints below!
            'hint1':'UmV2aWV3IHRoZSBjb2RlIGFuZCB0cnkgdG8gY2hhaW4gQ1NSRixYU1MsLi4uLi4uIHZ1bG5lcmFiaWxpdGllcy4=',
            'hint2':'S2VlcCBpbiBtaW5kIHRoYXQgeW91J3JlIG9wZXJhdGluZyBpbiBhIERvY2tlciBlbnZpcm9ubWVudCwgc28gbm8gbG9jYWxob3N0Lik',
        }
});

db.users.insertOne({
    username: "user",
    password: "$2b$10$.ws6W/0VU3MxG4XQuRFBY.RY3djT2febJqbGTzNd4KZN.eXlw58Wy",
    role: 'user',
    hints:{
        //This section is for help if you get stuck. If you don’t need help, don’t decode the hints below!
            'hint1':'UmV2aWV3IHRoZSBjb2RlIGFuZCB0cnkgdG8gY2hhaW4gQ1NSRixYU1MsLi4uLi4uIHZ1bG5lcmFiaWxpdGllcy4=',
            'hint2':'S2VlcCBpbiBtaW5kIHRoYXQgeW91J3JlIG9wZXJhdGluZyBpbiBhIERvY2tlciBlbnZpcm9ubWVudCwgc28gbm8gbG9jYWxob3N0Lik',
        }
});