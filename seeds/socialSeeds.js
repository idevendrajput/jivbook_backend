const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Follow = require('../models/Follow');
const User = require('../models/User');

const seedPosts = async (users) => {
  const posts = [];
  
  const samplePosts = [
    {
      caption: "Look at my beautiful Golden Retriever! 🐕 #dog #pet #goldenretriever #love",
      media: [
        {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
          order: 0
        }
      ],
      tags: ['dog', 'pet', 'goldenretriever', 'love'],
      location: {
        name: 'Central Park, New York',
        coordinates: [-73.968285, 40.785091]
      }
    },
    {
      caption: "My cat is the most adorable thing ever! 😻 #cat #cute #kitten #pet",
      media: [
        {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
          order: 0
        }
      ],
      tags: ['cat', 'cute', 'kitten', 'pet']
    },
    {
      caption: "Training session with my German Shepherd 💪 #training #germanshepherd #dog #smart",
      media: [
        {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
          order: 0
        }
      ],
      tags: ['training', 'germanshepherd', 'dog', 'smart']
    },
    {
      caption: "Multiple photos of my pets! 📸 #pets #family #love",
      media: [
        {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
          order: 0
        },
        {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
          order: 1
        }
      ],
      tags: ['pets', 'family', 'love']
    },
    {
      caption: "Video of my parrot talking! 🦜 So smart!",
      media: [
        {
          type: 'video',
          url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
          thumbnail: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
          order: 0
        }
      ],
      tags: ['parrot', 'talking', 'smart', 'bird']
    },
    {
      caption: "Rabbit eating carrots 🥕 #rabbit #cute #carrots #bunny",
      media: [
        {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
          order: 0
        }
      ],
      tags: ['rabbit', 'cute', 'carrots', 'bunny']
    }
  ];
  
  // Create posts for random users
  for (let i = 0; i < samplePosts.length; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const postData = {
      ...samplePosts[i],
      user: randomUser._id
    };
    
    const post = new Post(postData);
    await post.save();
    posts.push(post);
    
    // Update user's post count
    await User.findByIdAndUpdate(randomUser._id, { $inc: { postsCount: 1 } });
  }
  
  return posts;
};

const seedComments = async (posts, users) => {
  const comments = [];
  
  const sampleComments = [
    "So adorable! 😍",
    "What a beautiful pet!",
    "Love this photo!",
    "Amazing! 👏",
    "Your pet is so cute!",
    "Great shot! 📸",
    "This made my day! 😊",
    "Beautiful creature!",
    "So precious! ❤️",
    "Absolutely stunning!"
  ];
  
  // Add comments to each post
  for (const post of posts) {
    const numComments = Math.floor(Math.random() * 5) + 1; // 1-5 comments per post
    
    for (let i = 0; i < numComments; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomComment = sampleComments[Math.floor(Math.random() * sampleComments.length)];
      
      const comment = new Comment({
        post: post._id,
        user: randomUser._id,
        text: randomComment
      });
      
      await comment.save();
      comments.push(comment);
      
      // Update post's comment count
      await Post.findByIdAndUpdate(post._id, { $inc: { commentsCount: 1 } });
    }
  }
  
  return comments;
};

const seedFollows = async (users) => {
  const follows = [];
  
  // Create follow relationships between users
  for (let i = 0; i < users.length; i++) {
    const follower = users[i];
    
    // Each user follows 2-4 other users
    const numFollowing = Math.floor(Math.random() * 3) + 2;
    const otherUsers = users.filter(u => u._id.toString() !== follower._id.toString());
    
    for (let j = 0; j < Math.min(numFollowing, otherUsers.length); j++) {
      const following = otherUsers[j];
      
      // Check if follow relationship already exists
      const existingFollow = await Follow.findOne({
        follower: follower._id,
        following: following._id
      });
      
      if (!existingFollow) {
        const follow = new Follow({
          follower: follower._id,
          following: following._id,
          status: 'accepted'
        });
        
        await follow.save();
        follows.push(follow);
        
        // Update counts
        await User.findByIdAndUpdate(follower._id, { $inc: { followingCount: 1 } });
        await User.findByIdAndUpdate(following._id, { $inc: { followersCount: 1 } });
      }
    }
  }
  
  return follows;
};

const seedLikes = async (posts, comments, users) => {
  let totalLikes = 0;
  
  // Add likes to posts
  for (const post of posts) {
    const numLikes = Math.floor(Math.random() * 10) + 1; // 1-10 likes per post
    const likedUsers = [];
    
    for (let i = 0; i < Math.min(numLikes, users.length); i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      
      if (!likedUsers.includes(randomUser._id.toString())) {
        post.addLike(randomUser._id);
        likedUsers.push(randomUser._id.toString());
        totalLikes++;
      }
    }
    
    await post.save();
  }
  
  // Add likes to comments
  for (const comment of comments) {
    const numLikes = Math.floor(Math.random() * 5) + 1; // 1-5 likes per comment
    const likedUsers = [];
    
    for (let i = 0; i < Math.min(numLikes, users.length); i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      
      if (!likedUsers.includes(randomUser._id.toString())) {
        comment.addLike(randomUser._id);
        likedUsers.push(randomUser._id.toString());
        totalLikes++;
      }
    }
    
    await comment.save();
  }
  
  return totalLikes;
};

module.exports = {
  seedPosts,
  seedComments,
  seedFollows,
  seedLikes
};
