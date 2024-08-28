// const mongoose = require("mongoose");

// const FindPost = (Posts,Comments) => async(req,res) => {
//     const {userId,seenPosts} = req.body;
//     const userID = new mongoose.mongo.ObjectId(userId);

//     const CommentsPost = await Comments.find({user_id:userID})
//     // קבל את כל הפוסטים שהמשתמש עדיין לא ראה ולא היה בהם אינטרקציה
//     const unseenPosts = await Posts.find({ 
//         $and: [
//         { '_id': { $nin: seenPosts.map(postId => new mongoose.mongo.ObjectId(postId)) } },
//         { 'likes': { $nin: [userID] } },
//         { 'comments': { $nin: CommentsPost } },
//         { 'saved': { $nin: [userID] } }
//         ]
//     }).limit(4).populate('author') .sort({ createdAt: -1 }).populate('likes') .populate({
//         path: 'comments',
//         options: { sort: { createdAt: -1 } }, // Sort comments from newest to oldest
//         populate: [
          
//             { path: 'user_id', model: 'Users' }, // Populate user details for each comment
//             { path: 'likes', model: 'Users' } // Populate likes for each comment
//         ],
//         perDocumentLimit:15 // Limit comments to 5 per document
//     })
//     // הצג את הפוסטים שהמשתמש טרם ראה
//     res.json(unseenPosts)
// }

// module.exports = FindPost;
// const mongoose = require("mongoose");

// const FindPost = (Posts, Comments) => async (req, res) => {
//     const { userId, seenPosts } = req.body;
//     const userID = new mongoose.mongo.ObjectId(userId);

//       // Update views for seen posts if viewLong is true
//     // for (const seenPost of seenPosts) {
//     //     const postId = seenPost.id;
//     //     const viewLong = seenPost.viewLong;

//     //     // Proceed only if viewLong is true
//     //     if (viewLong) {
//     //         const post = await Posts.findById(postId);

//     //         if (post) {
//     //             // Find if the user has viewed the post before
//     //             const userViewData = post.views.find(view => view.user.equals(userID));

//     //             // Increment the view count if the user hasn't exceeded 3 views
//     //             if (userViewData && userViewData.count < 3) {
//     //                 console.log('add more one view ',seenPost)
//     //                 userViewData.count += 1;
//     //                 post.totalViews += 1;
//     //                 await post.save();
//     //             } else if (!userViewData) {
//     //                 // If the user hasn't viewed the post before, add a new entry
//     //                 post.views.push({ user: userID, count: 1 });
//     //                 console.log('add first view')
//     //                 post.totalViews += 1;
//     //                 await post.save();
//     //             }
//     //         }
//     //     }
//     // }

//     // Find posts that the user has commented on
//     const userComments = await Comments.find({ user_id: userID }, '_id');

//     // Find posts the user hasn't seen or interacted with
//     const unseenPosts = await Posts.find({
//         $and: [
//             { '_id': { $nin: seenPosts.map(postId => new mongoose.mongo.ObjectId(postId.id ? postId.id : postId)) } },
//             { 'likes': { $nin: [userID] } },
//             { 'comments': { $nin: userComments } },
//             { 'saved': { $nin: [userID] } }
//         ]
//     })
//     .populate('author')
//     .sort({ createdAt: -1 })
//     // .populate('likes')
//     .populate({
//         path: 'comments',
//         options: { sort: { createdAt: -1 } }, // Sort comments from newest to oldest
//         populate: [
//             { path: 'user_id', model: 'Users' }, // Populate user details for each comment
//             // { path: 'likes', model: 'Users' } // Populate likes for each comment
//         ],
//         perDocumentLimit: 2 // Limit comments to 15 per post
//     });

//     // Enhance posts with a scoring system
//     unseenPosts.forEach(async (post) => {
//         const timeSinceCreation = Date.now() - post.createdAt.getTime();
        
//         // Set the time period for recency boost to disappear (24 hours)
//         const decayPeriod = 1000 * 60 * 60 * 24; // 24 hours in milliseconds
        
//         // Exponential decay function: recency boost fades quickly after 24 hours
//         const recencyBoost = Math.exp(-timeSinceCreation / decayPeriod);
    
//         // Calculate the popularity score with the recency boost
//         const popularityScore = 
//             (post.likesCount * 2) + 
//             (post.saves * 3) + 
//             (post.commentsCount * 1.5) + 
//             (post.totalViews * 1) + 
//             (recencyBoost * 100);  // Multiply by 100 to increase its influence
    
//         post.rankScore = popularityScore;
//         await post.save();
//     });

//     // Sort posts by rankScore and createdAt
//     unseenPosts.sort((a, b) => b.rankScore - a.rankScore || b.createdAt - a.createdAt);

//     // Limit the result to 4 posts
//     const limitedPosts = unseenPosts.slice(0, 4);

//     res.json(limitedPosts);
// };

// module.exports = FindPost;




const mongoose = require("mongoose");

const FindPost = (Posts, Comments) => async (req, res) => {
    const { userId, seenPosts } = req.body;
    const userID = new mongoose.mongo.ObjectId(userId);

    // Find posts that the user has commented on
    const userComments = await Comments.find({ user_id: userID }, '_id');

    // Find posts the user hasn't seen or interacted with
    const unseenPosts = await Posts.find({
        $and: [
            { '_id': { $nin: seenPosts.map(postId => new mongoose.mongo.ObjectId(postId.id ? postId.id : postId)) } },
            { 'likes': { $nin: [userID] } },
            { 'comments': { $nin: userComments } },
            { 'saved': { $nin: [userID] } }
        ]
    })
    .populate('author')
    .sort({ createdAt: -1 })
    .populate({
        path: 'comments',
        options: { sort: { createdAt: -1 } },
        populate: [
            { path: 'user_id', model: 'Users' },
        ],
        perDocumentLimit: 2
    });

    // Enhance posts with a scoring system and add the selected index
    const enhancedPosts = unseenPosts.map((post) => {
        const timeSinceCreation = Date.now() - post.createdAt.getTime();
        const decayPeriod = 1000 * 60 * 60 * 24; // 24 hours in milliseconds
        const recencyBoost = Math.exp(-timeSinceCreation / decayPeriod);
        const popularityScore = 
            (post.likesCount * 2) + 
            (post.saves * 3) + 
            (post.commentsCount * 1.5) + 
            (post.totalViews * 1) + 
            (recencyBoost * 100);

        post.rankScore = popularityScore;

        // Check if the current user has selected any image in the post
        let selectedIndex = -1;
        post.selectedImages.forEach((selectedImage) => {
            if (selectedImage.users.includes(userId)) {
                selectedIndex = selectedImage.imageIndex;
            }
        });

        // Clone the post object and add the selectedIndex to it
        const postWithSelectedIndex = post.toObject(); // Convert to plain JS object
        postWithSelectedIndex.selectedIndex = selectedIndex;

        return postWithSelectedIndex;
    });

    // Sort posts by rankScore and createdAt
    enhancedPosts.sort((a, b) => b.rankScore - a.rankScore || b.createdAt - a.createdAt);

    // Limit the result to 4 posts
    const limitedPosts = enhancedPosts.slice(0, 4);

    res.json(limitedPosts);
};

module.exports = FindPost;
