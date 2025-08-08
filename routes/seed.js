const express = require('express');
const router = express.Router();
const { seedSliders } = require('../seeds/sliderSeeds');
const { seedPetCategories } = require('../seeds/petCategorySeeds');
const { seedBreeds } = require('../seeds/breedSeeds');
const { seedUsers } = require('../seeds/userSeeds');
const { seedPosts, seedComments, seedFollows, seedLikes } = require('../seeds/socialSeeds');
const { seedPets } = require('../seeds/petSeedsComplete');
const User = require('../models/User');
const PetCategory = require('../models/PetCategory');
const Breed = require('../models/Breed');
const Slider = require('../models/Slider');
const Pet = require('../models/Pet');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Follow = require('../models/Follow');

// Endpoint to clear all data and indexes
router.post('/seed/clear', async (req, res) => {
    try {
        // Drop entire collections to remove all data and indexes
        await User.collection.drop().catch(() => console.log('User collection doesn\'t exist'));
        await PetCategory.collection.drop().catch(() => console.log('PetCategory collection doesn\'t exist'));
        await Breed.collection.drop().catch(() => console.log('Breed collection doesn\'t exist'));
        await Slider.collection.drop().catch(() => console.log('Slider collection doesn\'t exist'));
        await Post.collection.drop().catch(() => console.log('Post collection doesn\'t exist'));
        await Comment.collection.drop().catch(() => console.log('Comment collection doesn\'t exist'));
        await Follow.collection.drop().catch(() => console.log('Follow collection doesn\'t exist'));
        
        console.log('All collections dropped - indexes will be recreated automatically on next insert');
        
        res.status(200).json({
            success: true,
            message: 'Database cleared successfully! All data and indexes removed.'
        });
    } catch (error) {
        console.error('Clearing failed:', error);
        res.status(500).json({
            success: false,
            message: 'Database clearing failed',
            error: error.message
        });
    }
});

// Endpoint to trigger database seeding
router.post('/seed/database', async (req, res) => {
    try {
        // Drop entire collections to remove all data and indexes
        await User.collection.drop().catch(() => console.log('User collection doesn\'t exist'));
        await PetCategory.collection.drop().catch(() => console.log('PetCategory collection doesn\'t exist'));
        await Breed.collection.drop().catch(() => console.log('Breed collection doesn\'t exist'));
        await Slider.collection.drop().catch(() => console.log('Slider collection doesn\'t exist'));
        await Pet.collection.drop().catch(() => console.log('Pet collection doesn\'t exist'));
        await Post.collection.drop().catch(() => console.log('Post collection doesn\'t exist'));
        await Comment.collection.drop().catch(() => console.log('Comment collection doesn\'t exist'));
        await Follow.collection.drop().catch(() => console.log('Follow collection doesn\'t exist'));
        
        console.log('All collections dropped - indexes will be recreated on first insert');
        
        // Seed data
        const categories = await seedPetCategories();
        const breeds = await seedBreeds(categories);
        const users = await seedUsers();
        const sliders = await seedSliders();
        const pets = await seedPets();
        
        // Seed social media data
        const posts = await seedPosts(users);
        const comments = await seedComments(posts, users);
        const follows = await seedFollows(users);
        const totalLikes = await seedLikes(posts, comments, users);

        res.status(200).json({
            success: true,
            message: 'Database seeded successfully with pets and social media data!',
            data: {
                categoriesSeeded: categories.length,
                breedsSeeded: breeds.length,
                usersSeeded: users.length,
                slidersSeeded: sliders.length,
                petsSeeded: pets.length,
                postsSeeded: posts.length,
                commentsSeeded: comments.length,
                followsSeeded: follows.length,
                likesSeeded: totalLikes
            }
        });
    } catch (error) {
        console.error('Seeding failed:', error);
        res.status(500).json({
            success: false,
            message: 'Database seeding failed',
            error: error.message
        });
    }
});

module.exports = router;

