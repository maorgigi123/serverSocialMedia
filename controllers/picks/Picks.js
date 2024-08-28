const Posts = require('../../Schema/Posts'); // Adjust the path as necessary

const Picks = () => async (req, res) => {
    const { postId, indexImage, userId } = req.body;

    try {
        // Find the post by its ID
        const post = await Posts.findById(postId);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Validate the image index
        if (indexImage < 0 || indexImage >= post.post_imgs.length) {
            return res.status(400).json({ error: 'Invalid image index' });
        }

        // Find the selected image in the post
        let selectedImage = post.selectedImages.find(sel => sel.imageIndex === indexImage);
        let selectedIndex;

        if (selectedImage) {
            // If the user hasn't selected this image yet, add the user to the selected image
            if (!selectedImage.users.includes(userId)) {
                selectedImage.users.push(userId);
                post.totalSelections += 1; // Increment the total selections
                selectedIndex = indexImage; // Set the selected index
            }
            else {
                // If the user has already selected this image, return the existing selectedIndex
                selectedIndex = indexImage;
            }
        } else {
            // If the image hasn't been selected before, create a new entry
            post.selectedImages.push({
                imageIndex: indexImage,
                users: [userId]
            });
            post.totalSelections += 1; // Increment the total selections
            selectedIndex = indexImage; // Set the selected index
        }

        // Save the updated post to the database
        await post.save();

        // Return the full post along with the selected index
        res.status(200).json({  ...post.toObject(), selectedIndex });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = Picks;
