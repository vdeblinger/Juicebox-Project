const { client, getAllUsers, createUser, updateUser, createPost, updatePost, getAllPosts, getPostsByUser, createTags, createPostTag, addTagsToPost, getPostsByTagName } = require('./index');

async function dropTables() {
    try {
    console.log("Starting to drop tables...");

    await client.query(`
        DROP TABLE IF EXISTS "post_tags";
        DROP TABLE IF EXISTS tags;
        DROP TABLE IF EXISTS posts;
        DROP TABLE IF EXISTS users;
    `);

    console.log("Finished dropping tables!");
    } catch (error) {
    console.error("Error dropping tables!");
    throw error;
    }
}

async function createTables() {
    try {
    console.log("Starting to build tables...");

    await client.query(`
        CREATE TABLE users(
            id SERIAL PRIMARY KEY,
            username varchar(255) UNIQUE NOT NULL,
            password varchar(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            location VARCHAR(255) NOT NULL,
            active BOOLEAN DEFAULT true
            );
        CREATE TABLE posts(
            id SERIAL PRIMARY KEY,
            "authorId" INTEGER REFERENCES users(id) NOT NULL,
            title VARCHAR(255) NOT NULL,
            content TEXT NOT NULL,
            active BOOLEAN DEFAULT true
            );
        CREATE TABLE tags(
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) UNIQUE NOT NULL
        );
        CREATE TABLE "post_tags"(
            "postId" INTEGER REFERENCES posts(id),
            "tagId" INTEGER REFERENCES tags(id),
            UNIQUE ("postId", "tagId")
        );
    `);

    console.log("Finished building tables!");
    } catch (error) {
    console.error("Error building tables!");
    throw error;
    }
}

async function createInitialUsers() {
    try {
    console.log("Starting to create users...");

    await createUser({ username: 'albert', password: 'bertie99', name: 'AL Bert', location: 'Sidney, Australia' });
    await createUser({ username: 'sandra', password: '2sandy4me', name: 'Just Sandra', location: 'Aint Telling' });
    await createUser({ username: 'glamgal', password: 'soglam', name: 'Joshua', location: 'Upper East Side' });

    console.log("Finished creating users!");
    } catch(error) {
    console.error("Error creating users!");
    throw error;
    }
}

async function createInitialPosts() {
    try {
    const [albert, sandra, glamgal] = await getAllUsers();
        console.log("users:", sandra)
    await createPost({
        authorId: albert.id,
        title: "First Post",
        content: "This is my first post. I hope I love writing blogs as much as I love writing them.",
        tags: ["#happy", "#youcandoanything"]
    });
    await createPost({
        authorId: sandra.id,
        title: "Look",
        content: "I just want people to notice me, sweet Sandy",
        tags: ["#happy", "worst-day-ever"]
    });
    await createPost({
        authorId: glamgal.id,
        title: "Mom?",
        content: "If you're reading this, don't reveal my secret!",
        tags: ["#happy", "#youcandoanything", "#canmandoeverything"]
    });

    
    } catch (error) {
    throw error;
    }
}
async function createInitialTags() {
    try {
    console.log("Starting to create tags...");

    const [happy, sad, inspo, catman] = await createTags([
        "#happy", 
        "#worst-day-ever", 
        "#youcandoanything",
        "#catmandoeverything"
    ]);
    console.log(createTags)

    const [postOne, postTwo, postThree] = await getAllPosts();
    console.log(getAllPosts)
    await addTagsToPost(postOne.id, [happy, inspo]);
    await addTagsToPost(postTwo.id, [sad, inspo]);
    await addTagsToPost(postThree.id, [happy, catman, inspo]);

    console.log("Finished creating tags!");
    } catch (error) {
    console.log("Error creating tags!");
    throw error;
    }
}

async function getUserById(userId) {
    try {
        const { rows: [user] } = await client.query(`
        SELECT * FROM users
        WHERE id=${userId}
        `);
        return user
    } catch (error) {
        console.log(error)
    }
}



async function rebuildDB() {
    try {
    client.connect();
    await dropTables();
    await createTables();
    await createInitialUsers();
    await createInitialPosts();
    await createInitialTags();
    await testDB();
    // await Promise.all([
    // dropTables,
    // createTables,
    // createInitialUsers,
    // createInitialPosts,
    // createInitialTags,
    // testDB
    // ])
    } catch (error) {
    throw error;
    } finally {client.end()}
}

async function testDB() {
    try {
    console.log("Starting to test database...");

    const users = await getAllUsers();
    console.log("Results:", users);

    console.log("Calling updateUser on users[0]")
    const updateUserResult = await updateUser(users[0].id, {
        name: "ALBERTOOOO",
        location: "Lesterville, KY"
    });
    console.log("results:", updateUserResult)

    console.log ("calling getAllPosts");
    const posts  = await getAllPosts();
    console.log("results:", posts);

    console.log("Calling updatePost on posts[0]", posts[0]);
    const updatePostResult = await updatePost(posts[0].id, {
        title: 'Its raining Men',
        content: 'WOOHOO'
    });
    console.log("results:", updatePostResult);

    console.log("calling new updatePost")
    const updatePostTagsResult = await updatePost(posts[1].id, {
        tags: ["#youcandoanything", "#redfish", "#bluefish"]
    });
    console.log("results", updatePostTagsResult);

    console.log("Calling getUserById with 1");
    const albert = await getUserById(1);
    console.log("results:", albert);

    console.log("calling getPostByTagName");
    const postsWithHappy = await getPostsByTagName("#happy");
    console.log("tag results", postsWithHappy);
    

    console.log("Finished database tests!");
    
    } catch (error) {
    console.error("Error testing database!");
    throw error;
    } 
}


rebuildDB()
    