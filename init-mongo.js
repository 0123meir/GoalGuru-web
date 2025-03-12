db.createUser(
    {
        user: "goal",
        pwd: "guru",
        roles: [
            {
                role: "readWrite",
                db: "data"
            }
        ]
    }
);
db.createCollection("test"); 